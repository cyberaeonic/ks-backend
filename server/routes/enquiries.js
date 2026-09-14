const express = require('express');
const router = express.Router();
const { createEnquiry, getAllEnquiries, deleteEnquiry } = require('../controllers/enquiries');

router.route('/')
  .get(getAllEnquiries)
  .post(createEnquiry);

router.route('/:id')
  .delete(deleteEnquiry);

module.exports = router;
