const { getFilesByFolder } = require("../db/getfiles");
const { getFoldersByParent } = require("../db/getfolders");

async function getDashboard(req, res) {
  const user = req.user;
  // get current folderid via query
  const folderId = req.query.folderId ? Number(req.query.folderId) : null;

  try {
    const [folders, files] = await Promise.all([
      getFoldersByParent(user.id, folderId),
      getFilesByFolder(user.id, folderId),
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
      errors: [],
    });
  } catch (error) {
    console.error(error);
    res.render("dashboard", {
      user: req.user,
      items: [],
      currentFolderId: folderId,
      errors: [{ msg: "failed to load files." }],
    });
  }
}

module.exports = {
  getDashboard,
};
