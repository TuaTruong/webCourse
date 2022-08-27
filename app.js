const express = require('express');
const morgan = require('morgan');
const app = express();

// 1 MIDDLEWARE
if (process.env.NODE_ENV === "development"){
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next();
});

const userRouter = require(`./routes/userRoutes`);
const tourRouter = require(`./routes/tourRoutes`);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app