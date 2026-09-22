const activitiesService = require("../../activity/services/activity.service");
const tasksService = require("../../tasks/services/tasks.service");
const { buildSummary } = require("../utils/SummaryAgreegation");

async function getReports() {
  const tasks = await tasksService.getAllTasks();
  const activities = await activitiesService.getAllActivity();
  return buildSummary(tasks, activities);
}

module.exports = {
  getReports,
};
