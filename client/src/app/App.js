import "./App.css";
import AppControls from "./components/AppControls";
import AppDashboard from "./components/AppDashboard";
import AppHeader from "./components/AppHeader";
import AppNotifications from "./components/AppNotifications";
import { useActiveTab } from "./hooks/useActiveTab";
import { useAppFeedback } from "./hooks/useAppFeedback";
import { useFleetDashboard } from "./hooks/useFleetDashboard";
import EmployeesTab from "../features/employees/components/EmployeesTab";
import DevicesTab from "../features/devices/components/DevicesTab";
import { EMPLOYEES_TAB_NAME } from "../features/employees/Employees.constant";
import { DEVICES_TAB_NAME } from "../features/devices/Devices.constant";
import CatalogTab from "../features/catalog/components/CatalogTab";
import { CATALOG_TAB_NAME } from "../features/catalog/Catalog.constant";

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
    refreshEmployees,
    refreshDevices,
    refreshAll,
  } = useFleetDashboard({
    onError: appendError,
    onRefreshStart: clearErrors,
  });

  return (
    <div className="app-page">
      <AppHeader />
      <AppDashboard dashboardState={dashboardState} />
      <AppControls
        activeTab={activeTab}
        onRefresh={refreshAll}
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
            employees={employees}
            loadingEmployees={loadingEmployees}
            refreshEmployees={refreshEmployees}
            refreshDevices={refreshDevices}
            onStatusMessage={setStatusMessage}
            onError={appendError}
          />
        ) : null}

        {activeTab === DEVICES_TAB_NAME ? (
          <DevicesTab
            employees={employees}
            devices={devices}
            loadingDevices={loadingDevices}
            refreshDevices={refreshDevices}
            refreshEmployees={refreshEmployees}
            onStatusMessage={setStatusMessage}
            onError={appendError}
          />
        ) : null}

        {activeTab === CATALOG_TAB_NAME ? <CatalogTab /> : null}
      </main>
    </div>
  );
}

export default App;
