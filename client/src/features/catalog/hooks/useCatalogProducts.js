import { useEffect, useState } from "react";
import { getProductList } from "../services/catalogService";

export function useCatalogProducts() {
  const [products, setProducts] = useState([]);

  async function refreshProducts() {
    const nextProducts = await getProductList();
    setProducts(nextProducts);
  }

  useEffect(() => {
    refreshProducts();
  }, []);

  return {
    products,
    refreshProducts,
  };
}
