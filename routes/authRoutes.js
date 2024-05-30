const express = require('express');
const { createUser, loginUserCtrl, getallUser, getaUser, deletedUser, updatedUser, blockUser, unblockUser, handleRefreshToken, logout, } = require('../controller/userCtrl');
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.get('/all-users', getallUser);
router.get('/refresh', handleRefreshToken);
router.get('/:id', authMiddleware, isAdmin, getaUser);
router.post('/logout', logout);
router.delete('/:id', deletedUser);
router.put('/edit', authMiddleware, updatedUser);
router.put('/block/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock/:id', authMiddleware, isAdmin, unblockUser);



module.exports = router;