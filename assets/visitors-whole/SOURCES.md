# 访客形象与步行动作

馆内有十种完整人物造型。选择页的头像由各自的整身模型渲染，入馆、近看和多人共游显示同一人物。参观者填写的名字只用于其馆内身份。

| 造型 | 来源 | 馆内所用的素材 |
| --- | --- | --- |
| 炭黑短袖、瓷青系带衬衫、酒红马甲、海军蓝西装 | Renderpeople 的 Nathan、Claudia、Eric、Carla | 四个各自完整的人物网格及对应的原色图。 |
| 短发黑西装、藏蓝短袖、青瓷条纹衬衫、赭红夹克、紫色印花短袖、青灰条纹衫 | Digital Reality Lab / HumanScanRepository 的 HSRD-100 | 普通精度采用各自的 LOD2 全身扫描和同次拍摄的 4096 × 4096 颜色纹理，近景采用同一姿态的 LOD1 扫描。本馆为其添加行走骨骼与权重。 |

六位 HSRD 访客与 Claudia 的近景版本将各自的 8192 × 8192 原色图按部位重排至 4096 × 4096，保留面部原始采样。移动端和多人共游可使用较小的整身版本。[七份近景原件、面数和处理说明](detail/SOURCES.md)

各件模型按 CC BY 4.0 再发行。逐件清单列出作者、可核对的原件、许可和本馆做过的转换。Nathan 再发行版本的附带动作另有上游归属。[四位 Renderpeople 人物的逐件署名](creator/SOURCES.md) · [六份 HSRD-100 扫描与校验值](collection/SOURCES.md) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

行走、转身与驻足的姿态取自 Carnegie Mellon University Graphics Lab Motion Capture Database，采集由 NSF EIA-0196217 资助。馆内把采集到的动作转换到不同身高、比例和鞋底的访客骨架。访客的位置、方向和移动轨迹由本次参观产生。[动作编号、处理和原始文件摘要](motions/SOURCES.md) · [CMU 数据库](https://mocap.cs.cmu.edu/)

皮肤、发丝和衣料的布光与展厅中的摄影校准详见[访客表面与近看环境](surfaces/SOURCES.md)。
