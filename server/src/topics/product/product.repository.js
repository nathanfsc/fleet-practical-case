const { dbClient } = require("../../database");

class ProductRepository {
  constructor({ databaseClient = dbClient } = {}) {
    this.dbClient = databaseClient;
  }

  async findAllWithProductVariants() {
    const sql = `
      SELECT
        p.id,
        p.name,
        pv.id AS variant_id,
        pv.configuration,
        pv.sku,
        pv.stock,
        (p.base_price + pv.price_delta) AS price
      FROM products p
      INNER JOIN product_variants pv ON p.id = pv.product_id
      ORDER BY p.id DESC
    `;

    return this.dbClient.all(sql);
  }

  findVariantsByIds(variantIds) {
    if (!variantIds.length) {
      return [];
    }

    const placeholders = variantIds.map(() => "?").join(", ");

    return this.dbClient.all(
      `
        SELECT
          p.id,
          p.name,
          pv.id AS variant_id,
          pv.configuration,
          pv.sku,
          pv.stock,
          (p.base_price + pv.price_delta) AS price
        FROM products p
        INNER JOIN product_variants pv ON p.id = pv.product_id
        WHERE pv.id IN (${placeholders})
      `,
      variantIds,
    );
  }

  decrementVariantStock({ productVariantId, quantity }) {
    return this.dbClient.run(
      `
        UPDATE product_variants
        SET stock = stock - ?
        WHERE id = ?
        AND stock >= ?
      `,
      [quantity, productVariantId, quantity],
    );
  }

  decrementVariantStocks(items) {
    if (!items.length) {
      return Promise.resolve({ changes: 0, lastID: 0 });
    }

    const caseClauses = items
      .map(() => "WHEN ? THEN stock - ?")
      .join(" ");
    const whereClauses = items
      .map(() => "(id = ? AND stock >= ?)")
      .join(" OR ");
    const params = [
      ...items.flatMap((item) => [item.productVariantId, item.quantity]),
      ...items.flatMap((item) => [item.productVariantId, item.quantity]),
    ];

    return this.dbClient.run(
      `
        UPDATE product_variants
        SET stock = CASE id ${caseClauses} ELSE stock END
        WHERE ${whereClauses}
      `,
      params,
    );
  }
}

module.exports = { ProductRepository };
