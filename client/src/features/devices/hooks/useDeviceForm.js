import { useState } from "react";

const DEFAULT_DEVICE_FORM = { name: "", type: "Laptop", ownerId: "" };

export function useDeviceForm() {
  const [deviceForm, setDeviceForm] = useState(DEFAULT_DEVICE_FORM);
  const [editingDeviceId, setEditingDeviceId] = useState(null);

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

  return {
    deviceForm,
    setDeviceForm,
    editingDeviceId,
    beginDeviceEdit,
    resetDeviceForm,
  };
}
