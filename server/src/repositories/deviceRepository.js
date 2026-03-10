function createDeviceRepository(dbClient) {
  async function findAll(filters) {
    const type = filters.type || "";
    const ownerId = filters.ownerId || "";
    const search = filters.search || "";
    let sql = `
      SELECT
        d.id,
        d.name,
        d.type,
        d.owner_id,
        d.created_at
      FROM devices d
      WHERE 1 = 1
    `;
    const params = [];

    if (type) {
      sql += " AND d.type = ?";
      params.push(type);
    }

    if (ownerId) {
      sql += " AND d.owner_id = ?";
      params.push(ownerId);
    }

    if (search) {
      sql += " AND (LOWER(d.name) LIKE ? OR LOWER(d.type) LIKE ?)";
      params.push(`%${search.toLowerCase()}%`);
      params.push(`%${search.toLowerCase()}%`);
    }

    sql += " ORDER BY d.id DESC";

    return dbClient.all(sql, params);
  }

  function findDetailedById(id) {
    return dbClient.get(
      `
      SELECT
        d.id,
        d.name,
        d.type,
        d.owner_id,
        d.created_at,
        e.name AS owner_name
      FROM devices d
      LEFT JOIN employees e ON e.id = d.owner_id
      WHERE d.id = ?
      `,
      [id],
    );
  }

  async function create(device) {
    const result = await dbClient.run(
      "INSERT INTO devices (name, type, owner_id) VALUES (?, ?, ?)",
      [device.name, device.type, device.ownerId],
    );

    return findDetailedById(result.lastID);
  }

  async function update(id, device) {
    const result = await dbClient.run(
      "UPDATE devices SET name = ?, type = ?, owner_id = ? WHERE id = ?",
      [device.name, device.type, device.ownerId, id],
    );

    return {
      changes: result.changes,
      device: result.changes ? await findDetailedById(id) : null,
    };
  }

  function deleteById(id) {
    return dbClient.run("DELETE FROM devices WHERE id = ?", [id]);
  }

  function clearOwnerByEmployeeId(employeeId) {
    return dbClient.run(
      "UPDATE devices SET owner_id = NULL WHERE owner_id = ?",
      [employeeId],
    );
  }

  return {
    clearOwnerByEmployeeId,
    create,
    deleteById,
    findAll,
    findDetailedById,
    update,
  };
}

module.exports = { createDeviceRepository };
