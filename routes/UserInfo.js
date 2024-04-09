const express = require('express');
const router = express.Router();

const { Users } = require("../models");
const { validateToken } = require('../middlewares/AuthMiddleware');

//get info
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const info = await UserInfo.findAll({where: {UserId: id}});
    res.json(info[0]);
});


//post new info
router.post("/", async (req, res) => {
    const info = req.body;
    info.background = 'https://pbs.twimg.com/media/Fg2RlQYaMAEIzkd.jpg:large';
    await UserInfo.create(info);
    res.json("success");
});

// update info
router.put("/story/:id", validateToken, async (req, res) => {
    const id = req.params.id;
    const { story, Address, workAt, studyAt, favorites, birthday } = req.body;
    const news = await UserInfo.update({ story: story, Address: Address, workAt: workAt, studyAt: studyAt, favorites: favorites, birthday: birthday }, { where: { UserId: id } });
    res.json(news);
});

// update background
router.put("/upload-background", async (req, res) => {
    const background = req.body.background;
    const id = req.body.id;
    const newBg = await UserInfo.update({ background: background }, { where: { UserId: id } })
    res.json({ newBg })
});

//Online
router.put("/online", async (req, res) => {
    const active = req.body.isActive;
    const id = req.body.id;
    const online = await UserInfo.update({isActive: active}, {where: {UserId: id} });
    res.json({online})
});

//offline
router.put("/offline", async (req, res) => {
    const active = req.body.isActive;
    const id = req.body.id;
    const online = await UserInfo.update({isActive: active}, {where: {UserId: id} });
    res.json({online})
});
module.exports = router;