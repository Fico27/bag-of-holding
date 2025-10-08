const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function getRootFolders(userId) {
  return prisma.folder.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

module.exports = {
  getRootFolders,
};
