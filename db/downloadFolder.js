const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function getDownloadFolder(folderId, userId) {
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

async function getFilesInFolder(folderId, userId) {
  return await prisma.file.findMany({
    where: {
      userId,
      folderId,
    },
    select: {
      id: true,
      name: true,
      storageKey: true,
    },
    orderBy: { uploadTime: "asc" },
  });
}

async function getChildFolder(parentId, userId) {
  return await prisma.folder.findMany({
    where: {
      userId,
      parentId,
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
