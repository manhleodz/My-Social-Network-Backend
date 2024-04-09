const express = require("express");
const router = express.Router();
const { Likes, Users, Posts } = require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');
const sequelize = require("sequelize");

router.post("/", validateToken, async (req, res) => {
    const PostId = req.body.PostId;
    const UserId = req.user.id;

    const found = await Likes.findOne({
        where: { PostId: PostId, UserId: UserId },
    });
    if (!found) {
        await Likes.create({ PostId: PostId, UserId: UserId });

        await Posts.increment('likeNumber', { by: 1, where: { id: PostId } });

        res.json(true);
    } else {
        await Likes.destroy({
            where: { PostId: PostId, UserId: UserId },
        });

        await Posts.decrement('likeNumber', { by: 1, where: { id: PostId } });

        res.json(false);
    }
});

router.get("/:postId", async (req, res) => {
    const postId = req.params.postId;
    const likes = await Likes.findAll({
        attributes: ['id', 'CommentId', 'UserId', 'PostId', 'ReelId', 'StoryId'],
        where: { PostId: postId },
        include: [
            {
                attributes: ['id', 'username', 'nickname', 'smallAvatar'],
                model: Users
            }
        ]
    });
    res.json(likes);
});

router.get("/:postId/:userId", validateToken, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.params.userId;
    const like = await Likes.findAll({
        where: {
            PostId: postId,
            UserId: userId
        }
    });
    if (like.length === 0) {
        res.json(false);
    } else {
        res.json(true);
    }
});

module.exports = router;