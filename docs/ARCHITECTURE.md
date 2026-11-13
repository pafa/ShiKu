# 项目结构 · Architecture

ShiKu 的浏览器端绘制 3D 展厅、处理行走和讲解。每台设备独立渲染所见画面，房间服务向同馆访客同步昵称、形象和位置。在本地启动展馆只需要 Node.js，Three.js 和展陈所需的公开媒体随仓库提供。

## 跟随一次参观读代码

| 操作 | 代码入口 | 数据如何流动 |
| --- | --- | --- |
| 起名并入馆 | [entry.js](../entry.js) · [admission-client.js](../admission-client.js) | 登记时取得席位或候位票据。候位客户端定期查排位，在同一标签页中保留可用于恢复的记录。 |
| 进入展厅并走近作品 | [museum.js](../museum.js) · [connected-museum.js](../connected-museum.js) · [cave-plan.js](../cave-plan.js) | 展厅平面与窟室入口在同一世界坐标中定位。窟室内的观察点决定驻足时显示哪段故事。 |
| 查作品出处，听讲解 | [object-evidence.js](../object-evidence.js) · [collection-room.js](../collection-room.js) · [walk-companion.js](../walk-companion.js) | 作品 ID 对应展签、可用的本地影像及原机构入口。讲解使用窟室 ID 和观察点 ID 定位已录制的普通话 MP3。 |
| 看见同行者移动 | [presence-client.js](../presence-client.js) · [room-visitors.js](../room-visitors.js) | 浏览器发送位姿更新，读取 NDJSON 消息流，在自己画面的地图与展厅中更新同行者。 |
| 从讲稿回到来源 | [scripts/check-interpretation.mjs](../scripts/check-interpretation.mjs) · [recordings.json](../assets/walk/voices/recordings.json) | 核验展项出处、观察点、字幕和音轨摘要，让改过的讲稿能被检查识别。 |

## 同一浏览器，两种房间服务

本地参观时，Node 同时提供静态文件和房间 API。在一个进程内维护 50 个席位及候位顺序，终止进程会清空这一房间。[Node 服务](../server/museum.mjs) · [候位实现](../server/admission.mjs)

Cloudflare 部署时，Worker 提供静态资源并把房间请求集中到一个名为 `museum-public-v1` 的 Durable Object。SQLite 保存有效的席位、排队顺序、会话及最近保存的位置。连续行走轨迹保存在活跃房间的内存中。打开馆方来源时，浏览器访问相应的外部机构。[Worker 入口](../deploy/cloudflare/worker.mjs) · [房间实现](../deploy/cloudflare/room.mjs) · [数据保存期限](PRIVACY.md)

## 一件作品怎样进入公开版本

1. 馆藏记录给出遗址、具体作品与资料出处。实物摄影、历史图版、机构扫描分别署名，展项也可单独链接权威资料。展示用到哪张图，可从作品 ID 追到对应记录与选图逻辑。[馆藏目录](../CATALOG.md) · [证据与选图](../object-evidence.js)
2. 可分发媒体按文件记录路径、原作者、出处、改动、许可与 SHA-256，新源码单列。打包脚本由两份清单生成公开候选，重新生成导览与署名页，并逐段校验讲解。公开包内的每条媒体记录都能查到原出处。[媒体清单](../release/public-assets.json) · [源码清单](../release/public-sources.json) · [打包脚本](../scripts/package-public.mjs)
3. 对干净候选运行内容与房间检查后，可准备 Worker 的静态子集并做本地构建演练。修改多人逻辑时另有 workerd 重启验证，覆盖在馆席位和候位顺序恢复。发布命令、实际域名与版本回滚步骤由维护者运行手册说明。[贡献指南](../CONTRIBUTING.md) · [房间集成测试](../scripts/verify-worker-room.mjs) · [Cloudflare 运维手册](../deploy/cloudflare/README.md)
