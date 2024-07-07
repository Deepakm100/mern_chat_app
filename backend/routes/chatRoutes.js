const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { accessChats, fetchChats ,createGroupChat,renameGroup,
    addUserToGroup,removeUserFromGroup} = require('../controllers/chatControllers');
const router = express.Router()

router.route('/').post(protect,accessChats)
router.route('/').get(protect,fetchChats)
router.route('/group').post(protect,createGroupChat)
router.route('/rename').put(protect,renameGroup)
router.route('/addUser').put(protect,addUserToGroup)
router.route('/removeUser').put(protect,removeUserFromGroup)


module.exports = router