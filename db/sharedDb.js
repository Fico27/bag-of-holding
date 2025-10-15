const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function findSharedLink(linkId) {
  return prisma.shareLink.findUnique({
    where: { id: linkId },
    select: {
      id: true,
      expires: true,
      folderId: true,
    },
  });
}

async function findSharedDownload(shareId) {
  return prisma.shareLink.findUnique({
    where: {
      id: shareId,
    },
    select: {
      expires: true,
      folderId: true,
    },
  });
}

async function getFoldersByParentPublic(parentFolderId) {
  return prisma.folder.findMany({
    where: { parentId: parentFolderId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      parentId: true,
    },
  });
}

async function getFilesByFolderPublic(folderId) {
  return prisma.file.findMany({
    where: { folderId },
    orderBy: { uploadTime: "asc" },
    select: {
      id: true,
      name: true,
      size: true,
      uploadTime: true,
      storageKey: true,
      url: true,
      folderId: true,
    },
  });
}

// implement a security check so a user cannot download files outside of the shared folder.

async function getFileIfApproved(fileId, mainFolderId) {
  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
    select: {
      id: true,
      name: true,
      size: true,
      uploadTime: true,
      storageKey: true,
      url: true,
      folderId: true,
    },
  });

  if (!file) return null;
  //file is at root folder not in another folder.
  if (file.folderId == null) return null;

  let pointer = file.folderId;

  //NOTE TO SELF BECAUSE CONFUSING
  // First we verify if the file is included in the shared folder.
  // Then we verify that the folder is a descendant of the shared folder
  while (pointer != null) {
    if (pointer === mainFolderId) {
      return file;
    }
    const parent = await prisma.folder.findUnique({
      where: { id: pointer },
      select: { parentId: true },
    });
    if (!parent) return null;
    pointer = parent.parentId;
  }

  return null;
}

module.exports = {
  findSharedLink,
  findSharedDownload,
  getFoldersByParentPublic,
  getFilesByFolderPublic,
  getFileIfApproved,
};
