import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EmployeesTab from "../EmployeeList";
import {
  createEmployee,
  getEmployees,
  removeEmployee,
  updateEmployee,
} from "../../services/employeesService";
import { EMPLOYEE_ROLE_OPTIONS } from "../../Employees.constant";
import { clearLocalStorage } from "../../../../shared/localStorageService";

const [SUPPORT, OPS, QA, PRODUCT_MANAGER, DESIGNER, DEVELOPER] =
  EMPLOYEE_ROLE_OPTIONS;

jest.mock("../../services/employeesService", () => ({
  getEmployees: jest.fn(),
  createEmployee: jest.fn(),
  removeEmployee: jest.fn(),
  updateEmployee: jest.fn(),
}));

function setupEmployeesTab(overrides = {}) {
  const props = {
    onRefreshStart: jest.fn(),
    onRefreshed: jest.fn(),
    refreshDashboardCounts: jest.fn().mockResolvedValue(undefined),
    refreshTick: 0,
    onStatusMessage: jest.fn(),
    onError: jest.fn(),
    ...overrides,
  };

  render(<EmployeesTab {...props} />);
  return props;
}

describe("EmployeesTab - loading and filtering feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearLocalStorage();
    getEmployees.mockResolvedValue([
      {
        id: 1,
        name: "Alice",
        role: DEVELOPER,
        device_count: 2,
      },
      {
        id: 2,
        name: "Bob",
        role: SUPPORT,
        device_count: 1,
      },
    ]);
  });

  it("loads employees on mount", async () => {
    setupEmployeesTab();

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("refreshes employees when refreshTick changes", async () => {
    const props = {
      onRefreshStart: jest.fn(),
      onRefreshed: jest.fn(),
      refreshDashboardCounts: jest.fn().mockResolvedValue(undefined),
      onStatusMessage: jest.fn(),
      onError: jest.fn(),
    };
    const { rerender } = render(
      <EmployeesTab {...props} refreshTick={0} />,
    );

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(1));

    rerender(<EmployeesTab {...props} refreshTick={1} />);

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(2));
  });

  it("filters employees by role", async () => {
    setupEmployeesTab();

    expect(await screen.findByText("Alice")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Role filter"), {
      target: { value: SUPPORT },
    });

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("filters employees by search", async () => {
    setupEmployeesTab();

    expect(await screen.findByText("Alice")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search name / role"), {
      target: { value: "dev" },
    });

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });
});

describe("EmployeesTab - mutation feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearLocalStorage();
    getEmployees.mockResolvedValue([
      {
        id: 1,
        name: "Alice",
        role: DEVELOPER,
        device_count: 2,
      },
      {
        id: 2,
        name: "Bob",
        role: SUPPORT,
        device_count: 1,
      },
    ]);
    createEmployee.mockResolvedValue({ id: 10, name: "Charlie", role: QA });
    updateEmployee.mockResolvedValue({
      id: 1,
      name: "Alice Updated",
      role: PRODUCT_MANAGER,
    });
    removeEmployee.mockResolvedValue(undefined);
  });

  it("creates an employee and refreshes dashboard counts", async () => {
    const setup = setupEmployeesTab();

    expect(await screen.findByText("Alice")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Employee name"), {
      target: { value: "Charlie" },
    });
    fireEvent.change(screen.getByPlaceholderText(DEVELOPER), {
      target: { value: QA },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createEmployee).toHaveBeenCalledWith({
        payload: { name: "Charlie", role: QA },
      });
    });

    expect(setup.onStatusMessage).toHaveBeenCalledWith("Employee created");
    expect(setup.refreshDashboardCounts).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Charlie")).toBeInTheDocument();
  });

  it("updates the selected employee", async () => {
    const setup = setupEmployeesTab();

    expect(await screen.findByText("Alice")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    fireEvent.change(screen.getByPlaceholderText("Employee name"), {
      target: { value: "Alice Updated" },
    });
    fireEvent.change(screen.getByPlaceholderText(DEVELOPER), {
      target: { value: PRODUCT_MANAGER },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => {
      expect(updateEmployee).toHaveBeenCalledWith({
        employeeId: 1,
        payload: {
          name: "Alice Updated",
          role: PRODUCT_MANAGER,
        },
      });
    });

    expect(setup.onStatusMessage).toHaveBeenCalledWith("Employee updated");
    expect(setup.refreshDashboardCounts).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Alice Updated")).toBeInTheDocument();
  });

  it("deletes an employee", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const setup = setupEmployeesTab();

    expect(await screen.findByText("Alice")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    await waitFor(() => {
      expect(removeEmployee).toHaveBeenCalledWith(1);
    });

    expect(setup.onStatusMessage).toHaveBeenCalledWith("Employee deleted");
    expect(setup.refreshDashboardCounts).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });
});
