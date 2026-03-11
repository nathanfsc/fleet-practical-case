import { useEffect, useState } from "react";
import { getOrders } from "../services/ordersService";

export function useOrdersData({
  refreshTick = 0,
  onError,
  onRefreshStart,
  onRefreshed,
}) {
  const [orders, setOrders] = useState([]);

  async function refreshOrders({ clearErrors = true } = {}) {
    if (clearErrors) {
      onRefreshStart();
    }

    try {
      const nextOrders = await getOrders();
      setOrders(nextOrders);
      onRefreshed();
    } catch (error) {
      onError(error.message);
    }
  }

  useEffect(() => {
    refreshOrders();
  }, [refreshTick]);

  return {
    orders,
    refreshOrders,
  };
}
