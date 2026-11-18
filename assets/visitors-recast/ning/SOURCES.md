# 宁遥

宁遥是石窟为这位参观者起的名字。她的脸、及肩长发、浅薄荷灰短袖、深色运动长裤和跑鞋来自 Digital Reality Lab / HumanScanRepository 的同一次全身摄影测量 **HSR0028-Body-093**。作者在扫描包内的 `person_metadata.json` 将原型的国籍记为日本。馆藏的历史版本曾收录同一位模特身穿条纹衬衫的第 058 号扫描，本次采用她穿运动服的第 093 号扫描。[作者的 HSRD-100 说明和授权](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/README.md) · [此次拍摄的源文件](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/tree/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0028/HSR0028-Body-093)

## 文件与署名

| 本馆文件 | 制作依据 |
| --- | --- |
| `portrait.glb` | 从该次扫描的 [LOD1 几何与 8192 像素原始摄影纹理](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0028/HSR0028-Body-093/scans/HSR0028-Body-093-Scan-LOD1.zip)制成。近看时使用 100,866 个三角面。4096 像素的近景图集为面部保留约 93% 的原始线性纹理密度，身体纹理使用 2457 像素宽的区域。 |
| `gallery.glb` | 以[作者的 LOD2 原件及 4096 像素摄影纹理](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0028/HSR0028-Body-093/scans/HSR0028-Body-093-Scan-LOD2.zip)制成。10,360 个三角面，双手、服装和鞋使用同一套骨架。 |
| `walking.bin` | 入馆及多人同游所用的轻量模型，与展厅级共用几何和蒙皮，摄影纹理缩至 2048 像素、转为 WebP，整个 GLB 使用 gzip 封装。 |
| `reference.webp` | 转码自作者发布的[原始四面视图](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/preview/HSR0028-Body-093-Cover.jpg)，保留图内署名和实际拍摄的跑步姿态。 |
| `card.webp` | 从本馆的立体角色渲染的选人肖像。 |

作者拍摄时模特单腿抬起。石窟依据七个角度的身体观测放置关节，按原身体比例将骨架还原到双脚站立的姿态，调整袖口、裤裆和弯曲膝部相接处的蒙皮和布料表面，清理近景几何中的三处孤立扫描残片，修整右鞋底。行走时每只鞋的鞋底与足掌整体承重，鞋口与脚踝之间按距离过渡。行走时由展馆的步态、转向与落脚系统实时驱动。[动作素材与署名](../../visitors-whole/motions/SOURCES.md)

发丝与脸颊交接处有一小段折返的扫描表面。本馆在近景模型上局部修整了 89 个几何点，在展厅模型上修整了 9 个点，单点位移上限为 10 毫米。眼睛、鼻口和面部其余位置保留原采集形状。拍摄时的表情、瞳孔方向和成束的发丝随模型保留。

本目录署名 **Digital Reality Lab / HumanScanRepository（原始扫描与摄影）及 ShiKu（互动展馆改编）**，按 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 提供。原始文件版本为 `9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a`，SHA-256 如下。

| 原件 | SHA-256 |
| --- | --- |
| LOD1 ZIP | `b8e090869e5085c726a8ba50e106f7668b3b9aee764b638a3ae4f96d908dc7b6` |
| LOD2 ZIP | `e151b40721ab89963b9be3df612d7bfb211dd726b028abafaf4df9174b575bc5` |
| 原始四面视图 JPG | `5c63656c5f478fefd2e017b6879d9ed74e8fa5656ed5d6cbb0515ec867df7eed` |
