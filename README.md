# gqy-plugins-ShowImages-default

[![CI](https://github.com/GQYTeam/gqy-plugins-ShowImages-default/actions/workflows/ci.yml/badge.svg)](https://github.com/GQYTeam/gqy-plugins-ShowImages-default/actions/workflows/ci.yml)

GQY 的「图片展示」示例插件：预置一组风格化示例图片，供 GQY 的产物灯箱与对话里的图片展示使用。

## 干什么

- 内置 `gqy-images/` 下 13 张风格示例图（PNG）。
- 通过 GQY 插件运行时暴露两个动作：`list`（列出图片）与 `show`（展示指定图片，`inline:true` 返回 data URI）。已实现，stdio 换行 JSON-RPC，零依赖。
- 图片用于 GQY 的产物灯箱 / 图片展示场景，不作为模型上下文以外的独立能力。

## 图片清单

| 文件名 | 风格说明 |
| --- | --- |
| `01-工笔淡彩.png` | 工笔淡彩 |
| `02-水墨写意.png` | 水墨写意 |
| `03-海边泳衣.png` | 海边泳衣 |
| `04-烛光丝裙.png` | 烛光丝裙 |
| `05-雨夜湿发.png` | 雨夜湿发 |
| `06-白蕾丝晨光.png` | 白蕾丝晨光 |
| `07-黑蕾丝烛光.png` | 黑蕾丝烛光 |
| `08-蕾丝面纱.png` | 蕾丝面纱 |
| `09-冷光白纱.png` | 冷光白纱 |
| `10-烛下黑纱.png` | 烛下黑纱 |
| `11-泳池蕾丝.png` | 泳池蕾丝 |
| `11-风里薄纱.png` | 风里薄纱 |
| `12-银灰蕾丝.png` | 银灰蕾丝 |

说明：存在两个同前缀「11」的文件（`11-泳池蕾丝.png`、`11-风里薄纱.png`），按文件名排序展示；后续若需要可重编号，重编号时要同步更新本表与 `list` 动作返回。

## 安装方式

GQY 按 `$GQY_HOME/plugins/<id>/manifest.json` 发现插件，约定见 [`GQY/docs/designs/04-插件运行时.md`](../GQY/docs/designs/04-插件运行时.md) 的 P3（manifest 字段）与 P9（安装 / 扫描）。`$GQY_HOME` 默认是 `~/.gqy`。

把本仓库部署成：

```
$GQY_HOME/plugins/show-images-default/
  manifest.json      # 本仓库自带，直接使用
  gqy-images/
    01-工笔淡彩.png
    …
```

- 本仓库自带 `manifest.json` 与 `index.js`，直接拷进 `$GQY_HOME/plugins/show-images-default/` 即可加载。
- 自检：`node test/handshake.mjs`（或 `npm test`）走 initialize → list → show → shutdown 全链路。
- 安装插件 = 信任它：GQY 不设运行时权限墙（见 `GQY/docs/designs/11-安全与沙盒.md` SEC5），只从可信来源安装。

## 与主仓库的关系

- 本仓库与 `GQY/` 主仓库地位平等，都在 GQYTeam 组织工作区里（见 org 根 `README.md` 的仓库地图）。
- 本仓库依赖 GQY 的插件运行时与 manifest 约定，但不 import GQY 的代码。
- 跨仓库决定只写一份，放在主仓库 `GQY/docs/designs/`；本仓库只引用，不复制。

## 许可与署名

本仓库按 **PolyForm Noncommercial License 1.0.0** 授权，全文见 [`LICENSE`](LICENSE)，来源与署名要求的完整版见 [`NOTICE`](NOTICE)。

- **禁止商用。** 生产、部署、售卖、SaaS、内置进商业产品等任何商业目的的使用，都不在授权范围内。
- **必须署名。** fork、二次开发，或借鉴本仓库的代码 / 文档 / 设计，都要在衍生项目的 `README.md`（或同等声明文件）里原样写清四项：

```text
来源项目：GQYTeam/gqy-plugins-ShowImages-default
项目地址：https://github.com/GQYTeam/gqy-plugins-ShowImages-default
原作者：GQYTeam
许可证：PolyForm Noncommercial License 1.0.0
```

- **保留通知。** 分发任何副本（含修改后的）都必须带上 `LICENSE`、`NOTICE` 与 `NOTICE` 顶部的 Required Notice 原文。
- 贡献即同意按本仓库许可分发；细则见 [`CONTRIBUTING.md`](CONTRIBUTING.md) 与 [`SECURITY.md`](SECURITY.md)。
