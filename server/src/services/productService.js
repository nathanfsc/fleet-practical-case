const { ProductRepository } = require("../repositories/productRepository");

class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  async listProducts() {
    return this.productRepository.findAllWithProductVariants();
  }
}

module.exports = { ProductService };
