# docs

Assets referenced by the README live here.

## Screenshot

Save a screenshot of the File Archive panel as **`screenshot.png`** in this
folder — the README links to `./docs/screenshot.png`.

Suggested shot: the panel open on a workspace with a few files, so the sidebar
icon, the file list, and a preview popup are all visible.

把「文件归档」面板的截图存为本目录下的 **`screenshot.png`** —— README 会引用
`./docs/screenshot.png`。

## Publishing to npm (TODO)

For now the repository itself is the distribution channel
(`dsh plugin add github:baisedoubi111/dsh-file-archive`). Publishing to npm is a
planned follow-up; the package metadata is already prepared, so once an account
exists it is just:

```bash
npm login   --registry=https://registry.npmjs.org/
npm publish --registry=https://registry.npmjs.org/ --access public
```

Notes for whoever does it:

- The default registry on the author's machine is a read-only mirror
  (`registry.npmmirror.com`) — always pass `--registry=https://registry.npmjs.org/`.
- `npm adduser --auth-type=legacy` can no longer create accounts; npm requires
  signup through the website (which sits behind a Cloudflare challenge).
- The unscoped name `dsh-file-archive` was still available at the time of writing.
- Verify with `npm view dsh-file-archive`.

