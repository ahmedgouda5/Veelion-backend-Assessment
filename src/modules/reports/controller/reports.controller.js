const reportsService = require("../services/reports.service");

async function getReports(req, res) {
  const summary = await reportsService.getReports();
  return res.json({ data: summary });
}

module.exports = {
  getReports,
};
