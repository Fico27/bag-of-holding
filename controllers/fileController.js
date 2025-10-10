const { supabase } = require("../db/supabase");
const { uploadToDb } = require("../db/uploadFile");
const { ownerFolderCheck } = require("../db/folderCheck");
const dbDownloadFile = require("../db/downloadFile");
require("dotenv").config();

const BUCKET = process.env.SUPABASE_BUCKET;

async function uploadFile(req, res) {
  const folderId = req.body.folderId ? Number(req.body.folderId) : null;
  const user = req.user;
  const { file } = req;
  try {
    if (!file) {
      return res.render("dashboard", {
        user,
        items: [],
        currentFolderId,
        errors: [{ msg: "No file upload" }],
      });
    }

    if (folderId !== null) {
      const parent = await ownerFolderCheck(folderId, user.id);
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

async function downloadFile(req, res) {
  try {
    const user = req.user;
    const id = Number(req.params.id);

    const file = await dbDownloadFile.findDownloadFile(id, user.id);

    if (!file) return res.status(404).send("File not found");

    if (process.env.SUPABASE_BUCKET_PUBLIC === "true" && file.url) {
      const downloadUrl = `${file.url}${
        file.url.includes("?") ? "&" : "?"
      }download=${encodeURIComponent(file.name)}`;
      return res.redirect(downloadUrl);
    }

    if (!file.storageKey) return res.status(500).send("Missing storagekey");
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(file.storageKey, 60, { download: file.name });

    if (error) throw error;
    return res.redirect(data.signedUrl);
  } catch (error) {
    console.error("Download file error:", error);
    return res.status(500).send("Couldnt not download file");
  }
}

module.exports = {
  uploadFile,
  downloadFile,
};
