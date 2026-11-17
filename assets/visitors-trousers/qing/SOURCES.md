# 青禾的展馆造型

## 米白条纹短衫与深靛直筒裤

青禾沿用 Atelier Brown / ddd 的 Kana 摄影扫描。ShiKu 在原有表面上重梳偏分刘海、压低右侧发量，将深栗发尾收在肩线上，保留原件中头发与衣领交接的曲面。面部沿原有五官做了轻微的下颌与唇形调整，依据原片的明暗细化眉眼、润色嘴唇，没有引入其他人的肖像。[Kana 原作](https://sketchfab.com/3d-models/free-018-kana-walk-f465652729944a66aed790cd88fa0b0f) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

短衫沿用摄影布料的褶线，重新收短衣摆。米白底上的深色横纹按三维衣片的位置制版，前襟留白。六枚黄铜色纽扣依照胸前和腰间的衣面定位，细长的弧形发夹贴合太阳穴外侧的发束。纽扣和发夹采用新绘制的网格，蒙皮权重取自相邻的衣面和头部。长裤改成深靛色，下半段略向外放宽，鞋履沿用 Digital Reality Lab / HumanScanRepository 的 HSR0028-Body-058 摄影扫描。[鞋履来源与改作记录](../../visitors-fitted/qing/SOURCES.md) · [HSRD 授权](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/README.md#license)

以上改作署名 ShiKu，随原作采用 CC BY 4.0。在入馆、人物近看和兼容模式下使用的三种模型均使用这套造型。

## 上一版的服装制作

青禾的原型 Kana 在拍摄时穿了一条浅色九分布裤。此次使用摄影原件上属于这条裤子的前后两块连续布面，沿用她本人的髋、膝、踝和穿衣时的身体轮廓。向外侧及裤管前后留出余量，把裤边延至鞋口，染成燕麦灰，在布面补上轻压褶、斜插袋口和窄后嵌线。纹理中的细微明暗来自原始摄影，织纹、袋线、裤内腰头、裤口反折和炭灰短袜由展馆制作。「斜纹」是本次造型的面料设计。原作由 Atelier Brown / ddd（Sketchfab 作者名 endonoriko）发布。[原作者作品](https://sketchfab.com/3d-models/free-018-kana-walk-f465652729944a66aed790cd88fa0b0f) · [采集文件、校验值与使用记录](../../visitors-natural/qing/SOURCES.md) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

上半身来自[馆内灰绿衬衣版本](../../visitors-fitted/qing/SOURCES.md)。运动鞋来自 Digital Reality Lab / HumanScanRepository 的 HSR0028-Body-058，已在前版校正鞋楦并重建鞋底。此次去掉鞋口附近与主网格完全脱离的摄影残片。组成鞋帮和鞋底的三角面、贴图、法线和脚踝权重仍沿用原版。短袜由鞋内延伸到裤腿里，脚踝弯曲时随足部和小腿共同转动。极近距离可见鞋帮的原始扫描边缘。[鞋履摄影与改作记录](../../visitors-fitted/qing/SOURCES.md) · [HSRD-100 许可](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/README.md#license)

在项目根目录运行以下命令，可以从已随馆提供的真人原件与换装档重建低模和近景。使用 Python 3.12、NumPy 和 Pillow。

```sh
PYTHONDONTWRITEBYTECODE=1 python scripts/visitor-trousers/qing.py
```

展厅的 `walking.bin` 从同一套 `gallery.glb` 提取原作实际使用的纹理区域。头、发和双手的六个纹理区块按原像素密度排入 512 × 664 图集。两只 HSR0028 运动鞋的 625 个纹理区块从 4096 × 4096 原图取样，按原像素密度的 70% 排入 1024 × 1240 图集。各纹理区块预留边缘颜色，避免远看时混入相邻区块。皮肤和灰绿衬衣由展厅灯光照明。贴图用 WebP 编码，GLB 用 gzip 压缩。
