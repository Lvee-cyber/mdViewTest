window.APP_CONTENT = {
  demoMarkdown: {
    "zh-Hans": `# MarkView Lab

> **一个专注阅读体验的 Markdown 预览器**
> 不做协作，不做编辑，先把阅读这件事做好。

---

## 为什么这样设计？

这个网页本身就是产品 demo，而不是传统介绍页：

- 可以直接切换 5 套主题
- 可以切换深浅色模式和字号
- 支持代码高亮、KaTeX 数学公式、Mermaid 图表
- 可以把本地 \`.md\` 文件直接拖进来预览

---

## 代码高亮

\`\`\`ts
export function renderMarkdown(markdown: string, theme: string) {
  const html = marked.parse(markdown);
  return applyThemeShell(html, theme);
}
\`\`\`

\`\`\`python
def summarize(lines):
    return "\\n".join(line.strip() for line in lines if line.strip())
\`\`\`

---

## 数学公式

行内公式 $E = mc^2$ 可以自然嵌入文本。

块级公式：

$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$

$$
f(x) = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}
$$

---

## Mermaid 图表

\`\`\`mermaid
flowchart LR
  A["拖入 Markdown"] --> B["marked 解析"]
  B --> C["highlight.js 高亮"]
  C --> D["KaTeX 渲染公式"]
  D --> E["Mermaid 渲染图表"]
  E --> F["套用阅读主题"]
\`\`\`

---

## 表格

| 主题 | 风格 | 场景 |
|:--|:--|:--|
| Default | 干净中性 | 通用阅读 |
| Essay | 专栏排版 | 长文 |
| Notebook | 温暖笔记 | 个人记录 |
| Terminal | 极简等宽 | 技术草稿 |
| GitHub | 熟悉克制 | 技术文档 |

---

> 你现在看到的就是实际渲染结果。
> 把一份本地 Markdown 拖进来，体验会更直观。`,
    en: `# MarkView Lab

> **A Markdown preview surface tuned for reading**
> No accounts, no collaboration, no editing. Just a better reading layer.

---

## Why this format?

This page is the product demo itself:

- Switch across 5 curated themes
- Toggle appearance mode and font size
- Preview syntax highlighting, KaTeX math, and Mermaid diagrams
- Drag a local \`.md\` file straight into the window

---

## Syntax Highlighting

\`\`\`js
function applyTheme(themeName) {
  document.body.dataset.themeName = themeName;
}
\`\`\`

\`\`\`go
func Render(input string) string {
    return strings.TrimSpace(input)
}
\`\`\`

---

## Math Equations

Inline math like $a^2 + b^2 = c^2$ blends into prose.

$$
\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}
$$

$$
P(A|B)=\\frac{P(B|A)P(A)}{P(B)}
$$

---

## Mermaid Diagram

\`\`\`mermaid
flowchart LR
  A["Paste Markdown"] --> B["Parse with marked"]
  B --> C["Highlight code"]
  C --> D["Render math"]
  D --> E["Render Mermaid"]
  E --> F["Apply reading theme"]
\`\`\`

---

## Quote

> The faster the demo proves the value, the less copy the landing page needs.`,
    ja: `# MarkView Lab

> **読む体験に寄せた Markdown プレビュー**
> 編集より先に、読みやすさを設計するためのデモです。

---

## できること

- 5つのテーマ切替
- 外観モードと文字サイズの変更
- コードハイライト、KaTeX、Mermaid 対応
- ローカルの \`.md\` ファイルをドラッグして即プレビュー

---

\`\`\`rust
fn preview(markdown: &str) -> String {
    markdown.trim().to_string()
}
\`\`\`

$$
\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e
$$`,
    ko: `# MarkView Lab

> **읽기 경험에 집중한 Markdown 프리뷰**
> 복잡한 기능보다 먼저, 보기 좋은 렌더링을 만드는 데 초점을 맞췄습니다.

---

## 핵심 기능

- 5가지 테마
- 다크/라이트/시스템 모드
- 코드 하이라이팅, KaTeX, Mermaid
- 로컬 Markdown 파일 드래그 앤 드롭

---

\`\`\`swift
func render(markdown: String) -> String {
    markdown.trimmingCharacters(in: .whitespacesAndNewlines)
}
\`\`\`

$$
\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}
$$`
  },
  ui: {
    "zh-Hans": {
      title: "MarkView Lab",
      description:
        "轻量 Markdown 阅读预览页，支持精选主题、代码高亮、KaTeX 数学公式与 Mermaid 图表。",
      badge: "专注阅读的 Markdown 预览器",
      download: "下载应用，解锁完整体验",
      mobileDownload: "拖拽或粘贴 Markdown 立即试用。",
      appearance: "外观",
      theme: "主题",
      fontSize: "字号",
      drop: "拖放以预览",
      themes: {
        default: ["默认", "干净、通用的无衬线阅读"],
        essay: ["专栏", "适合长文的衬线排版"],
        notebook: ["手帐", "温暖柔和的笔记风格"],
        terminal: ["终端", "等宽、高对比的技术感"],
        github: ["GitHub", "熟悉克制的文档风格"]
      }
    },
    en: {
      title: "MarkView Lab",
      description:
        "A lightweight Markdown reading preview with curated themes, syntax highlighting, KaTeX math, and Mermaid diagrams.",
      badge: "Focused Markdown Reader",
      download: "Download the app to unlock the full experience",
      mobileDownload: "Paste or drop a markdown file to try it.",
      appearance: "Appearance",
      theme: "Theme",
      fontSize: "Font Size",
      drop: "Drop to Preview",
      themes: {
        default: ["Default", "Clean, versatile sans-serif"],
        essay: ["Essay", "Editorial serif for long reads"],
        notebook: ["Notebook", "Warm and personal notes"],
        terminal: ["Terminal", "Monospace and contrast-heavy"],
        github: ["GitHub", "Open-source familiar"]
      }
    },
    ja: {
      title: "MarkView Lab",
      description:
        "厳選テーマ、コードハイライト、KaTeX、Mermaid に対応した軽量 Markdown プレビュー。",
      badge: "読むための Markdown プレビュー",
      download: "アプリをダウンロードして完全版を利用",
      mobileDownload: "Markdown を貼り付けるかドラッグしてください。",
      appearance: "外観",
      theme: "テーマ",
      fontSize: "文字サイズ",
      drop: "ドロップして表示",
      themes: {
        default: ["標準", "汎用的でクリーン"],
        essay: ["書斎", "長文向けセリフ体"],
        notebook: ["手帳", "やわらかなノート風"],
        terminal: ["端末", "等幅でコントラスト強め"],
        github: ["GitHub", "見慣れた技術文書風"]
      }
    },
    ko: {
      title: "MarkView Lab",
      description:
        "엄선된 테마, 코드 하이라이팅, KaTeX, Mermaid를 지원하는 가벼운 Markdown 프리뷰.",
      badge: "읽기 중심 Markdown 프리뷰",
      download: "앱을 다운로드해 전체 경험을 사용하세요",
      mobileDownload: "Markdown을 붙여넣거나 드래그해 보세요.",
      appearance: "외관",
      theme: "테마",
      fontSize: "글자 크기",
      drop: "드롭하여 미리보기",
      themes: {
        default: ["기본", "깔끔하고 범용적"],
        essay: ["에세이", "장문용 세리프"],
        notebook: ["노트", "따뜻한 메모 스타일"],
        terminal: ["터미널", "고정폭, 강한 대비"],
        github: ["GitHub", "익숙한 문서 스타일"]
      }
    }
  }
};
