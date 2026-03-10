const { dbClient } = require("../database");

class EmployeeRepository {
  constructor() {
    this.dbClient = dbClient;
  }

  async findAll(filters) {
    const role = filters.role || "";
    const search = filters.search || "";
    let sql = `
      SELECT
        e.id,
        e.name,
        e.role,
        e.created_at,
        COUNT(d.id) AS device_count
      FROM employees e
      LEFT JOIN devices d ON d.owner_id = e.id
      WHERE 1 = 1
    `;
    const params = [];

    if (role) {
      sql += " AND e.role = ?";
      params.push(role);
    }

    if (search) {
      sql += " AND (LOWER(e.name) LIKE ? OR LOWER(e.role) LIKE ?)";
      params.push(`%${search.toLowerCase()}%`);
      params.push(`%${search.toLowerCase()}%`);
    }

    sql += " GROUP BY e.id ORDER BY e.id DESC";

    return this.dbClient.all(sql, params);
  }

  findById(id) {
    return this.dbClient.get(
      "SELECT id, name, role, created_at FROM employees WHERE id = ?",
      [id],
    );
  }

  findByIds(ids) {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }

    const placeholders = ids.map(() => "?").join(", ");

    return this.dbClient.all(
      `SELECT id, name, role, created_at FROM employees WHERE id IN (${placeholders})`,
      ids,
    );
  }

  async create(employee) {
    const result = await this.dbClient.run(
      "INSERT INTO employees (name, role) VALUES (?, ?)",
      [employee.name, employee.role],
    );

    return this.findById(result.lastID);
  }

  async update(id, employee) {
    const result = await this.dbClient.run(
      "UPDATE employees SET name = ?, role = ? WHERE id = ?",
      [employee.name, employee.role, id],
    );

    return {
      changes: result.changes,
      employee: result.changes ? await this.findById(id) : null,
    };
  }

  deleteById(id) {
    return this.dbClient.run("DELETE FROM employees WHERE id = ?", [id]);
  }
}

module.exports = { EmployeeRepository };
