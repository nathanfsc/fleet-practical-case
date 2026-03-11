import { useEffect, useState } from "react";

const CART_STORAGE_KEY = "fleet_cart";

function getStoredCartItems() {
  const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!savedCart) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    const cartItems = [];

    parsedCart.forEach((item) => {
      const cartItemVariantId = item.variant_id
        ? String(item.variant_id)
        : null;
      const rawQuantity = Number(item.quantity) || 1;

      if (!cartItemVariantId) {
        return;
      }

      const existingCartItem = cartItems.find(
        (cartItem) => cartItem.cartItemVariantId === cartItemVariantId,
      );

      if (!existingCartItem) {
        cartItems.push({
          ...item,
          cartItemVariantId,
          quantity: rawQuantity,
        });
        return;
      }

      existingCartItem.quantity += rawQuantity;
    });

    return cartItems;
  } catch {
    return [];
  }
}

export function useCatalogCart() {
  const [cartItems, setCartItems] = useState(getStoredCartItems);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  function handleAddToCart(product) {
    setCartItems((currentCartItems) => {
      const productCartItemVariantId = product.variant_id
        ? String(product.variant_id)
        : null;

      if (!productCartItemVariantId) {
        return currentCartItems;
      }

      const existingCartItem = currentCartItems.find(
        (cartItem) => cartItem.cartItemVariantId === productCartItemVariantId,
      );

      if (!existingCartItem) {
        return [
          ...currentCartItems,
          {
            ...product,
            cartItemVariantId: productCartItemVariantId,
            quantity: 1,
          },
        ];
      }

      return currentCartItems.map((cartItem) =>
        cartItem.cartItemVariantId === productCartItemVariantId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem,
      );
    });
  }

  function handleUpdateQuantity(cartItemVariantId, nextQuantity) {
    if (nextQuantity < 1) {
      return;
    }

    setCartItems((currentCartItems) => {
      const cartItemToUpdate = currentCartItems.find(
        (cartItem) => cartItem.cartItemVariantId === cartItemVariantId,
      );

      if (!cartItemToUpdate) {
        return currentCartItems;
      }

      const stock = Number(cartItemToUpdate.stock || 0);
      const cappedQuantity = nextQuantity > stock ? stock : nextQuantity;

      return currentCartItems.map((cartItem) =>
        cartItem.cartItemVariantId === cartItemVariantId
          ? { ...cartItem, quantity: cappedQuantity }
          : cartItem,
      );
    });
  }

  function handleRemoveCartItem(cartItemVariantId) {
    setCartItems((currentCartItems) =>
      currentCartItems.filter(
        (cartItem) => cartItem.cartItemVariantId !== cartItemVariantId,
      ),
    );
  }

  function getCartQuantity(product) {
    const productCartItemVariantId = product.variant_id
      ? String(product.variant_id)
      : null;

    if (!productCartItemVariantId) {
      return 0;
    }

    const existingCartItem = cartItems.find(
      (cartItem) => cartItem.cartItemVariantId === productCartItemVariantId,
    );

    return existingCartItem ? existingCartItem.quantity : 0;
  }

  return {
    clearCart: () => setCartItems([]),
    cartItems,
    getCartQuantity,
    handleAddToCart,
    handleRemoveCartItem,
    handleUpdateQuantity,
  };
}
