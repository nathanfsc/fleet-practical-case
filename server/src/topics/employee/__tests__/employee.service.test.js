const assert = require("node:assert/strict");
const test = require("node:test");

const { EmployeeService } = require("../employee.service");

test("EmployeeService.getEmployeeById returns the employee from the repository", async () => {
  const service = new EmployeeService({
    employeeRepository: {
      async findById(id) {
        return { id, name: "Alice", role: "driver" };
      },
    },
  });

  const result = await service.getEmployeeById("12");

  assert.deepEqual(result, {
    id: 12,
    name: "Alice",
    role: "driver",
  });
});

test("EmployeeService.getEmployeeById throws 404 when the employee is missing", async () => {
  const service = new EmployeeService({
    employeeRepository: {
      async findById() {
        return null;
      },
    },
  });

  await assert.rejects(() => service.getEmployeeById(99), {
    message: "Employee not found",
    statusCode: 404,
  });
});

test("EmployeeService.deleteEmployee clears device ownership before deleting", async () => {
  const calls = [];
  const service = new EmployeeService({
    deviceRepository: {
      async clearOwnerByEmployeeId(id) {
        calls.push(["clear", id]);
      },
    },
    employeeRepository: {
      async deleteById(id) {
        calls.push(["delete", id]);
        return { changes: 1 };
      },
    },
  });

  const result = await service.deleteEmployee("7");

  assert.deepEqual(result, { success: true });
  assert.deepEqual(calls, [
    ["clear", 7],
    ["delete", 7],
  ]);
});
