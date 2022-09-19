const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const bcrypt = require('bcryptjs');
const {promisify} = require("util")
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //! 1, check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //! 2, check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password'); // We have to select because it has been unselected in model
  const correct = await user.correctPassword(password, user.password);
  console.log(user);

  if (!user || !correct) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //! 3, If everything ok, send token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1, get token and check if it's exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token){
    return new AppError("You are not logged in! Please log in to get access",401)
  }
  //2, Veryfication token
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  console.log(decoded);
  //3. Check if user still exists

  //4, check if user change password after the token was issued
  next();
});
