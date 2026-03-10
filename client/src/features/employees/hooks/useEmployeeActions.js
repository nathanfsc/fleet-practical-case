import {
  createEmployee,
  removeEmployee,
  updateEmployee,
} from "../services/employeesService";

export function useEmployeeActions({
  editingEmployeeId,
  employeeForm,
  onError,
  onStatusMessage,
  refreshDevices,
  refreshEmployees,
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
      isEditing
        ? await updateEmployee({ employeeId: editingEmployeeId, payload })
        : await createEmployee({ payload });

      onStatusMessage(isEditing ? "Employee updated" : "Employee created");
      resetEmployeeForm();
      await refreshEmployees();
      await refreshDevices();
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
      await refreshEmployees();
    } catch (error) {
      onError(`Employee delete failed: ${error.message}`);
    }
  }

  return {
    submitEmployee,
    handleDeleteEmployee,
  };
}
