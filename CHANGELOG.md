# 变更记录 · Changelog

## Unreleased · 版本变更

- 九个时代展厅新增 22 件有图展品，另为 23 件旧展品配图。可在宋馆细看 968 年敦煌水月观音绢画的供养人，在唐馆看第112窟反弹琵琶，或在断代研读馆对照麦积山第120窟的壁面与颜料截面。仅作同址参照的图像在展签中标明。[逐馆图像统计](CATALOG.md#展墙图像覆盖)

- 将余下的62件纯文字主展改为图像或模型先行。莫高窟用历史摄影展示壁画和彩塑，麦积山新增现场调查图片和三间窟室的可旋转尺度模型。展墙、馆藏总目和逐件导览标出同址图与其他作品对照，并保留各件的原图或著录入口。[图像与模型统计](CATALOG.md#展墙图像覆盖)

- 本地可分别启动功能试玩和回归房间，并核对所用源码版本。公开仓库的文件、素材说明中的本地链接和冻结归档均可复验。[本地环境](docs/ENVIRONMENTS.md) · [贡献流程](CONTRIBUTING.md)

- 中英文项目介绍增加四大石窟的可走路线、正式试用地址、现场截图和逐图署名。访客可按具体问题查看参观帮助，贡献者可从功能入口定位源代码。[项目介绍](README.md) · [实机截图署名](docs/images/README.md) · [支持](SUPPORT.md) · [架构](docs/ARCHITECTURE.md)
- 首次入馆时，进度条会等待首景素材就绪。普通入口会从九座展厅的 54 个可通行地点中随机分配空位，洞窟链接保留原目的地。多人房间在实时连接中断后可以通过认证心跳同步位置和轨迹。
- 展厅按参观位置加载原图。静态站和本地服务增加内容安全策略，部署工具的锁定依赖进入 PR 安全检查。
- 增加软件引用元数据和社区行为约定。研究与教学可分别引用项目软件和展品本身。[引用项目](CITATION.cff) · [社区行为约定](CODE_OF_CONDUCT.md)

## 首次公开试用 · Initial hosted trial

首次公开试用采用代码快照 [`a06accd`](https://github.com/pafa/ShiKu/commit/a06accd0609e1fd5d3c894cb8b5825c64b81a44b)。

- 九座相连的时代展厅收录 179 件展品。94 件附可再分发的实物影像，另 85 件保留著录或机构原始出处。可以沿莫高窟第 158 窟卧佛走读壁画，也可以从龙门奉先寺阶下走近崖壁群像。
- 139 段普通话讲解随驻足点切换。多人房间接待最多 50 名在馆访客，满员时显示排位和预计等候时间。在线房间使用 Cloudflare Workers 与 SQLite Durable Objects。

The initial hosted trial opened nine galleries, 179 exhibits and 139 Mandarin audio stops. Subsequent changes add progress feedback, distributed arrival positions and recovery for interrupted group visits. [Visit ShiKu](https://shiku.xiaoha.org/) · [Check the running Worker version](https://shiku.xiaoha.org/api/version)
