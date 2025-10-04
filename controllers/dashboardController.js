async function getDashboard(req, res) {
  res.render("dashboard", { user: req.user, items: [] });
}

module.exports = {
  getDashboard,
};
