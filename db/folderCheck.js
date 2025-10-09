const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function ownerParentCheck(parentId, userId) {
  return await prisma.folder.findFirst({
    where: { id: parentId, userId },
    select: { id: true },
  });
}

async function ownerFolderCheck(folderId, userId) {
  if (folderId == null) return true;
  return await prisma.folder.findFirst({
    where: { id: folderId, userId },
    select: { id: true },
  });
}

module.exports = {
  ownerParentCheck,
  ownerFolderCheck,
};
