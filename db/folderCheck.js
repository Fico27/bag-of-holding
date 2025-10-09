const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function ownerCheck(parentId, userId) {
  return await prisma.folder.findFirst({
    where: { id: parentId, userId },
    select: { id: true },
  });
}

module.exports = {
  ownerCheck,
};
