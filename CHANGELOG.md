# 变更记录 · Changelog

## Unreleased · 待合入

- 中英文项目介绍增加四大石窟的可走路线、正式试用地址、现场截图和逐图署名。访客可按具体问题查看参观帮助，贡献者可从功能入口定位源代码。[项目介绍](README.md) · [实机截图署名](docs/images/README.md) · [支持](SUPPORT.md) · [架构](docs/ARCHITECTURE.md)
- 增加软件引用元数据和社区行为约定。研究与教学可分别引用项目软件和展品本身。[引用项目](CITATION.cff) · [社区行为约定](CODE_OF_CONDUCT.md)

## 在线试用 · Hosted demo

[试用 ShiKu](https://shiku.xiaoha.org/) 采用首发候选的代码快照 [`a06accd`](https://github.com/pafa/ShiKu/commit/a06accd0609e1fd5d3c894cb8b5825c64b81a44b)。

- 九座相连的时代展厅收录 179 件展品。94 件附可再分发的实物影像，另 85 件保留著录或机构原始出处。可以沿莫高窟第 158 窟卧佛走读壁画，也可以从龙门奉先寺阶下走近崖壁群像。
- 139 段普通话讲解随驻足点切换。多人房间接待最多 50 名在馆访客，满员时显示排位和预计等候时间。在线房间使用 Cloudflare Workers 与 SQLite Durable Objects。

The **Unreleased** changes improve the bilingual project guide, credits, visitor support and contributor documentation. The **hosted demo** runs the linked RC1 source snapshot with nine galleries, 179 exhibits, 139 Mandarin audio stops and a shared room for up to 50 visitors.
