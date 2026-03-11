import {
  createEmployee,
  removeEmployee,
  updateEmployee,
} from "../services/employeesService";

export function useEmployeeActions({
  editingEmployeeId,
  employeeForm,
  onError,
  onRemoveEmployeeFromState,
  onStatusMessage,
  onUpsertEmployeeInState,
  refreshDashboardCounts,
  resetEmployeeForm,
}) {
  async function submitEmployee(event) {
    event.preventDefault();

    const payload = {
      name: employeeForm.name,
      role: employeeForm.role,
    };

    const isEditing = Boolean(editingEmployeeId);

    try {
      const savedEmployee = isEditing
        ? await updateEmployee({ employeeId: editingEmployeeId, payload })
        : await createEmployee({ payload });

      onStatusMessage(isEditing ? "Employee updated" : "Employee created");
      resetEmployeeForm();
      onUpsertEmployeeInState(savedEmployee);
      await refreshDashboardCounts();
    } catch (error) {
      onError(error.message);
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
      await removeEmployee(employeeId);

      onStatusMessage("Employee deleted");
      onRemoveEmployeeFromState(employeeId);
      await refreshDashboardCounts();
    } catch (error) {
      onError(`Employee delete failed: ${error.message}`);
    }
  }

  return {
    submitEmployee,
    handleDeleteEmployee,
  };
}
