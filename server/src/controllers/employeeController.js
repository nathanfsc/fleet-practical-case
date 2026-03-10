const { sendErrorResponse } = require("../utils/httpError");

function createEmployeeController(employeeService) {
  async function listEmployees(req, res) {
    try {
      const employees = await employeeService.listEmployees(req.query || {});
      res.json(employees);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to fetch employees");
    }
  }

  async function getEmployeeById(req, res) {
    try {
      const employee = await employeeService.getEmployeeById(req.params.id);
      res.json(employee);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to fetch employee");
    }
  }

  async function createEmployee(req, res) {
    try {
      const employee = await employeeService.createEmployee(req.body || {});
      res.status(201).json(employee);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to create employee");
    }
  }

  async function updateEmployee(req, res) {
    try {
      const employee = await employeeService.updateEmployee(
        req.params.id,
        req.body || {},
      );
      res.json(employee);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to update employee");
    }
  }

  async function deleteEmployee(req, res) {
    try {
      const result = await employeeService.deleteEmployee(req.params.id);
      res.json(result);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to delete employee");
    }
  }

  return {
    createEmployee,
    deleteEmployee,
    getEmployeeById,
    listEmployees,
    updateEmployee,
  };
}

module.exports = { createEmployeeController };
