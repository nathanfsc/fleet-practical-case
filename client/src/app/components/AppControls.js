import { DEVICES_TAB_NAME } from "../../features/devices/Devices.constant";
import { EMPLOYEES_TAB_NAME } from "../../features/employees/Employees.constant";

function AppControls({ activeTab, onRefresh, onTabChange }) {
  return (
    <div className="app-controls">
      <button
        className={
          activeTab === EMPLOYEES_TAB_NAME ? "tab-button active" : "tab-button"
        }
        onClick={() => onTabChange(EMPLOYEES_TAB_NAME)}
        type="button"
      >
        Employees
      </button>
      <button
        className={
          activeTab === DEVICES_TAB_NAME ? "tab-button active" : "tab-button"
        }
        onClick={() => onTabChange(DEVICES_TAB_NAME)}
        type="button"
      >
        Devices
      </button>
      <button type="button" onClick={onRefresh}>
        Manual refresh
      </button>
    </div>
  );
}

export default AppControls;
