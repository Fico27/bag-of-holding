const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createUser(username, password, firstname, lastname) {
  await prisma.user.create({
    data: {
      username,
      password,
      firstname,
      lastname,
    },
  });
}

module.exports = { createUser };
