const { createHttpError } = require("../../utils/httpError");
const { requireId, requireText } = require("../../utils/validation");
const { DeviceRepository } = require("../device/device.repository");
const { EmployeeRepository } = require("./employee.repository");

class EmployeeService {
  constructor({
    employeeRepository = new EmployeeRepository(),
    deviceRepository = new DeviceRepository(),
  } = {}) {
    this.deviceRepository = deviceRepository;
    this.employeeRepository = employeeRepository;
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
