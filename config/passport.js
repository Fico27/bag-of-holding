const passport = require("passport");
const LocalStrategy = require("passport-local");
const { PrismaClient } = require("../generated/prisma");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      return done(null, user);
    } catch (err) {
      console.error(err);
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
