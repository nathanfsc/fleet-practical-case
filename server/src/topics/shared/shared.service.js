const { SharedRepository } = require("./shared.repository");

class SharedService {
  constructor({ sharedRepository = new SharedRepository() } = {}) {
    this.sharedRepository = sharedRepository;
  }

  async countFacets() {
    return this.sharedRepository.countFacets();
  }
}

module.exports = { SharedService };
