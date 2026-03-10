import { useEffect, useMemo, useState } from "react";
import { EMPLOYEE_ROLE_OPTIONS } from "../Employees.constant";

const DEFAULT_EMPLOYEE_FORM = { name: "", role: "" };

function EmployeesTab({
  employees,
  loadingEmployees,
  refreshEmployees,
  refreshDevices,
  onStatusMessage,
  onError,
}) {
  const [employeeForm, setEmployeeForm] = useState(DEFAULT_EMPLOYEE_FORM);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  const filteredEmployees = useMemo(() => {
    let nextEmployees = [...employees];

    if (roleFilter) {
      nextEmployees = nextEmployees.filter(
        (employee) => employee.role === roleFilter,
      );
    }
    if (employeeSearch.trim()) {
      const normalized = employeeSearch.toLowerCase();
      nextEmployees = nextEmployees.filter((employee) => {
        return (
          String(employee.name || "")
            .toLowerCase()
            .includes(normalized) ||
          String(employee.role || "")
            .toLowerCase()
            .includes(normalized)
        );
      });
    }

    return nextEmployees;
  }, [employees, roleFilter, employeeSearch]);

  useEffect(() => {
    const savedRoleFilter = window.localStorage.getItem("fleet_role_filter");
    if (savedRoleFilter !== null) {
      setRoleFilter(savedRoleFilter);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("fleet_role_filter", roleFilter);
  }, [roleFilter]);

  async function submitEmployee(event) {
    event.preventDefault();

    const payload = {
      name: employeeForm.name,
      role: employeeForm.role,
    };

    const isEditing = Boolean(editingEmployeeId);
    const url = isEditing
      ? `/api/employees/${editingEmployeeId}`
      : "/api/employees";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || "Could not save employee");
      }
      onStatusMessage(isEditing ? "Employee updated" : "Employee created");
      setEmployeeForm(DEFAULT_EMPLOYEE_FORM);
      setEditingEmployeeId(null);
      await refreshEmployees();
      await refreshDevices();
    } catch (error) {
      onError(`Employee save failed: ${error.message}`);
    }
  }

  async function handleDeleteEmployee(employeeId) {
    const isConfirmed = window.confirm(
      "Delete employee and unassign their devices?",
    );
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message || "Could not delete employee");
      }
      onStatusMessage("Employee deleted");
      await refreshEmployees();
    } catch (error) {
      onError(`Employee delete failed: ${error.message}`);
    }
  }

  function beginEmployeeEdit(employee) {
    setEditingEmployeeId(employee.id);
    setEmployeeForm(DEFAULT_EMPLOYEE_FORM);
  }

  function resetEmployeeForm() {
    setEmployeeForm(DEFAULT_EMPLOYEE_FORM);
    setEditingEmployeeId(null);
  }

  return (
    <section className="panel">
      <h2>{editingEmployeeId ? "Edit employee" : "Create employee"}</h2>
      <form className="app-form" onSubmit={submitEmployee}>
        <label>
          Name
          <input
            value={employeeForm.name}
            onChange={(event) =>
              setEmployeeForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            placeholder="Employee name"
            required
          />
        </label>
        <label>
          Role
          <input
            value={employeeForm.role}
            onChange={(event) =>
              setEmployeeForm((prev) => ({
                ...prev,
                role: event.target.value,
              }))
            }
            placeholder="Developer"
            required
          />
        </label>
        <div className="form-buttons">
          <button type="submit">
            {editingEmployeeId ? "Update" : "Create"}
          </button>
          {editingEmployeeId ? (
            <button type="button" onClick={resetEmployeeForm}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <h3>Filters</h3>
      <div className="filters">
        <label>
          Role filter
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="">All</option>
            {EMPLOYEE_ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <label>
          Search
          <input
            value={employeeSearch}
            onChange={(event) => setEmployeeSearch(event.target.value)}
            placeholder="Search name / role"
          />
        </label>
      </div>

      <h3>Employee list {loadingEmployees ? "(loading...)" : ""}</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Devices</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.name}</td>
              <td>{employee.role}</td>
              <td>{employee.device_count || 0}</td>
              <td>
                <button
                  type="button"
                  onClick={() => beginEmployeeEdit(employee)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteEmployee(employee.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredEmployees.length === 0 ? (
            <tr>
              <td colSpan="4">No employees found</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}

export default EmployeesTab;
