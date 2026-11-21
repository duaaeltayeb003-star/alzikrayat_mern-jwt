// Requests that matched no route
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Central error handler: controllers call next(err) and end up here
const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    // Mongoose schema validation
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    // Malformed ObjectId in the URL
    status = 400;
    message = 'Invalid id format';
  } else if (err.code === 11000) {
    // Duplicate value on a unique field (e.g. email)
    status = 409;
    message = 'A record with this value already exists';
  } else if (err.name === 'MulterError') {
    // Upload problems such as a file that is too large
    status = 400;
    if (err.code === 'LIMIT_FILE_SIZE') message = 'Image must be 5 MB or smaller';
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
