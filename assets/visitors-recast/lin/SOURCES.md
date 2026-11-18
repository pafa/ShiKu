# 林澈的原型

林澈是展馆给这位访客取的名字。原作是 OverseerThuror 以摄影测量制作的《Full Body Scan – Clean Pose》。黑色棒球帽、脸和头发、紫色连帽衫、双手、牛仔裤以及灰白运动鞋都来自同一份整身扫描。作者没有公布被摄者的姓名、年龄或国籍。[作者发布的扫描](https://sketchfab.com/3d-models/full-body-scan-clean-pose-ae9559912f6240a8a87057911b69edd0)

**署名**　《Full Body Scan – Clean Pose》，OverseerThuror，按 CC BY 4.0 改作。作者作品编号为 `ae9559912f6240a8a87057911b69edd0`。副本附带相同编号、作者及许可，可以逐项对照。[作者主页](https://sketchfab.com/OverseerThuror) · [随原件附带的许可](https://github.com/T-465/Reverse_By_Daylight/blob/a93ccb9bebabd34e2d097bd50349c8395178870e/Assets/Import/Full_Body_Scan_-_Clean_Pose/license.txt) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

| 展馆文件 | 来源与处理 |
| --- | --- |
| `gallery.glb` | 展厅中使用 34,000 个三角面。简化时固定头脸顶点，保存眼睑、嘴唇和帽檐轮廓。衣鞋使用同一张实拍颜色贴图，展厅档宽 3,072 像素。 |
| `walking.bin` | 与展厅档共用人体、衣鞋和行走关节，为入馆及多人同屏压缩传输。 |
| `portrait.glb` | 保留原作 76,940 个独立表面三角形。原件为同一面同时储存正反方向，展馆合并了这些重叠面。4,096 像素的纹理图集从原版 8,192 像素色图中保留面部和双眼的原始取样密度。 |
| `reference.webp` | 从处理步态之前的原作网格直接渲染，可对照原脸、服装和背面。 |
| `card.webp` | 由展馆中的角色模型渲染的选择头像。 |

作者发布的是固定站姿。展馆为它绑定了 24 个步行关节，分别处理头脸、上衣、裤腿、手和鞋的运动。原拍时的眼神与表情保留在脸上。参观时的身体运动由展馆步行动作驱动。[展馆动作出处](../../visitors-whole/motions/SOURCES.md)

| 可核验的原件 | SHA-256 |
| --- | --- |
| [三维网格](https://github.com/T-465/Reverse_By_Daylight/blob/a93ccb9bebabd34e2d097bd50349c8395178870e/Assets/Import/Full_Body_Scan_-_Clean_Pose/meshes/Object_0_0_0.asset) | `f8a84a266bf364b908a72fab625bcd7d2667f371b636e9ca9913ed861ae8c1b5` |
| [8,192 × 8,192 原色图](https://github.com/T-465/Reverse_By_Daylight/blob/a93ccb9bebabd34e2d097bd50349c8395178870e/Assets/Import/Full_Body_Scan_-_Clean_Pose/textures/Default_OBJ.001_baseColor_0.png) | `46d6ef09a3bbf4e4f623356c1f895dede44a80b8d3ea6d7fa4c5e4783e529a4e` |
