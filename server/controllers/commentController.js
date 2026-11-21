const Photo = require('../models/Photo');
const Comment = require('../models/Comment');

const authorFields = 'firstName lastName';

// GET /api/photos/:id/comments  (oldest first)
exports.getForPhoto = async (req, res, next) => {
  try {
    if (!(await Photo.exists({ _id: req.params.id }))) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    const comments = await Comment.find({ photoId: req.params.id })
      .sort({ dateTime: 1 })
      .populate('userId', authorFields);
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// POST /api/photos/:id/comments
exports.create = async (req, res, next) => {
  try {
    if (!(await Photo.exists({ _id: req.params.id }))) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    const comment = await Comment.create({
      photoId: req.params.id,
      userId: req.user._id,
      comment: req.body.comment,
    });
    await comment.populate('userId', authorFields);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};
