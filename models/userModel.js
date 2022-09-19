const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide an valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //! This only work on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!!!!!!!!!',
    },
  },
});

//! This middleware occur before SAVED to the database
userSchema.pre('save', async function (next) {
  //! This middleware will only occur if the password is modified (update/create)
  if (!this.isModified('password')) return next(); // If it is not modified => quit

  // Second params stand for how strong the password will be encrypted
  this.password = await bcrypt.hash(this.password, 8);

  // Delete the passwordConfirm field
  this.passwordConfirm = undefined;
});

// This is called instance function, it is available on all collections of a document
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model('User', userSchema);
module.exports = User;
