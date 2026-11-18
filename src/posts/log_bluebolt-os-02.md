---
title: "從零做一個作業系統，以 Rust 為例：#2 自己畫畫面、自己做字型"
slug: bluebolt-os-02
date: "2026-11-17"
time: "23:30"
category: workshop
excerpt: "螢幕其實就是一大塊記憶體。跟 UEFI 要到畫面緩衝區，一個像素一個像素畫出 BlueBolt 的開機畫面，用 8×8 點陣字型做出自己的 kprintln!，再把 log 送到序列埠、寫自己的 panic handler — Vol. 945 的直播講義。"
tags: ["Rust", "作業系統", "OSDev", "UEFI", "QEMU", "BlueBolt OS", "Workshop", "教學"]
series: bluebolt-os
ep: 2
stack: ["Rust", "uefi crate", "font8x8", "spin", "QEMU"]
streams: [945]
links:
  - label: "uefi crate 文件：GraphicsOutput"
    url: "https://docs.rs/uefi/0.41.0/uefi/proto/console/gop/struct.GraphicsOutput.html"
  - label: "font8x8 crate"
    url: "https://docs.rs/font8x8"
  - label: "OSDev Wiki：Serial Ports"
    url: "https://wiki.osdev.org/Serial_Ports"
meta:
  status: "PUBLISHED"
  phase: "v1.0"
---

這份講義整理 Vol. 945 直播的內容，是 BlueBolt OS 系列的第二堂。

[第一堂](/log/bluebolt-os-01)的字是 UEFI 幫我們畫的。這一堂要把畫面拿回來自己管：**拿到畫面的記憶體，一個像素一個像素畫出 BlueBolt 的開機畫面，再自己把字畫上去。** 順便把 log 送到序列埠，之後當機也看得到訊息。

> 講義裡的程式碼都在 Rust 1.99、`uefi` 0.41、`font8x8` 0.3、`spin` 0.12、QEMU 11.1 上實際跑過，最後的截圖就是直播時寫的那份程式碼。

整場分成八個部分：

1. **畫面緩衝區**：螢幕其實就是一大塊記憶體
2. **GOP**：跟 UEFI 要畫面
3. **畫方塊**：BlueBolt 的藍白黃黑開機畫面
4. **點陣字型**：一個字就是 8×8 個點
5. **自己的 console**：`kprintln!`、換行、捲動
6. **序列埠**：把 log 送到 PowerShell 視窗
7. **自己的 panic handler**
8. **直播時遇到的問題**與延伸演練

開始前，專案應該是第一堂結束的樣子：`cargo build` 會成功，`run.ps1` 開得了機。

## 一、畫面緩衝區

螢幕上每一個點叫一個**像素（pixel）**。1280×800 的畫面就有 1,024,000 個像素。

顯示卡會一直讀一塊記憶體，照裡面的數字決定每個像素的顏色，這塊記憶體叫**畫面緩衝區（framebuffer）**。所以**想在畫面上畫東西，就是往這塊記憶體寫數字**。

每個像素用 4 個 byte 存，藍、綠、紅各一個 byte（0～255），第四個 byte 不用：

```
記憶體：  [藍][綠][紅][--] [藍][綠][紅][--] [藍][綠][紅][--] ...
畫面：    第 (0,0) 個像素  第 (1,0) 個像素  第 (2,0) 個像素
```

如果把 4 個 byte 當成一個 `u32` 來看（x86 是 little-endian：數字的低位 byte 放在記憶體的前面），剛好就是網頁常見的 `0xRRGGBB`：

| 顏色 | `u32` |
| --- | --- |
| BlueBolt 藍 | `0x183DD6` |
| 訊號黃 | `0xFFD21F` |
| 墨黑 | `0x0B0F1A` |
| 白 | `0xFFFFFF` |

這幾個顏色和 bluebolt-ui 的 HUD 一樣。

### 第 (x, y) 個像素在哪裡

畫面是一列一列存的。第 y 列第 x 個像素的位置是：

```
位置 = y × stride + x
```

**stride** 是「一列實際佔幾個像素」，通常等於畫面寬度，但有些顯示卡會在每列後面多留一點空間，所以不能直接用寬度算。

## 二、GOP：跟 UEFI 要畫面

UEFI 提供一個 **GOP（Graphics Output Protocol）**，可以問它解析度、像素格式，以及畫面緩衝區在記憶體的哪裡。

> UEFI 把每一種功能叫一個 **protocol**：文字輸出是一個、鍵盤輸入是一個、GOP 也是一個。要用的時候「打開」它。

先加兩個 crate：

```powershell
cargo add font8x8 --no-default-features --features unicode
cargo add spin
```

- `font8x8`：現成的 8×8 點陣字型資料，第四節用。
- `spin`：沒有作業系統時用的「鎖」，第五節用。

## 三、畫方塊

### framebuffer.rs

建 `src\framebuffer.rs`：

```rust
use core::ptr;

pub const BLUE: u32 = 0x183DD6;
pub const BLUE_SHADE: u32 = 0x1133B1;
pub const YELLOW: u32 = 0xFFD21F;
pub const BLACK: u32 = 0x0B0F1A;
pub const WHITE: u32 = 0xFFFFFF;

/// 任何「可以畫點」的東西：真的畫面，或之後遊戲用的暫存畫面
pub trait Surface {
    fn width(&self) -> usize;
    fn height(&self) -> usize;
    fn put_pixel(&mut self, x: usize, y: usize, color: u32);

    fn fill_rect(&mut self, x: usize, y: usize, w: usize, h: usize, color: u32) {
        let x_end = (x + w).min(self.width());
        let y_end = (y + h).min(self.height());
        for yy in y..y_end {
            for xx in x..x_end {
                self.put_pixel(xx, yy, color);
            }
        }
    }
}

pub struct Framebuffer {
    base: *mut u32,
    width: usize,
    height: usize,
    stride: usize,
    rgb: bool,
}

// 裸指標預設不能在執行緒之間傳遞；畫面緩衝區只有一塊，我們自己保證不亂用
unsafe impl Send for Framebuffer {}

impl Framebuffer {
    /// base 必須指向真正的畫面緩衝區，大小至少 stride × height 個像素
    pub unsafe fn new(base: *mut u32, width: usize, height: usize, stride: usize, rgb: bool) -> Self {
        Framebuffer { base, width, height, stride, rgb }
    }

    fn convert(&self, color: u32) -> u32 {
        if self.rgb {
            // 記憶體順序是 紅綠藍，把紅和藍對調
            ((color & 0xFF) << 16) | (color & 0xFF00) | ((color >> 16) & 0xFF)
        } else {
            color
        }
    }

    /// 把第 src_y 列開始的 rows 列，整段搬到第 dst_y 列（捲動用）
    pub fn copy_rows(&mut self, src_y: usize, dst_y: usize, rows: usize) {
        unsafe {
            ptr::copy(
                self.base.add(src_y * self.stride),
                self.base.add(dst_y * self.stride),
                rows * self.stride,
            );
        }
    }
}

impl Surface for Framebuffer {
    fn width(&self) -> usize { self.width }
    fn height(&self) -> usize { self.height }

    fn put_pixel(&mut self, x: usize, y: usize, color: u32) {
        if x >= self.width || y >= self.height {
            return;
        }
        let color = self.convert(color);
        unsafe { ptr::write_volatile(self.base.add(y * self.stride + x), color) };
    }
}
```

幾個重點：

- **`trait Surface`**：先把「畫點」抽成 trait，`fill_rect` 寫一次就好。之後做遊戲時，暫存畫面也實作它，就能共用所有畫圖函式。
- **`*mut u32`**：裸指標，Rust 不檢查它指向哪裡，所以用它的地方都要包在 `unsafe` 裡。`unsafe` 的意思不是「危險」，是「這裡的正確性由我負責，編譯器不檢查」。
- **`write_volatile`**：告訴編譯器「這個寫入一定要真的做」。一般寫入如果之後沒人讀，編譯器可能直接省略，但畫面緩衝區是給顯示卡讀的，編譯器不知道。
- **`rgb`**：大部分的韌體是「藍綠紅」順序（BGR），少數是「紅綠藍」（RGB）。遇到 RGB 就把紅和藍對調。

### 在 main.rs 拿到畫面

```rust
#![no_std]
#![no_main]

mod framebuffer;

use framebuffer::{Framebuffer, Surface, BLACK, BLUE, YELLOW};
use uefi::boot;
use uefi::prelude::*;
use uefi::proto::console::gop::{GraphicsOutput, PixelFormat};

fn init_graphics() -> Framebuffer {
    let handle = boot::get_handle_for_protocol::<GraphicsOutput>().unwrap();
    let mut gop = boot::open_protocol_exclusive::<GraphicsOutput>(handle).unwrap();

    let info = gop.current_mode_info();
    let (width, height) = info.resolution();
    let stride = info.stride();
    let rgb = match info.pixel_format() {
        PixelFormat::Bgr => false,
        PixelFormat::Rgb => true,
        other => panic!("unsupported pixel format: {:?}", other),
    };
    let base = gop.frame_buffer().as_mut_ptr() as *mut u32;

    // 不把 GOP 還給 UEFI：畫面從此歸我們管
    core::mem::forget(gop);

    unsafe { Framebuffer::new(base, width, height, stride, rgb) }
}

#[entry]
fn main() -> Status {
    uefi::helpers::init().unwrap();

    let mut fb = init_graphics();
    fb.fill_rect(0, 0, fb.width(), fb.height(), BLACK);
    fb.fill_rect(0, 24, fb.width(), 64, BLUE);
    fb.fill_rect(0, 88, fb.width(), 6, YELLOW);

    loop {}
}
```

- `get_handle_for_protocol`：找「有提供 GOP 的那個裝置」。
- `open_protocol_exclusive`：**獨占**打開。獨占的意思是：原本在用 GOP 的驅動會被請走，其中包括 UEFI 自己畫文字的那個。所以在 QEMU 的韌體上，從這裡開始 `uefi::println!` 就看不到字了，要等第五節做好自己的 console。（UEFI 規格沒有保證每一家韌體都這樣，換到真的電腦上不一定一樣。）
- `core::mem::forget(gop)`：Rust 的變數離開範圍時會自動「還回去」（這裡是關掉 protocol）。`forget` 是「這個東西我永遠不還」。第三堂我們會叫 UEFI 下班，到時候已經沒有人可以還了。

跑 `run.ps1`：黑底、一條藍色橫帶、下面一條黃線。

**演練**：在藍帶左邊畫一個斜的黃色標籤（HUD 風格）。提示：斜的形狀就是每一列往右偏一點：

```rust
for row in 0..64 {
    fb.fill_rect(16 + (64 - row) / 2, 24 + row, 40, 1, YELLOW);
}
```

## 四、點陣字型

字也是一堆點。8×8 的字型裡，每個字是 8 列，每列一個 byte，**第 0 個 bit 是最左邊的點**。例如 `A`：

```
0x0C  ..##....        (0x0C 的二進位是 00001100；bit 0 在左邊，所以要從右往左讀)
0x1E  .####...
0x33  ##..##..
0x33  ##..##..
0x3F  ######..
0x33  ##..##..
0x33  ##..##..
0x00  ........
```

8×8 在 1280×800 的畫面上太小了，所以畫的時候每個點放大成 `scale × scale` 的小方塊。

建 `src\font.rs`：

```rust
use crate::framebuffer::Surface;
use font8x8::UnicodeFonts;

pub const GLYPH_SIZE: usize = 8;

pub fn draw_char(s: &mut impl Surface, x: usize, y: usize, c: char, scale: usize, fg: u32, bg: Option<u32>) {
    let glyph = font8x8::BASIC_FONTS
        .get(c)
        .or_else(|| font8x8::BASIC_FONTS.get('?'))
        .unwrap();

    for (row, bits) in glyph.iter().enumerate() {
        for col in 0..GLYPH_SIZE {
            let on = bits & (1 << col) != 0;
            let color = if on { Some(fg) } else { bg };
            if let Some(color) = color {
                s.fill_rect(x + col * scale, y + row * scale, scale, scale, color);
            }
        }
    }
}

pub fn draw_str(s: &mut impl Surface, x: usize, y: usize, text: &str, scale: usize, fg: u32, bg: Option<u32>) {
    for (i, c) in text.chars().enumerate() {
        draw_char(s, x + i * GLYPH_SIZE * scale, y, c, scale, fg, bg);
    }
}
```

- **glyph（字形）**：一個字「長什麼樣子」的圖。字元 `'A'` 只是一個編號，它的 glyph 才是上面那 8 個 byte 畫出來的點陣。同一個字元換一套字型，glyph 就不一樣。
- `BASIC_FONTS` 只有英文、數字和符號。沒有的字（例如中文）就畫 `?`。
- `bg` 是 `Option`：`None` 代表背景透明，只畫字的部分。

`main.rs` 加上 `mod font;`，在藍帶上寫標題：

```rust
font::draw_str(&mut fb, 80, 40, "BLUEBOLT OS", 4, framebuffer::WHITE, None);
```

> 中文要怎麼辦？中文字型一個字至少 16×16，常用字就有幾千個，第一版先只用英文。之後想挑戰，可以把需要的字預先轉成點陣資料放進程式。

## 五、自己的 console

現在要做自己的 `println!`，叫 **`kprintln!`**（k = kernel，核心）。它要記得「游標在第幾行第幾個字」，遇到換行就往下，寫到最底就整個畫面往上捲。

建 `src\console.rs`：

```rust
use crate::font::{self, GLYPH_SIZE};
use crate::framebuffer::{self, Framebuffer, Surface};
use core::fmt;
use spin::Mutex;

const SCALE: usize = 2;
const CELL: usize = GLYPH_SIZE * SCALE;
const MARGIN: usize = 16;
const TOP: usize = 110;

pub struct Console {
    fb: Framebuffer,
    cols: usize,
    rows: usize,
    col: usize,
    row: usize,
    pub fg: u32,
    pub bg: u32,
}

impl Console {
    pub fn new(fb: Framebuffer) -> Self {
        let cols = (fb.width() - MARGIN * 2) / CELL;
        let rows = (fb.height() - TOP - MARGIN) / CELL;
        let mut console = Console { fb, cols, rows, col: 0, row: 0, fg: framebuffer::WHITE, bg: framebuffer::BLACK };
        console.reset();
        console
    }

    pub fn framebuffer(&mut self) -> &mut Framebuffer {
        &mut self.fb
    }

    /// 畫開機畫面、清空文字區
    pub fn reset(&mut self) {
        let (w, h) = (self.fb.width(), self.fb.height());
        self.fb.fill_rect(0, 0, w, h, framebuffer::BLACK);
        self.fb.fill_rect(0, 24, w, 64, framebuffer::BLUE);
        self.fb.fill_rect(0, 88, w, 6, framebuffer::YELLOW);
        for row in 0..64 {
            self.fb.fill_rect(16 + (64 - row) / 2, 24 + row, 40, 1, framebuffer::YELLOW);
        }
        font::draw_str(&mut self.fb, 80, 40, "BLUEBOLT OS", 4, framebuffer::WHITE, None);
        self.col = 0;
        self.row = 0;
    }

    fn cell_pos(&self) -> (usize, usize) {
        (MARGIN + self.col * CELL, TOP + self.row * CELL)
    }

    fn newline(&mut self) {
        self.col = 0;
        if self.row + 1 < self.rows {
            self.row += 1;
        } else {
            self.scroll();
        }
    }

    fn scroll(&mut self) {
        // 文字區整個往上搬一行，再把最後一行塗掉
        self.fb.copy_rows(TOP + CELL, TOP, (self.rows - 1) * CELL);
        let w = self.fb.width();
        self.fb.fill_rect(0, TOP + (self.rows - 1) * CELL, w, CELL, self.bg);
    }

    pub fn put_char(&mut self, c: char) {
        match c {
            '\n' => self.newline(),
            c => {
                if self.col >= self.cols {
                    self.newline();
                }
                let (x, y) = self.cell_pos();
                font::draw_char(&mut self.fb, x, y, c, SCALE, self.fg, Some(self.bg));
                self.col += 1;
            }
        }
    }
}

impl fmt::Write for Console {
    fn write_str(&mut self, s: &str) -> fmt::Result {
        for c in s.chars() {
            self.put_char(c);
        }
        Ok(())
    }
}

pub static CONSOLE: Mutex<Option<Console>> = Mutex::new(None);

pub fn init(fb: Framebuffer) {
    *CONSOLE.lock() = Some(Console::new(fb));
}

pub fn _print(args: fmt::Arguments) {
    use core::fmt::Write;
    if let Some(console) = CONSOLE.lock().as_mut() {
        console.write_fmt(args).unwrap();
    }
}

#[macro_export]
macro_rules! kprint {
    ($($arg:tt)*) => ($crate::console::_print(format_args!($($arg)*)));
}

#[macro_export]
macro_rules! kprintln {
    () => ($crate::kprint!("\n"));
    ($($arg:tt)*) => ($crate::kprint!("{}\n", format_args!($($arg)*)));
}
```

這段比較長，拆開看：

- **`impl fmt::Write`**：只要實作 `write_str`，就能用 `write!`、`format_args!` 這些格式化功能，`{}`、`{:x}` 全部免費得到。這些都在 core 裡，不需要作業系統。
- **`static CONSOLE`**：console 只有一個，全程式都要能用，所以放成全域變數。
- **`Mutex`**：全域變數可能同時被兩個地方改（第三堂的中斷就會），所以用鎖保護：`lock()` 拿到鎖才能改，用完自動放開。`spin::Mutex` 拿不到鎖時就原地一直等（spin），因為沒有作業系統可以幫忙「睡一下」。
- **`Option`**：一開始還沒拿到畫面，所以是 `None`，`init` 之後才有。
- **`macro_rules!`**：仿照標準函式庫的 `println!` 寫法，`format_args!` 把 `"x = {}", x` 這種參數打包起來交給 `_print`。

`main.rs` 最上面的 `mod` 改成這樣（順序有關係：macro 要先宣告，後面的模組才用得到）：

```rust
mod framebuffer;
mod font;
#[macro_use]
mod console;
```

`main` 改成：

```rust
#[entry]
fn main() -> Status {
    uefi::helpers::init().unwrap();

    let fb = init_graphics();
    console::init(fb);

    kprintln!("BlueBolt OS is booting...");
    kprintln!("Version {}", env!("CARGO_PKG_VERSION"));
    for i in 1..=60 {
        kprintln!("line {}", i);
    }

    loop {}
}
```

印 60 行是為了測試捲動。編譯、跑起來，畫面上的字超過最後一行時會整個往上捲。

![自己畫的 BlueBolt 開機畫面：藍色橫帶、斜的黃色標籤、BLUEBOLT OS 標題，下面是捲到 line 60 的文字](/images/posts/logs/bluebolt-os-02/02-boot.webp)

上面那一條藍帶和標題是 `reset` 畫的，捲動只搬文字區，所以標題不會跟著捲走。

## 六、序列埠

**序列埠（serial port）** 是很老的接頭，一次送一個 byte。現在的電腦幾乎沒有了，但做作業系統很好用：它非常簡單，幾行程式就能送出文字。QEMU 的 `-serial stdio` 會把它接到 PowerShell 視窗，**畫面壞掉也看得到 log**。

### I/O port

x86 的 CPU 除了記憶體，還有另一組位址叫 **I/O port**，用 `in`、`out` 兩個指令讀寫。第一個序列埠（COM1）在 port `0x3F8`。

Rust 沒有 `in`、`out` 這種語法，所以用 `asm!` 直接寫組合語言。建 `src\serial.rs`：

```rust
use core::arch::asm;
use core::fmt;
use spin::Mutex;

const COM1: u16 = 0x3F8;

pub unsafe fn outb(port: u16, value: u8) {
    unsafe { asm!("out dx, al", in("dx") port, in("al") value, options(nomem, nostack, preserves_flags)) };
}

pub unsafe fn inb(port: u16) -> u8 {
    let value: u8;
    unsafe { asm!("in al, dx", out("al") value, in("dx") port, options(nomem, nostack, preserves_flags)) };
    value
}

pub struct Serial;

impl Serial {
    pub fn init(&mut self) {
        unsafe {
            outb(COM1 + 1, 0x00); // 關掉序列埠的中斷
            outb(COM1 + 3, 0x80); // 接下來要設定速度
            outb(COM1 + 0, 0x03); // 速度 = 115200 / 3 = 38400 bps
            outb(COM1 + 1, 0x00);
            outb(COM1 + 3, 0x03); // 8 個 bit、沒有同位元、1 個停止位元
            outb(COM1 + 2, 0xC7); // 打開緩衝區（FIFO）
        }
    }

    fn write_byte(&mut self, byte: u8) {
        unsafe {
            // 第 5 個 bit = 1 代表可以送下一個 byte
            while inb(COM1 + 5) & 0x20 == 0 {}
            outb(COM1, byte);
        }
    }
}

impl fmt::Write for Serial {
    fn write_str(&mut self, s: &str) -> fmt::Result {
        for byte in s.bytes() {
            if byte == b'\n' {
                self.write_byte(b'\r');
            }
            self.write_byte(byte);
        }
        Ok(())
    }
}

pub static SERIAL: Mutex<Serial> = Mutex::new(Serial);

pub fn _print(args: fmt::Arguments) {
    use core::fmt::Write;
    SERIAL.lock().write_fmt(args).unwrap();
}

#[macro_export]
macro_rules! serial_println {
    () => ($crate::serial::_print(format_args!("\n")));
    ($($arg:tt)*) => ($crate::serial::_print(format_args!("{}\n", format_args!($($arg)*))));
}
```

- `asm!("out dx, al", ...)`：`dx` 放 port 編號、`al` 放要送的 byte。`in("dx") port` 是「把 `port` 放進 `dx`」。
- 換行前多送一個 `\r`（回到行首），終端機才不會變成階梯狀。

`main.rs` 最上面的 `mod` 加上 `serial`，放在最前面（`console` 會用到它，macro 也要先宣告）：

```rust
#[macro_use]
mod serial;
mod framebuffer;
mod font;
#[macro_use]
mod console;
```

`console.rs` 的 `_print` 最後加一行，畫面印什麼，序列埠也印一份：

```rust
pub fn _print(args: fmt::Arguments) {
    use core::fmt::Write;
    if let Some(console) = CONSOLE.lock().as_mut() {
        console.write_fmt(args).unwrap();
    }
    crate::serial::_print(args);
}
```

`main` 裡、`console::init` 之前加：

```rust
serial::SERIAL.lock().init();
serial_println!("[serial] hello from BlueBolt OS");
```

現在 `kprintln!` 會同時印到畫面和 PowerShell 視窗。

## 七、自己的 panic handler

現在 panic 時是 `uefi` crate 印訊息，但它是用 UEFI 的文字輸出印的，我們已經把畫面拿走了，所以看不到。自己寫一個。

1. `Cargo.toml` 把 `uefi` 的 features 拿掉（`panic_handler`、`logger` 都不要了）：

   ```toml
   uefi = "0.41.0"
   ```

2. `main.rs` 加上：

   ```rust
   #[panic_handler]
   fn panic(info: &core::panic::PanicInfo) -> ! {
       serial_println!("\n!!! PANIC: {}", info);
       if let Some(mut guard) = console::CONSOLE.try_lock() {
           if let Some(console) = guard.as_mut() {
               use core::fmt::Write;
               console.fg = framebuffer::YELLOW;
               let _ = write!(console, "\n!!! PANIC: {}\n", info);
           }
       }
       loop {}
   }
   ```

- 回傳型態 `-> !` 念作 never：這個函式永遠不會回來。
- 用 `try_lock` 而不是 `lock`：如果是在印字印到一半時 panic，鎖還在自己手上，`lock()` 會永遠等下去。`try_lock` 拿不到就算了，至少序列埠那邊印得出來。
- 序列埠那邊的 `serial_println!` 還是用 `lock()`：如果 panic 剛好發生在序列埠印字的途中，這裡一樣會卡住。機率很低，先這樣；想更保險，可以替序列埠也做一個用 `try_lock` 的版本。

**演練**：在 `main` 裡故意 `None::<u32>.unwrap();`，看黃色的 panic 訊息和 PowerShell 視窗的 log。

## 八、直播時遇到的問題

### `error[E0583]: file not found for module serial`

直播用的講義原本在第五節就讓 `console.rs` 呼叫 `crate::serial::_print`、在 `main.rs` 寫 `mod serial;`，但 `serial.rs` 要到第六節才建，所以一編譯就是：

```
error[E0583]: file not found for module `serial`
```

`mod serial;` 的意思是「去找 `src\serial.rs`（或 `src\serial\mod.rs`）當作一個模組」，檔案不存在就是 E0583。解法有兩個：先把那兩行拿掉，等第六節再加回來；或是直接做第六節，把 `serial.rs` 建出來。

這份網站版已經改成每一節做完都能編譯：第五節只印到畫面，序列埠的部分全部放在第六節。

### little-endian 是什麼？

直播時講義把 little-endian 寫成了中國大陸的譯名，台灣比較常直接用英文 **little-endian**。意思是：一個好幾個 byte 的數字，**低位的 byte 放在記憶體的前面**。

例如 `0x183DD6`（BlueBolt 藍）當成 `u32` 是 `0x00183DD6`，在記憶體裡是：

```
位址：  +0    +1    +2    +3
內容：  D6    3D    18    00
       (藍)  (綠)  (紅)  (不用)
```

剛好就是畫面緩衝區要的「藍綠紅」順序，所以寫顏色時可以直接用網頁習慣的 `0xRRGGBB`。

### glyph 是什麼？怎麼念？

**glyph** 念起來像「葛利夫」（/ɡlɪf/，一個音節）。它是一個字「長什麼樣子」的圖：`'A'` 只是一個編號，同一個 `'A'` 在不同字型裡的 glyph 不一樣。第四節的 `font8x8::BASIC_FONTS.get(c)` 拿到的那 8 個 byte，就是 `c` 的 glyph。

## 九、延伸

- **故意 panic**：在 `main` 裡加一行 `None::<u32>.unwrap();`，畫面會出現黃色的 `!!! PANIC: panicked at src\main.rs:...`，PowerShell 視窗也有一份。看完記得刪掉。
- **換解析度**：GOP 可以列出所有支援的解析度並切換。查 `gop.modes()` 和 `gop.set_mode()`，換成 1280×720 看看。
- **顏色**：`console.fg` 是公開的，做一個 `kprintln_color!` 印彩色的字。
- **為什麼畫面有點慢？** 每畫一個點都是一次函式呼叫加一次 volatile 寫入。之後做遊戲時，會改成先畫在一般記憶體，再整塊複製過去。

## 小複習

1. 畫面就是一塊記憶體（framebuffer）。第 (x, y) 個像素在 `y × stride + x`，stride 不一定等於寬度。
2. 跟 UEFI 的 GOP 要畫面緩衝區的位址、解析度、像素格式；獨占打開之後 UEFI 就不會再畫字了。
3. 往畫面寫要用 `write_volatile`，不然編譯器可能把「沒人讀」的寫入省略。
4. 8×8 點陣字型每列一個 byte，一個字就是 8 個 byte；放大就是把每個點畫成小方塊。
5. 實作 `fmt::Write` 就能免費得到 `{}` 格式化；全域的 console 用 `spin::Mutex` 保護。
6. 序列埠用 I/O port（`in`／`out` 指令），Rust 用 `asm!` 寫；QEMU 的 `-serial stdio` 把它接到 PowerShell 視窗。
7. 自己的 panic handler 用 `try_lock`，避免在印字印到一半時 panic 卡死。

## 下一堂預告：叫 UEFI 下班，接管整台電腦

現在雖然自己畫畫面了，但我們還是住在 UEFI 家裡：記憶體、計時器、鍵盤都還是它在管。下一堂要叫 UEFI 下班（`exit_boot_services`），自己設定中斷，讓鍵盤打得出字。
