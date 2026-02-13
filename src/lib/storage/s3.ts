import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY &&
      process.env.S3_SECRET_KEY &&
      process.env.S3_REGION,
  );
}

function getS3Client() {
  return new S3Client({
    region: requiredEnv("S3_REGION"),
    endpoint: requiredEnv("S3_ENDPOINT"),
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: requiredEnv("S3_ACCESS_KEY"),
      secretAccessKey: requiredEnv("S3_SECRET_KEY"),
    },
  });
}

export function getDefaultBucket(): string {
  return requiredEnv("S3_BUCKET");
}

export async function createUploadUrl({
  bucket,
  objectKey,
  contentType,
}: {
  bucket: string;
  objectKey: string;
  contentType: string;
}) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: contentType,
  });

  return getSignedUrl(getS3Client(), command, { expiresIn: 60 * 10 });
}

export async function createDownloadUrl({ bucket, objectKey }: { bucket: string; objectKey: string }) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  });

  return getSignedUrl(getS3Client(), command, { expiresIn: 60 * 10 });
}

export function buildAssetObjectKey(projectId: string, filename: string): string {
  const sanitized = filename.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  return `projects/${projectId}/${Date.now()}-${sanitized}`;
}
