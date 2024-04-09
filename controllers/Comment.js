const { Comments, Users, Posts } = require("../models");

const getCommentsByPost = async (req, res, next) => {

    try {
        const postID = req.params.postId;
        const comments = await Comments.findAll({
            attributes: ['id', 'commentBody', 'likeNumber', 'PostId', 'createdAt', 'updatedAt'],
            where: { PostId: postID },
            include: [{
                attributes: ['id', 'username', 'nickname', 'smallAvatar'],
                model: Users
            }],
            limit: 10
        });
        res.status(200).json(comments);
    } catch (err) {
        res.status(400).json("Server error")
    }
};

const newComment = async (req, res, next) => {

    try {
        const comment = req.body;
        const PostId = req.body.PostId;
        const newComment = await Comments.create(comment);

        await Posts.increment('commentNumber', { by: 1, where: { id: PostId } });

        res.status(200).json({
            message: "Thành công rồi ông ơi!",
            newComment
        });
    } catch (err) {
        res.status(400).json({
            message: "Lỗi ông ơi",
            error: err.message
        })
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const commentId = req.params.commentId;

        await Comments.destroy({
            where: {
                id: commentId,
            },
        });

        await Posts.decrement('commentNumber', { by: 1, where: { id: PostId } });

        res.status(200).json("DELETED SUCCESSFULLY");
    } catch (err) {
        res.status(400).json("Server error")
    }
};

module.exports = {
    getCommentsByPost,
    newComment,
    deleteComment
}