import { prisma } from "@/lib/prisma";

type CreateAuditLogParams = {
  actorUserId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  payload?: Record<string, unknown> | string | number | boolean;
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
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId,
        action,
        resourceType,
        resourceId,
        payloadJson: payload as never,
        ip,
      },
    });
  } catch (error) {
    // Audit logging should not break the primary business operation.
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to write audit log:", error);
    }
  }
}
