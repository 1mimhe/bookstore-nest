import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Staff } from '../../modules/staffs/entities/staff.entity';
import { User } from '../../modules/users/entities/user.entity';
import { logResult, need, runStandalone, upsert } from './seed-utils';

const staffData = [
  { username: 'editor', nationalId: '0012345678', employeeId: 'EMP-001', salary: BigInt(80000000) },
  { username: 'keeper', nationalId: '0012345679', employeeId: 'EMP-002', salary: BigInt(75000000) },
  { username: 'supporter', nationalId: '0012345680', employeeId: 'EMP-003', salary: BigInt(70000000) },
  { username: 'arash', nationalId: '0012345681', employeeId: 'EMP-004', salary: BigInt(82000000) },
  { username: 'publisher-nay', nationalId: '0012345682', employeeId: 'EMP-005', salary: BigInt(78000000) },
];

export async function seedStaff(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting staff seeding...');
  const userRepo = ds.getRepository(User);
  const staffRepo = ds.getRepository(Staff);
  let created = 0;
  let updated = 0;

  for (const row of staffData) {
    const user = await need(userRepo, { username: row.username }, `user:${row.username}`);
    const { created: isNew } = await upsert(
      staffRepo,
      { userId: user.id },
      {
        userId: user.id,
        nationalId: row.nationalId,
        employeeId: row.employeeId,
        salary: row.salary,
        isActive: true,
      },
    );
    if (isNew) {
      created++;
      console.log(`✅ Created staff: ${row.username} (${row.employeeId})`);
    } else {
      updated++;
    }
  }

  logResult('Staff', created, updated);
  console.log('🎉 Staff seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('staff', seedStaff).catch(() => process.exit(1));
}
