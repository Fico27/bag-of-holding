const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function uploadToDb({ userId, name, size, url, storageKey = null }) {
  try {
    return await prisma.file.create({
      data: {
        name,
        size,
        url,
        user: { connect: { id: userId } },
      },
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  uploadToDb,
};
