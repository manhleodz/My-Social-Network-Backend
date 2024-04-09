const { Story, Users } = require('../models');
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');
const storage = getStorage();
const uuid = require('uuid');
const sharp = require('sharp');
const { auth } = require('../config/firebase.config');

const getAll = async (req, res, next) => {

    try {

        const page = (Number)(req.query.page);
        if (page) {
            const list = await Story.findAll({
                attributes: ['id', 'link', 'expires', 'public', 'seen', 'createdAt', 'updatedAt', 'backgroundColor'],
                include: [
                    {
                        attributes: ['id', 'nickname', 'username', 'smallAvatar'],
                        model: Users
                    }
                ],
                limit: 5,
                offset: page * 5,
                order: [['id', 'DESC']],
            });
            res.status(200).json(list);
        } else {
            const list = await Story.findAll({
                attributes: ['id', 'link', 'expires', 'public', 'seen', 'createdAt', 'updatedAt', 'backgroundColor'],
                include: [
                    {
                        attributes: ['id', 'nickname', 'username', 'smallAvatar'],
                        model: Users
                    }
                ],
                limit: 5,
                order: [['id', 'DESC']],
            });
            res.status(200).json(list);
        }
    } catch (err) {
        res.status(400).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};

const getHomeStory = async (req, res, next) => {

    try {
        const list = await Story.findAll({
            limit: 5,
            offset: 5,
            attributes: ['id', 'link', 'expires', 'seen', 'backgroundColor'],
            order: [['id', 'DESC']],
            include: [
                {
                    attributes: ['username', 'smallAvatar'],
                    model: Users
                }
            ],
        });
        res.status(200).json(list);
    } catch (err) {
        res.status(400).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};

const getByUser = async (req, res, next) => {

    try {

        const userId = req.params.userId;
        const list = await Story.findAll({
            where: { UserId: userId },
            include: [
                {
                    attributes: ['id', 'nickname', 'username', 'smallAvatar'],
                    model: Users
                }
            ]
        });
        res.status(200).json(list.reverse());
    } catch (err) {
        res.status(400).json(err);
    }
};

const getById = async (req, res, next) => {

    try {

        const id = req.params.id;
        const story = await Story.findByPk(id, {
            attributes: ['id', 'link', 'expires', 'seen', 'backgroundColor'],
            include: [
                {
                    attributes: ['id', 'nickname', 'username', 'smallAvatar'],
                    model: Users
                }
            ]
        });
        res.status(200).json({
            message: "Successfull",
            data: story
        });
    } catch (err) {
        res.status(400).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};

const deleteById = async (req, res) => {

    try {

        const id = req.params.id;
        const userId = req.user.id;
        const checker = await Story.findByPk(id);

        if (checker) {
            if (checker.UserId === userId) {
                await Story.destroy({
                    where: {
                        id: id,
                    }
                })
                res.status(200).json({ message: "Deleted successfully" });
            } else {
                res.status(400).json({ message: "Bạn ko có quyền xóa tin này" });
            }
        } else {
            res.status(404).json({ message: "Không tìm thấy tin" });
        }

    } catch (err) {
        res.status(400).json(err);
    }
};

async function calculateAverageImageColor(imageBuffer) {
    try {
        // Resize the image to 1x1 pixel to get the average color
        const { data } = await sharp(imageBuffer)
            .resize(1, 1, { fit: 'cover' })
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Convert the RGB values to integers
        const [red, green, blue] = data;

        return { red, green, blue };
    } catch (error) {
        console.error('Failed to calculate average color:', error);
    }
};

const post = async (req, res) => {

    try {
        const files = req.files;
        const public = req.body.public;
        const UserId = req.user.id;

        if (true) {

            const dateTime = giveCurrentDateTime();

            const uuid4 = uuid.v4();

            const storageRef = ref(storage, `stories/${files[0].originalname + "_" + dateTime}_${uuid4}`);

            const contentType = (String)(files[0].mimetype);

            const metadata = {
                contentType: contentType,
            };

            const snapshot = await uploadBytesResumable(storageRef, files[0].buffer, metadata);

            const downloadURL = await getDownloadURL(snapshot.ref);

            if (contentType.includes("image")) {
                let backgroundColor;
                try {
                    await calculateAverageImageColor(files[0].buffer)
                        .then(averageColor => {
                            backgroundColor = `rgb(${averageColor.red}, ${averageColor.green}, ${averageColor.blue})`;
                        })
                        .catch(error => {
                            res.status(400).json('Error calculating average color:', error);
                        });
                } catch (err) {
                    res.status(400).json({
                        message: "Upload failed",
                        error: err.message
                    });
                }

                const story = await Story.create({
                    link: downloadURL,
                    public,
                    seen: UserId,
                    UserId: UserId,
                    backgroundColor
                });

                const User = await Users.findByPk(UserId, {
                    attributes: ['id', 'nickname', 'username', 'smallAvatar']
                });

                res.status(200).json({
                    message: "Upload Successfully",
                    data: {
                        "id": story.id,
                        "link": story.link,
                        "expires": story.expires,
                        "public": story.public,
                        "seen": `${UserId}`,
                        "createdAt": story.createdAt,
                        "updatedAt": story.updatedAt,
                        "backgroundColor": backgroundColor,
                        "User": {
                            "id": UserId,
                            "nickname": User.nickname,
                            "username": User.username,
                            "smallAvatar": User.smallAvatar
                        }
                    }
                });

            } else if (contentType.includes("video")) {

                const User = await Users.findByPk(UserId, {
                    attributes: ['id', 'nickname', 'username', 'smallAvatar']
                });

                const story = await Story.create({
                    link: downloadURL,
                    public,
                    seen: UserId,
                    UserId: UserId,
                    backgroundColor: 'gray',
                });

                res.status(200).json({
                    message: "Upload Successfully",
                    data: {
                        "id": story.id,
                        "link": story.link,
                        "expires": story.expires,
                        "public": story.public,
                        "seen": `${UserId}`,
                        "createdAt": story.createdAt,
                        "updatedAt": story.updatedAt,
                        "backgroundColor": 'gray',
                        "User": {
                            "id": UserId,
                            "nickname": User.nickname,
                            "username": User.username,
                            "smallAvatar": User.smallAvatar
                        }
                    }
                })
            }
        }
    } catch (err) {
        res.status(400).json({
            message: "Upload failed",
            error: err.message
        });
    }
};

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
};

module.exports = {
    getAll,
    getById,
    getByUser,
    deleteById,
    post,
    getHomeStory,
}