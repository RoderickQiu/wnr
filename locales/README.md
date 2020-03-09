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
    - The `nsis.installerLanguages[]` array in `res/builder/win.js`.

3. Now, start to translate wnr to your language! After finished, please do not forget to make a pull request. I appreciate it.

### Tips

- If you were willing to change the Chinese translations, after changing Simplified Chinese / Traditional Chinese, use [this tool](http://www.aies.cn/) to sync the changes to the other.

- If you had set to your language, but it turned out that wnr was rendered in English, go check your JSON file. When the JSON file is with syntax errors, English is the fallback language.

    - For example, you shouldn't have a `"` inside a `"`, use a `\"` instead.
