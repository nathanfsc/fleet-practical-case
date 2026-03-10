import { useEffect, useState } from "react";
import { EMPLOYEES_TAB_NAME } from "../../features/employees/Employees.constant";

const ACTIVE_TAB_STORAGE_KEY = "fleet_active_tab";

export function useActiveTab() {
  const [activeTab, setActiveTab] = useState(EMPLOYEES_TAB_NAME);

  useEffect(() => {
    const savedTab = window.localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    const hash = window.location.hash.replace("#", "");

    setActiveTab(hash || savedTab || EMPLOYEES_TAB_NAME);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
    window.location.hash = activeTab;
  }, [activeTab]);

  return {
    activeTab,
    setActiveTab,
  };
}
