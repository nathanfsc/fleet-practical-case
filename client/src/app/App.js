import "./App.css";
import AppControls from "./components/AppControls";
import AppDashboard from "./components/AppDashboard";
import AppHeader from "./components/AppHeader";
import AppNotifications from "./components/AppNotifications";
import { useActiveTab } from "./hooks/useActiveTab";
import { useAppFeedback } from "./hooks/useAppFeedback";
import { useFleetDashboard } from "./hooks/useFleetDashboard";
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
  const { statusMessage, setStatusMessage, errors, clearErrors, appendError } =
    useAppFeedback();
  const {
    employees,
    devices,
    loadingEmployees,
    loadingDevices,
    dashboardState,
    lastRefreshAt,
    refreshDashboardCounts,
    refreshEmployees,
    refreshDevices,
    upsertDeviceInState,
    removeDeviceFromState,
    refreshActiveTab,
  } = useFleetDashboard({
    activeTab,
    onError: appendError,
    onRefreshStart: clearErrors,
  });

  return (
    <div className="app-page">
      <AppHeader />
      <AppDashboard dashboardState={dashboardState} />
      <AppControls
        activeTab={activeTab}
        onRefresh={() => refreshActiveTab()}
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
            employees={employees}
            listTitle="Employee list"
            loadingEmployees={loadingEmployees}
            refreshEmployees={refreshEmployees}
            refreshDevices={refreshDevices}
            refreshDashboardCounts={refreshDashboardCounts}
            onStatusMessage={setStatusMessage}
            onError={appendError}
          />
        ) : null}

        {activeTab === DEVICES_TAB_NAME ? (
          <DevicesTab
            createTitle="Create device"
            employees={employees}
            devices={devices}
            editTitle="Edit device"
            listTitle="Device list"
            loadingDevices={loadingDevices}
            onRemoveDeviceFromState={removeDeviceFromState}
            refreshDashboardCounts={refreshDashboardCounts}
            onUpsertDeviceInState={upsertDeviceInState}
            onStatusMessage={setStatusMessage}
            onError={appendError}
          />
        ) : null}

        {activeTab === CATALOG_TAB_NAME ? (
          <CatalogTab
            cartTitle="Cart"
            onError={appendError}
            onStatusMessage={setStatusMessage}
            title="Catalog"
          />
        ) : null}

        {activeTab === ORDERS_TAB_NAME ? (
          <OrdersTab title="Orders" />
        ) : null}
      </main>
    </div>
  );
}

export default App;
