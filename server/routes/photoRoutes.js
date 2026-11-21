const router = require('express').Router();
const photoController = require('../controllers/photoController');
const commentRoutes = require('./commentRoutes');
const protect = require('../middleware/protect');
const upload = require('../middleware/upload');
const { validate, photoSchema } = require('../middleware/validation');

router.get('/', photoController.getAll);
router.get('/:id', photoController.getOne);
// Order matters: confirm the user, then store the file, then validate the text fields
router.post('/', protect, upload.single('image'), validate(photoSchema), photoController.create);
router.delete('/:id', protect, photoController.remove);

// Nested resource: /api/photos/:id/comments
router.use('/:id/comments', commentRoutes);

module.exports = router;
