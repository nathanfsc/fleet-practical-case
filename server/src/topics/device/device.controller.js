const { sendErrorResponse } = require("../../utils/httpError");
const { DeviceService } = require("./device.service");

class DeviceController {
  constructor({ deviceService = new DeviceService() } = {}) {
    this.deviceService = deviceService;
    this.listDevices = this.listDevices.bind(this);
    this.createDevice = this.createDevice.bind(this);
    this.updateDevice = this.updateDevice.bind(this);
    this.deleteDevice = this.deleteDevice.bind(this);
  }

  async listDevices(req, res) {
    try {
      const devices = await this.deviceService.listDevices(req.query || {});
      res.json(devices);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to fetch devices");
    }
  }

  async createDevice(req, res) {
    try {
      const device = await this.deviceService.createDevice(req.body || {});
      res.status(201).json(device);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to create device");
    }
  }

  async updateDevice(req, res) {
    try {
      const device = await this.deviceService.updateDevice(
        req.params.id,
        req.body || {},
      );
      res.json(device);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to update device");
    }
  }

  async deleteDevice(req, res) {
    try {
      const result = await this.deviceService.deleteDevice(req.params.id);
      res.json(result);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to delete device");
    }
  }
}

module.exports = { DeviceController };
