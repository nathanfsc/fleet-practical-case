export async function getDevices() {
  const response = await fetch("/api/devices");
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "Could not load devices");
  }

  return Array.isArray(json) ? json : [];
}

export async function saveDevice({ deviceId, payload }) {
  const isEditing = Boolean(deviceId);
  const url = isEditing ? `/api/devices/${deviceId}` : "/api/devices";
  const method = isEditing ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "Could not save device");
  }

  return json;
}

export async function removeDevice(deviceId) {
  const response = await fetch(`/api/devices/${deviceId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let message = "Could not delete device";

    try {
      const json = await response.json();
      message = json.message || message;
    } catch {
      // Ignore non-JSON delete errors and use default message.
    }

    throw new Error(message);
  }
}
