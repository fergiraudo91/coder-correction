import productModel from "../dao/models/product.model.js";

export const getProducts = async (req, res) => {
  try {
    const limit = req.query?.limit || 10;
    const page = req.query?.page || 1;
    const category = req.query?.category;
    const sortQuery = req.query?.sort;
    const sortOrder = req.query?.sortorder || "desc";
    const stock = req.query?.stock;

    // Query dinámico. Puede filtrar por categoría, por stock o por ambas.
    // Si no se pasa ninguno de los dos, busca todos los productos {}
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

    const products = await productModel.paginate(query, options);

    res.json({ status: "success", payload: products });
  } catch (error) {
    console.log(error);
    res.json({ result: "error", error });
  }
};

export const getProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productModel.findOne({ _id: pid }).lean().exec();
    res.json({ status: "success", payload: product });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error });
  }
};

export const addProduct = async (req, res) => {
  try {
    // const newProduct = await productModel.create(req.body)
    const newProduct = req.body;
    const generatedProduct = new productModel(newProduct);
    await generatedProduct.save();

    res.json({ status: "success", payload: newProduct });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const productToUpdate = req.body;
    const result = await productModel.updateOne({ _id: pid }, productToUpdate);

    res.json({ status: "success", payload: result });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const result = await productModel.deleteOne({ _id: pid });

    res.json({ status: "success", payload: result });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error });
  }
};
