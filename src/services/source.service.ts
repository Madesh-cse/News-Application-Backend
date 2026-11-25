
import SourceModel from "../models/source.model.js";

class SourceService {
  async getAllSources() {
    return SourceModel.find({ isActive: true })
      .select("name websiteUrl description logo")
      .sort({ name: 1 })
      .lean();
  }
}

const sourceService = new SourceService();

export default sourceService;
