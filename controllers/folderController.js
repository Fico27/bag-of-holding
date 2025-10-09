const { createFolder } = require("../db/createfolder");
const { ownerParentCheck } = require("../db/folderCheck");

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

module.exports = {
  postCreateFolder,
};
