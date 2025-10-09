const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function uploadToDb({
  userId,
  name,
  size,
  url,
  storageKey = null,
  folderId = null,
}) {
  try {
    return await prisma.file.create({
      data: {
        name,
        size,
        url,
        storageKey,
        user: { connect: { id: userId } },
        ...(folderId !== null ? { folder: { connect: { id: folderId } } } : {}),
      },
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  uploadToDb,
};
