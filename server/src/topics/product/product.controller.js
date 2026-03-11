const { sendErrorResponse } = require("../../utils/httpError");
const { ProductService } = require("./product.service");

class ProductController {
  constructor({ productService = new ProductService() } = {}) {
    this.productService = productService;
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
