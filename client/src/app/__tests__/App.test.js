import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { getDevices } from "../../features/devices/services/devicesService";
import { getEmployees } from "../../features/employees/services/employeesService";
import { getDashboardCounts } from "../services/dashboardService";
import {
  clearLocalStorage,
  getLocalStorageItem,
} from "../../shared/localStorageService";

const mockCatalogTab = jest.fn();
const mockOrdersTab = jest.fn();

jest.mock("../../features/devices/services/devicesService", () => ({
  getDevices: jest.fn(),
}));

jest.mock("../../features/employees/services/employeesService", () => ({
  getEmployees: jest.fn(),
}));

jest.mock("../services/dashboardService", () => ({
  EMPTY_DASHBOARD_COUNTS: {
    totalEmployees: 0,
    totalDevices: 0,
    ownedDevices: 0,
  },
  getDashboardCounts: jest.fn(),
}));

jest.mock("../../features/employees/components/EmployeeList", () => {
  return function MockEmployeesTab() {
    return <div data-testid="employees-tab">Employees Tab</div>;
  };
});

jest.mock("../../features/devices/components/DeviceList", () => {
  return function MockDevicesTab() {
    return <div data-testid="devices-tab">Devices Tab</div>;
  };
});

jest.mock("../../features/catalog/components/CatalogList", () => {
  return function MockCatalogTab(props) {
    mockCatalogTab(props);
    return <div data-testid="catalog-tab">Catalog Tab</div>;
  };
});

jest.mock("../../features/orders/components/OrdersTab", () => {
  return function MockOrdersTab(props) {
    mockOrdersTab(props);
    return <div data-testid="orders-tab">Orders Tab</div>;
  };
});

describe("App - navigation feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearLocalStorage();
    window.location.hash = "";
    getEmployees.mockResolvedValue([]);
    getDevices.mockResolvedValue([]);
    getDashboardCounts.mockResolvedValue({
      totalEmployees: 0,
      totalDevices: 0,
      ownedDevices: 0,
    });
  });

  it("uses hash as initial active tab", async () => {
    window.location.hash = "#devices";

    render(<App />);

    expect(await screen.findByTestId("devices-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("employees-tab")).not.toBeInTheDocument();
    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getDevices).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getDashboardCounts).toHaveBeenCalledTimes(1));
  });

  it("persists selected tab in localStorage and hash", async () => {
    render(<App />);

    await waitFor(() => expect(getDashboardCounts).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "Devices" }));

    expect(window.location.hash).toBe("#devices");
    await waitFor(() => {
      expect(getLocalStorageItem("fleet_active_tab")).toBe("devices");
    });
    expect(getDashboardCounts).toHaveBeenCalledTimes(1);
  });

  it("renders the catalog tab only when catalog is active", async () => {
    render(<App />);

    expect(screen.queryByTestId("catalog-tab")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Catalog" }));

    expect(await screen.findByTestId("catalog-tab")).toBeInTheDocument();
  });

  it("renders the orders tab only when orders is active", async () => {
    render(<App />);

    expect(screen.queryByTestId("orders-tab")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Orders" }));

    expect(await screen.findByTestId("orders-tab")).toBeInTheDocument();
  });

  it("increments catalog refresh version on manual refresh when catalog is active", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Catalog" }));

    await screen.findByTestId("catalog-tab");
    expect(mockCatalogTab).toHaveBeenLastCalledWith(
      expect.objectContaining({ refreshVersion: 0 }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Manual refresh" }));

    await waitFor(() => {
      expect(mockCatalogTab).toHaveBeenLastCalledWith(
        expect.objectContaining({ refreshVersion: 1 }),
      );
    });
  });

  it("increments orders refresh version on manual refresh when orders is active", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Orders" }));

    await screen.findByTestId("orders-tab");
    expect(mockOrdersTab).toHaveBeenLastCalledWith(
      expect.objectContaining({ refreshVersion: 0 }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Manual refresh" }));

    await waitFor(() => {
      expect(mockOrdersTab).toHaveBeenLastCalledWith(
        expect.objectContaining({ refreshVersion: 1 }),
      );
    });
  });
});

describe("App - data loading feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearLocalStorage();
    window.location.hash = "";
    getDashboardCounts.mockResolvedValue({
      totalEmployees: 0,
      totalDevices: 0,
      ownedDevices: 0,
    });
  });

  it("loads employees and dashboard counts on employees startup", async () => {
    getEmployees.mockResolvedValue([
      { id: 1, name: "Alice", role: "Developer" },
    ]);
    getDevices.mockResolvedValue([
      { id: 10, name: "Laptop", type: "Laptop", owner_id: 1 },
    ]);

    render(<App />);

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getDashboardCounts).toHaveBeenCalledTimes(1));
    expect(getDevices).not.toHaveBeenCalled();
  });

  it("loads employees, devices and dashboard counts on devices startup", async () => {
    window.location.hash = "#devices";
    getEmployees.mockResolvedValue([
      { id: 1, name: "Alice", role: "Developer" },
    ]);
    getDevices.mockResolvedValue([
      { id: 10, name: "Laptop", type: "Laptop", owner_id: 1 },
    ]);

    render(<App />);

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getDevices).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getDashboardCounts).toHaveBeenCalledTimes(1));
  });

  it("manually refreshes only employees data on employees tab", async () => {
    getEmployees.mockResolvedValue([]);
    getDevices.mockResolvedValue([]);

    render(<App />);

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getDashboardCounts).toHaveBeenCalledTimes(1));
    expect(getDevices).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Manual refresh" }));

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(getDashboardCounts).toHaveBeenCalledTimes(2));
    expect(getDevices).not.toHaveBeenCalled();
  });
});

describe("App - dashboard and errors feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearLocalStorage();
    window.location.hash = "";
  });

  it("renders KPI counters from shared counts", async () => {
    getEmployees.mockResolvedValue([]);
    getDevices.mockResolvedValue([]);
    getDashboardCounts.mockResolvedValue({
      totalEmployees: 2,
      totalDevices: 3,
      ownedDevices: 2,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByRole("article")[0]).toHaveTextContent("2");
    });

    expect(screen.getAllByRole("article")[1]).toHaveTextContent("3");
    expect(screen.getAllByRole("article")[2]).toHaveTextContent("2");
  });

  it("shows and clears the error stack", async () => {
    getEmployees.mockRejectedValue(new Error("Employees fetch failed"));
    getDevices.mockRejectedValue(new Error("Devices fetch failed"));
    getDashboardCounts.mockRejectedValue(new Error("Dashboard counts failed"));

    render(<App />);

    expect(
      await screen.findByText("Employees fetch failed"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Dashboard counts failed")).toBeInTheDocument();
    expect(screen.queryByText("Devices fetch failed")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Employees fetch failed"),
      ).not.toBeInTheDocument();
    });
  });
});
