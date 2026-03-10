import { useEffect, useState } from "react";
import "./App.css";
import EmployeesTab from "../components/EmployeesTab/EmployeesTab";
import DevicesTab from "../components/DevicesTab/DevicesTab";

function App() {
  const [activeTab, setActiveTab] = useState("employees");
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

    if (hash === "employees" || hash === "devices") {
      setActiveTab(hash);
    } else if (savedTab === "employees" || savedTab === "devices") {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("fleet_active_tab", activeTab);
    window.location.hash = activeTab;
  }, [activeTab]);

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
      const response = await fetch("/api/employees");
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || "Could not load employees");
      }
      setEmployees(Array.isArray(json) ? json : []);
      setLastRefreshAt(new Date().toISOString());
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        `Employees fetch failed: ${error.message}`,
      ]);
    } finally {
      setLoadingEmployees(false);
    }
  }

  async function fetchDevices() {
    setLoadingDevices(true);
    try {
      const response = await fetch("/api/devices");
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || "Could not load devices");
      }
      setDevices(Array.isArray(json) ? json : []);
      setLastRefreshAt(new Date().toISOString());
    } catch (error) {
      setErrors((prev) => [...prev, `Devices fetch failed: ${error.message}`]);
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
            activeTab === "employees" ? "tab-button active" : "tab-button"
          }
          onClick={() => setActiveTab("employees")}
          type="button"
        >
          Employees
        </button>
        <button
          className={
            activeTab === "devices" ? "tab-button active" : "tab-button"
          }
          onClick={() => setActiveTab("devices")}
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
        {activeTab === "employees" ? (
          <EmployeesTab
            employees={employees}
            loadingEmployees={loadingEmployees}
            refreshEmployees={fetchEmployees}
            refreshDevices={fetchDevices}
            onStatusMessage={setStatusMessage}
            onError={appendError}
          />
        ) : null}

        {activeTab === "devices" ? (
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
