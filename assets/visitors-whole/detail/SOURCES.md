# 桌面近景整身人物

六份 HSRD-100 人物近景采用 Digital Reality Lab / HumanScanRepository 对同一被摄者、同一姿态发布的较高密度全身摄影测量网格及其 8192 × 8192 实拍纹理。馆内将网格转换为米制，以场内已有骨骼的同一表面为基准转移权重，并分离静态扫描中连在一起的手与身体、左右鞋的接触面。[HSRD-100 数据集说明](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/README.md) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

| 馆内形象 ID | 作者原件 | 展示三角数 | 原始扫描包 SHA-256 |
| --- | --- | ---: | --- |
| 短发黑西装 · `maya` | [HSR0112-Body-062 · LOD1](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0112/HSR0112-Body-062/scans/HSR0112-Body-062-Scan-LOD1.zip) | 99,650 | `e209e7403362650317d518a73134fc7e823813fcd8f332c7cad0777b0f710657` |
| slate | [HSR0028-Body-058 · LOD1](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0028/HSR0028-Body-058/scans/HSR0028-Body-058-Scan-LOD1.zip) | 99,100 | `c8819682a3bc34b35250e0b336d0f6fd5aa1fd022ecb565b281b71868a77a7d3` |
| 藏蓝短袖 · `linen` | [HSR0040-Body-086 · LOD1](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0040/HSR0040-Body-086/scans/HSR0040-Body-086-Scan-LOD1.zip) | 99,955 | `881b771ee60786200cc45244146738f7e62174c556176e55a8a4506f69acc32e` |
| brick | [HSR0042-Body-011 · LOD1](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0042/HSR0042-Body-011/scans/HSR0042-Body-011-Scan-LOD1.zip) | 99,744 | `c35f75ce2faeb1703a611110e296bafd458e2c6bf6456472d11d57011e2ae8d4` |
| 紫色印花短袖 · `hoodie` | [HSR0102-Body-042 · LOD1](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0102/HSR0102-Body-042/scans/HSR0102-Body-042-Scan-LOD1.zip) | 100,130 | `10a68d4e54fd36b03af328f29988e70d96e7ef7581c40efe3696e0dfc4a86475` |
| sage | [HSR0023-Body-042 · LOD1](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0023/HSR0023-Body-042/scans/HSR0023-Body-042-Scan-LOD1.zip) | 99,540 | `cd132c0289013ef09ecbad1e72372af4c02574b15ba429be5cf30e3777d780e4` |

Claudia 002（rose）保留普通版本的 21,490 个三角形、原模型骨架及蒙皮。近景采用同型号 Unity 素材中的 8192 × 8192 原色图，原图的 Git 对象为 `44bf2516df85457a7fae94a06daeda66e82ce1b7`。[Renderpeople 原件](https://sketchfab.com/3d-models/c659bd0accab47c6bbe390cf822a2b92) · [同型号材质包](https://github.com/MerryCodeAround/Final-Year-Project-22105496D/tree/main/unity%20project/3D%20objects/rp_claudia_rigged_002_U3D/tex) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

七件近景都将各自原图中的面部可见细节按原始像素密度保留，衣物和头发的其余区域按较低密度取样，合并为一张 4096 × 4096 色图。每位角色共用一张自己的颜色贴图。Claudia 的近景还保留原始 UV，使眼球、皮肤和衣服在重排后的颜色纹理上仍正确对应作者的法线与光泽图。七份近景各自与普通版本共享一副步行骨架。短发黑西装与紫色印花短袖的面数包括补合服装内侧接触口所用的三角形。[近景所用的原作者材质和转换说明](../creator/SOURCES.md#眼表与衣物材质)
