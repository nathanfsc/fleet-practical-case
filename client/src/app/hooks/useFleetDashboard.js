import { useEffect, useState } from "react";
import { DEVICES_TAB_NAME } from "../../features/devices/Devices.constant";
import { EMPLOYEES_TAB_NAME } from "../../features/employees/Employees.constant";
import { getDevices } from "../../features/devices/services/devicesService";
import { getEmployees } from "../../features/employees/services/employeesService";
import {
  getJsonLocalStorageItem,
  setJsonLocalStorageItem,
} from "../../shared/localStorageService";
import {
  EMPTY_DASHBOARD_COUNTS,
  getDashboardCounts,
} from "../services/dashboardService";

const EMPLOYEES_STORAGE_KEY = "fleet_employees_cache";

function getInitialEmployees() {
  const storedEmployees = getJsonLocalStorageItem(EMPLOYEES_STORAGE_KEY, []);
  return Array.isArray(storedEmployees) ? storedEmployees : [];
}

export function useFleetDashboard({ activeTab, onError, onRefreshStart }) {
  const [employees, setEmployees] = useState(getInitialEmployees);
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

  function upsertDeviceInState(device) {
    if (!device?.id) {
      return;
    }

    setDevices((currentDevices) => {
      const existingDeviceIndex = currentDevices.findIndex(
        (currentDevice) => currentDevice.id === device.id,
      );

      if (existingDeviceIndex === -1) {
        return [device, ...currentDevices];
      }

      return currentDevices.map((currentDevice) =>
        currentDevice.id === device.id ? device : currentDevice,
      );
    });
  }

  function removeDeviceFromState(deviceId) {
    const normalizedDeviceId = Number(deviceId);

    if (!normalizedDeviceId) {
      return;
    }

    setDevices((currentDevices) =>
      currentDevices.filter((device) => device.id !== normalizedDeviceId),
    );
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

  async function refreshActiveTab(tab = activeTab) {
    onRefreshStart();

    const requests = [];

    if (tab === EMPLOYEES_TAB_NAME) {
      requests.push(refreshEmployees({ clearErrors: false }));
    }

    if (tab === DEVICES_TAB_NAME) {
      requests.push(refreshEmployees({ clearErrors: false }));
      requests.push(refreshDevices({ clearErrors: false }));
    }

    await Promise.all(requests);
  }

  async function refreshAppData(tab = activeTab) {
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
    refreshDashboardCounts();
  }, []);

  useEffect(() => {
    setJsonLocalStorageItem(EMPLOYEES_STORAGE_KEY, employees);
  }, [employees]);

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
    upsertEmployeeInState,
    removeEmployeeFromState,
    upsertDeviceInState,
    removeDeviceFromState,
    refreshActiveTab,
    refreshAppData,
  };
}
