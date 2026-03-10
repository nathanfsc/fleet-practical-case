const express = require("express");

function createEmployeeRouter(employeeController) {
  const router = express.Router();

  router.get("/employees", employeeController.listEmployees);
  router.get("/employees/by-ids", employeeController.getEmployeesByIds);
  router.get("/employees/:id", employeeController.getEmployeeById);
  router.post("/employees", employeeController.createEmployee);
  router.put("/employees/:id", employeeController.updateEmployee);
  router.delete("/employees/:id", employeeController.deleteEmployee);

  return router;
}

module.exports = { createEmployeeRouter };
