const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createFolder(userId, name) {
  return prisma.folder.create({
    data: {
      name,
      user: {
        connect: { id: userId },
      },
    },
  });
}

module.exports = {
  createFolder,
};
