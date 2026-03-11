const assert = require("node:assert/strict");
const { after, before, describe, it } = require("node:test");
const request = require("supertest");

const { createTestDatabase } = require("../../../test-support/test.database");

describe("GET /api/health", () => {
  let context;

  before(async () => {
    context = await createTestDatabase();
  });

  after(async () => {
    await context.close();
  });

  it("should return ok with a timestamp", async () => {
    const response = await request(context.app).get("/api/health");

    assert.equal(response.status, 200);
    assert.equal(response.body.ok, true);
    assert.equal(typeof response.body.timestamp, "string");
    assert.ok(Number.isFinite(Date.parse(response.body.timestamp)));
  });
});
