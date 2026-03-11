import { useEffect, useState } from "react";
import { getProductList } from "../services/catalogService";

export function useCatalogData({
  refreshTick = 0,
  onError,
  onRefreshStart,
  onRefreshed,
}) {
  const [products, setProducts] = useState([]);

  async function refreshProducts({ clearErrors = true } = {}) {
    if (clearErrors) {
      onRefreshStart();
    }

    try {
      const nextProducts = await getProductList();
      setProducts(nextProducts);
      onRefreshed();
    } catch (error) {
      onError(error.message);
    }
  }

  useEffect(() => {
    refreshProducts();
  }, [refreshTick]);

  return {
    products,
    refreshProducts,
  };
}
