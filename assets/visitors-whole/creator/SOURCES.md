# 访客文件的逐件来源

角色的脸、头发、耳朵、脖子、四肢、鞋和衣服都取自各自的完整原模型。馆内显示的名字由参观者填写。造型素材中的人物并非本馆真实的在场访客。作者许可链接均可追溯至具体的单件作品。

| 馆内文件 | 完整人物与作者 | 取得与制作 |
| --- | --- | --- |
| maya.glb | Digital Reality Lab / HumanScanRepository，HSRD-100 短发黑西装被摄者 HSR0112 的第 062 号姿态。 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 使用同一次全身摄影测量得到的脸、短发、西装与黑鞋。沿用 maya 的访客文件名，加上本馆步行骨架并调整了原本转向一侧的颈部。[该原件、校验值与表面处理](../collection/SOURCES.md) · [同一姿态的近景原件](../detail/SOURCES.md) |
| sam.glb | Renderpeople，[Nathan Animated 003 – Walking 3D Man](https://sketchfab.com/3d-models/nathan-animated-003-walking-3d-man-143a2b1ea5eb4385ae90a73657aca3bc)；[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 采用 [Appcodie 公开署名的优化版本](https://codezlet.com/models/credits.md)。保留同一人完整的摄影测量网格、服装与脸部颜色、法线和原蒙皮。剔除额外的手机物件，限制过亮的布料高光。保留该版本的 Walk_Scan 与 Idle_Scan 动作，经米制骨架重定向；它的手势已为手机示范作过调整。手势上游来源为 [Microsoft Rocketbox](https://github.com/microsoft/Microsoft-Rocketbox)，[Microsoft 的 MIT 许可全文](https://github.com/microsoft/Microsoft-Rocketbox/blob/master/LICENSE.md)。 |
| rose.glb | Renderpeople，[Claudia Rigged 002 – 3D Rigged Business Women](https://sketchfab.com/3d-models/c659bd0accab47c6bbe390cf822a2b92)；[单件许可](https://api.sketchfab.com/v3/models/c659bd0accab47c6bbe390cf822a2b92)，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 同型号的完整 FBX 与服装/肤色图来自 [CharacterPoser 项目](https://github.com/GregBahm/CharacterPoser/tree/main/public)。原图 Git 对象为 168b0410a8229f76c456365938dd14282657e369。统一坐标、转换纹理纵轴并重新打包；保留完整摄影纹理和同一原完整人物的全部网格。 |
| denim.glb | Renderpeople，[Eric Rigged 001 – Rigged 3D Business Man](https://sketchfab.com/3d-models/a46bc9f67aaa415bb4f3241eef900e7f)；[单件许可](https://api.sketchfab.com/v3/models/a46bc9f67aaa415bb4f3241eef900e7f)，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 采用 [该型号已贴图的 Y-up 整体再发行版](https://sketchfab.com/3d-models/106dc89ad15d4a0a8fbfb39fbdb886f4)，取自 Objaverse。保留作者完整几何；由[同型号 Unity 资产](https://github.com/MerryCodeAround/Final-Year-Project-22105496D/tree/main/unity%20project/3D%20objects/rp_eric_rigged_001_U3D)的 8192 像素原色图转为 4096。源图 Git 对象为 c6cba453b66dd5334de492e2d49805dcc0575c22。与已贴图版本的原有 1024 图经相同 UV 方向比对，降采样 RGB 相关系数为 0.99998。统一单位、关节名称与底部高度。 |
| cardigan.glb | Renderpeople，[Carla Rigged 001 – Rigged 3D Business Women](https://sketchfab.com/3d-models/acf520f450d14dd799f98a6fede3edf5)；[单件许可](https://api.sketchfab.com/v3/models/acf520f450d14dd799f98a6fede3edf5)，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 使用 [同型号再发行的完整 Unity FBX 与对应的 8192 像素原色图](https://github.com/MerryCodeAround/Final-Year-Project-22105496D/tree/main/unity%20project/3D%20objects/rp_carla_rigged_001_U3D)。网格源 Git 对象为 10bb49c72d5782ff13c57f8b8aa84c49f043268a，色图对象为 e0072dfcfe52cf5bbebd97b2b2b9ba048176a4f0。保留面部、肤色、发型、灰格裤和西装原照片，色图为移动端缩放至 4096 像素。 |

所有 GLB 静置坐标均以米为单位，脚底为零，面向本地 +Z。统一标出 Hips、Head、Spine2、Neck 和左右臂、腿、手、足关节，用原身体权重承载动作；重复的 UV/法线边界仍各自保留。Claudia、Eric 和 Carla 的骨架规范使用原作者各自的身高、肩宽和肢长。馆内采用的 CMU 动作来源由项目行走系统另行著录。

## 眼表与衣物材质

Claudia、Eric 和 Carla 的完整 Unity 原包均含 Renderpeople 的 `RP_Rigged_MasterShader.shader`。其中 `_Normal` 读取切线空间法线，`_GM` 的红通道参与计算光泽，绿色和蓝色通道标注可调色衣物。本站使用原色图，将同一人的 8192 像素法线向量缩放、归一化为 2048 像素图，并将原 2048 像素红通道转换为 1024 像素的介电材质粗糙度。Claudia 近景另保留作者原始 UV 供法线及粗糙度使用。Nathan 使用其署名版本自带的 2048 像素法线及 1024 像素粗糙度纹理。

| 原角色 | 包含着色器和材质的原件 | 法线 Git 对象 | GM Git 对象 |
| --- | --- | --- | --- |
| Claudia 002 | [Claudia 的完整原包及材质](https://github.com/MerryCodeAround/Final-Year-Project-22105496D/tree/main/unity%20project/3D%20objects/rp_claudia_rigged_002_U3D) | `5c3a42aaa28dfdbee39718fd5fc132232c138a66` | `8c4abf1555294bf87fa9cf1d01ee1236ad7d44c7` |
| Eric 001 | [Eric 的完整原包及材质](https://github.com/MerryCodeAround/Final-Year-Project-22105496D/tree/main/unity%20project/3D%20objects/rp_eric_rigged_001_U3D) | `05ee7579982688cf743e63b93eecc5fe8e410e85` | `3a9fe6d0e628e832789dcf2d2dd60cc64927dff1` |
| Carla 001 | [Carla 的完整原包及材质](https://github.com/MerryCodeAround/Final-Year-Project-22105496D/tree/main/unity%20project/3D%20objects/rp_carla_rigged_001_U3D) | `22ec22b011e22d6ae61a9b1ea772e67248f36350` | `ca1a894c57b084bb4ed80d2ba840a06e982580e5` |

四位角色的眼睛沿用各自的虹膜纹理与眼球网格。馆内对原眼球表面单独计算角膜反射，以作者的眼球、上眼睑和眉部蒙皮驱动注视与眨眼。Nathan、Claudia 与 Carla 每只眼球使用 420 个原三角形，Eric 每只眼球使用 960 个。

三位馆内配色使用原作者 GM 绿色衣料遮罩。Claudia 的系带衬衫呈浅瓷青色，Eric 的马甲和领带呈酒红色，Carla 的外套呈海军蓝色。Eric 的原通道同时包含黑西裤，馆内通过原始 UV 衣片区分开了上衣与裤子。颜色乘在相应布料的原始摄影纹理上，保留衣褶、缝线与明暗。色图原件仍与原模型一致。
