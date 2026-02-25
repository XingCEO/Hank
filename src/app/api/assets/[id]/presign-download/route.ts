import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/request";
import { canAccessProject } from "@/lib/auth/authorization";
import { createDownloadUrl, isStorageConfigured } from "@/lib/storage/s3";
import { createAuditLog } from "@/lib/audit";
import { getClientIpFromRequest } from "@/lib/security/request-guard";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  const auth = await requireSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { session } = auth;
  const { id } = await context.params;

  const asset = await prisma.asset.findUnique({
    where: { id },
    select: {
      id: true,
      projectId: true,
      bucket: true,
      objectKey: true,
      mime: true,
      type: true,
      createdAt: true,
    },
  });

  if (!asset) {
    return NextResponse.json({ ok: false, message: "找不到素材" }, { status: 404 });
  }

  const allowed = await canAccessProject(session, asset.projectId);
  if (!allowed) {
    return NextResponse.json({ ok: false, message: "無權限下載此素材" }, { status: 403 });
  }

  if (!isStorageConfigured()) {
    return NextResponse.json({ ok: false, message: "儲存服務尚未設定（S3/R2）" }, { status: 501 });
  }

  const downloadUrl = await createDownloadUrl({
    bucket: asset.bucket,
    objectKey: asset.objectKey,
  });

  await createAuditLog({
    actorUserId: session.userId,
    action: "asset.presign-download",
    resourceType: "asset",
    resourceId: asset.id,
    payload: { projectId: asset.projectId },
    ip: getClientIpFromRequest(req),
  });

  return NextResponse.json({
    ok: true,
    asset,
    downloadUrl,
  });
}
