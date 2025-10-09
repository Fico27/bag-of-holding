const { supabase } = require("../db/supabase");
const { uploadToDb } = require("../db/uploadFile");
const { ownerFolderCheck } = require("../db/folderCheck");

const BUCKET = process.env.SUPABASE_BUCKET;

async function uploadFile(req, res) {
  const folderId = req.body.folderId ? Number(req.body.folderId) : null;
  const user = req.user;
  const { file } = req;
  try {
    if (!file) {
      return res.render("dashboard", {
        user: req.user,
        items: [],
        errors: [{ msg: "No file upload" }],
      });
    }

    if (folderId !== null) {
      const parent = await ownerFolderCheck();
      if (!parent) {
        return res.status(404).render("dashboard", {
          user,
          items: [],
          currentFolderId: null,
          errors: [{ msg: "Destination folder not found." }],
        });
      }
    }

    const objectPath = `${user.id}/${Date.now()}-${file.originalname}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (upErr) throw upErr;

    let url = null;

    if (process.env.SUPABASE_BUCKET_PUBLIC === "true") {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
      url = data.publicUrl;
    } else {
      const { data, error: signErr } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(objectPath, 60 * 60);

      if (signErr) throw signErr;
      url = data.signedUrl;
    }

    await uploadToDb({
      userId: user.id,
      name: file.originalname,
      size: file.size,
      url,
      storageKey: objectPath,
      folderId,
    });

    return res.redirect(
      folderId ? `/dashboard?folderId=${folderId}` : "/dashboard"
    );
  } catch (error) {
    console.error("Upload Error", error);
    res.render("dashboard", {
      user,
      items: [],
      currentFolderId: folderId,
      errors: [{ msg: "File upload failed." }],
    });
  }
}

module.exports = {
  uploadFile,
};
