const { getFilesByUser } = require("../db/getfiles");
const { getRootFolders } = require("../db/getfolders");

async function getDashboard(req, res) {
  try {
    const user = req.user;
    const [folders, files] = await Promise.all([
      getRootFolders(user.id),
      getFilesByUser(user.id),
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

    res.render("dashboard", { user, items, errors: [] });
  } catch (error) {
    console.error(error);
    res.render("dashboard", {
      user: req.user,
      items: [],
      errors: [{ msg: "failed to load files." }],
    });
  }
}

module.exports = {
  getDashboard,
};
