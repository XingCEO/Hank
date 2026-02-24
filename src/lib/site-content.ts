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
  { href: "/", label: "品牌旗艦" },
  { href: "/portfolio", label: "作品集" },
  { href: "/services", label: "服務" },
  { href: "/materials", label: "素材包" },
  { href: "/auth", label: "會員" },
];

export const heroStats = [
  { label: "完成專案", value: "520+" },
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
  {
    tag: "活動紀錄",
    title: "高規格活動影像系統",
    body: "從論壇、發表會到內部峰會，以多機位與即時交付流程支援公關與媒體節奏。",
    points: ["多場域同步拍攝", "即時修圖與媒體投放", "活動精華短影音交付"],
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
      "婚禮後續謝卡與電子喜帖版本同步輸出",
    ],
    scope: [
      "拍攝前與家族進行流程對接",
      "雙機拍攝 + 專屬燈光助理",
      "180 張精修成品 + 社群直式裁切套組",
      "儀式、宴客與類婚紗三階段調度表",
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
      "門市 POP 與官網首屏同步更新上線",
    ],
    scope: [
      "品牌色彩匹配場景設計",
      "單日製作 + 模組化鏡位編排",
      "電商與廣告平台多比例輸出",
      "上市檔期倒數素材分批交付機制",
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
      "HR 招募頁面轉換率提升，履歷投遞穩定成長",
    ],
    scope: [
      "兩日高效率拍攝，平均每位主管僅需 30 分鐘",
      "專業妝髮團隊全程跟場",
      "黑白與彩色雙版本交付，適應不同媒體需求",
      "團隊分批進棚與現場即選，縮短決策時間",
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
      "媒體合作夥伴可即時下載授權圖庫",
    ],
    scope: [
      "四機位同步作業，覆蓋所有關鍵場域",
      "現場修圖師即時調色與上傳",
      "每日精華短影片剪輯與交付",
      "主視覺、講者肖像與品牌牆模板統一化",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d43f703fb8f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    slug: "resort-destination-wedding",
    category: "婚禮紀實",
    name: "海島目的地婚禮",
    subtitle: "三日目的地行程的敘事影像製作",
    summary:
      "為跨國家庭設計目的地婚禮影像流程，兼顧儀式感、旅拍氛圍與雙語親友溝通節奏。",
    heroImage:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1800&q=80",
    outcomes: [
      "完整覆蓋迎賓晚宴、正婚禮與翌日 After Party",
      "交付後一週內社群貼文互動率提升 2.2 倍",
      "跨國家族成員可透過雲端相簿同步下載",
      "婚禮企劃公司將本案列為年度示範專案",
    ],
    scope: [
      "目的地踩點與黃金時段動線規劃",
      "雙攝影師 + 一位動態攝影同步作業",
      "旅拍與儀式鏡位分組，避免流程互相干擾",
      "雲端加密交付與賓客分享權限分層",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    slug: "jewelry-editorial-campaign",
    category: "產品攝影",
    name: "珠寶品牌年度形象",
    subtitle: "高反光材質與細節工藝的商業化呈現",
    summary:
      "聚焦珠寶工藝細節與高端品牌語彙，輸出官網、電商與百貨視覺所需的全規格素材。",
    heroImage:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=80",
    outcomes: [
      "雙檔期廣告素材一次備齊，縮短採購溝通周期",
      "產品頁停留時間提升 31%",
      "百貨快閃活動視覺沿用率達 100%",
      "社群 Reels 素材完整覆蓋四週上稿需求",
    ],
    scope: [
      "微距鏡頭與偏振控光處理金屬反光",
      "模特與純產品雙線拍攝腳本",
      "橫式、直式與方形版本一次輸出",
      "依平台規範提供廣告安全字距與裁切區",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    slug: "medical-aesthetic-rebrand",
    category: "品牌形象",
    name: "醫美診所品牌重塑",
    subtitle: "從專業感到親和力兼具的品牌升級專案",
    summary:
      "針對診所品牌重塑，建置醫師團隊肖像、空間情境照與療程內容視覺，支援官網改版與投放。",
    heroImage:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1800&q=80",
    outcomes: [
      "官網改版後諮詢表單填寫率提升 36%",
      "投放素材在醫療類廣告審核一次通過率提高",
      "診所內外一致化視覺提升品牌識別度",
      "季度活動檔期素材可重複組合使用",
    ],
    scope: [
      "醫師肖像、療程示意與空間氛圍整合拍攝",
      "合規審查版本與行銷版本雙軌輸出",
      "網站 Banner 與社群素材模板化交付",
      "月度檔期維運的素材命名與版本規範",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    slug: "startup-office-culture-series",
    category: "商業紀實",
    name: "新創團隊文化影像計畫",
    subtitle: "招募、PR 與內部品牌一致化素材庫",
    summary:
      "為高速成長新創建立團隊文化影像，覆蓋辦公情境、產品開發流程與管理層訪談肖像。",
    heroImage:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1800&q=80",
    outcomes: [
      "招募頁面瀏覽到投遞轉換率提升 24%",
      "媒體採訪可即時提供高品質企業形象照",
      "年度股東簡報與品牌手冊視覺一致",
      "跨部門共享素材降低重複委外成本",
    ],
    scope: [
      "辦公室紀實、產品團隊與主管肖像三線並行",
      "採訪式導演引導提升人物表情自然度",
      "為網站、簡報與社群建立專屬裁切規格",
      "季度追加拍攝可直接沿用同一視覺語言",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
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
