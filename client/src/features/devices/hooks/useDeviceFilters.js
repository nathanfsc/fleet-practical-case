import { useEffect, useMemo, useState } from "react";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "../../../shared/localStorageService";

const DEVICE_TYPE_FILTER_STORAGE_KEY = "fleet_device_type_filter";
const DEVICE_OWNER_FILTER_STORAGE_KEY = "fleet_device_owner_filter";

export function useDeviceFilters(devices) {
  const [deviceTypeFilter, setDeviceTypeFilter] = useState(() => {
    return getLocalStorageItem(DEVICE_TYPE_FILTER_STORAGE_KEY) ?? "";
  });
  const [deviceOwnerFilter, setDeviceOwnerFilter] = useState(() => {
    return getLocalStorageItem(DEVICE_OWNER_FILTER_STORAGE_KEY) ?? "";
  });
  const [deviceSearch, setDeviceSearch] = useState("");

  const filteredDevices = useMemo(() => {
    let nextDevices = [...devices];

    if (deviceTypeFilter) {
      nextDevices = nextDevices.filter(
        (device) => device.type === deviceTypeFilter,
      );
    }

    if (deviceOwnerFilter) {
      nextDevices = nextDevices.filter(
        (device) => Number(device.owner_id || "") === Number(deviceOwnerFilter),
      );
    }

    if (deviceSearch.trim()) {
      const normalized = deviceSearch.toLowerCase();
      nextDevices = nextDevices.filter((device) => {
        return (
          String(device.name || "")
            .toLowerCase()
            .includes(normalized) ||
          String(device.type || "")
            .toLowerCase()
            .includes(normalized)
        );
      });
    }

    return nextDevices;
  }, [devices, deviceTypeFilter, deviceOwnerFilter, deviceSearch]);

  useEffect(() => {
    setLocalStorageItem(DEVICE_TYPE_FILTER_STORAGE_KEY, deviceTypeFilter);
  }, [deviceTypeFilter]);

  useEffect(() => {
    setLocalStorageItem(DEVICE_OWNER_FILTER_STORAGE_KEY, deviceOwnerFilter);
  }, [deviceOwnerFilter]);

  return {
    deviceTypeFilter,
    setDeviceTypeFilter,
    deviceOwnerFilter,
    setDeviceOwnerFilter,
    deviceSearch,
    setDeviceSearch,
    filteredDevices,
  };
}
