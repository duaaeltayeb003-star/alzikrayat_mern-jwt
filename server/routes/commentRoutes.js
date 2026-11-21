// Mounted at /api/photos/:id/comments, so mergeParams exposes :id
const router = require('express').Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const protect = require('../middleware/protect');
const { validate, commentSchema } = require('../middleware/validation');

router.get('/', commentController.getForPhoto);
router.post('/', protect, validate(commentSchema), commentController.create);

module.exports = router;
