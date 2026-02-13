import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CreateAuditLogParams = {
  actorUserId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  payload?: Prisma.InputJsonValue;
  ip?: string;
};

export async function createAuditLog({
  actorUserId,
  action,
  resourceType,
  resourceId,
  payload,
  ip,
}: CreateAuditLogParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorUserId,
      action,
      resourceType,
      resourceId,
      payloadJson: payload,
      ip,
    },
  });
}
