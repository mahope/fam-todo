import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Get admin details from environment
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nestlist.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Administrator';
  const familyName = process.env.ADMIN_FAMILY_NAME || 'Admin Familie';

  console.log(`Creating admin user: ${adminEmail}`);

  // Hash the admin password
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: { appUser: true }
    });

    if (existingUser) {
      console.log('✅ Admin user already exists, skipping seed');
      return;
    }

    // Create family first
    const family = await prisma.family.create({
      data: {
        name: familyName,
      },
    });

    console.log(`✅ Created family: ${familyName}`);

    // Create NextAuth user
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        emailVerified: new Date(), // Mark as verified
      },
    });

    console.log(`✅ Created NextAuth user: ${adminEmail}`);

    // Create app user linked to NextAuth user
    const appUser = await prisma.appUser.create({
      data: {
        userId: user.id,
        familyId: family.id,
        role: 'ADMIN',
        email: adminEmail,
        displayName: adminName,
      },
    });

    console.log(`✅ Created app user with ADMIN role: ${adminName}`);

    // Create default user settings
    await prisma.userSetting.create({
      data: {
        userId: appUser.id,
        theme: 'system',
        locale: 'da',
        timezone: 'Europe/Copenhagen',
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: true,
        taskReminders: true,
        familyUpdates: true,
        defaultListVisibility: 'FAMILY',
      },
    });

    console.log(`✅ Created user settings for admin`);

    console.log('\n🎉 Seed completed successfully!');
    console.log(`\n📧 Admin email: ${adminEmail}`);
    console.log(`🔑 Admin password: ${adminPassword}`);
    console.log(`🏠 Family: ${familyName}`);
    console.log('\n⚠️  Please change the admin password after first login!');

  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});