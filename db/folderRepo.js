const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function getOwnedFolder(userId, folderId) {
  if (folderId == null) return null;

  return prisma.folder.findFirst({
    where: {
      id: folderId,
      userId,
    },
    select: {
      id: true,
      name: true,
      parentId: true,
    },
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
      name: true,
      parentId: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

async function getFilesInFolder(userId, folderId) {
  return prisma.file.findMany({
    where: { userId, folderId },
    select: {
      id: true,
      name: true,
      storageKey: true,
    },
  });
}

async function collectItemsInFolder(userId, rootFolderId) {
  const files = [];
  const folders = [];

  async function collectFiles(folderId) {
    const filesInFolder = await getFilesInFolder(userId, folderId);
    files.push(...filesInFolder);

    const children = await getChildFolder(userId, folderId);
    for (const child of children) {
      await collectFiles(child.id);
    }
    folders.push(folderId);
  }

  await collectFiles(rootFolderId);
  return { files, folders };
}

async function renameFolder(userId, folderId, newName) {
  return prisma.folder.update({
    where: { id: folderId },
    data: { name: newName },
  });
}

async function deleteFolderCascade(files, folderIds) {
  await prisma.$transaction([
    prisma.file.deleteMany({
      where: {
        id: {
          in: files.map((file) => file.id),
        },
      },
    }),
    await prisma.folder.deleteMany({
      where: {
        id: {
          in: folderIds,
        },
      },
    }),
  ]);
}

module.exports = {
  getOwnedFolder,
  getChildFolder,
  getFilesInFolder,
  collectItemsInFolder,
  renameFolder,
  deleteFolderCascade,
};
