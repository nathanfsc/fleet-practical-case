const { sendErrorResponse } = require("../utils/httpError");
const { ProductService } = require("../services/productService");

class ProductController {
  constructor() {
    this.productService = new ProductService();
    this.listProducts = this.listProducts.bind(this);
  }

  async listProducts(req, res) {
    try {
      const products = await this.productService.listProducts();
      res.json(products);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to fetch products");
    }
  }
}

module.exports = { ProductController };
