const express = require('express');
const router = express.Router();
const { validateToken } = require('../middlewares/AuthMiddleware');
const { UserRela } = require('../models');
const { Users } = require("../models");
const { Op } = require("sequelize");
const { addFriends, deleteFriend, getListFriend, getFriendRequest, getNineFriends, getUnconfirmedRequest, addChannelMessageRequest } = require("../controllers/UserRela");

// get list friend
router.get("/", validateToken, getListFriend);

//get list friend request
router.get("/request", validateToken, getFriendRequest);

//get list friend request
router.get("/unconfirmed", validateToken, getUnconfirmedRequest);

//get list friend of 1 profile
router.get("/profile", validateToken, getNineFriends);

router.post("/addMessageRequest", validateToken, addChannelMessageRequest);

// add friend request
router.post("/addFriend", validateToken, addFriends);

//unfriend
router.delete('/unfriend', validateToken, deleteFriend);

module.exports = router;