# 参观人物的表面与预览环境

六位 HSRD 访客的眼区和衣料数据均从各自完整的摄影测量原件取得。制作时从多个方向渲染同一份未摆动的扫描，通过投影深度与表面朝向选出可见的采样点。皮肤、头发、衣料的权重记录在网格属性中，运行时据此分别计算反光。低分辨与高分辨版本使用同一套空间校准。衣料色调设计保留原照片的印花、接缝及褶皱明暗。发端和衣摆的位移由行走、减速及肩膀转动驱动。[六位人物的逐件出处](../collection/SOURCES.md) · [许可与近景原件](../detail/SOURCES.md)

眼区 WebP 来自每位人物同次拍摄的色图。制作时用多角度面部特征定位原图中的眼角和虹膜，沿扫描记录的上下睑轮廓，在眼裂内计算小幅注视。六位静态扫描保留了拍摄时的眼睑外形，四位具有独立眼球和眼睑蒙皮的作者角色另用原骨骼眨眼。分区与特征定位在制作机上运行。网站展示时只读取随站保存的模型、纹理和动画。[MediaPipe Image Segmenter](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter) · [MediaPipe Face Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker)

exhibition.webp 由本馆石柱造像厅人眼高度的六向实机渲染拼接而成。人物预览使用这份环景、可以受影的三维地面和局部布光。室内环境反射沿用项目已有的 HDR 光照素材。[展厅材质和光照来源](../../museum/materials/SOURCES.md)
