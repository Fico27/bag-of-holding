const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function getFilesByFolder(userId, folderId) {
  return prisma.file.findMany({
    where: { userId, folderId },
    orderBy: { uploadTime: "asc" },
  });
}

module.exports = {
  getFilesByFolder,
};
