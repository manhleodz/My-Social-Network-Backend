const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { Op } = require("sequelize");
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');
const { auth } = require('../config/firebase.config');
const storage = getStorage();
const uuid = require('uuid');
const sharp = require('sharp');
const { Users, UserRela } = require("../models");
const { sign } = require('jsonwebtoken');
require('dotenv').config();

const Mailgen = require('mailgen');
const { EMAIL, PASSWORD } = require('../env.js');
const { Decode } = require('../helpers/Decode.js');

const Redis = require('redis');

const redisClient = Redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.connect().catch(console.error);

if (!redisClient.isOpen) {
    redisClient.connect().catch(console.error);
};

const signup = async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) throw new Error("Vui lòng nhập đầy đủ email và password");

        if (password.length < 8) throw new Error("Mật khẩu có độ dài trên 7 kí tự");

        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) throw new Error("Vui lòng nhập đúng email");

        const duplication = await Users.findOne({
            where: { email: email }
        })

        if (duplication) throw new Error("Email đã tồn tại");

        let id;
        bcrypt.hash(password, 10).then(async (hash) => {
            const newAccount = await Users.create({
                password: hash,
                email: email,
            });

            await redisClient.SET(`account-${newAccount.id}`, JSON.stringify({ online: false }));
            id = newAccount.id;
        }).then((e) => {
            const accessToken = sign(
                { email: email, id: id },
                process.env.SECRET_KEY
            )
            res.status(200).json(accessToken);
        })

    } catch (error) {
        res.status(400).json({
            message: "error",
            error: error.message
        });
    }
}

const makeInfo = async (req, res) => {

    try {
        const data = req.body;
        data.confirm = 1;
        const username = data.username;
        const email = req.user.email.trim();

        if (!username) throw new Error("Thiếu tên đăng nhập!");

        if (username.length < 6) throw new Error("Tên người dùng phải có độ dài trên 6 kí tự");

        const duplication = await Users.findAll({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: email }
                ]
            }
        })

        if (duplication.length === 1) {
            await Users.update(data, { where: { email: email } }).then(e => {
                const accessToken = sign(
                    { username, id: duplication[0].id, confirm: 1, email },
                    process.env.SECRET_KEY
                )
                res.status(200).json({
                    message: "Successfull",
                    token: accessToken,
                    username: username,
                    email: duplication.email,
                    confirm: duplication.confirm,
                    avatar: duplication.avatar,
                    smallAvatar: duplication.smallAvatar,
                    email: duplication.email,
                    id: duplication.id,
                    nickname: duplication.nickname
                });
            })
        } else {
            res.status(400).json({
                error: "Tên đăng nhập đã tồn tại"
            });
        }

    } catch (error) {
        res.status(400).json({
            message: "Error",
            error: error.message
        });
    }
}

const verifyEmail = async (req, res) => {

    try {
        const email = req.body.email;
        const password = req.body.password;
        var OTP = req.body.OTP;
        OTP = Decode(OTP);

        let config = {
            service: 'gmail',
            auth: {
                user: EMAIL,
                pass: PASSWORD
            }
        }

        let transporter = nodemailer.createTransport(config);

        let MailGenerator = new Mailgen({
            theme: "default",
            product: {
                name: process.env.APP_NAME,
                link: process.env.APP_LINK,
            }
        })

        let response = {
            body: {
                name: email,
                intro: "ML xin chào",
                table: {
                    data: [
                        {
                            "Thông tin": "Mã OTP",
                            OTP: OTP,
                        }
                    ]
                },
                outro: "Chúc bạn một ngày tốt lành <3"
            }
        }

        let mail = MailGenerator.generate(response)

        let message = {
            from: EMAIL,
            to: email,
            subject: "New Account",
            html: mail
        }

        var excuting = true;
        let message1 = "";

        if (password === "" || email === "") {
            res.status(400).json("Vui lòng nhập đầy đủ thông tin");
        } else {

            const duplication = await Users.findOne({
                where: {
                    email: email
                }
            })

            if (duplication != null) {
                excuting = false;
                message1 = "Email đã được sử dụng";
            }
        }

        if (excuting === false) {
            res.status(400).json(message1);
        } else {
            transporter.sendMail(message).then(() => {

                return res.status(201).json({
                    msg: "you should receive an email"
                })
            }).catch(error => {
                return res.status(400).json(error)
            })
        }

    } catch (err) {
        res.status(400).json({
            message: "error",
            error: err.message
        });
    }
}

const login = async (req, res) => {

    try {

        const { information, password } = req.body;

        const user = await Users.findOne({
            attributes: ['id', 'username', 'nickname', 'smallAvatar', 'password', 'confirm', 'email'],
            where: {
                [Op.or]: [
                    { username: information },
                    { email: information }
                ]
            }
        });

        if (!user) res.status(400).json("Tên người dùng hoặc email không tồn tại");
        else
            bcrypt.compare((password), user.password).then((match) => {
                if (!match) {
                    res.status(400).json("Sai mật khẩu");
                } else {
                    if (user.confirm === 0) {
                        const accessToken = sign({
                            email: user.email,
                            id: user.id
                        }, process.env.SECRET_KEY)
                        res.status(200).json({
                            message: "authentication has not been completed",
                            token: accessToken,
                            email: user.email,
                            confirm: user.confirm,
                        });
                    } else if (user.confirm === 1) {
                        const accessToken = sign({
                            email: user.email,
                            id: user.id,
                        }, process.env.SECRET_KEY)
                        res.status(200).json({
                            message: "Successfull",
                            token: accessToken,
                            email: user.email,
                            confirm: user.confirm,
                            smallAvatar: user.smallAvatar,
                            email: user.email,
                            id: user.id,
                            nickname: user.nickname,
                            username: user.username
                        });
                    }
                }
            }).catch(() => res.status(400).json("Lỗi input"))
    } catch (err) {
        res.status(400).json({
            message: "error",
            error: err.message
        });
    }
}

const getProfile = async (req, res) => {

    try {
        const info = req.params.info;
        const userId = req.user.id;
        if (isNaN(info)) {
            const profile = await Users.findOne({
                attributes: ['id', 'username', 'nickname', 'smallAvatar', 'email', 'gender', 'background', 'backgroundColor', 'address', 'story', 'workAt', 'studyAt', 'favorites', 'birthday', 'phoneNumber'],
                where: { username: info }
            })

            const checker = await UserRela.findOne({
                attributes: ['id', 'User1', 'User2', 'status'],
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { User1: userId }, { User1: profile.id }
                            ]
                        },
                        {
                            [Op.or]: [
                                { User2: profile.id }, { User2: userId }
                            ]
                        }
                    ]
                }
            });

            let isFriend = 0;
            if (checker) {
                if (checker.status === 0 && userId === checker.User1)
                    isFriend = 1;
                else if (checker.status === 0 && userId === checker.User2)
                    isFriend = 2;
                else if (checker.status === 1)
                    isFriend = 3;
            } else {
                isFriend = 0;
            }

            res.status(200).json({
                message: "Get profile successfully",
                profile: profile,
                isFriend
            });
        } else {
            const profile = await Users.findOne({
                attributes: ['id', 'username', 'nickname', 'email', 'smallAvatar', 'gender', 'background', 'address', 'story', 'workAt', 'studyAt', 'favorites', 'birthday','phoneNumber'],
                where: { id: info }
            });

            const checker = await UserRela.findOne({
                attributes: ['id', 'User1', 'User2'],
                where: {
                    status: 1,
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { User1: userId }, { User1: profile.id }
                            ]
                        },
                        {
                            [Op.or]: [
                                { User2: profile.id }, { User2: userId }
                            ]
                        }
                    ]
                }
            });

            let isFriend = -1;
            if (checker) {
                if (checker.status === 0 && userId === checker.User1)
                    isFriend = 1;
                else if (checker.status === 0 && userId === checker.User2)
                    isFriend = 2;
                else if (checker.status === 1)
                    isFriend = 3;
            } else {
                isFriend = 0;
            }
            res.status(200).json({
                message: "Get profile successfully",
                profile: profile,
                isFriend
            });
        }
    } catch (err) {
        res.status(400).json({
            message: "error",
            error: err.message
        });
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        await Users.update(updateData, {
            where: { id: userId }
        });

        res.status(200).json({
            message: "Update profile successfully",
        });
    } catch (err) {
        res.status(400).json({
            message: "error",
            error: err.message
        });
    }
}

const refreshStateUser = async (req, res) => {

    try {
        const email = req.user.email;
        const info = await Users.findOne({
            attributes: ['id', 'username', 'nickname', 'smallAvatar', 'confirm'],
            where: { email: email }
        });

        if (info) {
            res.status(200).json(info);
        } else {
            res.status(404).json("404 Not Found");
        }
    } catch (err) {
        res.status(400).json({
            message: "error",
            error: err.message
        });
    }
}

const updateAvatarAndBackground = async (req, res) => {

    try {
        const files = req.files;
        const { type } = req.body;
        const userId = req.user.id;

        if (!type || files.length > 1 || files.length === 0) throw new Error("Không xác định được yêu cầu!");

        const uuid4 = uuid.v4()

        const dateTime = giveCurrentDateTime();

        const storageRef = ref(storage, `posts/${files[0].originalname + "_" + dateTime}_${uuid4}`);

        const contentType = (String)(files[0].mimetype);

        const metadata = {
            contentType: contentType,
        };

        const snapshot = await uploadBytesResumable(storageRef, files[0].buffer, metadata);

        const downloadURL = await getDownloadURL(snapshot.ref);

        if (type === "avatar") {

            let smallAvatar;
            await resizeImage(files[0].buffer)
                .then(async (data) => {
                    const storageRef = ref(storage, `avatars/${files[0].originalname + "_" + dateTime}_${uuid4}`);

                    const contentType = (String)(files[0].mimetype);

                    const metadata = {
                        contentType: contentType,
                    };

                    const snapshot = await uploadBytesResumable(storageRef, data, metadata);

                    smallAvatar = await getDownloadURL(snapshot.ref);
                })
                .catch(error => {
                    throw new Error('Error calculating average color:' + error.message);
                });

            await Users.update({
                avatar: downloadURL,
                smallAvatar
            }, { where: { id: userId } })

            res.status(200).json({
                message: "Updated successfully"
            })
        } else if (type === "background") {

            let backgroundColor;
            await calculateAverageImageColor(files[0].buffer)
                .then(averageColor => {
                    backgroundColor = `rgb(${averageColor.red}, ${averageColor.green}, ${averageColor.blue})`;
                })
                .catch(error => {
                    throw new Error('Error calculating average color:' + error.message);
                });

            await Users.update({
                background: downloadURL,
                backgroundColor
            }, { where: { id: userId } });

            res.status(200).json({
                message: "Updated successfully"
            })
        } else throw new Error("Không xác định được yêu cầu!");
    } catch (err) {
        res.status(400).json({
            message: "error",
            error: err.message
        });
    }
};

async function resizeImage(imageBuffer) {
    try {

        const { data } = await sharp(imageBuffer)
            .resize({
                width: 200,
                height: 200,
                fit: sharp.fit.cover,
                position: sharp.strategy.entropy
            })
            .toBuffer({ resolveWithObject: true });

        return data;

    } catch (error) {
        console.error('Failed to calculate average color:', error);
    }
}

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

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}


module.exports = {
    signup,
    verifyEmail,
    login,
    makeInfo,
    getProfile,
    updateUserProfile,
    refreshStateUser,
    updateAvatarAndBackground
}