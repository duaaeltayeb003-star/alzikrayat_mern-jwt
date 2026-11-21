const User = require('../models/User');
const { verifyToken } = require('../utils/token');

// Protected-route middleware.
// Expects the header:  Authorization: Bearer <token>
// On success it loads the user and sets req.user for the controllers.
const protect = async (req, res, next) => {
  try {
    const [scheme, token] = (req.header('Authorization') || '').split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Please log in to continue' });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Your session has expired. Please log in again.'
          : 'Invalid token. Please log in again.';
      return res.status(401).json({ message });
    }

    // The account may have been removed after the token was issued
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Account no longer exists' });

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = protect;
