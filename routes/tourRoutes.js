const express = require('express');
const authController = require('./../controllers/authController');
const tourController = require('./../controllers/tourController');

const router = express.Router();
// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stat').get(tourController.getTourStats);

router.route('/monthly-plan/:year?').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .delete(tourController.deleteTour)
  .patch(tourController.updateTour);
module.exports = router;
