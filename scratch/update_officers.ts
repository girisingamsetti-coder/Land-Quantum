import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  // Rename Lands Officer → Anjana
  const u1 = await prisma.user.update({
    where: { email: 'lands@amaravati-demo.gov.in' },
    data: { name: 'Anjana' },
  });
  console.log('Updated:', u1.email, '→', u1.name);

  // Rename Monitoring Officer → P J Raju
  const u2 = await prisma.user.update({
    where: { email: 'monitoring@amaravati-demo.gov.in' },
    data: { name: 'P J Raju' },
  });
  console.log('Updated:', u2.email, '→', u2.name);
}

run().catch(console.error).finally(() => prisma.$disconnect());
