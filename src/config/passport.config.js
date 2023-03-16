import passport from "passport";
import local from "passport-local";
import GithubStrategy from "passport-github2";
import UserModel from "../dao/models/user.model.js";
import CartModel from "../dao/models/cart.model.js";
import jwt from "passport-jwt";
import { createHash, isValidPassword, generateToken } from "../utils.js";
import config from "./config.js";

const {
  PRIVATE_KEY,
  COOKIE_NAME,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
} = config;

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const cookieExtractor = (req) => {
  const token = req && req.cookies ? req.cookies[COOKIE_NAME] : null;
  return token;
};

const LocalStrategy = local.Strategy;

const initializePassport = () => {
  // Registro
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          const { first_name, last_name, email, age, role = "user" } = req.body;
          if (!first_name || !last_name || !email || !age || !password)
            return res
              .status(400)
              .json({ status: "error", error: "All fields must be filled" });

          const user = await UserModel.findOne({ email: username });

          if (user) {
            console.log("User already exists");
            return done(null, false);
          }

          const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            role,
          };

          const userCart = await CartModel.create({ products: [] });
          newUser.cart = userCart._id;

          const result = await UserModel.create(newUser);

          return done(null, result);
        } catch (error) {
          return done("Error al registrar el usuario: " + error);
        }
      }
    )
  );

  // Login
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          if (username === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const admin = {
              _id: ADMIN_ID,
              email: username,
              password,
              first_name: "Admin",
              last_name: "Coder",
              age: 100,
              role: "admin",
            };

            const token = generateToken(admin);
            admin.token = token;

            return done(null, admin);
          }
          console.log("LLEGUE POR AQUI!");
          const user = await UserModel.findOne({ email: username })
            .lean()
            .exec();
            console.log(user);
          if (!user) {
            console.log("User doesn't exist");
            return done(null, false);
          }
          if (!isValidPassword(user, password)) {
            console.log("NO ES VALIDOOOO!")
            return done(null, false);
          }

          const token = generateToken(user);
          console.log("TOKEN!", token);
          user.token = token;
          console.log("LLEGUE ANTES DEL DONE")
          return done(null, user);
        } catch (error) {
          console.log("ENTRE EN EL CATCH!")
          return done(error);
        }
      }
    )
  );

  // Login con Github
  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await UserModel.findOne({ email: profile._json.email });

          if (!user) {
            const newUser = {
              first_name: profile._json.name,
              last_name: "",
              age: 0,
              email: profile._json.email,
              password: "",
            };

            const userCart = await CartModel.create({ products: [] });
            newUser.cart = userCart._id;

            const result = await UserModel.create(newUser);

            const token = generateToken(result);
            result.token = token;

            return done(null, result);
          }

          const token = generateToken(user);
          user.token = token;
          done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Current (JWT - obtener usuario actual por medio del token guardado en la cookie)
  passport.use(
    "current",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY,
      },
      async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload.user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await UserModel.findById(id);
    done(null, user);
  });
};

export default initializePassport;
