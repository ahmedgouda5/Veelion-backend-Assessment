function buildSummary(tasks, activities) {
  //this project not supported the in-progress
  const in_progress = 0;
  const todo = tasks.filter((t) => t.completed === false);
  const done = tasks.filter((t) => t.completed === true);

  return {
    total: tasks.length,
    byStatus: {
      todo: todo.length,
      "in-progress": in_progress,
      done: done.length,
    },
    recentActivityCount: activities.length,
  };
}

module.exports = {
  buildSummary,
};
