export type NavigationLink = {
  href: string;
  label: string;
};

export const primaryNavigation: NavigationLink[] = [
  { href: "/", label: "首頁" },
  { href: "/portfolio", label: "作品集" },
  { href: "/booking", label: "預約" },
  { href: "/materials", label: "素材包" },
  { href: "/auth", label: "會員" },
];

export const footerStudioLinks: NavigationLink[] = [
  { href: "/services", label: "服務項目" },
  { href: "/pricing", label: "方案價格" },
  { href: "/process", label: "工作流程" },
  { href: "/systems", label: "營運系統" },
];

export const footerWorkLinks: NavigationLink[] = [
  { href: "/portfolio", label: "案例庫" },
  { href: "/team", label: "團隊" },
  { href: "/contact", label: "聯絡我們" },
  { href: "/booking", label: "預約檔期" },
];
