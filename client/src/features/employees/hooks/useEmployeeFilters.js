import { useEffect, useMemo, useState } from "react";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "../../../shared/localStorageService";

const ROLE_FILTER_STORAGE_KEY = "fleet_role_filter";

export function useEmployeeFilters(employees) {
  const [roleFilter, setRoleFilter] = useState(() => {
    return getLocalStorageItem(ROLE_FILTER_STORAGE_KEY) ?? "";
  });
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
    setLocalStorageItem(ROLE_FILTER_STORAGE_KEY, roleFilter);
  }, [roleFilter]);

  return {
    roleFilter,
    setRoleFilter,
    employeeSearch,
    setEmployeeSearch,
    filteredEmployees,
  };
}
