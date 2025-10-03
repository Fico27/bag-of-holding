const passport = require("passport");

async function getLogin(req, res) {
  res.render("login");
}

async function postLogin(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).render("login", {
        errors: [{ msg: info?.message || "Invalid username/password" }],
      });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/dashboard");
    });
  })(req, res, next);
}

module.exports = {
  getLogin,
  postLogin,
};
