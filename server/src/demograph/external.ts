import { newDemographSchema, demograph } from './schema';
import { z } from 'zod';
import { db } from '../drizzle';
import { Result } from 'typescript-result';
import type { StatusCode } from 'hono/utils/http-status';

export const insertDemographicData = async (
  data: z.infer<typeof newDemographSchema>
): Promise<Result<void, StatusCode>> => {
  const validation = await newDemographSchema.safeParseAsync(data);
  if (!validation.success) {
    return Result.error(400);
  }

  await db.insert(demograph).values(data);
  return Result.ok();
};
