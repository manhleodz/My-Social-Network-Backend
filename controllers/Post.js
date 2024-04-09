const { Posts, Users, Media, Likes, Comments } = require("../models");
const Sequelize = require('sequelize');
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');
const { auth } = require('../config/firebase.config');
const storage = getStorage();
const uuid = require('uuid');
const sharp = require('sharp');

const getPost = async (req, res, next) => {

    try {
        // let m = 0;
        // for (let i = 0; i < 10000000000000; i++) {
        //     m++;
        // }
        const page = (Number)(req.query.page);
        const userId = req.user.id;
        var listOfPosts = await Posts.findAll({
            where: { public: true },
            order: [['updatedAt', 'DESC']],
            include: [{
                attributes: ['UserId'],
                where: { UserId: userId },
                model: Likes,
                required: false,
            }, {
                attributes: ['username', 'nickname', 'smallAvatar',],
                model: Users,
            }, {
                attributes: ['link', 'id', 'type', 'backgroundColor'],
                model: Media,
            }],
            offset: page * 4,
            limit: 4,
        });

        res.status(200).json({
            message: 'Get posts successfully',
            currentPage: page,
            data: listOfPosts
        });
    } catch (err) {
        res.status(400).json({
            message: "Lỗi server",
            error: err.message
        });
    }
}

const getPostById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({
                message: "What do you want to, mf?",
            });
        }
        const post = await Posts.findByPk(id, {
            include: [{
                attributes: ['username', 'nickname', 'smallAvatar',],
                model: Users
            }, {
                attributes: ['link', 'id', 'type', 'backgroundColor'],
                model: Media
            }, {
                attributes: ['UserId'],
                where: { UserId: userId },
                model: Likes,
                required: false,
            }],
        });

        res.status(200).json({
            message: 'Get post successfully',
            data: post
        });
    } catch (err) {
        res.status(400).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};

const getPostByUser = async (req, res, next) => {
    try {
        const userId1 = (Number)(req.query.id);
        const userId2 = req.user.id;
        const page = (Number)(req.query.page);

        if (userId1 === userId2) {
            const listOfPosts = await Posts.findAll({
                where: { UserId: userId1 },
                order: [['id', 'DESC']],
                include: [{
                    attributes: ['username', 'nickname', 'smallAvatar',],
                    model: Users
                }, {
                    attributes: ['link', 'id', 'type', 'backgroundColor'],
                    model: Media
                }, {
                    attributes: ['UserId'],
                    where: { UserId: userId2 },
                    model: Likes,
                    required: false,
                }],
                offset: page * 4,
                limit: 4,
            });

            res.status(200).json({
                message: 'Get posts successfully',
                currentPage: page,
                data: listOfPosts
            });
        } else {
            const listOfPosts = await Posts.findAll({
                where: { UserId: userId1, public: true },
                order: [['id', 'DESC']],
                include: [{
                    attributes: ['username', 'nickname', 'smallAvatar',],
                    model: Users
                }, {
                    attributes: ['link', 'id', 'type', 'backgroundColor'],
                    model: Media
                }, {
                    attributes: ['UserId'],
                    where: { UserId: userId2 },
                    model: Likes,
                    required: false,
                }],
                offset: page * 4,
                limit: 4,
            });

            res.status(200).json({
                message: 'Get posts successfully',
                currentPage: page,
                data: listOfPosts
            });
        }

    } catch (err) {
        res.status(400).json({
            message: "Lỗi server",
            error: err.message
        });
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

const makeNewPost = async (req, res, next) => {
    try {
        const files = req.files;
        const postText = req.body.postText;
        const public = req.body.public;
        const UserId = req.user.id;

        if ((files.length === 0 && !postText) || (files.length === 0 && postText.length === 0)) throw new Error("Không có thông tin nào à???");

        if (!files || files.length === 0) {

            const newPost = await Posts.create({
                postText,
                public,
                UserId,
            });

            res.status(200).json({
                message: "Upload Successfully",
                newPost: public ? newPost : {}
            })
        }
        else if (files.length === 1) {

            const dateTime = giveCurrentDateTime();

            const newPost = await Posts.create({
                postText,
                public,
                UserId,
            });

            const uuid4 = uuid.v4()

            const storageRef = ref(storage, `posts/${files[0].originalname + "_" + dateTime}_${uuid4}`);

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

                await Media.create({
                    link: downloadURL,
                    type: 1,
                    backgroundColor,
                    UserId: UserId,
                    PostId: newPost.id,
                });
            } else if (contentType.includes("video")) {

                await Media.create({
                    link: downloadURL,
                    type: 2,
                    backgroundColor: "gray",
                    UserId: UserId,
                    PostId: newPost.id,
                });
            } else {

            }

            res.status(200).json({
                message: "Upload Successfully",
                newPost: public ? newPost : {}
            })
        }
        else if (files.length > 1) {
            const dateTime = giveCurrentDateTime();

            const newPost = await Posts.create({
                postText,
                public,
                UserId,
            });

            const uuid4 = uuid.v4()

            let listImages = [];

            for (let file of files) {
                const storageRef = ref(storage, `posts/${file.originalname + "_" + dateTime}_${uuid4}`);

                const contentType = (String)(file.mimetype);
                // Create file metadata including the content type
                const metadata = {
                    contentType: contentType,
                };

                // Upload the file in the bucket storage
                const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
                //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

                // Grab the public url
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

                    listImages.push({
                        link: downloadURL,
                        type: 1,
                        UserId: UserId,
                        PostId: newPost.id,
                        backgroundColor,
                        createdAt: dateTime,
                        updatedAt: dateTime
                    });
                } else if (contentType.includes("video")) {
                    listImages.push({
                        link: downloadURL,
                        type: 2,
                        UserId: UserId,
                        PostId: newPost.id,
                        createdAt: dateTime,
                        backgroundColor: "black",
                        updatedAt: dateTime
                    });
                } else {

                }
            }

            await Media.bulkCreate(listImages);

            res.status(200).json({
                message: "Upload Successfully",
                newPost: public ? newPost : {}
            })
        }
    } catch (err) {
        res.status(400).json({
            message: "Upload failed",
            error: err.message
        });
    }
};

const updatePost = async (req, res, next) => {
    try {
        const { postText } = req.body;
        const userId = req.user.id;
        const id = req.params.id;

        if (!postText) throw new Error("????????????????");

        const checker = await Posts.findByPk(id, {
            attributes: ['UserId']
        });

        if (!checker) throw new Error("Couldn't find post with id " + id);

        if (checker.UserId !== userId) throw new Error("You do not have permission");

        if (checker.UserId === userId) {

            await Posts.update({
                postText: postText,
                updatedAt: Sequelize.fn("now")
            }, { where: { id: id } });
            res.status(200).json("success");
        }

    } catch (err) {
        res.status(400).json({
            message: "Error updating post",
            error: err.message
        });
    }
};

const deletePost = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const postId = req.params.postId;
        const isValid = await Posts.findOne({
            where: { id: postId, UserId: userId }
        })

        if (!isValid) {
            res.status(400).json("You do not have permission to delete!");
        } else {
            await Posts.destroy({
                where: {
                    id: postId,
                },
            });
            res.status(200).json("success");
        }
    } catch (err) {
        res.status(400).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};

const updateLikeNum = async (req, res) => {
    try {
        const PostId = req.params.postId;
        const amount = await Likes.count({
            where: { PostId: PostId }
        })

        await Posts.update({
            likeNumber: amount,
            updatedAt: Sequelize.fn("now")
        }, { where: { id: PostId } })
        res.status(200).json("success");
    } catch (err) {
        res.status(400).json("Server error");
    }
};

const updateCommentNumber = async (req, res) => {
    try {
        const PostId = req.params.postId;
        const amount = await Comments.count({
            where: { PostId: PostId }
        })

        await Posts.update({
            commentNumber: amount,
            updatedAt: Sequelize.fn("now")
        }, { where: { id: PostId } })
        res.status(200).json("success");
    } catch (err) {
        res.status(400).json("Server error");
    }
};

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}

module.exports = {
    getPost,
    getPostById,
    getPostByUser,
    makeNewPost,
    deletePost,
    updatePost,
    updateLikeNum,
    updateCommentNumber
}