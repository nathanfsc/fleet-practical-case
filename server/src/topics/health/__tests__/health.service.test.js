const assert = require("node:assert/strict");
const test = require("node:test");

const { HealthService } = require("../health.service");

test("HealthService.getHealth returns ok status with an ISO timestamp", () => {
  const service = new HealthService();

  const result = service.getHealth();

  assert.equal(result.ok, true);
  assert.equal(typeof result.timestamp, "string");
  assert.ok(Number.isFinite(Date.parse(result.timestamp)));
});
