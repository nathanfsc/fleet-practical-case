const assert = require("node:assert/strict");
const test = require("node:test");

const { DeviceService } = require("../device.service");

test("DeviceService.createDevice rejects an unknown owner", async () => {
  const service = new DeviceService({
    employeeRepository: {
      async findById() {
        return null;
      },
    },
  });

  await assert.rejects(
    () =>
      service.createDevice({
        name: "Tablet",
        ownerId: 42,
        type: "tablet",
      }),
    {
      message: "Owner employee does not exist",
      statusCode: 400,
    },
  );
});

test("DeviceService.createDevice persists the normalized payload", async () => {
  const service = new DeviceService({
    employeeRepository: {
      async findById(id) {
        return { id, name: "Bob" };
      },
    },
    deviceRepository: {
      async create(payload) {
        return { id: 1, ...payload };
      },
    },
  });

  const result = await service.createDevice({
    name: "Laptop",
    ownerId: "5",
    type: "computer",
  });

  assert.deepEqual(result, {
    id: 1,
    name: "Laptop",
    ownerId: 5,
    type: "computer",
  });
});

test("DeviceService.updateDevice throws 404 when the device does not exist", async () => {
  const service = new DeviceService({
    employeeRepository: {
      async findById() {
        return null;
      },
    },
    deviceRepository: {
      async update() {
        return { changes: 0, device: null };
      },
    },
  });

  await assert.rejects(
    () =>
      service.updateDevice(11, {
        name: "Laptop",
        ownerId: null,
        type: "computer",
      }),
    {
      message: "Device not found",
      statusCode: 404,
    },
  );
});
