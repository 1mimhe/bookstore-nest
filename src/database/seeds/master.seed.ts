import { execSync } from 'child_process';

console.log('🚀 Running full database seeding pipeline...\n');

try {
  console.log('1️⃣ Seeding Languages...');
  execSync('ts-node --files ./src/database/seeds/languages.seed.ts', { stdio: 'inherit' });

  console.log('\n2️⃣ Seeding Tags...');
  execSync('ts-node --files ./src/database/seeds/tags.seed.ts', { stdio: 'inherit' });

  console.log('\n3️⃣ Seeding Admin User...');
  execSync('ts-node --files ./src/database/seeds/admin.seed.ts', { stdio: 'inherit' });

  console.log('\n✨ All database seeds executed successfully!');
} catch (error) {
  console.error('\n💥 Seeding failed:', error);
  process.exit(1);
}
