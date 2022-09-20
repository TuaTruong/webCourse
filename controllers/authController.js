const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const bcrypt = require('bcryptjs');

const { promisify } = require('util');
const { decode } = require('punycode');
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
    passChangedAt: req.body.passChangedAt,
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
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }
  //2, Veryfication token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );
  }
  //4, check if user change password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed the password! Please login again',
        401
      )
    );
  }

  // Grant access to the next route
  req.user = currentUser;
  next();
});

// (...roles) pack params into an array
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1, Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }

  //2, Generate the random token
  const resetToken = user.createPasswordResetToken();
  //! We have to save because we created passwordResetExpired without saving
  await user.save({ validateBeforeSave: false }); // validator of field passwordConfirm will be activated if we save a document
  //3, Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \nIf you didn'nt forget your password, please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min) ',
      text: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later', 500)
    );
  }
});
exports.resetPassword = (req, res, next) => {};
