import { useEffect, useState } from "react";
import { getProductList } from "../services/catalogService";

export function useCatalogProducts({ refreshVersion = 0 } = {}) {
  const [products, setProducts] = useState([]);

  async function refreshProducts() {
    const nextProducts = await getProductList();
    setProducts(nextProducts);
  }

  useEffect(() => {
    refreshProducts();
  }, [refreshVersion]);

  return {
    products,
    refreshProducts,
  };
}
