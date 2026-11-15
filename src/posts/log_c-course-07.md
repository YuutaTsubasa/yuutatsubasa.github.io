---
title: "程式設計入門，以 C/C++ 語言為例：#7 結構"
slug: c-course-07
date: "2021-09-28"
time: "21:30"
category: workshop
excerpt: "一個學生有名字、年齡、血型、三科成績，分開記要六個變數、兩個學生就要六個陣列：用 struct 把它們包成自己的型態，學會初始化、用 . 取成員、結構陣列和結構指標的 ->，再用 typedef 把名字縮短；最後用 malloc 修好陣列越界的及格名單，補充一個會自己呼叫自己的函式：遞迴與費氏數列 — Vol. 29 的直播講義。"
tags: ["C", "C++", "程式設計入門", "結構", "typedef", "遞迴", "Workshop", "教學"]
series: c-course
ep: 7
stack: ["C", "Dev-C++"]
streams: [29]
links:
  - label: "範例程式碼（GitHub）"
    url: "https://github.com/YuutaTsubasa/C-C-Tutorial"
meta:
  status: "PUBLISHED"
  phase: "v1.0"
---

這份講義整理 Vol. 29 直播的內容：**結構**。上一堂講完函式之後，課程停了一週，所以離上次上課有點久了。今天要講的東西不多，概念只有一個：**把好幾個不同型態的資料，包成一種自己定義的型態。** 沒看過前面幾堂的話，建議先讀 #1 到 #6 的講義，今天會用到陣列、字串、指標、`malloc` 和函式。

> 這是 2021 年 9 月的內容。工具一樣用 Dev-C++，換成其他 IDE 也可以，這裡教的語法跟工具沒有關係。

今天一樣先寫程式，看到問題之後再回到簡報講解。整場分成幾個部分：

1. **沒有結構的時候**：記一個學生的資料就要六個變數
2. **結構**：定義、初始化、用 `.` 取成員、結構陣列、當函式的引數
3. **結構指標**：`(*ptr).age` 和簡寫 `ptr->age`
4. **typedef**：把太長的型態名字縮短，以及大括號後面為什麼有分號
5. **複習範例**：及格名單、陣列越界、改用 `malloc` 和 `free`
6. **補充：遞迴**：用費氏數列看函式自己呼叫自己

## 一、沒有結構的時候：記一個學生的資料

### 一個學生要六個變數

假設你是學校的老師或主任，想記錄一個學生的資料。學生的資料可能有：

- **姓名**：一個字串，所以用字元陣列，給它長一點，100 格。
- **年紀**：一個整數。
- **血型**：有 A、B、O、AB 四種。
- **成績**：國文、數學、英文三科。

血型要怎麼記？直覺可能是用一個字元，A 就是 A、B 就是 B。但 AB 型剛好是兩個字，一個字元記不下來，還得用字串，有點麻煩。像這種**選項很固定**的東西，通常用比較簡單的方式記：就像電腦用數字對照一張表來記文字，我們也建一張表，用一個整數 `blood` 記血型：

| 數字 | 血型 |
| --- | --- |
| 0 | A |
| 1 | B |
| 2 | O |
| 3 | AB |

例子裡的學生叫 Sonic。音速小子是 1991 年誕生的，今年（2021）剛好 30 週年，所以他 30 歲。不知道音速小子是什麼血型，就隨便給他 B 型；國文 80、數學 50 不及格、英文比較好，95。

資料很多，印出來的部分就寫成一個函式 `printStudent`。它只是印東西，不用回傳值，所以是 `void`。問題來了：要印一個學生，它需要名字、年齡、血型、三科成績，**引數就要六個**。

```c
#include <stdio.h>

// 血型用數字記：0 = A、1 = B、2 = O、3 = AB
void printStudent(char name[], int age, int blood,
                  int chineseScore, int mathScore, int englishScore){
    char bloodTable[4][5] = {"A", "B", "O", "AB"};     // 血型轉換表

    printf("學生 %s（%d 歲），血型為 %s 型\n", name, age, bloodTable[blood]);
    printf("國文成績 %d，數學成績 %d，英文成績 %d\n",
           chineseScore, mathScore, englishScore);
}

int main(){
    char name[100] = "Sonic";
    int age = 30;
    int blood = 1;              // B 型
    int chineseScore = 80;
    int mathScore = 50;
    int englishScore = 95;

    printStudent(name, age, blood,
                 chineseScore, mathScore, englishScore);
    return 0;
}
```

```
學生 Sonic（30 歲），血型為 B 型
國文成績 80，數學成績 50，英文成績 95
```

幾個小地方：

- **血型轉換表**：要把 0、1、2、3 印成 A、B、O、AB，可以用之前學過的 `if else`，這裡用另一個做法：一個二維陣列 `bloodTable`（table 是表格的意思）。四種血型，每個字串最多兩個字，給它 5 格就夠。`blood` 存的是 1，`bloodTable[1]` 就是字串 `"B"`。
- 引數太多時，可以在逗號的地方**換行**，讓它好看一點。
- 不一定要用一個 `printf` 把所有東西印完，可以**分段**寫好幾個；想換行的地方加 `\n`。

但不管怎麼排，為了印一個學生，定義要寫六個引數，呼叫時也要帶六個值，還是很麻煩。

### 兩個學生：每個欄位都變成陣列

那如果要記**兩個**學生呢？名字要兩個、年紀要兩個、血型要兩個、三科成績也都要兩個，每一個欄位都要變成陣列。第二個學生是 Tails：28 歲、O 型，國文比較差 75，數學很好 98，英文 92。

```c
#include <stdio.h>

void printStudent(char name[], int age, int blood,
                  int chineseScore, int mathScore, int englishScore){
    char bloodTable[4][5] = {"A", "B", "O", "AB"};

    printf("學生 %s（%d 歲），血型為 %s 型\n", name, age, bloodTable[blood]);
    printf("國文成績 %d，數學成績 %d，英文成績 %d\n",
           chineseScore, mathScore, englishScore);
}

int main(){
    // 兩個學生：每一個欄位都要變成兩格的陣列
    char name[2][100] = {"Sonic", "Tails"};
    int age[2] = {30, 28};
    int blood[2] = {1, 2};              // B 型、O 型
    int chineseScore[2] = {80, 75};
    int mathScore[2] = {50, 98};
    int englishScore[2] = {95, 92};
    int i;

    for (i = 0; i < 2; i++) {
        // 每個引數都要記得帶同一個編號，帶錯一個就印錯
        printStudent(name[i], age[i], blood[i],
                     chineseScore[i], mathScore[i], englishScore[i]);
    }
    return 0;
}
```

```
學生 Sonic（30 歲），血型為 B 型
國文成績 80，數學成績 50，英文成績 95
學生 Tails（28 歲），血型為 O 型
國文成績 75，數學成績 98，英文成績 92
```

印第一個人，要把每個欄位的 0 號帶進去；印第二個人，要全部換成 1 號。編號是整數，所以可以用 `for` 迴圈讓 `i` 從 0 跑到 1，稍微方便一點。

這些都是之前學過的東西：陣列、字元和字串、整數、迴圈、函式。但你會發現：**明明只是要第二個學生，所有欄位卻都要變成陣列，傳的時候還要記得編號不能傳錯。** 這是因為學生的資料是一組**聚合的資料**，裡面有不同型態的東西（字串、整數）。有沒有辦法定義出一種型態，就叫「學生」，跟它說我要一個學生，它就幫我把這六個值都準備好？

## 二、結構：自己定義一種型態

### 定義 struct

這就是今天要講的**結構**。像字元、整數，都是 C 幫你定義好、最基本的資料型態；結構可以讓你把這些東西**組裝起來**，形成自己的型態。

定義結構用 **`struct`**，它是 structure（結構）的簡寫。我們要定義的是學生，裡面該有什麼？照剛剛的欄位寫：名字（100 個字）、年齡、血型、三科成績。

```c
#include <stdio.h>

// 定義一種新的型態：學生
struct student {
    char name[100];
    int age;
    int blood;                  // 0 = A、1 = B、2 = O、3 = AB
    int chineseScore, mathScore, englishScore;
};

void printStudent(struct student student){
    char bloodTable[4][5] = {"A", "B", "O", "AB"};

    printf("學生 %s（%d 歲），血型為 %s 型\n",
           student.name, student.age, bloodTable[student.blood]);
    printf("國文成績 %d，數學成績 %d，英文成績 %d\n",
           student.chineseScore, student.mathScore, student.englishScore);
}

int main(){
    // 照 struct 裡成員的順序，用大括號把值填進去
    struct student students[2] = {
        {"Sonic", 30, 1, 80, 50, 95},
        {"Tails", 28, 2, 75, 98, 92}
    };
    int i;

    for (i = 0; i < 2; i++) {
        printStudent(students[i]);  // 一次把整個學生交給函式
    }
    return 0;
}
```

執行結果跟剛剛**一模一樣**，但省掉了很多麻煩。

### 宣告結構變數和初始化

定義好之後，**`struct student`** 就是一種你自己定義的型態，用起來就像 `int`、`char`。前面一定要加 `struct`，因為這是你自己定義的，要讓編譯器知道，不然它看不懂 `student` 是什麼。

`struct student students[2]` 的意思是：宣告一個陣列，叫 `students`（因為有兩個學生，所以用複數），每一格都是一個 `struct student`。

初始化一樣用**大括號**，**照你在 struct 裡定義的順序**把值填進去：名字、年齡、血型、國文、數學、英文。因為是陣列，外面再包一層大括號，裡面分別是第一個學生和第二個學生。每個值代表什麼，就去看 `struct student` 的定義。

本來每一個欄位都要寫「兩個、兩個、兩個」，現在只要說 `student` 要兩個，然後分別是這樣跟這樣，就好了。光定義一個東西，就有了六個欄位。

### 用 . 拿裡面的成員

`printStudent` 的六個引數全部拿掉，只要一個：型態是 `struct student`、名字叫 `student` 的變數。要拿裡面的東西，就用**點**：`student.name` 是這個學生的名字、`student.age` 是這個學生的年齡、`bloodTable[student.blood]` 是他的血型……

呼叫時也只要帶一個值：`printStudent(students[i])`，把第 `i` 個學生整個交給函式。

### 為什麼要有結構

實際的程式常常要一次處理很多資料。例如一個遊戲裡的角色，可能有攻擊力、防禦力、敏捷力、名稱、年齡、描述，這些資料總不能都分散在外面，所以會先把它們包成一種叫「角色」的型態，再用這個型態把遊戲裡所有角色都生出來。這是未來會很常用的技巧，也是結構最大的意義。

結構還有一個方便的地方。上一堂講過，**函式只能回傳一個值**。如果想回傳很多值，可以把它們包在結構裡，回傳整個結構。直播把這個留給大家自己試試看。

## 三、簡報整理

### 什麼時候用結構

原本的基本資料型態，拿來用時常常不夠。像剛剛的學生，三個、六個屬性其實是**同一筆資料**的不同屬性，但要兩個、三個、四個學生時，每個屬性都要個別去定義要幾個，很麻煩。所以先自己定義出一種資料型態，再用它去定義要幾個。

也就是：**當資料要做群組化管理的時候**，就用結構。遊戲角色的攻擊力、防禦力、敏捷力、名字、年齡、描述，分開記很麻煩，先包成「角色」，再說要幾個角色，每個角色裡面都有自己的攻擊力、防禦力可以設定。

### 定義的語法

```
struct 結構名稱 {
    成員;
    成員;
    ...
};
```

- 結構名稱（簡報上叫 tag，標籤）就是你制定的這種新型態的名字。
- 成員（member）可以是之前看過的基本型態：整數、浮點數、字元；也可以是**陣列**，甚至**指標**；甚至可以先定義一種結構，再定義第二種結構，裡面用第一種結構的資料。

用這個型態宣告出來的變數，簡報上叫**結構實體**，把它想成一個「結構的變數」就好。型態的名字是 **`struct` 加上你取的名稱**，例如 `struct student`，後面再寫變數的名字。初始化時，照定義的順序給值。取用裡面的成員，就用 `.`。

### 結構在記憶體裡的樣子

簡報的例子是一個「人」：名字 80 個字、身高、體重。

```c
#include <stdio.h>

struct person {
    char name[80];
    int height;
    int weight;
};

int main(){
    struct person p1;
    struct person *ptr = &p1;           // 結構指標：存 p1 的位置

    scanf("%79s", p1.name);             // name 是陣列，本身就是位置，不用 &
    scanf("%d", &p1.height);            // height 是整數，要用 & 給位置
    scanf("%d", &ptr->weight);          // 透過指標也可以：ptr->weight 就是 p1.weight

    printf("%s 身高 %d 公分，體重 %d 公斤\n", p1.name, p1.height, ptr->weight);
    printf("一個 struct person 佔 %d bytes\n", (int)sizeof(struct person));
    return 0;
}
```

輸入 `Sonic 100 35`：

```
Sonic 身高 100 公分，體重 35 公斤
一個 struct person 佔 88 bytes
```

一個 `struct person` 的變數，在記憶體裡包含名字、身高、體重各自佔的大小，加起來就是這個人實際的大小。想知道它到底多大，可以用之前講過的 `sizeof` 讓程式自己算。這裡是 80 + 4 + 4 = 88 bytes。（直播說這個比較細節，沒有多談。成員之間有時候會補空位，總大小不一定剛好是每個成員相加，所以交給 `sizeof` 算就對了。）

結構的成員，就當成一般的變數來用：`p1.name` 是一個字元陣列，`p1.height` 是一個整數。所以輸入時，`p1.name` 不用加 `&`，`p1.height` 要加。簡報上的字串前面多打了一個 `&`，那是打錯了，字串不需要 `&`。

結構也可以變成陣列，用法就是「第幾個人的名字」「第幾個人的身高」。簡報上輸入名字用的是 `gets`，跟 `scanf` 不同，它可以讀進有空白的整行字串。

> 補充：`gets` 不會檢查陣列有多大，輸入太長就會寫到陣列外面，所以 C11 已經把它從標準拿掉了，新的編譯器可能會給警告或直接不能用。要讀整行的話，可以改用 `fgets`。上面的範例照前幾堂的習慣用 `scanf("%79s", ...)`，限制最多讀 79 個字。

### 結構指標

結構也是一種變數，它也存在記憶體的某個位置上，所以它的位置也可以存進**結構指標**。上面範例的 `struct person *ptr = &p1;` 就是這樣，用 `&` 拿到 `p1` 的位置，存進指標。

用指標的時候，**不能直接用點**。指標裡存的是記憶體位置，要先用 `*` 把位置轉回那個變數，才能拿裡面的值，所以本來要寫成 `(*ptr).weight`。這有一個簡寫：**`ptr->weight`**，用一個箭頭就能拿到裡面的東西。下一節實際試給你看。

## 四、結構指標與 ->

回到學生的例子。宣告一個指標，記得**宣告時的 `*`** 代表「我要宣告一個指標」。指標就是存記憶體位置的變數，它也是一種變數，只是存的是位置。

想知道 `students[0]` 存在記憶體的哪裡？對它做 `&` 就知道了，把這個位置存進指標。

```c
#include <stdio.h>

struct student {
    char name[100];
    int age;
    int blood;
    int chineseScore, mathScore, englishScore;
};

int main(){
    struct student students[2] = {
        {"Sonic", 30, 1, 80, 50, 95},
        {"Tails", 28, 2, 75, 98, 92}
    };
    struct student *ptr = &students[0];     // 存第一個學生的位置

    printf("%d\n", (*ptr).age);         // 先用 * 轉回那個學生，再用 . 拿年紀
    printf("%d\n", ptr->age);           // * 加 . 的簡寫：箭頭
    printf("%d\n", students->age);      // &students[0] 代換下去就是 students
    printf("%d\n", (&students[1])->age);    // 第二個學生的位置
    return 0;
}
```

```
30
30
30
28
```

一行一行看：

1. **`(*ptr).age`**：`*` 和 `&` 是**相反的運算**。`&` 拿到變數的記憶體位置，`*` 把記憶體位置轉回上面存的那個變數。`ptr` 是 `&students[0]`，所以 `*ptr` 就是 `students[0]`，再用 `.age` 拿到年紀 30。括號不能省，要先做 `*` 再做 `.`。
2. **`ptr->age`**：又要 `*` 又要點很麻煩，所以 C 給了一個比較**具象**的簡寫：它不是指標嗎？那就給它一個箭頭。箭頭是**減號加大於**組成的 `->`，意思是「這個指標所指的那個學生的 `age`」，一樣是 30。至於為什麼用箭頭？就是 C 語言的作者覺得這樣比較好看。你自己做一個程式語言，也可以自己決定符號要做什麼。
3. **`students->age`**：之前講過，陣列的**中括號**其實是**加法加 `*`** 的簡寫，`students[0]` 就是 `*(students + 0)`。把 `&students[0]` 拆開來，就是 `&*(students + 0)`，`&` 和 `*` 抵消，加 0 也等於沒加，**代換到最後竟然就是 `students`**。`students` 是陣列，陣列名稱就是開頭的記憶體位置，也就是第一個學生的位置，所以這樣寫也是對的，一樣印出 30。記得之前那些公式的話，自己代換一下，會發現這件很奇妙的事。
4. **`(&students[1])->age`**：要第二個人的位置，就沒辦法像剛剛那樣簡寫了，寫成 `&students[1]`，印出 28，是 Tails 的年齡。

所以：**`*` 加點可以簡寫成箭頭**，就跟之前講過的「`*` 加加法可以簡寫成中括號」一樣。

## 五、typedef

### 把太長的型態名字縮短

`typedef` 先不從 struct 講起。第一堂講變數型態時提過，`short`、`long` 都是 `int` 的一種，它們都有一個**不存負號**的版本，前面加 `unsigned`。原本的記憶體大小要存一半負數、一半正數；不存負號的話，正數就可以存到兩倍大。

但這些名字實在太長了：`unsigned char`、`unsigned short`、`unsigned long`，每次宣告都要打這麼多字。**`typedef` 可以把很長的型態名字說成一個字**，之後用這個字就等於用原本的型態：

```c
#include <stdio.h>

typedef unsigned short ushort;      // 之後寫 ushort 就等於寫 unsigned short
typedef unsigned long ulong;

int main(){
    ushort a = 65535;               // 不存負號，正數可以存到兩倍大
    ulong b = 4000000000UL;

    printf("%hu %lu\n", a, b);
    return 0;
}
```

印出 `65535 4000000000`。（`ushort`、`ulong` 是這裡自己取的名字，取什麼都可以。）

### typedef 一個 struct

`struct student` 也很長，每次宣告都要寫 `struct student`。一樣可以用 `typedef` 把它縮短，例如就叫 `student`：

```c
#include <stdio.h>

struct student {
    char name[100];
    int age;
};

typedef struct student student;     // 把 struct student 簡寫成 student

int main(){
    student s = {"Sonic", 30};      // 不用再寫 struct 了

    printf("%s %d\n", s.name, s.age);
    return 0;
}
```

印出 `Sonic 30`。`typedef struct student student;` 看起來有點怪，前後都是 `student`，但這是可以的：意思是把 `struct student` 這整個型態，簡寫成 `student` 一個字。之後宣告就不用再寫 `struct` 了。

（這一節的範例為了簡短，學生只留名字和年齡兩個成員。）

### 為什麼大括號後面要分號

你可能注意到一件奇怪的事：定義 struct 的**大括號後面竟然有分號**。`for` 迴圈、`while` 迴圈的大括號後面都沒有分號，為什麼這裡要？

因為 struct 的定義**原本後面可以直接宣告變數**：

```c
#include <stdio.h>

// 定義 struct student 的同時，順便宣告一個變數 a
// 就像 int a; 只是 int 換成了一整段 struct 的定義
struct student {
    char name[100];
    int age;
} a = {"Sonic", 30};

int main(){
    struct student b = {"Tails", 28};   // 之後一樣可以拿它宣告別的變數

    printf("%s %d\n", a.name, a.age);
    printf("%s %d\n", b.name, b.age);
    return 0;
}
```

```
Sonic 30
Tails 28
```

整個語法其實跟 `int a;` 是一樣的，只是 `int` 換成了一整坨。本來宣告一個整數變數就是 `int a;`；現在要宣告一個 `struct student` 的變數，可是你還沒告訴編譯器 `student` 長什麼樣子，所以要先在大括號裡說它長什麼樣子，再接著宣告 `a`。

不過定義 struct 本身就是一個動作，很多時候我們只是想說「學生裡面有什麼」，不一定想馬上宣告變數，所以會**省略後面宣告變數的部分**。省略的是變數，分號還是留著，這就是大括號後面有分號的原因。

### 把 typedef 合進定義裡

既然定義 struct 時後面可以接東西，那 `typedef` 能不能也合進來？可以：

```c
#include <stdio.h>

// 定義 struct student，同時把它 typedef 成 student
typedef struct student {
    char name[100];
    int age;
} student;

int main(){
    student s = {"Sonic", 30};
    struct student t = {"Tails", 28};   // struct student 這個名字也還在

    printf("%s %d\n", s.name, s.age);
    printf("%s %d\n", t.name, t.age);
    return 0;
}
```

```
Sonic 30
Tails 28
```

原本是 `typedef struct student student;`，現在把 `struct student` 的內容直接寫在中間，兩行就合成一個了。

再更進一步：前面的 struct **連名字都不要了**，直接說它就是一個 struct，然後把這個 struct `typedef` 成 `student`：

```c
#include <stdio.h>

// struct 連名字都不取，直接 typedef 成 student（最常見的寫法）
typedef struct {
    char name[100];
    int age;
} student;

int main(){
    student s = {"Sonic", 30};      // 這裡不能寫 struct student，因為沒有那個名字

    printf("%s %d\n", s.name, s.age);
    return 0;
}
```

印出 `Sonic 30`。這時就**不能**再寫 `struct student` 了，因為已經沒有 `struct student` 這個名字，只有 `typedef` 出來的 `student`。

這些寫法都是照剛剛的語法代換、合併出來的，都對。**最常見的是最後這一種**：不用 `struct student` 這種比較冗長的方式，直接把整個 struct `typedef` 成一個名字，之後就用這個名字。在別人的程式碼裡，你看到的多半是這種寫法。

結構的部分大概就到這裡。今天的簡報很短，一個小時以內就講完了。

## 六、休息聊天：C 和 C++ 影響了哪些語言

結構很好用，做資料處理、遊戲角色、學生資料，各種要群組化的資料都可以這樣包。在結構的基礎上再延伸下去，就是常聽到的**物件導向程式設計**。這個系列課程的後半會講物件導向的概念，但不會講詳細的設計方法。

聊天室問到遊戲引擎用什麼語言：

- **Unreal** 的 Game Engine 用的是 **C++**。
- **Unity** 用的是 **C#**，它是受 C 和 C++ 影響而生出來的語言，更強調物件導向的結構。想學 Unity 的話，先了解 C 和 C++ 不是壞事，之後接 C# 會比較順。

C 和 C++ 影響了後來一大堆程式語言：

- 長得很像的：**Java**、**C#**。
- 寫法沒那麼像，但很多地方還是受到影響的：**Ruby**、**Python**。
- 近期很有名的現代語言 **Kotlin**、**Rust**、**Go**，基本上也都有 C 和 C++ 的影子。

原因是 C 語言出來的時候，讓整個程式設計圈引起了很大的震撼。那個時代寫程式很麻煩，C 是第一個讓這些事情變得很簡化的語言。用現在的角度看它還是很麻煩，但在當時是很神的語言，成為主流之後，大家就從這個主流語言繼續往後改進。

當然不是所有語言都是 C 和 C++ 衍生出來的。例如 **LISP** 屬於**函式型程式設計**的語言，它的發展跟 C 和 C++ 就沒有那麼大的關聯。不過程式語言之間都會互相影響。對程式語言有興趣的話，可以多看幾個，你應該會開始有「這個跟 C 好像，我好像學過」的既視感。

## 七、複習範例：及格名單

### 不用背，複製舊程式來改

用另一個例子再複習一次。寫新程式時，**真的不用去背**：複製一份之前寫過的程式，砍掉不要的部分，把中間挖空，就開始寫了。很多人覺得一開始打不出來就不能寫程式，不是這樣的，沒有人一開始在背，這又不是考試，重點是能寫出東西。程式就是填空格。

### 讓使用者輸入學生，印出及格的人

這次的學生簡單一點，只有三個資料：名字、年齡、成績。用剛剛學到的 `typedef struct` 定義。先準備一個 100 個學生的陣列，讓使用者輸入有幾個學生，再一個一個輸入資料，最後印出及格的人：

```c
#include <stdio.h>

typedef struct {
    char name[100];
    int age;
    int score;
} student;

int main(){
    student students[100];
    int n, i;

    printf("輸入學生人數：");
    scanf("%d", &n);                // 要存進 n，所以給 n 的位置

    for (i = 0; i < n; i++) {
        printf("輸入學生 %d 的名字：", i);
        scanf("%99s", students[i].name);    // 名字是陣列，本身就是位置
        printf("輸入學生 %d 的年齡：", i);
        scanf("%d", &students[i].age);
        printf("輸入學生 %d 的成績：", i);
        scanf("%d", &students[i].score);
    }

    printf("及格名單：\n");
    for (i = 0; i < n; i++) {
        if (students[i].score >= 60) {
            printf("%s\n", students[i].name);
        }
    }
    return 0;
}
```

輸入學生人數 `3`，再依序輸入 `Sonic 30 50`、`Tails 28 95`、`Amy 26 60`，最後會印出：

```
及格名單：
Tails
Amy
```

（直播上 Sonic 只說「可能沒有及格」，這裡隨便給他 50 分。）

- 為什麼 `n` 要加 `&`？因為 `scanf` 要把輸入的東西存進這個變數，它需要的是**記憶體位置**。
- 為什麼名字**不用** `&`？因為名字是陣列，**陣列名稱本身就是它的記憶體位置**，這個之前講過了。名字用 `scanf` 讀，是假設名字裡沒有空白，例如中文名字；外國人的名字可能有空白，就要另外想辦法處理。`%99s` 是照 #4 的補充，限制最多讀 99 個字。
- 提示「學生 0」還是「學生 1」？`i` 從 0 開始，覺得「學生 0」可以就這樣寫；想從 1 開始，就印 `i + 1`。怎麼提示使用者比較好，沒有一定對的答案。
- 判斷及格：`students[i].score` 大於等於 60 就印出 `students[i].name`。

這就是結構好用的地方：一次要一大堆資料，又能把它們**群組**起來。第 `i` 個學生的成績和第 `i` 個學生的名字，都是同一個學生的屬性，彼此有**關聯**，就能利用這個關聯，判斷成績之後印出對應的名字。

### 錯誤示範：陣列不夠大

這個程式有一個怪怪的地方：學生陣列先準備了 100 個，到底要幾個才夠？其實不一定。直播做了一個實驗：**陣列只宣告 2 個，卻說要輸入 3 個學生。**

```c
// 錯誤示範：陣列只有 2 格，卻讓使用者輸入 3 個學生。不要照這樣寫！
#include <stdio.h>

typedef struct {
    char name[100];
    int age;
    int score;
} student;

int main(){
    student students[2];            // 只要了 2 個學生的空間
    int n, i;

    printf("輸入學生人數：");
    scanf("%d", &n);                // 輸入 3 的話……

    for (i = 0; i < n; i++) {       // i = 2 時，students[2] 已經在陣列外面了
        printf("輸入學生 %d 的名字：", i);
        scanf("%99s", students[i].name);
        printf("輸入學生 %d 的年齡：", i);
        scanf("%d", &students[i].age);
        printf("輸入學生 %d 的成績：", i);
        scanf("%d", &students[i].score);
    }

    printf("及格名單：\n");
    for (i = 0; i < n; i++) {
        if (students[i].score >= 60) {
            printf("%s\n", students[i].name);
        }
    }
    return 0;
}
```

兩格的陣列只有 `students[0]` 和 `students[1]`，輸入第三個學生時，`students[2]` 已經是**陣列外面**的記憶體了。直播上執行到這裡就開始怪怪的：輸入完第三個學生，竟然又出現「輸入學生 4」，一直要你輸入下去。

可能的原因是：**`n` 被蓋掉了。** `n` 和陣列都放在記憶體裡，一直往陣列後面寫，寫到了 `n` 所在的地方，把本來的 3 改成了別的值，迴圈就停不下來。

這種程式**不要真的拿來跑**，結果完全說不準：可能剛好沒事、可能像直播那樣停不下來、也可能直接當掉，換一台電腦或換一個編譯器，結果又不一樣。直播的說法是「不一定會出事，但出事的機率大概高達 98%」：你根本沒說要這塊空間，卻用到外面去了。**預先宣告的數量比實際要用的少，就很容易出事。**

### 改用 malloc：要多少就跟記憶體要多少

怎麼辦？#5 講過**動態記憶體配置**。用一個指標，加上 `malloc`：

```c
#include <stdio.h>
#include <stdlib.h>     // malloc、free

typedef struct {
    char name[100];
    int age;
    int score;
} student;

int main(){
    student *students;
    int n, i;

    printf("輸入學生人數：");
    scanf("%d", &n);

    // 跟記憶體要 n 個學生的空間，回傳的位置轉型成「學生的位置」
    students = (student *)malloc(sizeof(student) * n);

    // 後面完全照陣列來用
    for (i = 0; i < n; i++) {
        printf("輸入學生 %d 的名字：", i);
        scanf("%99s", students[i].name);
        printf("輸入學生 %d 的年齡：", i);
        scanf("%d", &students[i].age);
        printf("輸入學生 %d 的成績：", i);
        scanf("%d", &students[i].score);
    }

    printf("及格名單：\n");
    for (i = 0; i < n; i++) {
        if (students[i].score >= 60) {
            printf("%s\n", students[i].name);
        }
    }

    free(students);     // 自己 malloc 的空間，用完要自己還回去
    return 0;
}
```

一樣輸入 `3`、`Sonic 30 50`、`Tails 28 95`、`Amy 26 60`，印出的及格名單一樣是 Tails 和 Amy，而且這次輸入幾個學生都不會出問題。

- `sizeof(student)` 算出一個學生有多大，乘上 `n` 就是 n 個學生的大小。`malloc` 會跟記憶體要這麼大的空間，告訴你它在哪裡。
- `malloc` 剛給你位置的時候，不知道這塊空間要放什麼型態，所以做一個**轉型**，跟它說這是 `student` 的位置：`(student *)`。
- 拿到位置之後，**後面完全不用改**，照陣列來用就好，因為中括號就是指標的加法加 `*`。
- **用完要記得 `free`。** 這塊空間是你自己用 `malloc` 要的，不是用程式定義好的方式宣告的，所以要自己回收。`malloc` 的東西就要 `free`，不 `free` 它就會一直佔在那邊。

這樣就能照使用者實際要的數量，動態地要到剛好的大小。`malloc` 有可能要不到空間、`n` 也可能是 0 或負數，真正寫程式時要怎麼檢查，請看 #5 講義的「補充：檢查 malloc 有沒有要到」。

## 八、補充：遞迴與費氏數列

最後講一個比較特殊的概念。它其實不在入門的範圍裡，不會馬上用到，但可以讓大家動動腦。

### 費氏數列

**費氏數列**可能在高中數學看過：一開始有兩個數 1 和 1，接下來每一個數都是**前面兩個數相加**。

1、1、2、3、5、8、13……

1 加 1 是 2；1 加 2 是 3；2 加 3 是 5；3 加 5 是 8；5 加 8 是 13，一直往後加下去。

把定義寫成數學式：

- F<sub>0</sub> = 1
- F<sub>1</sub> = 1
- F<sub>n</sub> = F<sub>n-1</sub> + F<sub>n-2</sub>（n ≥ 2）

題目是：輸入一個 n，輸出 F<sub>n</sub> 是多少。

### 用迴圈算

一個方法是用迴圈。要有一開始的兩個值 `a`、`b`，再一個暫存的 `temp`。0 和 1 的答案已經有了，所以從 2 開始算到 n：

```c
#include <stdio.h>

int main(){
    int n, i;
    int a = 1, b = 1;       // a 是 F0，b 是 F1
    int temp;

    scanf("%d", &n);

    for (i = 2; i <= n; i++) {
        temp = a + b;       // 下一項
        a = b;              // 往後挪一格
        b = temp;
    }

    if (n == 0) {
        printf("%d\n", a);  // F0
    } else {
        printf("%d\n", b);  // 答案在 b
    }
    return 0;
}
```

輸入 `5` 印出 `8`，輸入 `10` 印出 `89`。

一開始 `a` 是第 0 項、`b` 是第 1 項。第一次做的時候，`temp = a + b` 就是第 2 項；接著把 `b` 移到 `a`、`temp` 移到 `b`，`a` 變成第 1 項、`b` 變成第 2 項。下一次再相加，就是第 3 項……一直做到最後，**答案就在 `b`**。這個可以自己推推看。

### 遞迴：函式自己呼叫自己

但今天想講的是另一種寫法，**跟數學定義寫得一模一樣**：

```c
#include <stdio.h>

int f(int n){
    if (n == 0) return 1;           // 停止條件
    if (n == 1) return 1;           // 停止條件
    return f(n - 1) + f(n - 2);     // 自己呼叫自己：遞迴
}

int main(){
    int n;

    scanf("%d", &n);
    printf("%d\n", f(n));
    return 0;
}
```

輸入 `3` 印出 `3`、輸入 `4` 印出 `5`、輸入 `5` 印出 `8`，都對。

n 是 0 的時候回傳 1，n 是 1 的時候也回傳 1；都不是的時候，回傳 `f(n - 1) + f(n - 2)`。`main` 裡只要呼叫 `f(n)`，它就會幫我們算出來。

你會覺得怪怪的：`f` 不就是它自己嗎？在 `f` 裡面又呼叫了 `f`。**這是可以的**，這個技巧叫**遞迴**，英文是 **recursion**。

### 一定要有停止條件

函式可以自己呼叫自己之後，要小心一件事：**會不會永遠呼叫不完？** 有可能。所以一定要有**停止的條件**。上面 `n == 0` 和 `n == 1` 那兩行就是停止條件：呼叫到 0 或 1 時直接 `return`，不再呼叫自己。

沒有停止條件的話，它就會一直呼叫自己，程式卡住、永遠跑不完。呼叫到一個程度之後，**記憶體的用量會超過上限**，程式就會被告知不能再呼叫了，這個錯誤就是常聽到的 **Stack Overflow**，反正就是呼叫到爆掉了。

> 補充：#5 提過，一般宣告的變數放在叫 **stack** 的區域。每呼叫一次函式，那次呼叫的引數和區域變數就要在 stack 上佔一塊空間，直到它 `return` 才還回去。一直呼叫自己又不 `return`，stack 很快就會滿出來（overflow），這就是名字的由來。

### 遞迴的效率問題：重複計算

遞迴寫起來很方便，但費氏數列用遞迴寫，會有一個很大的問題：**效率**。直播開小畫家把呼叫的過程畫出來。

算 F<sub>10</sub>，要呼叫 F<sub>9</sub> 加 F<sub>8</sub>；F<sub>9</sub> 又要呼叫 F<sub>8</sub> 加 F<sub>7</sub>……左邊一路算完、F<sub>8</sub> 的答案回來了，接著要算右邊的 F<sub>8</sub>。剛剛不是算過了嗎？可是它**沒有記下來**，所以又要展開來重新算一次。

F<sub>10</sub> 展開太大看不清楚，畫一個最小的 F<sub>4</sub>：

```
              F4
           /      \
         F3        F2
        /  \      /  \
      F2    F1  F1    F0
     /  \
   F1    F0
```

F<sub>4</sub> = F<sub>3</sub> + F<sub>2</sub>。先算左邊的 F<sub>3</sub> = F<sub>2</sub> + F<sub>1</sub>，F<sub>2</sub> 又要展開成 F<sub>1</sub> + F<sub>0</sub> = 1 + 1 = 2，所以 F<sub>3</sub> = 2 + 1 = 3。F<sub>3</sub> 算完，接著算右邊的 F<sub>2</sub>，又要再展開一次 F<sub>1</sub> + F<sub>0</sub> = 2，最後 3 + 2 = 5。

光是這麼小的例子，**F<sub>2</sub> 就被算了兩次**。算 F<sub>5</sub> 的話，F<sub>3</sub> 也會被算兩次；n 越大，重複算的東西越多，算起來就越慢。

直播實際跑了遞迴版，看看要多久（時間是直播當時的電腦上，Dev-C++ 在程式結束後顯示的執行時間）：

| n | 遞迴版 |
| --- | --- |
| 10、15、20 | 很快 |
| 25 到 31 | 還是蠻快的 |
| 35 | 大約 1 秒 |
| 37 | 1.34 秒 |
| 40 | 大約 2 秒 |
| 45 | 大約 7 秒 |

很不直覺吧？用迴圈的話，只是從 0 跑到 44 就結束了；用遞迴寫 45，卻有一堆重複的東西要算，花了 7 秒。

> 這個時間是 Dev-C++ 從程式開始執行算起的時間，連打字輸入 n 的時間也算在裡面，所以只能拿來大概比較。換一台電腦、換一個編譯器，數字也會不一樣。

直播原本也想試 F<sub>90</sub>，但數值會先爆掉。這裡的程式都用 `int` 存，F<sub>45</sub> = 1836311903 還放得下，F<sub>46</sub> 就超過 `int` 的範圍了，會印出奇怪的負數。

### 跟迴圈版比較

再寫一次迴圈版，這次把變數名字取得比較好讀：前一項 `previousItem`、目前這一項 `currentItem`：

```c
#include <stdio.h>

int main(){
    int n, i;
    int previousItem = 1;       // 前一項
    int currentItem = 1;        // 目前這一項
    int nextItem;               // 下一項

    scanf("%d", &n);

    if (n == 0) {               // 0 跟 1 不用算
        printf("%d\n", previousItem);
        return 0;
    }
    if (n == 1) {
        printf("%d\n", currentItem);
        return 0;
    }

    for (i = 2; i <= n; i++) {
        nextItem = previousItem + currentItem;
        previousItem = currentItem;
        currentItem = nextItem;
    }
    printf("%d\n", currentItem);
    return 0;
}
```

輸入 `45` 印出 `1836311903`，跟遞迴版一樣。

n 是 0 就直接印前一項，n 是 1 就直接印目前這項，這兩個不用算。之後從 2 跑到 n：下一項是前一項加目前這項；前一項換成目前這項，目前這項換成下一項。最後的 `currentItem` 就是答案。

一樣算 45，直播上這個版本**1.6 秒以下**就結束了（同樣包含輸入的時間），遞迴版要 7 秒。

### 遞迴不是不好

這不是說遞迴就很爛。**很多問題還是得用遞迴**，只是要注意它會不會一直重複算一樣的東西。

遞迴還有一個好處：**好讀**。`f(n - 1) + f(n - 2)` 跟數學定義一模一樣，一看就懂；迴圈版那幾行在做什麼，就不見得一眼看得懂。

剛剛的例子剛好會重複算到很多一樣的東西。要避免，也不一定要改成迴圈：例如算答案時，**把算過的答案記下來**，下次要算之前先看有沒有記過，有的話就直接用，不再往下展開。還有一些這類的技巧。

> 補充：「把算過的答案記下來」這個技巧，常見的名字叫**記憶化**（memoization）。直播沒有用到這個名詞，想多了解可以用它來查。

遞迴現在可能還用不太到，但之後學更後面的東西會越來越常見。有興趣的話，可以去看 **BFS**、**DFS** 這些演算法，還有經典的**八皇后問題**，它們都會用到遞迴的技巧。這些比較進階，入門課就不談，先知道**函式可以自己呼叫自己**這個概念就好。

## 小複習

1. 結構可以把好幾個不同型態的資料包成一種自己定義的型態：`struct 名稱 { 成員; ... };`。資料要群組化管理時就用它。
2. 型態的名字是 `struct` 加上名稱，例如 `struct student`；初始化用大括號，照成員定義的順序給值。
3. 用 `.` 拿結構裡的成員；成員就當成一般的變數來用（字元陣列一樣不用 `&`）。
4. 結構可以做成陣列，也可以整個當函式的引數，引數就不用一個一個傳。
5. 結構指標要先用 `*` 轉回變數再用點：`(*ptr).age`，簡寫成 `ptr->age`。就像中括號是加法加 `*` 的簡寫。
6. `typedef` 可以把很長的型態名字縮短：`typedef struct student student;`，最常見的是 `typedef struct { ... } student;`。
7. struct 定義的大括號後面有分號，因為那裡本來可以接著宣告變數。
8. 陣列不夠大還往外寫，結果完全說不準；不知道要幾個，就用 `malloc` 要剛好的大小，用完 `free`。
9. 遞迴就是函式自己呼叫自己，一定要有停止條件，不然會 Stack Overflow；也要注意有沒有重複計算。

## 演練

1. 自己定義一個遊戲角色的結構（攻擊力、防禦力、敏捷力、名稱……），宣告幾個角色並印出來。
2. 函式只能回傳一個值。試著寫一個函式，回傳一整個結構，讓它一次帶回好幾個值。
3. 把及格名單改成 `malloc` 的版本，再加上印出全班平均。
4. 用遞迴和迴圈各寫一次費氏數列，自己試試看 n 多大時遞迴版開始變慢。

寫好的話截圖發到 Twitter，加上 tag **#悠太作業**。有問題可以到聊天室或 Discord 問，Discord 的程式設計板裡也有其他很厲害的程式 Vtuber，不限 C 語言，Unity、網頁的問題也可以問。

## 下一堂預告

今天比較短，因為之前有一堂講了兩、三個概念，下班下課之後還要聽那麼多東西很累，之後盡量**一次講一個概念**就好。今天的概念很單純：把很多資料合成一個，而它也可以用陣列、也可以用指標。

下一堂要講**檔案處理**：存檔和讀檔要怎麼做。不再只把東西印在螢幕上，而是存進檔案裡。下禮拜會有一個應該蠻有趣的範例，先不破梗。

之後的規劃是：再下一堂講 **C++ 的基本**，接著把 C++ 多出來的基本東西講一講，然後進**物件導向的基礎**。直播也提到，之後會用同一個範例，用各種程式語言寫給你看：結構、函式這些概念，在其他語言裡也都有類似的東西，只是語法和設計理念不太一樣。

聊天室問到會不會教 C++14、C++17：入門課不會。C++ 越後面加的東西越偏進階，例如函式型程式設計相關的 Lambda Functions、某些 `static` 的修飾子，是用過一陣子才會知道為什麼要用的東西；C++ 的標準函式庫 STL 跟資料結構和演算法有關，入門也不會特別講。入門之後，也許會再開資料結構與演算法、物件導向程式設計的內容，或是帶大家實際寫東西的程式實況，這些都還在考慮。

另外，十月底的萬聖節前一週的禮拜二，預計像中秋節那次一樣，用 Unity 做一個萬聖節的小遊戲。
