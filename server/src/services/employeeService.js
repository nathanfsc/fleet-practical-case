const { createHttpError } = require("../utils/httpError");
const { requireId, requireText } = require("../utils/validation");

function createEmployeeService({ deviceRepository, employeeRepository }) {
  async function listEmployees(query) {
    return employeeRepository.findAll({
      role: query.role || "",
      search: query.search || "",
    });
  }

  async function getEmployeeById(employeeId) {
    const id = requireId(employeeId, "employee");
    const employee = await employeeRepository.findById(id);

    if (!employee) {
      throw createHttpError(404, "Employee not found");
    }

    return employee;
  }

  async function createEmployee(payload) {
    const employee = {
      name: requireText(payload.name, "name", "Both name and role are required"),
      role: requireText(payload.role, "role", "Both name and role are required"),
    };

    return employeeRepository.create(employee);
  }

  async function updateEmployee(employeeId, payload) {
    const id = requireId(employeeId, "employee");
    const employee = {
      name: requireText(payload.name, "name", "Both name and role are required"),
      role: requireText(payload.role, "role", "Both name and role are required"),
    };
    const result = await employeeRepository.update(id, employee);

    if (!result.changes) {
      throw createHttpError(404, "Employee not found");
    }

    return result.employee;
  }

  async function deleteEmployee(employeeId) {
    const id = requireId(employeeId, "employee");
    await deviceRepository.clearOwnerByEmployeeId(id);
    const result = await employeeRepository.deleteById(id);

    if (!result.changes) {
      throw createHttpError(404, "Employee not found");
    }

    return { success: true };
  }

  return {
    createEmployee,
    deleteEmployee,
    getEmployeeById,
    listEmployees,
    updateEmployee,
  };
}

module.exports = { createEmployeeService };
