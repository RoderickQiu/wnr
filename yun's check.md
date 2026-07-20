# wnr 项目全面分析报告

> **分析日期**：2026-07-19
> **项目版本**：v1.32.0
> **分析者**：yun

---

## 一、项目概述

**wnr**（全称 "Work aNd Rest"）是一款**跨平台桌面计时器应用**，旨在帮助用户进行高效的时间管理与专注工作。它提供工作/休息交替计时的番茄钟式工作法，同时具备全屏强制专注模式、迷你浮动窗口、数据统计、云同步等丰富功能。

| 属性 | 详情 |
|------|------|
| **应用名称** | wnr |
| **当前版本** | v1.32.0 |
| **作者** | RoderickQiu |
| **开源协议** | MPL-2.0 |
| **官方网站** | [https://getwnr.com](https://getwnr.com) |
| **代码仓库** | [https://github.com/RoderickQiu/wnr](https://github.com/RoderickQiu/wnr) |
| **技术栈** | Electron + jQuery + Bootstrap |
| **支持平台** | Windows、macOS、Linux |
| **编程语言** | JavaScript、HTML、CSS |

### 核心功能一览

1. **番茄钟计时**：工作/休息交替计时，可自定义时长与循环次数
2. **全屏专注模式**：强制全屏（Kiosk模式），阻止用户分心
3. **多显示器支持**：在专注模式下屏蔽所有副屏
4. **迷你模式**：悬浮小窗显示剩余时间
5. **正计时模式**：自由计时，不限循环
6. **简单倒计时**：单次倒计时模式
7. **预定义任务**：可保存和切换常用计时方案
8. **任务预约**：设定时间自动启动任务
9. **数据统计**：日/月/年的工作时长统计与图表可视化
10. **暗黑模式**：支持自动切换/浅色/深色
11. **多语言**：英语、简体中文、繁體中文、한국어
12. **自定义主题色**：工作/休息颜色可自由定制
13. **自定义通知**：音效和文字通知可个性化
14. **全局快捷键**：开始/暂停、显示/隐藏等
15. **系统托盘**：托盘菜单快速操作
16. **密码锁模式**：防止未经授权退出计时
17. **WebDAV 云同步**：跨设备数据同步
18. **数据备份/导入**：AES 加密的配置与统计导入导出
19. **自动更新检查**：每日检查新版本

---

## 二、技术路线

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                       Electron 框架                          │
│                                                             │
│  ┌──────────────────────┐    ┌───────────────────────────┐  │
│  │    Main Process       │    │    Renderer Processes      │  │
│  │   (main.js ~2886行)   │◄──►│   (多个 HTML 页面)         │  │
│  │                       │IPC │                           │  │
│  │  · 窗口生命周期管理    │    │  · index.html (主页面)     │  │
│  │  · 系统托盘与菜单      │    │  · timer.html (计时页面)   │  │
│  │  · 全局快捷键          │    │  · statistics.html (统计)  │  │
│  │  · 数据统计与持久化    │    │  · preferences.html (设置) │  │
│  │  · 全屏/专注控制       │    │  · about.html (关于)      │  │
│  │  · 通知与音效          │    │  · floating.html (迷你窗) │  │
│  │  · WebDAV 同步         │    │  · external-title.html    │  │
│  │  · 电源管理            │    │  · custom-dialog.html     │  │
│  │  · 更新检测            │    │  · placeholder.html       │  │
│  └──────────────────────┘    │  · tourguide.html (向导)   │  │
│                               └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 运行时依赖

| 依赖包 | 版本 | 用途 |
|--------|------|------|
| electron | 22.3.27 | 跨平台桌面应用框架 |
| jquery | 3.7.1 | DOM 操作与事件处理 |
| bootstrap | 4.6.2 | UI 组件与响应式布局 |
| electron-store | 8.2.0 | JSON 文件持久化存储 |
| i18n | 0.15.3 | 国际化翻译 |
| crypto-js | 4.2.0 | AES 加密/解密与 MD5 哈希 |
| node-shi | 0.4.2 | 人性化时间解析（如 "1h30m" → 90分钟） |
| schart.js | 3.0.4 | Canvas 图表绘制（统计页面） |
| @eastdesire/jscolor | 2.5.2 | 颜色选择器 |
| node-fetch | 2.7.0 | HTTP 请求（更新检测、WebDAV） |
| node-notifier | 10.0.1 | 跨平台系统通知 |
| keytar | 7.9.0 | 系统密钥链存取（WebDAV 密码） |
| electron-builder | 26.0.12 | 应用打包与分发 |
| cmd-or-ctrl | 0.3.1 | 跨平台快捷键修饰键处理 |
| win-release-id | 1.0.6 | Windows 系统版本检测 |

### 2.3 数据存储方案

- **electron-store**：使用 JSON 文件进行本地数据持久化
- **存储实例划分**：
  - `store`（wnr-config）：主配置数据
  - `styleCache`（style-cache）：样式缓存
  - `statistics`（statistics）：统计数据
  - `recapStore`（recap）：计时回顾记录
  - `timingData`（timing-data）：计时状态缓存
- **便携模式**：数据存储在 exe 同目录下
- **WebDAV 同步**：支持将配置、统计、回顾数据同步到远程 WebDAV 服务器

### 2.4 打包分发

- **Windows**：NSIS 安装包 / 7zip 便携版 / Microsoft Store
- **macOS**：DMG 安装包
- **Linux**：deb/rpm 包 / AppImage
- **分发渠道**：GitHub Release、Softpedia、百度网盘、蓝奏云

---

## 三、实现方法

### 3.1 计时核心逻辑

```
计时方式：setInterval() 每秒执行
剩余时间计算：periodLength - (nowTime - startTime)
进度条更新：通过 ipc 向主进程发送 progress-bar-set 消息
```

计时过程在 `timer.html` 中通过 `clock()` 函数每秒触发：
1. 计算当前周期剩余时间
2. 更新进度条（Windows 任务栏进度条 + macOS Touch Bar）
3. 更新系统托盘标题（显示剩余分钟和百分比）
4. 更新迷你悬浮窗口
5. 周期结束时触发 `skipper()` 跳转到下一周期
6. 全部完成后触发 `ender()` 结束计时

### 3.2 专注模式（Fullscreen Focus）

专注模式是 wnr 的核心特色功能，实现原理：

1. **Kiosk 模式**（非松散模式）：
   - 调用 `win.setKiosk(true)` 强制全屏
   - 设置 `win.setAlwaysOnTop(true, "screen-saver")` 置顶
   - 设置 `win.setFocusable(false)` 阻止交互
   - 定时器每 2.5 秒重新强制 Kiosk 状态
   - 阻止显示器休眠 `powerSaveBlocker.start('prevent-display-sleep')`

2. **松散模式（Loose Mode）**：
   - 使用普通 `win.setFullScreen(true)`
   - 允许用户通过常规方式退出全屏
   - 支持多显示器松散模式（可调整窗口大小）

3. **多显示器屏蔽**：
   - 检测所有显示器，在非主显示器上创建全屏占位窗口
   - 松散模式下的多屏窗口允许 Esc 退出

### 3.3 数据统计系统

统计数据按**日 / 月 / 年**三级聚合存储：

```javascript
// 键名示例
yearMonDay = "2026jul19"  // 日
yearAndMon = "2026jul"     // 月
year = "2026"              // 年

// 数据结构
{
  workTime: Number,   // 工作时间（分钟）
  restTime: Number,   // 休息时间（分钟）
  positive: Number,   // 正计时时间（分钟）
  onlyRest: Number,   // 仅休息/倒计时时间（分钟）
  sum: Number         // 总计时间（分钟）
}
```

记录时机：每次计时暂停/结束/周期切换时，通过 `statisticsWriter()` 计算时间差并累加到对应的日/月/年记录中。

### 3.4 国际化 (i18n)

- 使用 `i18n` npm 包
- 翻译文件存放在 `locales/` 目录（JSON 格式）
- 支持语言：en、zh-CN、zh-TW、ko
- 自动检测系统语言进行首次匹配
- 设置页面可手动切换语言

### 3.5 主题系统

**暗黑模式**：
- 通过 `nativeTheme.shouldUseDarkColors` 检测系统主题
- 动态注入/移除 `<style>` 标签切换配色
- 三种模式：自动切换、始终浅色、始终深色

**自定义主题色**：
- 四种角色颜色：休息色、工作色、正计时色、仅休息色
- 通过 jscolor 组件选择颜色
- `theme.js` 动态生成 CSS 规则注入页面
- 修改后同步到所有窗口（主窗口、悬浮窗、外部标题窗）

### 3.6 WebDAV 云同步

`webdav-sync.js` 实现完整的 WebDAV 同步功能：

- 同步文件：config.json、statistics.json、recap.json
- 支持操作：启动时拉取、手动上传/下载、退出前推送
- 密码通过 keytar 存储在系统密钥链中
- 自动同步就绪后，数据变更时自动推送
- 启动同步未完成前窗口不显示（防止数据不一致）
- 退出时如有未同步数据，弹出对话框提示

### 3.7 IPC 通信设计

主进程与渲染进程通过 Electron IPC 通信：

**渲染 → 主进程（ipcMain.on）**：
| 频道 | 功能 |
|------|------|
| `timer-win` | 通知主进程进入/退出计时状态 |
| `warning-giver-workend` | 工作时间结束 |
| `warning-giver-restend` | 休息时间结束 |
| `warning-giver-all-task-end` | 全部任务完成 |
| `progress-bar-set` | 更新任务栏进度条 |
| `tray-time-set` | 更新托盘时间显示 |
| `floating-heartbeat` | 迷你窗心跳同步 |
| `tray-image-change` | 托盘图标切换 |
| `start-or-stop` | 开始/暂停计时 |
| `save-recap-entry` | 保存回顾记录 |

**主 → 渲染进程（webContents.send）**：
| 频道 | 功能 |
|------|------|
| `darkModeChanges` | 暗黑模式切换 |
| `theme-color-changed` | 主题色变更 |
| `zoom-ratio-feedback` | 缩放比例变更 |
| `remote-control-msg` | 远程控制指令 |

### 3.8 快捷键系统

定义五种快捷键，默认组合为 `Ctrl+Alt+Shift+按键`（macOS 为 `Cmd+Alt+Shift+按键`）：

| 快捷键 | 功能 |
|--------|------|
| StartOrStop (S) | 开始/暂停计时 |
| ShowOrHide (W) | 显示/隐藏窗口 |
| Settings (P) | 打开设置 |
| BackHome (B) | 返回主页 |
| NextPeriod (N) | 跳过当前周期 |
| MiniMode (M) | 进入/退出迷你模式 |

用户可在设置页面自定义快捷键，通过 `globalShortcut.register()` 注册。

---

## 四、文件分类与功能详解

### 4.1 核心 JavaScript 文件（根目录）

#### [main.js](main.js) — 主进程入口（~2886 行）

是整个应用的"司令部"，负责：

- **窗口管理**：创建、显示、隐藏、关闭主窗口及所有子窗口
- **应用生命周期**：`app.on('ready')` 初始化所有功能
- **IPC 通信处理**：接收渲染进程消息并响应（20+ 个 ipcMain.on 处理器）
- **数据统计**：`statisticsInitializer()` 初始化、`statisticsWriter()` 记录、`statisticsPauseDealer()` 暂停处理
- **专注模式**：`focusSolution()` / `nonFocusSolution()` 控制全屏专注
- **多屏方案**：`multiScreenSolution()` / `addScreenSolution()` 管理多显示器
- **系统托盘**：`traySolution()` 构建托盘菜单
- **快捷键**：`hotkeyInit()` 注册全局快捷键
- **暗黑模式**：`isDarkMode()` / `theThemeHasChanged()` 响应系统主题变化
- **通知**：`notificationSolution()` 统一通知接口
- **自定义对话框**：`customDialog()` 通用弹窗
- **更新检测**：`update-feedback` IPC 处理更新通知
- **密码锁**：`locker()` 模式管理
- **退出守卫**：`requestAppExitWithGuard()` 安全退出流程
- **WebDAV 集成**：初始化并向 WebDAV 服务提供主进程能力
- **触摸栏**：`touchBarSolution()` macOS Touch Bar 支持

#### [renderer.js](renderer.js) — 渲染进程补丁

- 锁定模式 UI 调整（隐藏退出按钮等）
- 自定义 Tooltip 实现（`titleAlternative`）
- 窗口尺寸缩放（`zoomRatioChange()`）
- 监听暗黑模式和缩放变更事件

#### [supporter.js](supporter.js) — 通用支持库

每个 HTML 页面都会引入的基础文件：

- 初始化 `electron-store` 实例（store、styleCache、timingData）
- 配置 i18n 国际化
- 暗黑模式 CSS 动态注入（`isInDark()`）
- 音频放大器工具函数（`amplifyMedia()`）
- 自启动设置（`autostartAfter()`）
- 通用 IPC 工具函数（`isTimerWindow()`、`call()`、`getHelp()`）
- 主题色变量初始化

#### [updater.js](updater.js) — 更新检测

- 从 Gitee 仓库获取最新版本号
- 使用 `compare-version` 比较版本
- 支持自动检测和手动检测
- 每日检查一次（间隔 > 86400000ms）
- 通过 IPC 将结果发送给主进程处理

#### [theme.js](theme.js) — 主题色管理

- 从 `store.get("theme-color")` 读取四种角色颜色
- `applyTheme()` 动态生成 `<style>` 标签注入 CSS
- `reloadTheme()` 响应主题色变更事件
- 覆盖框架默认颜色，实现全应用统一配色

#### [preferences-items.js](preferences-items.js) — 设置项定义

定义了所有设置项的配置数组，包括：

- **计时设置**：预定义任务、自动启动任务、简单倒计时、任务预约、松散模式、强制锁屏、计时强度控制、百分比休息、长休息等
- **通知设置**：时间段结束行为、一分钟提示、即将完成提示、小憩设置、闹钟提示、音效、个性化通知
- **全局设置**：语言、缩放、每周起始日、暗黑模式、自启动、Dock 隐藏、置顶、默认页面、更新检测、快捷键、数据管理、密码锁、主题色

#### [preferences-renderer.js](preferences-renderer.js) — 设置页渲染引擎（~1550 行）

动态构建设置页面的完整引擎：

- `preferenceCreator()`：遍历配置数组，根据 type 分发到对应渲染函数
- **四种基础控件类型**：
  - `title`：分组标题
  - `selection`：开关/复选框
  - `dropdown`：下拉选择菜单
  - `collapse`：可折叠区域
- **自定义控件**（通过 `customSolution()` 处理）：
  - `predefined`：预定义任务列表编辑
  - `task-reservation`：任务预约设置
  - `personalization-notification`：个性化通知文本
  - `personalization-notify-sound`：自定义通知音效
  - `i18n`：语言选择
  - `hotkey`：快捷键配置
  - `data-management`：数据管理（备份/导入/WebDAV）
  - `locker`：密码锁设置
  - `theme-color`：主题色选择
  - `open-notification-settings`：系统通知设置入口
  - `autocheck`：自动更新检测开关
  - `simple-countdown-settings`：简单倒计时设置

#### [webdav-sync.js](webdav-sync.js) — WebDAV 云同步服务

完整的 WebDAV 同步实现：

- 同步三个文件：config.json、statistics.json、recap.json
- 支持操作：启动拉取、手动上传/下载、退出前推送、连接测试
- 密码使用 keytar 存入系统密钥链
- 退出前未同步数据提醒
- 自动同步（配置变更后自动推送）
- 操作优先级管理

### 4.2 HTML 页面文件（根目录）

| 文件 | 功能描述 |
|------|----------|
| [index.html](index.html) | **主页面**：提供计时配置入口，包含工作时间、休息时间、循环次数设置，预定义任务下拉菜单，仅休息模式切换，正计时入口，任务总时长预览，专注模式开关，任务预约自动触发 |
| [timer.html](timer.html) | **计时页面**：计时运行时的核心界面，显示剩余时间、进度条、当前工作/休息状态，提供暂停/跳过/返回等控制按钮，支持迷你模式和外置标题窗口启动 |
| [statistics.html](statistics.html) | **统计页面**：以图表和列表形式展示日/月/年维度的计时统计数据，使用 schart.js 绘制可视化图表 |
| [preferences.html](preferences.html) | **设置页面**：加载 preferences-renderer.js 动态渲染所有设置项 |
| [about.html](about.html) | **关于页面**：显示版本信息、版权、许可证、依赖致谢 |
| [floating.html](floating.html) | **迷你模式窗口**：悬浮小窗显示剩余时间，支持简单的暂停/跳过操作，可自由拖动位置 |
| [external-title.html](external-title.html) | **外置标题窗口**：独立显示当前任务标题和备注，适合在专注模式下查看 |
| [custom-dialog.html](custom-dialog.html) | **自定义对话框**：通用的模态弹窗，支持普通提示、确认选择和更新通知三种类型 |
| [placeholder.html](placeholder.html) | **占位窗口**：专注模式下在副显示器上显示的全屏遮挡页面 |
| [tourguide.html](tourguide.html) | **新手引导**：首次启动时显示的功能导览 |

### 4.3 样式文件

| 文件 | 功能 |
|------|------|
| `style.css` | 全局样式表，覆盖 Bootstrap 默认样式 |
| `loader.css` | 页面加载动画 |

### 4.4 国际化文件（[locales/](locales/)）

| 文件 | 语言 |
|------|------|
| [en.json](locales/en.json) | English（英语） |
| [zh-CN.json](locales/zh-CN.json) | 简体中文 |
| [zh-TW.json](locales/zh-TW.json) | 正體中文（繁體） |
| [ko.json](locales/ko.json) | 한국어（韩语） |

### 4.5 资源文件（[res/](res/)）

| 目录 | 内容 |
|------|------|
| `res/builder/` | 各平台打包构建脚本（NSIS、DMG、AppImage、7zip等） |
| `res/builder/output/` | 构建输出处理脚本（压缩、代码最小化等） |
| `res/fonts/` | Iconfont 图标字体 |
| `res/icons/` | 应用图标（Windows .ico、macOS .icns、多尺寸 PNG） |
| `res/icons/overlay/` | Windows 任务栏叠加图标（1-61 分钟数字图标） |
| `res/sound/` | 通知音效文件（alarming、beep、clock、tick、trumpet、whistle、horns、magic、piano） |
| `res/tourguide/` | 新手引导图片资源 |

### 4.6 配置文件

| 文件 | 功能 |
|------|------|
| [package.json](package.json) | 项目元数据、依赖声明、构建脚本 |
| `.editorconfig` | 编辑器统一配置 |
| `.gitignore` | Git 忽略规则 |
| `.yarnrc.yml` | Yarn 包管理器配置 |
| `update.json` | 最新版本信息与发布说明 |
| `.github/workflows/build.yaml` | CI/CD 自动构建工作流 |

### 4.7 文档文件

| 文件 | 内容 |
|------|------|
| [README.md](README.md) | 项目英文介绍 |
| [README.zh-CN.md](README.zh-CN.md) | 简体中文介绍 |
| [README.zh-TW.md](README.zh-TW.md) | 正體中文介绍 |
| [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) | 开发者指南 |
| [LICENSE](LICENSE) | MPL-2.0 许可证 |
| [NOTICE.md](NOTICE.md) | 第三方依赖许可证声明 |
| [locales/README.md](locales/README.md) | 翻译贡献指南 |

---

## 五、应用工作流程

### 5.1 启动流程

```
1. app.on('ready') 触发
2. 加载 electron-store 数据
3. 初始化 WebDAV 同步服务
4. 配置 i18n 语言
5. 应用主题（暗黑模式检测）
6. 初始化统计数据结构
7. 注册全局快捷键
8. 应用兼容性数据迁移
9. 创建系统托盘
10. 创建自定义对话框窗口
11. 执行 WebDAV 启动同步（此时窗口不显示）
12. 加载主页面 (index.html)
13. WebDAV 同步完成后显示窗口
14. 检测是否需要显示新手引导
15. 检测是否有未完成的计时需要恢复
16. 检测是否需要自动启动任务
17. 启动任务预约定时检测
```

### 5.2 计时流程

```
1. 用户在 index.html 配置参数
2. 跳转到 timer.html?参数...
3. timer.html 解析 URL 参数初始化计时器
4. 调用 isTimerWindow(true) 通知主进程
5. 主进程：开启电源管理、更新托盘菜单
6. 如需专注模式：调用 focusSolution()
7. setInterval 每秒执行 clock()
8. 每秒通过 IPC 更新：进度条、托盘、迷你窗
9. 周期结束 → skipper() → 切换 工作↔休息
10. 全部完成 → ender() → 通知用户
11. 用户确认后返回 index.html
```

### 5.3 退出流程

```
1. windowCloseChk() 弹出确认对话框
2. 用户确认后调用 requestAppExitWithGuard()
3. → 执行 statisticsWriter() 保存计时数据
4. → 如 WebDAV 已启用且未同步，弹出同步确认
5. → 执行 WebDAV 退出前推送
6. → 关闭所有窗口、清除快捷键、销毁托盘
7. → app.exit(0) 退出应用
```

---

## 六、架构特点与评价

### 优点

- **功能丰富**：在简洁的界面下提供了大量实用功能
- **跨平台支持**：针对 Windows/macOS/Linux 有平台特定适配
- **专注模式强大**：Kiosk + 多屏屏蔽实现真正的强制专注
- **数据安全**：AES 加密备份、WebDAV 云同步
- **国际化完善**：四种语言支持，社区可贡献翻译
- **可定制性高**：主题色、音效、通知文本均可自定义

### 可改进方向

- `main.js` 过于庞大（~2886行），可拆分为多个模块
- `timer.html` 和 `index.html` 内含大量内联脚本，可提取为独立 JS 文件
- 可考虑迁移至 TypeScript 提升类型安全
- Electron 和依赖版本较旧，可适当升级

---

## 七、快速开发命令

```shell
yarn            # 安装依赖
yarn start      # 启动开发模式
yarn dir        # 构建可执行文件（测试用）
yarn nsis       # 构建 Windows NSIS 安装包
yarn 7zip       # 构建 Windows 便携版
yarn mac        # 构建 macOS 安装包
yarn linux      # 构建 Linux 安装包
yarn appimage   # 构建 Linux AppImage
```

---

> 本文档基于对 wnr v1.32.0 源码的全面阅读与分析整理而成。
