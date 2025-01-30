// post route successfully creates an entry in the database
// get route returns correct user profile
// simulate hacker scams differemt qr code throw 403
// simlulate volunteer scanninng hacker qr code also admin
// only god can delete qr code

//this means that you will need to insert users into the user table, their profiles into the profile table as well as sessions so they can access the routes

// ...existing code...
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { db } from '../../drizzle';
import { qrs } from '../schema';
import { createUserWithSession } from '../../testHelpers';
import { testClient } from 'hono/testing';
import app from '../../app';
import { eq, sql } from 'drizzle-orm';
import { roles, type Role } from '../../types';
import { users, userSession } from '../../auth/schema';
import { profiles, type UserAndProfile } from '../../profile/schema';

const sessionIds: Partial<Record<Role, string>> = {};
const userIds: Partial<Record<Role, string>> = {};

let hackerProfile: UserAndProfile;

const client = testClient(app);

beforeAll(async () => {
  // Reset QRs and insert test users
  await db.execute(sql`TRUNCATE ${qrs} CASCADE`);
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${profiles} CASCADE`);

  for (const role of roles) {
    const { userId, sessionId } = await createUserWithSession(role, {
      name: `${role.charAt(0).toUpperCase()}${role.slice(1)}`,
      email: `${role}@ic.ac.uk`,
      password: 'dontheckme'
    });

    sessionIds[role] = sessionId;
    userIds[role] = userId;
  }

  // Insert profiles
  hackerProfile = {
    id: userIds.hacker!,
    name: 'Hacker',
    email: 'hacker@ic.ac.uk',
    role: 'hacker',
    photos_opt_out: true,
    dietary_restrictions: [],
    cvUploaded: false,
    pronouns: 'they/them',
    meals: [false, false, false],
    discord_id: null
  };

  await db.insert(profiles).values(hackerProfile);
});

// POST
describe('QR Module > POST /', () => {
  beforeEach(async () => {
    await db.execute(sql`TRUNCATE ${qrs} CASCADE`);
  });

  test('post route successfully creates an entry in the database', async () => {
    const uuid = '00000000-0000-0000-0000-000000000071';
    const res = await client.qr.$post(
      {
        json: { uuid }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker!}`
        }
      }
    );
    expect(res.status).toBe(201);

    // Check that QR was created
    const qrInDb = await db.select().from(qrs).where(eq(qrs.uuid, uuid));
    // verify correct inserstion
    expect(qrInDb[0]!.userId).toBe(userIds.hacker!);
    expect(qrInDb[0]!.uuid).toBe(uuid);
  });

  test('user who already linked their account tries to link to another qr code', async () => {
    const uuid1 = '00000000-0000-0000-0000-000000000071';
    await db.insert(qrs).values({
      userId: userIds.hacker!,
      uuid: uuid1
    });

    const uuid2 = '00000000-0000-0000-0000-000000000072';
    const res = await client.qr.$post(
      {
        json: { uuid: uuid2 }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker!}`
        }
      }
    );
    expect(res.status).toBe(409);
    expect(res.text()).resolves.toBe(
      'QR code already linked to an account or user already linked to a QR code'
    );
  });

  test('errors out if two people attempt to link the same qr code', async () => {
    const uuid = '00000000-0000-0000-0000-000000000071';
    await db.insert(qrs).values({
      userId: userIds.hacker!,
      uuid
    });

    const { userId: hacker2Id, sessionId } = await createUserWithSession(
      'hacker',
      {
        name: 'Hacker2',
        email: 'hacker2@ic.ac.uk',
        password: 'dontheckme'
      }
    );
    await db.insert(profiles).values({
      id: hacker2Id,
      photos_opt_out: false,
      pronouns: 'they/them',
      dietary_restrictions: [],
      cvUploaded: false,
      meals: [false, false, false]
    });

    const res = await client.qr.$post(
      {
        json: { uuid }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionId}` // another hacker trying to use hacker qr code
        }
      }
    );
    expect(res.status).toBe(409);
    expect(res.text()).resolves.toBe(
      'QR code already linked to an account or user already linked to a QR code'
    );
  });

  test('unregistered user cannot link to a qr code', async () => {
    await db.delete(profiles).where(eq(profiles.id, userIds.hacker!)); // delete hacker profile

    const uuid = '00000000-0000-0000-0000-000000000071';
    const res = await client.qr.$post(
      {
        json: { uuid }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker!}`
        }
      }
    ); // attempt to link to qr code

    expect(res.status).toBe(409);
    expect(res.text()).resolves.toBe(
      'You have not registered yet. Please register first.'
    );

    // Check that QR was not created
    const qrInDb = await db.select().from(qrs).where(eq(qrs.uuid, uuid));
    expect(qrInDb.length).toBe(0);

    // Restore hacker profile
    await db.insert(profiles).values(hackerProfile);
  });
});

// GET (param)
describe('QR Module > GET /:uuid', () => {
  test('Everyone but hacker can scan any qr code to get the profile', async () => {
    await db.execute(sql`TRUNCATE ${qrs} CASCADE`);

    const insertedUuid = '00000000-0000-0000-0000-000000000071';
    await db.insert(qrs).values({
      userId: hackerProfile.id,
      uuid: insertedUuid
    });

    for (const role of roles) {
      const res = await client.qr[':uuid'].$get(
        {
          param: { uuid: insertedUuid }
        },
        {
          headers: {
            Cookie: `auth_session=${sessionIds[role]}`
          }
        }
      );

      if (role == 'hacker') {
        //@ts-ignore middleware returns 403
        expect(res.status).toBe(403);
      } else {
        expect(res.status).toBe(200);
        expect(res.json()).resolves.toEqual(hackerProfile);
      }
    }
  });
});

// DELETE
describe('QR Module > DELETE /:uuid', () => {
  test('No one but god can delete a qr entry', async () => {
    await db.execute(sql`TRUNCATE ${qrs} CASCADE`);

    const insertedUuid = '00000000-0000-0000-0000-000000000071';
    await db.insert(qrs).values({
      userId: hackerProfile.id,
      uuid: insertedUuid
    });

    for (const role of roles) {
      const res = await client.qr[':id'].$delete(
        {
          param: { id: hackerProfile.id }
        },
        {
          headers: {
            Cookie: `auth_session=${sessionIds[role]}`
          }
        }
      );

      if (role == 'god') {
        expect(res.status).toBe(200);

        const query = await db
          .select()
          .from(qrs)
          .where(eq(qrs.uuid, insertedUuid));
        expect(query.length).toBe(0);

        // Reinsert the qr code for the next test
        await db.insert(qrs).values({
          userId: hackerProfile.id,
          uuid: insertedUuid
        });
      } else {
        //@ts-ignore middleware returns 403
        expect(res.status).toBe(403);
      }
    }
  });
});
