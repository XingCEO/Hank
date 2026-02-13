import { z } from "zod";
import { NextResponse } from "next/server";
import { canAccessProject, hasRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/request";
import { ASSET_TYPES } from "@/lib/auth/constants";
import { buildAssetObjectKey, createUploadUrl, getDefaultBucket, isStorageConfigured } from "@/lib/storage/s3";

const presignUploadSchema = z.object({
  fileName: z.string().min(1, "fileName 不可空白"),
  contentType: z.string().min(1, "contentType 不可空白"),
  type: z.enum(ASSET_TYPES),
});

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  const auth = await requireSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { session } = auth;
  const { id } = await context.params;

  const allowed = await canAccessProject(session, id);
  if (!allowed) {
    return NextResponse.json({ ok: false, message: "無權限存取此專案" }, { status: 403 });
  }

  if (!hasRole(session, ["admin", "super_admin", "photographer"])) {
    return NextResponse.json({ ok: false, message: "只有管理員/攝影師可取得上傳連結" }, { status: 403 });
  }

  if (!isStorageConfigured()) {
    return NextResponse.json({ ok: false, message: "儲存服務尚未設定（S3/R2）" }, { status: 501 });
  }

  try {
    const body = presignUploadSchema.parse(await req.json());
    const bucket = getDefaultBucket();
    const objectKey = buildAssetObjectKey(id, body.fileName);
    const uploadUrl = await createUploadUrl({
      bucket,
      objectKey,
      contentType: body.contentType,
    });

    return NextResponse.json({
      ok: true,
      uploadUrl,
      bucket,
      objectKey,
      assetType: body.type,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "上傳參數有誤" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "取得上傳連結失敗" }, { status: 500 });
  }
}
