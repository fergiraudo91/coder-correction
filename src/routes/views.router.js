import { Router } from "express";
import passport from "passport";
import {
  redirect,
  getProducts,
  renderForm,
  deleteProduct,
  getProduct,
  addProduct,
  filterByCategory,
  getCartProducts,
  addToCart,
  renderRegister,
  renderLogin,
  register,
  login,
  logout,
  getUser,
  githubLogin,
} from "../controllers/views.controller.js";

import { viewsPassportCall, viewsAuthorization } from "../utils.js";

const router = Router();

router.get("/", redirect);
router.get(
  "/products",
  viewsPassportCall("current"),
  viewsAuthorization("user"),
  getProducts
);
router.get(
  "/products/create",
  viewsPassportCall("current"),
  viewsAuthorization("admin"),
  renderForm
);
router.get("/products/delete/:pid", deleteProduct);
router.get(
  "/products/:pid",
  viewsPassportCall("current"),
  viewsAuthorization("user"),
  getProduct
);
router.post("/products", addProduct);
router.post("/products/category", filterByCategory);
router.get(
  "/carts/:cid",
  viewsPassportCall("current"),
  viewsAuthorization("user"),
  getCartProducts
);
router.post("/carts/:cid/products/:pid", addToCart);
router.get("/sessions/register", renderRegister);
router.get("/sessions/login", renderLogin);
router.post("/sessions/register", viewsPassportCall("register"), register);
router.post('/sessions/login', passport.authenticate('login', { failureRedirect: '/session/faillogin' }), async (req, res) => {
  if (!req.user) {
      return res.status(400).send({ status: "error", error: "Invalid credentiales" })
  }
  console.log(req.user.token);
  console.log("HOLAAAAAAAA")
  res.cookie('cookieToken', req.user.token).redirect('/products')
  
})
router.get("/sessions/logout", logout);
router.get(
  "/sessions/user",
  viewsPassportCall("current"),
  viewsAuthorization("user"),
  getUser
);
router.get(
  "/api/sessions/githubcallback",
  passport.authenticate("github", { failureRedirect: "/session/login" }),
  githubLogin
);

export default router;
