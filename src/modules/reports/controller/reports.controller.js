const reportsService = require("../services/reports.service");

async function getReports(req, res) {
  const summary = await reportsService.getReports();
  return res.json(summary);
}

module.exports = {
  getReports,
};
