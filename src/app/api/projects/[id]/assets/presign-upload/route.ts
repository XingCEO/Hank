import { z } from "zod";
import { NextResponse } from "next/server";
import { canAccessProject, hasRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/request";
import { ASSET_TYPES } from "@/lib/auth/constants";
import { prisma } from "@/lib/prisma";
import { buildAssetObjectKey, createUploadUrl, getDefaultBucket, isStorageConfigured } from "@/lib/storage/s3";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { guardSameOrigin } from "@/lib/security/request-guard";

const presignUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().regex(/^[\w.+-]+\/[\w.+-]+$/),
  type: z.enum(ASSET_TYPES),
});

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  const blockedByOrigin = guardSameOrigin(req);
  if (blockedByOrigin) {
    return blockedByOrigin;
  }

  const auth = await requireSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { session } = auth;
  const { id } = await context.params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!project) {
    return NextResponse.json({ ok: false, message: "Project not found." }, { status: 404 });
  }

  const allowed = await canAccessProject(session, id);
  if (!allowed) {
    return NextResponse.json({ ok: false, message: "Forbidden." }, { status: 403 });
  }

  if (!hasRole(session, ["admin", "super_admin", "photographer"])) {
    return NextResponse.json({ ok: false, message: "Only admin or photographer can create upload URLs." }, { status: 403 });
  }

  if (!isStorageConfigured()) {
    return NextResponse.json({ ok: false, message: "Storage is not configured." }, { status: 501 });
  }

  const rateLimit = consumeRateLimit({
    key: `assets:presign:${session.userId}`,
    limit: 180,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, message: "Too many upload URL requests. Please try again later." }, { status: 429 });
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
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "Invalid upload request." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Failed to create upload URL." }, { status: 500 });
  }
}
