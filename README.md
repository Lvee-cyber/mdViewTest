# MarkView Lab

一个本地优先的 Markdown 阅读器。支持大纲、5 套阅读主题、代码高亮、KaTeX
数学公式、Mermaid 图表、拖放/粘贴导入和离线使用。

## 直接使用本地离线版

下载或克隆整个仓库后，双击 `offline.html`。运行时不需要联网，文档只在当前浏览器
中读取和渲染。

本地双击模式支持：

- 打开 `.md`、`.markdown`、`.txt` 文件
- 拖放文件或粘贴 Markdown
- 大纲导航、主题、字号和行宽设置
- 代码高亮、数学公式和 Mermaid 图表

浏览器安全限制下，`file://` 本地路径不能通过“输入链接”读取；请使用“打开文件”。

## 本地服务器模式

如果需要测试 PWA 安装、Service Worker 或网络链接读取：

```bash
npm run serve
```

然后打开：

```text
http://localhost:4173/
```

## 在线离线能力

GitHub Pages 版本首次完整打开后，Service Worker 会缓存应用壳和所有渲染依赖。此后
即使断网，也能重新打开阅读器并读取本地 Markdown 文件。

## 快捷键

- `Cmd/Ctrl + O`：打开本地文件
- `Cmd/Ctrl + Shift + L`：打开链接输入
- `Cmd/Ctrl + B`：展开或收起大纲
- `Esc`：关闭弹窗或移动端大纲

## 开发依赖

运行依赖固定在 `package.json`，但生产页面只读取已提交到 `vendor/` 的本地文件，不依赖
`node_modules` 或外部 CDN。
