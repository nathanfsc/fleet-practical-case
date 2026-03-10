import { useEffect, useMemo, useState } from "react";

const ROLE_FILTER_STORAGE_KEY = "fleet_role_filter";

export function useEmployeeFilters(employees) {
  const [roleFilter, setRoleFilter] = useState(() => {
    return window.localStorage.getItem(ROLE_FILTER_STORAGE_KEY) ?? "";
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
    window.localStorage.setItem(ROLE_FILTER_STORAGE_KEY, roleFilter);
  }, [roleFilter]);

  return {
    roleFilter,
    setRoleFilter,
    employeeSearch,
    setEmployeeSearch,
    filteredEmployees,
  };
}
