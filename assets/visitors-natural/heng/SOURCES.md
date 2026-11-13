# 行川的原型与参照

行川是展馆昵称。人物由摄影者、被摄者 Yukihiro Iwayama 在东京浅草公开的同一组全身影像重建。脸、头发、颈、手、炭灰色无袖上衣及迷彩束口长裤全部来自本人。原件没有提供年龄或中国国籍，本馆没有据此指定他的年龄或国籍。[作者原始说明与授权](https://github.com/HappyOcean/Full_Body_Photogrammetry/blob/ff5ba9ac9258741ecf395c2902365540afd960a2/README.md) · [工作室](https://www.real-avatar.com/)

作者明确允许下载、使用、重建及公开成品，要求注明 Yukihiro Iwayama 并链接其仓库。该授权是作者写在说明中的使用条件。88 张 JPEG 原件均为 3280 × 2464，本地核对了作者仓库中全部 88 个 Git 对象的哈希。reference.webp 取自第 85 号原始照片，裁切为胸像，不是模型截图。[85 号原相机照片](https://github.com/HappyOcean/Full_Body_Photogrammetry/blob/ff5ba9ac9258741ecf395c2902365540afd960a2/images/85_YukihiroIwayama.jpg)

原拍未穿鞋。本馆另行配上 Digital Reality Lab / HumanScanRepository 的 HSR0042-Body-011 深灰系带运动鞋。取该全身扫描中的左右鞋面、鞋底和鞋口，按真实脚部的长度和角度分别配准。露出的脚踝仍然来自行川的原型。鞋以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可改作；原模特和服装并未用于本人物。[鞋的原始扫描档案](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0042/HSR0042-Body-011/scans/HSR0042-Body-011-Scan-LOD1.zip) · [采集者与许可记录](../../visitors-whole/detail/SOURCES.md)

两档人物保留这次采集的肤色、头发、原生色图、法线和粗糙度。近景网格依据摄影重建产生的 EXR 位移图细分头颈。两档共用同一组 24 个行走关节；脚踝和脚趾各自控制两只鞋，避免转向时鞋跟漂动。参观时的行走来自展馆的 [CMU 动作记录](../../visitors-whole/motions/SOURCES.md)。拍摄时的眼神和表情保留下来，未增加虚构口型或逐根可动头发。

| 文件 | 人体三角面 | 双鞋三角面 | 人物色图 / 法线 |
| --- | ---: | ---: | --- |
| gallery.glb | 95,533 | 14,628 | 4096 / 2048 |
| portrait.glb | 128,467 | 14,628 | 4096 / 4096 |

[离线构建方法](../../../scripts/visitor-natural/yukihiro/README.md)
