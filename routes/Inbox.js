const express = require('express');
const router = express.Router();
const { validateToken } = require('../middlewares/AuthMiddleware');
const { deleteMessage, createGroup, deleteGroup, getConversationMessage, sendConversationMessage, changeMessage, getListGroups, sendGroupMessage, getGroupById, getGroupMessage, addUserIntoGroup, seenMessage, getListUserIdInGroup, getAllNickname, changeNickname, changeGroupAvatar, changeGroupBackground, changeGroupName, leaveGroup } = require('../controllers/Inbox');
const uploadMiddleware = require('../middlewares/multer');

router.get("/:RelationshipId", validateToken, getConversationMessage)

router.post("/", validateToken, sendConversationMessage);

router.delete("/:id", validateToken, deleteMessage);

router.put("/:id", validateToken, changeMessage);

router.put("/seen/:RelationshipId", validateToken, seenMessage);

router.get("/group/all", validateToken, getListGroups);

router.get("/group/:ChannelId", validateToken, getGroupMessage);

router.get("/group/listUserId/:id", getListUserIdInGroup);

router.post("/group", validateToken, sendGroupMessage);

router.post("/group/newgroup", validateToken, createGroup);

router.post("/group/addUser", validateToken, addUserIntoGroup);

router.delete("/group/delete", validateToken, deleteGroup);

router.get("/group/nicknames/:ChannelId", validateToken, getAllNickname);

router.post("/group/nickname", validateToken, changeNickname);

router.post("/group/name", validateToken, changeGroupName);

router.post("/group/avatar", validateToken, uploadMiddleware, changeGroupAvatar);

router.post("/group/background", validateToken, uploadMiddleware, changeGroupBackground);

router.delete("/group/leave/:ChannelId", validateToken, leaveGroup);

module.exports = router;
