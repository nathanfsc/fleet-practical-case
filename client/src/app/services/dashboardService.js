const EMPTY_DASHBOARD_COUNTS = {
  totalEmployees: 0,
  totalDevices: 0,
  ownedDevices: 0,
};

export async function getDashboardCounts() {
  const response = await fetch("/api/shared/countFacets");
  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Could not get dashboard counts with error: ${json.message}`);
  }

  return {
    totalEmployees: json?.totalEmployees || 0,
    totalDevices: json?.totalDevices || 0,
    ownedDevices: json?.ownedDevices || 0,
  };
}

export { EMPTY_DASHBOARD_COUNTS };
