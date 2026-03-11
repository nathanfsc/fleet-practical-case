const { HealthService } = require("./health.service");

class HealthController {
  constructor({ healthService = new HealthService() } = {}) {
    this.healthService = healthService;
    this.getHealth = this.getHealth.bind(this);
  }

  getHealth(req, res) {
    res.json(this.healthService.getHealth());
  }
}

module.exports = { HealthController };
