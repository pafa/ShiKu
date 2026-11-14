# ShiKu｜首次建仓记录

这是首次开源时使用的清单。仓库已经建立；维护现有项目请按[贡献与分支流程](../CONTRIBUTING.md)、[本地环境](../docs/ENVIRONMENTS.md)和[生产发布手册](../deploy/cloudflare/README.md)操作。

目标仓库名 **ShiKu**，默认分支 **main**，目标域名 **shiku.xiaoha.org**。开源和站点启用各自独立。仅复制经过筛选的候选目录；开发工作区的历史模型、审阅图、补丁、环境信息以及 .git 对象库不能随项目上传。

| 顺序 | 动作 | 放行依据 |
| --- | --- | --- |
| 1 | 清点本地工作树、仓库目标和域名 | 当前任务分支、远端与未提交状态；创建前复查 GitHub 重名与 DNS。 |
| 2 | 确立许可与维护流程 | 原创代码 Apache-2.0、原创内容 CC BY 4.0（署名 ShiKu）；保留第三方许可与权利边界、README、NOTICE、贡献与安全报告指引、PR 模板和只读 CI。 |
| 3 | 从开发区导出公开候选，冻结清单 | 在空目录运行 `node scripts/package-public.mjs --out <新目录>`。以该目录的内容摘要和档案 SHA-256 审阅；本地图片缺权利依据时保留权威出处。 |
| 4 | 离线与本地 HTTPS 演练 | 从候选运行文档中的检查，验证入馆、地图、50 人限额、排队、音轨分段、来源验证、权利及文件范围。 |
| 5 | 建立 GitHub 仓库并走首个 PR | 在账号负责人批准具体仓库/可见性及候选后，使用下列初始仓库流程。GitHub 归档和首个发布 tag 均指向已审阅版本。 |
| 6 | 准备生产环境、域名切换和回滚 | 按部署手册在独立预演环境验证。核验 Cloudflare 账号、单一 SQLite DO、限额、证书、DNS 旧值与恢复方法；先准备候选，最后获准才绑定实际域名。 |
| 7 | 上线后在真实域名复验 | 两台设备入馆、持续推流和走动、普通话讲解、外部图源、错误率；核对 GitHub tag / 线上版本。优先在隔离环境测 51 人并发，不在营业房间占用访客名额。 |

## Git 的第一次交付

1. 在单独的候选目录操作，绝不把开发工作区的 .git 推送。再次确认目标 owner、仓库名称与可见性。新建仓库时仅用空的初始提交或初始化说明建立 main，随后创建任务分支。建仓是否先设为私有、何时改变可见性，由维护者针对候选分别决定。
2. 在新克隆的任务分支中，仅引入候选内经审核文件（含必要点文件）。推前对比完整文件清单/摘要、检查大文件与来源，逐项审阅 git diff。勿使用会上传旧 refs 的镜像推送。提交带清楚范围的变更，PR 描述使用仓库模板，记录候选摘要、实际验证和未完成验证。
3. 在 PR 上运行 **Public checks**。设置默认分支为 `main`，启用 squash 和合并后删除任务分支。通过 Settings → Rules → Rulesets 导入[主线规则](github-main-rules.json)，核验禁止删除和强推、必须走 PR、通过最新主线检查并解决审阅讨论等设置。维护者可自行核对并合入自己的 PR。
4. 首个 PR 交由用户审阅具体 head；获准后才 squash 合入。核对合并所得 main 与已批准候选的文件树，再创建受审阅的版本 tag/Release。仓库简介与 topics 见 [github-about.json](github-about.json)。站点实测可用后再填写 homepage，避免指向空域名。
5. 后续改动从主题分支发起 PR，经 CI 和维护者核对后合入。GitHub Actions 无生产权限，push、合并或打 tag 均不会自动部署。发现问题优先回滚已知版本，修复走新 PR。

[GitHub 官方规则说明](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets) · [Cloudflare 发布与回滚](../deploy/cloudflare/README.md) · [Cloudflare DNS 变更](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)
