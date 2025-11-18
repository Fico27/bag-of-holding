const bcrypt = require("bcryptjs");
const { createUser } = require("../db/createNewUser");

async function getSignup(req, res) {
  res.render("signup", { errors: [], formInfo: {} });
}

async function postSignup(req, res) {
  const { email, password, firstname, lastname } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser(email, hashedPassword, firstname, lastname);

    res.redirect("/login");
  } catch (error) {
    console.error("Signup Error", error);
    res.render("signup", {
      errors: [{ msg: "Database error" }],
      formInfo: req.body,
    });
  }
}

module.exports = {
  getSignup,
  postSignup,
};
