const bcrypt = require('bcrypt');
const User = require('../models/User');
const { signToken } = require('../utils/token');

// POST /api/auth/register  ->  201 { token, user }
exports.register = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'This email is already registered' });
    }
    const password = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ ...req.body, email, password });
    res.status(201).json({ token: signToken(user), user }); // toJSON removes the password hash
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login  ->  200 { token, user }
exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    const valid = user && (await bcrypt.compare(req.body.password, user.password));
    // Same message for "no such email" and "wrong password" so accounts cannot be probed
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected)  ->  the user behind the token.
// The client calls this on page load to confirm a stored token is still valid.
exports.me = (req, res) => {
  res.json(req.user);
};
