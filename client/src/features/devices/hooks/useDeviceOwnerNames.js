import { useEffect, useState } from "react";
import { getEmployeesByIds } from "../../employees/services/employeesService";

export function useDeviceOwnerNames(filteredDevices) {
  const [ownerNameById, setOwnerNameById] = useState({});
  const [loadingOwnerNames, setLoadingOwnerNames] = useState(false);

  useEffect(() => {
    const ownerIds = Array.from(
      new Set(
        filteredDevices
          .map((device) => Number(device.owner_id))
          .filter((ownerId) => Number.isInteger(ownerId) && ownerId > 0),
      ),
    );
    const ownerIdsToFetch = ownerIds.filter(
      (ownerId) => !ownerNameById[String(ownerId)],
    );

    if (ownerIdsToFetch.length === 0) {
      setLoadingOwnerNames(false);
      return undefined;
    }

    let isActive = true;

    setLoadingOwnerNames(true);

    getEmployeesByIds(ownerIdsToFetch)
      .then((employees) => {
        if (!isActive) {
          return;
        }

        const ownerMap = {};

        ownerIdsToFetch.forEach((ownerId) => {
          ownerMap[String(ownerId)] = `Unknown employee #${ownerId}`;
        });

        employees.forEach((employee) => {
          ownerMap[String(employee.id)] = employee.name;
        });

        setOwnerNameById((prev) => ({
          ...prev,
          ...ownerMap,
        }));
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        const ownerMap = {};

        ownerIdsToFetch.forEach((ownerId) => {
          ownerMap[String(ownerId)] = `Unknown employee #${ownerId}`;
        });

        setOwnerNameById((prev) => ({
          ...prev,
          ...ownerMap,
        }));
      })
      .finally(() => {
        if (isActive) {
          setLoadingOwnerNames(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [filteredDevices, ownerNameById]);

  return {
    ownerNameById,
    loadingOwnerNames,
  };
}
