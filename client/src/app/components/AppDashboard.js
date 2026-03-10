import "./AppDashboard.css";

function AppDashboard({ dashboardState }) {
  return (
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
  );
}

export default AppDashboard;
