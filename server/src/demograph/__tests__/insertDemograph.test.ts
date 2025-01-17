import { beforeEach, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { sql } from 'drizzle-orm';
import { demograph } from '../schema';
import { insertDemographicData } from '../external';

beforeEach(async () => {
  await db.execute(sql`TRUNCATE ${demograph}`);
});

describe('insertDemographicData', () => {
  test('should insert a new demographic data', async () => {
    // Arrange
    const data = {
      courseOfStudy: 'Computer Science',
      yearOfStudy: 3,
      tShirtSize: 'L',
      age: 20,
      gender: 'male'
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
      yearOfStudy: 3,
      gender: 'male'
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
      yearOfStudy: 3,
      gender: 'male',
      age: 5
    } as const;

    const result = await insertDemographicData(data);
    expect(result.isError()).toBeTrue();
    expect(result.error).toBe(400);

    const insertedDemograph = await db.select().from(demograph);

    expect(insertedDemograph).toHaveLength(0);
  });

  test('reject negative year of study', async () => {
    // Arrange
    const data = {
      courseOfStudy: 'Computer Science',
      yearOfStudy: -1,
      gender: 'nb',
      age: 19
    } as const;

    const result = await insertDemographicData(data);
    expect(result.isError()).toBeTrue();
    expect(result.error).toBe(400);

    const insertedDemograph = await db.select().from(demograph);

    expect(insertedDemograph).toHaveLength(0);
  });
});
