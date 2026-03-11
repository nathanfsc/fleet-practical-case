const assert = require("node:assert/strict");
const { after, before, describe, it } = require("node:test");
const request = require("supertest");

const { createTestDatabase } = require("../../../test-support/test.database");

describe("POST /api/employees", () => {
  let context;

  before(async () => {
    context = await createTestDatabase();
  });

  after(async () => {
    await context.close();
  });

  it("should create an employee", async () => {
    const createResponse = await request(context.app)
      .post("/api/employees")
      .send({
        name: "Alice",
        role: "driver",
      });

    assert.equal(createResponse.status, 201);
    assert.deepEqual(createResponse.body, {
      id: 1,
      name: "Alice",
      role: "driver",
    });
  });
});

describe("GET /api/employees/:id", () => {
  let context;
  let employee;

  before(async () => {
    context = await createTestDatabase();
    employee = await context.createEmployee({ name: "Alice", role: "driver" });
  });

  after(async () => {
    await context.close();
  });

  it("should fetch an employee by id", async () => {
    const getResponse = await request(context.app).get(`/api/employees/${employee.id}`);

    assert.equal(getResponse.status, 200);
    assert.deepEqual(getResponse.body, {
      id: employee.id,
      name: "Alice",
      role: "driver",
    });
  });
});

describe("DELETE /api/employees/:id", () => {
  let context;
  let employee;

  before(async () => {
    context = await createTestDatabase();
    employee = await context.createEmployee({ name: "Bob", role: "manager" });
    await context.createDevice({
      name: "Tablet",
      ownerId: employee.id,
      type: "tablet",
    });
  });

  after(async () => {
    await context.close();
  });

  it("should clear the owner on assigned devices", async () => {
    const deleteResponse = await request(context.app).delete(
      `/api/employees/${employee.id}`,
    );

    assert.equal(deleteResponse.status, 200);
    assert.deepEqual(deleteResponse.body, { success: true });

    const devicesResponse = await request(context.app).get("/api/devices");

    assert.equal(devicesResponse.status, 200);
    assert.equal(devicesResponse.body.length, 1);
    assert.equal(devicesResponse.body[0].owner_id, null);
    assert.equal(devicesResponse.body[0].owner_name, null);
  });
});
