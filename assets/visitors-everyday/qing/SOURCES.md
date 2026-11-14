# 青禾的日常参观服

青禾穿灰绿色棉衬衣、石墨色直筒裤和炭灰低帮鞋。原人物由 Atelier Brown / ddd 通过多机位摄影制作。馆内保留了原片的脸、头发、双手、翻领和卷起的袖口，降低原衬衣布料的色彩饱和度。摄影脸部和双手使用的色图与原件逐字节一致。[Kana 原作与 CC BY 4.0 授权](https://sketchfab.com/3d-models/free-018-kana-walk-f465652729944a66aed790cd88fa0b0f) · [原始采集与馆内骨架说明](../../visitors-natural/qing/SOURCES.md)

原拍摄中的宽腰带遮住了部分衬衣。在原腰带的位置，按青禾上下两圈衣片的实际外形续接棉布、门襟和两枚纽扣。原衣片的颜色和表面方向逐点延伸至新布片两端。袖口、手肘和肩膀的折痕来自原件；腰间的衣褶由本馆重新裁制。裤脚顺着原片的下垂方向放长，重新调整腿口宽度和洗水后的石墨色。布料随人物骨骼动作。

低帮鞋沿用 Digital Reality Lab / HumanScanRepository 公开的 HSR0042-Body-011 运动鞋实物扫描（CC BY 4.0）。鞋口、深灰袜与两侧脚踝的配准沿用上一版的尺寸，鞋头与鞋身分别跟随趾骨与踝骨。[鞋履采集来源与配准](../../visitors-tailored/qing/SOURCES.md) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

| 模型 | 三角面 | 共用关节 | 文件字节 |
| --- | ---: | ---: | ---: |
| 馆内版 gallery.glb | 45,373 | 66 | 3,318,608 |
| 近景版 portrait.glb | 104,111 | 66 | 5,289,768 |

在浏览器中以正面、左右侧面、背面查看了两档人物的半身与全身；另检查了迈步中裤脚、袖手接合和低帮鞋的位置。特写时可以看到新做腰片的褶皱比袖口柔和。

构建使用 Python 3.12、NumPy 和 Pillow。在项目根目录运行 `PYTHONDONTWRITEBYTECODE=1 python scripts/visitor-everyday/qing/build.py`，可从馆内保存的摄影人物与运动鞋重建两档文件。
