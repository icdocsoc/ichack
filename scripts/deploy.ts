import { format } from 'date-fns';
import { $ } from 'bun';
import select from '@inquirer/select';
import confirm from '@inquirer/confirm';

interface TagOptions {
  product: 'landing' | 'website';
  environment: 'staging' | 'production';
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
async function generateTag({
  product,
  environment
}: TagOptions): Promise<string> {
  const date = getCurrentDate();

  const latestTag = await getLatestTag(date);
  const nextVersion = latestTag ? incrementVersion(latestTag) : 1;

  return environment === 'staging'
    ? `v${date}-${nextVersion}-${product}-staging`
    : `v${date}-${nextVersion}-${product}`;
}

// Create the tag in the repository
async function createTag(tag: string) {
  try {
    await $`git tag ${tag}`;
    console.log(`Tag ${tag} created successfully.`);

    // ask for confirmation before pushing the tag
    const push = await confirm({
      message: 'Push the tag to remote'
    });
    if (!push) {
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
async function main(options: TagOptions) {
  const tag = await generateTag(options);
  await createTag(tag);
}

// Run the script
const product: TagOptions['product'] = await select({
  message: 'Select the product:',
  choices: [
    {
      name: 'landing',
      value: 'landing'
    },
    {
      name: 'website',
      value: 'website'
    }
  ]
});

const environment: TagOptions['environment'] = await select({
  message: 'Select the environment:',
  choices: [
    {
      name: 'staging',
      value: 'staging'
    },
    {
      name: 'production',
      value: 'production'
    }
  ]
});

const ok = await confirm({
  message: `Continue deployment of "${product}" to "${environment}"`
});
if (!ok) {
  console.log('Deployment cancelled.');
  process.exit(0);
}

await main({ product, environment });
