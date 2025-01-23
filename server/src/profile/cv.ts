import { S3Client } from 'bun';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { Result } from 'typescript-result';
import { z } from 'zod';
import { apiLogger } from '../logger';
import type { Context } from 'hono';

const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB

export const s3client = new S3Client({
  accessKeyId: process.env.STORAGE_ACCESS_KEY,
  secretAccessKey: process.env.STORAGE_SECRET_KEY,
  bucket: process.env.STORAGE_BUCKET,
  endpoint: process.env.STORAGE_ENDPOINT
});

export const cvValidator = z
  .object({
    cv: z.instanceof(File)
  })
  .strict();

type UploadError = {
  message: string;
  status: ContentfulStatusCode;
};

export const uploadCv = async (
  ctx: Context,
  cv: File,
  userId: string
): Promise<Result<number, UploadError>> => {
  // check restrictions
  if (cv.type !== 'application/pdf') {
    return Result.error({
      message: 'Invalid file type.',
      status: 415
    });
  }

  if (cv.size > MAX_PDF_SIZE) {
    return Result.error({
      message: 'File is too large. Max size is 5MB.',
      status: 413
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    return Result.ok(0);
  }

  const s3file = s3client.file(userId);

  let bytes: number;
  try {
    bytes = await s3file.write(cv, {
      type: 'application/pdf'
    });
  } catch (e: any) {
    apiLogger.error(ctx, 'uploadCv', e.message);
    return Result.error({ message: 'Failed to upload file', status: 500 });
  }

  return Result.ok(bytes);
};
