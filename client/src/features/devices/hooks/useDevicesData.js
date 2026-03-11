import { useEffect, useState } from "react";
import { getEmployees } from "../../employees/services/employeesService";
import { getDevices } from "../services/devicesService";

export function useDevicesData({
  refreshTick = 0,
  onError,
  onRefreshStart,
  onRefreshed,
}) {
  const [employees, setEmployees] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  async function refreshDevices({ clearErrors = true } = {}) {
    setLoadingDevices(true);

    if (clearErrors) {
      onRefreshStart();
    }

    try {
      const [nextEmployees, nextDevices] = await Promise.all([
        getEmployees(),
        getDevices(),
      ]);
      setEmployees(nextEmployees);
      setDevices(nextDevices);
      onRefreshed();
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

  useEffect(() => {
    refreshDevices();
  }, [refreshTick]);

  return {
    employees,
    devices,
    loadingDevices,
    refreshDevices,
    upsertDeviceInState,
    removeDeviceFromState,
  };
}
