import type { AuthSession } from "@/lib/auth/session";
import type { RoleKey } from "@/lib/auth/constants";
import { prisma } from "@/lib/prisma";

export function hasRole(session: AuthSession | null, roles: RoleKey[]): boolean {
  if (!session) {
    return false;
  }

  return roles.some((role) => session.roles.includes(role));
}

export async function canAccessProject(session: AuthSession, projectId: string): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      clientUserId: true,
      members: {
        where: { userId: session.userId },
        select: { id: true },
      },
    },
  });

  if (!project) {
    return false;
  }

  if (hasRole(session, ["admin", "super_admin"])) {
    return true;
  }

  if (session.roles.includes("customer") && project.clientUserId === session.userId) {
    return true;
  }

  if (session.roles.includes("photographer") && project.members.length > 0) {
    return true;
  }

  return false;
}
