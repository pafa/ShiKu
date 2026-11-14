# 参与 ShiKu

欢迎修正展签、完善普通话讲解，或改善步行、看展与多人参观体验。小修正可以直接提 PR。较大改动可以先开 issue，描述希望改变的参观体验。报告问题时，请附展品的站内路径和复现步骤。可先浏览[参观帮助与反馈渠道](SUPPORT.md)。

讨论与评审适用[社区行为约定](CODE_OF_CONDUCT.md)。研究引用软件时可附项目元数据与提交号。对访客可见的改动请在变更记录的 Unreleased 部分概述。[引用项目](CITATION.cff) · [变更记录](CHANGELOG.md)

## 开发与检查

`main` 是唯一长期分支，对应仓库首页和普通克隆。外部贡献者从自己的 fork 开发；维护者用连接 `pafa/ShiKu` 的公开工作副本。请勿把含历史素材、验收截图或凭据的内部工作台整体推送。每个功能、修复或文档改动使用一个短期分支，例如 `codex/fix-cave-audio`，同一问题的反馈继续推到同一 PR。[代码入口](docs/ARCHITECTURE.md)

```sh
# origin 指向官方仓库；使用 fork 时，从指向官方仓库的 upstream 同步 main。
git fetch --prune origin
git switch main
git pull --ff-only origin main
git switch -c codex/fix-cave-audio
node scripts/start-local.mjs feature
```

打开[功能预览](http://127.0.0.1:4174/)。开发、独立验收、已上线基准各有自己的进程和地址，见[本地环境](docs/ENVIRONMENTS.md)。CI 使用 Node.js 24.20.0。以下检查无需 npm 依赖，候位测试会在本机的临时端口启动独立服务。

```sh
node scripts/check-walking.mjs
node scripts/check-stroll.mjs
node scripts/check-admission.mjs
node scripts/check-presence-recovery.mjs
```

改动界面、音频或展品时，也请沿公开包中实际可走的入口参观一次。将复现路径、浏览器、实际结果与仍未验证的部分写在 PR。内容勘误请指向对应藏品、实物图或研究出版物。提交第三方素材时，一并记录作者、来源页、素材许可证、原始署名和修改情况；不能确认可分发的原件，可提供机构页面的链接。[素材说明](docs/ASSETS.md)

## 审阅与合入

提交前检查完整 diff 和新文件。在 PR 中写明改动和验证结果，涉及画面或声音时可附截图或样段。项目由一人维护，维护者可以审阅并合入自己提交的 PR。外部贡献也通过同一套检查，由维护者决定是否合入。

合入 `main` 前，主题分支须与最新主线同步，**Public checks** 须通过，审阅讨论须解决。检查涵盖行走、候位、公开包导出、房间持久化和 Worker 构建。提交有更新时，维护者重新核对差异和 CI 结果，再使用 squash 合并。[分支规则](https://github.com/pafa/ShiKu/rules/27212530) · [CI 工作流](.github/workflows/ci.yml)

挑选本次需要的路径暂存，通读 `git diff --cached`，包括新文件。新源码须登记在 `release/public-sources.json`；图片、模型和录音按[素材说明](docs/ASSETS.md)处理。重新导出后把改变的生成文件逐项核对、同步回工作树，最后同步 `SHA256SUMS` 并暂存；用 `node scripts/check-public-tree.mjs --dir "$SHIKU_QA_DIR/public"` 核对**暂存区**与导出的路径和内容。未跟踪的个人笔记可留在本地，不能夹进提交。下文定义 `SHIKU_QA_DIR` 和导出命令。

维护者推送主题分支后执行 `gh pr create --repo pafa/ShiKu --base main --head codex/fix-cave-audio --web`；来自 fork 的分支使用 `--head 用户名:分支名`。必须依赖尚未合并的变更时，可先向依赖分支开草稿，注明先后顺序；上游合入后确认 base 已改为 `main`，同步最新主线、复核差异、重跑 CI，才转为待审。不能将草稿直接合回已冻结的候选分支。

合并后，确认 PR 显示 **Merged**、合并提交已进入 `main`，再同步本地 `main`（`git pull --ff-only`）和远端引用（`git fetch --prune`）。仓库启用合并后自动删除同仓库任务分支；来自 fork 的分支由贡献者管理。本机只移除无改动且未在使用的工作树。squash 会生成新的提交号；如果 `git branch -d` 拒绝删除，请核对原 PR 的最终 head、实际合并提交和本地有无后续改动，不能批量强删。被整合但未直接合并的旧 PR，应先核对内容并确认没有其他 PR 依赖，再逐个关闭、清理。

运行时或展品有实质变化才需要切换试用站。常规发布从已审阅的 `main` 提交导出，同一份记录串起 **PR → 合并提交及文件树 → 公开包摘要 → Cloudflare Version ID → 实际 Deployment ID**。文档和本地开发工具可以单独合入，无须为此重新切换生产。线上切流需明确批准具体 Version ID，并在切换后核对域名、实际版本和关键参观流程；详见[部署与回滚](deploy/cloudflare/README.md)。

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
