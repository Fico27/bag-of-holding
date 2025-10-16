const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createShareLinkForFolder({ folderId, expires }) {
  return prisma.shareLink.create({
    data: {
      folderId,
      expires,
    },
    select: {
      id: true,
      expires: true,
    },
  });
}

async function createShareLinkForFile({ fileId, expires }) {
  return prisma.shareLink.create({
    data: {
      fileId,
      expires,
    },
    select: {
      id: true,
      expires: true,
    },
  });
}

module.exports = {
  createShareLinkForFolder,
  createShareLinkForFile,
};
