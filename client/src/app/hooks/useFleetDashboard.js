import { useEffect, useMemo, useState } from "react";
import { getDevices } from "../../features/devices/services/Devices.service";
import { getEmployees } from "../../features/employees/services/Employees.service";

export function useFleetDashboard({ onError, onRefreshStart }) {
  const [employees, setEmployees] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState("");

  const dashboardState = useMemo(() => {
    const assignedDevices = devices.filter((device) => device.owner_id).length;

    return {
      totalEmployees: employees.length,
      totalDevices: devices.length,
      assignedDevices,
    };
  }, [employees, devices]);

  async function refreshEmployees() {
    setLoadingEmployees(true);
    onRefreshStart();

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

  async function refreshDevices() {
    setLoadingDevices(true);

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

  function refreshAll() {
    refreshEmployees();
    refreshDevices();
  }

  useEffect(() => {
    refreshAll();
  }, []);

  return {
    employees,
    devices,
    loadingEmployees,
    loadingDevices,
    dashboardState,
    lastRefreshAt,
    refreshEmployees,
    refreshDevices,
    refreshAll,
  };
}
