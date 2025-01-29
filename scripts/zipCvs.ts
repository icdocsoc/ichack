import { eq } from 'drizzle-orm';
import { db } from '~~/server/src/drizzle';
import { getCvFileName, s3client } from '~~/server/src/profile/cv';
import { profiles } from '~~/server/src/profile/schema';

prompt(
  'Please be aware that this data is HIGHLY GDPR SENSITIVE (probably). DO NOT OPEN THESE CVs AND DELETE THEM AS SOON AS YOU ARE DONE!'
);

prompt(
  'Also ensure you are in a directory which is okay to have five hundred new pdfs in.'
);

const res = await db
  .select({
    id: profiles.id
  })
  .from(profiles)
  .where(eq(profiles.cvUploaded, true));

for (const person of res) {
  const { id } = person!;
  console.info(`Started person with ID ${id}.`);

  const fileName = await getCvFileName(id);
  const cv = s3client.file(fileName);

  const buf = await cv.arrayBuffer();
  await Bun.write(`./${fileName}`, buf);

  console.info(`Finished person with ID ${id}.\n`);
}

console.log('Zip it yourself. And delete the CVs locally.');
