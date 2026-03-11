import "./AppDashboard.css";

function AppDashboard({
  dashboardState = { totalEmployees: 0, totalDevices: 0, ownedDevices: 0 },
}) {
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
        <h3>Owned devices</h3>
        <strong>{dashboardState.ownedDevices}</strong>
      </article>
    </section>
  );
}

export default AppDashboard;
