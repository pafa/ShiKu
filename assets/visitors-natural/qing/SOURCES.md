# 加奈 · Kana

加奈有齐肩棕发，穿浅驼色衬衣、棕腰带、米白长裤和露趾鞋。展馆选用 Atelier Brown / ddd 发布的完整角色 **Free 018 Kana Walk**。作者介绍这些素材以日本模特为原型，使用多相机摄影测量制作。「Kana」是原作者给这个形象起的名字，未公开被摄者的具体年龄。

[作者的 Kana 单件作品](https://sketchfab.com/3d-models/free-018-kana-walk-f465652729944a66aed790cd88fa0b0f) · [作者对日本模特和拍摄过程的说明](https://a.brown.tokyo/?p=1214) · [制作方 Atelier Brown](https://brown.tokyo/menu/photogrammetry/) · [另一份作者的 A 姿样本](https://sketchfab.com/3d-models/018-kana-no-rig-free-2dfac98e05984069a46bf3bd6a512e67)

**素材授权**　Atelier Brown / ddd（Sketchfab 作者名 endonoriko）。本馆使用的上述 Sketchfab 步行版及其 GLB 内嵌元数据均标明 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。下载的 [Objaverse 存档](https://huggingface.co/datasets/allenai/objaverse/blob/main/glbs/000-070/f465652729944a66aed790cd88fa0b0f.glb) SHA-256 为 `98de0a867c4dfb1ced2e8e38e68bc73bbf2b734a3c97818bbc26df727f0a9f89`。本馆只使用这份授权原件包含的彩色图和整身网格。

| 本地文件 | 处理与对应依据 |
| --- | --- |
| `gallery.glb` | 原模型 19,422 个三角面。保持原 UV、完整脸部与头发、露出的双手及服装。把 66 个骨骼换算到以米为单位的展馆坐标，保留各手指关节、蒙皮与原有身体比例，为落脚时鞋底接地稍作足部权重修正。 |
| `portrait.glb` | 基于同一张脸与同一套骨架，一次曲面细分后 77,688 个三角面。保留全部原顶点，新边中点的曲面偏移在脸上最高 0.7 毫米，在脚底最高 0.18 毫米。两档使用同一张原作 1024×1024 色图。 |
| `reference.webp` | 在本地直接渲染作者发布的原 GLB，呈现脸、发型与服装的不同侧面。参照的来源是作者的三维原件。 |
| `card.webp` | 由展馆实际使用的访客模型渲染的登录头像。 |

原形象轻微侧视、露齿微笑；单次采集保留这一表情。颜色、眼睛和脸均来自同一原模型，头发保留原本的发束表面。表情、独立发丝和毛孔的细节以上述实际清晰度为限。本馆 [行走动作](../../visitors-whole/motions/SOURCES.md) 根据操作实时驱动原身体骨架。

[转换脚本](../../../scripts/visitor-natural/kana.py) 使用 Python 3.12、NumPy 1.26.4。从上述 Objaverse 存档取得 GLB 后，运行 `python scripts/visitor-natural/kana.py /path/to/original.glb /path/to/output` 可重建两档馆内模型。
