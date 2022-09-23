const express = require('express');
const reivewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
const router = express.Router();

router
  .route('/')
  .get(reivewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reivewController.createReview
  );

module.exports = router;
