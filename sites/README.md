# 萊恩多媒體公司形象網站

以正式公司中英文名稱與網頁／手機遊戲產品方向製作。網站為純靜態 HTML、CSS、JavaScript，不需要安裝套件或執行建置。

## 預覽

在本目錄執行 `python3 -m http.server 8767 --bind 127.0.0.1 --directory dist`，開啟 `http://127.0.0.1:8767`。亦可直接開啟 `dist/index.html`。

## 內容與行為

- 正式公司名稱：萊恩多媒體有限公司／LION MULTIMEDIA CO., LTD.。
- 網頁與手機遊戲概念視覺均以本機 CSS／SVG 繪製，並註明並非實際產品畫面。
- 頁面包含關於萊恩、產品方向與聯絡資訊。
- 手機遊戲卡片介紹 PPoker（Pocket Poker），提供[官方網站](https://ppokergame.com/)按鈕；連結會另開分頁。
- 聯絡信箱為 `Ap.Developers@goldenf.co`，信箱文字與聯絡按鈕皆可開啟郵件程式。
- 支援手機導覽、鍵盤操作與減少動態效果設定。
- 沒有收件後端或假聯絡表單，也未加入追蹤程式與外部字型。

## 正式公司資料

在 `dist/site-config.js` 設定真實的 `email`、`phone`、`address`、`taxId`。目前信箱為 `Ap.Developers@goldenf.co`。未提供的信箱顯示「尚未提供」；其他未提供的欄位不顯示。提供有效 Email 後，聯絡按鈕會使用 mailto 開啟使用者的郵件程式。

完成資料確認後，可將 `preview` 設為 `false`，並移除 `dist/index.html` 的 `robots=noindex, nofollow`。此設定不會變更 Sites 的私密／公開權限；供外部訪客使用還需要公開的部署與網址。

## Vercel

網站首頁位於 `sites/dist/index.html`，儲存庫根目錄沒有 `index.html`。若直接發布儲存庫根目錄，首頁 `/` 會回傳 `404 NOT_FOUND`。

儲存庫根目錄的 `vercel.json` 已指定發布 `sites/dist`，並略過安裝套件與建置。從 GitHub 匯入或調整既有 Vercel 專案時，在 **Settings → Build and Deployment** 使用以下設定：

| 設定 | 值 |
| --- | --- |
| Root Directory | 留空，使用儲存庫根目錄 |
| Framework Preset | `Other` |
| Build Command | 留空；若手動設定，開啟 Override 並清空欄位 |
| Output Directory | `sites/dist` |
| Install Command | 留空；若手動設定，開啟 Override 並清空欄位 |

`vercel.json` 會覆寫 Framework、Build Command、Output Directory 與 Install Command；Root Directory 仍需在後台確認為儲存庫根目錄，才能讀取這份設定。

將設定檔提交並推送至 Vercel 連結的 Git 分支，確認新部署使用包含此檔案的 commit。若只調整後台設定，儲存後需重新部署才會生效。完成後，從最新部署的 **Visit** 開啟網站；舊部署的專屬網址不會因新部署而更新。

此網站使用 `#about`、`#products` 等頁內錨點，無須新增 SPA 路由重寫。可確認首頁 `/`、`/styles.css`、`/site-config.js`、`/app.js` 與 `/favicon.svg` 都能正常存取。GitHub Pages 的 workflow 與 `.openai/hosting.json` 分別用於 GitHub Pages 和 Sites，不會替 Vercel 設定發布目錄。

參考：[Vercel 建置與發布目錄設定](https://vercel.com/docs/builds/configure-a-build)、[vercel.json 設定](https://vercel.com/docs/project-configuration/vercel-json)。

## GitHub Pages

將 `dist/` 內的檔案完整放至 GitHub Pages 發布目錄，保持相對路徑，即可用於帳號網站或專案子路徑。若需公司自有網域，另外依 GitHub Pages 設定網域與 DNS。這份靜態網站不含公司帳號或商店驗證狀態，不能保證通過 Apple 組織驗證。

## Sites

`.openai/hosting.json` 保留本次 Sites 專案 ID，靜態發布目錄為 `dist`。來源同步與發布應使用 Sites 插件，沿用既有專案。

## 已完成驗證

2026-10-27 初版：JavaScript 語法檢查與 Chromium 實際操作通過，包含錨點、手機選單與 Escape 操作，以及缺少聯絡資料和設定資料後的顯示。320、390、620、621、768、1024、1440 像素寬度均無水平溢出，頁面無 JavaScript 執行錯誤；已檢視桌面與手機截圖。

2026-10-27 更新：移除營業項目區塊、相關導覽與互動程式，將聯絡信箱設為 `Ap.Developers@goldenf.co`。JavaScript 語法檢查與 Chromium 驗證通過；1440 與 390 像素寬度無水平溢出，兩個郵件連結皆指向新信箱，頁內錨點與手機選單正常，頁面無 JavaScript 錯誤。已檢視桌面與手機聯絡區塊截圖。

2026-10-27 PPoker 更新：手機遊戲卡片加入 PPoker 名稱、簡短介紹與官網按鈕。已讀取官方網站，並驗證連結網址、另開分頁與 `noopener noreferrer` 設定；1440、390、320 像素寬度無水平溢出，按鈕高度至少 46 像素，頁面無 JavaScript 錯誤。已檢視桌面與手機產品卡片截圖。
