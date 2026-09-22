const fs = require('node:fs/promises');
const HttpError = require('./httpError');

const cacheMap = new Map();
const lockMap = new Map();

function withFileLock(filePath, fn) {
  const previousLock = lockMap.get(filePath) || Promise.resolve();
  const currentLock = previousLock
    .then(() => fn())
    .catch((err) => {
      throw err;
    });

  lockMap.set(
    filePath,
    currentLock.catch(() => {})
  );

  return currentLock;
}

async function readJsonArray(filePath) {
  if (cacheMap.has(filePath)) {
    return [...cacheMap.get(filePath)];
  }

  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    if (!raw.trim()) {
      cacheMap.set(filePath, []);
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [];
      cacheMap.set(filePath, arr);
      return [...arr];
    } catch (parseErr) {
      throw new HttpError(500, `Storage file is corrupted or contains invalid JSON.`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(filePath, '[]\n', 'utf-8');
      cacheMap.set(filePath, []);
      return [];
    }

    throw error;
  }
}

async function writeJsonArray(filePath, data) {
  return withFileLock(filePath, async () => {
    const arr = Array.isArray(data) ? data : [];
    await fs.writeFile(filePath, `${JSON.stringify(arr, null, 2)}\n`, 'utf-8');
    cacheMap.set(filePath, [...arr]);
  });
}

async function updateJsonArray(filePath, mutatorFn) {
  return withFileLock(filePath, async () => {
    const list = await readJsonArray(filePath);
    const result = await mutatorFn(list);
    await fs.writeFile(filePath, `${JSON.stringify(list, null, 2)}\n`, 'utf-8');
    cacheMap.set(filePath, [...list]);
    return result;
  });
}

function clearCache(filePath) {
  if (filePath) {
    cacheMap.delete(filePath);
  } else {
    cacheMap.clear();
  }
}

module.exports = {
  readJsonArray,
  writeJsonArray,
  updateJsonArray,
  withFileLock,
  clearCache,
};

