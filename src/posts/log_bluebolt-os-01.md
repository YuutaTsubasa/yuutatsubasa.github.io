---
title: "從零做一個作業系統，以 Rust 為例：#1 按下電源之後，印出第一行字"
slug: bluebolt-os-01
date: "2026-11-10"
time: "23:30"
category: workshop
excerpt: "電腦按下電源之後發生了什麼事？用 Rust 的 no_std 寫一支 UEFI 程式，放進 QEMU 模擬的開機磁碟，讓自己的作業系統 BlueBolt OS 印出第一行字；也整理了直播時實際踩到的三個坑 — Vol. 943 的直播講義。"
tags: ["Rust", "作業系統", "OSDev", "UEFI", "QEMU", "BlueBolt OS", "Workshop", "教學"]
series: bluebolt-os
ep: 1
stack: ["Rust", "uefi crate", "QEMU"]
streams: [943]
links:
  - label: "uefi crate 文件"
    url: "https://docs.rs/uefi"
  - label: "QEMU for Windows"
    url: "https://qemu.weilnetz.de/w64/"
meta:
  status: "PUBLISHED"
  phase: "v1.0"
---

這份講義整理 Vol. 943 直播的內容，是 BlueBolt OS 系列的第一堂。這個系列要用 Rust 從零寫一個小小的作業系統，跑在模擬器 QEMU 裡，最後的目標是在自己的作業系統上玩自己做的收集戒指小遊戲。

今天的目標只有一件事：**自己寫一支程式，讓虛擬電腦一開機就跑它，畫面印出我們寫的字。**

不需要寫過作業系統，也不需要懂組合語言。會一點 Rust（知道 `fn`、`let`、`cargo build` 是什麼）就跟得上；不會也沒關係，每段程式碼都會解釋。

> 講義裡的程式碼都在 Rust 1.99、`uefi` 0.41、QEMU 11.1 上實際跑過。`uefi` 這個 crate 改版很快，如果你裝到更新的版本、範例編不過，先把 `Cargo.toml` 裡的版本改成 `0.41.0` 試試看。

整場分成五個部分：

1. **作業系統是什麼**：電腦按下電源之後發生了什麼事
2. **工具**：Rust、QEMU、UEFI 韌體，各自負責什麼
3. **建立專案**：沒有作業系統可以靠的 Rust 程式長什麼樣子
4. **第一行字**：寫 `main`、編譯、放進「開機磁碟」、在 QEMU 開機
5. **直播時踩到的坑**與延伸演練

## 一、作業系統是什麼

### 平常寫的程式，都在「靠」作業系統

平常寫一支印出 `Hello` 的程式，看起來很簡單：

```rust
fn main() {
    println!("Hello");
}
```

但其實 `println!` 背後做了很多事：把字交給 Windows，Windows 再找到終端機視窗、找到字型、把字畫到畫面上。記憶體也是 Windows 分配給你的，程式結束時 Windows 幫你收拾。

**作業系統（OS，Operating System）** 就是這個「幫所有程式管電腦」的程式。它負責：

- 管**硬體**：螢幕、鍵盤、硬碟、網路卡
- 管**記憶體**：誰可以用哪一塊
- 管**時間**：好幾支程式輪流用 CPU，看起來像同時在跑

這個系列要自己寫一個，叫 **BlueBolt OS**。寫作業系統的時候，沒有別的作業系統可以靠了，`println!` 這種東西要自己做。

### 按下電源之後

```
按下電源 → 韌體（主機板上的小程式）→ 開機程式 → 作業系統核心 → 你的程式
```

- **韌體（firmware）**：燒在主機板上的程式，一通電就先跑。它檢查硬體、找到可以開機的磁碟。
- 以前的韌體叫 **BIOS**，現在的電腦幾乎都是 **UEFI**。
- UEFI 會到磁碟裡一個固定的位置找一個 `.efi` 檔案來執行。Windows 的開機程式就是這樣被叫起來的。

所以第一步很單純：**做一個 `.efi` 檔案，放到 UEFI 會去找的位置。** 這樣 UEFI 就會把它當成作業系統來跑。

> 為什麼選 UEFI 不選 BIOS？BIOS 開機時 CPU 還在 1980 年代的 16 位元模式，要寫組合語言一路切換到 64 位元。UEFI 已經幫我們切好 64 位元模式，還附了印字、畫圖的功能，第一堂就能看到成果。

## 二、工具

| 工具 | 負責什麼 | 比喻 |
| --- | --- | --- |
| **Rust** + `x86_64-unknown-uefi` | 把我們的程式碼翻成 UEFI 看得懂的 `.efi` | 翻譯 |
| **QEMU** | 在 Windows 裡模擬一台電腦 | 一台假的電腦 |
| **UEFI 韌體檔**（edk2／OVMF） | 給 QEMU 那台假電腦用的韌體 | 假電腦的主機板程式 |

為什麼要 QEMU？直接拿真的電腦開機，寫錯一次就要重開一次，還可能動到真正的硬碟。QEMU 是開源的模擬器，視窗關掉就沒了，寫壞也不怕。

### 安裝 Rust

已經有 Rust 的話跳過。沒有的話到 <https://rustup.rs> 下載 `rustup-init.exe`，照預設安裝。裝好後打開新的 PowerShell 確認：

```powershell
rustc --version
cargo --version
```

### 加上 UEFI 的編譯目標

Rust 預設只會編出「給 Windows 跑的程式」。要編出給 UEFI 跑的程式，要加一個**編譯目標（target）**：

```powershell
rustup target add x86_64-unknown-uefi
```

名字拆開看：`x86_64`（64 位元的 Intel／AMD CPU）－`unknown`（不管是哪家廠商）－`uefi`（跑在 UEFI 上）。注意 `x86_64` 中間是**底線**，它本身就是一個名字；後面才用減號分段。

### 安裝 QEMU

```powershell
winget install SoftwareFreedomConservancy.QEMU
```

也可以到 <https://qemu.weilnetz.de/w64/> 下載安裝檔。裝好後在 `C:\Program Files\qemu\` 裡面會有：

- `qemu-system-x86_64.exe`：模擬 64 位元電腦的 QEMU
- `share\edk2-x86_64-code.fd`：**UEFI 韌體檔**。Windows 版的 QEMU 已經附了，不用另外下載 OVMF。

確認一下：

```powershell
& "C:\Program Files\qemu\qemu-system-x86_64.exe" --version
Test-Path "C:\Program Files\qemu\share\edk2-x86_64-code.fd"
```

第二行印出 `True` 就對了。（`&` 是 PowerShell 用來執行「路徑裡有空白的程式」的寫法。）

## 三、建立專案

```powershell
cargo new bluebolt-os
cd bluebolt-os
```

### 告訴 cargo：我們要編給 UEFI

每次都打 `--target x86_64-unknown-uefi` 很累，所以在專案裡建一個 `.cargo\config.toml`：

```toml
[build]
target = "x86_64-unknown-uefi"
```

注意是**另外一個檔案**，不是寫進 `Cargo.toml`。`.cargo` 是一個新資料夾，跟 `Cargo.toml` 放在同一層：

```
bluebolt-os\
├─ .cargo\
│  └─ config.toml   ← 這裡
├─ src\
│  └─ main.rs
└─ Cargo.toml
```

`Cargo.toml` 寫的是「這個專案是什麼、用了哪些 crate」；`.cargo\config.toml` 寫的是「cargo 這個工具要怎麼編」。`[build]` 寫進 `Cargo.toml` 的話，cargo 只會警告一句 unused key，然後照樣編成 Windows 程式。

之後 `cargo build` 就會自動編給 UEFI。

### 加上 uefi 函式庫

UEFI 提供的功能（印字、讀鍵盤、畫圖……）都是用 C 語言的規格定義的。`uefi` 這個 crate 幫我們包成 Rust 好用的樣子：

```powershell
cargo add uefi --features panic_handler,logger
cargo add log
```

`Cargo.toml` 會多出這兩行（直播時裝到的版本）：

```toml
[dependencies]
log = "0.4.35"
uefi = { version = "0.41.0", features = ["panic_handler", "logger"] }
```

- `panic_handler`：程式當機（panic）時要做什麼，這個 crate 幫我們寫好了，下面會解釋為什麼需要。
- `logger`：讓 `log` crate 的 `info!` 之類可以印到畫面上。

## 四、第一行字

打開 `src\main.rs`，整個換成：

```rust
#![no_std]
#![no_main]

use uefi::prelude::*;
use uefi::println;

#[entry]
fn main() -> Status {
    uefi::helpers::init().unwrap();

    println!("BlueBolt OS is booting...");

    loop {}
}
```

一行一行看。

### `#![no_std]`：沒有標準函式庫

平常 Rust 會自動帶入**標準函式庫（std）**，裡面有讀檔、開網路、印到終端機這些功能。但它們全都是**請作業系統幫忙做**的，而我們就是那個作業系統，沒有人可以請。

`#![no_std]` 的意思是：不要 std，只用 **core**。core 是不需要作業系統也能用的部分：數字運算、`Option`、`Result`、迭代器、字串切片這些都還在。

### `#![no_main]`：沒有平常的 `main`

平常的 `fn main()` 其實不是程式真正的起點，作業系統會先跑一段準備程式，再呼叫你的 `main`。沒有作業系統，就沒有那段準備程式。

`#![no_main]` 告訴 Rust：「不要用平常那套起點，我自己指定。」

### `#[entry]`：UEFI 從這裡開始

`#[entry]` 是 `uefi` crate 提供的標記，意思是「UEFI 載入這個檔案後，從這個函式開始跑」。它會幫我們接好 UEFI 傳進來的資料。

`-> Status` 是要回傳給 UEFI 的結果，像 C 語言 `main` 的 `return 0;`。`Status::SUCCESS` 代表成功。

### `uefi::helpers::init()`：準備好印字和 log

做一些初始化，讓 `println!` 跟 `log` 能用。`.unwrap()` 是「失敗就當機」，第一堂先這樣寫就好。

### `println!`：這不是平常那個 println

注意上面有一行 `use uefi::println;`。這個 `println!` 是 `uefi` crate 做的：它請 UEFI 的**文字輸出功能**幫忙印字。用法跟平常一樣，也能用 `{}` 插入變數。

### `loop {}`：為什麼不直接 `return`

如果 `return Status::SUCCESS;`，UEFI 會覺得「這支開機程式跑完了」，接著跳回韌體的選單，我們的字一閃就不見了。

所以先用 `loop {}` 讓程式停在這裡。作業系統本來就不會「結束」，關機之前會一直跑。

> UEFI 有一個**看門狗計時器（watchdog）**：開機程式跑了 5 分鐘還沒交接，韌體會當它卡住，自動重開機。所以放著 5 分鐘 QEMU 會重開，這是正常的。之後我們會正式「接管」電腦，到時候就沒有這個問題。

### 為什麼需要 panic handler

平常程式 panic 時，std 會印出錯誤、結束程式。沒有 std，Rust 會要求你自己寫「panic 時要做什麼」，不寫就編譯不過。我們在 `Cargo.toml` 開了 `panic_handler` 這個 feature，`uefi` crate 會幫我們印出錯誤訊息，等 10 秒讓你看清楚，然後把電腦關機。下一堂會自己寫一個。

### 編譯

```powershell
cargo build
```

成功的話會產生 `target\x86_64-unknown-uefi\debug\bluebolt-os.efi`。這就是 UEFI 看得懂的執行檔，跟 Windows 的 `.exe` 是親戚（都是 PE 格式）。

### 做一個「開機磁碟」

UEFI 開機時會找一個 **EFI 系統分割區（ESP）**，然後找裡面的 `\EFI\BOOT\BOOTX64.EFI`。只要把我們的檔案放在這個位置、取這個名字，UEFI 就會執行它。

做一個真的磁碟映像檔很麻煩。QEMU 有個方便的功能：**把一個普通資料夾假裝成磁碟**。所以我們只要建資料夾：

```powershell
New-Item -ItemType Directory -Force esp\efi\boot | Out-Null
Copy-Item target\x86_64-unknown-uefi\debug\bluebolt-os.efi esp\efi\boot\bootx64.efi
```

（UEFI 的磁碟格式是 FAT，不分大小寫，所以寫小寫也可以。）

### 開機！

```powershell
& "C:\Program Files\qemu\qemu-system-x86_64.exe" `
    -drive "if=pflash,format=raw,readonly=on,file=C:\Program Files\qemu\share\edk2-x86_64-code.fd" `
    -drive "format=raw,file=fat:rw:esp" `
    -serial stdio
```

（行尾的反引號 `` ` `` 是 PowerShell 的「下一行接著寫」。）

| 參數 | 意思 |
| --- | --- |
| `-drive if=pflash,...,file=...code.fd` | 把 UEFI 韌體裝到假電腦的主機板上 |
| `-drive format=raw,file=fat:rw:esp` | 把 `esp` 資料夾假裝成一顆 FAT 格式的磁碟 |
| `-serial stdio` | 把假電腦的序列埠接到這個 PowerShell 視窗 |

QEMU 視窗會先出現 TianoCore 的標誌（這是 edk2 韌體的名字），過一兩秒，畫面會印出：

```
BlueBolt OS is booting...
```

**這就是我們的作業系統的第一行字。**

PowerShell 視窗也會看到同一行字：這個韌體會把畫面上的文字同時送到序列埠。關掉 QEMU 視窗就是「拔電源」。

### 寫成腳本

每次改完都要「編譯 → 複製 → 開 QEMU」，寫成 `run.ps1` 放在專案根目錄：

```powershell
$ErrorActionPreference = "Stop"
$qemu = "C:\Program Files\qemu"

cargo build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

New-Item -ItemType Directory -Force esp\efi\boot | Out-Null
Copy-Item target\x86_64-unknown-uefi\debug\bluebolt-os.efi esp\efi\boot\bootx64.efi

& "$qemu\qemu-system-x86_64.exe" `
    -drive "if=pflash,format=raw,readonly=on,file=$qemu\share\edk2-x86_64-code.fd" `
    -drive "format=raw,file=fat:rw:esp" `
    -serial stdio
```

執行：

```powershell
powershell -ExecutionPolicy Bypass -File run.ps1
```

（Windows 預設不讓你直接執行 `.ps1`，`-ExecutionPolicy Bypass` 是「這一次」允許，不會改電腦的設定。）

`esp` 資料夾是每次自動產生的，不用進 Git。`cargo new` 已經在 `.gitignore` 寫了 `/target`，再加一行：

```
/target
/esp
```

## 五、直播時踩到的坑

### 坑 1：`[build]` 寫進了 `Cargo.toml`

上面說過，`target` 的設定要放在 `.cargo\config.toml` 這個**另外的檔案**。寫進 `Cargo.toml` 不會報錯，只會多一句警告，然後編出來的還是 Windows 程式：

```
warning: Cargo.toml: unused manifest key: build
help: build is a valid .cargo/config.toml key
```

其實 cargo 的 `help` 已經告訴你該放哪裡了。

### 坑 2：`x86-64` 還是 `x86_64`？

設定檔裡打成 `x86-64-unknown-uefi`，`cargo build` 會說：

```
error: error loading target specification: could not find specification for target "x86-64-unknown-uefi"
  = help: did you mean `x86_64-unknown-uefi`?
```

錯誤訊息的最後一行已經給答案了：`x86_64` 中間是底線。Rust 的錯誤訊息常常會像這樣附上 `help`，卡住時先看最後幾行。

### 坑 3：`main.rs` 忘了存檔，QEMU 就跳到設定選單

直播時在 VSCode 改好了 `main.rs`，卻忘了存檔就去編譯。硬碟上的 `main.rs` 還是 `cargo new` 產生的 Hello world，開 QEMU 之後畫面不會停在我們的字，而是出現韌體的設定選單：

```
Select Language            <Standard English>
 ▸Device Manager
 ▸Boot Manager
 ▸Boot Maintenance Manager
   Continue
   Reset
```

奇怪的是 `cargo new` 產生的那支 Hello world 居然**編得過**。原因是 Rust 現在替 `x86_64-unknown-uefi` 準備了官方的 std：一般的 `println!` 會透過 UEFI 印字，所以 Hello world 真的有在 QEMU 裡印出來。只是印完 `main` 就結束了，韌體以為開機程式跑完，就回到設定選單，字一閃就不見了。

存檔（`Ctrl` + `S`）再跑一次就好了。VSCode 分頁上的檔名旁邊有一個白色圓點，就是「還沒存檔」的意思；怕忘記的話，可以在「檔案」選單打開「自動儲存」。

這個坑剛好說明了上面 `loop {}` 的用途。這個系列不用 UEFI 版的 std，因為之後我們會「接管」電腦、把 UEFI 關掉，到時候 std 就沒有人可以靠了，所以從一開始就用 `no_std`。

## 六、延伸

### 演練 1：多印幾行

```rust
println!("BlueBolt OS is booting...");
println!("Version {}", env!("CARGO_PKG_VERSION"));
println!("Gotta go fast!");
```

`env!("CARGO_PKG_VERSION")` 會在**編譯時**把 `Cargo.toml` 裡的版本號塞進來，所以會印出 `Version 0.1.0`。沒有作業系統也能用，因為它根本不是在執行時做的事。

### 演練 2：故意當機

把 `loop {}` 前面加兩行：

```rust
let number: Option<u32> = None;
number.unwrap();
```

重新跑一次，畫面會印出 panic 的訊息和行號：

```
[PANIC]: panicked at src\main.rs:15:12:
called `Option::unwrap()` on a `None` value
```

這就是 `panic_handler` 在做的事。10 秒後 QEMU 視窗會自己關掉，那是 `uefi` 的 panic handler 呼叫了關機；PowerShell 視窗（序列埠）裡的訊息會留著，可以慢慢看。看完記得把這兩行刪掉。

### 演練 3：用 log 印

直播最後也試了 `log`：

```rust
log::info!("Hello from log!");
log::warn!("This is a warning");
```

和 `println!` 不同，它會在前面加上等級和是哪個檔案第幾行印的：

```
[ INFO]:  src\main.rs@012: Hello from log!
[ WARN]:  src\main.rs@013: This is a warning
```

寫作業系統時會非常依賴 log 來找問題。

## 小複習

1. 按下電源後，韌體（現在幾乎都是 UEFI）會到磁碟的固定位置 `\EFI\BOOT\BOOTX64.EFI` 找開機程式來跑。
2. 編給 UEFI 要加編譯目標 `x86_64-unknown-uefi`，預設目標寫在 `.cargo\config.toml`，不是 `Cargo.toml`。
3. `#![no_std]` 不用標準函式庫、只用 core；`#![no_main]` 加上 `#[entry]` 自己指定起點。
4. 沒有 std，就要自己提供 panic handler；這一堂先用 `uefi` crate 的。
5. 開機程式 return 之後韌體會回到選單，所以用 `loop {}` 停住。
6. QEMU 可以把一個資料夾假裝成 FAT 磁碟（`fat:rw:esp`），韌體用 Windows 版 QEMU 附的 `edk2-x86_64-code.fd`。

## 下一堂預告：自己畫畫面、自己做字型

現在的字是 UEFI 幫我們畫的：我們只是說「請印這串字」。字型、畫面解析度、游標位置，都是韌體在管。

下一堂要拿回這些控制權：直接拿到**畫面緩衝區（framebuffer）**，一個像素一個像素自己畫，用 BlueBolt 的藍白黃黑配色畫出開機畫面，再自己做字型把字畫上去，順便自己寫 panic handler。

之後的順序預計是：畫面與字型 → 中斷與鍵盤 → 記憶體 → 排程器 → shell → 收集戒指遊戲。
