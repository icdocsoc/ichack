import { PKPass } from 'passkit-generator';
import { HTTPException } from 'hono/http-exception';
import { join } from 'path';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
// import { Provider, Notification } from 'node-apn';
import factory from '../factory';
import { db } from '../drizzle';
import { passes } from './schema';
import { randomBytes } from 'crypto';
import registrationRouter from 'hono-passkit-webservice/v1/registration.js';
import updateRouter from 'hono-passkit-webservice/v1/update.js';
import listRouter from 'hono-passkit-webservice/v1/list.js';
import logRouter from 'hono-passkit-webservice/v1/log.js';
import { devices, registrations } from './schema';
import { eq, and } from 'drizzle-orm';
import { showRoutes } from 'hono/dev';
import { logger } from 'hono/logger';
import { S3Client } from 'bun';
import { apiLogger } from '../logger';

const passRequestSchema = z.object({
  name: z.string(),
  role: z.string(),
  qrText: z.string()
});

const modelPath = join(process.cwd(), 'public/eventTicket.pass');

const secretsS3client = new S3Client({
  accessKeyId: process.env.STORAGE_ACCESS_KEY,
  secretAccessKey: process.env.STORAGE_SECRET_KEY,
  bucket: process.env.STORAGE_BUCKET_CERTS,
  endpoint: process.env.STORAGE_ENDPOINT
});

// S3 paths for certificates
const s3WwdrPath = 'apple-pkpass-certs/wwdr.pem';
const s3SignerCertPath = 'apple-pkpass-certs/signerCert.pem';
const s3SignerKeyPath = 'apple-pkpass-certs/signerKey.pem';
const s3AuthKeyPath = 'apple-pkpass-certs/AuthKey_7J73DA4YB2.p8';

// Function to fetch certificate from S3
async function getCertFromS3(path: string): Promise<Buffer> {
  const file = secretsS3client.file(path);
  const data = await file.arrayBuffer();
  return Buffer.from(data);
}

const PASS_TYPE_IDENTIFIER = 'pass.com.docsoc.ichack';
const TEAM_IDENTIFIER = 'J9U67VUZ53';
const WEB_SERVICE_URL = 'https://my.ichack.org/api/pass';

// Set up APNS provider
// let apnsProvider: Provider;

// Initialize APNS provider asynchronously
// async function initializeAPNS() {
//   const authKeyData = await getCertFromS3(s3AuthKeyPath);
//   apnsProvider = new Provider({
//     token: {
//       key: authKeyData,
//       keyId: '7J73DA4YB2',
//       teamId: TEAM_IDENTIFIER
//     },
//     production: true
//   });
// }

// Initialize APNS provider
// initializeAPNS().catch(console.error);

export const pass = factory
  .createApp()
  // Pass generation endpoint
  .post('/generate', zValidator('json', passRequestSchema), async c => {
    try {
      const body = c.req.valid('json');

      const serialNumber = randomBytes(16).toString('hex');
      const authenticationToken = randomBytes(32).toString('hex');

      // apiLogger.info(
      //   c,
      //   'pass.generate',
      //   `Generating new pass - serialNumber: ${serialNumber}, authToken: ${authenticationToken}`
      // );

      // Fetch certificates from S3
      const [wwdr, signerCert, signerKey] = await Promise.all([
        getCertFromS3(s3WwdrPath),
        getCertFromS3(s3SignerCertPath),
        getCertFromS3(s3SignerKeyPath)
      ]);

      const newPass = await PKPass.from(
        {
          model: modelPath,
          certificates: {
            wwdr,
            signerCert,
            signerKey,
            signerKeyPassphrase: 'ichack25'
          }
        },
        {
          authenticationToken,
          webServiceURL: WEB_SERVICE_URL,
          serialNumber,
          teamIdentifier: TEAM_IDENTIFIER,
          description: 'IC Hack Ticket',
          logoText: ' '
        }
      );

      newPass.secondaryFields.push(
        {
          key: 'secondary0',
          label: 'Name',
          value: body.name,
          textAlignment: 'PKTextAlignmentLeft'
        },
        {
          key: 'secondary1',
          label: 'Role',
          value: body.role,
          textAlignment: 'PKTextAlignmentRight'
        }
      );

      newPass.setBarcodes({
        message: body.qrText,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1'
      });

      // Store pass data including name and role
      await db.insert(passes).values({
        serialNumber,
        authenticationToken,
        passTypeIdentifier: PASS_TYPE_IDENTIFIER,
        updatedAt: new Date(),
        backFields: [] as string[],
        name: body.name,
        role: body.role,
        qrText: body.qrText
      });

      const bufferData = newPass.getAsBuffer();

      return new Response(bufferData, {
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': 'inline; filename="ichack25.pkpass"'
        }
      });
    } catch (error: unknown) {
      apiLogger.error(
        c,
        'pass.generate',
        `Failed to generate pass: ${(error as Error).message}`
      );
      throw new HTTPException(500, { message: (error as Error).message });
    }
  })
  // Web service endpoints
  .route(
    '/',
    registrationRouter({
      async onRegister(
        deviceLibraryIdentifier,
        passTypeIdentifier,
        serialNumber,
        pushToken
      ) {
        // console.log('Registration request received:', {
        //   deviceLibraryIdentifier,
        //   passTypeIdentifier,
        //   serialNumber,
        //   pushToken
        // });

        try {
          // Store device and registration
          await db
            .insert(devices)
            .values({
              deviceLibraryIdentifier,
              pushToken,
              updatedAt: new Date()
            })
            .onConflictDoUpdate({
              target: devices.deviceLibraryIdentifier,
              set: { pushToken, updatedAt: new Date() }
            });

          // console.log('Device stored/updated:', deviceLibraryIdentifier);

          await db
            .insert(registrations)
            .values({
              deviceLibraryIdentifier,
              serialNumber,
              updatedAt: new Date()
            })
            .onConflictDoUpdate({
              target: [
                registrations.deviceLibraryIdentifier,
                registrations.serialNumber
              ],
              set: { updatedAt: new Date() }
            });

          // console.log(
          //   'Registration stored/updated for device:',
          //   deviceLibraryIdentifier,
          //   'and pass:',
          //   serialNumber
          // );
          return true;
        } catch (error) {
          console.error('Failed to register device:', error);
          return false;
        }
      },
      async onUnregister(
        deviceLibraryIdentifier,
        passTypeIdentifier,
        serialNumber
      ) {
        // console.log('Unregistration request received:', {
        //   deviceLibraryIdentifier,
        //   passTypeIdentifier,
        //   serialNumber
        // });

        try {
          await db
            .delete(registrations)
            .where(
              and(
                eq(
                  registrations.deviceLibraryIdentifier,
                  deviceLibraryIdentifier
                ),
                eq(registrations.serialNumber, serialNumber)
              )
            );
          // console.log(
          //   'Registration deleted for device:',
          //   deviceLibraryIdentifier,
          //   'and pass:',
          //   serialNumber
          // );
        } catch (error) {
          console.error('Failed to unregister device:', error);
          throw error;
        }
      },
      async tokenVerifier(token) {
        // console.log('Verifying registration token:', token);
        // Verify the pass exists and auth token matches
        const [pass] = await db
          .select()
          .from(passes)
          .where(eq(passes.authenticationToken, token));
        const isValid = !!pass;
        // console.log('Registration token verification:', {
        //   token,
        //   passFound: !!pass,
        //   passDetails: pass
        //     ? {
        //         serialNumber: pass.serialNumber,
        //         authenticationToken: pass.authenticationToken
        //       }
        //     : null
        // });
        return isValid;
      }
    })
  )
  .route(
    '/',
    listRouter({
      async onListRetrieve(
        deviceLibraryIdentifier,
        passTypeIdentifier,
        filters
      ) {
        const passesForDevice = await db
          .select({ serialNumber: registrations.serialNumber })
          .from(registrations)
          .where(
            eq(registrations.deviceLibraryIdentifier, deviceLibraryIdentifier)
          );

        return {
          serialNumbers: passesForDevice.map(p => p.serialNumber),
          lastUpdated: new Date().toISOString()
        };
      }
    })
  )
  .route(
    '/',
    updateRouter({
      async onUpdateRequest(passTypeIdentifier, serialNumber) {
        // console.log('Update requested for pass:', serialNumber);

        const [pass] = await db
          .select()
          .from(passes)
          .where(eq(passes.serialNumber, serialNumber));
        // console.log('Found pass:', pass);

        if (!pass) {
          throw new Error('Pass not found');
        }

        // Generate updated pass with current backFields
        const newPass = await PKPass.from(
          {
            model: modelPath,
            certificates: {
              wwdr: await getCertFromS3(s3WwdrPath),
              signerCert: await getCertFromS3(s3SignerCertPath),
              signerKey: await getCertFromS3(s3SignerKeyPath),
              signerKeyPassphrase: 'ichack25'
            }
          },
          {
            serialNumber,
            authenticationToken: pass.authenticationToken,
            webServiceURL: WEB_SERVICE_URL,
            passTypeIdentifier: PASS_TYPE_IDENTIFIER,
            teamIdentifier: TEAM_IDENTIFIER,
            description: 'IC Hack Ticket',
            logoText: ' '
          }
        );

        // Add the stored name and role fields
        newPass.secondaryFields.push(
          {
            key: 'secondary0',
            label: 'Name',
            value: pass.name,
            textAlignment: 'PKTextAlignmentLeft'
          },
          {
            key: 'secondary1',
            label: 'Role',
            value: pass.role,
            textAlignment: 'PKTextAlignmentRight'
          }
        );

        // console.log('Adding back fields from database:', pass.backFields);

        // Add back fields for announcements
        for (const message of pass.backFields) {
          // console.log('Adding back field:', message);
          newPass.backFields.push({
            key: `announcement${newPass.backFields.length + 1}`,
            label: 'Announcement',
            value: message,
            textAlignment: 'PKTextAlignmentLeft'
          });
        }

        // Set the QR code
        newPass.setBarcodes({
          message: pass.qrText,
          format: 'PKBarcodeFormatQR',
          messageEncoding: 'iso-8859-1'
        });

        // console.log('Final back fields:', newPass.backFields);
        return newPass.getAsBuffer();
      },
      async tokenVerifier(token) {
        const [pass] = await db
          .select()
          .from(passes)
          .where(eq(passes.authenticationToken, token));
        return !!pass;
      }
    })
  )
  .route(
    '/',
    logRouter({
      async onIncomingLogs(logs) {
        // Just log the messages for now
        for (const log of logs) {
          console.log('Pass log:', log);
        }
      }
    })
  )
  // Custom endpoint for sending announcements
  .post('/update', async c => {
    const { message } = await c.req.json<{ message: string }>();
    // console.log('Received announcement message:', message);

    // Get all registered devices with their associated passes
    const allRegistrations = await db
      .select()
      .from(registrations)
      .leftJoin(
        devices,
        eq(
          registrations.deviceLibraryIdentifier,
          devices.deviceLibraryIdentifier
        )
      )
      .leftJoin(passes, eq(registrations.serialNumber, passes.serialNumber));

    // console.log('Found registrations:', allRegistrations);

    // Group by pass serial number to avoid duplicate updates
    const passesBySerial = new Map<
      string,
      {
        pass: typeof passes.$inferSelect;
        devices: (typeof devices.$inferSelect)[];
      }
    >();

    for (const reg of allRegistrations) {
      if (reg.passes && reg.devices) {
        if (!passesBySerial.has(reg.passes.serialNumber)) {
          passesBySerial.set(reg.passes.serialNumber, {
            pass: reg.passes,
            devices: []
          });
        }
        passesBySerial.get(reg.passes.serialNumber)?.devices.push(reg.devices);
      }
    }

    // console.log('Grouped passes:', Array.from(passesBySerial.entries()));

    // Update each pass and send push notifications
    for (const [serialNumber, { pass, devices }] of passesBySerial.entries()) {
      // console.log('Current pass backFields:', pass.backFields);

      // Format the announcement message
      const formattedMessage = `📢 ${message}`;
      // console.log('Adding formatted message:', formattedMessage);

      // Update pass backFields
      const updatedBackFields = [
        ...pass.backFields,
        formattedMessage
      ] as string[];
      // console.log('New backFields array:', updatedBackFields);

      await db
        .update(passes)
        .set({
          backFields: updatedBackFields,
          updatedAt: new Date()
        } as Partial<typeof passes.$inferInsert>)
        .where(eq(passes.serialNumber, serialNumber));

      // Verify the update
      const [updatedPass] = await db
        .select()
        .from(passes)
        .where(eq(passes.serialNumber, serialNumber));
      // console.log('Pass after update:', updatedPass);

      // Send push notifications to all devices
      // for (const device of devices) {
      //   try {
      //     // Send APNS push notification
      //     const notification = new Notification();
      //     notification.topic = PASS_TYPE_IDENTIFIER;
      //     notification.payload = {
      //       aps: {
      //         alert: 'Announcement',
      //         body: message
      //       }
      //     };

      //     apnsProvider.send(notification, device.pushToken).then(result => {
      //       if (result.failed.length > 0 && result.failed[0]) {
      //         const error = result.failed[0].response || 'Unknown error';
      //         console.error(
      //           `Failed to send push notification to device ${device.deviceLibraryIdentifier}:`,
      //           error
      //         );
      //       } else {
      //         console.log(
      //           `Successfully sent push notification to device ${device.deviceLibraryIdentifier}`
      //         );
      //       }
      //     });
      //   } catch (error) {
      //     console.error(
      //       `Failed to send push notification to device ${device.deviceLibraryIdentifier}:`,
      //       error
      //     );
      //   }
      // }
    }

    return c.json({ success: true });
  });

// showRoutes(pass, { verbose: true });
// pass.use(logger());

// Clean up APNS provider when the process exits
// process.on('SIGINT', () => {
//   apnsProvider.shutdown();
//   process.exit();
// });
