# 可选的本机 HTTPS 与自托管演练

本项目的正式托管方案是 [Cloudflare Workers 与持久化房间](cloudflare/README.md)。本页供开发者在独立环境演练单实例 Node 版。

本方案运行一个 Node 进程。浏览器通过 HTTPS 载入场景、按需播放普通话音轨，通过同一域名的 `/api/stream` 接收同馆访客的位置变化。50 个名额、候位顺序和当前轨迹都保存在这个进程的内存中。重启会清空这些信息，换版时间宜选在入馆和候位人数都为零时。

## 交付前演练

在开发机准备 Node 24、nginx 和支持 `req -addext` 的 OpenSSL，然后运行：

```sh
node scripts/check-https-proxy.mjs
node scripts/check-admission.mjs
node scripts/check-presence.mjs
```

第一个脚本使用当前目录的 Nginx 站点配置、临时证书和三个回环端口。它验证 HTTPS、域名及来源、健康接口、音轨分段下载、两名访客的地图更新和第 51 位访客的候位补位。演练结束后会关闭测试服务并删除临时证书。另两项独立检查本地模式的候位与多人行为。

## 生产主机及首次安装

适用 Linux + systemd，Node 24 位于 `/usr/bin/node`，Nginx 已提供 HTTPS 模块。服务器应允许互联网访问 80 和 443，Node 仅监听 `127.0.0.1:4173`。若主机在 CDN 后面，CDN 与源站之间也应校验证书，关闭 `/api/*` 的缓存和缓冲。部署后的多人测试必须经过实际 CDN 域名。

1. 将经批准且校验通过的发布包解压至 `/srv/shiku/releases/<版本>`。每个版本独占目录，文件及父目录对 systemd 的动态服务用户可读，只有维护账户可写。首次设置 `/srv/shiku/current` 符号链接指向该版本。保留当前和上一个发布包、校验和及相应的代理和服务配置。
2. 域名解析和证书须由此域名的管理方配置。`shiku.nginx.conf` 默认读取 `/etc/letsencrypt/live/shiku.xiaoha.org/` 下的 fullchain.pem 和 privkey.pem。可以先通过现有证书流程签发。使用 HTTP-01 首次签发时，保留文件顶部的 http 级 map、限流区和日志格式定义，先只装该配置的 80 端口块，将 ACME webroot 设为 `/var/www/acme`，签发成功后再安装整份配置。保留证书自动续期和成功续期后 reload Nginx 的配置。
3. 检查 4173 端口空闲。安装本目录的 `shiku.service` 至 `/etc/systemd/system/`，运行 `systemctl daemon-reload` 和 `systemctl enable --now shiku.service`。一个服务实例承载全站的名额与访客广播，勿为同一域名运行第二个 Node 进程。
4. 将 `shiku.nginx.conf` 安装到 Nginx 已启用的虚拟主机目录，在 `http` 上下文加载。先执行 `nginx -t`，再执行 `systemctl reload nginx`。配置使用 IPv4 监听。如果域名需要源站 IPv6 直连，同时配置匹配的监听和防火墙，再启用 AAAA 记录。
5. 本机无访客时检查 `curl -fsS http://127.0.0.1:4173/api/room`。从独立网络检查 `curl -fsS https://shiku.xiaoha.org/api/room`。两者的 `service` 都须为 `shiku-presence`，容量为 50，两边人数一致，`lanUrls` 为空。用两台设备分别入馆，确认地图会显示双方移动，再在洞窟点击「听普通话讲解」。健康接口的成功只说明服务可达。
6. 人数可从 `/api/room` 的 `occupancy`、`waiting` 观察。用主机的日志和监控系统检查 Nginx 5xx、Node 服务重启、HTTPS 证书到期和磁盘余量。API 和实时连接均不应缓存，访客凭据不要记录在访问日志。若使用其他 CDN，请验证其 NDJSON 响应在断开前就持续可读。[Nginx 反向代理与缓冲文档](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering)

## 单实例边界与日志

50 人在馆之外，最多登记 500 名等候者。排满时，新访客会看到稍后再试的提示，已有票据仍可查询、补位或取消。为处理刷新、补领和延迟取消请求，Node 合计保留最多 8,192 条有效及短期待清除的登记记录，过期后释放。每人每 120 毫秒一次的前端位置更新在服务端预算之内，最多保留 180 个轨迹点。公开模式 Node 与 HTTPS 代理都设有 2,048 个连接上限。Nginx 对登记与取消两类请求合计每秒放行 30 次、允许短时额外 120 次；查询已有票据不占用这项额度。公网机器的实际并发性能仍取决于主机资源、带宽和 CDN，部署后的现场测量才能确认。

站点的 Nginx 访问日志默认写至 `/var/log/nginx/shiku-status.log`，只含时间、请求方法、HTTP 状态和耗时。请确保该文件由主机 logrotate 接管，设置保留期，并在隐私说明公布具体期限。站点级 Nginx 请求错误消息可能带有原始地址或来源页，模板关闭此类明细；主机仍应监测状态码、进程和全局启动错误。CDN、上层代理、云平台和备份的日志策略独立于模板，正式上线前应逐层核实。

## 换版与回滚

将新候选解压到新的版本目录，核对校验和，记录 `readlink -f /srv/shiku/current` 的值。每次正式切换前应获得该候选的批准。确认两个房间计数均为零后，在 Linux 上建立临时链接，再在同一文件系统内原子替换 `current`：

```sh
ln -s /srv/shiku/releases/经核验的版本 /srv/shiku/current.next
mv -Tf /srv/shiku/current.next /srv/shiku/current
systemctl restart shiku.service
```

若更改了服务或代理配置，也要记录原配置，执行对应的 daemon-reload 或先测试再 reload 的流程。按上方步骤复查本机、外部 HTTPS、登录、实时走动和音轨。如果失败，用同一套临时链接命令将 `current` 指回已记录的上一个版本，恢复对应的配置并重启服务，然后重复复查。内存里的访客会话与候位无法通过代码回滚恢复，访客需要重新连接。
