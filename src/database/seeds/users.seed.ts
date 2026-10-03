import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Address } from '../../modules/users/entities/address.entity';
import { Contact } from '../../modules/users/entities/contact.entity';
import { Role, RolesEnum } from '../../modules/users/entities/role.entity';
import { Genders, User } from '../../modules/users/entities/user.entity';
import { hashPassword, logResult, runStandalone, upsert } from './seed-utils';

export const DEMO_PASSWORD = 'DemoPass123!';

export interface DemoUserSpec {
  username: string;
  firstName: string;
  lastName?: string;
  gender?: Genders;
  email?: string;
  phoneNumber?: string;
  roles: RolesEnum[];
}

const demoUsers: DemoUserSpec[] = [
  {
    username: 'demo',
    firstName: 'Sara',
    lastName: 'Ahmadi',
    gender: Genders.Female,
    email: 'sara.ahmadi@bookstore.com',
    phoneNumber: '+989121001001',
    roles: [RolesEnum.Customer],
  },
  {
    username: 'publisher1',
    firstName: 'Negar',
    lastName: 'Hosseini',
    gender: Genders.Female,
    email: 'negar.hosseini@cheshmeh.com',
    phoneNumber: '+989121001002',
    roles: [RolesEnum.Publisher, RolesEnum.Customer],
  },
  {
    username: 'editor',
    firstName: 'Amir',
    lastName: 'Rahmani',
    gender: Genders.Male,
    email: 'amir.rahmani@bookstore.com',
    phoneNumber: '+989121001003',
    roles: [RolesEnum.ContentManager, RolesEnum.Customer],
  },
  {
    username: 'keeper',
    firstName: 'Reza',
    lastName: 'Karimi',
    gender: Genders.Male,
    email: 'reza.karimi@bookstore.com',
    phoneNumber: '+989121001004',
    roles: [RolesEnum.InventoryManager, RolesEnum.Customer],
  },
  {
    username: 'supporter',
    firstName: 'Maryam',
    lastName: 'Fallahi',
    gender: Genders.Female,
    email: 'maryam.fallahi@bookstore.com',
    phoneNumber: '+989121001005',
    roles: [RolesEnum.OrderManager, RolesEnum.Customer],
  },
  {
    username: 'mehrdad',
    firstName: 'Mehrdad',
    lastName: 'Jafari',
    gender: Genders.Male,
    email: 'mehrdad.jafari@gmail.com',
    phoneNumber: '+989122002001',
    roles: [RolesEnum.Customer],
  },
  {
    username: 'zahra',
    firstName: 'Zahra',
    lastName: 'Moradi',
    gender: Genders.Female,
    email: 'zahra.moradi@yahoo.com',
    phoneNumber: '+989122002002',
    roles: [RolesEnum.Customer],
  },
  {
    username: 'kian',
    firstName: 'Kian',
    lastName: 'Shirazi',
    gender: Genders.Male,
    email: 'kian.shirazi@outlook.com',
    phoneNumber: '+989122002003',
    roles: [RolesEnum.Customer],
  },
  {
    username: 'taraneh',
    firstName: 'Taraneh',
    lastName: 'Alizadeh',
    gender: Genders.Female,
    email: 'taraneh.alizadeh@gmail.com',
    phoneNumber: '+989122002004',
    roles: [RolesEnum.Customer],
  },
  {
    username: 'arash',
    firstName: 'Arash',
    lastName: 'Mokhtari',
    gender: Genders.Male,
    email: 'arash.mokhtari@bookstore.com',
    phoneNumber: '+989122002005',
    roles: [RolesEnum.ContentManager, RolesEnum.Customer],
  },
  {
    username: 'neda',
    firstName: 'Neda',
    lastName: 'Ghiasi',
    gender: Genders.Female,
    email: 'neda.ghiasi@gmail.com',
    phoneNumber: '+989122002006',
    roles: [RolesEnum.Customer],
  },
  {
    username: 'saeed',
    firstName: 'Saeed',
    lastName: 'Taheri',
    gender: Genders.Male,
    email: 'saeed.taheri@nay.com',
    phoneNumber: '+989122002007',
    roles: [RolesEnum.Publisher, RolesEnum.Customer],
  },
];

const demoAddresses = [
  {
    username: 'demo',
    recipientName: 'Home',
    phoneNumber: '+989121001001',
    province: 'Tehran',
    city: 'Tehran',
    postalAddress: 'No. 42, Vali-Asr Ave, between Parkway and Africa',
    postalCode: '1995634111',
    plate: 42,
  },
  {
    username: 'demo',
    recipientName: 'Work',
    phoneNumber: '+989121001001',
    province: 'Tehran',
    city: 'Tehran',
    postalAddress: 'Unit 8, Saadabad Office Tower, Tajrish Square',
    postalCode: '1987654321',
    plate: 8,
  },
  {
    username: 'mehrdad',
    recipientName: 'Home',
    phoneNumber: '+989122002001',
    province: 'Tehran',
    city: 'Tehran',
    postalAddress: 'No. 15, Jordan St, near Vanak Square',
    postalCode: '1439811111',
    plate: 15,
  },
  {
    username: 'mehrdad',
    recipientName: 'Office',
    phoneNumber: '+989122002001',
    province: 'Tehran',
    city: 'Tehran',
    postalAddress: 'Floor 3, Building 20, Beheshti St',
    postalCode: '1584963210',
    plate: 20,
  },
  {
    username: 'zahra',
    recipientName: 'Home',
    phoneNumber: '+989122002002',
    province: 'Isfahan',
    city: 'Isfahan',
    postalAddress: 'No. 8, Chaharbagh Abbasi St',
    postalCode: '8146912345',
    plate: 8,
  },
  {
    username: 'kian',
    recipientName: 'Home',
    phoneNumber: '+989122002003',
    province: 'Fars',
    city: 'Shiraz',
    postalAddress: 'No. 22, Zand St, near Vakil Bazaar',
    postalCode: '7134567890',
    plate: 22,
  },
  {
    username: 'kian',
    recipientName: 'University',
    phoneNumber: '+989122002003',
    province: 'Fars',
    city: 'Shiraz',
    postalAddress: 'Shiraz University, Zand Blvd',
    postalCode: '7134567891',
    plate: 1,
  },
  {
    username: 'taraneh',
    recipientName: 'Home',
    phoneNumber: '+989122002004',
    province: 'Tehran',
    city: 'Tehran',
    postalAddress: 'No. 5, Golestan St, Darband',
    postalCode: '1987650001',
    plate: 5,
  },
  {
    username: 'neda',
    recipientName: 'Home',
    phoneNumber: '+989122002006',
    province: 'Khorasan Razavi',
    city: 'Mashhad',
    postalAddress: 'No. 33, Ferdowsi St, near Haram',
    postalCode: '9187654321',
    plate: 33,
  },
  {
    username: 'saeed',
    recipientName: 'Home',
    phoneNumber: '+989122002007',
    province: 'Tehran',
    city: 'Tehran',
    postalAddress: 'No. 7, Enghelab St, University of Tehran area',
    postalCode: '1136512345',
    plate: 7,
  },
];

/** Find-or-create a user with contact + roles (reused by publishers.seed). */
export async function ensureUser(ds: DataSource, spec: DemoUserSpec): Promise<User> {
  const userRepo = ds.getRepository(User);
  const roleRepo = ds.getRepository(Role);
  const contactRepo = ds.getRepository(Contact);
  const hashed = await hashPassword(DEMO_PASSWORD);

  let user = await userRepo.findOne({
    where: { username: spec.username },
    relations: { roles: true, contact: true },
  });

  if (!user) {
    user = await userRepo.save(
      userRepo.create({
        username: spec.username,
        hashedPassword: hashed,
        firstName: spec.firstName,
        lastName: spec.lastName,
        gender: spec.gender,
        contact: {
          email: spec.email,
          phoneNumber: spec.phoneNumber,
          isVerifiedEmail: true,
          isVerifiedPhoneNumber: true,
        },
        roles: spec.roles.map((role) => ({ role })),
      }),
    );
    console.log(`✅ Created user: ${user.username} (${spec.roles.join(', ')})`);
    return user;
  }

  user.hashedPassword = hashed;
  user.firstName = spec.firstName;
  user.lastName = spec.lastName;
  await userRepo.save(user);

  const haveRoles = new Set(user.roles.map((r) => r.role));
  for (const role of spec.roles) {
    if (!haveRoles.has(role)) {
      await roleRepo.save(roleRepo.create({ role, userId: user.id }));
    }
  }
  if (user.contact) {
    if (spec.email !== undefined) user.contact.email = spec.email;
    if (spec.phoneNumber !== undefined) user.contact.phoneNumber = spec.phoneNumber;
    await contactRepo.save(user.contact);
  } else {
    await contactRepo.save(
      contactRepo.create({
        email: spec.email,
        phoneNumber: spec.phoneNumber,
        isVerifiedEmail: true,
        isVerifiedPhoneNumber: true,
        userId: user.id,
      }),
    );
  }
  console.log(`🔄 Updated user: ${user.username} (${spec.roles.join(', ')})`);
  return user;
}

export async function seedUsers(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting demo users seeding...');
  let created = 0;
  let updated = 0;
  const ids: Record<string, string> = {};

  for (const spec of demoUsers) {
    const existed = await ds.getRepository(User).findOne({ where: { username: spec.username } });
    const user = await ensureUser(ds, spec);
    ids[spec.username] = user.id;
    if (existed) updated++;
    else created++;
  }

  const addressRepo = ds.getRepository(Address);
  for (const address of demoAddresses) {
    const { username, ...rest } = address;
    await upsert(
      addressRepo,
      { userId: ids[username], recipientName: rest.recipientName },
      { ...rest, userId: ids[username] },
    );
  }
  console.log(`📬 Ensured ${demoAddresses.length} addresses across users`);

  logResult('Demo users', created, updated);
  console.log(`🔑 Demo password for all seeded users: "${DEMO_PASSWORD}"`);
  console.log('🎉 Users seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('users', seedUsers).catch(() => process.exit(1));
}
