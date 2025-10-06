const { createClient } = require("@supabase/supabase-js");

const { Router } = require("express");
const fileRouter = Router();
const isAuth = require("../middleware/authentication");
require("dotenv").config();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

fileRouter.post("/upload", isAuth);

module.exports = fileRouter;
