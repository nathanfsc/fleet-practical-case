const { createHttpError } = require("../../utils/httpError");
const { optionalId, requireId, requireText } = require("../../utils/validation");
const { EmployeeRepository } = require("../employee/employee.repository");
const { DeviceRepository } = require("./device.repository");

class DeviceService {
  constructor({
    deviceRepository = new DeviceRepository(),
    employeeRepository = new EmployeeRepository(),
  } = {}) {
    this.deviceRepository = deviceRepository;
    this.employeeRepository = employeeRepository;
  }

  async validateOwner(ownerId) {
    if (!ownerId) {
      return null;
    }

    const owner = await this.employeeRepository.findById(ownerId);

    if (!owner) {
      throw createHttpError(400, "Owner employee does not exist");
    }

    return ownerId;
  }

  async listDevices(query) {
    return this.deviceRepository.findAll({
      ownerId: query.ownerId || "",
      search: query.search || "",
      type: query.type || "",
    });
  }

  async createDevice(payload) {
    const device = {
      name: requireText(payload.name, "name", "Both name and type are required"),
      ownerId: optionalId(payload.ownerId),
      type: requireText(payload.type, "type", "Both name and type are required"),
    };

    await this.validateOwner(device.ownerId);

    return this.deviceRepository.create(device);
  }

  async updateDevice(deviceId, payload) {
    const id = requireId(deviceId, "device");
    const device = {
      name: requireText(payload.name, "name", "Both name and type are required"),
      ownerId: optionalId(payload.ownerId),
      type: requireText(payload.type, "type", "Both name and type are required"),
    };

    await this.validateOwner(device.ownerId);

    const result = await this.deviceRepository.update(id, device);

    if (!result.changes) {
      throw createHttpError(404, "Device not found");
    }

    return result.device;
  }

  async deleteDevice(deviceId) {
    const id = requireId(deviceId, "device");
    const result = await this.deviceRepository.deleteById(id);

    if (!result.changes) {
      throw createHttpError(404, "Device not found");
    }

    return { success: true };
  }
}

module.exports = { DeviceService };
