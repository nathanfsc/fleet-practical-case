import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import CatalogTab from "../CatalogList";
import { getProductList } from "../../services/catalogService";
import {
  clearLocalStorage,
  getJsonLocalStorageItem,
  setJsonLocalStorageItem,
} from "../../../../shared/localStorageService";

jest.mock("../../services/catalogService", () => ({
  getProductList: jest.fn(),
}));

function setupCatalogTab(overrides = {}) {
  render(<CatalogTab {...overrides} />);
}

describe("CatalogTab - cart feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearLocalStorage();
  });

  it("merges duplicate additions into one line with an updated quantity", async () => {
    getProductList.mockResolvedValue([
      {
        id: 1,
        name: "MacBook Pro",
        variant_id: 2,
        configuration: "16GB / 512GB",
        price: "2499",
        stock: 4,
      },
    ]);

    setupCatalogTab();

    expect(await screen.findByText("MacBook Pro")).toBeInTheDocument();
    expect(screen.getByText("No products in cart")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));

    const cartSidebar = document.querySelector(".cart-sidebar");
    expect(cartSidebar).not.toBeNull();
    expect(
      within(cartSidebar).getByText("MacBook Pro"),
    ).toBeInTheDocument();
    expect(within(cartSidebar).getByText("Qty: 2")).toBeInTheDocument();
    expect(within(cartSidebar).getByText("Line total: 4998")).toBeInTheDocument();
    expect(within(cartSidebar).getByText("Total: 4998")).toBeInTheDocument();
    expect(getJsonLocalStorageItem("fleet_cart", [])).toEqual([
      {
        cartItemVariantId: "2",
        id: 1,
        name: "MacBook Pro",
        variant_id: 2,
        configuration: "16GB / 512GB",
        price: "2499",
        stock: 4,
        quantity: 2,
      },
    ]);
  });

  it("shows an empty state when no product is returned", async () => {
    getProductList.mockResolvedValue([]);

    setupCatalogTab();

    await waitFor(() => {
      expect(screen.getByText("No products found")).toBeInTheDocument();
    });
  });

  it("refreshes products when refreshVersion changes", async () => {
    getProductList.mockResolvedValue([]);

    const { rerender } = render(<CatalogTab refreshVersion={0} />);

    await waitFor(() => {
      expect(getProductList).toHaveBeenCalledTimes(1);
    });

    rerender(<CatalogTab refreshVersion={1} />);

    await waitFor(() => {
      expect(getProductList).toHaveBeenCalledTimes(2);
    });
  });

  it("loads products only once on mount when refreshVersion is already set", async () => {
    getProductList.mockResolvedValue([]);

    render(<CatalogTab refreshVersion={1} />);

    await waitFor(() => {
      expect(getProductList).toHaveBeenCalledTimes(1);
    });
  });

  it("loads the cart sidebar from localStorage", async () => {
    setJsonLocalStorageItem(
      "fleet_cart",
      [
        { id: 1, name: "MacBook Pro", variant_id: 2, configuration: "16GB", price: "2499" },
        { id: 1, name: "MacBook Pro", variant_id: 2, configuration: "16GB", price: "2499" },
        { id: 1, name: "MacBook Pro", variant_id: 3, configuration: "32GB", price: "2999" },
        { id: 2, name: "USB-C Dock", variant_id: 4, price: "199", quantity: 3 },
      ],
    );
    getProductList.mockResolvedValue([]);

    setupCatalogTab();

    expect(await screen.findByText("Configuration: 16GB")).toBeInTheDocument();
    expect(screen.getByText("USB-C Dock")).toBeInTheDocument();
    expect(screen.getByText("Qty: 2")).toBeInTheDocument();
    expect(screen.getByText("Configuration: 32GB")).toBeInTheDocument();
    expect(screen.getByText("Line total: 2999")).toBeInTheDocument();
    expect(screen.getByText("Qty: 3")).toBeInTheDocument();
    expect(screen.getByText("Total: 8594")).toBeInTheDocument();
  });

  it("updates quantities and removes lines from the cart", async () => {
    getProductList.mockResolvedValue([
      {
        id: 1,
        name: "MacBook Pro",
        variant_id: 2,
        configuration: "16GB / 512GB",
        price: "2499",
        stock: 4,
      },
    ]);

    setupCatalogTab();

    expect(await screen.findByText("MacBook Pro")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));

    const cartSidebar = document.querySelector(".cart-sidebar");
    expect(cartSidebar).not.toBeNull();

    fireEvent.click(within(cartSidebar).getByRole("button", { name: "+" }));
    expect(within(cartSidebar).getByText("Qty: 2")).toBeInTheDocument();
    expect(within(cartSidebar).getByText("Total: 4998")).toBeInTheDocument();

    fireEvent.click(within(cartSidebar).getByRole("button", { name: "-" }));
    expect(within(cartSidebar).getByText("Qty: 1")).toBeInTheDocument();
    expect(within(cartSidebar).getByText("Total: 2499")).toBeInTheDocument();

    fireEvent.click(
      within(cartSidebar).getByRole("button", { name: "Remove" }),
    );

    expect(within(cartSidebar).getByText("No products in cart")).toBeInTheDocument();
    expect(getJsonLocalStorageItem("fleet_cart", [])).toEqual([]);
  });

  it("does not allow adding more than available stock", async () => {
    getProductList.mockResolvedValue([
      {
        id: 1,
        name: "MacBook Pro",
        variant_id: 2,
        configuration: "16GB / 512GB",
        price: "2499",
        stock: 2,
      },
    ]);

    setupCatalogTab();

    const addButton = await screen.findByRole("button", { name: "Add to cart" });

    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(addButton).toBeDisabled();

    const cartSidebar = document.querySelector(".cart-sidebar");
    expect(cartSidebar).not.toBeNull();
    expect(within(cartSidebar).getByText("Qty: 2")).toBeInTheDocument();
    expect(
      within(cartSidebar).getByRole("button", { name: "+" }),
    ).toBeDisabled();
  });

  it("keeps different configurations as separate cart lines", async () => {
    getProductList.mockResolvedValue([
      {
        id: 1,
        name: "MacBook Pro",
        variant_id: 2,
        configuration: "16GB / 512GB",
        price: "2499",
        stock: 2,
      },
      {
        id: 1,
        name: "MacBook Pro",
        variant_id: 5,
        configuration: "32GB / 1TB",
        price: "3499",
        stock: 2,
      },
    ]);

    setupCatalogTab();

    expect(await screen.findAllByText("MacBook Pro")).toHaveLength(2);

    const addButtons = screen.getAllByRole("button", { name: "Add to cart" });
    fireEvent.click(addButtons[0]);
    fireEvent.click(addButtons[1]);

    const cartSidebar = document.querySelector(".cart-sidebar");
    expect(cartSidebar).not.toBeNull();
    expect(within(cartSidebar).getByText("Configuration: 16GB / 512GB")).toBeInTheDocument();
    expect(within(cartSidebar).getByText("Configuration: 32GB / 1TB")).toBeInTheDocument();
    expect(within(cartSidebar).getAllByText("Qty: 1")).toHaveLength(2);
    expect(within(cartSidebar).getByText("Total: 5998")).toBeInTheDocument();
  });
});
