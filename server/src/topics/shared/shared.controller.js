const { sendErrorResponse } = require("../../utils/httpError");
const { SharedService } = require("./shared.service");

class SharedController {
  constructor({ sharedService = new SharedService() } = {}) {
    this.sharedService = sharedService;
    this.countFacets = this.countFacets.bind(this);
  }

  async countFacets(req, res) {
    try {
      const counts = await this.sharedService.countFacets();
      res.json(counts);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to fetch shared counts");
    }
  }
}

module.exports = { SharedController };
