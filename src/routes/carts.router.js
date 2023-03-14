import { Router } from "express";
import {
  createCart,
  getProducts,
  addProduct,
  updateCart,
  updateQuantity,
  emptyCart,
  deleteProduct,
} from "../controllers/carts.controller.js";

const router = Router();

router.post("/", createCart);
router.get("/:cid", getProducts);
router.post("/:cid/products/:pid", addProduct);
router.put("/:cid", updateCart);
router.put("/:cid/products/:pid", updateQuantity);
router.delete("/:cid", emptyCart);
router.delete("/:cid/products/:pid", deleteProduct);

export default router;
