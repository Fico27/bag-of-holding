const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function getDownloadFolder() {
  return await prisma.folder.findFirst({
    where: {
      id: folderId,
      userId,
    },
    select: {
      id: true,
      name: true,
    },
  });
}

async function getFilesInFolder() {
  return await prisma.file.findMany({
    where: {
      userId,
      folderId: folder.id,
    },
    select: {
      id: true,
      name: true,
      storageKey: true,
    },
    orderBy: { uploadTime: "asc" },
  });
}

async function getChildFolder() {
  await prisma.folder.findMany({
    where: {
      userId,
      parentId: folder.id,
    },
    select: {
      id: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

module.exports = {
  getDownloadFolder,
  getFilesInFolder,
  getChildFolder,
};
