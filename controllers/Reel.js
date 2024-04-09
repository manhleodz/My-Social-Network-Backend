const { Reel, Users } = require('../models');

const getAll = async (req, res, next) => {

    try {

        const list = await Reel.findAll({
            include: Users
        });
        res.status(200).json(list);
    } catch (err) {
        res.status(400).json(err);
    }
}

const getByUser = async (req, res, next) => {

    try {

        const userId = req.params.userId;
        const list = await Reel.findAll({
            where: { UserId: userId },
            include: Users
        });
        res.status(200).json(list);
    } catch (err) {
        res.status(400).json(err);
    }
}

const getById = async (req, res, next) => {

    try {

        const id = req.params.id;
        const reel = await Reel.findByPk(id, {include: Users});
        res.status(200).json(reel);
    } catch (err) {
        res.status(400).json(err);
    }
}

const deleteById = async (req, res) => {

    try {

        const id = req.params.id;
        await Reel.destroy({
            where: {
                id: id,
            }
        })
        res.status(200).json("success");

    } catch (err) {
        res.status(400).json(err);
    }
}

const post = async (req, res) => {

    try {

        const data = req.body;
        await Reel.create(data)
        res.status(200).json("success");
    } catch (err) {
        res.status(400).json(err);
    }
}

module.exports = {
    getAll,
    getById,
    getByUser,
    deleteById,
    post
}