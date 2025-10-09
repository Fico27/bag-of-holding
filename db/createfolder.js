const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createFolder(userId, name, parentId = null) {
  return prisma.folder.create({
    data: {
      name,
      parentId,
      user: {
        connect: { id: userId },
      },
    },
  });
}

module.exports = {
  createFolder,
};
