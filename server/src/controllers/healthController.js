class HealthController {
  constructor() {
    this.getHealth = this.getHealth.bind(this);
  }

  getHealth(req, res) {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  }
}

module.exports = { HealthController };
