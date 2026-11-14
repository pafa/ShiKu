# 馆内访客的全身运动记录

展馆采用 Carnegie Mellon University Graphics Lab Motion Capture Database 的真人全身记录。原始录制为每秒 120 帧，数据库由 NSF EIA-0196217 资助，对外提供可自由使用的动作数据。[数据库与使用说明](https://mocap.cs.cmu.edu/) · [ASF/AMC 与 C3D 数据说明](https://mocap.cs.cmu.edu/info.php)

| 馆内动作 | 记录与原始帧区间（从零计数） |
| --- | --- |
| 直行、放慢观察 | 同一位表演者的 07_01（54–185）和 07_04（46–225）。用两次左脚跟着地夹住完整周期，以中间的右脚跟着地对齐步相。两段都使用实际 C3D 足跟与趾端标记。[第 7 号表演者](https://mocap.cs.cmu.edu/search.php?subjectnumber=7) |
| 较安静的日常行走 | 16_15（132–270）。同一位表演者还录制了下述四条行进转弯路线和停步。[第 16 号表演者](https://mocap.cs.cmu.edu/search.php?subjectnumber=16) |
| 行进中弯向左边、右边 | 16_11（112–248）和 16_13（61–198）。每个完整步周期改变朝向约 31° 和 35°。[第 16 号表演者](https://mocap.cs.cmu.edu/search.php?subjectnumber=16) |
| 行进中通过直角拐角 | 16_17（202–329）和 16_19（148–298）。每段包含双脚交替承重及随转弯的肩胯变化，实测分别约 87° 和 94°。[第 16 号表演者](https://mocap.cs.cmu.edu/search.php?subjectnumber=16) |
| 从站姿迈出第一步 | 69_01（90–267）。由重心预移开始，接到第二次足跟着地。按原记录的水平距离曲线对齐馆内移动。[第 69 号表演者](https://mocap.cs.cmu.edu/search.php?subjectnumber=69) |
| 原地向左右踏转 | 69_16（197–433）及 69_18（292–449）。原地转身时按人物实际转过的角度采样。[第 69 号表演者](https://mocap.cs.cmu.edu/search.php?subjectnumber=69) |
| 减速、驻足 | 16_33（0–284）。从减速所在的步相进入实录后段，逐渐到达该人物的中立站姿。[第 16 号表演者](https://mocap.cs.cmu.edu/search.php?subjectnumber=16) |

馆内按实际移动速度和路径曲率连续混合录制片段。不同人物采用各自的腿长、步幅偏好、直行片段配比和起步侧。起步和收步另提供原始记录的左右镜像，以衔接当前承重脚。角色选择与演绎参数属于本馆设计。动作由上述真人表演者录制。

二进制表共有 1632 个姿态。每个姿态保存 29 组关节四元数、骨盆三维位移、双脚着地状态与鞋底离地高度。骨架重定向保持各角色的骨长。靠近阶沿时，依据这双鞋的实际表面与当前石阶高度校正落脚。

驻足时胸廓有数毫米的呼吸。头部会转向前方近处的同伴或展品，也能抬头看高处的作品。有原始眼骨的人物可转眼和眨眼，其他扫描角色的材质表演随单独的眼区数据启用。伸直的指骨在放松时略微弯曲。这些随展馆情境发生的动作由程序控制。

平地迈步时，脚跟到脚尖的转动以及肩、胯绕竖直轴的摆动依据第 7 号表演者的两段 120 Hz 光学记录。每个步周期根据左、右脚跟的实际着地帧对齐。LFWT、LBWT、RFWT、RBWT 四个腰带标记给出胯线，左右肩标记给出肩线。两只鞋的足跟和趾端给出相对各自平放时的俯仰角。网站将实测的前掌滚动适配为当前鞋体的转动，手臂保留真人动作中肩、肘和手腕之间的时差。两腕各自的 WRA、WRB 与 FIN 光学标记组成手背平面，按各自步周期提取小幅转动。人物原扫描的腕至中指方向和食指至小指方向定义不同访客的手背与拇指，袖子按同一解剖方向运动。[正常步行原始 C3D](https://mocap.cs.cmu.edu/subjects/07/07_01.c3d) · [慢步原始 C3D](https://mocap.cs.cmu.edu/subjects/07/07_04.c3d)。

## 离线重建

将下面的原文件置于同一目录，使用 Python、NumPy 和 SciPy 运行 `python3 scripts/build-visitor-motion.py 原始文件目录 --output 输出目录`。另运行 `python3 scripts/build-optical-walk.py 原始文件目录 assets/visitors-whole/motions/optical-walk.js`，由同两份 C3D 重建脚掌、肩胯和左右腕的每步 48 个采样值。可用下面的 SHA-256 核对每份记录。网站运行时读取已生成的姿态表和二进制文件。

```text
c29414591d76a34885bff0b04a2666bf9659f869751a2549591c55277cf95b04  07.asf
3ca8e8b834481c97c32e9dd555f8c9023e33b6c52d93c9d556c83570204bf3f2  07_01.amc
995a448a7cc362a192186a12a60ee2adc0743e9b4dca0448b720eacff5aa9060  07_01.c3d
c37994b8eefa0cf30d1822db05e698f7ce6098400b462cc0fadd185cafa3301e  07_04.amc
59acb971168b1b8d51a948c9821930bb68e494c61c23569cea927e78da012ea7  07_04.c3d
2323f876564610f84bfbec9b90b8ebffb57515673b7f4a45b0fb0849af465bdb  16.asf
b14b55c999b19e573e9f7279bc8c75eeeb1761b30c4a6491b3c753ed50e5ba91  16_11.amc
d061032f11516a1abecd351a9a19fd4c30e99b20afbb2a05183b556187d92422  16_13.amc
0873a7753a04c34de2a94dc768b61ef4ed8395f0bd351c2019864b16883b0f89  16_15.amc
a59f9c90eb2af8197c6390edddbcf761bbec1cf03b6907128212102fe2123a2c  16_17.amc
691d578a676bf9e091dac59001a6cb78daa7141ad5639f943c684dee7f4e64e6  16_19.amc
03644f38e30d839a005334a6358f97093da05a65da53a73a51bd8136c5cd63ea  16_33.amc
c3019031ae5789b1d43d3bba424229ac544ccc68bb8c06e7d67bf75b1c41605f  69.asf
db7976c321c0a637049ca28e2f663caead4ab23e11930837d986150b4c2b6d75  69_01.amc
2d9848b05cb7b69e7abe65f5405ec25f4971cfd764707560a3cb8bddad2afe91  69_16.amc
ab26d17f420194b74a0434ad1a9ac400f364f839298bb3a10f37e15b98e81429  69_18.amc
```

上臂及前臂前后与侧向摆动分别采用上述两次 C3D 的肩、肘、腕标记。脚跟触地定义周期起点，先用腰部位移确定行进方向，再换算为各侧肩肘的局部摆角。为馆内散步保留原迹的时差并收小前后摆幅，侧向距离适应各自衣着和髋宽。运行 `python3 scripts/build-arm-walk.py 原始文件目录 assets/visitors-whole/motions/arm-walk.js` 可重建。另有[同一位访客原作步行的对照](../../visitors-fitted/motion-study/SOURCES.md)，仅供查看平地直行。
