const User = require('../models/User');
const Photo = require('../models/Photo');
const Comment = require('../models/Comment');

// GET /api/stats
exports.getStats = async (req, res, next) => {
  try {
    const [users, photos, comments] = await Promise.all([
      User.countDocuments(),
      Photo.countDocuments(),
      Comment.countDocuments(),
    ]);
    res.json({ users, photos, comments });
  } catch (err) {
    next(err);
  }
};
