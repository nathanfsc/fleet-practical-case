import { useState } from "react";
import "./CatalogList.css";
import CartSidebar from "./CartSidebar";
import { useCatalogCart } from "../hooks/useCatalogCart";
import { useCatalogProducts } from "../hooks/useCatalogProducts";
import { createOrder } from "../../orders/services/ordersService";

function CatalogTab({ cartTitle, onError, onStatusMessage, title }) {
  const [creatingOrder, setCreatingOrder] = useState(false);
  const { products, refreshProducts } = useCatalogProducts();
  const {
    cartItems,
    clearCart,
    getCartQuantity,
    handleAddToCart,
    handleRemoveCartItem,
    handleUpdateQuantity,
  } = useCatalogCart();

  async function handleCreateOrder() {
    if (!cartItems.length || creatingOrder) {
      return;
    }

    setCreatingOrder(true);

    try {
      await createOrder({
        items: cartItems.map((cartItem) => ({
          productVariantId: cartItem.variant_id,
          quantity: cartItem.quantity,
        })),
      });

      clearCart();
      await refreshProducts();
      onStatusMessage("Order created");
    } catch (error) {
      onError(error.message || "Failed to create order");
    } finally {
      setCreatingOrder(false);
    }
  }

  return (
    <div className="catalog-layout">
      <section className="panel catalog-main">
        {title ? <h2>{title}</h2> : null}
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Configuration</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={
                  product.variant_id ? String(product.variant_id) : product.id
                }
              >
                <td>{product.name}</td>
                <td>{product.configuration}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    disabled={
                      getCartQuantity(product) >= Number(product.stock || 0)
                    }
                  >
                    Add to cart
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td colSpan="5">No products found</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <CartSidebar
        cartItems={cartItems}
        creatingOrder={creatingOrder}
        onCreateOrder={handleCreateOrder}
        onRemoveCartItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateQuantity}
        title={cartTitle}
      />
    </div>
  );
}

export default CatalogTab;
