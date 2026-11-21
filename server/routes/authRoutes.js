const router = require('express').Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/protect');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', protect, authController.me);

module.exports = router;
