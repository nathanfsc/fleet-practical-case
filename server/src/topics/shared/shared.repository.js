const { dbClient } = require("../../database");

class SharedRepository {
  constructor({ databaseClient = dbClient } = {}) {
    this.dbClient = databaseClient;
  }

  async countFacets() {
    const row = await this.dbClient.get(
      `
      SELECT
        (SELECT COUNT(*) FROM employees) AS totalEmployees,
        (SELECT COUNT(*) FROM devices) AS totalDevices,
        (SELECT COUNT(*) FROM devices WHERE owner_id IS NOT NULL) AS ownedDevices
      `,
    );

    return {
      totalEmployees: row?.totalEmployees || 0,
      totalDevices: row?.totalDevices || 0,
      ownedDevices: row?.ownedDevices || 0,
    };
  }
}

module.exports = { SharedRepository };
