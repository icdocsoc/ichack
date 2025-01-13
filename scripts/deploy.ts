import { format } from 'date-fns';
import { $ } from 'bun';

interface TagOptions {
  isStaging: boolean;
}

// Get the current date in the format YYYY.MM.DD
function getCurrentDate(): string {
  return format(new Date(), 'yyyy.MM.dd');
}

// Get the latest tag for the current date
async function getLatestTag(date: string): Promise<string | null> {
  try {
    // Use Git to find all tags, filter by current date, and sort numerically
    await $`git fetch --tags`;
    const tags = await $`git tag --list "v*" --sort=-creatordate`
      .quiet()
      .text();

    const tag = tags.split('\n').find(t => t.startsWith(`v${date}`));
    return tag ?? null; // Return the latest tag or null
  } catch (error) {
    console.error('Error getting latest tag:', error.message);
    return null;
  }
}

// Increment the version number of the tag
function incrementVersion(tag: string): number {
  const parts = tag.split('-');
  const version = parseInt(parts[1] ?? 'NaN', 10);
  if (isNaN(version)) {
    console.error('Invalid version number:', tag);
    process.exit(1);
  }
  return version + 1;
}

// Generate the tag version
async function generateTag(isStaging: boolean): Promise<string> {
  const date = getCurrentDate();

  const latestTag = await getLatestTag(date);
  const nextVersion = latestTag ? incrementVersion(latestTag) : 1;

  return isStaging
    ? `v${date}-${nextVersion}-staging`
    : `v${date}-${nextVersion}`;
}

// Create the tag in the repository
async function createTag(tag: string) {
  try {
    await $`git tag ${tag}`;
    console.log(`Tag ${tag} created successfully.`);

    // ask for confirmation before pushing the tag
    const push = prompt(
      'Do you want to push the tag to the remote repository? (y/N)'
    );
    if (!push || push.toLowerCase() !== 'y') {
      console.log(`Tag ${tag} created but not pushed.`);
      return;
    }

    await $`git push origin ${tag}`;
    console.log(`Tag ${tag} pushed successfully.`);
  } catch (error) {
    console.error(`Error creating or pushing tag ${tag}:`, error.message);
    process.exit(1);
  }
}

// Main function
async function main({ isStaging }: TagOptions) {
  const message = isStaging ? 'staging deployment' : 'production deployment';
  const response = prompt(
    `Creating a new tag for ${message}... Continue? (y/N)`
  );
  if (!response || response.toLowerCase() !== 'y') {
    console.log('Aborted.');
    process.exit(0);
  }

  const tag = await generateTag(isStaging);
  await createTag(tag);
}

// Run the script
const args = process.argv.slice(2);
const isStaging = args.includes('--staging');

await main({ isStaging });
