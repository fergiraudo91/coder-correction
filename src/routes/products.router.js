import { Router } from "express";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";

const router = Router();

router.get("/", getProducts);
router.get("/:pid", getProduct);
router.post("/", addProduct);
router.put("/:pid", updateProduct);
router.delete("/:pid", deleteProduct);

export default router;