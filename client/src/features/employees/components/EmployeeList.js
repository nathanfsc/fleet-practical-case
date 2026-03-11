import { EMPLOYEE_ROLE_OPTIONS } from "../Employees.constant";
import { useEmployeeActions } from "../hooks/useEmployeeActions";
import { useEmployeeFilters } from "../hooks/useEmployeeFilters";
import { useEmployeeForm } from "../hooks/useEmployeeForm";

function EmployeesTab({
  employees,
  loadingEmployees,
  onRemoveEmployeeFromState,
  onUpsertEmployeeInState,
  refreshDashboardCounts,
  onStatusMessage,
  onError,
  createTitle,
  editTitle,
  listTitle,
}) {
  const {
    roleFilter,
    setRoleFilter,
    employeeSearch,
    setEmployeeSearch,
    filteredEmployees,
  } = useEmployeeFilters(employees);

  const {
    employeeForm,
    setEmployeeForm,
    editingEmployeeId,
    beginEmployeeEdit,
    resetEmployeeForm,
  } = useEmployeeForm();

  const { submitEmployee, handleDeleteEmployee } = useEmployeeActions({
    editingEmployeeId,
    employeeForm,
    onError,
    onRemoveEmployeeFromState,
    onStatusMessage,
    onUpsertEmployeeInState,
    refreshDashboardCounts,
    resetEmployeeForm,
  });

  return (
    <section className="panel">
      {createTitle || editTitle ? (
        <h2>{editingEmployeeId ? editTitle : createTitle}</h2>
      ) : null}

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

      {listTitle ? (
        <h3>
          {listTitle} {loadingEmployees ? "(loading...)" : ""}
        </h3>
      ) : null}
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
