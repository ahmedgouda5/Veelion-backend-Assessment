const path = require('node:path');

const { createId } = require('../../../utils/id');
const { readJsonArray, updateJsonArray } = require('../../../utils/jsonStore');
const HttpError = require('../../../utils/httpError');

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

function buildTaskRecord(payload) {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title: payload.title,
    completed: payload.completed ?? false,
    createdAt: now,
    updatedAt: now,
  };
}

async function getAllTasks() {
  return readJsonArray(TASKS_FILE_PATH);
}

async function getTaskById(taskId) {
  const tasks = await readJsonArray(TASKS_FILE_PATH);
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    throw new HttpError(404, 'Task not found.');
  }

  return task;
}

async function createTask(payload) {
  let createdTask = null;

  await updateJsonArray(TASKS_FILE_PATH, async (tasks) => {
    createdTask = buildTaskRecord(payload);
    tasks.push(createdTask);
    return createdTask;
  });

  return createdTask;
}

async function updateTask(taskId, updates) {
  let updatedTask = null;

  await updateJsonArray(TASKS_FILE_PATH, async (tasks) => {
    const taskIndex = tasks.findIndex((item) => item.id === taskId);

    if (taskIndex === -1) {
      throw new HttpError(404, 'Task not found.');
    }

    const existingTask = tasks[taskIndex];

    updatedTask = {
      ...existingTask,
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.completed !== undefined && { completed: updates.completed }),
      updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    return updatedTask;
  });

  return updatedTask;
}

async function deleteTask(taskId) {
  let removedTask = null;

  await updateJsonArray(TASKS_FILE_PATH, async (tasks) => {
    const taskIndex = tasks.findIndex((item) => item.id === taskId);

    if (taskIndex === -1) {
      throw new HttpError(404, 'Task not found.');
    }

    [removedTask] = tasks.splice(taskIndex, 1);
    return removedTask;
  });

  return removedTask;
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

