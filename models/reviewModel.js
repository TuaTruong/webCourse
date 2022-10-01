const mongoose = require('mongoose');
const Tour = require("./../models/tourModel")
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: false },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});


reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourId,{
    ratingQuantity:stats[0]["nRating"],
    ratingsAverage: stats[0]["avgRating"]
  })
};

// We have to use post instead of pre because we have to calculate the ratingAverage after it is saved to the DB 
reviewSchema.post('save', function () {
  // Use this.constructor to use statics functions
  this.constructor.calcAverageRatings(this.tour); // Review.calcAverageRatings but Review has been defined
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
