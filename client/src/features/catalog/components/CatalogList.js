import "./CatalogList.css";
import CartSidebar from "./CartSidebar";
import { useCatalogCart } from "../hooks/useCatalogCart";
import { useCatalogProducts } from "../hooks/useCatalogProducts";

function CatalogTab({ title, cartTitle }) {
  const { products } = useCatalogProducts();
  const {
    cartItems,
    getCartQuantity,
    handleAddToCart,
    handleRemoveCartItem,
    handleUpdateQuantity,
  } = useCatalogCart();

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
        onRemoveCartItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateQuantity}
        title={cartTitle}
      />
    </div>
  );
}

export default CatalogTab;
