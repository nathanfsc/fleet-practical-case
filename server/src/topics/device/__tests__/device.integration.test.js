const assert = require("node:assert/strict");
const { after, before, describe, it } = require("node:test");
const request = require("supertest");

const { createTestDatabase } = require("../../../test-support/test.database");

describe("POST /api/devices", () => {
  let context;
  let employee;

  before(async () => {
    context = await createTestDatabase();
    employee = await context.createEmployee({ name: "Clara", role: "driver" });
  });

  after(async () => {
    await context.close();
  });

  it("should reject an unknown owner", async () => {
    const response = await request(context.app)
      .post("/api/devices")
      .send({
        name: "Tablet",
        ownerId: 42,
        type: "tablet",
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "Owner employee does not exist");
  });

  it("should create a device for a valid owner", async () => {
    const createResponse = await request(context.app)
      .post("/api/devices")
      .send({
        name: "Laptop",
        ownerId: employee.id,
        type: "computer",
      });

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.owner_id, employee.id);
    assert.equal(createResponse.body.owner_name, "Clara");
  });
});

describe("GET /api/devices", () => {
  let context;
  let employee;

  before(async () => {
    context = await createTestDatabase();
    employee = await context.createEmployee({ name: "Clara", role: "driver" });
    await context.createDevice({
      name: "Laptop",
      ownerId: employee.id,
      type: "computer",
    });
  });

  after(async () => {
    await context.close();
  });

  it("should list devices filtered by owner", async () => {
    const listResponse = await request(context.app).get(
      `/api/devices?ownerId=${employee.id}`,
    );

    assert.equal(listResponse.status, 200);
    assert.equal(listResponse.body.length, 1);
    assert.equal(listResponse.body[0].name, "Laptop");
    assert.equal(listResponse.body[0].owner_name, "Clara");
  });
});
