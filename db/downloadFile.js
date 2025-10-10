const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function findDownloadFile(id, userId) {
  const file = await prisma.file.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
      name: true,
      storageKey: true,
      url: true,
    },
  });

  return file;
}

module.exports = {
  findDownloadFile,
};
