(function () {
  const { demoMarkdown, ui } = window.APP_CONTENT;

  const themeClassMap = {
    default: "default-theme",
    essay: "essay-theme",
    notebook: "notebook-theme",
    terminal: "terminal-theme",
    github: "github-theme"
  };

  const state = {
    theme: localStorage.getItem("markview-theme") || "default",
    lang: localStorage.getItem("markview-language") || inferLanguage(),
    fontSize: Number(localStorage.getItem("markview-fontsize")) || 17,
    customPreview: false
  };

  const langSelect = document.getElementById("lang-select");
  const preview = document.getElementById("preview-content");
  const cardBg = document.getElementById("card-bg");
  const themeTrigger = document.getElementById("theme-trigger");
  const themePopover = document.getElementById("theme-popover");
  const popoverBackdrop = document.getElementById("popover-backdrop");
  const appearGroup = document.getElementById("appear-group");
  const themeList = document.getElementById("theme-list");
  const fontValue = document.getElementById("fontsize-value");
  const fontMinus = document.getElementById("fontsize-minus");
  const fontPlus = document.getElementById("fontsize-plus");
  const closeButton = document.getElementById("card-close-btn");
  const dropOverlay = document.getElementById("drop-overlay");

  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang } = {}) => {
    const source = text || "";
    if (lang === "mermaid") {
      return `<div class="mermaid-container" data-mermaid="${escapeHtml(source)}"></div>`;
    }

    let highlighted = escapeHtml(source);
    if (lang && window.hljs?.getLanguage(lang)) {
      highlighted = hljs.highlight(source, { language: lang }).value;
    } else if (window.hljs) {
      highlighted = hljs.highlightAuto(source).value;
    }

    return `<pre><code class="hljs language-${lang || ""}">${highlighted}</code></pre>`;
  };

  marked.setOptions({
    gfm: true,
    breaks: false,
    renderer
  });

  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "base"
    });
  }

  function inferLanguage() {
    const value = navigator.language || "en";
    if (value.startsWith("zh")) return "zh-Hans";
    if (value.startsWith("ja")) return "ja";
    if (value.startsWith("ko")) return "ko";
    return "en";
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function currentUi() {
    return ui[state.lang] || ui.en;
  }

  function applyUiCopy() {
    const copy = currentUi();
    document.title = copy.title;
    document.documentElement.lang = state.lang;
    langSelect.value = state.lang;
    document.querySelector('meta[name="description"]').setAttribute("content", copy.description);
    document.getElementById("hero-badge").textContent = copy.badge;
    document.getElementById("download-copy").textContent = copy.download;
    document.getElementById("mobile-download-copy").textContent = copy.mobileDownload;
    document.getElementById("label-appearance").textContent = copy.appearance;
    document.getElementById("label-theme").textContent = copy.theme;
    document.getElementById("label-fontsize").textContent = copy.fontSize;
    document.getElementById("drop-text").textContent = copy.drop;

    for (const button of themeList.querySelectorAll(".theme-option")) {
      const config = copy.themes[button.dataset.theme];
      button.querySelector(".theme-name").textContent = config[0];
      button.querySelector(".theme-sub").textContent = config[1];
    }
  }

  function applyTheme(themeName) {
    for (const className of Object.values(themeClassMap)) {
      preview.classList.remove(className);
    }
    preview.classList.add(themeClassMap[themeName] || themeClassMap.default);
    state.theme = themeName;
    localStorage.setItem("markview-theme", themeName);

    for (const button of themeList.querySelectorAll(".theme-option")) {
      button.classList.toggle("active", button.dataset.theme === themeName);
    }

    document.getElementById("aa-theme-name").textContent = currentUi().themes[themeName][0];
    renderMermaidBlocks();
  }

  function setAppearance(mode) {
    document.documentElement.setAttribute("data-appearance", mode);
    const dark =
      mode === "dark" ||
      (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("markview-appearance", mode);

    for (const button of appearGroup.querySelectorAll(".appear-option")) {
      button.classList.toggle("active", button.dataset.mode === mode);
    }
    renderMermaidBlocks();
  }

  function setFontSize(size) {
    state.fontSize = Math.max(13, Math.min(28, size));
    preview.style.fontSize = `${state.fontSize}px`;
    fontValue.textContent = `${state.fontSize}px`;
    localStorage.setItem("markview-fontsize", String(state.fontSize));
  }

  function renderMarkdown(markdown) {
    preview.innerHTML = marked.parse(markdown);
    if (window.renderMathInElement) {
      renderMathInElement(preview, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });
    }
    wrapTables();
    renderMermaidBlocks();
    cardBg.scrollTop = 0;
  }

  async function renderMermaidBlocks() {
    if (!window.mermaid) return;
    const nodes = preview.querySelectorAll(".mermaid-container");
    let index = 0;
    for (const node of nodes) {
      const source = node.getAttribute("data-mermaid");
      if (!source) continue;
      const id = `mermaid-${Date.now()}-${index++}`;
      try {
        const { svg } = await mermaid.render(id, decodeHtml(source));
        node.innerHTML = svg;
      } catch (error) {
        node.innerHTML = `<div class="mermaid-error">${escapeHtml(error.message)}</div>`;
      }
    }
  }

  function decodeHtml(value) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value;
  }

  function wrapTables() {
    preview.querySelectorAll("table").forEach((table) => {
      if (table.parentElement?.classList.contains("table-wrapper")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "table-wrapper";
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    preview.querySelectorAll("table").forEach((table) => {
      const headerCells = Array.from(table.querySelectorAll("thead th")).map((cell) =>
        cell.textContent.trim().toLowerCase()
      );
      const isThemeComparison =
        headerCells.length >= 3 &&
        ["主题", "theme"].includes(headerCells[0]) &&
        ["风格", "style"].includes(headerCells[1]);

      if (!isThemeComparison) return;

      table.classList.add("theme-comparison-table");
      table.querySelectorAll("tbody tr").forEach((row) => {
        const firstCell = row.querySelector("td");
        if (!firstCell) return;
        const key = firstCell.textContent.trim().toLowerCase();
        const themeKeyMap = {
          default: "default",
          essay: "essay",
          notebook: "notebook",
          terminal: "terminal",
          github: "github"
        };
        const themeKey = themeKeyMap[key];
        if (themeKey) {
          row.classList.add(`theme-row-${themeKey}`);
        }
      });
    });
  }

  function loadDemo() {
    state.customPreview = false;
    closeButton.hidden = true;
    renderMarkdown(demoMarkdown[state.lang] || demoMarkdown.en);
  }

  function openCustom(markdown) {
    state.customPreview = true;
    closeButton.hidden = false;
    renderMarkdown(markdown);
  }

  function handleDroppedFile(file) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["md", "markdown"].includes(ext)) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      openCustom(String(event.target?.result || ""));
    };
    reader.readAsText(file);
  }

  function initEvents() {
    langSelect.addEventListener("change", (event) => {
      state.lang = event.target.value;
      localStorage.setItem("markview-language", state.lang);
      applyUiCopy();
      if (!state.customPreview) loadDemo();
      applyTheme(state.theme);
    });

    themeTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const visible = themePopover.classList.toggle("visible");
      popoverBackdrop.classList.toggle("visible", visible);
      themeTrigger.classList.toggle("active", visible);
    });

    popoverBackdrop.addEventListener("click", closePopover);
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!themePopover.classList.contains("visible")) return;
      if (themePopover.contains(target) || themeTrigger.contains(target)) return;
      closePopover();
    });

    appearGroup.addEventListener("click", (event) => {
      const button = event.target.closest(".appear-option");
      if (!button) return;
      setAppearance(button.dataset.mode);
    });

    themeList.addEventListener("click", (event) => {
      const button = event.target.closest(".theme-option");
      if (!button) return;
      applyTheme(button.dataset.theme);
    });

    fontMinus.addEventListener("click", () => setFontSize(state.fontSize - 1));
    fontPlus.addEventListener("click", () => setFontSize(state.fontSize + 1));
    closeButton.addEventListener("click", loadDemo);

    let dragDepth = 0;
    document.addEventListener("dragenter", (event) => {
      event.preventDefault();
      dragDepth += 1;
      dropOverlay.classList.add("visible");
    });
    document.addEventListener("dragover", (event) => event.preventDefault());
    document.addEventListener("dragleave", (event) => {
      event.preventDefault();
      dragDepth -= 1;
      if (dragDepth <= 0) {
        dragDepth = 0;
        dropOverlay.classList.remove("visible");
      }
    });
    document.addEventListener("drop", (event) => {
      event.preventDefault();
      dragDepth = 0;
      dropOverlay.classList.remove("visible");
      const file = event.dataTransfer?.files?.[0];
      if (file) handleDroppedFile(file);
    });

    document.addEventListener("paste", (event) => {
      const active = document.activeElement?.tagName;
      if (["INPUT", "TEXTAREA"].includes(active)) return;
      const text = event.clipboardData?.getData("text/plain");
      if (!text?.trim()) return;
      event.preventDefault();
      openCustom(text);
    });

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      const current = document.documentElement.getAttribute("data-appearance") || "system";
      if (current === "system") setAppearance("system");
    });
  }

  function closePopover() {
    themePopover.classList.remove("visible");
    popoverBackdrop.classList.remove("visible");
    themeTrigger.classList.remove("active");
  }

  function init() {
    applyUiCopy();
    setAppearance(localStorage.getItem("markview-appearance") || "system");
    setFontSize(state.fontSize);
    loadDemo();
    applyTheme(state.theme);
    initEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
