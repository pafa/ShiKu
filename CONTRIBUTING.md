# 参与 ShiKu

欢迎修正展签、完善普通话讲解，或改善步行、看展与多人参观体验。小修正可以直接提 PR。较大改动可以先开 issue，描述希望改变的参观体验。报告问题时，请附展品的站内路径和复现步骤。可先浏览[参观帮助与反馈渠道](SUPPORT.md)。

讨论与评审适用[社区行为约定](CODE_OF_CONDUCT.md)。研究引用软件时可附项目元数据与提交号。对访客可见的改动请在变更记录的 Unreleased 部分概述。[引用项目](CITATION.cff) · [变更记录](CHANGELOG.md)

## 开发与检查

先在 GitHub fork 本项目，克隆你的 fork，再从最新的 `main` 建立主题分支，例如 `fix/cave-audio`。如果改动依赖仍在审阅的 PR，请在说明中注明依赖，并在依赖合入后同步主线。一次提交审阅聚焦一个问题。 [各功能的代码入口](docs/ARCHITECTURE.md)

在项目目录启动展馆。

```sh
node server/museum.mjs --port 4173
```

在浏览器打开 [本地展馆](http://127.0.0.1:4173/)。CI 使用 Node.js 24.20.0。以下检查无需 npm 依赖，候位测试会在本机的临时端口启动独立服务。

```sh
node scripts/check-walking.mjs
node scripts/check-stroll.mjs
node scripts/check-admission.mjs
node scripts/check-presence-recovery.mjs
```

改动界面、音频或展品时，也请沿公开包中实际可走的入口参观一次。将复现路径、浏览器、实际结果与仍未验证的部分写在 PR。内容勘误请指向对应藏品、实物图或研究出版物。提交第三方素材时，一并记录作者、来源页、素材许可证、原始署名和修改情况；不能确认可分发的原件，可提供机构页面的链接。[素材说明](docs/ASSETS.md)

## 审阅与合入

提交前检查整个 diff 和新文件。PR 内给出问题、改动、验证结果，按需附截图或语音样段。维护者审阅当前提交，解决未结讨论，等名为 **Public checks** 的 CI 检查通过后，再由获授权的维护者批准该版本合入。若审阅后又修改了实质内容，请重新请人审阅。合并源码与发布服务分别进行。

`main` 要求通过 PR、至少一名独立评审者批准并解决未结讨论。**Public checks** 检查行走和候位、干净的公开导出、持久化房间重启和 Worker 构建。新增提交后需要重新审阅。已批准的 PR 使用 squash 合入。[分支规则](https://github.com/pafa/ShiKu/rules/27212530) · [CI 工作流](.github/workflows/ci.yml)

提交原创代码默认按项目的 [Apache-2.0](LICENSE) 提供。原创展签、讲稿、导览音轨和导览图按 [CC BY 4.0，署名 ShiKu](CONTENT-LICENSE.md) 提供，第三方材料仍适用它们各自的许可。安全问题的私下报告渠道见 [SECURITY.md](SECURITY.md)。

修改公开包或 Cloudflare 房间时，生成一个全新的候选目录，再用真实的本地 workerd 重启验证席位、票据、位置和队列。需要联网下载开发依赖；验证过程在本机临时端口运行。以下命令请在仓库根目录的同一终端执行：

```sh
SHIKU_QA_DIR="$(mktemp -d)"
node scripts/package-public.mjs --out "$SHIKU_QA_DIR/public"
node scripts/check-public-release.mjs --dir "$SHIKU_QA_DIR/public"
npm ci --prefix deploy/cloudflare/tools --ignore-scripts --no-audit --no-fund
MINIFLARE_MODULE="$PWD/deploy/cloudflare/tools/node_modules/miniflare" \
ESBUILD_MODULE="$PWD/deploy/cloudflare/tools/node_modules/esbuild" \
node "$SHIKU_QA_DIR/public/scripts/verify-worker-room.mjs"
```
