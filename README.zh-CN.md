<p align="center"><img src="https://i.loli.net/2020/01/27/bOvLlYmT7dQFRjr.png"
        width="64px" /></p>

<h2 align="center">wnr</h2>

<p align="center">
    <b>它的名称来源于 "Work & Rest" 的缩写。这是一个拥有高可扩展性的时间管理计算机软件。</b>
</p>

<p align="center">
    作为一个时间管理软件，wnr 简洁而又实用。| <a href="https://getwnr.com/">中文网站</a>
</p>

<p align="center">
    下载地址 <i>(Windows & macOS)</i>: <a href="https://github.com/RoderickQiu/wnr/releases">GitHub Release</a> | <a
        href="https://www.softpedia.com/get/Desktop-Enhancements/Clocks-Time-Management/wnr.shtml">Softpedia
        (Windows)</a> | <a href="https://pan.baidu.com/s/1PDpnEkf-zKQKQIhUTO0ubQ">百度网盘</a>（swh3） | <a href="https://scris.lanzoui.com/b01n0tb4j">蓝奏云高速下载</a>
</p>

<p align="center">
    <a href="https://github.com/RoderickQiu/wnr/blob/master/README.md">English README</a> | <a href="https://github.com/RoderickQiu/wnr/blob/master/README.zh-CN.md">简体中文简介</a> | <a href="https://github.com/RoderickQiu/wnr/blob/master/README.zh-TW.md">正體中文簡介</a>
</p>

<p align="center">
    <a href="https://github.com/RoderickQiu/wnr/blob/master/DEVELOPMENT_GUIDE.md">开发导引文档</a>
</p>

<table border="0" align="center">
    <tr>
        <td align="right"><img src="https://i.loli.net/2020/10/01/lX6Q9uqFNWSUB7k.png" ></td>
        <td align="left"><img src="https://i.loli.net/2020/10/01/d92EyIKFejBrl4w.png" ></td>
    </tr>
</table>

---

## 特性

- 现代的设计

- 多平台支持 *（目前支持 Windows & macOS）*

- 多语言支持 *（你可以 [贡献翻译](https://github.com/RoderickQiu/wnr/blob/master/locales/README.md)！）*

- 多屏幕支持

- 多虚拟桌面支持

- 拥有便携版 *（目前支持 Windows）*

- 用自然语言输入时间

- 设置工作时间、休息时间

- 自动循环

- 提前规划任务和预设方案

- 明确的时间提示

- 可选的任务名称和备注

- 托盘菜单

- 时间到时响铃

- 全屏专心模式

- 锁定模式 / 家长控制

- 严格的规则来阻止用户耍小聪明

- 置顶模式

- 随系统自动启动

- 自动开始任务

- 进度条

- 高分辨率支持

- 触摸屏高可用度

- 暗黑模式

- 用户友好的导览功能

- 用户友好的升级功能

- 无限循环模式

- ...

这个软件会经常更新，这个榜单也一样。

## 联系方式

- 主页： [getwnr.com](https://getwnr.com/)。

- 下载地址： [Releases](https://github.com/RoderickQiu/wnr/releases/)。

- 获取帮助： [前往帮助页面](https://getwnr.com/guide/1-basic-usage.html) 或 [联系我](mailto:scrisqiu@hotmail.com)。

## 贡献

非常感谢你的贡献。

- 如果你想报告一些期望的特性或漏洞，请随时 [提交 Issue](https://github.com/RoderickQiu/wnr/issues/new)。

- 如果你做了些不错的改进，那么请 [提交 Pull Request](https://github.com/RoderickQiu/wnr/pulls)。

- 如果你想为 wnr 添加一种语言的支持， [请先阅读这份指南](https://github.com/RoderickQiu/wnr/blob/master/locales/README.md)。

## 待办事项

请前往 [GitHub Project](https://github.com/RoderickQiu/wnr/projects/1)。

## 如何构建

```shell
yarn # 安装依赖

yarn start # 运行程序

yarn dir # 仅仅打包基础可执行文件

yarn nsis # Windows平台NSIS安装包打包

yarn nsis-ia32 # Windows平台NSIS安装包打包（32位）

yarn 7zip # Windows平台7z便携版打包

yarn 7zip-ia32 # Windows平台7z便携版打包（32位）

yarn mac # macOS版本打包

yarn linux # Linux版本打包
```

请注意：

- Linux 版本还未经测试 *（如果你在使用 Linux，你可以自己尝试修改然后贡献）*。

更多有关wnr的技术细节和开发建议，请查看[**DEVELOPMENT_GUIDE**](https://github.com/RoderickQiu/wnr/blob/master/DEVELOPMENT_GUIDE.md)。

## 版权和鸣谢

版权所有 (c) 2019-2021 **[Roderick Qiu](https://r-q.name)** 和其他贡献者。保留所有权利。

使用 **[MPL 2.0 许可证](https://github.com/RoderickQiu/wnr/blob/master/LICENSE)** 进行许可。

### 使用的软件包

#### 主程序

完整的许可证文本参见 [这个文件](https://github.com/RoderickQiu/wnr/blob/master/NOTICE.md)，同时也包含在每一份 wnr 的副本中。

- node-shi，[**我自己的项目**](https://www.npmjs.com/package/node-shi) 使用 MIT 许可证。
- cmd-or-ctrl，[**另一个我自己的项目**](https://www.npmjs.com/package/cmd-or-ctrl) 使用 MIT 许可证。
- node-auto-launch，Teamwork，MIT 许可证。
- compare-version，kevva，MIT 许可证。
- electron-store，sindresorhus，MIT 许可证。
- i18n-node，mashpie，MIT 许可证。
- crypto-js，brix，MIT 许可证。
- copy-to-clipboard，sudodoki，MIT 许可证。
- request，request，Apache-2.0 许可证。
- winreg，fresc81，BSD 2-Clause 许可证。
- **electron，electron，MIT 许可证**。
- electron-builder，electron-userland，MIT 许可证。
- jquery，jquery，MIT 许可证。
- bootstrap，twbs，MIT 许可证。
- iconfont，ALIMAMA MUX，许可证参见 [此网站](https://www.iconfont.cn/)。
- node-md5，pvorb，BSD-3-Clause 许可证。
- dotenv，motdotla，BSD-2-Clause 许可证。
- windows-release，sindresorhus，MIT 许可证。
- leancloud-storage，leancloud，MIT 许可证。
- electron-debug，sindresorhus，MIT 许可证。
- node-fetch，node-fetch，MIT 许可证。
- node-notifier，mikaelbr，MIT 许可证。
- popper.js，popperjs，MIT 许可证。
- schart.js，lin-xin，MIT 许可证。
- cross-env，kentcdodds，MIT 许可证。

#### 网站 / 文档 *([wnr-guide](https://github.com/RoderickQiu/wnr-guide)，使用 [[CC-BY-4.0](https://spdx.org/licenses/CC-BY-4.0.html)] 许可证)*

- **vuepress，vuejs，MIT 许可证**。
- vuepress-plugin-sitemap，ekoeryanto，MIT 许可证。
- vuepress-theme-api，sqrthree，MIT 许可证。

### 开发环境

- **node，nodejs，**[**许可证**](https://github.com/nodejs/node/blob/master/LICENSE)。
- NSIS，Nullsoft，zlib/libpng 许可证。
- WebStorm，JetBrains，[许可证](https://www.jetbrains.com/legal/#licensing)。
