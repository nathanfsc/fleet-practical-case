import { DEVICE_TYPE_OPTIONS } from "../Devices.constant";
import { useDeviceActions } from "../hooks/useDeviceActions";
import { useDevicesData } from "../hooks/useDevicesData";
import { useDeviceFilters } from "../hooks/useDeviceFilters";
import { useDeviceForm } from "../hooks/useDeviceForm";

function DevicesTab({
  onRefreshStart,
  onRefreshed,
  refreshDashboardCounts,
  refreshTick,
  onStatusMessage,
  onError,
  createTitle,
  editTitle,
  listTitle,
}) {
  const {
    employees,
    devices,
    loadingDevices,
    upsertDeviceInState,
    removeDeviceFromState,
  } = useDevicesData({
    refreshTick,
    onError,
    onRefreshStart,
    onRefreshed,
  });
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

  const { isEditing, submitDevice, handleDeleteDevice } = useDeviceActions({
    deviceForm,
    editingDeviceId,
    onError,
    onRemoveDeviceFromState: removeDeviceFromState,
    onStatusMessage,
    refreshDashboardCounts,
    onUpsertDeviceInState: upsertDeviceInState,
    resetDeviceForm,
  });

  function getOwnerLabel(device) {
    if (device.owner_name) {
      return device.owner_name;
    }

    if (device.owner_id) {
      return `Unknown employee #${device.owner_id}`;
    }

    return "Unassigned";
  }

  return (
    <section className="panel">
      {createTitle || editTitle ? (
        <h2>{isEditing ? editTitle : createTitle}</h2>
      ) : null}

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

      {listTitle ? (
        <h3>
          {listTitle} {loadingDevices ? "(loading...)" : ""}
        </h3>
      ) : null}
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
              <td>{getOwnerLabel(device)}</td>
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
