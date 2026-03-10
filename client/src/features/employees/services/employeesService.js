export async function getEmployees() {
  const response = await fetch("/api/employees");
  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Could not get employees with error: ${json.message}`);
  }

  return Array.isArray(json) ? json : [];
}

export async function getEmployeeById(employeeId) {
  const response = await fetch(`/api/employees/${employeeId}`);

  if (response.status === 404) {
    throw new Error(`Employee with id ${employeeId} not found`);
  }

  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Could not get employee with error: ${json.message}`);
  }

  return json;
}

export async function createEmployee({ payload }) {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Could not save employee, with error: ${json.message}`);
  }

  return json;
}

export async function updateEmployee({ employeeId, payload }) {
  const response = await fetch(`/api/employees/${employeeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Could not update employee, with error: ${json.message}`);
  }

  return json;
}

export async function removeEmployee(employeeId) {
  const response = await fetch(`/api/employees/${employeeId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let message = "Could not delete employee";

    try {
      const json = await response.json();
      message = json.message || message;
    } catch {
      // Ignore non-JSON delete errors and use default message.
    }

    throw new Error(message);
  }
}
