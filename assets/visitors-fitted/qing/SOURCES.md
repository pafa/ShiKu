# 青禾的衬衣、牛仔裤与步行鞋

青禾的头发、脸、双手、身形、卷袖棉衬衣和 66 个关节沿用 Atelier Brown / ddd 的完整摄影人物 Kana。灰绿色衣身后片沿肩胛之间的实际曲面重新舒展，减弱原始横向隆起及相应摄影阴影，保留下摆、侧腋和袖肘的自然褶皱。两档的脸、头发和手使用的色图与上版逐字节相等。[Kana 原作](https://sketchfab.com/3d-models/free-018-kana-walk-f465652729944a66aed790cd88fa0b0f) · [衬衣的改作记录](../../visitors-everyday/qing/SOURCES.md)

牛仔裤和黑白低帮系带鞋来自同一位被摄者、同一次拍摄。Digital Reality Lab / HumanScanRepository 发布的 HSR0028-Body-058 记录了原穿的靛蓝牛仔布、前后袋、门襟、裤脚走线和一双鞋舌标有 New Balance 的运动鞋。馆内从全身扫描分出了这套服装，使用原作实拍色图，在青禾本人的腰、髋、膝和踝处重新配准。原拍中手遮住的左侧袋片采用同一条裤子的右侧对应布面修补。近看左右袋片局部相似。[LOD2 馆内档源文件](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0028/HSR0028-Body-058/scans/HSR0028-Body-058-Scan-LOD2.zip) · [LOD1 近景档源文件](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/data/HSR0028/HSR0028-Body-058/scans/HSR0028-Body-058-Scan-LOD1.zip) · [原件许可与署名要求 CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

每只鞋只绑定本侧脚踝，鞋头、鞋带、后跟和底边共同旋转。两只鞋均按相同比例 1.01817 放大，原拍中抬起的左鞋另作整体旋转。脚底贴近摄影地台的区域已剔除，依据真实侧壁的截面重新收边并封底。馆内近看能读到鞋面的皮革和原缝线；鞋底平面为补做的橡胶面，保留简化的颜色与轮廓。

| 文件 | 三角面 | 单侧鞋三角面（左 / 右） | 字节 |
| --- | ---: | ---: | ---: |
| gallery.glb | 30,395 | 942 / 903 | 7,429,444 |
| portrait.glb | 103,401 | 3,579 / 3,470 | 11,240,724 |

两档都检查了正面、侧面、背面站姿和迈步抬脚画面。验证中，两只鞋的所有顶点关联本侧 Foot 权重 1，双手和裸露前臂没有对侧手臂的权重。登录卡片取自本轮展馆模型。构建使用 Python 3.12、NumPy 和 Pillow。在项目根目录执行以下命令可从随展馆保存的原件重新生成。

```sh
PYTHONDONTWRITEBYTECODE=1 python scripts/visitor-fitting/qing/build.py
```
