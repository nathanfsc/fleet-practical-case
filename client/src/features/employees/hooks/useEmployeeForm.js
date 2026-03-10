import { useState } from "react";

const DEFAULT_EMPLOYEE_FORM = { name: "", role: "" };

export function useEmployeeForm() {
  const [employeeForm, setEmployeeForm] = useState(DEFAULT_EMPLOYEE_FORM);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  function beginEmployeeEdit(employee) {
    setEditingEmployeeId(employee.id);
    setEmployeeForm({
      name: employee.name || "",
      role: employee.role || "",
    });
  }

  function resetEmployeeForm() {
    setEmployeeForm(DEFAULT_EMPLOYEE_FORM);
    setEditingEmployeeId(null);
  }

  return {
    employeeForm,
    setEmployeeForm,
    editingEmployeeId,
    beginEmployeeEdit,
    resetEmployeeForm,
  };
}
