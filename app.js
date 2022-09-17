const express = require('express');
const morgan = require('morgan');
const app = express();
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
// 1 MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

const userRouter = require(`./routes/userRoutes`);
const tourRouter = require(`./routes/tourRoutes`);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// ! Handle all routes that has not been implemented
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // ! If we pass an param in the next() function, it will assume that the param is an err, stop all the middleware and send the err to the global error handling middleware
  // next(err);
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});

//! When ever a middleware have 4 params, it will assume this is a GLOBAL handling error middleware
app.use(globalErrorHandler);
module.exports = app;
