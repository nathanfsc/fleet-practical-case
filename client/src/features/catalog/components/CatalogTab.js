import { useEffect, useState } from "react";
import { getProductList } from "../services/catalogService";

function CatalogTab({}) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const products = await getProductList();
      setProducts(products);
    }
    fetchProducts();
  }, []);

  return (
    <div>
      CatalogTab
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default CatalogTab;
