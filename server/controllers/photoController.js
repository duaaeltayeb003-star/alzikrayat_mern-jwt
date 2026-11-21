const fs = require('fs');
const path = require('path');
const Photo = require('../models/Photo');
const Comment = require('../models/Comment');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const ownerFields = 'firstName lastName';

// GET /api/photos  (newest first, each with its comment count)
exports.getAll = async (req, res, next) => {
  try {
    const photos = await Photo.find().sort({ dateTime: -1 }).populate('userId', ownerFields).lean();

    const counts = await Comment.aggregate([{ $group: { _id: '$photoId', total: { $sum: 1 } } }]);
    const countByPhoto = new Map(counts.map((c) => [String(c._id), c.total]));

    res.json(photos.map((p) => ({ ...p, commentCount: countByPhoto.get(String(p._id)) || 0 })));
  } catch (err) {
    next(err);
  }
};

// GET /api/photos/:id
exports.getOne = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id).populate('userId', ownerFields);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });
    res.json(photo);
  } catch (err) {
    next(err);
  }
};

// POST /api/photos  (multipart: image, title, description)
exports.create = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please choose an image to upload' });

    const photo = await Photo.create({
      userId: req.user._id,
      fileName: req.file.filename,
      title: req.body.title,
      description: req.body.description,
    });
    await photo.populate('userId', ownerFields);
    res.status(201).json(photo);
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

// DELETE /api/photos/:id  (owner only, checked on the server)
exports.remove = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    if (String(photo.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own photos' });
    }

    fs.unlink(path.join(uploadsDir, photo.fileName), () => {}); // remove the file from disk
    await Comment.deleteMany({ photoId: photo._id });
    await photo.deleteOne();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
