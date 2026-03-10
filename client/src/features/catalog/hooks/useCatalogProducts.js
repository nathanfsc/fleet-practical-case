import { useEffect, useState } from "react";
import { getProductList } from "../services/catalogService";

export function useCatalogProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const nextProducts = await getProductList();
      setProducts(nextProducts);
    }

    fetchProducts();
  }, []);

  return {
    products,
  };
}
