const express = require('express');
const authController = require('./../controllers/authController');
const tourController = require('./../controllers/tourController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

router.use("/:tourId/reviews", reviewRouter) 

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
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  )
  .patch(tourController.updateTour);


module.exports = router;
