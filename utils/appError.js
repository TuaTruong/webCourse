class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // This property is used to differentiate errors that we have already controlled with other errors

    Error.captureStackTrace(this, this.constructor); // Not important to understand, just copy
  }
}
module.exports = AppError;
