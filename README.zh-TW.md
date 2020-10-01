<p align="center"><img src="https://i.loli.net/2020/01/27/bOvLlYmT7dQFRjr.png"
        width="64px" /></p>

<h2 align="center">wnr</h2>

<p align="center">
    <b>它的名稱來源於 "Work & Rest" 的縮寫。這是一個擁有高可擴展性的時間管理計算機軟件。</b>
</p>

<p align="center">
    作爲一個時間管理軟件，wnr 簡潔而又實用。| <a href="https://getwnr.com/">中文網站</a>
</p>

<p align="center">
    下載地址 <i>(Windows & macOS)</i>: <a href="https://github.com/RoderickQiu/wnr/releases">GitHub Release</a> | <a
        href="https://www.softpedia.com/get/Desktop-Enhancements/Clocks-Time-Management/wnr.shtml">Softpedia
        (Windows)</a> | <a href="https://pan.baidu.com/s/1PDpnEkf-zKQKQIhUTO0ubQ">百度網盤</a>（swh3） | <a href="https://www.lanzous.com/b01n0tb4j">藍奏雲高速下載</a>（7nzh）
</p>

<p align="center">
    <a href="https://github.com/RoderickQiu/wnr/blob/master/README.md">English README</a> | <a href="https://github.com/RoderickQiu/wnr/blob/master/README.zh-CN.md">简体中文简介</a> | <a href="https://github.com/RoderickQiu/wnr/blob/master/README.zh-TW.md">正體中文簡介</a>
</p>

<p align="center">
    <a href="https://github.com/RoderickQiu/wnr/blob/master/DEVELOPMENT_GUIDE.md">開發導引文檔</a>
</p>

<table border="0" align="center">
    <tr>
        <td align="right"><img src="https://i.loli.net/2020/10/01/ZjTHdYQCzhqPor6.png" ></td>
        <td align="left"><img src="https://i.loli.net/2020/10/01/vwfECA8z6yQkaZB.png" ></td>
    </tr>
</table>

---

## 特性

- 現代的設計

- 多平臺支持 *（目前支持 Windows & macOS）*

- 多語言支持 *（你可以 [貢獻翻譯](https://github.com/RoderickQiu/wnr/blob/master/locales/README.md)！）*

- 多屏幕支持

- 多虛擬桌面支持

- 擁有便攜版 *（目前支持 Windows）*

- 用自然語言輸入時間

- 設置工作時間、休息時間

- 自動循環

- 提前規劃任務和預設方案

- 明確的時間提示

- 可選的任務名稱和備註

- 托盤菜單

- 時間到時響鈴

- 全屏專心模式

- 鎖定模式 / 家長控制

- 嚴格的規則來阻止用戶耍小聰明

- 置頂模式

- 隨系統自動啓動

- 自動開始任務

- 進度條

- 高分辨率支持

- 觸摸屏高可用度

- 暗黑模式

- 用戶友好的導覽功能

- 用戶友好的升級功能

- 無限循環模式

- ...

## 聯繫方式

- 主頁： [getwnr.com](https://getwnr.com/)。

- 下載地址： [Releases](https://github.com/RoderickQiu/wnr/releases/)。

- 獲取幫助： [前往幫助頁面](https://getwnr.com/guide/1-basic-usage.html) 或 [聯繫我](mailto:scrisqiu@hotmail.com)。

## 貢獻

非常感謝你的貢獻。

- 如果你想報告一些期望的特性或漏洞，請隨時 [提交 Issue](https://github.com/RoderickQiu/wnr/issues/new)。

- 如果你做了些不錯的改進，那麼請 [提交 Pull Request](https://github.com/RoderickQiu/wnr/pulls)。

- 如果你想爲 wnr 添加一種語言的支持， [請先閱讀這份指南](https://github.com/RoderickQiu/wnr/blob/master/locales/README.md)。

## 待辦事項

請前往 [GitHub Project](https://github.com/RoderickQiu/wnr/projects/1)。

## 如何構建

```shell
yarn # 安裝依賴

yarn start # 運行程序

yarn dir # 僅僅打包基礎可執行文件

yarn nsis # Windows平台NSIS安裝包打包

yarn nsis-ia32 # Windows平台NSIS安裝包打包（32位）

yarn 7zip # Windows平台7z便攜版打包

yarn 7zip-ia32 # Windows平台7z便攜版打包（32位）

yarn mac # macOS版本打包

yarn linux # Linux版本打包
```

請注意：

- Linux 版本還未經測試 *（如果你在使用 Linux，你可以自己嘗試修改然後貢獻）*。

更多有關wnr的技術細節和開發建議，請查看[**DEVELOPMENT_GUIDE**](https://github.com/RoderickQiu/wnr/blob/master/DEVELOPMENT_GUIDE.md)。

## 版權和鳴謝

版權所有 (c) 2019-2020 **[Roderick Qiu](https://r-q.name)** 和其他貢獻者。保留所有權利。

使用 **[MPL 2.0 許可證](https://github.com/RoderickQiu/wnr/blob/master/LICENSE)** 進行許可。

### 使用的軟件包

#### 主程序

完整的許可證文本參見 [這個文件](https://github.com/RoderickQiu/wnr/blob/master/NOTICE.md)，同時也包含在每一份 wnr 的副本中。

- node-shi，[**我自己的項目**](https://www.npmjs.com/package/node-shi) 使用 MIT 許可證。
- cmd-or-ctrl，[**另一個我自己的項目**](https://www.npmjs.com/package/cmd-or-ctrl) 使用 MIT 許可證。
- node-auto-launch，Teamwork，MIT 許可證。
- compare-version，kevva，MIT 許可證。
- electron-store，sindresorhus，MIT 許可證。
- i18n-node，mashpie，MIT 許可證。
- crypto-js，brix，MIT 許可證。
- copy-to-clipboard，sudodoki，MIT 許可證。
- request，request，Apache-2.0 許可證。
- winreg，fresc81，BSD 2-Clause 許可證。
- **electron，electron，MIT 許可證**。
- electron-builder，electron-userland，MIT 許可證。
- jquery，jquery，MIT 許可證。
- bootstrap，twbs，MIT 許可證。
- iconfont，ALIMAMA MUX，許可證參見 [此網站](https://www.iconfont.cn/)。
- dotenv，motdotla，BSD-2-Clause 許可證。
- windows-release，sindresorhus，MIT 許可證。
- leancloud-storage，leancloud，MIT 許可證。
- electron-debug，sindresorhus，MIT 許可證。
- node-fetch，node-fetch，MIT 許可證。
- node-notifier，mikaelbr，MIT 許可證。
- popper.js，popperjs，MIT 許可證。
- schart.js，lin-xin，MIT 許可證。
- cross-env，kentcdodds，MIT 許可證。

#### 網站 / 文檔 *([wnr-guide](https://github.com/RoderickQiu/wnr-guide)，使用 [[CC-BY-4.0](https://spdx.org/licenses/CC-BY-4.0.html)] 許可證)*

- **vuepress，vuejs，MIT 許可證**。
- vuepress-plugin-sitemap，ekoeryanto，MIT 許可證。
- vuepress-theme-api，sqrthree，MIT 許可證。

### 開發環境

- **node，nodejs，[許可證](https://github.com/nodejs/node/blob/master/LICENSE)**。
- NSIS，Nullsoft，zlib/libpng 許可證。
- VS Code，microsoft，MIT 許可證。
