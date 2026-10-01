# 安全契约 · dsh-file-archive

本契约是硬约束，写进 `guards.js` 运行时执行，而不是仅靠开发者自觉。

## 1. 允许名单（allowlist）
只允许操作 DSH 已注册工作区（`workspaceRegistry.list()` 返回的 canonical 路径）
内的普通文件。除此之外一律拒绝。

## 2. 拒绝名单（denylist）
以下路径永不触碰（读操作也拒绝破坏性动作）：
- DSH 数据目录（`~/.dsh`）
- 本插件自身目录（`import.meta.url` 所在目录，含删除记录）
- 系统目录：`C:\Windows`、`C:\Program Files`、`C:\Program Files (x86)`、`C:\ProgramData`
- 工作区内的 `.git`、`.dsh` 关键隐藏目录

## 3. 删除策略
- 一律调用 Windows 系统回收站（`SendToRecycleBin`），不做永久删除。
- 本插件不提供「清空回收站 / 永久删除」入口。

## 4. 批量上限
- 单次删除/移动：文件数上限 `500`、总大小上限 `2 GiB`，超限直接拒绝。

## 5. 路径校验
- 所有路径先 `realpath` 取 canonical 路径，再 `contains` 校验在允许名单内。
- 拒绝符号链接逃逸、拒绝 `..` 越界。

## 6. 试运行与确认
- 客户端删除/移动前先展示完整受影响清单，二次确认后才执行。
- 执行后回报实际结果。

## 7. 进程安全
- 插件不结束、不重启、不中断 DSH 相关进程。
- 不调用任何进程管理能力。

## 8. 零外部依赖（启动安全·硬约束）
**本插件的 Host 半不得引入任何 npm 运行时依赖**，只用 Node 内置模块
（`node:fs` / `node:path` / `node:zlib` / `node:child_process` / `node:util`）
同目录的本地模块（`./guards.js`、`./zip.js`）。

**原因（2026-10-01 实际事故）**：本插件以 `link:`（Windows junction）装入 profile，
而 DSH 宿主以保留符号链接（`--preserve-symlinks`）的方式解析模块。此时
pnpm 的 `.pnpm` 符号链接布局会断裂——`archiver` 的传递依赖 `readdir-glob`
解析失败，导致 `dsh-file-archive: failed`，**整个 web boot 中断、应用无法启动**。

因此 zip 功能由零依赖的 `zip.js`（内置 `node:zlib`）自实现，而非 `archiver` + `extract-zip`。
新增功能时请遵守本约束；若确需依赖，必须先把依赖装进 profile 的 `node_modules`
并在 `--preserve-symlinks` 模式下实测解析成功，再合入。

