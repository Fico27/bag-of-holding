const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createShareLink({ folderId, expires }) {
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

module.exports = {
  createShareLink,
};
