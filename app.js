const express = require('express');
const morgan = require('morgan');
const app = express();
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
// GLOBAL MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security https headers
app.use(helmet());

// Limit request from sam API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // One hour
  message: 'Too many request from this IP, please try again in an hour',
});
app.use('/api', limiter); // Apply limiter to all /api route

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'difficulty',
      'ratingsAverage',
      'ratingQuantity',
      "price"
    ], // Allowed duplicated query
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const userRouter = require(`./routes/userRoutes`);
const tourRouter = require(`./routes/tourRoutes`);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// ! Handle all routes that has not been implemented
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});

//! When ever a middleware have 4 params, it will assume this is a GLOBAL handling error middleware
app.use(globalErrorHandler);
module.exports = app;
