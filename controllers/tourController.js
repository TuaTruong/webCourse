const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeature');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,summary,price,ratingsAverage';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numRatings: { $sum: '$ratingQuantity' },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    // {
    //   $sort: { avgPrice: 1 },
    // },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, // ! ne stands for not equal
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    // ! Unwind an item into the length of an array
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    // ! Delete _id field, change _id to month
    { $addFields: { month: '$_id' } },
    {
      $project: {
        _id: 0,
      },
    },
    // !!!!!!!!!!!!!!!!!!!!
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 6,
    },
  ]);
  res.status(200).json({
    status: 'success',
    numTours: plan.length,
    data: { plan },
  });
});

exports.getToursWithin = (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide lattitude and longtitude in the format lat,lng.',
        400
      )
    );

  console.log(distance, lat, lng, unit);

  res.status(200).json({ status: 'success' });
};
