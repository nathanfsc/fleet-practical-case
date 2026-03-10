import { DEVICE_TYPE_OPTIONS } from "../Devices.constant";
import { useDeviceActions } from "../hooks/useDeviceActions";
import { useDeviceFilters } from "../hooks/useDeviceFilters";
import { useDeviceForm } from "../hooks/useDeviceForm";
import { useDeviceOwnerNames } from "../hooks/useDeviceOwnerNames";

function DevicesTab({
  employees,
  devices,
  loadingDevices,
  refreshDevices,
  refreshEmployees,
  onStatusMessage,
  onError,
}) {
  const {
    deviceTypeFilter,
    setDeviceTypeFilter,
    deviceOwnerFilter,
    setDeviceOwnerFilter,
    deviceSearch,
    setDeviceSearch,
    filteredDevices,
  } = useDeviceFilters(devices);

  const {
    deviceForm,
    setDeviceForm,
    editingDeviceId,
    beginDeviceEdit,
    resetDeviceForm,
  } = useDeviceForm();

  const { ownerNameById, loadingOwnerNames } =
    useDeviceOwnerNames(filteredDevices);

  const { isEditing, submitDevice, handleDeleteDevice } = useDeviceActions({
    deviceForm,
    editingDeviceId,
    onError,
    onStatusMessage,
    refreshDevices,
    refreshEmployees,
    resetDeviceForm,
  });

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
