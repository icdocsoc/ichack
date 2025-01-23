import { beforeEach, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { sql } from 'drizzle-orm';
import { demograph, tShirtSizes } from '../schema';
import { insertDemographicData } from '../external';

beforeEach(async () => {
  await db.execute(sql`TRUNCATE ${demograph}`);
});

describe('insertDemographicData', () => {
  test('should insert a new demographic data', async () => {
    // Arrange
    const data = {
      courseOfStudy: 'Computer Science',
      yearOfStudy: 'Undergraduate Year 3',
      tShirtSize: 'L',
      age: 20,
      gender: 'Male'
    } as const;

    const result = await insertDemographicData(data);
    expect(result.isOk()).toBeTrue();

    const insertedDemograph = await db.select().from(demograph);

    expect(insertedDemograph).toHaveLength(1);
    expect(insertedDemograph[0]).toMatchObject(data);
  });

  test('should insert data with missing fields', async () => {
    // Arrange
    const data = {
      courseOfStudy: 'Computer Science',
      yearOfStudy: 'Undergraduate Year 3',
      gender: 'Male',
      tShirtSize: 'M'
    } as const;

    const result = await insertDemographicData(data);
    expect(result.isOk()).toBeTrue();

    const insertedDemograph = await db.select().from(demograph);

    expect(insertedDemograph).toHaveLength(1);
    expect(insertedDemograph[0]).toMatchObject(data);
  });

  test('reject age under 18', async () => {
    // Arrange
    const data = {
      courseOfStudy: 'Computer Science',
      yearOfStudy: 'Undergraduate Year 3',
      gender: 'Male',
      tShirtSize: 'S',
      age: 5
    } as const;

    const result = await insertDemographicData(data);
    expect(result.isError()).toBeTrue();
    expect(result.error).toBe(400);

    const insertedDemograph = await db.select().from(demograph);

    expect(insertedDemograph).toHaveLength(0);
  });

  test('t-shirt size is required', async () => {
    const data = {
      courseOfStudy: 'Computer Science',
      yearOfStudy: 'Undergraduate Year 2',
      gender: 'Non-binary',
      age: 19
    } as const;

    // @ts-expect-error We're testing the error :>
    const result = await insertDemographicData(data);
    expect(result.isError()).toBeTrue();
    expect(result.error).toBe(400);

    const insertedDemograph = await db.select().from(demograph);

    expect(insertedDemograph).toHaveLength(0);
  });
});
