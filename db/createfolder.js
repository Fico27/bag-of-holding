const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createFolder(userId, name, parentId = null) {
  return prisma.folder.create({
    data: {
      name,
      user: { connect: { id: userId } },
      ...(parentId !== null ? { parent: { connect: { id: parentId } } } : {}),
    },
  });
}

module.exports = {
  createFolder,
};
