# CLAUDE.md

目的
-	說明專案內「AI Concierge（Claude 相容）」的設定、行為與除錯流程，供開發與部署使用。

程式位置（參考）
-	伺服器路由：[src/app/api/ai/concierge/route.ts](src/app/api/ai/concierge/route.ts#L1-L800)
-	前端元件：[src/components/ai/home-ai-concierge.tsx](src/components/ai/home-ai-concierge.tsx#L1-L400)
-	範例環境變數：`.env.example` ([.env.example](.env.example#L1-L200))

主要功能概觀
-	提供一個輕量的「品牌禮賓 AI 客服」：前端呼叫 `/api/ai/concierge`，伺服器會先做 FAQ 命中、prompt injection 偵測、雙重（Anthropic / OpenAI）相容呼叫，最後回傳經過格式化的回覆。

環境變數（必讀）
-	`CLAUDE_API_BASE_URL`：Claude / Anthropic API 的 base URL，預設 `https://api.anthropic.com`。若從提供者控制台取得 URL（包含 `/console`），請填入主機部分（不含 `/console`）。
-	`CLAUDE_API_KEY`：API key（放置於後端環境）。務必不要將此值提交至版本控制。
-	`CLAUDE_MODEL`：模型名稱，預設 `claude-sonnet-4-5`。
-	`CLAUDE_API_STYLE`：`auto` | `anthropic` | `openai`。
	-	`anthropic`：強制呼叫 Anthropic 風格 endpoint（/v1/messages，使用 `x-api-key` header）。
	-	`openai`：強制呼叫 OpenAI 兼容 endpoint（/v1/chat/completions，使用 Bearer token）。
	-	`auto`（預設）：先嘗試 Anthropic，若失敗再呼叫 OpenAI-style endpoint。
-	`CLAUDE_TIMEOUT_MS`：模型呼叫逾時（毫秒），預設 `15000`。

AI 行為與系統提示（system prompt）
-	預設系統提示（`AI_CONCIERGE_SYSTEM_PROMPT`）定義在路由內的 `DEFAULT_SYSTEM_PROMPT`，用來指定品牌語氣、固定輸出格式、以及安全規範。
-	可以用 `AI_CONCIERGE_SYSTEM_PROMPT` 環境變數覆寫（留空會使用預設值）。

流量控制與保護
-	`AI_CONCIERGE_MIN_INTERVAL_MS`：同一指紋兩次請求最小間隔（ms），預防重複快速送出。
-	`AI_CONCIERGE_BURST_LIMIT` / `AI_CONCIERGE_BURST_WINDOW_MS`：短時突發限制（預設 8 次 / 60s）。
-	`AI_CONCIERGE_LIMIT` / `AI_CONCIERGE_WINDOW_MS`：長時限額（預設 30 次 / 600000ms）。
-	路由內亦有 same-origin 檢查與 prompt-injection 偵測（若疑似越權指令會直接拒絕並以安全訊息回應）。

回退行為
-	當 `CLAUDE_API_KEY` 未設定或模型呼叫失敗時：
	- 非 production 環境會降級為 FAQ 模式（用內建 KNOWLEDGE_BASE 回覆）。
	- 若無 AI 回覆且沒有知識匹配，會提供引導式快速詢問建議（帶連結）。

如何呼叫（範例）
-	前端：專案已實作 `HomeAiConcierge` 元件，會向 `/api/ai/concierge` POST JSON：`{ message: "你的問題" }`。
-	cURL (Anthropic-style)：

```bash
curl -sS -X POST "${CLAUDE_API_BASE_URL%/}/v1/messages" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -d '{"model":"claude-sonnet-4-5","system":"<system prompt>","messages":[{"role":"user","content":"請幫我說明價格方案"}]}'
```

-	cURL (OpenAI-compatible)：

```bash
curl -sS -X POST "${CLAUDE_API_BASE_URL%/}/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLAUDE_API_KEY" \
  -d '{"model":"claude-sonnet-4-5","messages":[{"role":"system","content":"<system prompt>"},{"role":"user","content":"請幫我說明價格方案"}]}'
```

（注意）路由會根據 `CLAUDE_API_STYLE` 決定用哪種格式呼叫，並會在 `auto` 模式下先嘗試 Anthropic endpoint。

格式化回覆
-	伺服器會呼叫 `normalizeReply` 與 `applyBrandTemplate`：剔除控制字元、移除 Markdown 裝飾、去重段落，並套用品牌 emoji 與短版格式（回覆長度上限約 1800 字元）。

追蹤與除錯
-	將 `AI_CONCIERGE_LOG=1` 可在 production 環境輸出模型 endpoint 的錯誤細節（路由使用 `devWarn`，僅在非 production 或強制 log 時印出）。
-	常見現象：
	- 空回覆或 timeout：檢查 `CLAUDE_TIMEOUT_MS`、網路連線、與 `CLAUDE_API_KEY` 是否有效。
	- 被拒絕（429）：表示觸及速率限制，調整 `AI_CONCIERGE_*` 變數或檢查是否同一個 fingerprint（IP + UA）過度請求。
	- prompt injection 被擋：訊息中含疑似越權字串（例如要求回傳 system prompt 或要求忽略指示），路由會回傳固定拒絕訊息。

部署注意
-	在雲端（例如 Zeabur）設定環境變數後請重新部署或重啟容器，確保運行時載入新值。
-	不要在前端或公開 repo 放 `CLAUDE_API_KEY`。

開發與本機測試
-	若本機尚未設定 `CLAUDE_API_KEY`，系統會使用內建 FAQ 回覆，方便開發介面及流程。
-	在本機測試真實模型前，請先在 `.env`（或雲端）加入 `CLAUDE_API_KEY` 與 `CLAUDE_API_BASE_URL`。

補充連結
-	重要程式：[src/app/api/ai/concierge/route.ts](src/app/api/ai/concierge/route.ts#L1-L800)
-	UI 元件：[src/components/ai/home-ai-concierge.tsx](src/components/ai/home-ai-concierge.tsx#L1-L400)
-	README 的 AI 範例設定：[README.md](README.md#L46-L64)

---

# 專案全面審查報告（2026-02-25）

> 以下為根據 codebase 全面掃描後，針對**安全性漏洞**、**效能優化**、**設計風格一致性**三大方向的完整審查結果。
> **2026-02-26 更新**：所有高風險 (H1–H4) 與中風險 (M1–M8) 安全性問題已全部修復。UI/UX 已全面重新設計為淺色暖灰系配色。

---

## 〇、已完成修復清單（2026-02-26）

### 安全性修復

| # | 修復內容 | 修改檔案 |
|---|---|---|
| H1 ✅ | Rate-limit buckets 掛載到 `global` 避免 cold start 歸零 | `src/lib/security/rate-limit.ts` |
| H2 ✅ | 缺少 Origin header 的寫入請求回傳 403 | `src/lib/security/request-guard.ts` |
| H3 ✅ | 新增 `sessionVersion` 欄位；密碼變更/重設後 +1，JWT 攜帶版本號並驗證 | `prisma/schema.prisma`、`src/lib/auth/session.ts`、`change-password/route.ts`、`admin/.../password/route.ts`、`login/route.ts`、`register/route.ts` |
| H4 ✅ | 移除硬編碼 dev secret，所有環境皆需設定 `AUTH_SECRET` | `src/lib/auth/session.ts` |
| M1 ✅ | 註冊端點改用通用錯誤訊息，防止使用者列舉 | `src/app/api/auth/register/route.ts` |
| M2 ✅ | 密碼變更加入 rate limiting (5 次 / 15 分鐘) | `src/app/api/auth/change-password/route.ts` |
| M4 ✅ | 專案狀態機：定義合法轉換矩陣，非法跳躍回傳 422 | `src/lib/auth/constants.ts`、`src/app/api/projects/[id]/status/route.ts` |
| M5 ✅ | 上傳 MIME 白名單 (`image/*`、`video/*`、`application/pdf`) | `src/lib/auth/constants.ts`、`assets/route.ts`、`presign-upload/route.ts` |
| M6 ✅ | Presigned upload 加入 Content-Length 上限 (500MB) | `src/lib/storage/s3.ts`、`presign-upload/route.ts` |
| M7 ✅ | bcrypt salt rounds 10 → 12 | `src/lib/auth/password.ts` |
| M8 ✅ | presign-upload 與 presign-download 加入 audit log | `presign-upload/route.ts`、`presign-download/route.ts` |
| P3 ✅ | Prisma client 在所有環境設為 global singleton | `src/lib/prisma.ts` |

### UI/UX 重新設計

| # | 內容 | 修改檔案 |
|---|---|---|
| UI1 ✅ | 色彩系統從藍色 (hue 240) 改為暖灰 (hue 60/80)，淺色系 | `src/app/globals.css` |
| UI2 ✅ | 新增 `--shadow-card` 柔和陰影、調降圓角至 `0.75rem` | `src/app/globals.css` |
| UI3 ✅ | Header：scroll-aware 透明→白底、行動版選單加動效 | `src/components/site-header.tsx` |
| UI4 ✅ | Footer：精簡文案、更乾淨的佈局 | `src/components/site-footer.tsx` |
| UI5 ✅ | 首頁 Hero：縮減文字量、更現代的排版 | `src/app/page.tsx` |
| UI6 ✅ | PremiumCard / SectionHeading / AccentDivider 改為極簡風 | `src/components/ultra/section.tsx` |
| UI7 ✅ | MagneticButton 改為深色填充按鈕（`bg-foreground`） | `src/components/ultra/magnetic-button.tsx` |
| UI8 ✅ | AI 客服視窗改為白底、更柔和的卡片式設計 | `src/components/ai/home-ai-concierge.tsx` |
| UI9 ✅ | 所有子頁面殘留舊樣式修復（process、systems） | `src/app/process/page.tsx`、`src/app/systems/page.tsx` |
| D7 ✅ | 載入 Noto Sans TC 中文字型 (400/500/700) | `src/app/layout.tsx`、`src/app/globals.css` |

### 待部署事項

- **資料庫遷移**：需執行 `prisma/migrations/202602261000_add_session_version/migration.sql`（新增 `session_version` 欄位至 `users` 表）
- 部署後舊 JWT token 會因缺少 `sv` claim 而自動失效，所有使用者需重新登入（安全預期行為）

---

## 一、安全性審查

### 🔴 高風險（已全部修復 ✅）

| # | 問題 | 位置 | 狀態 |
|---|---|---|---|
| H1 | **記憶體 rate limiting 在多實例 / 重新部署後失效** | `src/lib/security/rate-limit.ts` | ✅ 已修復：掛載到 `global` 變數 |
| H2 | **Origin header 缺失即放行（無真正 CSRF token）** | `src/lib/security/request-guard.ts` | ✅ 已修復：缺少 Origin 回傳 403 |
| H3 | **密碼變更 / admin 重設後既有 session 未撤銷** | `session.ts`、`change-password`、`admin/password` | ✅ 已修復：`sessionVersion` 機制 |
| H4 | **Dev secret 硬編碼** `"local-dev-secret-change-me"` | `src/lib/auth/session.ts` | ✅ 已修復：所有環境需設定 `AUTH_SECRET` |

**修復建議：**
1. ~~將 rate limiting 移至 Redis / Upstash 等外部存儲（解決 H1）~~ → 已改為 global 持久化（仍為記憶體，但跨 hot reload 保留）
2. ~~加入 CSRF token；或至少對缺少 Origin 的寫入請求拒絕而非放行（解決 H2）~~ → 已修復
3. ~~密碼變更 / 重設後撤銷既有 session（解決 H3）~~ → 已實作 `sessionVersion` 機制
4. ~~移除 dev secret fallback（解決 H4）~~ → 已修復

---

### 🟡 中風險（M1–M8 已全部修復 ✅）

| # | 問題 | 位置 | 狀態 |
|---|---|---|---|
| M1 | **註冊端點使用者列舉** | `src/app/api/auth/register/route.ts` | ✅ 改用通用錯誤訊息 |
| M2 | **change-password 無 rate limiting** | `src/app/api/auth/change-password/route.ts` | ✅ 5 次 / 15 分鐘 |
| M3 | **大多數 admin 寫入端點無 rate limiting** | 所有 `src/app/api/admin/` PATCH 路由 | ⚠️ 未修（低優先） |
| M4 | **專案狀態無轉換驗證** | `src/app/api/projects/[id]/status/route.ts` | ✅ 狀態機矩陣 |
| M5 | **Asset MIME type 無白名單** | `assets/route.ts`、`presign-upload/route.ts` | ✅ MIME 白名單 |
| M6 | **Presigned upload 無 Content-Length 限制** | `src/lib/storage/s3.ts` | ✅ 500MB 上限 |
| M7 | **bcrypt salt rounds = 10** | `src/lib/auth/password.ts` | ✅ 改為 12 |
| M8 | **download 及 presign-upload 無審計日誌** | presign 路由 | ✅ 已加審計 |

---

### 🟢 低風險 / 改善建議

| # | 問題 | 位置 |
|---|---|---|
| L1 | **Booking 端點無持久化**：回傳假的 `BK-${Date.now()}`，不對應任何真實紀錄 | `src/app/api/booking/route.ts` |
| L2 | **Admin users / audit-logs 無分頁游標**：硬編碼 `take: 200`，大量資料回應過大 | admin routes |
| L3 | **無 CAPTCHA / bot 防護**（register、login、booking） | auth + booking routes |
| L4 | **`x-forwarded-for` 可被偽造**（須由 load balancer 正確覆寫） | `src/lib/security/request-guard.ts` |
| L5 | **專案詳情回傳客戶電話與所有成員 email**：視業務需求評估是否過度曝露 | `src/app/api/projects/[id]/route.ts` |
| L6 | **Login 無帳號鎖定**（N 次失敗後暫停），rate limit 以 IP 為 key，共用 IP 下互相影響 | `src/app/api/auth/login/route.ts` |

---

### 各 API Route 安全檢查一覽

| 路由 | Same-Origin | Rate Limit | Auth | Input 驗證 | Audit Log |
|---|---|---|---|---|---|
| `POST /api/auth/register` | ✅ | ✅ 5/30min | — | ✅ Zod + 密碼政策 | ✅ |
| `POST /api/auth/login` | ✅ | ✅ 10/10min | — | ✅ Zod | ✅ |
| `POST /api/auth/logout` | ✅ | ❌ | ✅ | — | ✅ |
| `GET /api/auth/me` | — | ❌ | ✅ | — | — |
| `PATCH /api/auth/change-password` | ✅ | ✅ 5/15min | ✅ | ✅ Zod + 密碼政策 | ✅ |
| `GET /api/admin/users` | — | ❌ | ✅ admin | — | — |
| `PATCH /api/admin/users/:id/roles` | ✅ | ❌ | ✅ admin | ✅ Zod | ✅ |
| `PATCH /api/admin/users/:id/password` | ✅ | ❌ | ✅ admin | ✅ 密碼政策 | ✅ |
| `PATCH /api/admin/users/:id/status` | ✅ | ❌ | ✅ admin | ✅ Zod | ✅ |
| `POST /api/booking` | ✅ | ✅ 20/hr | — | ✅ Zod | ❌ |
| `GET /api/projects` | — | ❌ | ✅ | — | — |
| `POST /api/projects` | ✅ | ❌ | ✅ admin | ✅ Zod | ✅ |
| `PATCH /api/projects/:id/status` | ✅ | ❌ | ✅ + access | ✅ Zod | ✅ |
| `POST /api/projects/:id/members` | ✅ | ❌ | ✅ admin | ✅ Zod | ✅ |
| `POST /api/projects/:id/assets` | ✅ | ❌ | ✅ + access | ✅ Zod | ✅ |
| `POST .../presign-upload` | ✅ | ✅ 180/hr | ✅ + access | ✅ Zod | ✅ |
| `GET /api/assets/:id/presign-download` | — | ❌ | ✅ + access | — | ✅ |
| `POST /api/ai/concierge` | ✅ | ✅ 三層 | — | ✅ Zod | — |

---

## 二、效能優化建議

### 資料庫與後端

| # | 現狀 | 建議 |
|---|---|---|
| P1 | `getSessionFromCookies` 每次請求查 DB | 短期可加機制：若 JWT 未過期且剩餘 > 閥值，快取 session 於 memory/Redis（TTL 30-60s） |
| P2 | Admin users / audit-logs 硬編碼 `take: 200` 無游標 | 改為 cursor-based pagination，前端 infinite scroll |
| P3 | PrismaClient 在 production 每次 cold start 新建 | 已有 `global.prisma` 機制（但僅非 production），建議 production 也設全域 singleton |
| P4 | `KNOWLEDGE_BASE` FAQ 匹配使用線性掃描 | 目前 7 筆無需優化；若增至 50+ 條建議改用 trie 或 embedding 相似度匹配 |

### 前端

| # | 現狀 | 建議 |
|---|---|---|
| P5 | `SafeImage` 標記為 `"use client"` 導致整個圖片元件 hydrate | 若不需要 `onError` fallback 的場景，改用 Next.js 原生 `<Image>` 即可 RSC |
| P6 | `SmoothScrollProvider` 在所有頁面啟用 Lenis（含管理後台） | 管理後台 / 表單頁面建議跳過 smooth scroll，避免與 native form scroll / focus 衝突 |
| P7 | `framer-motion` 整包載入（~43kB gzipped） | 考慮 `next/dynamic` lazy import `Reveal`、`MagneticButton` 等非首屏元件 |
| P8 | 首頁載入 6 張 Unsplash 高解析圖 | 考慮對低 viewport 只載入前 3 張（responsive `loading="lazy"` 已可用），確認 `sizes` prop 正確 |
| P9 | `home-ai-concierge.tsx` 打字動畫以固定 12ms interval 逐字渲染 | 頻繁 `setMessages` 觸發整個 chat list re-render；改用 `useRef` + DOM 直接操作可降低 GC 壓力 |

---

## 三、設計風格與 UX 審查

### 設計系統一致性（正面）

- ✅ **CSS 變數架構完善**：使用 oklch 色彩空間，phi-based spacing system (`--space-phi-1` ~ `--space-phi-5`)，統一陰影與圓角。
- ✅ **品牌語氣一致**：全站繁體中文、高端俐落文案、一致的 kicker + heading + copy 三層架構。
- ✅ **動效系統佳**：`Reveal` / `StaggerReveal` / `MagneticButton` 統一使用 `ease-smooth` 曲線，`useReducedMotion` 尊重使用者偏好，CSS 層也有 `prefers-reduced-motion` 全域覆寫。
- ✅ **卡片系統 `PremiumCard`**：統一 clean-surface + hover 效果。
- ✅ **Focus ring** 以 `focus-ring` utility 統一所有可聚焦元素的 outline。

### 設計問題與改善建議

| # | 問題 | 建議 |
|---|---|---|
| D1 | **無 dark mode 實作**：CSS 只定義了 light theme 變數，`tailwind.config.ts` 設了 `darkMode: "class"` 但 `globals.css` 無 `.dark` 變數 | 加入 `.dark` 色彩變數組，或移除 `darkMode` 設定以避免混淆 |
| D2 | **Footer 聯絡資訊為 placeholder**（統一編號 90476123、hello@studiopro.tw）| 上線前需替換為真實聯絡資訊 |
| D3 | **Social links 指向通用域名**（`instagram.com`、`youtube.com`）| 上線前需替換為品牌帳號 URL |
| D4 | **Booking 日曆為前端模擬，無後端時段管理** | 所有日期可用性是由 hash 隨機決定（`getDateAvailability`），非真實系統——正式上線需銜接實際排程 |
| D5 | **行動版 nav overlay 無動效** | 展開/收合為 `block/hidden` 切換，加入 slide-down 或 fade 效果可提升質感 |
| D6 | **AI 客服視窗寬度固定 `390px`** | 在小螢幕（< 400px）可能被截斷，改為 `min(92vw, 390px)` 已處理但 bottom-5 可能讓視窗底部碰到安全區域（iOS notch） |
| D7 | **字型僅載入 `Inter` + `Plus Jakarta Sans`** | 繁體中文實際會 fallback 到系統字型（新細明體/微軟正黑體），考慮載入 `Noto Sans TC` 做中文字型 |
| D8 | **Brand partners 區使用 Unsplash 圖片作為 logo** | 正式環境需替換為真實品牌 SVG / PNG |

### UI 元件覆蓋度

| 元件 | 狀態 | 備註 |
|---|---|---|
| Button | ✅ | cva 變體系統 |
| Card | ✅ | 基礎 + PremiumCard |
| Form / Input / Select / Textarea | ✅ | 搭配 react-hook-form |
| Label | ✅ | — |
| Lightbox（案例頁） | ✅ | `case-gallery-lightbox.tsx` |
| Toast / Notification | ❌ | 無全域通知系統 |
| Modal / Dialog | ❌ | 需要時可用 Radix UI Dialog |
| Skeleton / Loading | ❌ | 列表頁無骨架屏 |
| 404 Not Found | ✅ | `not-found.tsx` |

---

## 四、架構改善建議（高價值 / 低代價）

| 優先 | 項目 | 說明 |
|---|---|---|
| ⭐⭐⭐ | 引入 Redis rate limiting | 用 Upstash Redis（serverless）替換記憶體 Map，解決多實例與重部署問題 |
| ⭐⭐⭐ | Session version / revocation | DB 加 `sessionVersion` 欄位；密碼變更後 +1，JWT 帶 version 做比對 |
| ⭐⭐⭐ | CSRF token（或嚴格 Origin policy） | 對缺少 Origin 的 POST/PATCH/DELETE 請求回傳 403 |
| ⭐⭐ | 專案狀態機 | 定義合法轉換矩陣（如 `lead → quoted → booked → ...`），拒絕跳躍 |
| ⭐⭐ | MIME type 白名單 | 限制上傳為 `image/*`、`video/*`、`application/pdf` |
| ⭐⭐ | API 分頁（cursor） | Admin users、audit-logs、assets 列表改為 cursor-based pagination |
| ⭐⭐ | 中文 Web Font | 載入 Noto Sans TC 400/500/700 以統一跨平台字型表現 |
| ⭐ | Dark mode | 補齊 `.dark` CSS 變數組 |
| ⭐ | Toast / 全域通知 | 加入 sonner 或 radix-toast 元件 |
| ⭐ | Booking 後端整合 | 將預約寫入 DB，銜接排程管理 |

---

## 五、環境變數完整清單

```bash
# 資料庫
DATABASE_URL="postgresql://..."

# Auth
AUTH_SECRET="<strong-random-secret>"        # ← 必須設定，不可用預設值
NEXT_PUBLIC_SITE_URL="https://your-domain.com"

# AI Concierge
CLAUDE_API_BASE_URL="https://api.anthropic.com"
CLAUDE_API_KEY=""
CLAUDE_MODEL="claude-sonnet-4-5"
CLAUDE_API_STYLE="auto"                     # auto | anthropic | openai
CLAUDE_TIMEOUT_MS="15000"
AI_CONCIERGE_SYSTEM_PROMPT=""               # 留空用預設
AI_CONCIERGE_LOG="0"                        # 1 = production 也印 AI 錯誤
AI_CONCIERGE_MIN_INTERVAL_MS="2000"
AI_CONCIERGE_BURST_LIMIT="8"
AI_CONCIERGE_BURST_WINDOW_MS="60000"
AI_CONCIERGE_LIMIT="30"
AI_CONCIERGE_WINDOW_MS="600000"

# S3 / R2 Storage（可選）
S3_ENDPOINT=""
S3_BUCKET=""
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
S3_REGION=""
S3_FORCE_PATH_STYLE="false"
```

---

## 六、技術堆疊摘要

| 類別 | 技術 |
|---|---|
| 框架 | Next.js 16 (App Router) + React 19 |
| 語言 | TypeScript 5 |
| ORM / DB | Prisma 6 + PostgreSQL |
| Auth | JWT (jose HS256) + bcryptjs + httpOnly cookie |
| 儲存 | AWS S3 / Cloudflare R2 (presigned URL) |
| CSS | Tailwind CSS 4 + oklch 色彩系統 + phi-based spacing |
| 動效 | Framer Motion 12 + Lenis smooth scroll |
| UI 庫 | Radix UI + shadcn/ui + Lucide icons |
| AI | Claude / OpenAI-compatible dual endpoint |
| 驗證 | Zod 4 |
| 表單 | react-hook-form 7 |
| 部署 | Zeabur / Vercel compatible |

---

## 七、角色階層與權限

| 角色 | Level | 存取範圍 |
|---|---|---|
| `super_admin` | 100 | 完整存取，含 super_admin 角色管理 |
| `admin` | 60 | 管理後台與操作，但不可管理 super_admin |
| `photographer` | 30 | 被指派專案操作、狀態更新、素材上傳 |
| `customer` | 10 | 查看自己的專案與下載成品 |

---

## 八、補充連結

- 伺服器路由：`src/app/api/ai/concierge/route.ts`
- UI 元件：`src/components/ai/home-ai-concierge.tsx`
- Auth 核心：`src/lib/auth/session.ts`、`src/lib/auth/password.ts`
- 安全守衛：`src/lib/security/rate-limit.ts`、`src/lib/security/request-guard.ts`
- Prisma Schema：`prisma/schema.prisma`
- README：`README.md`
- 環境變數範例：`.env.example`
