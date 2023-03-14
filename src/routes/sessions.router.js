import { Router } from "express";
import passport from "passport";
import { passportCall } from "../utils.js";
import {
  register,
  login,
  logout,
  getUser,
} from "../controllers/sessions.controller.js";

const router = Router();

router.post("/register", passportCall("register"), register);
router.post("/login", passportCall("login"), login);
router.get("/logout", logout);
router.get("/current", passportCall("current"), getUser);
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

export default router;