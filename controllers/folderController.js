const { createFolder } = require("../db/createfolder");
const { ownerParentCheck } = require("../db/folderCheck");
const dbDownloadFolder = require("../db/downloadFolder");
const dbFolderRepo = require("../db/folderRepo");
const archiver = require("archiver");
const { supabase } = require("../db/supabase");
const createShare = require("../db/createShare");

const BUCKET = process.env.SUPABASE_BUCKET || "";

async function postCreateFolder(req, res) {
  const user = req.user;
  const name = req.body.name.trim();
  // Get current parentId via create folder form.
  const parentId = req.body.parentId ? Number(req.body.parentId) : null;

  try {
    if (!name) {
      return res.status(400).render("dashboard", {
        user,
        items: [],
        currentFolderId: parentId,
        errors: [{ msg: "Folder name is required" }],
      });
    }

    if (/[\\\/]/.test(name)) {
      return res.status(400).render("dashboard", {
        user,
        items: [],
        currentFolderId: parentId,
        errors: [{ msg: "Folder name cannot contain slashes." }],
      });
    }

    if (parentId !== null) {
      const parent = await ownerParentCheck(parentId, user.id);
      if (!parent) {
        return res.status(404).render("dashboard", {
          user,
          items: [],
          currentFolderId: null,
          errors: [{ msg: "Parent folder not found" }],
        });
      }
    }

    await createFolder(user.id, name, parentId);

    res.redirect(parentId ? `/dashboard?folderId=${parentId}` : "/dashboard");
  } catch (error) {
    const msg =
      error?.code === "P2002"
        ? "Folder already exists."
        : "Could not create folder.";
    console.error("Create folder errro:", error);
    return res.status(500).render("dashboard", {
      user,
      items: [],
      currentFolderId: parentId,
      errors: [{ msg }],
    });
  }
}

async function collectFileRecursivly({ userId, folderId, pathParts = [] }) {
  const folder = await dbDownloadFolder.getDownloadFolder(folderId, userId);

  if (!folder) return [];

  const thisPath = [...pathParts, folder.name];

  const files = await dbDownloadFolder.getFilesInFolder(folderId, userId);

  const entries = (await files).map((file) => ({
    storageKey: file.storageKey,
    zipPath: [...thisPath, file.name].join("/"),
  }));

  const childFolder = await dbDownloadFolder.getChildFolder(folderId, userId);

  for (const child of childFolder) {
    const childEntries = await collectFileRecursivly({
      userId,
      folderId: child.id,
      pathParts: thisPath,
    });
    entries.push(...childEntries);
  }
  return entries;
}

async function downloadFolder(req, res) {
  try {
    const user = req.user;
    const folderId = Number(req.params.id);

    const folder = await dbDownloadFolder.getDownloadFolder(folderId, user.id);

    if (!folder) {
      return res.status(404).send("Folder not found");
    }

    const entries = await collectFileRecursivly({
      userId: user.id,
      folderId: folder.id,
      pathParts: [],
    });

    const zipName = `${folder.name}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(zipName)}"`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (error) => {
      console.error("Archiver error:", error);
      try {
        res.status(500).end("Archive error");
      } catch (err) {}
    });

    archive.pipe(res);

    for (const entry of entries) {
      //skip over bad files
      if (!entry.storageKey) continue;

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .download(entry.storageKey);

      if (error) {
        console.warn("Skipped file:", entry.storageKey, error.message);
        continue;
      }

      const buffer = Buffer.from(await data.arrayBuffer());

      archive.append(buffer, { name: entry.zipPath });
    }

    archive.finalize();
  } catch (error) {
    console.error("Download folder error:", error);
    return res.status(500).send("Could not download folder");
  }
}

async function renameFolder(req, res) {
  try {
    const user = req.user;
    const id = Number(req.params.id);
    const currentFolderId = req.body.currentFolderId
      ? Number(req.body.currentFolderId)
      : null;
    const newName = req.body.name.trim();

    const folder = await dbFolderRepo.getOwnedFolder(user.id, id);

    if (!folder) return res.status(404).send("Folder not found");
    if (!newName)
      return res
        .status(400)
        .redirect(
          currentFolderId
            ? `/dsahboard?FolderId=${currentFolderId}`
            : "/dashboard"
        );

    await dbFolderRepo.renameFolder(user.id, id, newName);
    return res.redirect(
      currentFolderId ? `/dashboard?folderId=${currentFolderId}` : "/dashboard"
    );
  } catch (error) {
    console.error("Rename folder error:", error);
    return res.status(500).send("Could not rename folder.");
  }
}

async function deleteFolder(req, res) {
  try {
    const user = req.user;
    const id = Number(req.params.id);

    const folder = await dbFolderRepo.getOwnedFolder(user.id, id);
    if (!folder) return res.status(404).send("Folder not found");

    const { files, folders } = await dbFolderRepo.collectItemsInFolder(
      user.id,
      id
    );

    const keys = files.map((file) => file.storageKey).filter(Boolean);
    if (keys.length) {
      const { error } = await supabase.storage.from(BUCKET).remove(keys);
      if (error) console.warn("Removal from storage failed:", error.message);
    }
    await dbFolderRepo.deleteFolderCascade(files, folders);

    return res.redirect(
      folder.parentId ? `/dashboard?folderId=${folder.parentId}` : "/dashboard"
    );
  } catch (error) {
    console.error("Delete folder error:", error);
    return res.status(500).send("Could not delete folder");
  }
}

async function postCreateShare(req, res) {
  const user = req.user;
  const folderId = Number(req.params.id);
  const duration = Number(req.body.durationInHours || 24);

  const folder = await dbFolderRepo.getOwnedFolder(user.id, folderId);
  if (!folder) return res.status(404).send("Folder not found");

  const expires = new Date(Date.now() + duration * 3600 * 1000);

  const link = await createShare.createShareLink({ folderId, expires });

  const absoluteUrl = `${req.protocol}://${req.get("host")}/shared/${link.id}`;

  res.render("share-created", {
    url: absoluteUrl,
    expires: link.expires,
  });
}

module.exports = {
  postCreateFolder,
  collectFileRecursivly,
  downloadFolder,
  renameFolder,
  deleteFolder,
  postCreateShare,
};
