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
    <section className="panel">
      <h2>Catalog</h2>
      {/* <h3>Product list {loadingProducts ? "(loading...)" : ""}</h3> */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Configuration</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.configuration}</td>
              <td>{product.price}</td>
              <td>{product.stock}</td>
            </tr>
          ))}
          {products.length === 0 ? (
            <tr>
              <td colSpan="4">No products found</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}

export default CatalogTab;
