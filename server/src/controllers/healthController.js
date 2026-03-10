function createHealthController() {
  function getHealth(req, res) {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  }

  return { getHealth };
}

module.exports = { createHealthController };
