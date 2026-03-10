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
        pv.id AS variant_id,
        pv.configuration,
        pv.stock,
        (p.base_price + pv.price_delta) AS price
      FROM products p
      INNER JOIN product_variants pv ON p.id = pv.product_id
      ORDER BY p.id DESC
    `;

    const rows = await this.dbClient.all(sql);

    console.log("COUCOU -> ", rows);
    return rows;
  }
}

module.exports = { ProductRepository };
