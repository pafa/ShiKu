# 青禾的燕麦灰直筒裤

青禾的原型 Kana 在拍摄时穿了一条浅色九分布裤。此次使用摄影原件上属于这条裤子的前后两块连续布面，沿用她本人的髋、膝、踝和穿衣时的身体轮廓。向外侧及裤管前后留出余量，把裤边延至鞋口，染成燕麦灰，在布面补上轻压褶、斜插袋口和窄后嵌线。纹理中的细微明暗来自原始摄影，织纹、袋线、裤内腰头、裤口反折和炭灰短袜由展馆制作。「斜纹」是本次造型的面料设计。原作由 Atelier Brown / ddd（Sketchfab 作者名 endonoriko）发布。[原作者作品](https://sketchfab.com/3d-models/free-018-kana-walk-f465652729944a66aed790cd88fa0b0f) · [采集文件、校验值与使用记录](../../visitors-natural/qing/SOURCES.md) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

上半身来自[馆内灰绿衬衣版本](../../visitors-fitted/qing/SOURCES.md)。运动鞋来自 Digital Reality Lab / HumanScanRepository 的 HSR0028-Body-058，已在前版校正鞋楦并重建鞋底。此次去掉鞋口附近与主网格完全脱离的摄影残片。组成鞋帮和鞋底的三角面、贴图、法线和脚踝权重仍沿用原版。短袜由鞋内延伸到裤腿里，脚踝弯曲时随足部和小腿共同转动。极近距离可见鞋帮的原始扫描边缘。[鞋履摄影与改作记录](../../visitors-fitted/qing/SOURCES.md) · [HSRD-100 许可](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/README.md#license)

在项目根目录运行以下命令，可以从已随馆提供的真人原件与换装档重建低模和近景。使用 Python 3.12、NumPy 和 Pillow。

```sh
PYTHONDONTWRITEBYTECODE=1 python scripts/visitor-trousers/qing.py
```
