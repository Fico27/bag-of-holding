const { createFolder } = require("../db/createfolder");

async function postCreateFolder(req, res) {
  const user = req.user;
  const name = req.body.name.trim();

  try {
    if (!name) {
      return res.status(400).render("dashboard", {
        user,
        items: [],
        errors: [{ msg: "Folder name is required" }],
      });
    }

    if (/[\\\/]/.test(name)) {
      return res.status(400).render("dashboard", {
        user,
        items: [],
        errors: [{ msg: "Folder name cannot contain slashes." }],
      });
    }

    await createFolder(user.id, name);

    res.redirect("/dashboard");
  } catch (error) {
    const msg =
      err?.code === "P2002"
        ? "Folder already exists."
        : "Could not create folder.";
    console.error("Create folder errro:", error);
    return res.status(500).render("dashboard", {
      user,
      items: [],
      errors: [{ msg }],
    });
  }
}

module.exports = {
  postCreateFolder,
};
