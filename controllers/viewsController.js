const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
exports.getOverview = catchAsync(async (req, res, next) => {
  //1, Get all the tour data from collection
  const tours = await Tour.find();

  //2, Build template

  //3, Render that template using tour data
  res.render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = (req, res) => {
  res.status(200).render('overview', {
    title: 'The Forest Hiker',
  });
};
