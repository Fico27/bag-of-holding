const db = require("../db/getfiles");

async function getDashboard(req, res) {
  try {
    const user = req.user;
    const files = await db.getFilesByUser(user.id);

    res.render("dashboard", { user, files, errors: [] });
  } catch (error) {
    console.error(error);
    res.render("dashboard", {
      user: req.user,
      files: [],
      errors: [{ msg: "failed to load files." }],
    });
  }
}

module.exports = {
  getDashboard,
};
