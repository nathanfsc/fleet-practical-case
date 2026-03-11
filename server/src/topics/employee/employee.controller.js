const { sendErrorResponse } = require("../../utils/httpError");
const { EmployeeService } = require("./employee.service");

class EmployeeController {
  constructor({ employeeService = new EmployeeService() } = {}) {
    this.employeeService = employeeService;
    this.listEmployees = this.listEmployees.bind(this);
    this.getEmployeesByIds = this.getEmployeesByIds.bind(this);
    this.getEmployeeById = this.getEmployeeById.bind(this);
    this.createEmployee = this.createEmployee.bind(this);
    this.updateEmployee = this.updateEmployee.bind(this);
    this.deleteEmployee = this.deleteEmployee.bind(this);
  }

  async listEmployees(req, res) {
    try {
      const employees = await this.employeeService.listEmployees(req.query || {});
      res.json(employees);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to fetch employees");
    }
  }

  async getEmployeesByIds(req, res) {
    try {
      const employees = await this.employeeService.getEmployeesByIds(
        req.query?.ids,
      );
      res.json(employees);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to fetch employees");
    }
  }

  async getEmployeeById(req, res) {
    try {
      const employee = await this.employeeService.getEmployeeById(req.params.id);
      res.json(employee);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to fetch employee");
    }
  }

  async createEmployee(req, res) {
    try {
      const employee = await this.employeeService.createEmployee(req.body || {});
      res.status(201).json(employee);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to create employee");
    }
  }

  async updateEmployee(req, res) {
    try {
      const employee = await this.employeeService.updateEmployee(
        req.params.id,
        req.body || {},
      );
      res.json(employee);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to update employee");
    }
  }

  async deleteEmployee(req, res) {
    try {
      const result = await this.employeeService.deleteEmployee(req.params.id);
      res.json(result);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to delete employee");
    }
  }
}

module.exports = { EmployeeController };
