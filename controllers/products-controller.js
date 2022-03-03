const Product = require("./../models/product-model");

async function getProducts(req, res, next) {
  try {
    const products = await Product.fetchProducts();
    res.render("customer/products/all-products", { products: products });
  } catch (error) {
    return next(error);
  }
}

async function productDetails(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    res.render("customer/products/product-details", { product: product });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  productDetails: productDetails,
  getProducts: getProducts,
};
