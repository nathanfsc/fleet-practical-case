const { ProductRepository } = require("./product.repository");

class ProductService {
  constructor({ productRepository = new ProductRepository() } = {}) {
    this.productRepository = productRepository;
  }

  async listProducts() {
    return this.productRepository.findAllWithProductVariants();
  }
}

module.exports = { ProductService };
