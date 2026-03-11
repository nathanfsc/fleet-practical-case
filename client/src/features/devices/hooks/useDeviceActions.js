import {
  createDevice,
  removeDevice,
  updateDevice,
} from "../services/devicesService";

export function useDeviceActions({
  deviceForm,
  editingDeviceId,
  onError,
  onStatusMessage,
  refreshDevices,
  refreshDashboardCounts,
  refreshEmployees,
  resetDeviceForm,
}) {
  const isEditing = Boolean(editingDeviceId);

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
      resetDeviceForm();
      await refreshDevices();
      await refreshEmployees();
      await refreshDashboardCounts();
    } catch (error) {
      onError(
        isEditing
          ? `Device update failed: ${error.message}`
          : `Device creation failed: ${error.message}`,
      );
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
      await refreshDashboardCounts();
    } catch (error) {
      onError(`Device delete failed: ${error.message}`);
    }
  }

  return {
    isEditing,
    submitDevice,
    handleDeleteDevice,
  };
}
