import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { User } from '../../modules/users/entities/user.entity';
import { Role, RolesEnum } from '../../modules/users/entities/role.entity';
import * as bcrypt from 'bcryptjs';
import { runStandalone } from './seed-utils';

export async function seedAdmin(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Connected to database.');
  }

  console.log('🌱 Starting Admin user seeding...');

  try {
    const userRepo = ds.getRepository(User);
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bookstore.com';
    const adminPhone = process.env.ADMIN_PHONE || '+989120000000';

    const existingAdmin = await userRepo.findOne({
      where: { username: adminUsername },
      relations: { roles: true, contact: true },
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    if (existingAdmin) {
      console.log(`ℹ️  Admin user "${adminUsername}" already exists. Updating credentials...`);
      existingAdmin.hashedPassword = hashedPassword;
      if (existingAdmin.contact) {
        existingAdmin.contact.email = adminEmail;
        existingAdmin.contact.phoneNumber = adminPhone;
      }
      await userRepo.save(existingAdmin);
      // Heal roles on legacy rows (e.g. missing Customer).
      const haveRoles = new Set(existingAdmin.roles.map((r) => r.role));
      for (const role of [RolesEnum.Admin, RolesEnum.Customer]) {
        if (!haveRoles.has(role)) {
          await ds.getRepository(Role).save({ role, userId: existingAdmin.id });
          console.log(`🩹 Added missing "${role}" role to "${adminUsername}".`);
        }
      }
      console.log(`✅ Updated Admin user "${adminUsername}".`);
    } else {
      const newAdmin = userRepo.create({
        username: adminUsername,
        hashedPassword,
        firstName: 'System',
        lastName: 'Admin',
        contact: {
          email: adminEmail,
          phoneNumber: adminPhone,
          isVerifiedEmail: true,
          isVerifiedPhoneNumber: true,
        },
        roles: [
          { role: RolesEnum.Admin },
          { role: RolesEnum.Customer },
        ],
      });

      await userRepo.save(newAdmin);
      console.log(`✅ Created new Admin user "${adminUsername}" with password: "${adminPassword}".`);
    }

    console.log('🎉 Admin seeding finished successfully!');
    if (ownConnection) await ds.destroy();
  } catch (error) {
    console.error('❌ Failed to seed admin:', error);
    throw error;
  }
}

if (require.main === module) {
  runStandalone('admin', seedAdmin).catch(() => process.exit(1));
}
