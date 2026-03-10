const { createHttpError } = require("../utils/httpError");
const { DeviceRepository } = require("../repositories/deviceRepository");
const { EmployeeRepository } = require("../repositories/employeeRepository");
const { requireId, requireIds, requireText } = require("../utils/validation");

class EmployeeService {
  constructor() {
    this.deviceRepository = new DeviceRepository();
    this.employeeRepository = new EmployeeRepository();
  }

  async listEmployees(query) {
    return this.employeeRepository.findAll({
      role: query.role || "",
      search: query.search || "",
    });
  }

  async getEmployeeById(employeeId) {
    const id = requireId(employeeId, "employee");
    const employee = await this.employeeRepository.findById(id);

    if (!employee) {
      throw createHttpError(404, "Employee not found");
    }

    return employee;
  }

  async getEmployeesByIds(employeeIds) {
    const ids = requireIds(employeeIds, "employee ids");
    return this.employeeRepository.findByIds(ids);
  }

  async createEmployee(payload) {
    const employee = {
      name: requireText(payload.name, "name", "Both name and role are required"),
      role: requireText(payload.role, "role", "Both name and role are required"),
    };

    return this.employeeRepository.create(employee);
  }

  async updateEmployee(employeeId, payload) {
    const id = requireId(employeeId, "employee");
    const employee = {
      name: requireText(payload.name, "name", "Both name and role are required"),
      role: requireText(payload.role, "role", "Both name and role are required"),
    };
    const result = await this.employeeRepository.update(id, employee);

    if (!result.changes) {
      throw createHttpError(404, "Employee not found");
    }

    return result.employee;
  }

  async deleteEmployee(employeeId) {
    const id = requireId(employeeId, "employee");
    await this.deviceRepository.clearOwnerByEmployeeId(id);
    const result = await this.employeeRepository.deleteById(id);

    if (!result.changes) {
      throw createHttpError(404, "Employee not found");
    }

    return { success: true };
  }
}

module.exports = { EmployeeService };
