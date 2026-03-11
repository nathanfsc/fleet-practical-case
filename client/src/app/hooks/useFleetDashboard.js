import { useEffect, useState } from "react";
import { DEVICES_TAB_NAME } from "../../features/devices/Devices.constant";
import { EMPLOYEES_TAB_NAME } from "../../features/employees/Employees.constant";
import { getDevices } from "../../features/devices/services/devicesService";
import { getEmployees } from "../../features/employees/services/employeesService";
import {
  EMPTY_DASHBOARD_COUNTS,
  getDashboardCounts,
} from "../services/dashboardService";

export function useFleetDashboard({ activeTab, onError, onRefreshStart }) {
  const [employees, setEmployees] = useState([]);
  const [devices, setDevices] = useState([]);
  const [dashboardState, setDashboardState] = useState(EMPTY_DASHBOARD_COUNTS);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState("");

  async function refreshEmployees({ clearErrors = true } = {}) {
    setLoadingEmployees(true);

    if (clearErrors) {
      onRefreshStart();
    }

    try {
      const nextEmployees = await getEmployees();
      setEmployees(nextEmployees);
      setLastRefreshAt(new Date().toISOString());
    } catch (error) {
      onError(error.message);
    } finally {
      setLoadingEmployees(false);
    }
  }

  async function refreshDashboardCounts({ clearErrors = true } = {}) {
    if (clearErrors) {
      onRefreshStart();
    }

    try {
      const nextDashboardCounts = await getDashboardCounts();
      setDashboardState(nextDashboardCounts);
      setLastRefreshAt(new Date().toISOString());
    } catch (error) {
      onError(error.message);
    }
  }

  async function refreshDevices({ clearErrors = true } = {}) {
    setLoadingDevices(true);

    if (clearErrors) {
      onRefreshStart();
    }

    try {
      const nextDevices = await getDevices();
      setDevices(nextDevices);
      setLastRefreshAt(new Date().toISOString());
    } catch (error) {
      onError(error.message);
    } finally {
      setLoadingDevices(false);
    }
  }

  async function refreshActiveTab(tab = activeTab) {
    onRefreshStart();

    const requests = [refreshDashboardCounts({ clearErrors: false })];

    if (tab === EMPLOYEES_TAB_NAME) {
      requests.push(refreshEmployees({ clearErrors: false }));
    }

    if (tab === DEVICES_TAB_NAME) {
      requests.push(refreshEmployees({ clearErrors: false }));
      requests.push(refreshDevices({ clearErrors: false }));
    }

    await Promise.all(requests);
  }

  useEffect(() => {
    refreshActiveTab(activeTab);
  }, [activeTab]);

  return {
    employees,
    devices,
    loadingEmployees,
    loadingDevices,
    dashboardState,
    lastRefreshAt,
    refreshDashboardCounts,
    refreshEmployees,
    refreshDevices,
    refreshActiveTab,
  };
}
