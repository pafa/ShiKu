# 行川的灰蓝圆领衫和直筒牛仔裤

行川的脸、头发、颈部和手来自 Yukihiro Iwayama 本人的 88 张照片。实际穿搭由展馆配制。衣物参照取自 Digital Reality Lab / HumanScanRepository 对同一套衣物的完整扫描 **HSR0040-Body-037**。游客可在人物窗口另行比对行川的本人参照。[Yukihiro Iwayama 原照片及作者授权](https://github.com/HappyOcean/Full_Body_Photogrammetry/tree/ff5ba9ac9258741ecf395c2902365540afd960a2) · [本馆的人物重建](../../visitors-natural/heng/SOURCES.md)

灰蓝圆领长袖衫与水洗蓝直筒牛仔裤均保留原扫描的衣形、两侧不同的肩袖、领口、罗纹收边、布面细纹、口袋、裤线和褶皱。展馆在上衣的摄影纹理中降低大面积杂色的对比度，保留较细的纱线、衣褶和深色罗纹。展馆按行川的肩、手腕、膝和踝重新配准，衣料分别跟随自己的关节。两只深灰运动鞋来自另一套 HSR0042-Body-011 实物扫描。手部沿用本人原照和已配准的放松手势。上述 HSRD-100 服装及鞋款由采集者以 CC BY 4.0 发布。[数据集许可](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/README.md#license) · [鞋款原始扫描及出处](../../visitors-natural/heng/SOURCES.md)

| 使用范围 | 采集者原件 | 原始 ZIP 的 SHA-256 |
| --- | --- | --- |
| 展厅 | [HSR0040-Body-037 LOD2](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0040/HSR0040-Body-037/scans/HSR0040-Body-037-Scan-LOD2.zip) | `f30b1573c6d381543d68d29de3f01ca65ec88d6109969640c9691f6d95a84e66` |
| 近看 | [HSR0040-Body-037 LOD1](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0040/HSR0040-Body-037/scans/HSR0040-Body-037-Scan-LOD1.zip) | `7bc87b6938691a0bf537b867429b8279cc5c2090a2cb3632ef587d203b26aa8c` |

复现环境为 Python 3.12、NumPy 1.26.4、SciPy 1.15.3、Pillow 11.3.0 和 OpenCV 4.11.0.86。制作时使用两份原始压缩包并运行 `PYTHONDONTWRITEBYTECODE=1 OPENBLAS_NUM_THREADS=1 python scripts/visitor-everyday/heng/everyday.py /path/to/LOD2.zip /path/to/LOD1.zip`。这份制作脚本及关节测量点保存在原始工作台。
