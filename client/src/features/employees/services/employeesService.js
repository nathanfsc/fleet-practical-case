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

export async function getEmployeesByIds(employeeIds) {
  if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
    return [];
  }

  const ids = Array.from(
    new Set(
      employeeIds.filter(
        (employeeId) => Number.isInteger(employeeId) && employeeId > 0,
      ),
    ),
  );

  if (ids.length === 0) {
    return [];
  }

  const response = await fetch(`/api/employees/by-ids?ids=${ids.join(",")}`);
  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Could not get employees with error: ${json.message}`);
  }

  return Array.isArray(json) ? json : [];
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

  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Could not delete employee, with error: ${json.message}`);
  }

  return json;
}
