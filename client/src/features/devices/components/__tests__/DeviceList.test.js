import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DevicesTab from "../DeviceList";
import {
  createDevice,
  removeDevice,
  updateDevice,
} from "../../services/devicesService";
import { DEVICE_TYPE_OPTIONS } from "../../Devices.constant";
import { clearLocalStorage } from "../../../../shared/localStorageService";

const [MOBILE, PERIPHERAL, DISPLAY, LAPTOP] = DEVICE_TYPE_OPTIONS;

jest.mock("../../services/devicesService", () => ({
  createDevice: jest.fn(),
  removeDevice: jest.fn(),
  updateDevice: jest.fn(),
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
        owner_name: "Alice",
      },
      {
        id: 11,
        name: "Dell Monitor",
        type: DISPLAY,
        owner_id: 2,
        owner_name: "Bob",
      },
      { id: 12, name: "iPhone", type: MOBILE, owner_id: 2, owner_name: "Bob" },
    ],
    loadingDevices: false,
    onRemoveDeviceFromState: jest.fn(),
    onUpsertDeviceInState: jest.fn(),
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
    clearLocalStorage();
  });

  it("renders owner names from the device payload", async () => {
    setupDevicesTab();

    expect(screen.getByRole("cell", { name: "Alice" })).toBeInTheDocument();
    expect(screen.getAllByRole("cell", { name: "Bob" }).length).toBe(2);
  });

  it("shows unassigned when no owner is set", async () => {
    setupDevicesTab({
      devices: [
        {
          id: 10,
          name: "Desk Phone",
          type: MOBILE,
          owner_id: null,
          owner_name: null,
        },
      ],
    });

    expect(screen.getByRole("cell", { name: "Unassigned" })).toBeInTheDocument();
  });

  it("falls back to unknown owner label when owner name is missing", async () => {
    setupDevicesTab({
      devices: [
        {
          id: 10,
          name: "MacBook Pro",
          type: LAPTOP,
          owner_id: 99,
          owner_name: null,
        },
      ],
    });

    expect(screen.getByText("Unknown employee #99")).toBeInTheDocument();
  });
});

describe("DevicesTab - mutation feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearLocalStorage();
    createDevice.mockResolvedValue({
      id: 99,
      name: "ThinkPad",
      type: LAPTOP,
      owner_id: 1,
      owner_name: "Alice",
    });
    updateDevice.mockResolvedValue({
      id: 10,
      name: "MacBook Pro M3",
      type: LAPTOP,
      owner_id: 1,
      owner_name: "Alice",
    });
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
    expect(setup.onUpsertDeviceInState).toHaveBeenCalledWith({
      id: 99,
      name: "ThinkPad",
      type: LAPTOP,
      owner_id: 1,
      owner_name: "Alice",
    });
    expect(setup.refreshEmployees).not.toHaveBeenCalled();
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
    expect(setup.onUpsertDeviceInState).toHaveBeenCalledWith({
      id: 10,
      name: "MacBook Pro M3",
      type: LAPTOP,
      owner_id: 1,
      owner_name: "Alice",
    });
    expect(setup.refreshEmployees).not.toHaveBeenCalled();
  });

  it("deletes a device when confirmation is accepted", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const setup = setupDevicesTab();

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    await waitFor(() => {
      expect(removeDevice).toHaveBeenCalledWith(10);
    });

    expect(setup.onStatusMessage).toHaveBeenCalledWith("Device deleted");
    expect(setup.onRemoveDeviceFromState).toHaveBeenCalledWith(10);
    expect(setup.refreshEmployees).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
