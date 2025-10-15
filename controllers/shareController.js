const sharedDb = require("../db/sharedDb");
const { supabase } = require("../db/supabase");

const BUCKET = process.env.SUPABASE_BUCKET || "";

async function viewShared(req, res) {
  const linkId = req.params.id;
  const currentFolderId = req.query.folderId
    ? Number(req.query.folderId)
    : null;

  const link = await sharedDb.findSharedLink(linkId);

  if (!link || link.expires <= new Date()) {
    return res.status(404).send("Link not found for expired.");
  }

  const folderToShow = currentFolderId ?? link.folderId;

  const [folders, files] = await Promise.all([
    sharedDb.getFoldersByParentPublic(folderToShow),
    sharedDb.getFilesByFolderPublic(folderToShow),
  ]);

  res.render("shared", {
    linkId,
    currentFolderId: folderToShow,
    breadcrumbs: [],
    items: [
      ...folders.map((folder) => ({
        type: "folder",
        id: folder.id,
        name: folder.name,
        date: folder.createdAt,
      })),
      ...files.map((file) => ({
        type: "file",
        id: file.id,
        name: file.name,
        size: file.size,
        date: file.uploadTime,
      })),
    ],
    errors: [],
  });
}

async function downloadShared(req, res) {
  const shareId = req.params.id;
  const fileId = Number(req.params.fileId);

  const link = await sharedDb.findSharedDownload(shareId);

  if (!link || link.expires <= new Date()) {
    return res.status(404).send("Link not found or expired");
  }

  const file = await sharedDb.getFileIfApproved(fileId, link.folderId);
  if (!file)
    return res.status(404).send("File not found in this shared folder.");

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(file.storageKey, 60, { download: file.name });

  if (error) return res.status(500).send("Cannot sign file");

  return res.redirect(data.signedUrl);
}

module.exports = {
  viewShared,
  downloadShared,
};
