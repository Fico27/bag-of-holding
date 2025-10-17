const sharedDb = require("../db/sharedDb");
const { supabase } = require("../db/supabase");
const archiver = require("archiver");

const BUCKET = process.env.SUPABASE_BUCKET || "";

async function viewShared(req, res) {
  try {
    const linkId = req.params.id;
    const currentFolderId = req.query.folderId
      ? Number(req.query.folderId)
      : null;

    const link = await sharedDb.findSharedLink(linkId);

    if (!link || link.expires <= new Date()) {
      return res.status(404).send("Link not found for expired.");
    }

    // If there is a single file for download find it if not it's a folder.
    if (link.fileId) {
      const file = await sharedDb.findPublicFile(link.fileId);
      if (!file) return res.status(404).send("File not found.");

      return res.render("shared", {
        linkId,
        currentFolderId: null, // it is a single file
        breadcrumbs: [], //REMINDER: ADD THIS LOGIC LATER
        items: [
          {
            type: "file",
            id: file.id,
            name: file.name,
            size: file.size,
            date: file.uploadTime,
          },
        ],
        errors: [],
      });
    }

    const folderToShow = currentFolderId ?? link.folderId;

    const [folders, files] = await Promise.all([
      sharedDb.getChildFoldersByPublic(folderToShow),
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
  } catch (error) {
    console.error("Error with ViewShared:", error);
    return res.status(500).send("Could not load shared view.");
  }
}

async function downloadShared(req, res) {
  const shareId = req.params.id;
  const fileId = req.params.fileId ? Number(req.params.fileId) : null;

  const link = await sharedDb.findSharedDownload(shareId);
  if (!link || link.expires <= new Date()) {
    return res.status(404).send("Link not found or expired");
  }

  let file;

  if (link.fileId) {
    if (fileId && fileId !== link.fileId) {
      return res.status(404).send("File not found for this share");
    }
    file = await sharedDb.findPublicFile(link.fileId);
  } else {
    if (!fileId) return res.status(400).send("Missing file Id");
    file = await sharedDb.getFileIfApproved(fileId, link.folderId);
  }

  if (!file) {
    return res.status(404).send("File not found in this shared folder.");
  }
  if (!file.storageKey) return res.status(500).send("Missing storage key");

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(file.storageKey, 60, { download: file.name });

  if (error) return res.status(500).send("Cannot sign file");

  return res.redirect(data.signedUrl);
}

async function downloadSingleFile(req, res) {
  try {
    const shareId = req.params.id;

    const link = await sharedDb.findSharedDownload(shareId);
    if (!link || link.expires <= new Date()) {
      return res.status(404).send("Link not found for expired.");
    }

    if (!link.fileId) {
      return res.status(400).send("This share is not a single-file link.");
    }

    const file = await sharedDb.findPublicFile(link.fileId);
    if (!file) return res.status(404).send("File not found");

    if (!file.storageKey) return res.status(500).send("Missing storage key");

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(file.storageKey, 60, { download: file.name });

    if (error) {
      console.error("Error signing on download:", error);
      return res.status(500).send("Cannot sign file.");
    }
    return res.redirect(data.signedUrl);
  } catch (error) {
    console.error("Error downloading single file:", error);
    return res.status(500).send("Could not download file.");
  }
}

async function downloadSharedFolder(req, res) {
  try {
    const shareId = req.params.id;
    const requestedFolderId = req.query.folderId
      ? Number(req.query.folderId)
      : null;

    const link = await sharedDb.findSharedDownload(shareId);
    if (!link || link.expires <= new Date()) {
      return res.status(404).send("Link not found or expires");
    }

    if (link.fileId) {
      return res
        .status(400)
        .send("This is a share for a single file, not a folder");
    }

    const targetFolderId = requestedFolderId ?? link.folderId;

    const isFolderShared = await sharedDb.isFolderWithinShare(
      targetFolderId,
      link.folderId
    );
    if (!isFolderShared) return res.status(403).send("Folder not shared.");

    // get all files
    const entries = await sharedDb.collectEntriesForZip(targetFolderId);
    if (entries.length === 0) return res.status(400).send("Folder is empty");

    const folderName = await sharedDb.findPublicFolder(targetFolderId);

    const zipName = `${folderName?.name || "folder"}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(zipName)}"`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (error) => {
      console.error("Archiver error (shared folder):", error);
      try {
        res.status(500).end("Archive error");
      } catch (error) {
        return error;
      }
    });
    archive.pipe(res);

    // fetch files from Supabase and append to zip
    for (const { storageKey, zipPath } of entries) {
      if (!storageKey) continue;

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .download(storageKey);
      if (error) {
        console.warn("Skipped in shared zip:", storageKey, error.message);
        continue;
      }
      const buffer = Buffer.from(await data.arrayBuffer());
      archive.append(buffer, { name: zipPath });
    }
    archive.finalize();
  } catch (error) {
    console.error("Shared folder download error:", error);
    return res.status(500).send("Could not download shared folder");
  }
}

module.exports = {
  viewShared,
  downloadShared,
  downloadSingleFile,
  downloadSharedFolder,
};
