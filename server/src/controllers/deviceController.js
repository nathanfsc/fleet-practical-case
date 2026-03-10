const { sendErrorResponse } = require("../utils/httpError");

function createDeviceController(deviceService) {
  async function listDevices(req, res) {
    try {
      const devices = await deviceService.listDevices(req.query || {});
      res.json(devices);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to fetch devices");
    }
  }

  async function createDevice(req, res) {
    try {
      const device = await deviceService.createDevice(req.body || {});
      res.status(201).json(device);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to create device");
    }
  }

  async function updateDevice(req, res) {
    try {
      const device = await deviceService.updateDevice(req.params.id, req.body || {});
      res.json(device);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to update device");
    }
  }

  async function deleteDevice(req, res) {
    try {
      const result = await deviceService.deleteDevice(req.params.id);
      res.json(result);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to delete device");
    }
  }

  return {
    createDevice,
    deleteDevice,
    listDevices,
    updateDevice,
  };
}

module.exports = { createDeviceController };
