const { getFilesByFolder } = require("../db/getfiles");
const { getFoldersByParent } = require("../db/getfolders");
const { getOwnedFolder, getFolderTrail } = require("../db/breadcrumb");

async function getDashboard(req, res) {
  const user = req.user;
  // get current folderid via query
  const folderId = req.query.folderId ? Number(req.query.folderId) : null;

  try {
    const [folders, files, breadcrumbs] = await Promise.all([
      getFoldersByParent(user.id, folderId),
      getFilesByFolder(user.id, folderId),
      folderId !== null
        ? getFolderTrail(user.id, folderId)
        : Promise.resolve([]),
    ]);

    const items = [
      ...folders.map((folder) => ({
        type: "folder",
        id: folder.id,
        name: folder.name,
        size: null,
        date: folder.createdAt,
      })),
      ...files.map((file) => ({
        type: "file",
        id: file.id,
        name: file.name,
        size: file.size,
        date: file.uploadTime,
      })),
    ];

    items.sort((a, b) => b.type.localeCompare(a.type));

    res.render("dashboard", {
      user,
      items,
      currentFolderId: folderId,
      breadcrumbs,
      errors: [],
    });
  } catch (error) {
    console.error(error);
    res.render("dashboard", {
      user: req.user,
      items: [],
      currentFolderId: folderId,
      breadcrumbs: [],
      errors: [{ msg: "failed to load files." }],
    });
  }
}

module.exports = {
  getDashboard,
};
