export async function createOrder(payload) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to create order with message: ${json.message}`);
  }

  return json;
}

export async function getOrders() {
  const response = await fetch("/api/orders", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to fetch orders with message: ${json.message}`);
  }

  return json;
}
