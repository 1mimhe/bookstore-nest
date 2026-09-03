import { AppDataSource } from '../../data-source';
import { User } from '../../modules/users/entities/user.entity';
import { RolesEnum } from '../../modules/users/entities/role.entity';
import * as bcrypt from 'bcryptjs';

async function seedAdmin() {
  console.log('🌱 Starting Admin user seeding...');

  try {
    await AppDataSource.initialize();
    console.log('📦 Connected to database.');

    const userRepo = AppDataSource.getRepository(User);
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
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed admin:', error);
    process.exit(1);
  }
}

seedAdmin();
