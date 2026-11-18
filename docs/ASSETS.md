# 素材与署名

公开版本内的逐文件目录见 [assets/credits.json](../assets/credits.json)。运行展馆后也可在[署名页](../assets/credits.html)查看、搜索作者姓名和访问来源。目录列出实际文件、SHA-256、作者、来源、使用条件及改动。项目的 [Apache License 2.0](../LICENSE) 适用于原创软件。原创展签、口播讲稿及录音、导览正文、展馆平面图与首页意象按 [CC BY 4.0 内容许可](../CONTENT-LICENSE.md) 提供。转载或改编时署名 **ShiKu**，链接来源和许可，并标明改动。转载、改作或抽出使用第三方内容时，应沿用该件条款。

| 类别 | 如何使用 |
| --- | --- |
| 文物图像 | 有明确来源与许可的摄影可随公开版分发。CC BY、CC BY-SA 按各图注明的版本署名、标示改动；适用相同方式共享的图件仍按原条件提供。公有领域标签适用于所列的具体复制品，不能据此复制其他机构的摄影。ColBase 图件保留机构名、编号和利用规约。 |
| 图版仅链接的作品 | 保留整个馆藏的展签、窟号和出处。如果某一来源不适合随开放项目再分发，可从展位资料直接转到原记录。原刊已进入公有领域但所用扫描副本带非商业标注的伯希和图版，及尚未核清跨区域保护状态的名取洋之助历史摄影，均采用这一方式。 |
| 模型与场景 | 云冈第20窟摄影测量为罗迪（Di Luo）作品，作者接口列明 CC BY 4.0；大都会馆藏 35.146 扫描及对照图依该馆开放政策与归属记录。Poly Haven 建筑材质、林地和室内光照按 CC0 使用。入口是项目生成的艺术意象，按 CC BY 4.0 署名 ShiKu。 |
| 窟室尺度模型与对照图 | 麦积山第197、202、219窟的旋转剖视与封面按调查所载尺寸制作。[尺寸与示意范围](../assets/space-studies/SOURCES.md)列明壁厚、剖面及顶式的表达方式。照片对照会标出照片实际所摄的窟号、藏品或图版，并保留所讲展品自己的资料入口。[莫高窟历史摄影](../assets/wall-research-mogao/SOURCES.md) · [云冈与龙门实物对读](../assets/wall-research-east/SOURCES.md) · [麦积山现场与图录](../assets/wall-research-maiji/SOURCES.md) |
| 可行走访客 | 青禾由 Atelier Brown / ddd 的 Kana 模型改作，原作 CC BY 4.0。行川由被摄者兼作者 Yukihiro Iwayama 发布的全身数据重建；作者允许使用、重建并公开成品，要求署名和链接。两人的鞋等组件来自 Digital Reality Lab / HumanScanRepository，按 CC BY 4.0 使用。男访客原始相机照片未纳入公开包。各模型的许可说明并不授予商业代言、身份冒用、商标或额外肖像使用权。 |
| 动作与语音 | 步态采用 CMU Graphics Lab Motion Capture Database，依数据库条款注明来源及资助信息。原创普通话讲稿与合成录音按 CC BY 4.0 署名 ShiKu；模型、工具、配音身份不随音频转让。实际引擎、模型许可及重制方法见[录音来源](../assets/walk/voices/SOURCES.md)。 |
| 写本编目 | 2,808 条敦煌写本记录取自法国国家图书馆 2026 年 9 月的开放数据；保留 BnF 署名、原始永久编号、分册和馆方链接。数字图像与目录数据各依各自条件。 |
| 程序依赖 | Three.js、GLTFLoader 等上游组件遵循 [Three.js MIT 许可](../real-viewer/vendor/THREE-LICENSE.txt)。 |

可复核的作者记录包括[罗迪原模型](https://api.sketchfab.com/v3/models/745ab213fd9d468e9646a99c60f1183e)、[Kana 原模型](https://api.sketchfab.com/v3/models/f465652729944a66aed790cd88fa0b0f)、[Yukihiro Iwayama 授权原文](https://github.com/HappyOcean/Full_Body_Photogrammetry/blob/ff5ba9ac9258741ecf395c2902365540afd960a2/README.md)、[HSRD-100 作者数据说明](https://huggingface.co/datasets/digitalrealitylab/HSRD-100/blob/9cc5e9c138dd310dc88c95c80e5db0a3ecb7971a/README.md)、[大都会三维与二维图像政策](https://www.metmuseum.org/policies/image-resources)和[法国国家图书馆的开放目录](https://api.bnf.fr/fr/dumps-de-bnf-archives-et-manuscrits)。

维护者在 [public-assets.json](../release/public-assets.json) 逐文件核定静态媒体；新的或哈希变动的素材应附新的署名、许可与处理记录后再打包。讲解逐段依 recordings.json 的散列和同目录的 SOURCES.md 纳入。源文件名单是 [public-sources.json](../release/public-sources.json)。从项目根目录运行：

```sh
mkdir -p release-output
node scripts/package-public.mjs --out release-output/ShiKu
node scripts/check-public-release.mjs --dir release-output/ShiKu
```

命令仅生成本地候选，不改写当前展馆。公开候选内的 SHA256SUMS 覆盖除该校验文件自身外的所有文件。只从通过核验的候选目录初始化公开仓库或准备静态资源。素材许可有误时，可按[贡献指南](../CONTRIBUTING.md)提交具体展项、来源页面和权利说明。
