import { z } from "zod";
import { NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

type SuggestionLink = {
  label: string;
  href: string;
};

type ConciergeAnswer = {
  reply: string;
  links?: SuggestionLink[];
};

const askSchema = z.object({
  message: z.string().trim().min(1, "請先輸入問題。"),
});

const KNOWLEDGE_BASE: Array<{
  keywords: string[];
  answer: ConciergeAnswer;
}> = [
  {
    keywords: ["價格", "費用", "報價", "多少錢", "方案"],
    answer: {
      reply:
        "如果你要先看方案區間，建議先到價格頁。若要精準報價，建議直接預約諮詢，我們會依拍攝類型、時程與交付需求報價。",
      links: [
        { label: "查看價格方案", href: "/pricing" },
        { label: "預約諮詢", href: "/booking" },
      ],
    },
  },
  {
    keywords: ["預約", "排程", "檔期", "時間", "booking"],
    answer: {
      reply:
        "你可以直接到預約頁挑服務與時段，送出後我們會盡快確認。若是企業專案，也可以先聯繫我們安排需求訪談。",
      links: [
        { label: "前往預約頁", href: "/booking" },
        { label: "聯絡我們", href: "/contact" },
      ],
    },
  },
  {
    keywords: ["服務", "拍攝", "能拍什麼", "提供什麼"],
    answer: {
      reply:
        "我們提供商業形象、品牌素材、企業活動與人像等拍攝服務，並可搭配後製與交付流程。你可以先看服務頁快速比對需求。",
      links: [{ label: "查看服務內容", href: "/services" }],
    },
  },
  {
    keywords: ["作品", "案例", "portfolio", "風格"],
    answer: {
      reply:
        "若你想確認風格與成果，建議先看作品集與案例頁。你也可以告訴我偏好的風格，我可以幫你先整理方向。",
      links: [
        { label: "瀏覽作品集", href: "/portfolio" },
        { label: "看案例", href: "/cases/grand-ballroom-wedding" },
      ],
    },
  },
  {
    keywords: ["登入", "註冊", "會員", "帳號", "portal"],
    answer: {
      reply:
        "會員可從登入頁進入。登入後會依你的角色導向對應入口（會員／攝影師／管理後台）。",
      links: [{ label: "前往登入註冊", href: "/auth" }],
    },
  },
  {
    keywords: ["管理", "admin", "權限", "後台"],
    answer: {
      reply:
        "管理後台提供會員權限、會員等級、密碼管理與稽核紀錄。需具備 admin 或 super_admin 角色才可存取。",
      links: [{ label: "進入管理後台", href: "/admin" }],
    },
  },
  {
    keywords: ["流程", "交件", "多久", "時程", "交付"],
    answer: {
      reply:
        "一般流程是需求確認、拍攝執行、後製修整、檔案交付。實際時程會依案件規模調整，急件可先說明需求。",
      links: [
        { label: "查看流程", href: "/process" },
        { label: "立即諮詢", href: "/contact" },
      ],
    },
  },
];

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function pickBestAnswer(message: string): ConciergeAnswer {
  const normalized = message.toLowerCase();
  const tokens = new Set(tokenize(normalized));

  let bestScore = 0;
  let best: ConciergeAnswer | null = null;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of item.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        score += 3;
      }

      const keywordTokens = tokenize(keyword);
      for (const t of keywordTokens) {
        if (tokens.has(t)) {
          score += 1;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = item.answer;
    }
  }

  if (best) {
    return best;
  }

  return {
    reply:
      "我先幫你快速整理：你可以告訴我『預算範圍、拍攝類型、預計日期』，我就能更精準建議下一步。",
    links: [
      { label: "預約諮詢", href: "/booking" },
      { label: "聯絡我們", href: "/contact" },
    ],
  };
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blockedByOrigin = guardSameOrigin(req);
  if (blockedByOrigin) {
    return blockedByOrigin;
  }

  const ip = getClientIpFromRequest(req) ?? "unknown";
  const rateLimit = consumeRateLimit({
    key: `ai:concierge:${ip}`,
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, message: "提問太頻繁，請稍後再試。" },
      { status: 429 },
    );
  }

  try {
    const body = askSchema.parse(await req.json());
    const answer = pickBestAnswer(body.message);

    return NextResponse.json({
      ok: true,
      reply: answer.reply,
      links: answer.links ?? [],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: error.issues[0]?.message ?? "問題格式錯誤。" },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: false, message: "AI 客服暫時無法回應。" }, { status: 500 });
  }
}
