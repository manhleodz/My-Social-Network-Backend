const { Notifications, Users } = require("../models");

const getByUser = async (req, res) => {

    try {

        const userId = req.user.id;

        const result = await Notifications.findAll({
            where: { receiver: userId },
            include: [{
                attributes: ['username', 'nickname', 'smallAvatar'],
                model: Users,
                as: "Sender"
            }]
        });

        res.status(200).json({
            message: "Get notifications successfully",
            data: result
        })
    } catch (err) {
        res.status(400).json({
            message: "Lỗi server",
            error: err.message
        });
    }
}

const sendNotification = async (req, res) => {
    try {

        const userId = req.user.id;
        const { sender, receiver, message, type } = req.body;

        if (sender !== userId) throw new Error("Ảo nhỉ không trùng người gửi");

        await Notifications.create({
            sender, receiver, message, type
        })

        res.status(201).json("Thành công nhé");

    } catch (err) {
        res.status(400).json({
            message: "Lỗi server",
            error: err.message
        });
    }
}

const deleteNotification = async (req, res) => {
    try {

        const userId = req.user.id;
        const id = (Number)(req.query.id);

        const notification = await Notifications.findOne({
            where: { id: id, sender: userId }
        })

        if (!notification) throw new Error("Không thể xóa")

        await Notifications.destroy({
            where: { id: id }
        })
        res.status(201).json("Thành công nhé");

    } catch (err) {
        res.status(400).json({
            message: "Lỗi server",
            error: err.message
        });
    }
}

const seenNotifications = async (req, res) => {

};

module.exports = {
    getByUser,
    sendNotification,
    deleteNotification,
    seenNotifications
}