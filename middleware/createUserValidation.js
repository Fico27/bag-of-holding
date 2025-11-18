const { body, validationResult } = require("express-validator");

const createUserValidation = [
  body("firstname").trim().notEmpty().withMessage("First name is required!"),
  body("lastname").trim().notEmpty().withMessage("Last name is required!"),
  body("email")
    .isEmail({
      allow_display_name: false,
      require_display_name: false,
      allow_utf8_local_part: true,
      require_tld: true,
      allow_ip_domain: false,
      domain_specific_validation: false,
      blacklisted_chars: "",
      ignore_max_length: false,
    })
    // .normalizeEmail()
    .withMessage("Invalid email address!"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long!"),
  body("confirm_password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match!");
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signup", {
        errors: errors.array(),
        formInfo: req.body,
      });
    }
    next();
  },
];

module.exports = createUserValidation;
