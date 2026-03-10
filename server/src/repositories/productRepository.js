const { dbClient } = require("../database");

class ProductRepository {
  constructor() {
    this.dbClient = dbClient;
  }

  async findAllWithProductVariants() {
    const sql = `
      SELECT
        p.id,
        p.name,
        p.base_price,
        pv.id AS variant_id,
        pv.price_delta,
        pv.configuration
      FROM products p
      INNER JOIN product_variants pv ON p.id = pv.product_id
      ORDER BY p.id DESC
    `;

    return this.dbClient.all(sql);
  }
}

module.exports = { ProductRepository };
