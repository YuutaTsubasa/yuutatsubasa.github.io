---
title: "程式設計入門，以 C/C++ 語言為例：#2 條件判斷 & 迴圈"
slug: c-course-02
date: "2021-08-17"
time: "21:31"
category: workshop
excerpt: "用 if else 與 switch 讓程式走不同的路，避開 = 與 ==、小數比較的陷阱，再用 while、for 重複做事，最後組出星星圖案與加總算式 — Vol. 10 的直播講義。"
tags: ["C", "C++", "程式設計入門", "條件判斷", "迴圈", "Workshop", "教學"]
stack: ["C", "Dev-C++"]
streams: [10]
links:
  - label: "範例程式碼（GitHub）"
    url: "https://github.com/YuutaTsubasa/C-C-Tutorial"
meta:
  status: "PUBLISHED"
  phase: "v1.0"
---

上一堂寫的程式只有一條路：輸入、運算、輸出，就像只有一條主線、沒有選項的遊戲。這份講義整理 Vol. 10 直播的內容，讓程式能**根據條件走不同的路**，也能**重複做同一件事**。直播的投影片參考台灣大學資訊系統訓練班的教材，下面的範例則是照直播內容重新整理的。沒看過上一堂的話，建議先讀 #1 的講義。

> 這是 2021 年 8 月的內容。工具一樣用 Dev-C++，換成其他 IDE 也可以，這裡教的語法跟工具沒有關係。

整場分成兩個部分：

1. **條件判斷**：`if`、`else`、`else if`、`switch`，以及幾個常見的陷阱
2. **迴圈**：`while`、`for`、`do while`、`break`、`continue`、巢狀迴圈

開始寫之前，一樣從骨架開始：到[範例程式碼](https://github.com/YuutaTsubasa/C-C-Tutorial)複製 `Code/c04.c`，把中間的 `printf` 刪掉再寫。如果瀏覽器的自動翻譯開著，複製到的程式碼會變成中文，記得先關掉。

## 一、條件判斷

### if 與 else

`if` 是「假如」，`else` 是「其他」。小括號裡放條件，成立就執行 `if` 的大括號，不成立就執行 `else` 的大括號：

```
if (條件) {
    條件成立時執行
} else {
    條件不成立時執行
}
```

不成立時沒有事要做，`else` 可以不寫。

### 實作：判斷及格

寫程式前可以先想流程，畫流程圖是很好的思考方式：

```
開始 → 輸入分數 → 分數大於等於 60？
                    ├ 是 → 輸出「及格」
                    └ 否 → 輸出「不及格」
```

也可以先用註解把步驟寫出來，再一段一段填上去。

```c
#include <stdio.h>

int main(){
    int score;

    printf("輸入分數：");
    scanf("%d", &score);

    if (score >= 60) {
        printf("及格\n");
    } else {
        printf("不及格\n");
    }

    printf("程式結束\n");
    return 0;
}
```

- 輸入 65 印出「及格」，輸入 55 印出「不及格」，剛好 60 也是及格。
- 第一個 `printf` 是給使用者的提示，不然畫面空空的，不知道要輸入東西。
- 不管走哪一邊，做完都會離開 `if` 結構，繼續往下執行，所以一定會印出「程式結束」，也一定會執行到 `return 0;`。
- 大括號的 `{` 要接在後面還是換行都可以，只是排版。

想知道「這樣寫會怎樣」，最簡單的方法就是**寫下去試試看**。

### if 怎麼判斷對錯

`score + 2` 是運算，會得到一個結果。比較也是一樣：`score >= 60` 也是運算，也有結果，還可以印出來。

```c
#include <stdio.h>

int main(){
    int score = 50;
    printf("%d\n", score + 2);    // 52
    printf("%d\n", score >= 60);  // 0：不對
    printf("%d\n", score < 60);   // 1：對
    return 0;
}
```

上一堂說過，C 用整數表示對錯。比較的結果是 1（對）或 0（錯），`if` 其實只是看小括號裡的**數值是不是 0**：

```c
#include <stdio.h>

int main(){
    if (1)    { printf("1 是對的\n"); }
    if (0)    { printf("這行不會印\n"); }
    if (100)  { printf("100 也是對的\n"); }
    if (-100) { printf("-100 也是對的\n"); }
    return 0;
}
```

**只有 0 是錯，其他數字都是對。** 平常不會這樣寫，寫 `score >= 60` 別人才看得懂你要判斷什麼。把分數 65 代進去想就是：65 有大於等於 60，得到 1，執行 `if` 那邊。

### 判斷範圍：不能連著寫

要判斷 `num` 是否介於 10 到 30 之間，數學習慣寫成 `10 <= num <= 30`，但在 C 裡這樣是錯的。比較運算跟加減法一樣**兩個兩個算**，所以 `num` 是 60 時：

```c
#include <stdio.h>

int main(){
    int num = 60;

    // 錯誤示範：先算 10 <= 60 得到 1，再算 1 <= 30 得到 1
    if (10 <= num <= 30) {
        printf("介於之間（錯了！）\n");
    }

    // 正確：寫成兩個條件，用 && 連起來
    if (10 <= num && num <= 30) {
        printf("介於之間\n");
    } else {
        printf("不在範圍內\n");
    }
    return 0;
}
```

編譯器會對錯誤示範那行提出警告，但程式還是能跑，而且結果是錯的。

### else if：多重條件

前一個條件不成立時，可以再判斷下一個，要加幾個都行，最後用 `else` 接住其他情況。

例如大學部 60 分及格、研究所 70 分及格：

```c
#include <stdio.h>

int main(){
    int type, score;

    printf("輸入學制（1 大學部、2 研究所）：");
    scanf("%d", &type);
    printf("輸入分數：");
    scanf("%d", &score);

    if (type == 1 && score >= 60) {
        printf("及格\n");
    } else if (type == 2 && score >= 70) {
        printf("及格\n");
    } else {
        printf("不及格\n");
    }
    return 0;
}
```

### 演練：判斷等第

輸入分數，依下表印出等第：

| 分數 | 等第 | 分數 | 等第 |
| --- | --- | --- | --- |
| 90–100 | A+ | 67–69 | C+ |
| 85–89 | A | 63–66 | C |
| 80–84 | A- | 60–62 | C- |
| 77–79 | B+ | 1–59 | F |
| 73–76 | B | 0 | X |
| 70–72 | B- | 其他 | 分數有誤 |

每個區間都是兩個條件，寫好一個後複製貼上改數字就好。`85 <= score` 和 `score >= 85` 是一樣的，看你習慣。

```c
#include <stdio.h>

int main(){
    int score;
    scanf("%d", &score);

    if (score >= 90 && score <= 100) {
        printf("A+\n");
    } else if (score >= 85 && score <= 89) {
        printf("A\n");
    } else if (score >= 80 && score <= 84) {
        printf("A-\n");
    } else if (score >= 77 && score <= 79) {
        printf("B+\n");
    } else if (score >= 73 && score <= 76) {
        printf("B\n");
    } else if (score >= 70 && score <= 72) {
        printf("B-\n");
    } else if (score >= 67 && score <= 69) {
        printf("C+\n");
    } else if (score >= 63 && score <= 66) {
        printf("C\n");
    } else if (score >= 60 && score <= 62) {
        printf("C-\n");
    } else if (score >= 1 && score <= 59) {
        printf("F\n");
    } else if (score == 0) {
        printf("X\n");
    } else {
        printf("分數有誤\n");
    }
    return 0;
}
```

直播踩到的陷阱：F 一開始寫成 `score <= 59`，結果輸入 0 印出 F 而不是 X。判斷是**由上而下**進行的，0 也小於等於 59，先被這個條件吃掉了，後面就輪不到。

有兩種改法：把 F 的條件改成 1 到 59（上面的寫法），或把 `score == 0` 的判斷移到前面。作法不只一種。

把特殊情況放在最前面先處理掉，也是常見的寫法。例如要做除法時先檢查除數是不是 0，是的話就顯示錯誤並結束；或是答案已知，就不用跑後面耗時的計算。

### switch case

判斷一個值**等於哪一種情況**時，可以用 `switch`：

```c
#include <stdio.h>

int main(){
    int n;
    scanf("%d", &n);

    switch (n) {
    case 1:
        printf("A\n");
        break;
    case 2:
        printf("B\n");
        break;
    case 3:
        printf("C\n");
        break;
    default:
        printf("D\n");
        break;
    }
    return 0;
}
```

輸入 1、2、3 分別印出 A、B、C，其他數字都印出 D（`default`）。

`switch` 可以想成**傳送點**：依照值傳送到對應的 `case`，然後從那裡**一路往下執行**，遇到 `break` 才離開。把前兩個 `break` 拿掉，輸入 1 就會印出 A、B、C，輸入 2 印出 B、C。這種穿過去的行為叫 **fall through**，算不算好寫法有很多討論。

例如做一個依選項計算的小工具：

```c
#include <stdio.h>

int main(){
    double a, b, ans = 0;
    int type;

    scanf("%lf%lf", &a, &b);
    printf("1 加、2 減、3 乘、4 除：");
    scanf("%d", &type);

    switch (type) {
    case 1:
        ans = a + b;
        break;
    case 2:
        ans = a - b;
        break;
    case 3:
        ans = a * b;
        break;
    case 4:
        ans = a / b;
        break;
    default:
        printf("沒有這個功能\n");
        return 0;
    }

    printf("%lf\n", ans);
    return 0;
}
```

`switch` 都能用 `if else` 改寫，第一個例子等於：

```c
#include <stdio.h>

int main(){
    int n;
    scanf("%d", &n);

    if (n == 1) {
        printf("A\n");
    } else if (n == 2) {
        printf("B\n");
    } else if (n == 3) {
        printf("C\n");
    } else {
        printf("D\n");
    }
    return 0;
}
```

### 陷阱一：= 和 == 不一樣

判斷相等要用**兩個等號**，少打一個是最常犯的錯，而且程式還是跑得動。

- `n == 99`：比較，結果是 1 或 0。
- `n = 99`：把 99 存進 `n`，**整個運算的結果是存進去的值** 99。

```c
#include <stdio.h>

int main(){
    int n = 12;
    printf("%d\n", n == 99);   // 0：12 不等於 99
    printf("%d\n", n = 99);    // 99：n 被蓋掉了
    printf("%d\n", n);         // 99
    return 0;
}
```

所以把判斷寫錯，就會出現很離奇的狀況：

```c
#include <stdio.h>

int main(){
    int n;
    scanf("%d", &n);

    if (n = 1) {            // 錯誤示範：應該寫 n == 1
        printf("A\n");
    } else if (n == 2) {
        printf("B\n");
    } else {
        printf("D\n");
    }

    printf("n 的值是 %d\n", n);
    return 0;
}
```

輸入什麼都印出 A，而且 `n` 永遠變成 1。因為 `n = 1` 的結果是 1，對 `if` 來說永遠是對的。

遇到看不懂的狀況，就**把值印出來看**。聊天室有一句話講得很好：程式是照你寫的跑，不是照你想的跑。

### 陷阱二：小數不要直接比較

```c
#include <stdio.h>

int main(){
    double a = 0.1, b = 0.2;

    if (a + b == 0.3) {
        printf(":)\n");
    } else {
        printf(":(\n");
    }
    return 0;
}
```

結果是哭臉。1/3 寫成小數是 0.333…，永遠寫不完；電腦用另一套表示法（二進位）存數字，也有表示不出來的數值，而且只能存有限的位數，所以會有誤差。

0.1 + 0.2 實際算出來大約是 `0.30000000000000004`，把上面的 0.3 換成這個數字，就會變成笑臉。平常用 `%lf` 印到小數點後 6 位是看不出來的。

整數頂多遇到存不下，小數則要注意誤差。比較簡單的做法是看兩數的**差距**有沒有落在可以接受的誤差內：

```c
#include <stdio.h>

int main(){
    double a = 0.1, b = 0.2;

    if ((a + b - 0.3 < 0.0000001) && (a + b - 0.3 > -0.0000001)) {
        printf(":)\n");
    } else {
        printf(":(\n");
    }
    return 0;
}
```

這不是萬用的正確解，這個範圍必須小到不影響你的計算才能用。金流、倉儲這類系統還會用其他方式存數字。如果平常用不太到小數，先記得「這裡有個原因」就好。

### 一點學習心得

- 不用背，也不用每次從頭打。**複製貼上再改成你要的**，等到自己打比較快時，自然就會打了。
- 書上寫的都是正確的樣子，但很多東西要自己改錯看看才學得到。例如把 `if` 的條件改成數字，看看會發生什麼事。
- 有問題就問，或把值印出來看。工程師大部分時間都在 debug。

## 二、迴圈

要印 10 個笑臉可以複製 10 行，100 個也可以再複製，但看起來很蠢。既然都寫程式了，應該讓程式重複做。

### while

`while` 長得跟 `if` 很像，條件成立才進去；差別是**做完會回來再判斷一次**，成立就再做一次。

如果寫 `while (n < 10) { printf(":)\n"); }` 而 `n` 不變，條件永遠成立，就會印個沒完。所以迴圈裡一定要讓某個東西改變，讓條件有一天不成立：

```c
#include <stdio.h>

int main(){
    int n;
    scanf("%d", &n);

    while (n < 10) {
        printf(":)\n");
        n++;
    }
    return 0;
}
```

輸入 8 會印兩個笑臉：8 變 9、9 變 10，10 沒有小於 10，離開迴圈。

### 用變數控制次數

通常會多用一個變數記錄跑了幾次，慣例叫 `i`。下面的 `n` 是想要的總次數：

```c
#include <stdio.h>

int main(){
    int n, i = 0;
    scanf("%d", &n);

    while (i < n) {
        printf(":)\n");
        i++;
    }
    return 0;
}
```

不知道要跑幾次時也適合用 `while`，例如一直輸入，直到輸入 0 才結束：

```c
#include <stdio.h>

int main(){
    int i = 1;

    while (i != 0) {
        scanf("%d", &i);
        printf("你輸入了 %d\n", i);
    }
    return 0;
}
```

### for

控制次數的三件事（初始值、條件、每次做完要改變什麼）分散在各處，`for` 把它們集中在一行，用兩個分號隔開：

```c
#include <stdio.h>

int main(){
    int n, i;
    scanf("%d", &n);

    for (i = 0; i < n; i++) {
        printf(":) %d\n", i);
    }
    return 0;
}
```

輸入 5 會印出 5 個笑臉，`i` 依序是 0、1、2、3、4，因為要做完一次才會加 1。這段跟上面的 `while` 是等價的。

- **已知要跑幾次**：通常用 `for`。
- **不知道要跑幾次**，只有條件：通常用 `while`。

既然每次的 `i` 都拿得到，就能拿來計算。例如 1 加到 100：

```c
#include <stdio.h>

int main(){
    int i, sum = 0;

    for (i = 1; i <= 100; i++) {
        sum += i;
    }
    printf("%d\n", sum);   // 5050
    return 0;
}
```

這題其實有公式 `(1 + 100) * 100 / 2`，有公式的話就不用加 100 次。這裡只是示範迴圈能怎麼用 `i`。

### do while

`do while` 先做一次，再判斷要不要繼續，所以**至少跑一次**。比較少見，看得懂就好。注意最後有分號。

```c
#include <stdio.h>

int main(){
    int i;

    do {
        scanf("%d", &i);
        printf("你輸入了 %d\n", i);
    } while (i != 0);
    return 0;
}
```

### break 與 continue

- `break`：直接**離開**迴圈（跟 `switch` 的 `break` 很像）。
- `continue`：跳過**這一次**剩下的內容，進入下一次。

`while (1)` 跟 `if (1)` 一樣，條件永遠成立，形成**無窮迴圈**，要靠 `break` 離開：

```c
#include <stdio.h>

int main(){
    int i;

    while (1) {
        scanf("%d", &i);
        if (i == 0) {
            break;
        }
        printf("你輸入了 %d\n", i);
    }
    return 0;
}
```

假設電梯從 1 樓到 10 樓，這棟大樓沒有 4 樓：

```c
#include <stdio.h>

int main(){
    int i;

    for (i = 1; i <= 10; i++) {
        if (i == 4) {
            continue;
        }
        printf("樓層 %d\n", i);
    }
    return 0;
}
```

`for` 遇到 `continue` 時仍會執行 `i++`，所以會接著到 5 樓。

`if` 裡只有一行時可以省略大括號，直播的投影片為了放得下就這樣寫，但**盡量不要**。沒有大括號就很難看出哪一行在 `if` 裡面，Apple 也曾因為這樣出過 bug。

### 實作：可以重複判斷的成績程式

之前的程式判斷一次就結束，這裡剛好適合用 `do while`：至少做一次，做完問要不要繼續。

```c
#include <stdio.h>

int main(){
    int score, again;

    do {
        printf("輸入成績：");
        scanf("%d", &score);

        if (score >= 60) {
            printf("及格\n");
        } else {
            printf("不及格\n");
        }

        printf("要繼續嗎？要的話請輸入 1：");
        scanf("%d", &again);
    } while (again == 1);

    return 0;
}
```

把要重複的部分放進大括號後，用 Tab 縮排（Shift + Tab 縮回來），比較看得出範圍。

直播原本想輸入字元 `y`（用 `char`、`%c`，判斷 `c == 'y'`，字元要用單引號），但程式會直接跳過輸入。字元的輸入比較麻煩，留到之後講字元與字串時再解釋，所以先改成輸入數字。

### 巢狀迴圈

迴圈裡可以再放迴圈：

```c
#include <stdio.h>

int main(){
    int i, j;

    for (j = 0; j < 3; j++) {
        for (i = 0; i < 2; i++) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}
```

```
**
**
**
```

看懂的方法是**從裡面拆開**：內層迴圈做的事就是「印兩顆星星」，加上換行就是一行；外層要把這件事做 3 次。所以總共 3 × 2 = 6 次 `printf("*")`。

### 星星三角形

第一行一顆、第二行兩顆，到第 n 行 n 顆。外層控制行數，所以內層的次數要跟著行數 `j` 變：

```c
#include <stdio.h>

int main(){
    int n, i, j;
    scanf("%d", &n);

    for (j = 1; j <= n; j++) {
        for (i = 1; i <= j; i++) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}
```

內層如果寫 `i <= n`，每一行都會印 n 顆。寫成從 1 開始的 `j <= n` 比較好懂，用 `0` 和 `<` 也可以。其他圖案的差別就在這些地方要填什麼，可以自己推敲看看。

### 演練：印出 1+2+3+4+5=15

輸入 n，印出算式和總和。加總用 `sum += i` 就好，難的是**最後一個數字後面要接等號**，不是加號。所以先印數字，再判斷這是不是最後一個：

```c
#include <stdio.h>

int main(){
    int n, i, sum = 0;
    scanf("%d", &n);

    for (i = 1; i <= n; i++) {
        sum += i;
        printf("%d", i);
        if (i == n) {
            printf("=");
        } else {
            printf("+");
        }
    }
    printf("%d\n", sum);
    return 0;
}
```

輸入 5 會印出 `1+2+3+4+5=15`。

## 小複習

1. `if` 看小括號裡的數值，0 是錯，其他都是對；比較的結果是 1 或 0。
2. 判斷範圍要寫成兩個條件，用 `&&` 連起來。
3. `else if` 由上而下判斷，前面符合了後面就不看。
4. `switch` 像傳送點，沒有 `break` 就會一路往下。
5. 判斷相等是 `==`；小數不要直接用 `==` 比較。
6. `while` 做完會回去再判斷一次，迴圈裡要讓條件有一天不成立。
7. 已知次數用 `for`，未知次數用 `while`；`break` 離開，`continue` 跳過這一次。
8. 巢狀迴圈從內層拆開看：內層在做什麼，外層做幾遍。

## 作業

用 1 到 9 的巢狀迴圈印出**九九乘法表**，或把今天的演練（判斷等第、星星三角形、印出加總算式）做出來，截圖發到 Twitter，加上 tag **#悠太作業**。
