# AURORA Atelier - 網站改版與內容模擬說明

## 1. 網站改版設計 (`studio-pro`)
我們已將網站遷移至現代化的 Next.js 架構，位於 `studio-pro/` 目錄中。

### 視覺升級亮點：
- **奢華暗色調設計 (Luxury Dark Mode)**：以深色背景搭配金色字體，營造高端、專業的品牌形象。
- **微動效體驗 (Micro-interactions)**：滾動時的淡入效果、按鈕的光暈動畫、背景的粒子浮動，提升互動質感。
- **響應式排版**：完美支援手機、平板與桌機瀏覽。

## 2. 模擬內容擴充
為了展示完整的服務體系，我們在 `src/lib/site-content.ts` 中新增了以下模擬案例與見證，讓您的展示更具說服力：

### 新增案例研究 (Case Studies)
1. **金融科技領袖系列 (Executive Portrait)**
   - **類別**：肖像攝影
   - **情境**：為跨國企業高管拍攝專業形象照。
   - **成果**：提升 LinkedIn 專業度與瀏覽量。

2. **未來科技峰會 2025 (Tech Conference)**
   - **類別**：活動紀錄
   - **情境**：千人規模的大型研討會紀錄。
   - **成果**：即時發稿與社群互動率提升。

### 新增客戶見證 (Testimonials)
- **TechFuture 活動策劃人**：強調團隊在大型活動中的專業與冷靜。
- **Global FinTech 人資長**：讚賞肖像照展現的專業與個性。

## 3. 如何展示 (Demo)

### 方式一：開發模式預覽 (推薦)
若您已安裝 Node.js，請執行以下指令啟動網站：

```bash
cd studio-pro
npm install
npm run dev
```

接著開啟瀏覽器訪問 `http://localhost:3000` 即可看到完整的改版網站。

### 方式二：靜態網站輸出
我們已設定好靜態輸出配置。若需部署至靜態空間（如 GitHub Pages 或 Netlify），請執行：

```bash
cd studio-pro
npm run build
```

輸出的檔案將位於 `studio-pro/out/` 目錄中。

---

此版本已準備好隨時上線，您只需替換 `site-content.ts` 中的文字與圖片連結，即可轉為正式營運網站。
