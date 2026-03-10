const { createHttpError } = require("../utils/httpError");
const { optionalId, requireId, requireText } = require("../utils/validation");

function createDeviceService({ deviceRepository, employeeRepository }) {
  async function validateOwner(ownerId) {
    if (!ownerId) {
      return null;
    }

    const owner = await employeeRepository.findById(ownerId);

    if (!owner) {
      throw createHttpError(400, "Owner employee does not exist");
    }

    return ownerId;
  }

  async function listDevices(query) {
    return deviceRepository.findAll({
      ownerId: query.ownerId || "",
      search: query.search || "",
      type: query.type || "",
    });
  }

  async function createDevice(payload) {
    const device = {
      name: requireText(payload.name, "name", "Both name and type are required"),
      ownerId: optionalId(payload.ownerId),
      type: requireText(payload.type, "type", "Both name and type are required"),
    };

    await validateOwner(device.ownerId);

    return deviceRepository.create(device);
  }

  async function updateDevice(deviceId, payload) {
    const id = requireId(deviceId, "device");
    const device = {
      name: requireText(payload.name, "name", "Both name and type are required"),
      ownerId: optionalId(payload.ownerId),
      type: requireText(payload.type, "type", "Both name and type are required"),
    };

    await validateOwner(device.ownerId);

    const result = await deviceRepository.update(id, device);

    if (!result.changes) {
      throw createHttpError(404, "Device not found");
    }

    return result.device;
  }

  async function deleteDevice(deviceId) {
    const id = requireId(deviceId, "device");
    const result = await deviceRepository.deleteById(id);

    if (!result.changes) {
      throw createHttpError(404, "Device not found");
    }

    return { success: true };
  }

  return {
    createDevice,
    deleteDevice,
    listDevices,
    updateDevice,
  };
}

module.exports = { createDeviceService };
