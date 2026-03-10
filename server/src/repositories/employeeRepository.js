function createEmployeeRepository(dbClient) {
  async function findAll(filters) {
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

    return dbClient.all(sql, params);
  }

  function findById(id) {
    return dbClient.get(
      "SELECT id, name, role, created_at FROM employees WHERE id = ?",
      [id],
    );
  }

  async function create(employee) {
    const result = await dbClient.run(
      "INSERT INTO employees (name, role) VALUES (?, ?)",
      [employee.name, employee.role],
    );

    return findById(result.lastID);
  }

  async function update(id, employee) {
    const result = await dbClient.run(
      "UPDATE employees SET name = ?, role = ? WHERE id = ?",
      [employee.name, employee.role, id],
    );

    return {
      changes: result.changes,
      employee: result.changes ? await findById(id) : null,
    };
  }

  function deleteById(id) {
    return dbClient.run("DELETE FROM employees WHERE id = ?", [id]);
  }

  return {
    create,
    deleteById,
    findAll,
    findById,
    update,
  };
}

module.exports = { createEmployeeRepository };
