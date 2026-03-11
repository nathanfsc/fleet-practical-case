function getLineTotal(cartItem) {
  return (Number(cartItem.price) || 0) * cartItem.quantity;
}

function CartSidebar({
  cartItems,
  creatingOrder,
  onCreateOrder,
  onRemoveCartItem,
  onUpdateQuantity,
  title,
}) {
  let cartTotal = 0;

  cartItems.forEach((cartItem) => {
    cartTotal += getLineTotal(cartItem);
  });

  return (
    <aside className="panel cart-sidebar">
      {title ? <h2>{title}</h2> : null}
      {cartItems.length === 0 ? (
        <p>No products in cart</p>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((cartItem) => (
              <li key={cartItem.cartItemVariantId} className="cart-line">
                <div className="cart-line-header">
                  <strong>{cartItem.name}</strong>
                  <button
                    type="button"
                    onClick={() =>
                      onRemoveCartItem(cartItem.cartItemVariantId)
                    }
                  >
                    Remove
                  </button>
                </div>
                {cartItem.configuration ? (
                  <p className="cart-line-text">Configuration: {cartItem.configuration}</p>
                ) : null}
                <p className="cart-line-text">Unit price: {cartItem.price}</p>
                <div className="cart-quantity-controls">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateQuantity(
                        cartItem.cartItemVariantId,
                        cartItem.quantity - 1,
                      )
                    }
                  >
                    -
                  </button>
                  <span>Qty: {cartItem.quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateQuantity(
                        cartItem.cartItemVariantId,
                        cartItem.quantity + 1,
                      )
                    }
                    disabled={cartItem.quantity >= Number(cartItem.stock || 0)}
                  >
                    +
                  </button>
                </div>
                <p className="cart-line-text">Line total: {getLineTotal(cartItem)}</p>
              </li>
            ))}
          </ul>
          <p className="cart-total">
            <strong>Total: {cartTotal}</strong>
          </p>
          <button type="button" onClick={onCreateOrder} disabled={creatingOrder}>
            {creatingOrder ? "Creating order..." : "Create order"}
          </button>
        </>
      )}
    </aside>
  );
}

export default CartSidebar;
