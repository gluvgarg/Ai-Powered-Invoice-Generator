const express = require('express');

const {registerUser , loginUser , getMe , updateUserProfile} = require('../controllers/authController.js');
const{protect} = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login',loginUser);
router.route('/me').get(protect,getMe).put(protect, updateUserProfile);

module.exports = router;


