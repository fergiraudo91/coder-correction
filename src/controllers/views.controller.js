import CartModel from "../dao/models/cart.model.js";
import ProductModel from "../dao/models/product.model.js";

// Redirección para empezar por la pantalla de login
export const redirect = (req, res) => res.redirect("/sessions/login");

// PRODUCTS
// Get products
export const getProducts = async (req, res) => {
  try {
    const limit = req.query?.limit || 10;
    const page = req.query?.page || 1;
    const category = req.query?.category;
    const sortQuery = req.query?.sort;
    const sortOrder = req.query?.sortorder || "desc";
    const stock = req.query?.stock;

    const query = {
      ...(category ? { categories: category } : null),
      ...(stock ? { stock: { $gt: 0 } } : null),
    };

    const sort = {};
    if (sortQuery) {
      sort[sortQuery] = sortOrder;
    }

    const options = {
      limit,
      page,
      sort,
      lean: true,
    };

    const products = await ProductModel.paginate(query, options);

    products.prevLink = products.hasPrevPage
      ? `/products?page=${products.prevPage}&limit=${limit}${
          category ? `&category=${category}` : ""
        }${stock ? `&stock=${stock}` : ""}`
      : "";
    products.nextLink = products.hasNextPage
      ? `/products?page=${products.nextPage}&limit=${limit}${
          category ? `&category=${category}` : ""
        }${stock ? `&stock=${stock}` : ""}`
      : "";

    const user = req.user;
    res.render("products", { products, user });
  } catch (error) {
    console.log(error);
    res.render("base", {error});
  }
};

// Create products form
export const renderForm = async (req, res) => {
  const user = req.user;
  res.render("create", { user });
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const result = await ProductModel.deleteOne({ _id: pid });
    res.redirect("/products");
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error });
  }
};

// Get one product
export const getProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await ProductModel.findOne({ _id: pid }).lean().exec();
    const user = req.user;

    res.render("oneProduct", { product, user });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error });
  }
};

// Add product
export const addProduct = async (req, res) => {
  try {
    // const newProduct = await ProductModel.create(req.body)
    const newProduct = req.body;
    const generatedProduct = new ProductModel(newProduct);
    await generatedProduct.save();

    res.redirect("/products/" + generatedProduct._id);
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error });
  }
};

// Filter by category
export const filterByCategory = async (req, res) => {
  try {
    const category = req.body.category;
    res.redirect(`/products?category=${category}`);
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error });
  }
};

// CARTS
// Get cart products
export const getCartProducts = async (req, res) => {
  try {
    const cid = req.params.cid;
    const products = await CartModel.findOne({ _id: cid })
      .populate("products.product")
      .lean();

    const user = req.user;

    res.render("cart", { products, user });
  } catch (error) {
    console.log(error);
    res.json({ result: "error", error });
  }
};

// Add product to cart
export const addToCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;

    const cart = await CartModel.findOne({ _id: cid });
    if (!cart)
      return res.send({
        status: "error",
        error: "No se ha encontrado el carrito",
      });

    const product = await ProductModel.findOne({ _id: pid });
    if (!product)
      return res.send({
        status: "error",
        error: "No se ha encontrado el producto",
      });

    const productIndex = cart.products.findIndex((p) =>
      p.product.equals(product._id)
    );
    if (productIndex === -1) {
      cart.products.push({ product: product._id, quantity: 1 });
      await cart.save();
    } else {
      cart.products[productIndex].quantity++;
      await CartModel.updateOne({ _id: cid }, cart);
    }

    res.redirect("/carts/" + cid);
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error });
  }
};

// SESSIONS
// Vista para registrar usuarios
export const renderRegister = (req, res) => {
  res.render("sessions/register");
};

// Vista de login
export const renderLogin = (req, res) => {
  res.render("sessions/login");
};

// Crear usuarios en la DB
export const register = async (req, res) => {
  res.redirect("/sessions/login");
};

// Login
export const login = async (req, res) => {
  const user = req.user;
  if (!user)
    return res
      .status(400)
      .render("errors/base", {error: "Invalid credentials", user});


  res.cookie("cookieToken", user.token).redirect("/products");
};

// Logout
export const logout = (req, res) => {
  res.clearCookie("cookieToken").redirect("/sessions/login");
};

// Get user
export const getUser = (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(404).render("errors/base", {
      error: "User not found",
    });
  }

  res.render("sessions/user", { user });
};

// Iniciar sesión con Github
export const githubLogin = async (req, res) => {
  return res.cookie("cookieToken", req.user.token).redirect("/products");
};
