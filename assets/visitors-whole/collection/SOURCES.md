# 访客整身摄影测量素材

这六位访客选自 Digital Reality Lab（HumanScanRepository）2025 年发布的 [HSRD-100](https://huggingface.co/datasets/digitalrealitylab/HSRD-100)。[该版数据集的使用说明](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/README.md#license) 以 [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/) 授权，包括改作和分发。

每位使用一份 LOD2 全身扫描及同次拍摄的 4096×4096 漫反射图，头、头发、手、躯干、下肢与衣服来自同一原件。本站作了坐标轴转换、平移、法线计算、材质压缩和步行用骨架/蒙皮。扫描原件没有骨骼，馆内动作来自应用。访客名由参观者自取。

| 馆内造型及文件 ID | 原始扫描包 | 原始 ZIP 的 SHA-256 |
| --- | --- | --- |
| 短发黑西装 · `maya` | [HSR0112-Body-062 · LOD2](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0112/HSR0112-Body-062/scans/HSR0112-Body-062-Scan-LOD2.zip) | `1066c3a08fb48a5f28d829fb5c04df9280b8923399b8715a72cc08fdb6a4711e` |
| 藏蓝短袖 · `linen` | [HSR0040-Body-086 · LOD2](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0040/HSR0040-Body-086/scans/HSR0040-Body-086-Scan-LOD2.zip) | `8b6f0992050d6647cbd797db755e8d385ab31d890f6df8678f737fad77ba0006` |
| 青瓷条纹衬衫 · `slate` | [HSR0028-Body-058 · LOD2](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0028/HSR0028-Body-058/scans/HSR0028-Body-058-Scan-LOD2.zip) | `a1015cd686685a252a13d6f9023b3d7aa66d0847c54f6b3a62b774b483870488` |
| 赭红夹克 · `brick` | [HSR0042-Body-011 · LOD2](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0042/HSR0042-Body-011/scans/HSR0042-Body-011-Scan-LOD2.zip) | `4f0322689a1a8c2b059b892bcc7f0679d91f21fc52564c6cb632c714a81e9248` |
| 紫色印花短袖 · `hoodie` | [HSR0102-Body-042 · LOD2](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0102/HSR0102-Body-042/scans/HSR0102-Body-042-Scan-LOD2.zip) | `6f16d51165f666a777e34322ade5fd3330c8f24f4a6ad727fc23fbb6cd886698` |
| 青灰条纹衫 · `sage` | [HSR0023-Body-042 · LOD2](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0023/HSR0023-Body-042/scans/HSR0023-Body-042-Scan-LOD2.zip) | `3f96ee446481ac7c300ac5057cf5da7d73f620c6397a9efd1d5ab1699b2c4547` |

短发黑西装的扫描呈回望姿势。为配合访客的行进方向，沿被摄者自己的颈部把头部姿态调回约 23°，脸部五官作整体刚性旋转，并清理了鞋跟后随鞋一同采入的地台碎片。紫色印花短袖选取同一被摄者自然微笑的第 042 号姿态。两人的袖侧、裤腿或鞋底在静态拍摄时有局部接触，分开后用相邻衣料或鞋的原摄影纹理封合内侧切口。露在外侧的五官、服装与发型均沿用各自原件。短发黑西装在程序中沿用 `creator/maya.glb` 的原有访客路径。

青瓷条纹衬衫、赭红夹克和青灰条纹衫使用各自完整的原扫描。馆内分别对原蓝纹、绿色和浅蓝色衣物的指定布料区域调整展示色，保留原件的织纹、衣缝和图案。

这些扫描记录了静态姿势。步行、转向和停止时，馆内读取已重新采样的真人动作，再根据各自的鞋底和地面位置做接触修正。[CMU 动作编号与处理记录](../motions/SOURCES.md) · [馆内十种完整造型](../SOURCES.md)
