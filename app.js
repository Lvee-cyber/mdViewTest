(function () {
  "use strict";

  const { demoMarkdown, ui } = window.APP_CONTENT;
  const themeClassMap = {
    default: "default-theme",
    essay: "essay-theme",
    notebook: "notebook-theme",
    terminal: "terminal-theme",
    github: "github-theme"
  };
  const mermaidSources = new WeakMap();

  const state = {
    theme: localStorage.getItem("markview-theme") || "default",
    lang: localStorage.getItem("markview-language") || inferLanguage(),
    fontSize: Number(localStorage.getItem("markview-fontsize")) || 17,
    measure: localStorage.getItem("markview-measure") || "comfortable",
    outlineCollapsed: localStorage.getItem("markview-outline-collapsed") === "1",
    markdown: "",
    documentName: "",
    sourceType: "demo",
    customPreview: false,
    installPrompt: null,
    toastTimer: null
  };

  const elements = {
    langSelect: byId("lang-select"),
    preview: byId("preview-content"),
    cardBg: byId("card-bg"),
    viewerShell: byId("viewer-shell"),
    outlineSidebar: byId("outline-sidebar"),
    outlineNav: byId("outline-nav"),
    outlineTitle: byId("outline-title"),
    outlineCount: byId("outline-count"),
    outlineEmpty: byId("outline-empty"),
    outlineToggle: byId("outline-toggle"),
    outlineReopen: byId("outline-reopen"),
    outlineBackdrop: byId("outline-backdrop"),
    themeTrigger: byId("theme-trigger"),
    themePopover: byId("theme-popover"),
    popoverBackdrop: byId("popover-backdrop"),
    appearGroup: byId("appear-group"),
    themeList: byId("theme-list"),
    openFileButton: byId("open-file-btn"),
    openLinkButton: byId("open-link-btn"),
    installButton: byId("install-app-btn"),
    fileInput: byId("file-input"),
    fontValue: byId("fontsize-value"),
    fontMinus: byId("fontsize-minus"),
    fontPlus: byId("fontsize-plus"),
    measureSelect: byId("measure-select"),
    closeButton: byId("card-close-btn"),
    copyButton: byId("copy-markdown-btn"),
    dropOverlay: byId("drop-overlay"),
    connectionStatus: byId("connection-status"),
    connectionLabel: byId("connection-label"),
    documentName: byId("document-name"),
    documentMeta: byId("document-meta"),
    readingProgress: byId("reading-progress-bar"),
    progressLabel: byId("progress-label"),
    linkModal: byId("link-modal"),
    linkModalBackdrop: byId("link-modal-backdrop"),
    linkModalClose: byId("link-modal-close"),
    linkCancel: byId("link-cancel-btn"),
    linkForm: byId("link-form"),
    linkInput: byId("link-input"),
    linkSubmit: byId("link-submit-btn"),
    toast: byId("toast")
  };

  const renderer = new marked.Renderer();
  renderer.code = function (token) {
    const source = typeof token === "object" ? token.text || "" : String(token || "");
    const language =
      typeof token === "object" ? token.lang || "" : String(arguments[1] || "");

    if (language.toLowerCase() === "mermaid") {
      return `<div class="mermaid-container"><code class="mermaid-source">${escapeHtml(
        source
      )}</code></div>`;
    }

    let highlighted = escapeHtml(source);
    if (window.hljs) {
      if (language && hljs.getLanguage(language)) {
        highlighted = hljs.highlight(source, { language }).value;
      } else {
        highlighted = hljs.highlightAuto(source).value;
      }
    }

    return `<pre data-language="${escapeHtml(language || "text")}"><code class="hljs language-${escapeHtml(
      language
    )}">${highlighted}</code></pre>`;
  };

  renderer.link = function (token) {
    const href = typeof token === "object" ? token.href : arguments[0];
    const title = typeof token === "object" ? token.title : arguments[1];
    const text = typeof token === "object" ? token.text : arguments[2];
    const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
    return `<a href="${escapeHtml(href || "#")}"${titleAttribute}>${text || ""}</a>`;
  };

  marked.setOptions({ gfm: true, breaks: false, renderer });
  configureMermaid();

  function byId(id) {
    return document.getElementById(id);
  }

  function inferLanguage() {
    const value = navigator.language || "en";
    if (value.startsWith("zh")) return "zh-Hans";
    if (value.startsWith("ja")) return "ja";
    if (value.startsWith("ko")) return "ko";
    return "en";
  }

  function currentUi() {
    return ui[state.lang] || ui.en;
  }

  function copyValue(key, fallback) {
    return currentUi()[key] || ui.en[key] || fallback;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function configureMermaid() {
    if (!window.mermaid) return;
    const dark = document.documentElement.dataset.theme === "dark";
    const terminal = state.theme === "terminal";
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      suppressErrorRendering: true,
      theme: "base",
      htmlLabels: false,
      flowchart: { htmlLabels: false },
      themeVariables: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif',
        primaryColor: dark ? (terminal ? "#163526" : "#243044") : "#edf4ff",
        primaryTextColor: dark ? "#f2f6f4" : terminal ? "#173b2c" : "#1f2937",
        primaryBorderColor: dark ? "#63806f" : terminal ? "#6e9c80" : "#9db7da",
        lineColor: dark ? "#9aa7b6" : terminal ? "#52745f" : "#718096",
        secondaryColor: dark ? "#27272a" : "#f5f2ea",
        tertiaryColor: dark ? "#18181b" : "#ffffff"
      }
    });
  }

  function applyUiCopy() {
    const copy = currentUi();
    document.documentElement.lang = state.lang;
    document.title = copy.title;
    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", copy.description);
    elements.langSelect.value = state.lang;
    byId("hero-badge").textContent = copy.badge;
    elements.openFileButton.textContent = copy.openFile;
    elements.openLinkButton.textContent = copy.openLink;
    elements.installButton.textContent = copy.installApp || "Install";
    elements.outlineTitle.textContent = copy.outline;
    elements.outlineEmpty.textContent = copy.outlineEmpty;
    byId("label-appearance").textContent = copy.appearance;
    byId("label-theme").textContent = copy.theme;
    byId("label-fontsize").textContent = copy.fontSize;
    byId("label-measure").textContent = copy.measure || "Measure";
    byId("drop-text").textContent = copy.drop;
    byId("link-modal-title").textContent = copy.linkModalTitle || copy.openLink;
    byId("link-modal-desc").textContent =
      copy.linkModalDesc || "Content is processed in this browser.";
    byId("link-input-label").textContent = copy.linkInputLabel || "URL";
    byId("link-note").textContent = copy.linkNote || copy.localUrlHint;
    byId("link-cancel-btn").textContent = copy.cancel || "Cancel";
    elements.linkSubmit.textContent = copy.loadLink || copy.openLink;
    elements.copyButton.textContent = copy.copyMarkdown || "Copy source";
    elements.closeButton.textContent = copy.backToDemo || "Back to demo";

    const measureOptions = {
      narrow: copy.measureNarrow || "Narrow",
      comfortable: copy.measureComfortable || "Comfortable",
      wide: copy.measureWide || "Wide"
    };
    for (const option of elements.measureSelect.options) {
      option.textContent = measureOptions[option.value];
    }

    for (const button of elements.themeList.querySelectorAll(".theme-option")) {
      const config = copy.themes[button.dataset.theme];
      if (!config) continue;
      button.querySelector(".theme-name").textContent = config[0];
      button.querySelector(".theme-sub").textContent = config[1];
    }

    updateDocumentMeta();
    updateConnectionStatus();
    applyTheme(state.theme);
  }

  function applyTheme(themeName) {
    const normalized = themeClassMap[themeName] ? themeName : "default";
    for (const className of Object.values(themeClassMap)) {
      elements.preview.classList.remove(className);
    }
    elements.preview.classList.add(themeClassMap[normalized]);

    elements.outlineSidebar.classList.remove(
      "outline-theme-default",
      "outline-theme-essay",
      "outline-theme-notebook",
      "outline-theme-terminal",
      "outline-theme-github"
    );
    elements.outlineSidebar.classList.add(`outline-theme-${normalized}`);

    state.theme = normalized;
    localStorage.setItem("markview-theme", normalized);
    for (const button of elements.themeList.querySelectorAll(".theme-option")) {
      button.classList.toggle("active", button.dataset.theme === normalized);
    }
    byId("aa-theme-name").textContent =
      currentUi().themes[normalized]?.[0] || normalized;
    renderMermaidBlocks();
  }

  function setAppearance(mode) {
    const normalized = ["system", "light", "dark"].includes(mode) ? mode : "system";
    const dark =
      normalized === "dark" ||
      (normalized === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.dataset.appearance = normalized;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute("content", dark ? "#09090b" : "#ece8df");
    localStorage.setItem("markview-appearance", normalized);

    for (const button of elements.appearGroup.querySelectorAll(".appear-option")) {
      button.classList.toggle("active", button.dataset.mode === normalized);
    }
    renderMermaidBlocks();
  }

  function setFontSize(size) {
    state.fontSize = Math.max(13, Math.min(28, Number(size) || 17));
    elements.preview.style.fontSize = `${state.fontSize}px`;
    elements.fontValue.textContent = `${state.fontSize}px`;
    localStorage.setItem("markview-fontsize", String(state.fontSize));
  }

  function setMeasure(measure) {
    const normalized = ["narrow", "comfortable", "wide"].includes(measure)
      ? measure
      : "comfortable";
    state.measure = normalized;
    elements.preview.dataset.measure = normalized;
    elements.measureSelect.value = normalized;
    localStorage.setItem("markview-measure", normalized);
  }

  function sanitizeHtml(html) {
    if (!window.DOMPurify) return html;
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target", "rel", "data-language"]
    });
  }

  function sanitizeSvg(svg) {
    if (!window.DOMPurify) return svg;
    return DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true }
    });
  }

  function renderMarkdown(markdown) {
    state.markdown = String(markdown || "");
    elements.preview.innerHTML = sanitizeHtml(marked.parse(state.markdown));
    enhanceLinks();

    if (window.renderMathInElement) {
      renderMathInElement(elements.preview, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
        throwOnError: false
      });
    }

    wrapTables();
    buildOutline();
    addCodeLabels();
    renderMermaidBlocks();
    updateDocumentMeta();
    elements.cardBg.scrollTop = 0;
    updateReadingProgress();
  }

  function enhanceLinks() {
    for (const link of elements.preview.querySelectorAll("a")) {
      const href = link.getAttribute("href") || "";
      if (/^https?:\/\//i.test(href)) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    }
  }

  function addCodeLabels() {
    for (const pre of elements.preview.querySelectorAll("pre[data-language]")) {
      const language = pre.dataset.language;
      if (!language || language === "text") continue;
      const label = document.createElement("span");
      label.className = "code-language";
      label.textContent = language;
      pre.appendChild(label);
    }
  }

  async function renderMermaidBlocks() {
    if (!window.mermaid) return;
    configureMermaid();
    const nodes = elements.preview.querySelectorAll(".mermaid-container");
    let index = 0;
    for (const node of nodes) {
      const source = mermaidSources.get(node) || node.textContent;
      if (!source) continue;
      mermaidSources.set(node, source);
      try {
        const id = `markview-mermaid-${Date.now()}-${index++}`;
        const { svg } = await mermaid.render(id, source);
        node.innerHTML = sanitizeSvg(svg);
      } catch (error) {
        node.innerHTML = `<div class="mermaid-error">${escapeHtml(
          copyValue("diagramError", "Diagram could not be rendered")
        )}</div>`;
      }
    }
  }

  function wrapTables() {
    for (const table of elements.preview.querySelectorAll("table")) {
      if (!table.parentElement?.classList.contains("table-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.className = "table-wrapper";
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    }

    for (const table of elements.preview.querySelectorAll("table")) {
      const headers = Array.from(table.querySelectorAll("thead th")).map((cell) =>
        cell.textContent.trim().toLowerCase()
      );
      const comparison =
        headers.length >= 3 &&
        ["主题", "theme"].includes(headers[0]) &&
        ["风格", "style"].includes(headers[1]);
      if (!comparison) continue;

      table.classList.add("theme-comparison-table");
      for (const row of table.querySelectorAll("tbody tr")) {
        const key = row.querySelector("td")?.textContent.trim().toLowerCase();
        if (themeClassMap[key]) row.classList.add(`theme-row-${key}`);
      }
    }
  }

  function slugifyHeading(text, index) {
    const base = text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-");
    return base ? `section-${base}-${index}` : `section-${index}`;
  }

  function buildOutline() {
    const headings = Array.from(elements.preview.querySelectorAll("h1, h2, h3"));
    elements.outlineNav.innerHTML = "";
    elements.outlineCount.textContent = formatHeadingCount(headings.length);

    if (!headings.length) {
      elements.outlineNav.appendChild(elements.outlineEmpty);
      return;
    }

    const fragment = document.createDocumentFragment();
    headings.forEach((heading, index) => {
      heading.id = heading.id || slugifyHeading(heading.textContent || "", index + 1);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `outline-link outline-link-${heading.tagName.toLowerCase()}`;
      button.textContent = heading.textContent || "";
      button.dataset.targetId = heading.id;
      button.addEventListener("click", () => {
        elements.cardBg.scrollTo({
          top: Math.max(0, heading.offsetTop - 82),
          behavior: "smooth"
        });
        if (window.matchMedia("(max-width: 880px)").matches) setOutlineCollapsed(true);
      });
      fragment.appendChild(button);
    });
    elements.outlineNav.appendChild(fragment);
    syncOutlineActive();
  }

  function formatHeadingCount(count) {
    const copy = currentUi();
    if (copy.headingCount) return copy.headingCount.replace("{count}", count);
    return `${count} headings`;
  }

  function syncOutlineActive() {
    const headings = Array.from(elements.preview.querySelectorAll("h1, h2, h3"));
    if (!headings.length) return;

    let activeId = headings[0].id;
    const marker = elements.cardBg.scrollTop + 110;
    for (const heading of headings) {
      if (heading.offsetTop <= marker) activeId = heading.id;
    }
    for (const link of elements.outlineNav.querySelectorAll(".outline-link")) {
      link.classList.toggle("active", link.dataset.targetId === activeId);
    }
  }

  function setOutlineCollapsed(collapsed) {
    state.outlineCollapsed = Boolean(collapsed);
    elements.outlineSidebar.classList.toggle("collapsed", state.outlineCollapsed);
    elements.viewerShell.classList.toggle(
      "outline-is-collapsed",
      state.outlineCollapsed
    );
    elements.outlineBackdrop.classList.toggle(
      "visible",
      !state.outlineCollapsed && window.matchMedia("(max-width: 880px)").matches
    );
    elements.outlineToggle.setAttribute(
      "aria-label",
      state.outlineCollapsed ? copyValue("openOutline", "Open outline") : copyValue("closeOutline", "Close outline")
    );
    localStorage.setItem(
      "markview-outline-collapsed",
      state.outlineCollapsed ? "1" : "0"
    );
  }

  function updateDocumentMeta() {
    const copy = currentUi();
    const name =
      state.documentName ||
      (state.sourceType === "demo" ? copy.demoDocumentName || "MarkView Demo" : "Markdown");
    const stats = getReadingStats(state.markdown);
    const sourceLabel =
      {
        demo: copy.sourceDemo || "Demo",
        file: copy.sourceFile || "Local file",
        url: copy.sourceUrl || "URL",
        paste: copy.sourcePaste || "Pasted"
      }[state.sourceType] || "";

    elements.documentName.textContent = name;
    elements.documentMeta.textContent = `${sourceLabel} · ${stats.words} ${
      copy.wordUnit || "words"
    } · ${copy.readingTime?.replace("{minutes}", stats.minutes) || `${stats.minutes} min`}`;
  }

  function getReadingStats(markdown) {
    const plain = String(markdown || "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[#>*_~|$-]/g, " ");
    const cjk = plain.match(/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/g)?.length || 0;
    const latin = plain.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length || 0;
    const words = cjk + latin;
    return {
      words,
      minutes: Math.max(1, Math.ceil(cjk / 400 + latin / 220))
    };
  }

  function updateReadingProgress() {
    const maxScroll = Math.max(
      0,
      elements.cardBg.scrollHeight - elements.cardBg.clientHeight
    );
    const progress =
      maxScroll === 0 ? 100 : Math.min(100, (elements.cardBg.scrollTop / maxScroll) * 100);
    const rounded = Math.round(progress);
    elements.readingProgress.style.width = `${progress}%`;
    elements.progressLabel.textContent = `${rounded}%`;
    syncOutlineActive();
  }

  function loadDemo() {
    state.customPreview = false;
    state.sourceType = "demo";
    state.documentName = copyValue("demoDocumentName", "MarkView Demo");
    elements.closeButton.hidden = true;
    renderMarkdown(demoMarkdown[state.lang] || demoMarkdown.en);
  }

  function openCustom(markdown, metadata) {
    state.customPreview = true;
    state.sourceType = metadata?.sourceType || "file";
    state.documentName = metadata?.name || "Markdown";
    elements.closeButton.hidden = false;
    renderMarkdown(markdown);
  }

  function handleFile(file) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["md", "markdown", "txt"].includes(extension)) {
      showToast(copyValue("unsupportedFile", "Please choose a Markdown or text file"), "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) =>
      openCustom(String(event.target?.result || ""), {
        sourceType: "file",
        name: file.name
      });
    reader.onerror = () =>
      showToast(copyValue("fileReadError", "Could not read this file"), "error");
    reader.readAsText(file);
  }

  function openLinkModal() {
    closePopover();
    elements.linkModal.inert = false;
    elements.linkModal.setAttribute("aria-hidden", "false");
    elements.linkModal.classList.add("visible");
    elements.linkModalBackdrop.classList.add("visible");
    requestAnimationFrame(() => elements.linkInput.focus());
  }

  function closeLinkModal() {
    elements.linkModal.classList.remove("visible");
    elements.linkModalBackdrop.classList.remove("visible");
    elements.linkModal.inert = true;
    elements.linkModal.setAttribute("aria-hidden", "true");
    elements.linkForm.reset();
  }

  async function loadFromLink(rawValue) {
    const value = String(rawValue || "").trim();
    if (!value) return;
    if (!navigator.onLine) {
      showToast(copyValue("offlineLinkError", "Connect to the internet to open a URL"), "error");
      return;
    }
    if (/^file:/i.test(value)) {
      showToast(copyValue("localUrlHint", "Use Open File for local files"), "error");
      return;
    }

    let target;
    try {
      target = new URL(value, window.location.href);
    } catch {
      showToast(copyValue("invalidUrl", "Enter a valid URL"), "error");
      return;
    }

    elements.linkSubmit.disabled = true;
    elements.linkSubmit.textContent = copyValue("linkLoading", "Loading…");
    try {
      const response = await fetch(target.href, {
        headers: { Accept: "text/markdown,text/plain;q=0.9,*/*;q=0.5" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const markdown = await response.text();
      openCustom(markdown, {
        sourceType: "url",
        name: decodeURIComponent(target.pathname.split("/").pop() || target.hostname)
      });
      closeLinkModal();
      showToast(copyValue("linkLoaded", "Markdown loaded"));
    } catch {
      showToast(copyValue("linkFetchError", "Unable to load that URL"), "error");
    } finally {
      elements.linkSubmit.disabled = false;
      elements.linkSubmit.textContent = copyValue("loadLink", currentUi().openLink);
    }
  }

  async function copyMarkdown() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(state.markdown);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = state.markdown;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) throw new Error("copy failed");
      }
      showToast(copyValue("copied", "Markdown copied"));
    } catch {
      showToast(copyValue("copyFailed", "Copy failed"), "error");
    }
  }

  function showToast(message, type) {
    clearTimeout(state.toastTimer);
    elements.toast.textContent = message;
    elements.toast.dataset.type = type || "success";
    elements.toast.classList.add("visible");
    state.toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 2800);
  }

  function updateConnectionStatus() {
    const localFile = window.location.protocol === "file:";
    const offline = !navigator.onLine;
    const status = localFile ? "local" : offline ? "offline" : "ready";
    elements.connectionStatus.dataset.status = status;
    elements.connectionLabel.textContent =
      status === "local"
        ? copyValue("statusLocal", "Local mode")
        : status === "offline"
          ? copyValue("statusOffline", "Offline")
          : copyValue("statusReady", "Local ready");
    elements.openLinkButton.disabled = offline;
  }

  function togglePopover() {
    const visible = elements.themePopover.classList.toggle("visible");
    elements.themePopover.inert = !visible;
    elements.themePopover.setAttribute("aria-hidden", String(!visible));
    elements.popoverBackdrop.classList.toggle("visible", visible);
    elements.themeTrigger.classList.toggle("active", visible);
    elements.themeTrigger.setAttribute("aria-expanded", String(visible));
  }

  function closePopover() {
    elements.themePopover.classList.remove("visible");
    elements.themePopover.inert = true;
    elements.themePopover.setAttribute("aria-hidden", "true");
    elements.popoverBackdrop.classList.remove("visible");
    elements.themeTrigger.classList.remove("active");
    elements.themeTrigger.setAttribute("aria-expanded", "false");
  }

  function registerOfflineSupport() {
    if (!("serviceWorker" in navigator) || window.location.protocol === "file:") return;
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      showToast(copyValue("offlineSetupError", "Offline setup was not completed"), "error");
    });

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      state.installPrompt = event;
      elements.installButton.hidden = false;
    });
    window.addEventListener("appinstalled", () => {
      state.installPrompt = null;
      elements.installButton.hidden = true;
      showToast(copyValue("installed", "App installed"));
    });
  }

  async function installApp() {
    if (!state.installPrompt) return;
    await state.installPrompt.prompt();
    state.installPrompt = null;
    elements.installButton.hidden = true;
  }

  function initEvents() {
    elements.langSelect.addEventListener("change", (event) => {
      state.lang = event.target.value;
      localStorage.setItem("markview-language", state.lang);
      applyUiCopy();
      if (!state.customPreview) loadDemo();
    });

    elements.themeTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePopover();
    });
    elements.popoverBackdrop.addEventListener("click", closePopover);
    elements.appearGroup.addEventListener("click", (event) => {
      const button = event.target.closest(".appear-option");
      if (button) setAppearance(button.dataset.mode);
    });
    elements.themeList.addEventListener("click", (event) => {
      const button = event.target.closest(".theme-option");
      if (button) applyTheme(button.dataset.theme);
    });
    elements.fontMinus.addEventListener("click", () => setFontSize(state.fontSize - 1));
    elements.fontPlus.addEventListener("click", () => setFontSize(state.fontSize + 1));
    elements.measureSelect.addEventListener("change", (event) =>
      setMeasure(event.target.value)
    );

    elements.openFileButton.addEventListener("click", () => elements.fileInput.click());
    elements.fileInput.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (file) handleFile(file);
      elements.fileInput.value = "";
    });
    elements.openLinkButton.addEventListener("click", openLinkModal);
    elements.installButton.addEventListener("click", installApp);
    elements.closeButton.addEventListener("click", loadDemo);
    elements.copyButton.addEventListener("click", copyMarkdown);

    elements.outlineToggle.addEventListener("click", () => setOutlineCollapsed(true));
    elements.outlineReopen.addEventListener("click", () => setOutlineCollapsed(false));
    elements.outlineBackdrop.addEventListener("click", () => setOutlineCollapsed(true));
    elements.cardBg.addEventListener("scroll", updateReadingProgress, { passive: true });

    elements.linkModalClose.addEventListener("click", closeLinkModal);
    elements.linkCancel.addEventListener("click", closeLinkModal);
    elements.linkModalBackdrop.addEventListener("click", closeLinkModal);
    elements.linkForm.addEventListener("submit", (event) => {
      event.preventDefault();
      loadFromLink(elements.linkInput.value);
    });

    let dragDepth = 0;
    document.addEventListener("dragenter", (event) => {
      event.preventDefault();
      dragDepth += 1;
      elements.dropOverlay.classList.add("visible");
    });
    document.addEventListener("dragover", (event) => event.preventDefault());
    document.addEventListener("dragleave", (event) => {
      event.preventDefault();
      dragDepth -= 1;
      if (dragDepth <= 0) {
        dragDepth = 0;
        elements.dropOverlay.classList.remove("visible");
      }
    });
    document.addEventListener("drop", (event) => {
      event.preventDefault();
      dragDepth = 0;
      elements.dropOverlay.classList.remove("visible");
      const file = event.dataTransfer?.files?.[0];
      if (file) handleFile(file);
    });
    document.addEventListener("paste", (event) => {
      if (elements.linkModal.classList.contains("visible")) return;
      const activeTag = document.activeElement?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)) return;
      const text = event.clipboardData?.getData("text/plain");
      if (!text?.trim()) return;
      event.preventDefault();
      openCustom(text, {
        sourceType: "paste",
        name: copyValue("pastedDocumentName", "Pasted Markdown")
      });
    });

    document.addEventListener("keydown", (event) => {
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === "o") {
        event.preventDefault();
        elements.fileInput.click();
      }
      if (command && event.shiftKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        openLinkModal();
      }
      if (command && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setOutlineCollapsed(!state.outlineCollapsed);
      }
      if (event.key === "Escape") {
        closePopover();
        closeLinkModal();
        if (window.matchMedia("(max-width: 880px)").matches) setOutlineCollapsed(true);
      }
    });

    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);
    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 880px)").matches) {
        elements.outlineBackdrop.classList.remove("visible");
      } else if (!state.outlineCollapsed) {
        elements.outlineBackdrop.classList.add("visible");
      }
      updateReadingProgress();
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (document.documentElement.dataset.appearance === "system") {
        setAppearance("system");
      }
    });
  }

  function init() {
    applyUiCopy();
    setAppearance(localStorage.getItem("markview-appearance") || "system");
    setFontSize(state.fontSize);
    setMeasure(state.measure);
    setOutlineCollapsed(
      window.matchMedia("(max-width: 880px)").matches ? true : state.outlineCollapsed
    );
    loadDemo();
    applyTheme(state.theme);
    initEvents();
    updateConnectionStatus();
    registerOfflineSupport();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
