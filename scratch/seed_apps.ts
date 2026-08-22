import { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient(); 
async function run() { 
  const apps = await prisma.application.findMany({ take: 6 }); 
  for (const app of apps) { 
    await prisma.application.update({ 
      where: { id: app.id }, 
      data: { currentStage: 'LASC' } 
    }); 
  } 
  console.log('Updated 6 apps to LASC stage'); 
} 
run().catch(console.error).finally(() => prisma.$disconnect());
