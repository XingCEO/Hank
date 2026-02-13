import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessProject, hasRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/request";
import { ASSET_TYPES } from "@/lib/auth/constants";
import { createAuditLog } from "@/lib/audit";
import { getRequestIp } from "@/lib/auth/request";

const createAssetSchema = z.object({
  type: z.enum(ASSET_TYPES),
  bucket: z.string().min(1, "bucket 不可空白"),
  objectKey: z.string().min(1, "objectKey 不可空白"),
  mime: z.string().min(1, "mime 不可空白"),
  size: z.number().int().positive(),
  checksum: z.string().optional(),
});

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const auth = await requireSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { session } = auth;
  const { id } = await context.params;

  const allowed = await canAccessProject(session, id);
  if (!allowed) {
    return NextResponse.json({ ok: false, message: "無權限查看素材" }, { status: 403 });
  }

  const assets = await prisma.asset.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    include: {
      uploader: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json({ ok: true, assets });
}

export async function POST(req: Request, context: RouteContext) {
  const auth = await requireSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { session } = auth;
  const { id } = await context.params;
  const allowed = await canAccessProject(session, id);
  if (!allowed) {
    return NextResponse.json({ ok: false, message: "無權限寫入素材" }, { status: 403 });
  }

  if (!hasRole(session, ["admin", "super_admin", "photographer"])) {
    return NextResponse.json({ ok: false, message: "只有管理員/攝影師可上傳素材" }, { status: 403 });
  }

  try {
    const body = createAssetSchema.parse(await req.json());

    const asset = await prisma.asset.create({
      data: {
        projectId: id,
        uploaderId: session.userId,
        type: body.type,
        bucket: body.bucket,
        objectKey: body.objectKey,
        mime: body.mime,
        size: body.size,
        checksum: body.checksum,
      },
    });

    await createAuditLog({
      actorUserId: session.userId,
      action: "asset.create",
      resourceType: "asset",
      resourceId: asset.id,
      payload: {
        projectId: id,
        type: asset.type,
      },
      ip: await getRequestIp(),
    });

    return NextResponse.json({ ok: true, asset }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "素材資料格式錯誤" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "建立素材紀錄失敗" }, { status: 500 });
  }
}
