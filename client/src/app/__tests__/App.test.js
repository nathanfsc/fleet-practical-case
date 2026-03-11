import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { getDevices } from "../../features/devices/services/devicesService";
import { getEmployees } from "../../features/employees/services/employeesService";

jest.mock("../../features/devices/services/devicesService", () => ({
  getDevices: jest.fn(),
}));

jest.mock("../../features/employees/services/employeesService", () => ({
  getEmployees: jest.fn(),
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
  return function MockCatalogTab() {
    return <div data-testid="catalog-tab">Catalog Tab</div>;
  };
});

jest.mock("../../features/orders/components/OrdersTab", () => {
  return function MockOrdersTab() {
    return <div data-testid="orders-tab">Orders Tab</div>;
  };
});

describe("App - navigation feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    window.location.hash = "";
    getEmployees.mockResolvedValue([]);
    getDevices.mockResolvedValue([]);
  });

  it("uses hash as initial active tab", async () => {
    window.location.hash = "#devices";

    render(<App />);

    expect(await screen.findByTestId("devices-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("employees-tab")).not.toBeInTheDocument();
  });

  it("persists selected tab in localStorage and hash", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Devices" }));

    expect(window.location.hash).toBe("#devices");
    await waitFor(() => {
      expect(window.localStorage.getItem("fleet_active_tab")).toBe("devices");
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
});

describe("App - data loading feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    window.location.hash = "";
  });

  it("loads employees and devices on startup", async () => {
    getEmployees.mockResolvedValue([
      { id: 1, name: "Alice", role: "Developer" },
    ]);
    getDevices.mockResolvedValue([
      { id: 10, name: "Laptop", type: "Laptop", owner_id: 1 },
    ]);

    render(<App />);

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getDevices).toHaveBeenCalledTimes(1));
  });
});

describe("App - dashboard and errors feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    window.location.hash = "";
  });

  it("computes and renders KPI counters", async () => {
    getEmployees.mockResolvedValue([
      { id: 1, name: "Alice", role: "Developer" },
      { id: 2, name: "Bob", role: "Support" },
    ]);
    getDevices.mockResolvedValue([
      { id: 11, name: "MacBook Pro", type: "Laptop", owner_id: 1 },
      { id: 12, name: "Monitor", type: "Display", owner_id: null },
      { id: 13, name: "iPhone", type: "Mobile", owner_id: 2 },
    ]);

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

    render(<App />);

    expect(
      await screen.findByText("Employees fetch failed"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Devices fetch failed")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Employees fetch failed"),
      ).not.toBeInTheDocument();
    });
  });
});
