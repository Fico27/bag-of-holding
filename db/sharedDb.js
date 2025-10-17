const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function findSharedLink(linkId) {
  return prisma.shareLink.findUnique({
    where: { id: linkId },
    select: {
      id: true,
      expires: true,
      folderId: true,
      fileId: true,
    },
  });
}
async function findPublicFile(fileId) {
  return prisma.file.findUnique({
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
}

async function findPublicFolder(targetFolderId) {
  return prisma.folder.findUnique({
    where: { id: targetFolderId },
    select: { id: true, name: true },
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
      fileId: true,
    },
  });
}

async function getChildFoldersByPublic(parentFolderId) {
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
  // Then we verify that file belongs to a subfolder of the shared folder
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

//Check if folders are included in the share

async function isFolderWithinShare(targetFolderId, rootFolderId) {
  if (targetFolderId === rootFolderId) return true;

  let pointer = await prisma.folder.findUnique({
    where: {
      id: targetFolderId,
    },
    select: {
      parentId: true,
    },
  });

  while (pointer && pointer.parentId != null) {
    if (pointer.parentId === rootFolderId) return true;
    pointer = await prisma.folder.findUnique({
      where: { id: pointer.parentId },
      select: { parentId: true },
    });
  }
  return false;
}

async function collectEntriesForZip(rootFolderId, path = []) {
  const folder = await prisma.folder.findUnique({
    where: { id: rootFolderId },
    select: {
      id: true,
      name: true,
    },
  });
  if (!folder) return [];

  const thisPath = [...path, folder.name];

  //get files in current root folder
  const files = await getFilesByFolderPublic(rootFolderId);
  const entries = files.map((file) => ({
    storageKey: file.storageKey,
    zipPath: [...thisPath, file.name].join("/"),
  }));

  //get all child files within root folder
  const children = await getChildFoldersByPublic(folder.id);
  for (const child of children) {
    const childEntries = await collectEntriesForZip(child.id, thisPath);
    entries.push(...childEntries);
  }
  return entries;
}

async function getPublicFolderTrail(currentFolderId, rootFolderId) {
  if (currentFolderId === null) return [];

  const trail = [];
  let nodeId = currentFolderId;

  while (nodeId != null) {
    const node = await prisma.folder.findUnique({
      where: { id: nodeId },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });
    if (!node) break;
    trail.push({
      id: node.id,
      name: node.name,
      parentId: node.parentId,
    });

    if (node.id === rootFolderId) break;
    nodeId = node.parentId;
  }
  return trail.reverse();
}

module.exports = {
  findSharedLink,
  findSharedDownload,
  getChildFoldersByPublic,
  getFilesByFolderPublic,
  getFileIfApproved,
  findPublicFile,
  isFolderWithinShare,
  collectEntriesForZip,
  findPublicFolder,
  getPublicFolderTrail,
};
