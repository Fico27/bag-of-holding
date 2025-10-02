const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createUser(username, password, firstname, lastname) {
  try {
    await prisma.user.create({
      data: {
        username,
        password,
        firstname,
        lastname,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new Error("Username/email already exists");
    }
    throw error;
  }
}

module.exports = { createUser };
