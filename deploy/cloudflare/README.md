# 在 Cloudflare 上运行石窟

公开站点使用 Cloudflare Workers、Workers Static Assets 和一个 SQLite-backed Durable Object。目标域名为 `shiku.xiaoha.org`。Worker 固定名为 `shiku`，`ASSETS` 提供静态文件，`SHIKU_ROOM` 绑定导出的 `MuseumRoom`，固定房间名为 `museum-public-v1`，`VERSION` 提供版本标识。沿用同一账号、Worker、命名空间和房间名，访客才能进入同一间容纳 50 人的房间。多人状态由房间自身的持久化逻辑保存。本方案不依赖 VPS、R2、D1 或外部数据库。[配置](wrangler.json) · [SQLite Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/)

PR 会在只读 CI 中对锁定的部署工具执行 `npm audit --package-lock-only --include=dev --audit-level=high`。遇到 high 或 critical 公告时，核对涉及的依赖和修复版本，在临时目录更新锁文件，重跑 SQLite 重启测试和 Wrangler dry-run。若输出为 registry 网络错误，重试后仍失败应记录为本次核验失败，恢复连接再运行。Miniflare 和 esbuild 使用锁定 Wrangler 所依赖的相同版本，使独立房间测试和实际打包使用同一套工具。展馆源码随包提供的 Three.js 版本及来源见[采集与依赖说明](../../real-viewer/PROVENANCE.md)。

## 本地准备

1. 解压已审阅的公开候选，进入包含 `SHA256SUMS`、`assets/credits.json` 的根目录。开发工作树不适合作为上传目录。保存发布包摘要、提交或本地候选标识和审核时间。
2. 在同一候选根目录执行下列命令。先检查干净的包，再从已核验文件生成 `deploy/cloudflare/dist/assets`。将命令输出中的清单哈希、素材数、最大文件大小与 `deploy/cloudflare/dist/receipt.json` 一并记入记录。单个静态文件须在 25 MiB 限额以内。[静态资源限额](https://developers.cloudflare.com/workers/platform/limits/#static-assets)
3. 以下示例中的 `wrangler` 均指已安装且锁定的 **4.161.0**。运行 `wrangler --version` 核对版本。将工具安装在候选目录以外，避免依赖或环境文件被带进候选。在本机配置 `WRANGLER_SEND_METRICS=false` 可关闭 CLI 使用统计。

```sh
node scripts/check-public-release.mjs --dir .
node scripts/prepare-worker-assets.mjs
wrangler --version
wrangler deploy --dry-run --config deploy/cloudflare/wrangler.json
```

本地浏览器验收可在第一条命令末尾加 `--browser`，用 `PLAYWRIGHT_MODULE` 和 `CHROME_BIN` 指定本机工具。Worker 本地演练将 `PUBLIC_ORIGIN` 临时设为回环测试地址，确保页面和 API 的同源检查仍然开启。示例从同一候选运行：

```sh
wrangler dev --local --ip 127.0.0.1 --port 8787 --var PUBLIC_ORIGIN:http://127.0.0.1:8787 --persist-to .wrangler/local-smoke --config deploy/cloudflare/wrangler.json
```

生产版 `GET /api/version` 只返回服务名与绑定的 Cloudflare Version ID（本地可能为 null）。上线后与批准记录、部署控制台互证。

打开 `http://127.0.0.1:8787/`，从两个不同浏览器会话入馆。在隔离环境验证占满第 50 个名额后的候位、前人离馆时队首补位、刷新后原票续排。要测房间持久性，应在短于会话过期的间隔内重启本地 Worker，沿用同一个 `--persist-to` 目录，用原会话或候位票重连。流连接会重新建立；已经超时离馆的访客应按规则释放名额。不要在正式房间填满 50 个测试名额。

## 账号和域名的只读预检

正式发布前，从拟使用的 Cloudflare 账号核对 `xiaoha.org` zone 为 Active、账户套餐和余额/限额、Workers 与 SQLite DO 权限及预计用量。在 DNS 与 Workers Routes 中分别查找精确域名和可能覆盖它的通配规则。记录已有解析的类型、值、代理状态、TTL，以及时点和恢复负责人。若已存在同名 Worker、域名、CNAME/别的记录或覆盖路由，确认它们是谁的、具体影响后重新决定，勿直接覆盖。[Workers 权限](https://developers.cloudflare.com/workers/authorization/workers/) · [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

可以把只读账号凭据放在本机环境 `CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_API_TOKEN`，执行 `node deploy/cloudflare/preflight.mjs --account`。它通过 GET 查询 zone、精确 DNS、Worker 域名、路由、当前部署及 workers.dev / 预览状态。检查结果包含原有 DNS 值，只存于维护者的私有记录。缺权限、响应失败或看不到目标 zone 时结果为未知。脚本不带 `--account` 时只打印用法。控制台还应核对同名 Durable Object 命名空间、计费、证书状态以及 DNS 是否有通配记录。[域名只读 API](https://developers.cloudflare.com/api/resources/workers/subresources/domains/methods/list/) · [部署只读 API](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/deployments/methods/list/)

## 首次建立 Worker 和房间

首次发布和正式域名绑定是两次外部变更。先确认具体账号、Worker、许可清单哈希、发布包 SHA-256、`v1` 迁移和无公开入口的部署范围。首次创建 Worker 或应用待执行的 DO 迁移时必须用 `deploy`。该命令产生版本并立即部署到 100%，不支持把这次迁移做成待批准的 `versions upload`。执行前要确认同名 Worker 没有既存路由，候选配置为 `workers_dev: false`、`preview_urls: false`、`routes: []`，且绑定中的 `new_sqlite_classes` 仅含所需类。[DO 迁移与版本限制](https://developers.cloudflare.com/durable-objects/deployments/durable-object-gradual-deployments/)

```sh
wrangler deploy --config deploy/cloudflare/wrangler.json
wrangler deployments list --config deploy/cloudflare/wrangler.json
```

记录返回的 Worker Version ID、Deployment ID、绑定及房间命名空间。复核没有 workers.dev、预览 URL 或其他已启用的域名/路由，目标 Worker 与获准候选一致。即使没有公开流量，这一步也已经在账号创建了资源。任何部署错误都要先查当前版本、现有域名和迁移状态，避免把部分成功视为完整成功。

## 单独启用唯一域名

在得到对 **`shiku.xiaoha.org` → `shiku`、账号、具体 Version ID** 的批准后，通过 Cloudflare Dashboard 进入 **Workers & Pages → shiku → Settings → Domains & Routes → Add → Custom Domain**，填写精确主机名，关闭域名预览。自定义域名由 Cloudflare 配置对应 DNS 并签发证书；保持源码中的 routes 为空，域名设置由控制台单独维护。若弹出替换现有 DNS/Worker 权限的提示，先处理已记录的冲突。[Custom Domains 官方流程](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

绑定后使用系统信任链验证真实 HTTPS，不传忽略证书选项。核对 `/api/room` 的 `capacity=50` 和人数，两台设备分别入馆，看地图是否即时更新、离开是否释放名额；从首页进入代表窟、开启普通话并切换观察点。检查音轨 Range 返回 206、越权源不能写 API、访问者看不到服务令牌。核对站点部署版本和命名空间，复查只启用唯一主机、预览关闭。记录 Cloudflare HTTP 5xx、Worker 异常、房间连接和计费视图可见性。默认日志开关以当前候选为准，指标或账单尚未出数时记录为未知。

## 后续版本和回滚

同一个 Worker 上，如果没有待执行的 DO 类迁移，先上传版本。确认收到的 Version ID 与这次已审核的产物一致，再针对该 Version ID 获批切换 100% 流量。上传与流量切换分别留存时间、ID 和操作者。新迁移需重新按直接部署流程评审，避免将旧 KV/SQLite namespace 当作可随意重建的缓存。[Workers 版本与部署](https://developers.cloudflare.com/workers/versions-and-deployments/)

```sh
wrangler versions upload --config deploy/cloudflare/wrangler.json
wrangler versions deploy APPROVED_VERSION_ID@100% --config deploy/cloudflare/wrangler.json
wrangler deployments list --config deploy/cloudflare/wrangler.json
```

代码或静态资源回滚可使用同一命名空间且与现有数据结构相容的上个已知良好 Version ID，核对批准对象后执行 `wrangler rollback PREVIOUS_VERSION_ID --config deploy/cloudflare/wrangler.json`。核对新的 Deployment ID 和恢复的 Version ID，重复域名、访问、音频与多人验证。代码回滚不会回退数据库。在发生禁止跨越的 DO 类迁移时，改走兼容的向前修复。如果是首次上线，没有先前可用版本，可按照已保存的域名方案先解除该 Worker 的自定义域名绑定并恢复原 DNS，确认域名恢复，保留原房间资源供调查。[Cloudflare 回滚边界](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)

SQLite DO 另有最长 30 天的 PITR。恢复房间数据会回退访客、候位和令牌状态，可能恢复已经失效的票或丢失新票。先冻结进入/写入、核对特定房间、目标时点和备份 bookmark，在隔离环境演练并取得明确授权，才可执行数据恢复。项目没有公开的数据库恢复端点。[SQLite 存储与时点恢复](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/)

## 满员与费用

50 是席位数，不是请求限额。按当前客户端移动时最快约每 120 毫秒上送一次估算，50 人持续走动 10 分钟的理论上界约为 25 万次位置请求，另有心跳、排队和静态请求。此为预算情景，不是实测流量或账单。NDJSON 保持连接时房间可能持续活跃，需分别核对 Workers 请求、DO 请求、运行时长与 SQLite 读写额度；未看到账户套餐前不能承诺零费用。上线前确认预算、告警阈值和负责人，观察实际访问后再调节上送频率。参见[Workers 限额](https://developers.cloudflare.com/workers/platform/limits/)与[Durable Objects 计费](https://developers.cloudflare.com/durable-objects/platform/pricing/)。

## 参观质量与隔离负载验证

Workers Logs 中筛选结构化事件 `kind=visit_metric`，按 `version`、`entry`、`device` 分组。分别看 `submitted → admitted` 和 `admitted → ready`，并列 `queued`、`cancelled`、`failed`。ready、artwork（首次呈现展品）和 audio_played（首次实际播放普通话讲解）的耗时区间从取得席位起算。每次参观后两项至多各计一次，播放失败不计入。比较同一时间窗口、同类样本的阶段计数；跨窗口、拒绝统计、浏览器中断或网络故障会造成遗漏。指标表达参观尝试次数。不要把估算当作独立访客数或逐人追踪。配置只保留自定义日志，关闭逐请求日志和追踪。[参观隐私](../../privacy.html)

### 公网定时检查

主库的 GitHub Actions 在 UTC 每小时第 23 分钟安排一次公网检查。也可在 **Actions → Public availability → Run workflow** 手动启动，并填写期望的 Worker Version ID。检查入口遮罩与登记控件、线上版本、50 席房间摘要、图册、完整 WebP 和普通话音频的 Range 响应。脚本只发 GET，无需 Cookie 或席位。每项失败可重试一次；Actions 运行摘要列出耗时和尝试次数。[定时工作流](../../.github/workflows/public-availability.yml) · [公网检查脚本](../../scripts/check-public-availability.mjs)

### 匿名入馆质量阈值

在 Workers Logs 选定 Worker `shiku` 和一个已经结束的时间窗口，筛选自定义事件 `kind=visit_metric`，将明细导出到维护者本机的私有目录。建议从一个完整自然日开始，隔开仍在排队或载入的时段。每次读一份完整的 JSON 或 JSONL 导出。脚本兼容结构化事件、`source` 包装、`result.events` 和 Tail 中的 `Logs[].Message[]`。导出若有分页，应先核对总记录数、补齐各页并去掉重叠。报告仅列版本、入口类型、设备类别和聚合数值。

```sh
node scripts/check-visit-metrics.mjs /path/to/completed-window.jsonl
node --test scripts/check-visit-metrics.test.mjs
```

各组分别以本时间窗口的 `submitted` 次数为分母。默认每组至少 30 次提交才判断；`ready / submitted` 低于 90%，或明确的场景载入超时 `timeout / submitted` 高于 5%，其中任何一项都触发 `ALERT`。维护者可通过 `SHIKU_MIN_SAMPLE`、`SHIKU_MIN_READY_RATE`、`SHIKU_MAX_TIMEOUT_RATE` 调整阈值，两个比率用 0 至 1 的小数。达到 180 秒载入时限才会记作 `timeout`；取消、普通失败、就绪对同一次提交流程互斥。报告也列出首次成功呈现展品 `artwork` 与普通话实际开始播放 `audio_played` 的次数。

`unresolvedBalance` 是提交数减去本窗口四种终态数。席位尚在等待、访客关闭浏览器、匿名上报丢失和窗口边界都可能影响它。这个差额不能推断具体访客的去向。若终态数大于提交数，该组为 `INCONCLUSIVE`，请扩大观察窗口后重算；低样本显示 `INSUFFICIENT`。旧日志缺少明确超时事件时超时率显示 `null`。没有任何满足条件的提交时，检查不会当作通过。

退出码 `0` 表示所有观测组均达标，`1` 表示至少一组触发阈值，`2` 表示输入或配置错误，`3` 表示样本、窗口或日志协议不足以完整判断。运维可以将退出码 `1` 接入现有通知渠道，用下一个独立完整窗口的结果判断是否恢复。仓库提供本地判定工具和公网 GET 定时工作流；Cloudflare 生产指标阈值和通知渠道需由维护者在实际账号中配置并确认。[离线检查](../../scripts/check-visit-metrics.mjs) · [告警与恢复的模拟测试](../../scripts/check-visit-metrics.test.mjs)

### 隔离负载验证

运行 `node scripts/check-room-load.mjs` 会启动仅限本机回环地址的新 Node 房间，50 个访客持续移动 10 分钟，另外两人候位，中途验证队首补位，最后核对所有席位释放。输出采样对端位置传播延迟和应用消息数。运行 `node scripts/verify-worker-room.mjs` 另测真实 workerd 与同一 SQLite 数据的重启恢复。平台账单、手机画面帧率需在对应环境单独观察。
