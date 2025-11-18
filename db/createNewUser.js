const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function createUser(email, password, firstname, lastname) {
  try {
    await prisma.user.create({
      data: {
        email: email.trim(),
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
