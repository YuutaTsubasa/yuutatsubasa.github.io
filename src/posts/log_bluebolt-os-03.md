---
title: "從零做一個作業系統，以 Rust 為例：#3 接管電腦、中斷與鍵盤"
slug: bluebolt-os-03
date: "2026-11-24"
time: "23:30"
category: workshop
excerpt: "叫 UEFI 下班，整台電腦從此歸自己管。建中斷表 IDT、接住 breakpoint 和 double fault，設定 PIC 和 PIT 計時器，最後讓鍵盤打得出字，順便看一個鎖與中斷的死結陷阱 — Vol. 947 的直播講義。"
tags: ["Rust", "作業系統", "OSDev", "UEFI", "QEMU", "BlueBolt OS", "Workshop", "教學"]
series: bluebolt-os
ep: 3
stack: ["Rust nightly", "x86_64 crate", "pic8259", "pc-keyboard", "QEMU"]
streams: [947]
links:
  - label: "x86_64 crate 文件：InterruptDescriptorTable"
    url: "https://docs.rs/x86_64/0.15.5/x86_64/structures/idt/struct.InterruptDescriptorTable.html"
  - label: "pc-keyboard crate"
    url: "https://docs.rs/pc-keyboard/0.9.0/pc_keyboard/"
  - label: "OSDev Wiki：8259 PIC"
    url: "https://wiki.osdev.org/8259_PIC"
  - label: "OSDev Wiki：8042 PS/2 Controller"
    url: "https://wiki.osdev.org/I8042_PS/2_Controller"
meta:
  status: "PUBLISHED"
  phase: "v1.0"
---

這份講義整理 Vol. 947 直播的內容，是 BlueBolt OS 系列的第三堂。

到[第二堂](/log/bluebolt-os-02)為止，UEFI 一直在背後幫我們：管記憶體、管計時器、讀鍵盤。這一堂要**叫 UEFI 下班，整台電腦從此歸 BlueBolt OS 管**。下班之後就沒有人幫我們讀鍵盤了，所以要學 CPU 最重要的機制之一：**中斷**。

> 講義裡的程式碼都在 Rust nightly 1.102、`uefi` 0.41、`x86_64` 0.15、`pic8259` 0.11、`pc-keyboard` 0.9、QEMU 11.1 上實際跑過，鍵盤那張截圖就是直播時寫的那份程式碼。

整場分成九個部分（零是準備工作）：

0. **換成 nightly**、加 crate
1. **離開 boot services**：正式接管
2. **中斷是什麼**：CPU 被「叫一下」
3. **IDT**：中斷發生時要跑哪個函式
4. **例外**：breakpoint 與 double fault
5. **硬體中斷**：PIC、計時器
6. **鍵盤**：按一個鍵，畫面出現一個字
7. **鎖與中斷**：一個會讓電腦卡死的陷阱
8. **直播時遇到的問題**與延伸演練

## 零、換成 nightly

這一堂會用到 Rust 還沒正式推出的功能（`x86-interrupt` 呼叫約定）。在專案根目錄建 `rust-toolchain.toml`：

```toml
[toolchain]
channel = "nightly"
targets = ["x86_64-unknown-uefi"]
```

之後在這個資料夾裡 `cargo` 會自動用 nightly，第一次會自動下載。

加三個 crate：

```powershell
cargo add x86_64
cargo add pic8259
cargo add pc-keyboard
```

| crate | 做什麼 |
| --- | --- |
| `x86_64` | x86 CPU 的各種結構與指令：中斷表、I/O port、`hlt`…… |
| `pic8259` | 設定中斷控制器 PIC（Programmable Interrupt Controller，第五節細講） |
| `pc-keyboard` | 把鍵盤送來的數字翻成「按了哪個鍵」 |

`main.rs` 最上面加：

```rust
#![feature(abi_x86_interrupt)]
```

## 一、離開 boot services

UEFI 的功能分兩種：

- **boot services**：開機時用的，管記憶體、計時器、各種裝置。
- **runtime services**：作業系統跑起來之後還能用的，例如讀時鐘、關機。

作業系統準備好之後，要呼叫 **`exit_boot_services`** 告訴 UEFI：「謝謝，我接手了。」呼叫之後：

- UEFI 的計時器、鍵盤驅動、記憶體管理全部停止。
- `uefi::println!`、`boot::` 開頭的函式**都不能再用**，呼叫了會當機。
- 畫面緩衝區還在（我們在[第二堂](/log/bluebolt-os-02)已經拿到位址了）。
- UEFI 會交給我們一份**記憶體地圖**：哪些記憶體可以用、哪些不能碰，第四堂用。

`main` 改成：

```rust
#[entry]
fn main() -> Status {
    uefi::helpers::init().unwrap();
    serial::SERIAL.lock().init();

    let fb = init_graphics();
    console::init(fb);
    kprintln!("BlueBolt OS is booting...");

    let memory_map = unsafe { boot::exit_boot_services(None) };
    x86_64::instructions::interrupts::disable();
    kprintln!("Boot services: bye! The machine is ours now.");

    let _ = memory_map;
    loop {}
}
```

- `exit_boot_services` 是 `unsafe`：呼叫之後還用 boot services 是我們的錯，編譯器管不到。
- 參數 `None` 是「記憶體地圖用預設的記憶體類型存」。如果編譯錯誤說參數不對，看一下你的 `uefi` 版本的文件，舊版是傳 `MemoryType::LOADER_DATA`。
- 緊接著 `interrupts::disable()`：中斷表還是 UEFI 的，在我們準備好自己的之前，先不要讓任何中斷進來。
- `let _ = memory_map;`：`exit_boot_services` 回傳的是**記憶體地圖**（哪幾段記憶體可以用），這一堂還用不到，第四堂做記憶體管理時才會用。變數宣告了卻沒用，Rust 會警告 `unused variable`；這一行什麼事都不做，只是讓警告消失。變數改名成 `_memory_map` 效果一樣。

跑起來應該跟上一堂差不多，但多了一行字。看不出差別？從這一堂開始，**放 5 分鐘也不會重開機了**：看門狗是 boot services 的一部分，已經下班了。

## 二、中斷是什麼

想像你在寫作業，媽媽叫你：「去開門！」你會：

1. 把作業寫到哪裡記下來
2. 去開門
3. 回來從記下的地方繼續寫

CPU 也是這樣。**中斷（interrupt）** 就是 CPU 正在跑程式時，有人「叫一下」：

- **例外（exception）**：CPU 自己發現問題，例如除以 0、讀了不能讀的記憶體。
- **硬體中斷**：外面的裝置叫 CPU，例如「鍵盤有人按了」、「計時器時間到了」。

CPU 被叫的時候，會自動把「做到哪裡」存起來、跳去處理、處理完再跳回來。我們要做的是告訴 CPU：**每一種中斷要跳去哪個函式**。

> 不用中斷也可以讀鍵盤：一直問「有人按嗎？有人按嗎？」，這叫**輪詢（polling）**。可是 CPU 會一直忙著問，什麼都不能做。中斷就像門鈴：有人來才響。

## 三、IDT：中斷表

**IDT（Interrupt Descriptor Table）** 是一張 256 格的表，第 n 格寫著「第 n 號中斷發生時要跳去哪裡」：

| 編號 | 是什麼 |
| --- | --- |
| 0 | 除以 0 |
| 3 | breakpoint（除錯用的中斷點） |
| 8 | double fault（處理中斷時又出錯） |
| 14 | page fault（讀寫了不能用的記憶體，第四堂） |
| 32～47 | 我們等一下要放硬體中斷的位置 |

建 `src\interrupts.rs`，先只放例外（硬體中斷第五節、鍵盤第六節再加）：

```rust
use spin::LazyLock;
use x86_64::structures::idt::{InterruptDescriptorTable, InterruptStackFrame};

static IDT: LazyLock<InterruptDescriptorTable> = LazyLock::new(|| {
    let mut idt = InterruptDescriptorTable::new();
    idt.breakpoint.set_handler_fn(breakpoint_handler);
    idt.double_fault.set_handler_fn(double_fault_handler);
    idt
});

pub fn init() {
    IDT.load();
}

extern "x86-interrupt" fn breakpoint_handler(stack_frame: InterruptStackFrame) {
    kprintln!("EXCEPTION: BREAKPOINT\n{:#?}", stack_frame);
}

extern "x86-interrupt" fn double_fault_handler(stack_frame: InterruptStackFrame, _error_code: u64) -> ! {
    panic!("EXCEPTION: DOUBLE FAULT\n{:#?}", stack_frame);
}
```

### 一段一段看

- **`extern "x86-interrupt" fn`**：中斷處理函式跟普通函式不一樣：它可能在任何一行程式中間被叫起來，所以要把**所有**暫存器都存起來、用特別的指令（`iretq`）返回。`x86-interrupt` 這個呼叫約定讓編譯器幫我們做這些事，這就是要 nightly 的原因。
- **`InterruptStackFrame`**：CPU 自動存下來的「做到哪裡」：中斷時跑到哪一行（instruction pointer）、堆疊在哪裡等等。
- **`LazyLock`**：IDT 必須一直存在（CPU 會隨時來查），所以放成 `static`。但建表要呼叫函式，`static` 不能直接這樣寫，`LazyLock` 是「第一次用到時才建」。
- **`IDT.load()`**：執行 `lidt` 指令，告訴 CPU 中斷表在哪裡。
- **`{:#?}`**：用除錯格式（`Debug`）印，`#` 是排版成一個欄位一行、有縮排。stack frame 欄位很多，擠成一行很難讀。
- **`double_fault_handler` 為什麼是 `-> !`**：`!`（never）代表「這個函式永遠不會回來」。double fault 是 CPU 已經救不回來的狀態，x86 規定它的處理函式不能返回，所以 `x86_64` crate 要求它的型別是 `-> !`。如果最後忘了 `panic!` 或 `loop`，讓函式有機會正常結束，編譯器會直接報錯。breakpoint 不一樣：處理完就該回去繼續跑，所以沒有 `-> !`。

## 四、例外：breakpoint 與 double fault

先試例外，因為不需要任何硬體。`main.rs` 最上面的 `mod` 加上 `interrupts`，放在 `console` 後面（`interrupts.rs` 用到 `kprintln!`，macro 要先宣告）：

```rust
#[macro_use]
mod serial;
mod framebuffer;
mod font;
#[macro_use]
mod console;
mod interrupts;
```

> 忘了這行會得到 `error[E0433]: cannot find module or crate interrupts`：檔案建好了，但沒有 `mod` 宣告，Rust 根本不會去讀它。

在 `exit_boot_services` 之後：

```rust
interrupts::init();
x86_64::instructions::interrupts::int3();
kprintln!("We came back from the breakpoint!");
```

`int3` 是「觸發 3 號中斷」的指令，除錯器設中斷點就是用它。畫面會印出 `EXCEPTION: BREAKPOINT` 和一大段 stack frame，**然後繼續往下跑**，印出下一行。這代表：CPU 跳去我們的函式，又跳回來了。

> 這時候中斷還是關著的（`interrupts::disable()`），但 `int3` 是程式自己觸發的例外，不受影響。硬體中斷要等第五節才打開。

### double fault

如果中斷發生了，IDT 裡卻沒有對應的函式，CPU 會先觸發另一個例外，報告「這一格是空的」。那個例外通常也還沒登記，等於處理例外時又出錯，這時 CPU 就觸發 **double fault**（8 號）。所以不管哪一格漏了，最後多半都會走到 double fault。如果 double fault 也沒有處理函式，就會 **triple fault**：CPU 直接重開機。寫作業系統時「QEMU 一直重開機」，多半就是 triple fault。

> 我們的 double fault 處理函式還用不到獨立的堆疊。有一種情況（堆疊本身爆掉）需要另外準備一塊堆疊才救得回來，叫 IST，有興趣可以查 TSS 和 IST。

## 五、硬體中斷：PIC 與計時器

### PIC

鍵盤、計時器這些裝置不是直接接到 CPU，而是先接到**中斷控制器 PIC**（Programmable Interrupt Controller，可程式化中斷控制器；x86 用的是 Intel **8259**，所以 crate 叫 `pic8259`）。它負責收硬體的訊號、排優先順序、再轉給 CPU；「可程式化」是指我們可以用 I/O port 設定它，例如下面的換號和遮罩。

PIC 有兩顆串在一起（主的叫 master、副的叫 slave），各有 8 條線（IRQ0～15；slave 接在 master 的 IRQ2 上，所以實際能用 15 條）：

| IRQ | 裝置 |
| --- | --- |
| 0 | 計時器（PIT，Programmable Interval Timer） |
| 1 | 鍵盤 |

PIC 預設把 IRQ0～7 送到 CPU 的 8～15 號中斷，但這跟 CPU 的例外撞號了（8 號是 double fault！計時器一響，CPU 會以為發生了 double fault）。CPU 的 0～31 號都保留給例外，所以 **`ChainedPics::new(32, 40)` 把硬體中斷整個搬到 32 號以後**：

| PIC | IRQ | 送到 CPU 的中斷號 | 例子 |
| --- | --- | --- | --- |
| master | IRQ0～7 | **32～39**（`new` 的第一個數字） | 計時器 IRQ0 → 32、鍵盤 IRQ1 → 33 |
| slave | IRQ8～15 | **40～47**（`new` 的第二個數字） | |

公式是「中斷號 = 起點 + IRQ 在那顆 PIC 上的編號」。所以等一下在 IDT 登記計時器和鍵盤時，要用的是 32、33 這兩格，不是 IRQ 的 0、1。

> 現代電腦主要用比較新的 **APIC**（Advanced PIC），能支援多核心。但為了相容，8259 一直都還在，QEMU 也有模擬，入門先用它最簡單。

### PIT 計時器

**PIT（Programmable Interval Timer，可程式化間隔計時器）**是 Intel **8253／8254** 這顆晶片，跟 PIC 一樣是 1980 年代 IBM PC 就有的老零件，為了相容一直留到現在。它每秒震動 1,193,182 次，設一個除數，它就每除數次叫一次中斷（接在 IRQ0）。`1_193_182 / 100` → 每秒 100 次，也就是每 10 毫秒一次。

### 加進 interrupts.rs

`interrupts.rs` 最上面的 `use` 換成：

```rust
use core::sync::atomic::{AtomicU64, Ordering};
use pic8259::ChainedPics;
use spin::{LazyLock, Mutex};
use x86_64::instructions::port::Port;
use x86_64::structures::idt::{InterruptDescriptorTable, InterruptStackFrame};
```

`use` 下面加：

```rust
pub const PIC_1_OFFSET: u8 = 32;
pub const PIC_2_OFFSET: u8 = PIC_1_OFFSET + 8;

pub static PICS: Mutex<ChainedPics> = Mutex::new(unsafe { ChainedPics::new(PIC_1_OFFSET, PIC_2_OFFSET) });

pub static TICKS: AtomicU64 = AtomicU64::new(0);

#[derive(Clone, Copy)]
#[repr(u8)]
pub enum InterruptIndex {
    Timer = PIC_1_OFFSET,
}
```

- **`PIC_1_OFFSET`、`PIC_2_OFFSET`**：就是上面表格的兩個起點 32 和 40，交給 `ChainedPics::new`。
- **`InterruptIndex`**：把「第幾號中斷」取個名字，免得程式裡到處寫 32、33。`Timer = PIC_1_OFFSET` 是因為計時器接在 master 的 IRQ0：32 + 0 = 32。第六節加鍵盤時，`Keyboard` 接在 `Timer` 後面，enum 會自動 +1 變成 33（IRQ1：32 + 1）。
- **`#[repr(u8)]`**：讓這個 enum 在記憶體裡就是一個 `u8`，才能用 `InterruptIndex::Timer as u8` 拿到 32。

IDT 多登記一格，`init` 設定 PIC 和計時器、打開中斷：

```rust
static IDT: LazyLock<InterruptDescriptorTable> = LazyLock::new(|| {
    let mut idt = InterruptDescriptorTable::new();
    idt.breakpoint.set_handler_fn(breakpoint_handler);
    idt.double_fault.set_handler_fn(double_fault_handler);
    idt[InterruptIndex::Timer as u8].set_handler_fn(timer_handler);
    idt
});

pub fn init() {
    IDT.load();
    unsafe {
        let mut pics = PICS.lock();
        pics.initialize();
        pics.write_masks(0b1111_1110, 0b1111_1111); // 只開 IRQ0（計時器）
    }
    set_timer_hz(100);
    x86_64::instructions::interrupts::enable();
}

pub fn ticks() -> u64 {
    TICKS.load(Ordering::Relaxed)
}
```

檔案最後加計時器的處理函式和設定：

```rust
extern "x86-interrupt" fn timer_handler(_stack_frame: InterruptStackFrame) {
    TICKS.fetch_add(1, Ordering::Relaxed);
    unsafe { PICS.lock().notify_end_of_interrupt(InterruptIndex::Timer as u8) };
}

/// 計時器（PIT）每秒叫 hz 次
fn set_timer_hz(hz: u32) {
    let divisor = 1_193_182 / hz;
    unsafe {
        Port::<u8>::new(0x43).write(0x36);
        Port::<u8>::new(0x40).write((divisor & 0xFF) as u8);
        Port::<u8>::new(0x40).write((divisor >> 8) as u8);
    }
}
```

- **`ChainedPics`**：`pic8259` 用來代表「兩顆串在一起的 PIC」的型別（chained = 串起來）。master、slave 兩顆要分開設定，還要告訴 master「IRQ2 接的是 slave」，`initialize()` 一次做完這些。`new(32, 40)` 的兩個數字就是兩顆各自從第幾號中斷開始；它是 `unsafe`，因為號碼填錯（例如跟例外重疊），硬體中斷就會被當成例外處理，編譯器檢查不出來。外面包 `Mutex` 是因為 `init` 和每個中斷處理函式（送 EOI）都要用它。
- **`write_masks`**：每個 bit 代表一條線，1 = 不理它。`0b1111_1110` 是只開 IRQ0；第六節加鍵盤時改成 `0b1111_1100`。
- **`set_timer_hz`**：PIT 有兩個 port，`0x43` 是「設定」、`0x40` 是「第 0 號計時器的除數」。
  - `0x43` 寫 `0x36`，也就是二進位 `00 11 011 0`，從左到右是：用第 0 號計時器（`00`，接在 IRQ0 的那個）、除數分兩次寫，先低位再高位（`11`）、模式 3：一直週期性地數下去（`011`）、用一般二進位數字（`0`）。
  - `0x40` 一次只能寫 8 bit，除數 11931 超過 255，所以拆成兩半：`divisor & 0xFF` 是低 8 bit，`divisor >> 8` 是高 8 bit，順序就是上面 `11` 說好的「先低後高」。
  - `Port::<u8>` 的 `<u8>` 是說這個 port 一次讀寫 1 個 byte（x86 的 port 也可以一次讀寫 2 或 4 個 byte）。
- **`notify_end_of_interrupt`**（EOI）：處理完要跟 PIC 說「好了」，它才會送下一個。**忘記送 EOI，就只會收到第一次中斷。**
- **`AtomicU64`**：計時器每 10 毫秒加一次，主程式隨時會讀。atomic 是「一次做完、不會被打斷」的變數，不用鎖。
- **`Ordering::Relaxed`**：atomic 的每個操作都要說「跟其他記憶體操作的先後順序要多嚴格」。`Relaxed` 是最寬鬆的：只保證這個數字本身的加和讀不會壞掉，不保證跟其他變數的順序。`TICKS` 只是一個獨立的計數器，沒有「讀到它之後，別的資料也一定準備好了」這種需求，所以用 `Relaxed` 就夠，也最快。要保證順序時才用 `Acquire`／`Release`／`SeqCst`，之後多核心時才會碰到。
- **`interrupts::enable()`**：IDT 和 PIC 都準備好了，才把第一節關掉的中斷打開。

把 `main` 最後的 `loop {}` 換成：

```rust
let mut last = 0;
loop {
    let seconds = interrupts::ticks() / 100;
    if seconds != last {
        last = seconds;
        kprintln!("uptime: {} s", seconds);
    }
    x86_64::instructions::hlt();
}
```

`hlt` 是「睡到下一次中斷」。之前的 `loop {}` 會讓 CPU 全速空轉；加了 `hlt` 之後 CPU 平常在休息，PC 的風扇也會感謝你。

## 六、鍵盤

按下一個鍵時，鍵盤會送出一個數字叫 **scancode**，放在 port `0x60`，然後觸發 IRQ1。放開時會再送一個（按下的數字 + 0x80）。

`A` 按下是 `0x1E`、放開是 `0x9E`。scancode 不是字元：它只代表「鍵盤上第幾個鍵」，要經過鍵盤配置（美式、日文……）、有沒有按 Shift，才知道是 `a` 還是 `A`。這部分交給 `pc-keyboard`。

### 中斷裡只做最少的事

中斷處理函式應該**越短越好**：它在跑的時候，其他事都停了。所以 `keyboard_handler` 只把 scancode 放進一個佇列，翻譯成字元交給主程式慢慢做。

`src\keyboard.rs`：

```rust
use spin::Mutex;
use x86_64::instructions::interrupts::without_interrupts;
use x86_64::instructions::port::Port;

const QUEUE_SIZE: usize = 128;

struct Queue {
    buf: [u8; QUEUE_SIZE],
    head: usize,
    len: usize,
}

static QUEUE: Mutex<Queue> = Mutex::new(Queue { buf: [0; QUEUE_SIZE], head: 0, len: 0 });

/// 中斷處理函式呼叫：放進佇列，滿了就丟掉
pub fn push(scancode: u8) {
    if let Some(mut q) = QUEUE.try_lock() {
        if q.len < QUEUE_SIZE {
            let tail = (q.head + q.len) % QUEUE_SIZE;
            q.buf[tail] = scancode;
            q.len += 1;
        }
    }
}

/// 主程式呼叫：拿出最早的一個
pub fn pop() -> Option<u8> {
    without_interrupts(|| {
        let mut q = QUEUE.lock();
        if q.len == 0 {
            return None;
        }
        let value = q.buf[q.head];
        q.head = (q.head + 1) % QUEUE_SIZE;
        q.len -= 1;
        Some(value)
    })
}

/// 確定鍵盤控制器會送中斷
pub fn init_controller() {
    unsafe {
        let mut status: Port<u8> = Port::new(0x64);
        let mut data: Port<u8> = Port::new(0x60);
        let wait_write = |status: &mut Port<u8>| while status.read() & 0x02 != 0 {};
        let wait_read = |status: &mut Port<u8>| while status.read() & 0x01 == 0 {};

        while status.read() & 0x01 != 0 {
            data.read(); // 先清掉 UEFI 留下的資料，免得等一下被當成設定
        }

        wait_write(&mut status);
        status.write(0x20); // 讀設定
        wait_read(&mut status);
        let config = data.read();

        let config = (config | 0x01 | 0x40) & !0x10; // 開鍵盤中斷、開 scancode 轉換、開鍵盤時脈
        wait_write(&mut status);
        status.write(0x60); // 寫設定
        wait_write(&mut status);
        data.write(config);

        while status.read() & 0x01 != 0 {
            data.read(); // 清掉之前留下的資料
        }
    }
}
```

- 佇列是一個**環形緩衝區**：固定 128 格，頭尾一直繞圈。現在還沒有 heap（第四堂），不能用 `Vec`。
- **`without_interrupts(|| { ... })`**：大括號裡的程式跑完之前，**暫時不讓中斷進來**，跑完再恢復原本的狀態（原本就關著的話就維持關著）。`pop` 是主程式呼叫的，它拿著 `QUEUE` 的鎖時，如果鍵盤中斷剛好插進來，`push` 會拿不到鎖：用 `lock()` 會永遠等下去（主程式要等中斷結束才能放鎖），用 `try_lock` 就是這個按鍵被丟掉。關中斷的時間只有幾行程式，按鍵不會掉，最多晚一點點才被處理。第七節會用同樣的方法修 `kprintln!`，那裡會把「為什麼會卡死」一步一步講完。
- **`push` 用 `try_lock`**：中斷處理函式**不能等鎖**，理由同上；拿不到就放棄這個按鍵，總比整台卡死好。
- `init_controller`：UEFI 自己的鍵盤驅動可能是用輪詢的，把中斷關掉了，所以我們自己打開。鍵盤不是直接接 CPU，中間有一顆 **PS/2 鍵盤控制器**（Intel **8042**），它有兩個 port：

  | port | 讀 | 寫 |
  | --- | --- | --- |
  | `0x64` | **狀態**（status） | 給控制器的**指令**（command） |
  | `0x60` | **資料**：scancode、指令的回覆 | 資料：指令的參數 |

  - 狀態的 bit 0 = 1：`0x60` 有資料可以讀了（`wait_read` 等它變 1）。bit 1 = 1：控制器還在忙，先不要寫（`wait_write` 等它變 0）。跟硬體說話都是這樣：**先看它準備好了沒，再讀寫**。
  - 指令 `0x20` 是「把設定 byte 給我」，回覆從 `0x60` 讀；指令 `0x60` 是「我要寫新的設定 byte」，接著把設定寫到 `0x60`。（指令 `0x60` 和 port `0x60` 剛好同一個數字，是巧合。）
  - 設定 byte 改三個 bit：bit 0 = 1 開鍵盤中斷（IRQ1）、bit 6 = 1 把鍵盤送的 scancode 翻成舊式的 set 1（`pc-keyboard` 用 `ScancodeSet1` 解）、bit 4 = 0 讓鍵盤可以送資料。（PS/2 是一次送一個 bit 的序列傳輸，旁邊有一條「時脈線」當節拍器，鍵盤跟著節拍一個 bit 一個 bit 送。控制器把時脈線壓住，鍵盤就送不出來，等於把鍵盤關掉；bit 4 = 1 就是「壓住」，所以要清成 0。）
  - 開頭和最後都把 `0x60` 裡留下的資料讀掉：開頭不清的話，UEFI 留下的按鍵會被 `wait_read` 當成設定 byte 讀進來，再寫回控制器就把設定改壞了；最後不清，第一個中斷可能讀到舊的東西。
  - `let mut status: Port<u8>`：`Port` 的 `read`、`write` 都要 `&mut self`，所以要 `mut`。`<u8>` 是一次讀寫 1 個 byte。

### 接上中斷

`main.rs` 的 `mod` 加上 `mod keyboard;`。

`interrupts.rs` 要改五個地方：

1. 最上面加：

   ```rust
   use crate::keyboard;
   ```

   `main.rs` 的 `mod keyboard;` 只是讓 `keyboard` 成為整個程式的一個模組（`crate::keyboard`）。在 `interrupts.rs` 裡直接寫 `keyboard::`，Rust 會在**目前這個模組底下**找，也就是 `crate::interrupts::keyboard`，找不到就是 `error[E0433]: cannot find module or crate keyboard`。`use crate::keyboard;` 是把它拉進這個檔案。（`main.rs` 不用寫，因為 `main.rs` 本身就是 crate 的根。）
2. `InterruptIndex` 多一個 `Keyboard`（接在 `Timer` 後面，自動是 33 號）：

   ```rust
   pub enum InterruptIndex {
       Timer = PIC_1_OFFSET,
       Keyboard,
   }
   ```

3. IDT 多登記一格：

   ```rust
   idt[InterruptIndex::Keyboard as u8].set_handler_fn(keyboard_handler);
   ```

4. `init` 的遮罩改成也開 IRQ1，並在打開中斷之前設定鍵盤控制器：

   ```rust
   pub fn init() {
       IDT.load();
       unsafe {
           let mut pics = PICS.lock();
           pics.initialize();
           pics.write_masks(0b1111_1100, 0b1111_1111); // 只開 IRQ0（計時器）和 IRQ1（鍵盤）
       }
       set_timer_hz(100);
       keyboard::init_controller();
       x86_64::instructions::interrupts::enable();
   }
   ```

5. 加鍵盤的處理函式：從 port `0x60` 讀 scancode，放進佇列就走。這裡不用像 `init_controller` 那樣先 `wait_read`：控制器是**等 `0x60` 有資料了才送 IRQ1**，中斷本身就是「資料準備好了」的通知，所以進到這個函式時一定讀得到。反過來，**一定要讀**：不把 `0x60` 讀掉，控制器以為資料還沒被拿走，就不會送下一個按鍵。

   ```rust
   extern "x86-interrupt" fn keyboard_handler(_stack_frame: InterruptStackFrame) {
       let scancode: u8 = unsafe { Port::new(0x60).read() };
       keyboard::push(scancode);
       unsafe { PICS.lock().notify_end_of_interrupt(InterruptIndex::Keyboard as u8) };
   }
   ```

### 翻成字元

`main.rs`：

```rust
use pc_keyboard::{layouts, DecodedKey, HandleControl, PS2Keyboard, ScancodeSet1};
```

主迴圈換成：

```rust
let mut kb = PS2Keyboard::new(ScancodeSet1::new(), layouts::Us104Key, HandleControl::Ignore);
loop {
    while let Some(scancode) = keyboard::pop() {
        if let Ok(Some(event)) = kb.add_byte(scancode) {
            match kb.process_keyevent(event) {
                Some(DecodedKey::Unicode(c)) => kprint!("{}", c),
                Some(DecodedKey::RawKey(key)) => kprint!("[{:?}]", key),
                None => {}
            }
        }
    }
    x86_64::instructions::hlt();
}
```

- `add_byte`：放進一個 scancode，湊滿一個「按鍵事件」就回傳（有些鍵要好幾個 byte）。
- `process_keyevent`：考慮 Shift、Caps Lock，翻成字元。方向鍵這種沒有字元的叫 `RawKey`。
- `PS2Keyboard::new` 的三個參數：scancode 的格式（set 1，`init_controller` 開了轉換）、鍵盤配置（美式 104 鍵）、按住 Ctrl 時怎麼辦。`HandleControl::Ignore` 是不管 Ctrl：Ctrl+A 還是印 `a`。另一個選項 `MapLettersToUnicode` 會把 Ctrl+字母翻成終端機的控制字元（Ctrl+A = 1、Ctrl+C = 3），之後做編輯器、要用 Ctrl+S 存檔時才換過去。

跑起來，點一下 QEMU 視窗，打字！**這是我們的作業系統第一次聽到使用者的聲音。**

（滑鼠被 QEMU 抓住的話，按 `Ctrl`+`Alt`+`G` 放開。）

![BlueBolt OS 接管電腦之後打字：畫面印出 hi [LShift]Blue[LShift]Bolt [LShift]O[LShift]S[LShift]! 和 [ArrowUp][ArrowDown]](/images/posts/logs/bluebolt-os-03/03-keyboard.webp)

每按一次 Shift 都會多一個 `[LShift]`：Shift 本身沒有字元，`pc-keyboard` 把它當成 `RawKey` 回傳，我們的程式就照樣印出來。方向鍵也一樣。想要畫面乾淨一點，可以讓 `RawKey` 那一行什麼都不印。

## 七、鎖與中斷：會卡死的陷阱

現在的 `kprintln!` 有一個 bug，只是還沒發生：

1. 主程式呼叫 `kprintln!`，**拿到** `CONSOLE` 的鎖，正在畫字……
2. 這時中斷來了，中斷處理函式也呼叫 `kprintln!`，想拿 `CONSOLE` 的鎖。
3. 鎖在主程式手上，中斷處理函式一直等。
4. 可是主程式要等中斷處理完才能繼續跑，**永遠不會放開鎖**。

這叫**死結（deadlock）**。解法：主程式拿鎖的時候，暫時不讓中斷進來。`console.rs` 的 `_print` 改成：

```rust
pub fn _print(args: fmt::Arguments) {
    use core::fmt::Write;
    x86_64::instructions::interrupts::without_interrupts(|| {
        if let Some(console) = CONSOLE.lock().as_mut() {
            console.write_fmt(args).unwrap();
        }
        crate::serial::_print(args);
    });
}
```

`keyboard::pop` 已經這樣寫了；`push` 在中斷裡用 `try_lock`，萬一拿不到就丟掉這個按鍵，總比卡死好。

**演練**：把 `_print` 改回沒有 `without_interrupts` 的版本，在 `timer_handler` 裡加一行 `kprint!(".")`，打字打一陣子，看會不會卡住。（會不會、多久卡住都看運氣，這就是這種 bug 可怕的地方。）

## 八、直播時遇到的問題

### `.\run.ps1` 跑不起來：「因為這個系統上已停用指令碼執行」

Windows PowerShell 5.1 預設不讓 `.ps1` 腳本執行。三種解法，從影響範圍最小的開始：

1. **只有這一次**：不改任何設定。

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\run.ps1
   ```

2. **只有這個 PowerShell 視窗**：關掉視窗就恢復，在這個視窗裡可以一直用 `.\run.ps1`。

   ```powershell
   Set-ExecutionPolicy -Scope Process Bypass
   ```

3. **自己的帳號永久打開**：之後每個視窗都不用再處理。

   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```

   `RemoteSigned` 的意思是：自己電腦上寫的腳本可以跑，從網路下載的腳本要有簽章才能跑。這是改電腦的安全設定，要不要改自己決定。

### `error[E0433]: cannot find module or crate interrupts`

`src\interrupts.rs` 建好了，但 `main.rs` 沒有寫 `mod interrupts;`。Rust 不會自動讀資料夾裡所有的檔案，**每個檔案都要在 `main.rs` 用 `mod` 宣告**才算是程式的一部分。第四節現在把完整的 `mod` 清單列出來了。

### `error[E0433]: cannot find module or crate keyboard`（在 `interrupts.rs` 裡）

這次是 `main.rs` 已經有 `mod keyboard;`，錯誤卻出現在 `interrupts.rs`。原因是 `mod` 和 `use` 做的事不一樣：

- `mod keyboard;`（寫在 `main.rs`）：讓 `keyboard.rs` 成為整個程式的一個模組，完整的名字是 `crate::keyboard`。
- 在 `interrupts.rs` 裡直接寫 `keyboard::push`，Rust 會在**目前這個模組底下**找，也就是 `crate::interrupts::keyboard`，當然找不到。
- `use crate::keyboard;`：把 `crate::keyboard` 拉進這個檔案，之後就能直接寫 `keyboard::`。

`main.rs` 本身就是 crate 的根，所以在 `main.rs` 裡不用 `use`。

### 講義的順序

直播用的講義原本在第三節就把 PIC、計時器、鍵盤的程式碼全部寫進 `interrupts.rs`，可是 PIC 要到第五節才解釋，`keyboard.rs` 要到第六節才建。直播時當場改成現在的順序：**第三節只有例外，第五節加計時器，第六節加鍵盤**，每一節做完都能編譯、跑起來看結果。

### TSS 和 IST 是什麼？

第四節提到「堆疊爆掉」時 double fault 也救不回來，要靠 IST。問題出在這裡：

1. CPU 處理中斷時，會把「做到哪裡」（`InterruptStackFrame`）**推進目前的堆疊**。
2. 如果出事的原因剛好是堆疊爆了（例如遞迴太深），推不進去，又觸發一次錯誤，變成 double fault。
3. double fault 也要推進同一個壞掉的堆疊，於是 triple fault，直接重開機，連錯誤訊息都看不到。

解法是**出事時換一塊乾淨的堆疊**：

- **TSS（Task State Segment）**：記憶體裡的一個結構，裡面放著好幾塊「備用堆疊」的位址。名字裡有 task，是因為 32 位元時代拿它來切換工作；到了 64 位元，主要只剩「存堆疊位址」這個用途。
- **IST（Interrupt Stack Table）**：TSS 裡的一張小表，最多 7 格，每一格是一塊備用堆疊的位址。IDT 裡可以指定「double fault 發生時，換到 IST 第 0 格的堆疊」，不管原本的堆疊壞成什麼樣子，處理函式都跑得起來。

要做的事有：準備一塊備用堆疊、建 TSS 把位址放進 IST、建一張 **GDT（Global Descriptor Table）** 把 TSS 登記進去再載入、IDT 的 double fault 加上 `.set_stack_index(0)`。GDT 牽涉到 CPU 的「分段」，這一堂的新東西已經夠多了，所以留到之後做使用者模式（ring 3）時一起做：那時候本來就一定要有 GDT 和 TSS。

## 九、延伸

- **除以 0**：在 IDT 加 `divide_error` 的處理函式，再讓 CPU 真的除以 0 一次。注意 Rust 的 `/` 會在除之前自己檢查，除數是 0 就直接 panic，根本不會讓 CPU 去除（除以常數 0 甚至編譯時就擋下來），所以這樣只會看到 panic handler。要用 `asm!` 直接寫 `div` 指令，才測得到 `divide_error`。
- **計時器頻率**：改成 1000 Hz，`uptime` 的算法要跟著改。
- **鍵盤配置**：`layouts` 裡還有日文 `Jis109Key` 等配置。

## 小複習

1. `exit_boot_services` 之後 UEFI 下班：`boot::` 的函式不能再用，看門狗也停了；畫面緩衝區還在，記憶體地圖留著第四堂用。
2. 中斷分成 CPU 自己發現的**例外**和裝置送來的**硬體中斷**；IDT 是 256 格的表，寫著每一號中斷要跳去哪個函式。
3. 中斷處理函式用 `extern "x86-interrupt"`，所以要 nightly；double fault 救不回來，所以是 `-> !`。
4. PIC 預設的號碼跟例外撞號，用 `ChainedPics::new(32, 40)` 把 IRQ 搬到 32～47；處理完一定要送 EOI。
5. PIT 每秒震動 1,193,182 次，除數 11931 就是每秒 100 次；計數器用 `AtomicU64`，不用鎖。
6. 鍵盤送的是 scancode，不是字元：中斷裡只把它放進環形佇列，主程式再用 `pc-keyboard` 翻成字元。
7. 主程式拿著鎖時被中斷，中斷處理函式又要同一把鎖，就會死結：主程式拿鎖時用 `without_interrupts`，中斷裡用 `try_lock`。

## 下一堂預告：記憶體

UEFI 交給我們的記憶體地圖還放著沒用。下一堂要讀懂它、看分頁表，做出自己的 heap，讓 `Vec` 和 `String` 終於能用。
