const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function uploadToDb() {
  try {
    await prisma.file.create({
      data: file.originalname,
      size: file.size,
      userId: req.user.id,
      url: `/uploads/${file.filename}`,
      folderId: null,
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  uploadToDb,
};
