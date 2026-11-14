# 行川的整身与服装

行川沿用 Yukihiro Iwayama 本人公开的 88 张全身照片重建。其脸、头发、颈、两只手、臀部、腿部轮廓都与原始同一套关节相配，重建与原始采集可分别查阅。[作者的照片和使用条件](https://github.com/HappyOcean/Full_Body_Photogrammetry/tree/ff5ba9ac9258741ecf395c2902365540afd960a2) · [上一版完整采集出处](../../visitors-natural/heng/SOURCES.md)

石青色短袖和深灰斜纹长裤是展馆配制的衣服。原拍穿背心和束脚裤。展馆以同一个人体原有的肩、臂、胸、腰、臀和膝部表面为基准，给短袖增加袖筒余量，把裤腿放宽并延长到鞋口。极近处可见织纹为程序设计，几何保留了本人姿态和部分原衣料的褶线。原始领口、袖口、裤头与口袋的位置通过米制表面重新制作，后袋各有一圈压线。腰臀处的原衣摆重叠区域按邻近截面重新整形。

每个袖口和下方的手臂在同一连续网格上，并使用对应一侧的骨骼。上臂自肩峰向肘部逐渐减小胸部权重。裤腰随骨盆，自后袋下方过渡至各自的大腿。手指从拍摄时的张开手势略微向掌心弯曲。原始手部测量点在制作工作台留档。

深灰系带运动鞋来自 Digital Reality Lab / HumanScanRepository 的 HSR0042-Body-011，以 CC BY 4.0 授权。鞋跟与鞋头整只跟随对应脚踝旋转，脚掌着地时仍保留投影和压纹。[鞋的登记记录](../../visitors-natural/heng/SOURCES.md) · [采集者的许可](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/README.md#license)

本次拟合在原始工作台运行 `PYTHONDONTWRITEBYTECODE=1 OPENBLAS_NUM_THREADS=1 python scripts/visitor-fitting/heng/fit.py`。该离线步骤从库内原有的 gallery 与 portrait 两档扫描读取原生坐标、相机颜色、法线、骨骼与权重。复现使用 C 编译器、Python 3.12、NumPy 1.26.4、SciPy 1.15.3、Pillow 11.3.0。此历史制作脚本未随公开版分发。
