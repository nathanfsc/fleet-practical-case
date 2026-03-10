export async function getProductList() {
  const response = await fetch("/api/products", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const products = await response.json();
  console.log("COUCOU -> ", response);
  return products;
}
