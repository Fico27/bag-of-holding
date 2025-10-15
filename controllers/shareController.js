const sharedDb = require("../db/sharedDb");

async function viewShared(req, res) {
  const id = req.params.id;
  const link = sharedDb.findSharedLink(id);

  if (!link || link.expires <= new Date()) {
    return res.status(404).send("Link not found for expired.");
  }

  const [folders, files] = await Promise.all([
    sharedDb.getFoldersByParentPublic(link.folderId),
    sharedDb.getFilesByFolderPublic(link.folderId),
  ]);

  res.render("shared", {
    linkId: link.id,
    folderId: link.folderId,
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
        date: file.createdAt,
      })),
    ],
  });
}
