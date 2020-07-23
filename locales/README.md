[English](#Languages) | [简体中文](#多语言) | [正體中文](#多語言)

# Languages

Until now, wnr has get these languages:

- English

- 简体中文 (Simplified Chinese)

- 正體中文 (Traditional Chinese)

**And we're now hoping to have more languages**.

## How to contribute

1. The name of translated file should follow [this guide](https://www.electronjs.org/docs/api/locales). All the languages are stored in JSON format, using [i18n-node](https://github.com/mashpie/i18n-node). The file should be located in this folder.
    - For example, in case you want to contribute for français, you should add `fr.json`, and so does `de.json` for Deutsch.

2. Change these sections:
    - The `languageList[]` array and `LanguageNameList[]` array in `supporter.js`.
    - The `languageCodeList[]` array in `main.js`.
    - The `nsis.installerLanguages[]` array in `res/builder/nsis.js` and `nsis-ia32.js`.

3. Now, start to translate wnr to your language! After finished, please do not forget to make a pull request. I appreciate it.

## Tips

- If you were willing to change the Chinese translations, after changing Simplified Chinese / Traditional Chinese, use [OpenCC](https://opencc.byvoid.com/) to sync the changes to the other.

- If you had set to your language, but it turned out that wnr was rendered in English, go check your JSON file. When the JSON file is with syntax errors, English is the fallback language.

    - For example, you shouldn't have a `"` inside a `"`, use a `\"` instead.

# 多语言

迄今为止，wnr 支持以下几种语言:

- English（英语）

- 简体中文

- 正體中文（繁体中文）

**我们希望支持更多的语言**。

## 如何贡献

1. 翻译文件的命名规范应当遵循 [这份指南](https://www.electronjs.org/docs/api/locales)。所有翻译文件都是 JSON 格式，使用 [i18n-node](https://github.com/mashpie/i18n-node)。这些文件应当被存储在此文件夹中。
    - 例如，你想贡献 français（法语）的翻译文件时，应该添加 `fr.json`，翻译成 Deutsch（德语）时则添加 `de.json`。

2. 添加翻译文件后请更改这些内容：
    - `supporter.js` 里的数组 `languageList[]` 和数组 `LanguageNameList[]`。
    - `main.js` 里的数组 `languageCodeList[]`。
    - `res/builder/nsis.js` 和 `nsis-ia32.js` 里的数组 `nsis.installerLanguages[]`。

3. 现在可以开始将 wnr 翻译成你的语言了！完成后，请别忘了提交拉取请求（Pull Request）。非常感谢你的贡献。

## 温馨提示

- 如果你想要更改中文翻译，请在更改完毕后使用 [OpenCC](https://opencc.byvoid.com/) 来同步简体中文和繁体中文。

- 如果你已经将 wnr 设置为你的语言，但 wnr 却显示为英语，请检查你的 JSON 文件。当 JSON 文件存在语法错误时，英语将是默认显示的语言。

    - 例如，`"` 不应当放置在另一个 `"` 中，请使用 `\"` 来代替。

# 多語言

迄今爲止，wnr 支持以下幾種語言:

- English（英語）

- 简体中文（簡體中文）

- 正體中文

**我們希望支持更多的語言**。

## 如何貢獻

1. 翻譯文件的命名規範應當遵循 [這份指南](https://www.electronjs.org/docs/api/locales)。所有翻譯文件都是 JSON 格式，使用 [i18n-node](https://github.com/mashpie/i18n-node)。這些文件應當被存儲在此文件夾中。
    - 例如，你想貢獻 français（法語）的翻譯文件時，應該添加 `fr.json`，翻譯成 Deutsch（德語）時則添加 `de.json`。

2. 添加翻譯文件後請更改這些內容：
    - `supporter.js` 裏的數組 `languageList[]` 和數組 `LanguageNameList[]`。
    - `main.js` 裏的數組 `languageCodeList[]`。
    - `res/builder/nsis.js` 和 `nsis-ia32.js` 裏的數組 `nsis.installerLanguages[]`。

3. 現在可以開始將 wnr 翻譯成你的語言了！完成後，請別忘了提交拉取請求（Pull Request）。非常感謝你的貢獻。

## 溫馨提示

- 如果你想要更改中文翻譯，請在更改完畢後使用 [OpenCC](https://opencc.byvoid.com/) 來同步簡體中文和正體中文。

- 如果你已經將 wnr 設置爲你的語言，但 wnr 卻顯示爲英語，請檢查你的 JSON 文件。當 JSON 文件存在語法錯誤時，英語將是默認顯示的語言。

    - 例如，`"` 不應當放置在另一個 `"` 中，請使用 `\"` 來代替。
