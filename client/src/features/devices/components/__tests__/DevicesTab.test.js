import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DevicesTab from "../DevicesTab";
import {
  createDevice,
  removeDevice,
  updateDevice,
} from "../../services/devicesService";
import { getEmployeesByIds } from "../../../employees/services/employeesService";
import { DEVICE_TYPE_OPTIONS } from "../../Devices.constant";

const [MOBILE, PERIPHERAL, DISPLAY, LAPTOP] = DEVICE_TYPE_OPTIONS;

jest.mock("../../services/devicesService", () => ({
  createDevice: jest.fn(),
  removeDevice: jest.fn(),
  updateDevice: jest.fn(),
}));

jest.mock("../../../employees/services/employeesService", () => ({
  getEmployeesByIds: jest.fn(),
}));

function setupDevicesTab(overrides = {}) {
  const props = {
    employees: [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ],
    devices: [
      {
        id: 10,
        name: "MacBook Pro",
        type: LAPTOP,
        owner_id: 1,
      },
      {
        id: 11,
        name: "Dell Monitor",
        type: DISPLAY,
        owner_id: 2,
      },
      { id: 12, name: "iPhone", type: MOBILE, owner_id: 2 },
    ],
    loadingDevices: false,
    refreshDevices: jest.fn().mockResolvedValue(undefined),
    refreshEmployees: jest.fn().mockResolvedValue(undefined),
    onStatusMessage: jest.fn(),
    onError: jest.fn(),
    ...overrides,
  };

  render(<DevicesTab {...props} />);
  return props;
}

describe("DevicesTab - owner resolution feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("resolves owner names with unique owner ids", async () => {
    getEmployeesByIds.mockResolvedValue([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);

    setupDevicesTab();

    await waitFor(() => expect(getEmployeesByIds).toHaveBeenCalledTimes(1));
    expect(getEmployeesByIds).toHaveBeenCalledWith([1, 2]);

    expect(
      await screen.findByRole("cell", { name: "Alice" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("cell", { name: "Bob" }).length).toBe(2);
  });

  it("falls back to unknown owner label on lookup failure", async () => {
    getEmployeesByIds.mockRejectedValue(new Error("lookup failed"));

    setupDevicesTab({
      devices: [
        {
          id: 10,
          name: "MacBook Pro",
          type: LAPTOP,
          owner_id: 99,
        },
      ],
    });

    expect(await screen.findByText("Unknown employee #99")).toBeInTheDocument();
  });

  it("falls back to unknown owner label when the batch response misses ids", async () => {
    getEmployeesByIds.mockResolvedValue([{ id: 1, name: "Alice" }]);

    setupDevicesTab({
      devices: [
        {
          id: 10,
          name: "MacBook Pro",
          type: LAPTOP,
          owner_id: 1,
        },
        {
          id: 11,
          name: "Dell Monitor",
          type: DISPLAY,
          owner_id: 99,
        },
      ],
    });

    expect(
      await screen.findByRole("cell", { name: "Alice" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Unknown employee #99")).toBeInTheDocument();
  });
});

describe("DevicesTab - mutation feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    getEmployeesByIds.mockResolvedValue([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    createDevice.mockResolvedValue({ id: 99 });
    updateDevice.mockResolvedValue({ id: 10 });
    removeDevice.mockResolvedValue(undefined);
  });

  it("creates a device and refreshes dependent data", async () => {
    const setup = setupDevicesTab();

    fireEvent.change(screen.getByLabelText("Device name"), {
      target: { value: "ThinkPad" },
    });
    fireEvent.change(screen.getByLabelText("Type"), {
      target: { value: LAPTOP },
    });
    fireEvent.change(screen.getByLabelText("Owner"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createDevice).toHaveBeenCalledWith({
        payload: {
          name: "ThinkPad",
          type: LAPTOP,
          ownerId: "1",
        },
      });
    });

    expect(setup.onStatusMessage).toHaveBeenCalledWith("Device created");
    expect(setup.refreshDevices).toHaveBeenCalledTimes(1);
    expect(setup.refreshEmployees).toHaveBeenCalledTimes(1);
  });

  it("updates an existing device", async () => {
    const setup = setupDevicesTab();

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    fireEvent.change(screen.getByLabelText("Device name"), {
      target: { value: "MacBook Pro M3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => {
      expect(updateDevice).toHaveBeenCalledWith({
        deviceId: 10,
        payload: {
          name: "MacBook Pro M3",
          type: LAPTOP,
          ownerId: "1",
        },
      });
    });

    expect(setup.onStatusMessage).toHaveBeenCalledWith("Device updated");
  });

  it("deletes a device when confirmation is accepted", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const setup = setupDevicesTab();

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    await waitFor(() => {
      expect(removeDevice).toHaveBeenCalledWith(10);
    });

    expect(setup.onStatusMessage).toHaveBeenCalledWith("Device deleted");
    expect(setup.refreshDevices).toHaveBeenCalledTimes(1);
    expect(setup.refreshEmployees).toHaveBeenCalledTimes(1);

    confirmSpy.mockRestore();
  });
});
