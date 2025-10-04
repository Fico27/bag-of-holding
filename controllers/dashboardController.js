async function getDashboard(req, res) {
  res.render("dashboard", { user: req.user });
}

module.exports = {
  getDashboard,
};
