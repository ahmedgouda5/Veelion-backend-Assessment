function buildSummary(tasks, activities) {
  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return {
    total: tasks.length,
    byStatus: {
      todo: pending.length,
      done: completed.length,
      in_progress: completed.length,
    },
    recentActivityCount: activities.length,
  };
}

module.exports = {
  buildSummary,
};
