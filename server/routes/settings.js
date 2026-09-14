const express = require('express');
const router = express.Router();
const { getSettings, saveSettings } = require('../controllers/settings');

router.route('/')
  .get(getSettings)
  .post(saveSettings);

module.exports = router;
