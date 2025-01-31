import { categories, companies } from '~~/server/src/category/schema';
import { db } from '~~/server/src/drizzle';

await db
  .insert(companies)
  .values([{ name: 'JetBrains' }, { name: 'Optiver' }, { name: 'DoCSoc' }]);

await db.insert(categories).values([
  {
    slug: 'jetbrains-app-development-in-kotlin',
    title: 'App development in Kotlin',
    owner: 'JetBrains',
    image: '/sponsors/jetbrains.svg',
    shortDescription: 'Kotlin is a great language',
    longDescription:
      'https://raw.githubusercontent.com/cybercoder-naj/SED_Solutions/refs/heads/main/README.md'
  },
  {
    slug: 'optiver-quant-trading',
    title: 'Quant Trading',
    owner: 'Optiver',
    image: '/sponsors/optiver.svg',
    shortDescription: 'Develop Quant Trading strategies',
    longDescription:
      'https://raw.githubusercontent.com/cybercoder-naj/ScientificCalculator/refs/heads/main/README.md'
  },
  {
    slug: 'docsoc-education',
    title: 'Education',
    owner: 'DoCSoc',
    image: '/sponsors/docsoc.svg',
    shortDescription: 'Create apps for students',
    longDescription:
      'https://raw.githubusercontent.com/cybercoder-naj/cybercoder-nishant.dev/refs/heads/main/README.md'
  }
]);
