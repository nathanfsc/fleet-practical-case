import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { getDashboardCounts } from "../services/dashboardService";
import {
  clearLocalStorage,
  getLocalStorageItem,
} from "../../shared/localStorageService";

const mockEmployeesTab = jest.fn();
const mockDevicesTab = jest.fn();
const mockCatalogTab = jest.fn();
const mockOrdersTab = jest.fn();

jest.mock("../services/dashboardService", () => ({
  EMPTY_DASHBOARD_COUNTS: {
    totalEmployees: 0,
    totalDevices: 0,
    ownedDevices: 0,
  },
  getDashboardCounts: jest.fn(),
}));

jest.mock("../../features/employees/components/EmployeeList", () => {
  return function MockEmployeesTab(props) {
    mockEmployeesTab(props);
    return <div data-testid="employees-tab">Employees Tab</div>;
  };
});

jest.mock("../../features/devices/components/DeviceList", () => {
  return function MockDevicesTab(props) {
    mockDevicesTab(props);
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

  it("increments the active tab refresh tick on manual refresh", async () => {
    render(<App />);

    expect(await screen.findByTestId("employees-tab")).toBeInTheDocument();
    expect(mockEmployeesTab).toHaveBeenLastCalledWith(
      expect.objectContaining({ refreshTick: 0 }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Manual refresh" }));

    await waitFor(() => {
      expect(mockEmployeesTab).toHaveBeenLastCalledWith(
        expect.objectContaining({ refreshTick: 1 }),
      );
    });
  });
});

describe("App - dashboard feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearLocalStorage();
    window.location.hash = "";
  });

  it("loads dashboard counts on startup and refreshes them manually", async () => {
    getDashboardCounts.mockResolvedValue({
      totalEmployees: 2,
      totalDevices: 3,
      ownedDevices: 2,
    });

    render(<App />);

    await waitFor(() => expect(getDashboardCounts).toHaveBeenCalledTimes(1));
    expect(screen.getAllByRole("article")[0]).toHaveTextContent("2");
    expect(screen.getAllByRole("article")[1]).toHaveTextContent("3");
    expect(screen.getAllByRole("article")[2]).toHaveTextContent("2");

    fireEvent.click(screen.getByRole("button", { name: "Manual refresh" }));

    await waitFor(() => expect(getDashboardCounts).toHaveBeenCalledTimes(2));
  });

  it("shows and clears dashboard errors", async () => {
    getDashboardCounts.mockRejectedValue(new Error("Dashboard counts failed"));

    render(<App />);

    expect(await screen.findByText("Dashboard counts failed")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Dashboard counts failed"),
      ).not.toBeInTheDocument();
    });
  });
});
