const assert = require("node:assert/strict");
const { after, before, describe, it } = require("node:test");
const request = require("supertest");

const { createTestDatabase } = require("../../../test-support/test.database");

describe("GET /api/shared/countFacets", () => {
  let context;

  before(async () => {
    context = await createTestDatabase();
    const alice = await context.createEmployee({ name: "Alice", role: "driver" });
    await context.createEmployee({ name: "Bob", role: "manager" });
    await context.createDevice({
      name: "Laptop",
      ownerId: alice.id,
      type: "computer",
    });
    await context.createDevice({
      name: "Tablet",
      ownerId: null,
      type: "tablet",
    });
  });

  after(async () => {
    await context.close();
  });

  it("should return live employee and device counters", async () => {
    const response = await request(context.app).get("/api/shared/countFacets");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      ownedDevices: 1,
      totalDevices: 2,
      totalEmployees: 2,
    });
  });
});
