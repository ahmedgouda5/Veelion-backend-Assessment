const activitiesService = require("../activities/activities.service");
const tasksService = require("../tasks/tasks.service");

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

function buildSummary(tasks, activities) {
  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  const totalActivitySeconds = activities.reduce((sum, activity) => {
    return sum + activity.value;
  }, 0);

  return {
    totalTasks: tasks.length,
    completedTasks: completed.length,
    pendingTasks: pending.length,
    totalActivityTime: formatDuration(totalActivitySeconds),
  };
}

function getReports() {
  return async (req, res) => {
    try {
      const tasks = await tasksService.getAllTasks();
      const activities = await activitiesService.getAllActivities();
      const summary = buildSummary(tasks, activities);

      res.json({ data: summary });
    } catch (err) {
      res.status(500).json({ error: { message: "Internal server error" } });
    }
  };
}

module.exports = {
  getReports,
};
