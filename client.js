/**
 * dsh-file-archive · client half
 *
 * Bundled as a `window.__ModuleLoader__` factory (no build step: plain JS +
 * React.createElement). Registers a sidebar panel icon, the `main` panel, and
 * `shell.overlay` modals. Talks to the host half over `/dsh-file-archive/*`.
 */
window.__ModuleLoader__.load({ id: "dsh-file-archive", factory: (require) => {
  var module = { exports: {} };
  var exports = module.exports;

  const React = require("react");
  const h = React.createElement;
  const {
    useState, useEffect, useRef, useMemo, useCallback, useSyncExternalStore,
  } = React;

  /* ================================================================== *
   * i18n
   * ================================================================== */

  const NS = "dsh-file-archive";

  const DICT = {
    zh: {
      nav: "文件归档",
      title: "文件归档管理",
      search: "搜索文件名",
      up: "上级目录",
      refresh: "刷新",
      move: "移动到…",
      delete: "删除",
      selectAll: "全选",
      selected: "已选 {n} 项",
      empty: "此目录暂无文件",
      emptyHint: "AI 在工作区生成的文件会出现在这里",
      loading: "加载中…",
      loadError: "加载失败",
      size: "大小",
      modified: "修改时间",
      open: "打开",
      preview: "预览",
      openContaining: "打开所在位置",
      moveHere: "移动到这里",
      newFolder: "新建文件夹",
      folderName: "文件夹名称",
      confirm: "确认",
      cancel: "取消",
      close: "关闭",
      deleteTitle: "删除到系统回收站",
      deleteConfirm: "以下 {n} 项将移入系统回收站，可在回收站中手动还原：",
      deleteDone: "已删除 {n} 项",
      deleteFailed: "删除失败",
      moveTitle: "移动到",
      moveDone: "已移动 {n} 项",
      moveFailed: "移动失败",
      destination: "目标文件夹",
      parent: "上级",
      deletions: "删除记录",
      deletionsTitle: "删除记录（请在系统回收站还原）",
      noDeletions: "暂无删除记录",
      deletedAt: "删除时间",
      originalPath: "原路径",
      name: "名称",
      folder: "文件夹",
      file: "文件",
      confirmMove: "移动",
      confirmDelete: "删除",
      back: "返回",
      previewUnsupported: "暂不支持预览此文件类型",
      truncated: "（内容过大，仅显示前 2MB）",
      copy: "复制",
      copyTo: "复制到…",
      rename: "重命名",
      copyTitle: "复制到",
      copyDone: "已复制 {n} 项",
      confirmCopy: "复制",
      renameTitle: "重命名",
      renameLabel: "新名称",
      renameConfirm: "重命名",
      renameDone: "已重命名",
      openRecycleBin: "打开系统回收站",
      sort: "排序",
      sortName: "名称",
      sortSize: "大小",
      sortTime: "修改时间",
      sortType: "类型",
      sortAsc: "升序",
      sortDesc: "降序",
      viewList: "列表视图",
      viewGrid: "网格视图",
      cancelled: "已取消",
      conflict: "目标已存在时",
      conflictRename: "自动重命名",
      conflictOverwrite: "覆盖",
      conflictSkip: "跳过",
      progress: "进度",
      cancelJob: "取消",
      contentSearch: "内容搜索",
      noResults: "无匹配",
      operations: "操作记录",
      opType: "类型",
      opTime: "时间",
      opTarget: "目标",
      compress: "压缩为 zip",
      extract: "解压",
      zipName: "压缩包名称",
      compressTitle: "压缩为 zip",
      compressConfirm: "压缩",
      compressDone: "已压缩",
      extractDone: "已解压",
    },
    en: {
      nav: "File Archive",
      title: "File Archive Manager",
      search: "Search files",
      up: "Up",
      refresh: "Refresh",
      move: "Move to…",
      delete: "Delete",
      selectAll: "Select all",
      selected: "{n} selected",
      empty: "No files here",
      emptyHint: "Files the agent produces in this workspace appear here",
      loading: "Loading…",
      loadError: "Failed to load",
      size: "Size",
      modified: "Modified",
      open: "Open",
      preview: "Preview",
      openContaining: "Show in folder",
      moveHere: "Move here",
      newFolder: "New folder",
      folderName: "Folder name",
      confirm: "Confirm",
      cancel: "Cancel",
      close: "Close",
      deleteTitle: "Move to system recycle bin",
      deleteConfirm: "The following {n} item(s) will move to the system recycle bin (restorable there):",
      deleteDone: "Deleted {n} item(s)",
      deleteFailed: "Delete failed",
      moveTitle: "Move to",
      moveDone: "Moved {n} item(s)",
      moveFailed: "Move failed",
      destination: "Destination folder",
      parent: "Up",
      deletions: "Deletion log",
      deletionsTitle: "Deletion log (restore from the system recycle bin)",
      noDeletions: "No deletions yet",
      deletedAt: "Deleted at",
      originalPath: "Original path",
      name: "Name",
      folder: "Folder",
      file: "File",
      confirmMove: "Move",
      confirmDelete: "Delete",
      back: "Back",
      previewUnsupported: "Preview not supported for this type",
      truncated: "(content too large, showing first 2MB)",
      copy: "Copy",
      copyTo: "Copy to…",
      rename: "Rename",
      copyTitle: "Copy to",
      copyDone: "Copied {n} item(s)",
      confirmCopy: "Copy",
      renameTitle: "Rename",
      renameLabel: "New name",
      renameConfirm: "Rename",
      renameDone: "Renamed",
      openRecycleBin: "Open system recycle bin",
      sort: "Sort",
      sortName: "Name",
      sortSize: "Size",
      sortTime: "Modified",
      sortType: "Type",
      sortAsc: "Ascending",
      sortDesc: "Descending",
      viewList: "List view",
      viewGrid: "Grid view",
      cancelled: "Cancelled",
      conflict: "When target exists",
      conflictRename: "Auto rename",
      conflictOverwrite: "Overwrite",
      conflictSkip: "Skip",
      progress: "Progress",
      cancelJob: "Cancel",
      contentSearch: "Content search",
      noResults: "No matches",
      operations: "Operation log",
      opType: "Type",
      opTime: "Time",
      opTarget: "Target",
      compress: "Compress to zip",
      extract: "Extract",
      zipName: "Archive name",
      compressTitle: "Compress to zip",
      compressConfirm: "Compress",
      compressDone: "Compressed",
      extractDone: "Extracted",
    },
  };

  let T = (k) => k;

  /* ================================================================== *
   * Modal store (shared across the panel and the overlay host)
   * ================================================================== */

  const modalStore = {
    state: { type: null, payload: null },
    listeners: new Set(),
    subscribe(cb) { this.listeners.add(cb); return () => this.listeners.delete(cb); },
    getSnapshot() { return this.state; },
    open(type, payload) { this.state = { type, payload }; this.listeners.forEach((cb) => cb()); },
    close() { this.state = { type: null, payload: null }; this.listeners.forEach((cb) => cb()); },
  };
  const useModal = () => useSyncExternalStore(
    modalStore.subscribe.bind(modalStore),
    modalStore.getSnapshot.bind(modalStore),
  );

  /* ================================================================== *
   * API client
   * ================================================================== */

  const api = {
    async get(path, params) {
      const u = new URL(path, location.origin);
      for (const [k, v] of Object.entries(params || {})) {
        if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
      }
      const r = await fetch(u);
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.ok === false) throw new Error(j.error || ("HTTP " + r.status));
      return j;
    },
    async post(path, body) {
      const r = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body || {}),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.ok === false) throw new Error(j.error || ("HTTP " + r.status));
      return j;
    },
    workspaces: () => api.get("/dsh-file-archive/workspaces"),
    browse: (path) => api.get("/dsh-file-archive/browse", { path }),
    text: (path) => api.get("/dsh-file-archive/text", { path }),
    dirList: (path) => api.get("/dsh-file-archive/dir-list", { path }),
    deletePaths: (paths) => api.post("/dsh-file-archive/delete", { paths }),
    mkdir: (parent, name) => api.post("/dsh-file-archive/mkdir", { parent, name }),
    deletions: () => api.get("/dsh-file-archive/deletions"),
    openContaining: (path) => api.post("/dsh-file-archive/open-containing", { path }),
    copy: (paths, destDir, conflict) => api.post("/dsh-file-archive/copy", { paths, destDir, conflict }),
    movePaths: (paths, destDir, conflict) => api.post("/dsh-file-archive/move", { paths, destDir, conflict }),
    rename: (path, newName) => api.post("/dsh-file-archive/rename", { path, newName }),
    openRecycleBin: () => api.post("/dsh-file-archive/open-recycle-bin", {}),
    job: (id) => api.get("/dsh-file-archive/job", { id }),
    cancelJob: (id) => api.post("/dsh-file-archive/cancel-job", { jobId: id }),
    searchContent: (root, query, caseSensitive) => api.post("/dsh-file-archive/search-content", { root, query, caseSensitive }),
    operations: () => api.get("/dsh-file-archive/operations"),
    compress: (paths, destDir, zipName, conflict) => api.post("/dsh-file-archive/compress", { paths, destDir, zipName, conflict }),
    extract: (path, destDir, conflict) => api.post("/dsh-file-archive/extract", { path, destDir, conflict }),
    bytesUrl: (path) => "/dsh-file-archive/bytes?path=" + encodeURIComponent(path),
    renderUrl: (path) => "/dsh-file-archive/render?path=" + encodeURIComponent(path),
  };

  /* ================================================================== *
   * utils
   * ================================================================== */

  function extOf(name) {
    const i = (name || "").lastIndexOf(".");
    return i < 0 ? "" : name.slice(i + 1).toLowerCase();
  }

  function joinPath(dir, name) {
    const d = dir.endsWith("\\") || dir.endsWith("/") ? dir : dir + "\\";
    return d + name;
  }

  function parentDir(p) {
    const cleaned = String(p || "").replace(/[\\/]+$/, "");
    const idx = Math.max(cleaned.lastIndexOf("\\"), cleaned.lastIndexOf("/"));
    if (idx <= 0) return p;
    const up = cleaned.slice(0, idx);
    return /^[a-zA-Z]:$/.test(up) ? up + "\\" : up;
  }

  function baseName(p) {
    const cleaned = String(p || "").replace(/[\\/]+$/, "");
    const idx = Math.max(cleaned.lastIndexOf("\\"), cleaned.lastIndexOf("/"));
    return idx < 0 ? cleaned : cleaned.slice(idx + 1);
  }

  function formatBytes(n) {
    if (n === undefined || n === null) return "";
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + " MB";
    return (n / 1024 / 1024 / 1024).toFixed(2) + " GB";
  }

  function formatTime(ms) {
    if (!ms) return "";
    const d = new Date(ms);
    const pad = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const CODE_EXT = new Set(["js","jsx","ts","tsx","mjs","cjs","py","c","cpp","cc","h","hpp","go","rs","java","cs","rb","php","sh","bat","ps1","css","scss","less","html","htm","xml","json","yaml","yml","toml","sql","vue","svelte"]);
  const DOC_EXT = new Set(["md","txt","text","log","doc","docx","rtf","rst","odt"]);
  const SHEET_EXT = new Set(["xls","xlsx","csv","tsv","ods"]);
  const IMAGE_EXT = new Set(["png","jpg","jpeg","webp","gif","bmp","svg","ico","avif"]);
  const ARCHIVE_EXT = new Set(["zip","7z","rar","tar","gz","bz2","xz","tgz"]);

  function kindOf(name, isDir) {
    if (isDir) return "folder";
    const ext = extOf(name);
    if (ext === "pdf") return "pdf";
    if (CODE_EXT.has(ext)) return "code";
    if (DOC_EXT.has(ext)) return "doc";
    if (SHEET_EXT.has(ext)) return "sheet";
    if (IMAGE_EXT.has(ext)) return "image";
    if (ARCHIVE_EXT.has(ext)) return "archive";
    return "file";
  }

  const KIND_COLOR = {
    folder: "#8a93a6",
    code: "#4a9eff",
    doc: "#27b5a8",
    sheet: "#2eb872",
    pdf: "#e5484d",
    image: "#9b6cff",
    archive: "#e8892e",
    file: "#8795a8",
  };

  /* ================================================================== *
   * geometric line glyphs
   * ================================================================== */

  const GLYPH_D = {
    folder: ["M1.5 3.5h4l1.6 1.6h7.4v7.4H1.5z"],
    code: ["M5.5 5l-3 3 3 3", "M10.5 5l3 3-3 3"],
    doc: ["M3.5 1.5h6l3 3v10H3.5z", "M9.5 1.5v3h3", "M5.5 8h5", "M5.5 10.5h5"],
    sheet: ["M2.5 2h11v12h-11z", "M2.5 6h11", "M6 6v8", "M10 6v8"],
    pdf: ["M3.5 1.5h6l3 3v10H3.5z", "M9.5 1.5v3h3", "M5.5 9h5"],
    image: ["M1.5 2.5h13v11h-13z", "M5.5 6.5a1.4 1.4 0 1 0 0-.01", "M2.5 12l3.5-3.5 2.5 2.5 3-3 3 3"],
    archive: ["M1.5 3.5h13v9h-13z", "M5 3.5V2h6v1.5", "M1.5 7h13"],
    file: ["M3.5 1.5h6l3 3v10H3.5z", "M9.5 1.5v3h3"],
    archiveMark: ["M3 3h10v10H3z", "M6 3V1.5h4V3", "M3 7h10", "M6.5 3v4"],
  };

  function Glyph({ kind, size, color }) {
    const ds = GLYPH_D[kind] || GLYPH_D.file;
    return h("svg", {
      viewBox: "0 0 16 16", width: size, height: size,
      fill: "none", stroke: color || "currentColor",
      strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round",
      "aria-hidden": true, style: { flex: "none" },
    }, ds.map((d, i) => h("path", { key: i, d })));
  }

  function pathSegments(p) {
    if (!p) return [];
    const cleaned = p.replace(/[\\/]+$/, "");
    const m = cleaned.match(/^([a-zA-Z]:)?(.*)$/);
    const drive = m[1] || "";
    const rest = (m[2] || "").replace(/^[\\/]+/, "");
    const parts = rest ? rest.split(/[\\/]/) : [];
    const segs = [];
    if (drive) segs.push({ label: drive, path: drive + "\\" });
    let acc = drive ? drive + "\\" : "";
    for (const part of parts) {
      acc += (acc.endsWith("\\") ? "" : "\\") + part;
      segs.push({ label: part, path: acc });
    }
    return segs;
  }

  function inlineMd(text) {
    const parts = [];
    const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      const t = m[0];
      if (t.startsWith("**")) parts.push(h("strong", null, t.slice(2, -2)));
      else if (t.startsWith("`")) parts.push(h("code", { className: "dfa-md-inline" }, t.slice(1, -1)));
      else if (t.startsWith("[")) {
        const lm = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        const href = lm && /^(https?:|mailto:|#)/i.test(lm[2]) ? lm[2] : null;
        parts.push(href ? h("a", { className: "dfa-md-a", href, target: "_blank", rel: "noopener" }, lm[1]) : lm[1]);
      } else parts.push(h("em", null, t.slice(1, -1)));
      last = m.index + t.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  }

  function renderMarkdown(text) {
    const lines = String(text || "").split("\n");
    const out = [];
    let codeBuf = [];
    let inCode = false;
    const flushCode = () => { if (codeBuf.length) { out.push(h("pre", { className: "dfa-md-code" }, codeBuf.join("\n"))); codeBuf = []; } };
    for (const line of lines) {
      if (line.startsWith("```")) {
        if (inCode) { flushCode(); inCode = false; } else inCode = true;
        continue;
      }
      if (inCode) { codeBuf.push(line); continue; }
      const hd = line.match(/^(#{1,6})\s+(.*)$/);
      if (hd) { out.push(h("div", { className: "dfa-md-h dfa-md-h" + hd[1].length }, inlineMd(hd[2]))); continue; }
      const li = line.match(/^\s*[-*+]\s+(.*)$/);
      if (li) { out.push(h("div", { className: "dfa-md-li" }, "\u2022 ", inlineMd(li[1]))); continue; }
      const bq = line.match(/^\s*>\s?(.*)$/);
      if (bq) { out.push(h("div", { className: "dfa-md-bq" }, inlineMd(bq[1]))); continue; }
      if (!line.trim()) { out.push(h("div", { style: { height: 8 } })); continue; }
      out.push(h("div", { className: "dfa-md-p" }, inlineMd(line)));
    }
    if (inCode) flushCode();
    return h("div", { className: "dfa-md" }, out);
  }

  function highlightCode(text) {
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`|\b(?:const|let|var|function|return|if|else|for|while|import|export|from|class|def|new|async|await|try|catch|throw|switch|case|break|continue|this|typeof|of|in)\b|\b\d+(?:\.\d+)?\b)/g;
    const out = [];
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push(text.slice(last, m.index));
      const t = m[0];
      let cls = "dfa-code-k";
      if (t.startsWith("//") || t.startsWith("/*")) cls = "dfa-code-c";
      else if (t.startsWith("'") || t.startsWith('"') || t.startsWith("`")) cls = "dfa-code-s";
      else if (/^\d/.test(t)) cls = "dfa-code-n";
      out.push(h("span", { className: cls }, t));
      last = m.index + t.length;
    }
    if (last < text.length) out.push(text.slice(last));
    return h("pre", { className: "dfa-code" }, out);
  }

  /* ================================================================== *
   * Sidebar icon (sidebar.panellist occupant)
   * ================================================================== */

  function SidebarIcon(props) {
    const size = props.size || 20;
    return h("span", { className: "dfa-nav-icon" },
      h(Glyph, { kind: "archiveMark", size, color: "currentColor" }));
  }

  /* ================================================================== *
   * Small building blocks
   * ================================================================== */

  function Btn({ children, onClick, kind, disabled, title, className }) {
    return h("button", {
      type: "button",
      className: "dfa-btn" + (kind ? " dfa-btn-" + kind : "") + (className ? " " + className : ""),
      onClick, disabled, title,
    }, children);
  }

  function Spinner({ size = 20 }) {
    return h("span", { className: "dfa-spinner", style: { width: size, height: size } });
  }

  function EmptyState({ title, hint }) {
    return h("div", { className: "dfa-empty" },
      h("div", { className: "dfa-empty-geo" },
        h("svg", { viewBox: "0 0 120 90", width: 120, height: 90, fill: "none", stroke: "var(--dsw-alias-border-l2, #ccd2da)", strokeWidth: 1.2 },
          h("circle", { cx: 28, cy: 34, r: 16 }),
          h("path", { d: "M74 14l20 34H54z" }),
          h("path", { d: "M86 74h20" }),
          h("circle", { cx: 96, cy: 38, r: 4 }),
          h("circle", { cx: 20, cy: 70, r: 3 })),
      ),
      h("div", { className: "dfa-empty-title" }, title),
      hint ? h("div", { className: "dfa-empty-hint" }, hint) : null,
    );
  }

  /* ================================================================== *
   * File row
   * ================================================================== */

  function FileRow({ entry, path, selected, onOpen, onToggle, onContextMenu, dragProps }) {
    const isDir = entry.type === "directory";
    const kind = kindOf(entry.name, isDir);
    const full = joinPath(path, entry.name);
    const checked = selected.has(full);
    return h("div", {
      className: "dfa-row" + (checked ? " dfa-selected" : ""),
      onClick: (e) => {
        if (e.target.closest(".dfa-check")) return;
        if (e.detail === 2) onOpen(entry);
      },
      onContextMenu: (e) => { e.preventDefault(); onContextMenu(entry, e.clientX, e.clientY); },
      title: entry.name,
      ...(dragProps || {}),
    },
      h("span", {
        className: "dfa-check",
        onClick: (e) => { e.stopPropagation(); onToggle(full); },
      }, checked ? h(Glyph, { kind: "file", size: 14, color: "var(--dsw-alias-brand-primary, #1677ff)" }) : null),
      h(Glyph, { kind, size: 30, color: KIND_COLOR[kind] }),
      h("span", { className: "dfa-row-name" }, entry.name),
      h("span", { className: "dfa-row-meta" }, isDir ? T("folder") : formatBytes(entry.size)),
      h("span", { className: "dfa-row-meta dfa-row-time" }, formatTime(entry.mtime)),
    );
  }

  function FileCard({ entry, path, selected, onOpen, onToggle, onContextMenu, dragProps }) {
    const isDir = entry.type === "directory";
    const kind = kindOf(entry.name, isDir);
    const full = joinPath(path, entry.name);
    const checked = selected.has(full);
    return h("div", {
      className: "dfa-card" + (checked ? " dfa-selected" : ""),
      onClick: (e) => { if (e.detail === 2) onOpen(entry); else onToggle(full); },
      onContextMenu: (e) => { e.preventDefault(); onContextMenu(entry, e.clientX, e.clientY); },
      title: entry.name,
      ...(dragProps || {}),
    },
      h(Glyph, { kind, size: 42, color: KIND_COLOR[kind] }),
      h("div", { className: "dfa-card-name" }, entry.name),
      h("div", { className: "dfa-card-meta" }, isDir ? T("folder") : formatBytes(entry.size)),
    );
  }

  function TreeDir({ path, name, depth, onNavigate, active }) {
    const [expanded, setExpanded] = useState(false);
    const [children, setChildren] = useState(null);
    const [loading, setLoading] = useState(false);
    const toggle = (e) => {
      e.stopPropagation();
      if (!expanded && children === null) {
        setLoading(true);
        api.browse(path).then((r) => setChildren((r.entries || []).filter((e) => e.type === "directory")))
          .catch(() => setChildren([])).finally(() => setLoading(false));
      }
      setExpanded((v) => !v);
    };
    return h("div", null,
      h("div", {
        className: "dfa-ws-item" + (active ? " dfa-ws-active" : ""),
        style: { paddingLeft: 8 + (depth || 0) * 14 },
        onClick: () => onNavigate(path),
        title: path,
      },
        h("button", { type: "button", className: "dfa-tree-toggle", onClick: toggle }, expanded ? "\u25be" : "\u25b8"),
        h(Glyph, { kind: "folder", size: 18, color: active ? "var(--dsw-alias-brand-primary, #1677ff)" : KIND_COLOR.folder }),
        h("span", { className: "dfa-ws-name" }, name)),
      expanded ? (loading ? h("div", { className: "dfa-empty-hint", style: { paddingLeft: 30 + (depth || 0) * 14 } }, T("loading"))
        : (children || []).map((c) => h(TreeDir, { key: c.name, path: joinPath(path, c.name), name: c.name, depth: (depth || 0) + 1, onNavigate }))) : null);
  }

  /* ================================================================== *
   * Context menu
   * ================================================================== */

  function ContextMenu({ x, y, item, onClose, actions }) {
    useEffect(() => {
      const close = () => onClose();
      document.addEventListener("click", close);
      document.addEventListener("scroll", close, true);
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
      return () => {
        document.removeEventListener("click", close);
        document.removeEventListener("scroll", close, true);
      };
    }, []);
    const style = {
      position: "fixed",
      left: Math.min(x, window.innerWidth - 220),
      top: Math.min(y, window.innerHeight - actions.length * 36 - 12),
      zIndex: 6000,
    };
    return h("div", { className: "dfa-menu", style },
      actions.map((a) => a === null ? null : h("button", {
        key: a.label, type: "button", className: "dfa-menu-item" + (a.danger ? " dfa-danger" : ""),
        onClick: () => { onClose(); a.run(); },
      }, a.icon ? h(Glyph, { kind: a.icon, size: 15, color: "currentColor" }) : null, h("span", null, a.label))),
    );
  }

  /* ================================================================== *
   * Modals
   * ================================================================== */

  function Overlay({ onClose, children, width }) {
    return h("div", { className: "dfa-overlay", onMouseDown: (e) => { if (e.target === e.currentTarget) onClose(); } },
      h("div", { className: "dfa-modal", style: { width: width || 720 } }, children));
  }

  function ModalHead({ title, onClose }) {
    return h("div", { className: "dfa-modal-head" },
      h("div", { className: "dfa-modal-title" }, title),
      h("button", { type: "button", className: "dfa-modal-close", onClick: onClose, "aria-label": T("close") }, "\u00d7"),
    );
  }

  function PreviewModal({ payload, onClose }) {
    const { path, name } = payload || {};
    const ext = extOf(name);
    const isImage = IMAGE_EXT.has(ext);
    const isPdf = ext === "pdf";
    const isOffice = ["doc","docx","xls","xlsx","ppt","pptx"].includes(ext);
    const isText = ["txt","md","json","js","ts","jsx","tsx","py","c","cpp","h","hpp","go","rs","java","cs","css","scss","html","xml","yaml","yml","toml","sh","bat","ps1","sql","csv","log","rst"].includes(ext);
    const [text, setText] = useState(null);
    const [trunc, setTrunc] = useState(false);
    const [err, setErr] = useState(null);
    useEffect(() => {
      setText(null); setTrunc(false); setErr(null);
      if (isText) {
        api.text(path).then((r) => { setText(r.text); setTrunc(r.truncated); }).catch((e) => setErr(e.message));
      }
    }, [path]);

    let body = null;
    if (isImage) body = h("img", { className: "dfa-preview-img", src: api.bytesUrl(path), alt: name });
    else if (isPdf) body = h("iframe", { className: "dfa-preview-frame", src: api.bytesUrl(path), title: name });
    else if (isOffice) body = h("iframe", { className: "dfa-preview-frame", src: api.renderUrl(path), title: name });
    else if (isText) {
      body = err
        ? h("div", { className: "dfa-preview-err" }, err)
        : text === null
          ? h("div", { className: "dfa-preview-loading" }, h(Spinner, { size: 22 }))
          : ext === "md"
            ? renderMarkdown(text)
            : CODE_EXT.has(ext)
              ? highlightCode(text)
              : h("pre", { className: "dfa-preview-text" }, text);
    } else body = h("div", { className: "dfa-preview-err" }, T("previewUnsupported"));

    return h(Overlay, { onClose, width: 820 },
      h(ModalHead, { title: name, onClose }),
      h("div", { className: "dfa-preview-body" }, body),
    );
  }

  function ConfirmDeleteModal({ payload, onClose }) {
    const paths = payload?.paths || [];
    const names = paths.map(baseName);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);
    const doDelete = async () => {
      setBusy(true); setErr(null);
      try {
        await api.deletePaths(paths);
        onClose();
        if (payload?.onDone) payload.onDone(T("deleteDone").replace("{n}", String(paths.length)));
      } catch (e) { setErr(e.message); }
      finally { setBusy(false); }
    };
    return h(Overlay, { onClose, width: 520 },
      h(ModalHead, { title: T("deleteTitle"), onClose }),
      h("div", { className: "dfa-modal-body" },
        h("p", { className: "dfa-modal-desc" }, T("deleteConfirm").replace("{n}", String(paths.length))),
        h("ul", { className: "dfa-file-list" }, names.slice(0, 200).map((n) => h("li", { key: n, className: "dfa-file-li" }, n))),
        names.length > 200 ? h("p", { className: "dfa-modal-note" }, "…") : null,
        err ? h("div", { className: "dfa-error" }, err) : null,
      ),
      h("div", { className: "dfa-modal-foot" },
        h(Btn, { onClick: onClose }, T("cancel")),
        h(Btn, { kind: "danger", onClick: doDelete, disabled: busy }, busy ? h(Spinner, { size: 14 }) : T("confirmDelete")),
      ),
    );
  }

  function MoveDialog({ payload, onClose }) {
    const paths = payload?.paths || [];
    const mode = payload?.mode || "move";
    const [dir, setDir] = useState(payload?.startDir || "");
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [busy, setBusy] = useState(false);
    const [mkdirMode, setMkdirMode] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [conflict, setConflict] = useState("rename");
    const [jobId, setJobId] = useState(null);
    const [prog, setProg] = useState(null);
    const load = useCallback((d) => {
      setLoading(true); setErr(null);
      api.dirList(d).then((r) => { setDir(r.path); setEntries(r.entries.filter((e) => e.type === "directory")); })
        .catch((e) => setErr(e.message))
        .finally(() => setLoading(false));
    }, []);
    useEffect(() => { if (payload?.startDir) load(payload.startDir); }, [payload]);
    const doAction = async () => {
      setBusy(true); setErr(null); setProg(null);
      try {
        const r = mode === "copy" ? await api.copy(paths, dir, conflict) : await api.movePaths(paths, dir, conflict);
        const id = r.jobId;
        setJobId(id);
        const poll = () => {
          api.job(id).then((jr) => {
            const j = jr.job;
            setProg(j);
            if (j.state === "done") {
              onClose();
              const doneKey = mode === "copy" ? "copyDone" : "moveDone";
              if (payload?.onDone) payload.onDone(T(doneKey).replace("{n}", String(paths.length)));
            } else if (j.state === "error") {
              setBusy(false); setErr(j.error || T("moveFailed"));
            } else if (j.state === "cancelled") {
              setBusy(false); setErr(T("cancelled"));
            } else {
              setTimeout(poll, 350);
            }
          }).catch((e) => { setBusy(false); setErr(e.message); });
        };
        setTimeout(poll, 200);
      } catch (e) { setErr(e.message); setBusy(false); }
    };
    const doCancel = () => { if (jobId) api.cancelJob(jobId).catch(() => {}); };
    const doMkdir = async () => {
      if (!folderName.trim()) return;
      setErr(null);
      try {
        await api.mkdir(dir, folderName.trim());
        setMkdirMode(false); setFolderName("");
        load(dir);
      } catch (e) { setErr(e.message); }
    };
    const pct = prog && prog.bytesTotal > 0 ? Math.min(100, Math.round(prog.bytesDone / prog.bytesTotal * 100)) : 0;
    return h(Overlay, { onClose, width: 560 },
      h(ModalHead, { title: mode === "copy" ? T("copyTitle") : T("moveTitle"), onClose }),
      h("div", { className: "dfa-modal-body" },
        h("div", { className: "dfa-dest-label" }, T("destination")),
        h("div", { className: "dfa-dest-path" }, dir || "\u00a0"),
        h("div", { className: "dfa-dest-toolbar" },
          h(Btn, { onClick: () => load(parentDir(dir)) }, "\u2191 " + T("parent")),
          h(Btn, { onClick: () => { setMkdirMode((v) => !v); setFolderName(""); } }, "+ " + T("newFolder")),
        ),
        mkdirMode ? h("div", { className: "dfa-mkdir" },
          h("input", { className: "dfa-input", value: folderName, placeholder: T("folderName"),
            onChange: (e) => setFolderName(e.target.value),
            onKeyDown: (e) => { if (e.key === "Enter") doMkdir(); } }),
          h(Btn, { onClick: doMkdir }, T("confirm")),
        ) : null,
        loading ? h("div", { className: "dfa-preview-loading" }, h(Spinner, { size: 22 }))
          : h("div", { className: "dfa-dest-list" },
            entries.length === 0 && !err ? h("div", { className: "dfa-empty-hint" }, T("empty")) : null,
            entries.map((e) => h("div", {
              key: e.name, className: "dfa-dest-item",
              onClick: () => load(joinPath(dir, e.name)),
            },
              h(Glyph, { kind: "folder", size: 20, color: KIND_COLOR.folder }),
              h("span", null, e.name))),
          ),
        busy ? h("div", { className: "dfa-progress" },
          h("div", { className: "dfa-progress-head" },
            h("span", null, T("progress") + " " + pct + "%"),
            prog && prog.filesTotal > 0 ? h("span", null, prog.filesDone + "/" + prog.filesTotal) : null),
          h("div", { className: "dfa-progress-track" }, h("div", { className: "dfa-progress-fill", style: { width: pct + "%" } })),
          prog && prog.current ? h("div", { className: "dfa-progress-current" }, prog.current) : null,
          h("div", { className: "dfa-mkdir", style: { marginTop: 10 } },
            h(Btn, { onClick: doCancel }, T("cancelJob"))),
        ) : null,
        !busy ? h("div", { className: "dfa-mkdir", style: { marginTop: 10 } },
          h("span", { className: "dfa-dest-label", style: { alignSelf: "center" } }, T("conflict")),
          h("select", { className: "dfa-input", value: conflict, onChange: (e) => setConflict(e.target.value) },
            h("option", { value: "rename" }, T("conflictRename")),
            h("option", { value: "overwrite" }, T("conflictOverwrite")),
            h("option", { value: "skip" }, T("conflictSkip")))) : null,
        err ? h("div", { className: "dfa-error" }, err) : null,
      ),
      h("div", { className: "dfa-modal-foot" },
        h(Btn, { onClick: onClose }, T("cancel")),
        h(Btn, { kind: "primary", onClick: doAction, disabled: busy }, busy ? h(Spinner, { size: 14 }) : (mode === "copy" ? T("confirmCopy") : T("confirmMove"))),
      ),
    );
  }

  function RenameModal({ payload, onClose }) {
    const { path, name } = payload || {};
    const [value, setValue] = useState(name || "");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);
    const doRename = async () => {
      const next = value.trim();
      if (!next || next === name) { onClose(); return; }
      setBusy(true); setErr(null);
      try {
        await api.rename(path, next);
        onClose();
        if (payload?.onDone) payload.onDone(T("renameDone"));
      } catch (e) { setErr(e.message); }
      finally { setBusy(false); }
    };
    return h(Overlay, { onClose, width: 460 },
      h(ModalHead, { title: T("renameTitle"), onClose }),
      h("div", { className: "dfa-modal-body" },
        h("div", { className: "dfa-dest-label" }, T("renameLabel")),
        h("input", {
          className: "dfa-input", style: { width: "100%" }, value,
          autoFocus: true,
          onChange: (e) => setValue(e.target.value),
          onKeyDown: (e) => { if (e.key === "Enter") doRename(); },
        }),
        err ? h("div", { className: "dfa-error", style: { marginTop: 10 } }, err) : null,
      ),
      h("div", { className: "dfa-modal-foot" },
        h(Btn, { onClick: onClose }, T("cancel")),
        h(Btn, { kind: "primary", onClick: doRename, disabled: busy || !value.trim() }, busy ? h(Spinner, { size: 14 }) : T("renameConfirm")),
      ),
    );
  }

  function CompressDialog({ payload, onClose }) {
    const paths = payload?.paths || [];
    const [dir, setDir] = useState(payload?.startDir || "");
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [busy, setBusy] = useState(false);
    const [zipName, setZipName] = useState("archive");
    const load = useCallback((d) => {
      setLoading(true); setErr(null);
      api.dirList(d).then((r) => { setDir(r.path); setEntries(r.entries.filter((e) => e.type === "directory")); })
        .catch((e) => setErr(e.message)).finally(() => setLoading(false));
    }, []);
    useEffect(() => { if (payload?.startDir) load(payload.startDir); }, [payload]);
    const doCompress = async () => {
      setBusy(true); setErr(null);
      try {
        await api.compress(paths, dir, zipName, "rename");
        onClose();
        if (payload?.onDone) payload.onDone(T("compressDone"));
      } catch (e) { setErr(e.message); }
      finally { setBusy(false); }
    };
    return h(Overlay, { onClose, width: 560 },
      h(ModalHead, { title: T("compressTitle"), onClose }),
      h("div", { className: "dfa-modal-body" },
        h("div", { className: "dfa-dest-label" }, T("zipName")),
        h("input", { className: "dfa-input", style: { width: "100%" }, value: zipName, onChange: (e) => setZipName(e.target.value) }),
        h("div", { className: "dfa-dest-label", style: { marginTop: 12 } }, T("destination")),
        h("div", { className: "dfa-dest-path" }, dir || "\u00a0"),
        h("div", { className: "dfa-dest-toolbar" },
          h(Btn, { onClick: () => load(parentDir(dir)) }, "\u2191 " + T("parent"))),
        loading ? h("div", { className: "dfa-preview-loading" }, h(Spinner, { size: 22 }))
          : h("div", { className: "dfa-dest-list" },
            entries.map((e) => h("div", { key: e.name, className: "dfa-dest-item", onClick: () => load(joinPath(dir, e.name)) },
              h(Glyph, { kind: "folder", size: 20, color: KIND_COLOR.folder }), h("span", null, e.name)))),
        err ? h("div", { className: "dfa-error", style: { marginTop: 10 } }, err) : null,
      ),
      h("div", { className: "dfa-modal-foot" },
        h(Btn, { onClick: onClose }, T("cancel")),
        h(Btn, { kind: "primary", onClick: doCompress, disabled: busy || !zipName.trim() }, busy ? h(Spinner, { size: 14 }) : T("compressConfirm")),
      ),
    );
  }

  function DeletionsModal({ onClose }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      api.deletions().then((r) => setItems(r.items || [])).catch(() => {}).finally(() => setLoading(false));
    }, []);
    return h(Overlay, { onClose, width: 640 },
      h(ModalHead, { title: T("deletionsTitle"), onClose }),
      h("div", { className: "dfa-modal-body" },
        loading ? h("div", { className: "dfa-preview-loading" }, h(Spinner, { size: 22 }))
          : items.length === 0 ? h(EmptyState, { title: T("noDeletions") })
          : h("table", { className: "dfa-table" },
            h("thead", null, h("tr", null,
              h("th", null, T("name")), h("th", null, T("deletedAt")), h("th", null, T("originalPath")))),
            h("tbody", null, items.map((it, i) => h("tr", { key: i },
              h("td", { className: "dfa-td-name" }, it.name),
              h("td", null, formatTime(it.deletedAt)),
              h("td", { className: "dfa-td-path", title: it.path }, it.path))))),
      ),
      h("div", { className: "dfa-modal-foot" },
        h(Btn, { onClick: () => api.openRecycleBin().catch(() => {}) }, T("openRecycleBin")),
        h("span", { className: "dfa-spacer" }),
        h(Btn, { onClick: onClose }, T("close")),
      ),
    );
  }

  function ContentResults({ results, searching, onOpen }) {
    if (searching) return h("div", { className: "dfa-preview-loading" }, h(Spinner, { size: 24 }));
    if (!results) return h(EmptyState, { title: T("contentSearch"), hint: T("emptyHint") });
    if (results.error) return h("div", { className: "dfa-preview-err" }, results.error);
    if (!results.matches || !results.matches.length) return h(EmptyState, { title: T("noResults") });
    return h("div", { className: "dfa-results" },
      results.matches.map((m, i) => h("div", { key: i, className: "dfa-result", onClick: () => onOpen(m.path) },
        h("div", { className: "dfa-result-path" }, m.path),
        h("div", { className: "dfa-result-line" }, m.line + ": " + m.text))),
      results.truncated ? h("div", { className: "dfa-empty-hint", style: { padding: 10 } }, T("truncated")) : null,
    );
  }

  function OperationsModal({ onClose }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      api.operations().then((r) => setItems(r.items || [])).catch(() => {}).finally(() => setLoading(false));
    }, []);
    return h(Overlay, { onClose, width: 720 },
      h(ModalHead, { title: T("operations"), onClose }),
      h("div", { className: "dfa-modal-body" },
        loading ? h("div", { className: "dfa-preview-loading" }, h(Spinner, { size: 22 }))
          : items.length === 0 ? h(EmptyState, { title: T("noDeletions") })
          : h("table", { className: "dfa-table" },
            h("thead", null, h("tr", null,
              h("th", null, T("opType")), h("th", null, T("name")), h("th", null, T("opTime")), h("th", null, T("opTarget")))),
            h("tbody", null, items.map((it, i) => h("tr", { key: i },
              h("td", null, it.type),
              h("td", { className: "dfa-td-name" }, it.name || baseName(it.path)),
              h("td", null, formatTime(it.deletedAt || it.movedAt || it.copiedAt || it.renamedAt || it.compressedAt || it.extractedAt)),
              h("td", { className: "dfa-td-path", title: it.dest || it.path }, it.dest || it.path))))),
      ),
      h("div", { className: "dfa-modal-foot" },
        h(Btn, { onClick: onClose }, T("close")),
      ),
    );
  }

  function ModalHost() {
    const modal = useModal();
    const onClose = () => modalStore.close();
    if (!modal.type) return null;
    switch (modal.type) {
      case "preview": return h(PreviewModal, { payload: modal.payload, onClose });
      case "confirm-delete": return h(ConfirmDeleteModal, { payload: modal.payload, onClose });
      case "move": return h(MoveDialog, { payload: modal.payload, onClose });
      case "rename": return h(RenameModal, { payload: modal.payload, onClose });
      case "compress": return h(CompressDialog, { payload: modal.payload, onClose });
      case "deletions": return h(DeletionsModal, { onClose });
      case "operations": return h(OperationsModal, { onClose });
      default: return null;
    }
  }

  /* ================================================================== *
   * Main panel
   * ================================================================== */

  function App() {
    const [workspaces, setWorkspaces] = useState([]);
    const [wsId, setWsId] = useState(null);
    const [path, setPath] = useState(null);
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortDir, setSortDir] = useState(1);
    const [view, setView] = useState("list");
    const [searchMode, setSearchMode] = useState("name");
    const [contentResults, setContentResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const [selection, setSelection] = useState(() => new Set());
    const [menu, setMenu] = useState(null);
    const [toast, setToast] = useState(null);
    const [dragSel, setDragSel] = useState([]);

    const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

    useEffect(() => {
      api.workspaces().then((r) => {
        const ws = r.workspaces || [];
        setWorkspaces(ws);
        if (ws.length) { setWsId(ws[0].id); setPath(ws[0].path); }
      }).catch((e) => setError(e.message));
    }, []);

    const load = useCallback((p) => {
      if (!p) return;
      setLoading(true); setError(null);
      api.browse(p).then((r) => { setEntries(r.entries || []); setSelection(new Set()); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, []);

    useEffect(() => { if (path) load(path); }, [path, load]);

    useEffect(() => {
      if (searchMode !== "content" || !query.trim() || !path) { setContentResults(null); return; }
      setSearching(true);
      const t = setTimeout(() => {
        api.searchContent(path, query.trim(), false)
          .then((r) => setContentResults(r))
          .catch((e) => setContentResults({ matches: [], error: e.message }))
          .finally(() => setSearching(false));
      }, 350);
      return () => clearTimeout(t);
    }, [query, path, searchMode]);

    const shown = useMemo(() => {
      let list = [...entries];
      const q = query.trim().toLowerCase();
      if (q) list = list.filter((e) => e.name.toLowerCase().includes(q));
      const dir = sortDir;
      list.sort((a, b) => {
        const ta = a.type === "directory" ? 0 : 1;
        const tb = b.type === "directory" ? 0 : 1;
        if (ta !== tb) return ta - tb;
        let v = 0;
        if (sortBy === "size") v = (a.size || 0) - (b.size || 0);
        else if (sortBy === "time") v = (a.mtime || 0) - (b.mtime || 0);
        else if (sortBy === "type") v = kindOf(a.name, false).localeCompare(kindOf(b.name, false));
        else v = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        return v * dir;
      });
      return list;
    }, [entries, query, sortBy, sortDir]);

    const selectedPaths = useMemo(() => [...selection], [selection]);
    const toggleSel = (p) => setSelection((s) => {
      const n = new Set(s); if (n.has(p)) n.delete(p); else n.add(p); return n;
    });
    const clearSel = () => setSelection(new Set());
    const selectAll = () => setSelection(new Set(shown.filter((e) => e.type === "file").map((e) => joinPath(path, e.name))));

    const openEntry = (e) => {
      const full = joinPath(path, e.name);
      if (e.type === "directory") setPath(full);
      else modalStore.open("preview", { path: full, name: e.name });
    };

    const refresh = () => load(path);

    const contextActions = (item) => {
      const full = joinPath(path, item.name);
      const acts = [];
      if (item.type === "directory") {
        acts.push({ label: T("open"), icon: "folder", run: () => setPath(full) });
      } else {
        acts.push({ label: T("preview"), icon: "file", run: () => modalStore.open("preview", { path: full, name: item.name }) });
      }
      acts.push({ label: T("move"), icon: "archive", run: () => modalStore.open("move", { paths: [full], startDir: path, onDone: (m) => { notify(m); refresh(); } }) });
      acts.push({ label: T("copyTo"), icon: "archive", run: () => modalStore.open("move", { paths: [full], startDir: path, mode: "copy", onDone: (m) => { notify(m); refresh(); } }) });
      acts.push({ label: T("rename"), icon: "file", run: () => modalStore.open("rename", { path: full, name: item.name, onDone: () => { notify(T("renameDone")); refresh(); } }) });
      acts.push({ label: T("compress"), icon: "archive", run: () => modalStore.open("compress", { paths: [full], startDir: path, onDone: (m) => { notify(m); refresh(); } }) });
      if (extOf(item.name) === "zip") {
        acts.push({ label: T("extract"), icon: "archive", run: () => { api.extract(full, path, "rename").then(() => { notify(T("extractDone")); refresh(); }).catch((e) => notify(e.message)); } });
      }
      acts.push({ label: T("delete"), icon: "file", danger: true, run: () => modalStore.open("confirm-delete", { paths: [full], onDone: (m) => { notify(m); refresh(); } }) });
      acts.push({ label: T("openContaining"), icon: "folder", run: () => api.openContaining(full).catch(() => {}) });
      return acts;
    };

    const onDragStart = (e, item) => {
      const full = joinPath(path, item.name);
      const paths = selection.has(full) && selection.size > 1 ? [...selection] : [full];
      setDragSel(paths);
      e.dataTransfer.setData("application/x-dfa-paths", JSON.stringify(paths));
      e.dataTransfer.effectAllowed = "move";
    };
    const onDropOnDir = async (e, dirName) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/x-dfa-paths");
      let paths = [];
      try { paths = JSON.parse(raw); } catch {}
      if (!paths.length) return;
      const dest = joinPath(path, dirName);
      try {
        await api.movePaths(paths, dest);
        notify(T("moveDone").replace("{n}", String(paths.length)));
        refresh();
      } catch (err2) { notify(err2.message); }
    };

    const wsItems = workspaces.map((w) => h(TreeDir, {
      key: w.id, path: w.path, name: w.title, depth: 0,
      onNavigate: (p) => { setWsId(w.id); setPath(p); },
      active: w.id === wsId,
    }));

    return h("div", { className: "dfa-root" },
      h("aside", { className: "dfa-ws" },
        h("div", { className: "dfa-ws-title" }, T("title")),
        wsItems.length ? wsItems : h("div", { className: "dfa-empty-hint" }, T("loading")),
      ),
      h("main", { className: "dfa-main" },
        h("div", { className: "dfa-toolbar" },
          h("input", { className: "dfa-input dfa-search", placeholder: searchMode === "content" ? T("contentSearch") : T("search"), value: query, onChange: (e) => setQuery(e.target.value) }),
          h(Btn, { onClick: () => setSearchMode((m) => (m === "name" ? "content" : "name")), title: T("contentSearch"), className: searchMode === "content" ? "dfa-btn-primary" : "" }, searchMode === "content" ? "\u00b6" : "\u2315"),
          h(Btn, { onClick: () => setPath(parentDir(path)), title: T("up") }, "\u2191"),
          h(Btn, { onClick: refresh, title: T("refresh") }, "\u21bb"),
          h("select", { className: "dfa-input dfa-sort", value: sortBy, onChange: (e) => setSortBy(e.target.value), title: T("sort") },
            h("option", { value: "name" }, T("sortName")),
            h("option", { value: "size" }, T("sortSize")),
            h("option", { value: "time" }, T("sortTime")),
            h("option", { value: "type" }, T("sortType"))),
          h(Btn, { onClick: () => setSortDir((d) => -d), title: sortDir > 0 ? T("sortAsc") : T("sortDesc") }, sortDir > 0 ? "\u2191" : "\u2193"),
          h(Btn, { onClick: () => setView((v) => (v === "list" ? "grid" : "list")), title: view === "list" ? T("viewGrid") : T("viewList") }, view === "list" ? "\u25a6" : "\u2630"),
          h("span", { className: "dfa-spacer" }),
          h(Btn, { onClick: selectAll, disabled: !shown.length }, T("selectAll")),
          h(Btn, { onClick: () => modalStore.open("move", { paths: selectedPaths, startDir: path, onDone: (m) => { notify(m); refresh(); } }), disabled: !selectedPaths.length }, T("move")),
          h(Btn, { onClick: () => modalStore.open("move", { paths: selectedPaths, startDir: path, mode: "copy", onDone: (m) => { notify(m); refresh(); } }), disabled: !selectedPaths.length }, T("copy")),
          h(Btn, { onClick: () => modalStore.open("compress", { paths: selectedPaths, startDir: path, onDone: (m) => { notify(m); refresh(); } }), disabled: !selectedPaths.length }, T("compress")),
          h(Btn, { kind: "danger", onClick: () => modalStore.open("confirm-delete", { paths: selectedPaths, onDone: (m) => { notify(m); refresh(); } }), disabled: !selectedPaths.length }, T("delete")),
          h(Btn, { onClick: () => modalStore.open("deletions", {}) }, T("deletions")),
          h(Btn, { onClick: () => modalStore.open("operations", {}) }, T("operations")),
        ),
        h("div", { className: "dfa-bar" },
          h("div", { className: "dfa-crumb" },
            pathSegments(path).map((s, i) => h("button", {
              key: i, className: "dfa-crumb-seg", onClick: () => setPath(s.path),
            }, s.label, i < pathSegments(path).length - 1 ? h("span", { className: "dfa-crumb-sep" }, "\u203a") : null))),
          selectedPaths.length ? h("span", { className: "dfa-count" }, T("selected").replace("{n}", String(selectedPaths.length))) : null,
        ),
        h("div", { className: "dfa-list", onClick: clearSel },
          searchMode === "content"
            ? h(ContentResults, { results: contentResults, searching, onOpen: (p) => modalStore.open("preview", { path: p, name: baseName(p) }) })
            : loading ? h("div", { className: "dfa-preview-loading" }, h(Spinner, { size: 28 }))
            : error ? h("div", { className: "dfa-preview-err" }, error)
            : shown.length === 0 ? h(EmptyState, { title: T("empty"), hint: T("emptyHint") })
            : view === "grid"
              ? h("div", { className: "dfa-grid" }, shown.map((e) => h(FileCard, {
                key: e.name, entry: e, path, selected: selection,
                onOpen: openEntry, onToggle: toggleSel,
                onContextMenu: (item, x, y) => setMenu({ item, x, y }),
                dragProps: e.type === "file" ? {
                  draggable: true,
                  onDragStart: (ev) => onDragStart(ev, e),
                  onDragEnd: () => setDragSel([]),
                } : {
                  onDragOver: (ev) => ev.preventDefault(),
                  onDrop: (ev) => onDropOnDir(ev, e.name),
                },
              })))
              : shown.map((e) => h(FileRow, {
                key: e.name, entry: e, path, selected: selection,
                onOpen: openEntry, onToggle: toggleSel,
                onContextMenu: (item, x, y) => setMenu({ item, x, y }),
                dragProps: e.type === "file" ? {
                  draggable: true,
                  onDragStart: (ev) => onDragStart(ev, e),
                  onDragEnd: () => setDragSel([]),
                } : {
                  onDragOver: (ev) => ev.preventDefault(),
                  onDrop: (ev) => onDropOnDir(ev, e.name),
                },
              })),
        ),
      ),
      menu ? h(ContextMenu, { x: menu.x, y: menu.y, item: menu.item, actions: contextActions(menu.item), onClose: () => setMenu(null) }) : null,
      toast ? h("div", { className: "dfa-toast" }, toast) : null,
    );
  }

  /* ================================================================== *
   * apply
   * ================================================================== */

  exports.name = "dsh-file-archive";
  exports.inject = ["slots", "locale", "theme"];
  exports.apply = function apply(ctx) {
    // A throwing client entry takes the WHOLE web boot down, so every step is
    // guarded and failures are reported to the host log instead of rethrown.
    const report = (where, err) => {
      try {
        const message = String((err && err.message) || err);
        const stack = String((err && err.stack) || "");
        if (typeof fetch === "function") {
          fetch("/dsh-file-archive/__client-error", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ where, message, stack }),
          }).catch(() => {});
        }
        console.warn("[dsh-file-archive] apply step failed:", where, message);
      } catch { /* ignore */ }
    };

    try {
      ctx.effect(() => ctx.locale.register(NS, { zh: DICT.zh, en: DICT.en }), "dsh-file-archive: dictionaries");
    } catch (e) { report("locale.register", e); }

    try {
      T = ctx.locale.bind(NS);
    } catch (e) { report("locale.bind", e); }

    try {
      ctx.effect(() => {
        const style = document.createElement("style");
        style.dataset.plugin = "dsh-file-archive";
        style.textContent = CSS;
        document.head.appendChild(style);
        return () => style.remove();
      }, "dsh-file-archive: styles");
    } catch (e) { report("styles", e); }

    // Register through slots.inject so each entry waits for its slot to exist.
    try {
      ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
        name: "sidebar.panellist",
        id: "file-archive",
        order: 60,
        label: () => T("nav"),
      }, (props) => h(SidebarIcon, { size: props?.size, active: props?.active })));
    } catch (e) { report("slot:sidebar.panellist", e); }

    try {
      ctx.slots.inject("main", () => ctx.slots.register({
        name: "main",
        key: "file-archive",
      }, () => h(App)));
    } catch (e) { report("slot:main", e); }

    try {
      ctx.slots.inject("shell.overlay", () => ctx.slots.register({
        name: "shell.overlay",
        id: "dsh-file-archive-modals",
        label: () => "dsh-file-archive",
      }, () => h(ModalHost)));
    } catch (e) { report("slot:shell.overlay", e); }
  };

  /* ================================================================== *
   * CSS (glassmorphism + geometric line-art + spacious list)
   * ================================================================== */

  const CSS = `
.dfa-root { display:flex; height:100%; width:100%; background:var(--dsw-alias-bg-base); color:var(--dsw-alias-label-primary); font-family:-apple-system,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif; }
.dfa-ws { width:200px; flex:none; border-right:1px solid var(--dsw-alias-border-l1); overflow-y:auto; padding:14px 10px; background:var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-base)); }
.dfa-ws-title { font-size:12px; font-weight:600; letter-spacing:.04em; color:var(--dsw-alias-label-secondary); padding:0 8px 10px; }
.dfa-ws-item { display:flex; align-items:center; gap:8px; height:36px; padding:0 8px; border-radius:10px; cursor:pointer; color:var(--dsw-alias-label-primary); }
.dfa-ws-item:hover { background:var(--dsw-alias-bg-layer-2); }
.dfa-ws-active { background:color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent); }
.dfa-ws-name { font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dfa-main { flex:1; display:flex; flex-direction:column; min-width:0; }
.dfa-toolbar { display:flex; gap:8px; align-items:center; padding:12px 16px; border-bottom:1px solid var(--dsw-alias-border-l1); }
.dfa-spacer { flex:1; }
.dfa-bar { display:flex; align-items:center; gap:12px; padding:8px 16px; font-size:12px; color:var(--dsw-alias-label-secondary); }
.dfa-crumb { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dfa-count { flex:none; color:var(--dsw-alias-brand-primary); font-weight:600; }
.dfa-list { flex:1; overflow-y:auto; padding:6px 10px 20px; }
.dfa-row { display:flex; align-items:center; gap:14px; height:56px; padding:0 14px; border-radius:14px; cursor:default; user-select:none; }
.dfa-row:hover { background:var(--dsw-alias-bg-layer-2); }
.dfa-selected { background:color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent); }
.dfa-check { display:flex; align-items:center; justify-content:center; width:18px; height:18px; border:1.5px solid var(--dsw-alias-border-l2); border-radius:6px; cursor:pointer; flex:none; }
.dfa-selected .dfa-check { border-color:var(--dsw-alias-brand-primary); background:color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent); }
.dfa-row-name { flex:1; min-width:0; font-size:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dfa-row-meta { flex:none; width:90px; font-size:12px; color:var(--dsw-alias-label-secondary); text-align:right; font-variant-numeric:tabular-nums; }
.dfa-row-time { width:130px; }
.dfa-btn { display:inline-flex; align-items:center; gap:6px; height:32px; padding:0 12px; border-radius:10px; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font-size:13px; cursor:pointer; }
.dfa-btn:hover:not(:disabled) { background:var(--dsw-alias-bg-layer-2); }
.dfa-btn:disabled { opacity:.45; cursor:default; }
.dfa-btn-primary { background:var(--dsw-alias-brand-primary); border-color:var(--dsw-alias-brand-primary); color:#fff; }
.dfa-btn-danger { background:var(--dsw-alias-state-error-primary); border-color:var(--dsw-alias-state-error-primary); color:#fff; }
.dfa-input { height:32px; padding:0 12px; border-radius:10px; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font-size:13px; outline:none; }
.dfa-input:focus { border-color:var(--dsw-alias-brand-primary); }
.dfa-search { flex:0 1 260px; }
.dfa-nav-icon { display:inline-flex; align-items:center; justify-content:center; }
.dfa-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; height:100%; min-height:220px; }
.dfa-empty-geo { opacity:.9; }
.dfa-empty-title { font-size:14px; color:var(--dsw-alias-label-primary); }
.dfa-empty-hint { font-size:12px; color:var(--dsw-alias-label-secondary); }
.dfa-spinner { display:inline-block; border:2px solid var(--dsw-alias-border-l2); border-top-color:var(--dsw-alias-brand-primary); border-radius:50%; animation:dfa-spin .8s linear infinite; }
@keyframes dfa-spin { to { transform:rotate(360deg); } }
.dfa-preview-loading { display:flex; align-items:center; justify-content:center; padding:40px; }
.dfa-preview-err { padding:40px; text-align:center; color:var(--dsw-alias-state-error-primary); font-size:13px; }
.dfa-error { color:var(--dsw-alias-state-error-primary); font-size:12px; }
.dfa-toast { position:fixed; left:50%; bottom:28px; transform:translateX(-50%); z-index:7000; padding:10px 18px; border-radius:12px; background:var(--dsw-alias-bg-overlay); border:1px solid var(--dsw-alias-border-l1); box-shadow:0 12px 32px rgba(0,0,0,.28); font-size:13px; color:var(--dsw-alias-label-primary); }
.dfa-overlay { position:fixed; inset:0; z-index:5000; display:flex; align-items:center; justify-content:center; background:color-mix(in srgb, #000 28%, transparent); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); pointer-events:auto; padding:24px; }
.dfa-modal { position:relative; display:flex; flex-direction:column; max-height:calc(100vh - 48px); border-radius:16px; border:1px solid var(--dsw-alias-border-l1); background:color-mix(in srgb, var(--dsw-alias-bg-overlay, #fff) 84%, transparent); backdrop-filter:blur(22px) saturate(140%); -webkit-backdrop-filter:blur(22px) saturate(140%); box-shadow:0 24px 60px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.12); color:var(--dsw-alias-label-primary); overflow:hidden; }
.dfa-modal-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 20px 12px; border-bottom:1px solid var(--dsw-alias-border-l1); }
.dfa-modal-title { font-size:15px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dfa-modal-close { width:28px; height:28px; border:none; border-radius:8px; background:transparent; color:var(--dsw-alias-label-secondary); font-size:20px; line-height:1; cursor:pointer; }
.dfa-modal-close:hover { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); }
.dfa-modal-body { padding:16px 20px; overflow-y:auto; }
.dfa-modal-desc { margin:0 0 12px; font-size:13px; color:var(--dsw-alias-label-secondary); }
.dfa-modal-note { margin:8px 0 0; font-size:12px; color:var(--dsw-alias-label-secondary); }
.dfa-modal-foot { display:flex; justify-content:flex-end; gap:10px; padding:14px 20px; border-top:1px solid var(--dsw-alias-border-l1); }
.dfa-file-list { list-style:none; margin:0; padding:0; max-height:260px; overflow-y:auto; border:1px solid var(--dsw-alias-border-l1); border-radius:12px; }
.dfa-file-li { padding:8px 14px; font-size:13px; border-bottom:1px solid var(--dsw-alias-border-l1); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dfa-file-li:last-child { border-bottom:none; }
.dfa-preview-body { flex:1; min-height:0; display:flex; align-items:stretch; justify-content:center; overflow:auto; background:color-mix(in srgb, var(--dsw-alias-bg-base) 60%, transparent); }
.dfa-preview-img { max-width:100%; max-height:70vh; object-fit:contain; margin:auto; }
.dfa-preview-frame { width:100%; height:70vh; border:none; }
.dfa-preview-text { margin:0; padding:20px; width:100%; font-family:ui-monospace,'Cascadia Code',Consolas,monospace; font-size:12.5px; line-height:1.6; white-space:pre-wrap; word-break:break-all; }
.dfa-preview-note { color:var(--dsw-alias-state-warn-primary); font-size:12px; margin-top:12px; }
.dfa-dest-label { font-size:12px; color:var(--dsw-alias-label-secondary); margin-bottom:6px; }
.dfa-dest-path { font-size:13px; padding:8px 12px; border-radius:10px; background:var(--dsw-alias-bg-layer-1); border:1px solid var(--dsw-alias-border-l1); margin-bottom:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-variant-numeric:tabular-nums; }
.dfa-dest-toolbar { display:flex; gap:8px; margin-bottom:10px; }
.dfa-dest-list { max-height:240px; overflow-y:auto; border:1px solid var(--dsw-alias-border-l1); border-radius:12px; padding:6px; }
.dfa-dest-item { display:flex; align-items:center; gap:10px; height:36px; padding:0 10px; border-radius:9px; cursor:pointer; font-size:13px; }
.dfa-dest-item:hover { background:var(--dsw-alias-bg-layer-2); }
.dfa-mkdir { display:flex; gap:8px; margin-bottom:10px; }
.dfa-table { width:100%; border-collapse:collapse; font-size:12.5px; }
.dfa-table th { text-align:left; padding:8px 10px; color:var(--dsw-alias-label-secondary); font-weight:600; border-bottom:1px solid var(--dsw-alias-border-l1); }
.dfa-table td { padding:8px 10px; border-bottom:1px solid var(--dsw-alias-border-l1); }
.dfa-td-name { font-weight:600; }
.dfa-td-path { color:var(--dsw-alias-label-secondary); max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dfa-menu { display:flex; flex-direction:column; min-width:180px; padding:6px; border-radius:14px; border:1px solid var(--dsw-alias-border-l1); background:color-mix(in srgb, var(--dsw-alias-bg-overlay, #fff) 82%, transparent); backdrop-filter:blur(18px) saturate(140%); -webkit-backdrop-filter:blur(18px) saturate(140%); box-shadow:0 16px 40px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.1); }
.dfa-menu-item { display:flex; align-items:center; gap:10px; height:34px; padding:0 12px; border:none; border-radius:9px; background:transparent; color:var(--dsw-alias-label-primary); font-size:13px; cursor:pointer; text-align:left; }
.dfa-menu-item:hover { background:var(--dsw-alias-bg-layer-2); }
.dfa-menu-item.dfa-danger { color:var(--dsw-alias-state-error-primary); }
.dfa-row[draggable="true"] { cursor:grab; }
.dfa-row[draggable="true"]:active { cursor:grabbing; }
.dfa-sort { flex:none; width:110px; }
.dfa-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(120px, 1fr)); gap:10px; padding:4px 0; }
.dfa-card { display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px 8px; border-radius:14px; cursor:pointer; user-select:none; text-align:center; }
.dfa-card:hover { background:var(--dsw-alias-bg-layer-2); }
.dfa-card.dfa-selected { background:color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent); outline:1.5px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent); }
.dfa-card-name { font-size:12.5px; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dfa-card-meta { font-size:11px; color:var(--dsw-alias-label-secondary); }
.dfa-progress { margin-top:10px; padding:10px 12px; border-radius:12px; border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1); }
.dfa-progress-head { display:flex; justify-content:space-between; font-size:12px; color:var(--dsw-alias-label-secondary); margin-bottom:6px; }
.dfa-progress-track { height:6px; border-radius:3px; background:var(--dsw-alias-bg-layer-2); overflow:hidden; }
.dfa-progress-fill { height:100%; background:var(--dsw-alias-brand-primary); border-radius:3px; transition:width .2s ease; }
.dfa-progress-current { margin-top:6px; font-size:11px; color:var(--dsw-alias-label-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dfa-crumb-seg { border:none; background:none; padding:2px 4px; color:var(--dsw-alias-label-secondary); font-size:12px; cursor:pointer; border-radius:6px; }
.dfa-crumb-seg:hover { color:var(--dsw-alias-brand-primary); background:var(--dsw-alias-bg-layer-2); }
.dfa-crumb-sep { margin:0 2px; color:var(--dsw-alias-border-l2); }
.dfa-results { padding:6px 4px; }
.dfa-result { padding:10px 12px; border-radius:10px; cursor:pointer; }
.dfa-result:hover { background:var(--dsw-alias-bg-layer-2); }
.dfa-result-path { font-size:12px; color:var(--dsw-alias-brand-primary); margin-bottom:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dfa-result-line { font-size:12.5px; font-family:ui-monospace,Consolas,monospace; color:var(--dsw-alias-label-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dfa-md { padding:20px; width:100%; font-size:14px; line-height:1.7; }
.dfa-md-h1 { font-size:22px; font-weight:700; margin:12px 0 8px; }
.dfa-md-h2 { font-size:18px; font-weight:700; margin:10px 0 6px; }
.dfa-md-h3 { font-size:16px; font-weight:600; margin:8px 0 4px; }
.dfa-md-h4, .dfa-md-h5, .dfa-md-h6 { font-weight:600; margin:6px 0 4px; }
.dfa-md-p { margin:4px 0; }
.dfa-md-li { margin:2px 0; padding-left:8px; }
.dfa-md-bq { border-left:3px solid var(--dsw-alias-border-l2); padding-left:10px; color:var(--dsw-alias-label-secondary); margin:6px 0; }
.dfa-md-code, .dfa-code { background:var(--dsw-alias-bg-layer-1); border:1px solid var(--dsw-alias-border-l1); border-radius:10px; padding:12px; font-family:ui-monospace,'Cascadia Code',Consolas,monospace; font-size:12.5px; line-height:1.6; overflow-x:auto; white-space:pre; }
.dfa-md-inline { background:var(--dsw-alias-bg-layer-1); padding:1px 5px; border-radius:5px; font-family:ui-monospace,Consolas,monospace; font-size:12px; }
.dfa-md-a { color:var(--dsw-alias-brand-primary); }
.dfa-code-k { color:#c678dd; }
.dfa-code-s { color:#98c379; }
.dfa-code-c { color:#8b94a3; font-style:italic; }
.dfa-code-n { color:#d19a66; }
.dfa-tree-toggle { border:none; background:none; padding:0; width:16px; height:18px; color:var(--dsw-alias-label-secondary); cursor:pointer; flex:none; font-size:11px; line-height:1; }
.dfa-tree-toggle:hover { color:var(--dsw-alias-brand-primary); }
`;

  return module.exports;
}});
