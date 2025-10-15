const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function findSharedLink(linkId) {
  await prisma.shareLink.findUnique({
    where: { linkid },
    select: {
      id: true,
      expires: true,
      folderId: true,
    },
  });
}

async function getFoldersByParentPublic(linkFolderId) {
  return prisma.folder.findMany({
    where: { linkFolderId },
    orderBy: { createdAt: "asc" },
  });
}

async function getFilesByFolderPublic(linkFolderId) {
  return prisma.file.findMany({
    where: { linkFolderId },
    orderBy: { uploadTime: "asc" },
  });
}

module.exports = {
  findSharedLink,
  getFoldersByParentPublic,
  getFilesByFolderPublic,
};
