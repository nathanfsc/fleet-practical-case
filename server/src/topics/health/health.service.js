class HealthService {
  getHealth() {
    return { ok: true, timestamp: new Date().toISOString() };
  }
}

module.exports = { HealthService };
