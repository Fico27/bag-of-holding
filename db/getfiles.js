const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function getFilesByUser(userId) {
  return prisma.file.findMany({
    where: { userId },
    orderBy: { uploadTime: "asc" },
  });
}

module.exports = {
  getFilesByUser,
};
