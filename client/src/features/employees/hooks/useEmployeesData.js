import { useEffect, useState } from "react";
import { getEmployees } from "../services/employeesService";
import {
  getJsonLocalStorageItem,
  setJsonLocalStorageItem,
} from "../../../shared/localStorageService";

const EMPLOYEES_STORAGE_KEY = "fleet_employees_cache";

function getInitialEmployees() {
  const storedEmployees = getJsonLocalStorageItem(EMPLOYEES_STORAGE_KEY, []);
  return Array.isArray(storedEmployees) ? storedEmployees : [];
}

export function useEmployeesData({
  refreshTick = 0,
  onError,
  onRefreshStart,
  onRefreshed,
}) {
  const [employees, setEmployees] = useState(getInitialEmployees);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  async function refreshEmployees({ clearErrors = true } = {}) {
    setLoadingEmployees(true);

    if (clearErrors) {
      onRefreshStart();
    }

    try {
      const nextEmployees = await getEmployees();
      setEmployees(nextEmployees);
      onRefreshed();
    } catch (error) {
      onError(error.message);
    } finally {
      setLoadingEmployees(false);
    }
  }

  function upsertEmployeeInState(employee) {
    if (!employee?.id) {
      return;
    }

    setEmployees((currentEmployees) => {
      const existingEmployee = currentEmployees.find(
        (currentEmployee) => currentEmployee.id === employee.id,
      );
      const nextEmployee = {
        ...(existingEmployee || {}),
        ...employee,
        device_count:
          employee.device_count ?? existingEmployee?.device_count ?? 0,
      };

      if (!existingEmployee) {
        return [nextEmployee, ...currentEmployees];
      }

      return currentEmployees.map((currentEmployee) =>
        currentEmployee.id === employee.id ? nextEmployee : currentEmployee,
      );
    });
  }

  function removeEmployeeFromState(employeeId) {
    const normalizedEmployeeId = Number(employeeId);

    if (!normalizedEmployeeId) {
      return;
    }

    setEmployees((currentEmployees) =>
      currentEmployees.filter(
        (employee) => employee.id !== normalizedEmployeeId,
      ),
    );
  }

  useEffect(() => {
    setJsonLocalStorageItem(EMPLOYEES_STORAGE_KEY, employees);
  }, [employees]);

  useEffect(() => {
    refreshEmployees();
  }, [refreshTick]);

  return {
    employees,
    loadingEmployees,
    refreshEmployees,
    upsertEmployeeInState,
    removeEmployeeFromState,
  };
}
