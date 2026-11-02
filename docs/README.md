# docs

本仓库（`gqy-plugins-ShowImages-default`）自己的文档索引。仓库是 GQY 的「图片展示」示例插件，文档保持最小。

## 文档索引

| 文件 | 内容 |
| --- | --- |
| [`../README.md`](../README.md) | 插件定位、图片清单、安装方式、许可与署名、与主仓库关系 |
| `docs/README.md`（本文件） | 文档索引 + manifest 与动作约定 |

## manifest 约定

仓库根自带真实 `manifest.json`（`id` 为 `show-images-default`），安装时直接使用，不再由用户手写。字段规则见主仓库 [`GQY/docs/designs/04-插件运行时.md`](../../GQY/docs/designs/04-插件运行时.md) 的 P3（manifest 字段与约束）。

- `id`：`show-images-default`（满足 `^[a-z0-9][a-z0-9_-]{0,31}$`）。
- `protocol`：`gqy-jsonrpc-v1`（原生 stdio 换行 JSON-RPC 2.0）。
- `command`：`["node", "index.js"]`，相对 manifest 目录；`cwd` 为 `.`，`timeout_ms` 为 `10000`，`concurrency` 为 `concurrent`。
- `actions`：`list`（无参数）与 `show`（必填 `name`，可选 `inline`）。
- `provides` / `requires`：均为空数组。

## 动作语义（与 `index.js` 实现一致）

- `list`：无参数。返回 `{"content": "<JSON 字符串>"}`，`content` 解析后形如 `{"images": [{"name","style","file","bytes"}, …]}`，共 13 条，顺序同 `index.js` 里的清单；`file` 是相对仓库根的 `gqy-images/<name>.png`，`bytes` 是实际文件字节数。
- `show`：参数 `name`（图片名称，如 `01-工笔淡彩`；也接受 `gqy-images/01-工笔淡彩.png` 这种仓库内相对路径），可选 `inline`。返回 `{"content": "<JSON 字符串>"}`，`content` 解析后是 `{"name","style","file","bytes"}`；`inline` 严格为 `true` 时额外带 `data_uri`（`data:image/png;base64,…`）。
- 错误：`name` 缺失或图片不存在时返回 JSON-RPC `error`（`-32000`），进程继续服务；未知动作 / 未知方法为 `-32601`，非法 JSON 行为 `-32700` 且 `id` 为 `null`。
- 退出：`shutdown` 回 `{"ok": true}` 后以 0 退出；stdin EOF 时自退。

注册成外部工具后，工具名为 `show-images-default__list`、`show-images-default__show`（见 [`GQY/docs/designs/04-插件运行时.md`](../../GQY/docs/designs/04-插件运行时.md) P11）。

## 当前状态

- 静态资产已就位：`gqy-images/` 下 13 张 PNG。
- 动作已实现：`index.js`（零依赖，stdio 换行 JSON-RPC 2.0）+ 仓库自带 `manifest.json`。
- 自检：`npm test`（即 `test/handshake.mjs`），走 initialize → list → show → show(inline) → show(不存在) → shutdown 全链路。
