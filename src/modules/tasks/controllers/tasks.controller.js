const tasksService = require('../services/tasks.service');
const { validateCreateTask, validateUpdateTask } = require('../utils/taskValidator');

async function listTasks(req, res) {
  const tasks = await tasksService.getAllTasks();
  res.status(200).json({ data: tasks });
}

async function getTask(req, res) {
  const task = await tasksService.getTaskById(req.params.id);
  res.status(200).json({ data: task });
}

async function createTask(req, res) {
  const validatedPayload = validateCreateTask(req.body);
  const task = await tasksService.createTask(validatedPayload);
  res.status(201).json({ data: task });
}

async function patchTask(req, res) {
  const validatedUpdates = validateUpdateTask(req.body);
  const task = await tasksService.updateTask(req.params.id, validatedUpdates);
  res.status(200).json({ data: task });
}

async function removeTask(req, res) {
  await tasksService.deleteTask(req.params.id);
  res.status(204).send();
}

module.exports = {
  listTasks,
  getTask,
  createTask,
  patchTask,
  removeTask,
};

