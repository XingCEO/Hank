import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

function loadEnvFromDotFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalIndex = trimmed.indexOf("=");
    if (equalIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, equalIndex).trim();
    if (!key || process.env[key]) {
      continue;
    }

    let value = trimmed.slice(equalIndex + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFromDotFile();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Please set it in .env or environment variables.");
  process.exit(1);
}

const prisma = new PrismaClient();

const email = (process.env.BOOTSTRAP_ADMIN_EMAIL ?? "owner@studio.local").trim().toLowerCase();
const name = (process.env.BOOTSTRAP_ADMIN_NAME ?? "Studio Owner").trim();

const providedPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD?.trim();
const password =
  providedPassword && providedPassword.length > 0
    ? providedPassword
    : `Admin1!${randomBytes(9).toString("base64url")}`;

if (!email || !email.includes("@")) {
  console.error("Invalid BOOTSTRAP_ADMIN_EMAIL.");
  process.exit(1);
}

function validatePasswordPolicy(rawPassword) {
  if (rawPassword.length < 12) {
    return "BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.";
  }
  if (rawPassword.length > 128) {
    return "BOOTSTRAP_ADMIN_PASSWORD must be at most 128 characters.";
  }
  if (!/[a-z]/.test(rawPassword)) {
    return "BOOTSTRAP_ADMIN_PASSWORD must include at least one lowercase letter.";
  }
  if (!/[A-Z]/.test(rawPassword)) {
    return "BOOTSTRAP_ADMIN_PASSWORD must include at least one uppercase letter.";
  }
  if (!/\d/.test(rawPassword)) {
    return "BOOTSTRAP_ADMIN_PASSWORD must include at least one number.";
  }
  if (!/[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]/.test(rawPassword)) {
    return "BOOTSTRAP_ADMIN_PASSWORD must include at least one special character.";
  }
  if (/\s/.test(rawPassword)) {
    return "BOOTSTRAP_ADMIN_PASSWORD cannot contain whitespace.";
  }
  return null;
}

const passwordPolicyError = validatePasswordPolicy(password);
if (passwordPolicyError) {
  console.error(passwordPolicyError);
  process.exit(1);
}

const ROLE_KEYS = ["super_admin"];

async function main() {
  for (const key of ["customer", "photographer", "admin", "super_admin"]) {
    await prisma.role.upsert({
      where: { key },
      update: {},
      create: { key, name: key },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      isActive: true,
    },
    create: {
      email,
      name,
      passwordHash,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  const roles = await prisma.role.findMany({
    where: { key: { in: [...ROLE_KEYS] } },
    select: { id: true, key: true },
  });

  if (roles.length !== ROLE_KEYS.length) {
    throw new Error("Failed to bootstrap super_admin role.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId: user.id } });
    await tx.userRole.createMany({
      data: roles.map((role) => ({
        userId: user.id,
        roleId: role.id,
      })),
    });
  });

  console.log("BOOTSTRAP_SUPER_ADMIN_OK");
  console.log(`email=${user.email}`);
  console.log(`name=${user.name}`);
  console.log(`password=${password}`);
  console.log("roles=super_admin");
}

main()
  .catch((error) => {
    console.error("BOOTSTRAP_SUPER_ADMIN_FAILED");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
