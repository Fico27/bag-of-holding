const fs = require("node:fs");
const { PrismaClient } = require("../generated/prisma");
const { createClient } = require("@supabase/supabase-js");

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function uploadFile(req, res) {
  try {
    const { file } = req;
    if (!file) {
      return res.render("dashboard", {
        user: req.user,
        items: [],
        errors: [{ msg: "No file uploaded" }],
      });
    }
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Upload Error", error);
    res.render("dashboard", {
      user: req.user,
      items: [],
      errors: [{ msg: "File upload failed." }],
    });
  }
}

module.exports = {
  uploadFile,
};
