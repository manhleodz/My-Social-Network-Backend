const { Search, Users, Media, UserRela, Posts, Likes, sequelize } = require('../models');
const Sequelize = require('sequelize');
var Q = require("q");
const { Op } = require("sequelize");
require('dotenv').config();

const { list } = require('firebase/storage');
const Redis = require('redis');
const { raw } = require('body-parser');

const redisClient = Redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

const DEFAULT_EXPIRATION = 300;

redisClient.connect().catch(console.error);

if (!redisClient.isOpen) {
    redisClient.connect().catch(console.error);
};

const newSearch = async (req, res) => {

    try {
        const search = req.body.search;
        const UserId = req.user.id;

        if (search === undefined || search.trim().length === 0) {
            res.status(400).json({
                message: "What are you doing, mtf?"
            });
        } else {
            const checker = await Search.findOne({
                attributes: ['id', 'times'],
                where: {
                    body: search,
                    UserId: UserId
                }
            });

            if (checker) {
                await Search.update({ times: (Number)(checker.times + 1) }, { where: { id: checker.id } });
            } else {
                await Search.create({
                    body: search,
                    UserId: UserId
                })
            }

            res.status(200).json({
                message: "Updated successfully"
            });
        }

    } catch (err) {
        res.status(400).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};

const isIncluded = (id, myArr) => {
    for (let value of myArr) {
        if (id === value.User1 || id === value.User2) return {
            isIncluded: true,
            status: value.status,
            User1: value.User1,
            User2: value.User2
        };
    }
    return false;
}

async function statusRelationship(userId, listId, listUser) {
    const listCheck = await UserRela.findAll({
        attributes: ['User1', 'User2', 'status'],
        where: {
            [Op.or]: [
                {
                    [Op.and]: [
                        { User1: userId }, { User2: listId }
                    ]
                },
                {
                    [Op.and]: [
                        { User1: listId }, { User2: userId }
                    ]
                }
            ]
        }
    });

    const result = [];

    if (listCheck.length === 0) {
        for (let i = 0; i < listUser.length; i++) {
            result.push({
                id: listUser[i].id,
                username: listUser[i].username,
                smallAvatar: listUser[i].smallAvatar,
                nickname: listUser[i].nickname,
                isFriend: 0
            })
        }
    } else {

        for (let i = 0; i < listUser.length; i++) {
            if (listUser[i].id === userId) {
                result.push({
                    id: listUser[i].id,
                    username: listUser[i].username,
                    smallAvatar: listUser[i].smallAvatar,
                    nickname: listUser[i].nickname,
                    isFriend: 1
                })
            } else {

                const findStatus = isIncluded(listUser[i].id, listCheck);
                if (!findStatus) {
                    result.push({
                        id: listUser[i].id,
                        username: listUser[i].username,
                        smallAvatar: listUser[i].smallAvatar,
                        nickname: listUser[i].nickname,
                        isFriend: 0
                    })
                }
                else {
                    if (findStatus.status === 1) {
                        result.push({
                            id: listUser[i].id,
                            username: listUser[i].username,
                            smallAvatar: listUser[i].smallAvatar,
                            nickname: listUser[i].nickname,
                            isFriend: 3
                        })
                    } else if (findStatus.status === 2) {
                        result.push({
                            id: listUser[i].id,
                            username: listUser[i].username,
                            smallAvatar: listUser[i].smallAvatar,
                            nickname: listUser[i].nickname,
                            isFriend: 0
                        })
                    } else if (findStatus.status === 0) {
                        if (findStatus.User1 === userId) {
                            result.push({
                                id: listUser[i].id,
                                username: listUser[i].username,
                                smallAvatar: listUser[i].smallAvatar,
                                nickname: listUser[i].nickname,
                                isFriend: 1
                            })
                        } else if (userId === findStatus.User2) {
                            result.push({
                                id: listUser[i].id,
                                username: listUser[i].username,
                                smallAvatar: listUser[i].smallAvatar,
                                nickname: listUser[i].nickname,
                                isFriend: 2
                            })
                        }
                    }
                }
            }
        }
    }

    return result;
}

const topResult = async (req, res) => {

    const search = req.query.search;
    const userId = req.user.id;
    const page = req.query.page || 0;

    try {

        if (search === undefined || search.length === 0 || search.trim().length === 0) throw new Error("What are you doing, mtf?");

        let listUser = await redisClient.get(`top/search=${search}?page=${page}`);

        if (listUser && listUser.length > 0) {
            const data = JSON.parse(listUser);

            const listId = await data.map(user => user.id);
            const result = await statusRelationship(userId, listId, data).then((res) => res);

            if (result.length === 0) {
                res.status(204).json("success")
            } else {

                res.status(200).json({
                    message: "Success",
                    search,
                    data: result
                })
            }
        } else {
            const newList = await Users.sequelize.query(
                `
                    SELECT
                        id, username, "Users"."smallAvatar", nickname
                    FROM "Users" 
                    WHERE lower(unaccent(nickname)) ILIKE lower(unaccent('%${search}%')) ORDER BY "Users"."id" DESC LIMIT 6 OFFSET ${6 * page};
                `
            )

            const data = newList[0];

            if (data.length > 0) {

                const listId = await data.map(user => user.id);
                const result = await statusRelationship(userId, listId, data).then((res) => res);

                await redisClient.SETEX(`top/search=${search}?page=${page}`, DEFAULT_EXPIRATION, JSON.stringify(data));

                if (result.length === 0) {
                    res.status(204).json("success")
                } else {

                    res.status(200).json({
                        message: "Success",
                        search,
                        data: result
                    })
                }
            } else {
                res.status(204).json("success")
            }
        }
    } catch (err) {
        res.status(400).json({
            message: "Lỗi",
            error: err.message
        });
    }
};

const result = async (req, res) => {

    try {
        const search = req.query.search;
        const page = req.query.page;
        const userId = req.user.id;

        if (search === undefined || search.length === 0 || page.length === 0 || search.trim().length === 0) {
            res.status(400).json({
                message: "What are you doing, mtf?"
            });
        } else {
            let result = await redisClient.get(`search=${search}&page=${page}`);

            if (result && result.length > 0) {

                const data = JSON.parse(result);

                res.status(200).json({
                    search,
                    page: (Number)(page),
                    data
                });

            } else {

                let listUser = await redisClient.get(`top/search=${search}?page=0`);

                if (listUser) {

                    listUser = JSON.parse(listUser);

                    const listId = listUser.map(user => {
                        return user.id;
                    });

                    let stringId = listId[0];
                    for (let i = 1; i < listId.length; i++) {
                        stringId += `,${listId[i]}`;
                    }

                    result = await Posts.findAll({
                        where: Sequelize.literal(`"public" = true AND lower(unaccent("postText")) ILIKE lower(unaccent(:searchValue)) OR "UserId" IN (${stringId})`),
                        replacements: { searchValue: `%${search}%` },
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
                    })

                    if (result.length > 0) {
                        await redisClient.SETEX(`search=${search}&page=${page}`, DEFAULT_EXPIRATION, JSON.stringify(result));

                        res.status(200).json({
                            search,
                            page: (Number)(page),
                            data: result
                        });
                    }
                } else {
                    result = await Posts.findAll({
                        where: Sequelize.literal(`"public" = true AND lower(unaccent("postText")) ILIKE lower(unaccent(:searchValue))`),
                        replacements: { searchValue: `%${search}%` },
                        order: [['updatedAt', 'DESC']],
                        include: [{
                            attributes: ['username', 'nickname', 'smallAvatar'],
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
                        offset: page * 5,
                        limit: 5,
                    })

                    if (result.length > 0) {
                        await redisClient.SETEX(`search=${search}&page=${page}`, DEFAULT_EXPIRATION, JSON.stringify(result));

                        res.status(200).json({
                            search,
                            page: (Number)(page) + 1,
                            data: result
                        });

                    } else {
                        res.status(204).json("There are no search results");
                    }
                }
            }
        }
    } catch (err) {
        res.status(400).json({
            message: "Lỗi",
            error: err.message
        });
    }
};

const filterPost = async (req, res) => {
    try {

        const search = req.query.search;
        const page = req.query.page || 0;
        const userId = req.user.id;

        if (search === undefined || search.length === 0 || page.length === 0 || search.trim().length === 0) throw new Error("What the fuck???");

        // const result = await Posts.findAll({
        //     include: [{
        //         attributes: ['username', 'nickname', 'smallAvatar'],
        //         model: Users,
        //         where: Sequelize.literal('"confirm" = 1 OR (lower(unaccent("nickname")) ILIKE lower(unaccent(:searchValue)) AND "confirm" = 1)'),
        //         replacements: { searchValue: `%${search}%` },
        //         require: true
        //     }, {
        //         attributes: ['link', 'id', 'type', 'backgroundColor'],
        //         model: Media
        //     }, {
        //         attributes: ['UserId'],
        //         where: { UserId: userId },
        //         model: Likes,
        //         required: false,
        //     }],
        //     where: Sequelize.literal(`"public" = true AND (lower(unaccent("postText")) ILIKE lower(unaccent(:searchValue)))`),
        //     replacements: { searchValue: `%${search}%` },
        //     order: [['updatedAt', 'DESC']],
        //     offset: page * 5,
        //     limit: 5,
        // })

        let result;

        const rawQuery = `
        SELECT
            "Posts".*,
            "User"."id" AS "User.id",
            "User"."username" AS "User.username",
            "User"."nickname" AS "User.nickname",
            "User"."smallAvatar" AS "User.smallAvatar",
            "Media"."link" AS "Media.link",
            "Media"."id" AS "Media.id",
            "Media"."type" AS "Media.type",
            "Media"."backgroundColor" AS "Media.backgroundColor",
            "Likes"."id" AS "Likes.id",
            "Likes"."UserId" AS "Likes.UserId"
        FROM
            (
                SELECT
                    "Posts"."id",
                    "Posts"."UserId",
                    "Posts"."postText",
                    "Posts"."public",
                    "Posts"."likeNumber",
                    "Posts"."commentNumber",
                    "Posts"."sharedNumber",
                    "Posts"."createdAt",
                    "Posts"."updatedAt"
                FROM
                    "Posts" AS "Posts", "Users"
                WHERE
                    "Posts"."public" = true
                    AND (
                        lower(unaccent("postText")) ILIKE lower(unaccent('%m%'))
                        OR lower(unaccent("Users"."nickname")) ILIKE lower(unaccent('%m%'))
                    )
                GROUP BY
                    "Posts"."id"
                ORDER BY
                    "Posts"."updatedAt" DESC
                LIMIT
                    5 OFFSET 0
            ) AS "Posts"
            LEFT OUTER JOIN "Users" AS "User" ON "Posts"."UserId" = "User"."id"
            LEFT OUTER JOIN "Media" AS "Media" ON "Posts"."id" = "Media"."PostId"
            LEFT OUTER JOIN "Likes" AS "Likes" ON "Posts"."id" = "Likes"."PostId"
            AND "Likes"."UserId" = 5
        ORDER BY
            "Posts"."updatedAt" DESC;
    
        `;

        sequelize.query(rawQuery, { type: Sequelize.QueryTypes.SELECT, raw: true })
            .then((results) => {
                const jsonOutput = results.reduce((acc, row) => {
                    const { User, ...rest } = row;
                    console.log(row);
                    // const userKey = `${User.username}_${User.username}`; // Tạo key độc nhất cho mỗi User
                    // const userObj = acc[userKey] || { User };
                    // const updatedObj = Object.assign(userObj, rest);
                    // return { ...acc, [userKey]: updatedObj };
                }, {});
                // console.log((jsonOutput));
            })
            .catch((error) => {
                console.error(error);
            });

        if (result.length > 0) {
            await redisClient.SETEX(`search=${search}&page=${page}`, DEFAULT_EXPIRATION, JSON.stringify(result));

            res.status(200).json({
                search,
                page: (Number)(page) + 1,
                data: result
            });

        } else {
            res.status(204).json("There are no search results");
        }

    } catch (err) {
        res.status(400).json({
            message: "Lỗi",
            error: err.message
        });
    }
};

const deleteSearch = async (req, res) => {

    try {

        const id = req.params.id;
        await Search.destroy({ where: { id: id } });
        res.status(200).json({
            message: "Deleted successfully"
        });
    } catch (err) {
        res.status(400).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};

module.exports = {
    newSearch,
    deleteSearch,
    topResult,
    result,
    filterPost
}