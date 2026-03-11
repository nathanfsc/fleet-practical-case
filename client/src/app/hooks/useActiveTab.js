import { useEffect, useState } from "react";
import { EMPLOYEES_TAB_NAME } from "../../features/employees/Employees.constant";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "../../shared/localStorageService";

const ACTIVE_TAB_STORAGE_KEY = "fleet_active_tab";

function getInitialActiveTab() {
  if (typeof window === "undefined") {
    return EMPLOYEES_TAB_NAME;
  }

  const savedTab = getLocalStorageItem(ACTIVE_TAB_STORAGE_KEY);
  const hash = window.location.hash.replace("#", "");

  return hash || savedTab || EMPLOYEES_TAB_NAME;
}

export function useActiveTab() {
  const [activeTab, setActiveTab] = useState(getInitialActiveTab);

  useEffect(() => {
    setLocalStorageItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
    window.location.hash = activeTab;
  }, [activeTab]);

  return {
    activeTab,
    setActiveTab,
  };
}
