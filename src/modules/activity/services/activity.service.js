const path = require('node:path');
const { createId } = require('../../../utils/id');
const { readJsonArray, updateJsonArray } = require('../../../utils/jsonStore');

const ACTIVITY_FILE_PATH = path.join(process.cwd(), 'data', 'activity.json');

async function getAllActivity() {
  return readJsonArray(ACTIVITY_FILE_PATH);
}

async function createNewActivity(payload) {
  let createdRecord = null;

  await updateJsonArray(ACTIVITY_FILE_PATH, async (list) => {
    createdRecord = {
      id: createId(),
      action: payload.action,
      info: payload.info,
      when: new Date().toISOString(),
    };

    list.push(createdRecord);
    return createdRecord;
  });

  return createdRecord;
}

module.exports = {
  getAllActivity,
  createNewActivity,
};

