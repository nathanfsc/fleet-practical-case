import { useState } from "react";
import "./App.css";
import AppControls from "./components/AppControls";
import AppDashboard from "./components/AppDashboard";
import AppHeader from "./components/AppHeader";
import AppNotifications from "./components/AppNotifications";
import { useActiveTab } from "./hooks/useActiveTab";
import { useAppFeedback } from "./hooks/useAppFeedback";
import { useDashboardData } from "./hooks/useDashboardData";
import EmployeesTab from "../features/employees/components/EmployeeList";
import DevicesTab from "../features/devices/components/DeviceList";
import { EMPLOYEES_TAB_NAME } from "../features/employees/Employees.constant";
import { DEVICES_TAB_NAME } from "../features/devices/Devices.constant";
import CatalogTab from "../features/catalog/components/CatalogList";
import { CATALOG_TAB_NAME } from "../features/catalog/Catalog.constant";
import OrdersTab from "../features/orders/components/OrdersTab";
import { ORDERS_TAB_NAME } from "../features/orders/Orders.constant";

function App() {
  const { activeTab, setActiveTab } = useActiveTab();
  const [refreshTick, setRefreshTick] = useState(0);
  const [lastRefreshAt, setLastRefreshAt] = useState("");
  const { statusMessage, setStatusMessage, errors, clearErrors, appendError } =
    useAppFeedback();
  const { dashboardState, refreshDashboardCounts } = useDashboardData({
    refreshTick,
    onError: appendError,
    onRefreshStart: clearErrors,
    onRefreshed: () => setLastRefreshAt(new Date().toISOString()),
  });

  function handleManualRefresh() {
    setRefreshTick((currentTick) => currentTick + 1);
  }

  return (
    <div className="app-page">
      <AppHeader />
      <AppDashboard dashboardState={dashboardState} />
      <AppControls
        activeTab={activeTab}
        onRefresh={handleManualRefresh}
        onTabChange={setActiveTab}
      />
      <AppNotifications
        errors={errors}
        lastRefreshAt={lastRefreshAt}
        onClearErrors={clearErrors}
        statusMessage={statusMessage}
      />

      <main className="app-main">
        {activeTab === EMPLOYEES_TAB_NAME ? (
          <EmployeesTab
            createTitle="Create employee"
            editTitle="Edit employee"
            listTitle="Employee list"
            onRefreshStart={clearErrors}
            onRefreshed={() => setLastRefreshAt(new Date().toISOString())}
            refreshDashboardCounts={refreshDashboardCounts}
            refreshTick={refreshTick}
            onStatusMessage={setStatusMessage}
            onError={appendError}
          />
        ) : null}

        {activeTab === DEVICES_TAB_NAME ? (
          <DevicesTab
            createTitle="Create device"
            editTitle="Edit device"
            listTitle="Device list"
            onRefreshStart={clearErrors}
            onRefreshed={() => setLastRefreshAt(new Date().toISOString())}
            refreshDashboardCounts={refreshDashboardCounts}
            refreshTick={refreshTick}
            onStatusMessage={setStatusMessage}
            onError={appendError}
          />
        ) : null}

        {activeTab === CATALOG_TAB_NAME ? (
          <CatalogTab
            cartTitle="Cart"
            onError={appendError}
            onRefreshStart={clearErrors}
            onRefreshed={() => setLastRefreshAt(new Date().toISOString())}
            onStatusMessage={setStatusMessage}
            refreshTick={refreshTick}
            title="Catalog"
          />
        ) : null}

        {activeTab === ORDERS_TAB_NAME ? (
          <OrdersTab
            onError={appendError}
            onRefreshStart={clearErrors}
            onRefreshed={() => setLastRefreshAt(new Date().toISOString())}
            refreshTick={refreshTick}
            title="Orders"
          />
        ) : null}
      </main>
    </div>
  );
}

export default App;
