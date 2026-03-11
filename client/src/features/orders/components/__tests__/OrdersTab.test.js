import { render, screen, waitFor } from "@testing-library/react";
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
    render(
      <OrdersTab
        onError={jest.fn()}
        onRefreshStart={jest.fn()}
        onRefreshed={jest.fn()}
        refreshTick={0}
        title="Orders"
      />,
    );

    await waitFor(() => {
      expect(getOrders).toHaveBeenCalledTimes(1);
    });
  });

  it("refreshes orders when refreshTick changes", async () => {
    const props = {
      onError: jest.fn(),
      onRefreshStart: jest.fn(),
      onRefreshed: jest.fn(),
      title: "Orders",
    };
    const { rerender } = render(
      <OrdersTab {...props} refreshTick={0} />,
    );

    await waitFor(() => {
      expect(getOrders).toHaveBeenCalledTimes(1);
    });

    rerender(<OrdersTab {...props} refreshTick={1} />);

    await waitFor(() => {
      expect(getOrders).toHaveBeenCalledTimes(2);
    });
  });

  it("renders fetched orders", async () => {
    getOrders.mockResolvedValue([
      {
        id: 10,
        createdAt: "2026-03-11",
        totalAmount: "4998",
        items: [
          {
            id: 100,
            productName: "MacBook Pro",
            configuration: "16GB / 512GB",
            quantity: 2,
          },
        ],
      },
    ]);

    render(
      <OrdersTab
        onError={jest.fn()}
        onRefreshStart={jest.fn()}
        onRefreshed={jest.fn()}
        refreshTick={0}
        title="Orders"
      />,
    );

    expect(await screen.findByText("#10")).toBeInTheDocument();
    expect(screen.getByText("2026-03-11")).toBeInTheDocument();
    expect(
      screen.getByText("MacBook Pro - 16GB / 512GB x2"),
    ).toBeInTheDocument();
    expect(screen.getByText("4998")).toBeInTheDocument();
  });
});
