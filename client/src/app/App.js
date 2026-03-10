import { useEffect, useState } from "react";
import "./App.css";
import EmployeesTab from "../features/employees/components/EmployeesTab";
import DevicesTab from "../features/devices/components/DevicesTab";
import { getDevices } from "../features/devices/services/Devices.service";
import { getEmployees } from "../features/employees/services/Employees.service";
import { EMPLOYEES_TAB_NAME } from "../features/employees/Employees.constant";
import { DEVICES_TAB_NAME } from "../features/devices/Devices.constant";

function App() {
  const [activeTab, setActiveTab] = useState(EMPLOYEES_TAB_NAME);
  const [employees, setEmployees] = useState([]);
  const [devices, setDevices] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [dashboardState, setDashboardState] = useState({
    totalEmployees: 0,
    totalDevices: 0,
    assignedDevices: 0,
  });
  const [lastRefreshAt, setLastRefreshAt] = useState("");

  useEffect(() => {
    const savedTab = window.localStorage.getItem("fleet_active_tab");
    const hash = window.location.hash.replace("#", "");

    setActiveTab(hash || savedTab || EMPLOYEES_TAB_NAME);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("fleet_active_tab", activeTab);
    window.location.hash = activeTab;
  }, [activeTab]);

  //todo: ajouter une route de count si possible pour éviter de charger tous les devices/employees juste pour le count du dashboard
  useEffect(() => {
    fetchEmployees();
    fetchDevices();
  }, []);

  useEffect(() => {
    const assigned = devices.filter((device) => device.owner_id).length;
    setDashboardState({
      totalEmployees: employees.length,
      totalDevices: devices.length,
      assignedDevices: assigned,
    });
  }, [employees, devices]);

  useEffect(() => {
    if (!statusMessage) {
      return undefined;
    }
    const timer = window.setTimeout(() => setStatusMessage(""), 2500);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  async function fetchEmployees() {
    setLoadingEmployees(true);
    setErrors([]);
    try {
      const nextEmployees = await getEmployees();
      setEmployees(nextEmployees);
      setLastRefreshAt(new Date().toISOString());
    } catch (error) {
      appendError(error.message);
    } finally {
      setLoadingEmployees(false);
    }
  }

  async function fetchDevices() {
    setLoadingDevices(true);
    try {
      const nextDevices = await getDevices();
      setDevices(nextDevices);
      setLastRefreshAt(new Date().toISOString());
    } catch (error) {
      appendError(error.message);
    } finally {
      setLoadingDevices(false);
    }
  }

  function clearErrorStack() {
    setErrors([]);
  }

  function appendError(message) {
    setErrors((prev) => [...prev, message]);
  }

  return (
    <div className="app-page">
      <header className="app-header">
        <h1>Fleet Device Manager</h1>
        <p>Interview boilerplate for employee and device management.</p>
      </header>

      <section className="app-kpis">
        <article>
          <h3>Total employees</h3>
          <strong>{dashboardState.totalEmployees}</strong>
        </article>
        <article>
          <h3>Total devices</h3>
          <strong>{dashboardState.totalDevices}</strong>
        </article>
        <article>
          <h3>Assigned devices</h3>
          <strong>{dashboardState.assignedDevices}</strong>
        </article>
      </section>

      <div className="app-controls">
        <button
          className={
            activeTab === EMPLOYEES_TAB_NAME
              ? "tab-button active"
              : "tab-button"
          }
          onClick={() => setActiveTab(EMPLOYEES_TAB_NAME)}
          type="button"
        >
          Employees
        </button>
        <button
          className={
            activeTab === DEVICES_TAB_NAME ? "tab-button active" : "tab-button"
          }
          onClick={() => setActiveTab(DEVICES_TAB_NAME)}
          type="button"
        >
          Devices
        </button>
        <button
          type="button"
          onClick={() => {
            fetchEmployees();
            fetchDevices();
          }}
        >
          Manual refresh
        </button>
      </div>

      {statusMessage ? <p className="status success">{statusMessage}</p> : null}
      {lastRefreshAt ? (
        <p className="timestamp">Last refresh: {lastRefreshAt}</p>
      ) : null}

      {errors.length > 0 ? (
        <div className="status error">
          <div className="error-header">
            <strong>Errors ({errors.length})</strong>
            <button type="button" onClick={clearErrorStack}>
              Clear
            </button>
          </div>
          <ul>
            {errors.map((error, index) => (
              <li key={`${error}-${index}`}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <main className="app-main">
        {activeTab === EMPLOYEES_TAB_NAME ? (
          <EmployeesTab
            employees={employees}
            loadingEmployees={loadingEmployees}
            refreshEmployees={fetchEmployees}
            refreshDevices={fetchDevices}
            onStatusMessage={setStatusMessage}
            onError={appendError}
          />
        ) : null}

        {activeTab === DEVICES_TAB_NAME ? (
          <DevicesTab
            employees={employees}
            devices={devices}
            loadingDevices={loadingDevices}
            refreshDevices={fetchDevices}
            refreshEmployees={fetchEmployees}
            onStatusMessage={setStatusMessage}
            onError={appendError}
          />
        ) : null}
      </main>
    </div>
  );
}

export default App;
