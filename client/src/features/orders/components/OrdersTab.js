import { useOrdersData } from "../hooks/useOrdersData";

function OrdersTab({
  onError,
  onRefreshStart,
  onRefreshed,
  refreshTick,
  title,
}) {
  const { orders } = useOrdersData({
    refreshTick,
    onError,
    onRefreshStart,
    onRefreshed,
  });

  return (
    <section className="panel">
      {title ? <h2>{title}</h2> : null}
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Created at</th>
            <th>Items</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.createdAt}</td>
              <td>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.productName} - {item.configuration} x{item.quantity}
                    </li>
                  ))}
                </ul>
              </td>
              <td>{order.totalAmount}</td>
            </tr>
          ))}
          {orders.length === 0 ? (
            <tr>
              <td colSpan="4">No orders found</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}

export default OrdersTab;
