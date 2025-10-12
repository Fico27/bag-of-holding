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

async function getFolderTrail(userId, folderId) {
  const trail = [];

  //If already at root return root else follow code below.
  if (folderId == null) return trail;

  let node = await getOwnedFolder(userId, folderId);

  while (node) {
    trail.push({
      id: node.id,
      name: node.name,
      parentId: node.parentId,
    });
    if (node.parentId == null) break;
    node = await getOwnedFolder(userId, node.parentId);
  }
  return trail.reverse();
}

module.exports = {
  getOwnedFolder,
  getFolderTrail,
};
