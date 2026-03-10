import { useEffect, useState } from "react";
import { getEmployeeById } from "../../employees/services/Employees.service";

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

    Promise.all(
      ownerIdsToFetch.map(async (ownerId) => {
        try {
          const employee = await getEmployeeById(ownerId);

          if (!employee) {
            return {
              ownerId: String(ownerId),
              ownerName: `Unknown employee #${ownerId}`,
            };
          }

          return {
            ownerId: String(ownerId),
            ownerName: employee.name,
          };
        } catch (error) {
          return {
            ownerId: String(ownerId),
            ownerName: `Unknown employee #${ownerId}`,
          };
        }
      }),
    )
      .then((resolvedOwners) => {
        if (!isActive) {
          return;
        }

        const ownerMap = {};
        resolvedOwners.forEach((owner) => {
          ownerMap[owner.ownerId] = owner.ownerName;
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
