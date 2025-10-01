const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users);
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();