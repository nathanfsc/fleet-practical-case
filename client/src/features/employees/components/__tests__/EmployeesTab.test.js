import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EmployeesTab from "../EmployeesTab";
import {
  createEmployee,
  removeEmployee,
  updateEmployee,
} from "../../services/employeesService";
import { EMPLOYEE_ROLE_OPTIONS } from "../../Employees.constant";

const [SUPPORT, OPS, QA, PRODUCT_MANAGER, DESIGNER, DEVELOPER] =
  EMPLOYEE_ROLE_OPTIONS;

jest.mock("../../services/employeesService", () => ({
  createEmployee: jest.fn(),
  removeEmployee: jest.fn(),
  updateEmployee: jest.fn(),
}));

function setupEmployeesTab(overrides = {}) {
  const props = {
    employees: [
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
    ],
    loadingEmployees: false,
    refreshEmployees: jest.fn().mockResolvedValue(undefined),
    refreshDevices: jest.fn().mockResolvedValue(undefined),
    onStatusMessage: jest.fn(),
    onError: jest.fn(),
    ...overrides,
  };

  render(<EmployeesTab {...props} />);
  return props;
}

describe("EmployeesTab - filtering feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("filters employees by role", () => {
    setupEmployeesTab();

    fireEvent.change(screen.getByLabelText("Role filter"), {
      target: { value: SUPPORT },
    });

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("filters employees by search", () => {
    setupEmployeesTab();

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
    window.localStorage.clear();
    createEmployee.mockResolvedValue({ id: 10 });
    updateEmployee.mockResolvedValue({ id: 1 });
    removeEmployee.mockResolvedValue(undefined);
  });

  it("creates an employee and refreshes related data", async () => {
    const setup = setupEmployeesTab();

    fireEvent.change(screen.getByPlaceholderText("Employee name"), {
      target: { value: "Charlie" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(DEVELOPER),
      {
        target: { value: QA },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createEmployee).toHaveBeenCalledWith({
        payload: { name: "Charlie", role: QA },
      });
    });
    expect(setup.onStatusMessage).toHaveBeenCalledWith("Employee created");
    expect(setup.refreshEmployees).toHaveBeenCalledTimes(1);
    expect(setup.refreshDevices).toHaveBeenCalledTimes(1);
  });

  it("updates the selected employee", async () => {
    const setup = setupEmployeesTab();

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);

    fireEvent.change(screen.getByPlaceholderText("Employee name"), {
      target: { value: "Alice Updated" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(DEVELOPER),
      {
        target: { value: PRODUCT_MANAGER },
      },
    );
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
  });

  it("deletes an employee and refreshes devices so unassigned devices are reloaded", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const setup = setupEmployeesTab();

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    await waitFor(() => {
      expect(removeEmployee).toHaveBeenCalledWith(1);
    });

    expect(setup.onStatusMessage).toHaveBeenCalledWith("Employee deleted");
    expect(setup.refreshEmployees).toHaveBeenCalledTimes(1);
    expect(setup.refreshDevices).toHaveBeenCalledTimes(1);

    confirmSpy.mockRestore();
  });
});
