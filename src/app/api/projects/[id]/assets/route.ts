import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessProject, hasRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/request";
import { ASSET_TYPES } from "@/lib/auth/constants";
import { createAuditLog } from "@/lib/audit";
import { getDefaultBucket, isStorageConfigured } from "@/lib/storage/s3";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

const createAssetSchema = z.object({
  type: z.enum(ASSET_TYPES),
  bucket: z.string().min(1).max(120),
  objectKey: z.string().min(1).max(512),
  mime: z.string().min(1).max(120),
  size: z.number().int().positive().max(500 * 1024 * 1024),
  checksum: z.string().max(128).optional(),
});

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseTake(searchParams: URLSearchParams): number {
  const raw = Number(searchParams.get("take") ?? 50);
  if (!Number.isFinite(raw)) {
    return 50;
  }
  return Math.min(200, Math.max(1, Math.floor(raw)));
}

export async function GET(req: Request, context: RouteContext) {
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

  const url = new URL(req.url);
  const take = parseTake(url.searchParams);
  const cursor = url.searchParams.get("cursor");

  const assets = await prisma.asset.findMany({
    where: { projectId: id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      uploader: {
        select: { id: true, name: true, email: true },
      },
    },
    take: take + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  });

  const hasMore = assets.length > take;
  const page = hasMore ? assets.slice(0, take) : assets;
  const nextCursor = hasMore ? page[page.length - 1]?.id : null;

  return NextResponse.json({ ok: true, assets: page, pagination: { take, nextCursor } });
}

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
    return NextResponse.json({ ok: false, message: "Only admin or photographer can create assets." }, { status: 403 });
  }

  try {
    const body = createAssetSchema.parse(await req.json());

    if (isStorageConfigured()) {
      const defaultBucket = getDefaultBucket();
      if (body.bucket !== defaultBucket) {
        return NextResponse.json({ ok: false, message: "Bucket does not match configured storage bucket." }, { status: 400 });
      }
    }

    if (!body.objectKey.startsWith(`projects/${id}/`) || body.objectKey.includes("..")) {
      return NextResponse.json({ ok: false, message: "Invalid object key path." }, { status: 400 });
    }

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
      ip: getClientIpFromRequest(req),
    });

    return NextResponse.json({ ok: true, asset }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "Invalid asset payload." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Failed to create asset." }, { status: 500 });
  }
}
