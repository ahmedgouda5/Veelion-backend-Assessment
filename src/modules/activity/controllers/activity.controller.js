const aSvc = require('../services/activity.service');
const HttpError = require('../../../utils/httpError');

async function get_activity(req, res) {
  const activities = await aSvc.getAllActivity();
  res.json(activities);
}

async function addActivity(req, res) {
  const bodyData = req.body;

  if (!bodyData || typeof bodyData !== 'object' || Array.isArray(bodyData)) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }

  if (typeof bodyData.action !== 'string') {
    throw new HttpError(400, '"action" field is required and must be a string.');
  }

  const action = bodyData.action.trim();
  if (!action) {
    throw new HttpError(400, '"action" field cannot be empty.');
  }

  if (action.length > 255) {
    throw new HttpError(400, '"action" field cannot exceed 255 characters.');
  }

  let info = bodyData.info;
  if (info !== undefined) {
    if (typeof info === 'string') {
      if (info.length > 5000) {
        throw new HttpError(400, '"info" string length cannot exceed 5000 characters.');
      }
    } else if (typeof info !== 'object' && typeof info !== 'number' && typeof info !== 'boolean') {
      throw new HttpError(400, '"info" field must be a string, number, boolean, or object.');
    }
  } else {
    info = null;
  }

  const newActivity = await aSvc.createNewActivity({ action, info });
  res.status(201).json(newActivity);
}

module.exports = {
  get_activity,
  addActivity,
};

