const { Op, where } = require("sequelize");
const Redis = require('redis');
const Sequelize = require('sequelize');

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

const { Users, UserRela, Inbox, sequelize } = require("../models");
require('dotenv').config();

const addFriends = async (req, res) => {
    try {
        const User1 = req.user.id;
        const User2 = req.body.user;

        if (User1 === User2) {
            res.status(400).json({
                message: "error",
                error: "Invalid userid"
            });
        } else {
            const checker = await UserRela.findOne({
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { User1: User1 }, { User1: User2 }
                            ]
                        },
                        {
                            [Op.or]: [
                                { User2: User2 }, { User2: User1 }
                            ]
                        }
                    ]
                }
            })

            if (checker === null) {
                await UserRela.create({ User1: User1, User2: User2 })
                res.status(201).json({
                    message: "Add Friend Successfully"
                })
            } else if (checker !== null) {
                if (checker.status === 0 && User1 === checker.User2) {
                    const newFr = await UserRela.update({ status: 1 }, { where: { id: checker.id } });
                    res.status(200).json({
                        message: "Confirm friend invitation!"
                    })
                } else if (checker.status === 0 && User1 === checker.User1) {
                    res.status(400).json({
                        message: "error",
                        error: "Wait for response!!!"
                    })
                } else if (checker.status === 1) {
                    res.status(200).json({
                        message: "Already be friend!"
                    })
                } else if (checker.status === 2) {
                    await UserRela.update({ User1: User1, User2: User2, status: 0 }, { where: { id: checker.id } });
                    res.status(200).json({
                        message: "Add Friend Successfully"
                    })
                }
            }
        }

    } catch (err) {
        res.status(400).json({
            message: "error",
            error: err.message
        });
    }
}

const addChannelMessageRequest = async (req, res) => {
    try {
        const User1 = req.user.id;
        const User2 = req.body.user;

        if (User1 === User2) throw new Error("Error");
        if (!User2) throw new Error("Cant find user");

        const checker = await UserRela.findOne({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { User1: User1 }, { User1: User2 }
                        ]
                    },
                    {
                        [Op.or]: [
                            { User2: User2 }, { User2: User1 }
                        ]
                    }
                ]
            }
        })

        if (checker === null) {
            const relationshipId = await UserRela.create({ User1: User1, User2: User2, status: 2 })
            res.status(201).json({
                message: "Success",
                relationshipId
            })
        } else {
            res.status(200).json({
                message: "Success",
                relationshipId: checker
            })
        }

    } catch (err) {
        res.status(400).json({
            message: "error",
            error: err.message
        });
    }
}

const deleteFriend = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.query.id;

        const checker = await UserRela.findOne({
            attributes: ['id', 'User1', 'User2'],
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { User1: userId }, { User1: id }
                        ]
                    },
                    {
                        [Op.or]: [
                            { User2: id }, { User2: userId }
                        ]
                    }
                ]
            }
        })

        if (checker === null) {
            res.status(400).json({
                message: "error",
                error: "Not found in the friend list"
            });
        } else {
            if (checker.User1 === userId || checker.User2 === userId) {
                await UserRela.destroy({ where: { id: checker.id } });
                res.status(200).json({
                    message: "Unfriend",
                })
            } else {
                res.status(400).json({
                    message: "error",
                    error: "You are not allowed to delete"
                });
            }
        }
    } catch (err) {
        res.status(400).json({
            message: "error",
            error: err.message
        });
    }
}


const getListFriend = async (req, res) => {
    try {
        const id = req.user.id;

        let list = await UserRela.sequelize.query(`
            select  
                "UserRela"."id" as "RelationshipId", "UserRela"."User1", "UserRela"."User2", "UserRela"."lastMessage", "UserRela"."seen", "UserRela"."updatedAt", "UserRela"."status",
                "Users"."id", "Users"."nickname", "Users"."username", "Users"."smallAvatar", 
                "Inbox"."message", "Inbox"."type", "Inbox"."sender"
            from "UserRela"
            left join "Users" on ("User1" = "Users"."id" or "User2" = "Users"."id") and "Users"."id" != ${id}
            left join "Inbox" on "lastMessage" = "Inbox"."id"
            WHERE ("UserRela"."User1" = ${id} OR "UserRela"."User2" = ${id})
            AND "UserRela"."status" = 1 
            ORDER BY "UserRela"."id" DESC;
        `)

        const data = list[0];

        if (data.length == 0) res.status(204).json("bye");
        else {
            let friendIds = data.map(fr => {
                if (fr.User1 === id)
                    return `account-${fr.User2}`;
                else
                    return `account-${fr.User1}`;
            })

            let onlineUsers;
            await redisClient.MGET(friendIds).then(res => {
                onlineUsers = res;
            }).catch(err => {
                if (err) throw new Error("Redis error: " + err);
            })

            let result = [];
            for (let i = 0; i < onlineUsers.length; i++) {

                if (onlineUsers[i]) {
                    result.push({
                        "RelationshipId": data[i].RelationshipId,
                        "lastMessage": data[i].lastMessage,
                        "seen": data[i].seen,
                        "updatedAt": data[i].updatedAt,
                        "id": data[i].id,
                        "nickname": data[i].nickname,
                        "username": data[i].username,
                        "smallAvatar": data[i].smallAvatar,
                        "online": JSON.parse(onlineUsers[i]).online,
                        "status": data[i].status,
                        "sender": data[i].sender,
                        "receiver": data[i].receiver,
                        "message": data[i].message,
                        "type": data[i].type
                    });
                } else {
                    result.push({
                        "RelationshipId": data[i].RelationshipId,
                        "lastMessage": data[i].lastMessage,
                        "seen": data[i].seen,
                        "updatedAt": data[i].updatedAt,
                        "id": data[i].id,
                        "nickname": data[i].nickname,
                        "username": data[i].username,
                        "smallAvatar": data[i].smallAvatar,
                        "online": false,
                        "status": data[i].status,
                        "sender": data[i].sender,
                        "receiver": data[i].receiver,
                        "message": data[i].message,
                        "type": data[i].type
                    });
                }
            }

            res.status(200).json({
                message: "OK",
                data: result
            });
        }
    } catch (err) {
        res.status(400).json({
            message: "Lỗi server ông ơi",
            error: err.message
        })
    }
}

const getNineFriends = async (req, res) => {
    const id = (Number)(req.query.id);
    try {
        const id = req.user.id;

        let list = await UserRela.sequelize.query(`
        select  
            "UserRela"."id" as "RelationshipId", "UserRela"."User1", "UserRela"."User2", "UserRela"."lastMessage", "UserRela"."seen", "UserRela"."updatedAt", "UserRela"."status",
            "Users"."id", "Users"."nickname", "Users"."username", "Users"."smallAvatar", 
            "Inbox"."message", "Inbox"."type", "Inbox"."sender"
        from "UserRela"
        left join "Users" on ("User1" = "Users"."id" or "User2" = "Users"."id") and "Users"."id" != ${id}
        left join "Inbox" on "lastMessage" = "Inbox"."id"
        WHERE ("UserRela"."User1" = ${id} OR "UserRela"."User2" = ${id})
        AND "UserRela"."status" = 1 
        limit 9;
    `)

        const data = list[0];

        let friendIds = data.map(fr => {
            if (fr.User1 === id)
                return `account-${fr.User2}`;
            else
                return `account-${fr.User1}`;
        })

        let onlineUsers;
        await redisClient.MGET(friendIds).then(res => {
            onlineUsers = res;
        }).catch(err => {
            if (err) throw new Error("Redis error: " + err);
        })

        let result = [];
        for (let i = 0; i < onlineUsers.length; i++) {

            if (onlineUsers[i]) {
                result.push({
                    "RelationshipId": data[i].RelationshipId,
                    "lastMessage": data[i].lastMessage,
                    "seen": data[i].seen,
                    "updatedAt": data[i].updatedAt,
                    "id": data[i].id,
                    "nickname": data[i].nickname,
                    "username": data[i].username,
                    "smallAvatar": data[i].smallAvatar,
                    "online": JSON.parse(onlineUsers[i]).online,
                    "status": data[i].status,
                    "sender": data[i].sender,
                    "receiver": data[i].receiver,
                    "message": data[i].message,
                    "type": data[i].type
                });
            } else {
                result.push({
                    "RelationshipId": data[i].RelationshipId,
                    "lastMessage": data[i].lastMessage,
                    "seen": data[i].seen,
                    "updatedAt": data[i].updatedAt,
                    "id": data[i].id,
                    "nickname": data[i].nickname,
                    "username": data[i].username,
                    "smallAvatar": data[i].smallAvatar,
                    "online": false,
                    "status": data[i].status,
                    "sender": data[i].sender,
                    "receiver": data[i].receiver,
                    "message": data[i].message,
                    "type": data[i].type
                });
            }
        }

        res.status(200).json({
            message: "OK",
            data: result
        });
    } catch (err) {
        res.status(400).json({
            message: "Lỗi server ông ơi",
            error: err.message
        })
    }
}

const getFriendRequest = async (req, res) => {
    try {
        const id = req.user.id;

        const list = await UserRela.findAll({
            attributes: ['id'],
            where: {
                status: 0,
                User2: id
            },
            include: [
                {
                    attributes: ['id', 'nickname', 'username', 'smallAvatar',],
                    model: Users,
                    as: "Sender"
                }
            ]
        });

        res.status(200).json({
            message: "Successfully get friend request",
            data: list
        });
    } catch (err) {
        res.status(400).json({
            message: "Lỗi server ông ơi",
            error: err.message
        })
    }
}

const getUnconfirmedRequest = async (req, res) => {
    try {
        const id = req.user.id;

        const list = await UserRela.findAll({
            attributes: ['id'],
            where: {
                status: 0,
                User1: id
            },
            include: [
                {
                    attributes: ['id', 'nickname', 'username', 'smallAvatar',],
                    model: Users,
                    as: "Receiver"
                }
            ]
        });

        res.status(200).json({
            message: "Successfully get friend request",
            data: list
        });
    } catch (err) {
        res.status(400).json({
            message: "Lỗi server ông ơi",
            error: err.message
        })
    }
}

module.exports = {
    addFriends,
    deleteFriend,
    getListFriend,
    getFriendRequest,
    getNineFriends,
    getUnconfirmedRequest,
    addChannelMessageRequest
}