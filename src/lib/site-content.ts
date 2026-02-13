export type NavItem = {
  href: string;
  label: string;
};

export type CaseStudy = {
  slug: string;
  category: string;
  name: string;
  subtitle: string;
  heroImage: string;
  summary: string;
  outcomes: string[];
  scope: string[];
  gallery: string[];
};

export type BrandPartner = {
  name: string;
  logo: string;
};

export const siteName = "Studio Pro";

export const navItems: NavItem[] = [
  { href: "/", label: "首頁" },
  { href: "/portfolio", label: "作品集" },
  { href: "/booking", label: "預約" },
  { href: "/materials", label: "素材包" },
];

export const heroStats = [
  { label: "完成專案", value: "340+" },
  { label: "平均滿意度", value: "4.9/5" },
  { label: "平均回覆時間", value: "<4h" },
];

export const serviceCards = [
  {
    tag: "婚禮紀實",
    title: "婚禮故事建築師",
    body: "雙機拍攝、光影編排、情緒捕捉——為您的全日婚禮敘事量身打造殿堂級影像。",
    points: ["十二小時全程紀錄", "藝術指導人像寫真", "七日內優先預覽交付"],
  },
  {
    tag: "品牌形象",
    title: "商業視覺策略系統",
    body: "從官網、社群廣告到媒體素材，一次製作即完成全通路視覺佈局。",
    points: ["創意企劃提案", "拍攝清單與動態短片", "跨平台輸出素材包"],
  },
  {
    tag: "肖像攝影",
    title: "權威形象，不落俗套",
    body: "依據角色定位、品牌調性與投放渠道，塑造專業且一致的領袖形象。",
    points: ["場景與造型指導", "現場即時精選", "品牌色彩校準"],
  },
];

export const processSteps = [
  {
    step: "01",
    title: "需求探索",
    body: "收集商業目標、投放渠道、時程與限制條件，每筆諮詢皆轉化為結構化專案紀錄。",
  },
  {
    step: "02",
    title: "創意藍圖",
    body: "情緒板、場景語言與鏡位規劃經核准後方進行排程，絕不倚賴臨場發揮。",
  },
  {
    step: "03",
    title: "合約與訂金",
    body: "數位合約載明交付項目、修圖範圍與付款時程，一切透明公開。",
  },
  {
    step: "04",
    title: "拍攝製作日",
    body: "角色分工明確執行：創意總監、製片、燈光師與攝影師即時品質監控。",
  },
  {
    step: "05",
    title: "後期製作",
    body: "色彩管理工作流程、精緻修圖、網頁 / 社群 / 印刷多版本輸出。",
  },
  {
    step: "06",
    title: "交付與回顧",
    body: "透過客戶專屬入口交付成品，建立檔案策略，並以專案回顧會議規劃下一次合作。",
  },
];

export const systemRows = [
  {
    module: "客戶開發",
    stack: "官網表單 + Line OA",
    owner: "客戶成功部",
    kpi: "有效諮詢率",
  },
  {
    module: "銷售管線",
    stack: "HubSpot CRM",
    owner: "製片人",
    kpi: "諮詢至通話轉換率",
  },
  {
    module: "排程管理",
    stack: "Calendly + 行事曆",
    owner: "專案經理",
    kpi: "爽約率低於 8%",
  },
  {
    module: "提案與合約",
    stack: "PandaDoc",
    owner: "商務負責人",
    kpi: "提案接受率",
  },
  {
    module: "金流管理",
    stack: "Stripe + 銀行轉帳",
    owner: "財務部",
    kpi: "訂金結清時效",
  },
  {
    module: "成品交付",
    stack: "Pixieset + 雲端封存",
    owner: "後製團隊",
    kpi: "準時交付率",
  },
];

export const caseStudies: CaseStudy[] = [
  {
    slug: "grand-ballroom-wedding",
    category: "婚禮紀實",
    name: "頂級宴會廳婚禮",
    subtitle: "十二小時不間斷的情感敘事紀錄",
    summary:
      "高密度場地搭配嚴格時程，要求同時兼顧電影級敘事與精準的現場調度。",
    heroImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80",
    outcomes: [
      "客戶滿分好評，60 天內獲得 9 組直接推薦",
      "72 小時內交付優先預覽組圖，即時社群發布",
      "完整圖庫含跨裝置最佳化輸出",
    ],
    scope: [
      "拍攝前與家族進行流程對接",
      "雙機拍攝 + 專屬燈光助理",
      "180 張精修成品 + 社群直式裁切套組",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    slug: "skincare-launch-campaign",
    category: "品牌形象",
    name: "保養品牌上市企劃",
    subtitle: "涵蓋官網、廣告與零售通路的完整視覺工具組",
    summary:
      "客戶需要在兩週內完成產品特寫、創辦人肖像與付費媒體的全套上市視覺。",
    heroImage:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1800&q=80",
    outcomes: [
      "九個日曆天內交付 62 件視覺素材",
      "付費社群廣告點擊率提升 28%",
      "視覺語言延續應用於三條產品線",
    ],
    scope: [
      "品牌色彩匹配場景設計",
      "單日製作 + 模組化鏡位編排",
      "電商與廣告平台多比例輸出",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    slug: "executive-portrait-series",
    category: "肖像攝影",
    name: "金融科技領袖系列",
    subtitle: "為 12 位高階主管打造的權威形象識別",
    summary:
      "協助跨國金融集團在重塑品牌識別期間，為其核心領導團隊建立一致、專業且具備人文溫度的肖像庫。",
    heroImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1800&q=80",
    outcomes: [
      "提升 LinkedIn 企業頁面專業度，瀏覽量增長 45%",
      "統一全球分公司視覺標準，建立拍攝規範白皮書",
      "媒體採訪與公關活動無需再臨時調度照片",
    ],
    scope: [
      "兩日高效率拍攝，平均每位主管僅需 30 分鐘",
      "專業妝髮團隊全程跟場",
      "黑白與彩色雙版本交付，適應不同媒體需求",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    slug: "tech-conference-2025",
    category: "活動紀錄",
    name: "未來科技峰會 2025",
    subtitle: "千人規模盛會的即時影像傳輸",
    summary:
      "在三天議程中，即時捕捉主舞台演講、分組論壇與社交晚宴的精彩瞬間，並支援媒體中心即時發稿需求。",
    heroImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1800&q=80",
    outcomes: [
      "活動期間社群媒體互動率創歷年新高",
      "官方新聞稿配圖於活動結束後 1 小時內全數備齊",
      "建立完整的活動影像資料庫，供明年行銷使用",
    ],
    scope: [
      "四機位同步作業，覆蓋所有關鍵場域",
      "現場修圖師即時調色與上傳",
      "每日精華短影片剪輯與交付",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d43f703fb8f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1400&q=80",
    ],
  },
];

export const testimonials = [
  {
    quote:
      "就像與一間頂尖創意公司合作——回覆速度、藝術指導與交付紀律都令人驚艷。",
    author: "林雅婷",
    role: "行銷總監，Calm & Co.",
  },
  {
    quote:
      "他們將模糊的品牌概念轉化為即用型的上市素材，完全沒有一般製作的混亂感。",
    author: "許承翰",
    role: "創辦人，Derma Ritual",
  },
  {
    quote:
      "團隊展現了極高的專業素養，即使在壓力巨大的活動現場也能保持冷靜與精準。",
    author: "張志偉",
    role: "活動策劃人，TechFuture",
  },
  {
    quote:
      "肖像照的效果超出預期，不僅展現了專業形象，更捕捉到了每位主管的獨特個性。",
    author: "陳怡君",
    role: "人資長，Global FinTech",
  },
];

export const brandPartners: BrandPartner[] = [
  { name: "Aurora Labs", logo: "/brands/aurora-labs.svg" },
  { name: "Mira Group", logo: "/brands/mira-group.svg" },
  { name: "Northline", logo: "/brands/northline.svg" },
  { name: "Vanta House", logo: "/brands/vanta-house.svg" },
  { name: "Elevate Media", logo: "/brands/elevate-media.svg" },
  { name: "Koi Atelier", logo: "/brands/koi-atelier.svg" },
];
