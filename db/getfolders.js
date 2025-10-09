const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

//Updating to include root folders and parent folders.
async function getFoldersByParent(userId, parentId) {
  return prisma.folder.findMany({
    where: { userId, parentId },
    orderBy: { createdAt: "asc" },
  });
}

module.exports = {
  getFoldersByParent,
};
