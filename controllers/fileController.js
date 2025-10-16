require("dotenv").config();
const { supabase } = require("../db/supabase");
const { uploadToDb } = require("../db/uploadFile");
const { ownerFolderCheck } = require("../db/folderCheck");
const dbDownloadFile = require("../db/downloadFile");
const dbFileRepo = require("../db/fileRepo");
const createShare = require("../db/createShare");
const fileRepo = require("../db/fileRepo");

const BUCKET = process.env.SUPABASE_BUCKET || "";

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
    if (Number.isNaN(id)) return res.status(400).send("Bad file id");

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

async function renameFile(req, res) {
  try {
    const user = req.user;
    const id = Number(req.params.id);
    const currentFolderId = req.body.currentFolderId
      ? Number(req.body.currentFolderId)
      : null;
    const newName = req.body.name;

    if (!newName) {
      return res
        .status(400)
        .redirect(
          currentFolderId
            ? `/dashboard?folderId=${currentFolderId}`
            : "/dashboard"
        );
    }

    const file = await dbFileRepo.getOwnedFile(user.id, id);
    if (!file) return res.status(404).send("File not found!");

    await dbFileRepo.renameFile(user.id, id, newName);
    return res.redirect(
      currentFolderId ? `/dashboard?folderId=${currentFolderId}` : "/dashboard"
    );
  } catch (error) {
    console.error("Error renaming file:", error);
    return res.status(500).send("Could not rename file.");
  }
}

async function deleteFile(req, res) {
  try {
    const user = req.user;
    const id = Number(req.params.id);
    const currentFolderId = req.body.currentFolderId
      ? Number(req.body.currentFolderId)
      : null;

    const file = await dbFileRepo.getOwnedFile(user.id, id);
    if (!file) return res.status(404).send("File not found!");

    if (file.storageKey) {
      const { error } = await supabase.storage
        .from(BUCKET)
        .remove([file.storageKey]);

      if (error) {
        console.warn("Failed to remove file:", file.storageKey, error.message);
      }
    }
    await dbFileRepo.deleteFile(id, user.id);
    return res.redirect(
      currentFolderId ? `/dashboard?folderId=${currentFolderId}` : "/dashboard"
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).send("Could not delete file");
  }
}

async function postCreateFileShare(req, res) {
  const user = req.user;
  const fileId = Number(req.params.id);
  const duration = Number(req.params.durationInHours || 24);

  const file = await fileRepo.getOwnedFile(user.id, fileId);

  if (!file) return res.status(404).send("File not found");

  const expires = new Date(Date.now() + duration * 3600 * 1000);
  const link = await createShare.createShareLinkForFile({ fileId, expires });

  const absoluteUrl = `${req.protocol}://${req.get("host")}/shared/${link.id}`;

  return res.render("share-created", {
    url: absoluteUrl,
    expires: link.expires,
  });
}

module.exports = {
  uploadFile,
  downloadFile,
  renameFile,
  deleteFile,
  postCreateFileShare,
};
