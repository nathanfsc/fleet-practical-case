import { render, waitFor } from "@testing-library/react";
import OrdersTab from "../OrdersTab";
import { getOrders } from "../../services/ordersService";

jest.mock("../../services/ordersService", () => ({
  getOrders: jest.fn(),
}));

describe("OrdersTab - refresh feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getOrders.mockResolvedValue([]);
  });

  it("loads orders on mount", async () => {
    render(<OrdersTab title="Orders" />);

    await waitFor(() => {
      expect(getOrders).toHaveBeenCalledTimes(1);
    });
  });

  it("refreshes orders when refreshVersion changes", async () => {
    const { rerender } = render(
      <OrdersTab refreshVersion={0} title="Orders" />,
    );

    await waitFor(() => {
      expect(getOrders).toHaveBeenCalledTimes(1);
    });

    rerender(<OrdersTab refreshVersion={1} title="Orders" />);

    await waitFor(() => {
      expect(getOrders).toHaveBeenCalledTimes(2);
    });
  });

  it("loads orders only once on mount when refreshVersion is already set", async () => {
    render(<OrdersTab refreshVersion={1} title="Orders" />);

    await waitFor(() => {
      expect(getOrders).toHaveBeenCalledTimes(1);
    });
  });
});
