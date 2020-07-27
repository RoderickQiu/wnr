<p align="center"><img src="https://i.loli.net/2020/01/27/bOvLlYmT7dQFRjr.png"
        width="64px" /></p>

<h2 align="center">wnr</h2>

<p align="center">
    <b>The name is an abbr of "Work & Rest". It's a timer app with strong expansibility for computers.</b>
</p>

<p align="center">
    As a timer app, wnr is simple but useful. | <a href="https://getwnr.com/">中文网站</a>
</p>

<p align="center">
    Download <i>(Windows & macOS)</i>: <a href="https://github.com/RoderickQiu/wnr/releases">GitHub Release</a> | <a
        href="https://www.softpedia.com/get/Desktop-Enhancements/Clocks-Time-Management/wnr.shtml">Softpedia
        (Windows)</a> | <a href="https://pan.baidu.com/s/1PDpnEkf-zKQKQIhUTO0ubQ">百度网盘</a>（swh3） | <a href="https://www.lanzous.com/b01n0tb4j">蓝奏云高速下载</a>（7nzh）
</p>

<p align="center">
    <a href="https://github.com/RoderickQiu/wnr/blob/master/README.md">English README</a> | <a href="https://github.com/RoderickQiu/wnr/blob/master/README.zh-CN.md">简体中文简介</a> | <a href="https://github.com/RoderickQiu/wnr/blob/master/README.zh-TW.md">正體中文簡介</a>
</p>

<p align="center">
    <a href="https://github.com/RoderickQiu/wnr/blob/master/DEVELOPMENT_GUIDE.md">Development Guide</a>
</p>

---

## Online Version

The online wnr is now out: [wnr-jr](https://wnr-jr.scris.top).

*(just a demo version, may not be fully useful on phones or other devices due to a lot of reasons.)*

## Features

- modern design

- multi-platforms support *(currently Windows & macOS)*

- multi-languages support *(you can help to [contribute](https://github.com/RoderickQiu/wnr/blob/master/locales/README.md)!)*

- multi-monitor support

- multi-virtual-desktops support

- portable software available *(currently Windows)*

- semantic time input

- work time settings

- rest time settings

- automatic loops

- predefined tasks / defaults

- clear tips for time

- optional taskname and task notes

- tray menu

- alerts for time end

- full-screen focus mode

- lock mode / parent control

- strict rules to prevent users from hacking

- always-on-top mode

- auto-start with system

- auto start task

- progress bar support

- hi-dpi support

- good touchscreen usability

- dark mode support

- user-friendly tourguide

- user-friendly updater

- infinity mode

- ...

This application is being frequently updated, so does this list.

## Contact

- Homepage: [getwnr.com](https://getwnr.com/).

- Downloads: [Releases](https://github.com/RoderickQiu/wnr/releases/).

- Need Help: [Go to Help Page](https://getwnr.com/guide/1-basic-usage.html) or [Contact Me](mailto:scrisqiu@hotmail.com).

## Contributing

I appreciate it if you can help contribute.

- If you have any feature requests / bugs to report, feel free to [have a issue](https://github.com/RoderickQiu/wnr/issues/new).

- If you have done something brilliant, then [go for a pull request](https://github.com/RoderickQiu/wnr/pulls).

- If you want to add a new language to wnr, [see this guide first](https://github.com/RoderickQiu/wnr/blob/master/locales/README.md).

## To-do List

Please go and see the [GitHub Project](https://github.com/RoderickQiu/wnr/projects/1).

## How to Build

```shell
yarn # install deps

yarn start # launch the app

yarn nsis # windows nsis installer

yarn nsis-ia32 # windows nsis installer (x86)

yarn portable # windows portable

yarn win-zip # windows 7-zip

yarn mac # macos

yarn linux # linux
```

Please note that:

- Linux version hasn't been tested *(If you are using Linux, you can fix things up yourself and contribute)*.

For more info about development, go to [**DEVELOPMENT_GUIDE**](https://github.com/RoderickQiu/wnr/blob/master/DEVELOPMENT_GUIDE.md).

## Copyright & Credit

Copyright (c) 2019-2020 **[Roderick Qiu](https://r-q.name)** and other contributors. All rights reserved.

Licensed under the **[MPL 2.0 License](https://github.com/RoderickQiu/wnr/blob/master/LICENSE)**.

### Packages Using

#### Main Program

For the full text of licenses, go and see [this file](https://github.com/RoderickQiu/wnr/blob/master/NOTICE.md), which is also included in every copy of wnr.

- node-shi, [**my own project**](https://www.npmjs.com/package/node-shi) following MIT License.
- cmd-or-ctrl, [**another project of mine**](https://www.npmjs.com/package/cmd-or-ctrl) following MIT License.
- node-auto-launch, Teamwork, MIT License.
- compare-version, kevva, MIT License.
- electron-store, sindresorhus, MIT License.
- i18n-node, mashpie, MIT License.
- crypto-js, brix, MIT License.
- copy-to-clipboard, sudodoki, MIT License.
- request, request, Apache-2.0 License.
- winreg, fresc81, BSD 2-Clause License.
- **electron, electron, MIT License**.
- electron-builder, electron-userland, MIT License.
- jquery, jquery, MIT License.
- bootstrap, twbs, MIT License.
- iconfont, ALIMAMA MUX, for license go to [the site](https://www.iconfont.cn/).
- dotenv, motdotla, BSD-2-Clause License.
- windows-release, sindresorhus, MIT License.
- leancloud-storage, leancloud, MIT License.
- electron-debug, sindresorhus, MIT License.
- node-fetch, node-fetch, MIT License.
- node-notifier, mikaelbr, MIT License.
- popper.js, popperjs, MIT License.
- schart.js, lin-xin, MIT License.

#### Website / Documents *([wnr-guide](https://github.com/RoderickQiu/wnr-guide), provided with [[CC-BY-4.0](https://spdx.org/licenses/CC-BY-4.0.html)] license)*

- **vuepress, vuejs, MIT License**.
- vuepress-plugin-sitemap, ekoeryanto, MIT License.
- vuepress-theme-api, sqrthree, MIT License.

### Environment Using

- **node, nodejs, [License](https://github.com/nodejs/node/blob/master/LICENSE)**.
- NSIS, Nullsoft, zlib/libpng License.
- VS Code, microsoft, MIT License.
