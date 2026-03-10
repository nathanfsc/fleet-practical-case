//todo: fix les 10 000 calls au back a l'init
import { useEffect, useMemo, useState } from "react";
import { DEVICE_TYPE_OPTIONS } from "../Devices.constant";
import {
  createDevice,
  removeDevice,
  updateDevice,
} from "../services/Devices.service";

const DEFAULT_DEVICE_FORM = { name: "", type: "Laptop", ownerId: "" };

function DevicesTab({
  employees,
  devices,
  loadingDevices,
  refreshDevices,
  refreshEmployees,
  onStatusMessage,
  onError,
}) {
  const [deviceTypeFilter, setDeviceTypeFilter] = useState(() => {
    return window.localStorage.getItem("fleet_device_type_filter") ?? "";
  });
  const [deviceOwnerFilter, setDeviceOwnerFilter] = useState(() => {
    return window.localStorage.getItem("fleet_device_owner_filter") ?? "";
  });
  const [deviceSearch, setDeviceSearch] = useState("");
  const [deviceForm, setDeviceForm] = useState(DEFAULT_DEVICE_FORM);
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [ownerNameById, setOwnerNameById] = useState({});
  const [loadingOwnerNames, setLoadingOwnerNames] = useState(false);
  const isEditing = Boolean(editingDeviceId);

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
    window.localStorage.setItem("fleet_device_type_filter", deviceTypeFilter);
  }, [deviceTypeFilter]);

  useEffect(() => {
    window.localStorage.setItem("fleet_device_owner_filter", deviceOwnerFilter);
  }, [deviceOwnerFilter]);

  useEffect(() => {
    const ownerIds = Array.from(
      new Set(
        filteredDevices
          .map((device) => Number(device.owner_id))
          .filter((ownerId) => Number.isInteger(ownerId) && ownerId > 0),
      ),
    );

    if (ownerIds.length === 0) {
      setOwnerNameById({});
      return;
    }

    setLoadingOwnerNames(true);
    setOwnerNameById({});

    //todo: rajouter un getByIds
    Promise.all(
      ownerIds.map(async (ownerId) => {
        try {
          const response = await fetch(`/api/employees/${ownerId}`);

          if (response.status === 404) {
            return {
              ownerId: String(ownerId),
              ownerName: `Unknown employee #${ownerId}`,
            };
          }

          if (!response.ok) {
            throw new Error(`Failed to resolve owner ${ownerId}`);
          }

          const json = await response.json();
          return {
            ownerId: String(ownerId),
            ownerName: json.name,
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
        const ownerMap = {};
        resolvedOwners.forEach((owner) => {
          ownerMap[owner.ownerId] = owner.ownerName;
        });
        setOwnerNameById(ownerMap);
      })
      .finally(() => {
        setLoadingOwnerNames(false);
      });
  }, [filteredDevices]);

  async function submitDevice(event) {
    event.preventDefault();

    const payload = {
      name: deviceForm.name,
      type: deviceForm.type,
      ownerId: deviceForm.ownerId || null,
    };

    try {
      isEditing
        ? await updateDevice({ deviceId: editingDeviceId, payload })
        : await createDevice({ payload });

      onStatusMessage(isEditing ? "Device updated" : "Device created");
      setDeviceForm(DEFAULT_DEVICE_FORM);
      setEditingDeviceId(null);
      await refreshDevices();
      await refreshEmployees();
    } catch (error) {
      onError(error.message);
    }
  }

  async function handleDeleteDevice(deviceId) {
    const isConfirmed = window.confirm("Delete this device?");
    if (!isConfirmed) {
      return;
    }

    try {
      await removeDevice(deviceId);

      onStatusMessage("Device deleted");
      await refreshDevices();
      await refreshEmployees();
    } catch (error) {
      onError(error.message);
    }
  }

  function beginDeviceEdit(device) {
    setEditingDeviceId(device.id);
    setDeviceForm({
      name: device.name || "",
      type: device.type,
      ownerId: device.owner_id ? String(device.owner_id) : "",
    });
  }

  function resetDeviceForm() {
    setDeviceForm(DEFAULT_DEVICE_FORM);
    setEditingDeviceId(null);
  }

  return (
    <section className="panel">
      <h2>{isEditing ? "Edit device" : "Create device"}</h2>
      <form className="app-form" onSubmit={submitDevice}>
        <label>
          Device name
          <input
            value={deviceForm.name}
            onChange={(event) =>
              setDeviceForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            placeholder="MacBook Pro"
            required
          />
        </label>
        <label>
          Type
          <select
            value={deviceForm.type}
            onChange={(event) =>
              setDeviceForm((prev) => ({
                ...prev,
                type: event.target.value,
              }))
            }
          >
            {DEVICE_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          Owner
          <select
            value={deviceForm.ownerId}
            onChange={(event) =>
              setDeviceForm((prev) => ({
                ...prev,
                ownerId: event.target.value,
              }))
            }
          >
            <option value="">Unassigned</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </label>
        <div className="form-buttons">
          <button type="submit">{isEditing ? "Update" : "Create"}</button>
          {isEditing ? (
            <button type="button" onClick={resetDeviceForm}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <h3>Filters</h3>
      <div className="filters">
        <label>
          Type filter
          <select
            value={deviceTypeFilter}
            onChange={(event) => setDeviceTypeFilter(event.target.value)}
          >
            <option value="">All</option>
            {DEVICE_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          Owner filter
          <select
            value={deviceOwnerFilter}
            onChange={(event) => setDeviceOwnerFilter(event.target.value)}
          >
            <option value="">All</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Search
          <input
            value={deviceSearch}
            onChange={(event) => setDeviceSearch(event.target.value)}
            placeholder="Search name / type"
          />
        </label>
      </div>

      <h3>
        Device list {loadingDevices ? "(loading...)" : ""}{" "}
        {loadingOwnerNames ? "(resolving owners...)" : ""}
      </h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Owner</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDevices.map((device) => (
            <tr key={device.id}>
              <td>{device.name}</td>
              <td>{device.type}</td>
              <td>{ownerNameById[String(device.owner_id)] || "Unassigned"}</td>
              <td>
                <button type="button" onClick={() => beginDeviceEdit(device)}>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDevice(device.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredDevices.length === 0 ? (
            <tr>
              <td colSpan="4">No devices found</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}

export default DevicesTab;
