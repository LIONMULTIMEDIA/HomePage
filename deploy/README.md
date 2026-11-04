# LION SSH 部署

網站正式網址為 [https://lion-star.vip](https://lion-star.vip)，HTTP 會自動轉址至 HTTPS。內網直接連線位址為 [http://10.40.2.225:18080](http://10.40.2.225:18080)，健康檢查為 `/healthz`。部署與 HTTPS 設定於 2026-10-30 完成。

目前發布內容為 `sites/dist` 的五個靜態檔案，版本目錄為 `20261104T051040Z-web-game-tags-f8aa27f`。2026-11-04 已在網頁遊戲卡片的「數位內容」標籤後，依序加入「高登棋牌」與「高登老虎機」。此次部署的靜態檔案與 commit `f8aa27f7b8bbb160b0e6330e0a128ced3808daef` 完全一致，檔案雜湊記錄於部署目錄中的 `SHA256SUMS`。

## 服務配置

| 項目 | 設定 |
| --- | --- |
| 服務 | `lion-site.service`，已啟用開機自動啟動 |
| HTTP 監聽 | `0.0.0.0:18080` |
| 網站根目錄 | `/srv/lion/current`，連結到版本目錄 |
| 版本目錄 | `/srv/lion/releases/20261104T051040Z-web-game-tags-f8aa27f` |
| Nginx 設定 | `/etc/lion/nginx.conf`，來源為 [nginx.conf](nginx.conf) |
| systemd 設定 | `/etc/systemd/system/lion-site.service`，來源為 [lion-site.service](lion-site.service) |
| 日誌 | `/var/log/lion-site/access.log`、`error.log` |
| 日誌輪替 | `/etc/logrotate.d/lion-site`，來源為 [logrotate.conf](logrotate.conf)，每日輪替並保留 14 份 |
| 部署驗證紀錄 | `/srv/lion/deployments/20261104T051040Z-web-game-tags-f8aa27f/` |
| 防火牆 | UFW 新增 `18080/tcp` 允許規則，註記為 `LION static website` |

服務使用主機既有的 `/usr/sbin/nginx`，由 systemd 分配獨立的 `lion-site` 動態使用者。LION 有自己的設定、PID、執行目錄與日誌，單一 worker，記憶體上限為 128 MiB。既有 `nginx.service` 的設定與服務均未變更。

部署前已確認主機使用中的埠包含 `22、53、80、443、3000、8085、8090、9100`，並確認 `18080` 可用。新增服務沒有占用這些既有埠。

## 網域入口：lion-star.vip

BO VM 的既有 `nginx.service` 已新增 `/etc/nginx/conf.d/lion-domain.conf`，來源為 [nginx-domain.conf](nginx-domain.conf)。HTTP 請求會以 301 轉址至 HTTPS，保留原始路徑與查詢參數；HTTPS 依網域將請求轉送至 `http://127.0.0.1:18080`。LION 與 `bo.ppokergame.com` 共用同一個 Nginx 的 80/443 埠，分別使用自己的網域規則與憑證，不會建立互相搶占埠的程序。

公開 IP `185.213.248.225` 的 80/443 已能到達 BO VM。本次沒有新增上游 NAT 規則，也沒有變更既有 BO 設定或防火牆。公開 IP 的 18080 連線測試逾時，因此網域入口使用既有 80 埠轉送。

GoDaddy DNS 已更新，並經 Google、Cloudflare 公共 DNS 與 BO VM 解析確認：

| GoDaddy DNS 欄位 | 值 |
| --- | --- |
| 類型 | `A` |
| 名稱 | `@` |
| 值 | `185.213.248.225` |
| TTL | `600` 秒 |

日後調整 A 紀錄可參考 [GoDaddy 官方說明](https://www.godaddy.com/help/edit-an-a-record-19239)。本次設定與憑證涵蓋根網域 `lion-star.vip`；`www.lion-star.vip` 目前仍以 CNAME 指向 `lionmultimedia.github.io`。

**HTTPS 已啟用。** 使用主機既有 Certbot 與 `/var/www/lion-acme` webroot 取得 Let's Encrypt 的專屬憑證，有效期限至 **2027-01-28**。憑證位於 `/etc/letsencrypt/live/lion-star.vip/fullchain.pem`，私鑰位於同目錄的 `privkey.pem`。HTTP 的 `/.well-known/acme-challenge/` 路徑保留供續期驗證使用。

主機的 `certbot.timer` 已啟用，既有 `/etc/letsencrypt/renewal-hooks/deploy/reload-nginx` 掛鉤會先檢查 Nginx 設定再平滑重載。已針對 LION 執行 `certbot renew --cert-name lion-star.vip --dry-run --no-random-sleep-on-renew --run-deploy-hooks`，模擬續期與掛鉤皆成功，正式憑證維持有效。

從外部驗證公開入口：

```bash
curl --noproxy '*' -I http://lion-star.vip/
curl --noproxy '*' --fail https://lion-star.vip/healthz
```

已透過正式 HTTPS 網域驗證首頁及全部靜態檔案，HTTP 200 且雜湊與部署檔案一致；憑證名稱與信任鏈驗證通過。HTTP 轉址會保留路徑與查詢參數，ACME 驗證路徑維持 HTTP 200。既有 BO HTTPS 仍回傳 HTTP 200，憑證未變更，原有服務的主程序 PID、監聽埠與其他 Nginx 設定檔皆保持一致。HTTPS 紀錄位於 `/srv/lion/deployments/20261030T082535Z-https/` 及本機 `.gstack/deploy-reports/2026-10-30-lion-https.json`。

此網路下，BO VM 連向自己的公開 IP 會逾時。本機健康檢查可使用 `http://127.0.0.1:18080/healthz`；若要同時驗證 Nginx HTTPS，使用 `curl --resolve lion-star.vip:443:127.0.0.1 https://lion-star.vip/healthz`，公開連線則從 VM 外部驗證。

## 維護

沿用本機既有 SSH 設定登入：

```bash
ssh 10.40.2.225
```

在遠端主機執行以下指令查看服務、開機啟動狀態與健康檢查：

```bash
systemctl status lion-site.service --no-pager
systemctl is-enabled lion-site.service
curl --fail http://127.0.0.1:18080/healthz
journalctl -u lion-site.service -n 50 --no-pager
```

需要重新啟動時，執行 `systemctl restart lion-site.service`。請使用此服務名稱管理 LION；`nginx.service` 屬於主機原有服務。

## 更新與回復版本

先將新的 `sites/dist` 五個檔案上傳至新的 `/srv/lion/releases/<版本名稱>/`，確認檔案雜湊與本機相同。版本目錄應由 root 擁有，目錄權限為 `0755`、檔案權限為 `0644`，讓服務可以讀取。

完成上傳與驗證後，在遠端主機以以下方式切換版本。將 `lion_release` 換成實際版本名稱；`current.next` 是切換用的暫存連結，若已存在，應先確認前次操作狀態。

```bash
set -eu
lion_release='填入已上傳並驗證的版本名稱'
test -f "/srv/lion/releases/$lion_release/index.html"
ln -s "/srv/lion/releases/$lion_release" /srv/lion/current.next
mv -Tf /srv/lion/current.next /srv/lion/current
curl --fail http://127.0.0.1:18080/
```

純靜態檔案更新不需要重啟服務。保留先前版本目錄；需要回復時，使用相同切換步驟將 `lion_release` 指向先前版本。目前可回復至 `20261102T024403Z-remove-preview-c2f05131`。

## 2026-11-04 更新驗證

已部署網頁遊戲新增「高登棋牌」與「高登老虎機」標籤的版本。上傳前確認五個靜態檔案與來源 commit 完全一致；上傳後核對 SHA-256，再原子切換 `/srv/lion/current`。原版本保留供回復。

主機內 HTTP、HTTPS 與外部正式 HTTPS 的五個檔案雜湊均一致，首頁及資源回傳 HTTP 200，`/healthz` 回傳 `ok`。公開首頁已確認兩個新增標籤及順序。`lion-site.service` 與 `nginx.service` 持續運作，主程序 PID 未變更，無需重啟服務。本機完整紀錄位於 `.gstack/deploy-reports/20261104T051040Z-web-game-tags-f8aa27f/report.json`。

## 2026-11-02 更新驗證

新版上傳至獨立版本目錄，五個檔案的 SHA-256、root 擁有者與檔案權限確認後，透過原子切換更新 `/srv/lion/current`。正式 HTTPS 首頁、四個資源檔案與 `/healthz` 均回傳 HTTP 200；所有檔案內容與本機發布快照一致，預覽提示列已移除。

主機內 HTTP 與 HTTPS 內容驗證通過，`lion-site.service` 與 `nginx.service` 維持運作且主程序 PID 未變更，無需重啟服務。舊版本已保留。完整本機紀錄位於 `.gstack/deploy-reports/20261102T024403Z-remove-preview-c2f05131/report.json`，遠端紀錄位於 `/srv/lion/deployments/20261102T024403Z-remove-preview-c2f05131/`。

## 部署驗證

- JavaScript 語法、HTML 引用的本機檔案與頁內錨點檢查通過。
- systemd 設定及 logrotate 設定檢查通過；Nginx 透過服務的 `ExecStartPre` 完成設定驗證。
- 首頁、CSS、兩支 JavaScript 與 favicon 均回傳 HTTP 200，內容 SHA-256 與本機相同。
- `/healthz` 回傳 HTTP 200 與 `ok`，不存在的路徑回傳 HTTP 404。
- `lion-site.service` 重啟測試通過，重啟後仍為 `active` 且開機啟動狀態為 `enabled`。
- 從部署主機以外的本機端直接連入 `18080` 成功。
- Chromium 在 1440 與 390 像素寬度正常顯示，沒有水平溢出或 JavaScript 錯誤；手機選單、Escape 關閉與焦點回復通過。
- 部署前後，原有 Nginx、三個 PPoker 服務、監控及 SSH 服務的 PID 與狀態相同，`/etc/nginx` 內檔案雜湊也相同。

遠端驗證紀錄包含服務狀態、監聽埠、防火牆規則及檔案雜湊。本機瀏覽器截圖存於 `.gstack/deploy-reports/2026-10-30-lion-desktop.png` 與 `2026-10-30-lion-mobile.png`；該目錄依現有設定不納入 Git。
