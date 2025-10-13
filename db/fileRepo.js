const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function getOwnedFile(userId, fileId) {
  return prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
    select: {
      id: true,
      name: true,
      folderId: true,
      storageKey: true,
      url: true,
    },
  });
}

async function renameFile(userId, fileId, newName) {
  return prisma.file.update({
    where: {
      id: fileId,
    },
    data: {
      name: newName,
    },
  });
}

async function deleteFile(fileId, userId) {
  return prisma.file.delete({
    where: {
      id: fileId,
    },
  });
}

module.exports = {
  getOwnedFile,
  renameFile,
  deleteFile,
};
