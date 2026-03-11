import { useEffect, useState } from "react";
import {
  EMPTY_DASHBOARD_COUNTS,
  getDashboardCounts,
} from "../services/dashboardService";

export function useDashboardData({
  refreshTick = 0,
  onError,
  onRefreshStart,
  onRefreshed,
}) {
  const [dashboardState, setDashboardState] = useState(EMPTY_DASHBOARD_COUNTS);

  async function refreshDashboardCounts({ clearErrors = true } = {}) {
    if (clearErrors) {
      onRefreshStart();
    }

    try {
      const nextDashboardCounts = await getDashboardCounts();
      setDashboardState(nextDashboardCounts);
      onRefreshed();
    } catch (error) {
      onError(error.message);
    }
  }

  useEffect(() => {
    refreshDashboardCounts();
  }, [refreshTick]);

  return {
    dashboardState,
    refreshDashboardCounts,
  };
}
