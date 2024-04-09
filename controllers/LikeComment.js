const { Likes } = require('../models');

const like = async (req, res) => {

    try {
        const CommentId = req.params.commentId;
        const UserId = req.user.id;

        const found = await Likes.findOne({
            where: { CommentId: CommentId, UserId: UserId },
        });
        if (!found) {
            await Likes.create({CommentId: CommentId, UserId: UserId });
            res.status(200).json(true);
        } else {
            await Likes.destroy({
                where: { CommentId: CommentId, UserId: UserId },
            });
            res.status(200).json(false);
        }
    } catch (err) {
        res.status(400).json("Server error")
    }
}

module.exports = {
    like
}