const reportsService = require("../services/reports.service");

function getReports() {
  return (req, res) => {
    const summary = reportsService.getReports();
    return res.json({ data: summary });
  };
}

module.exports = {
  getReports,
};
