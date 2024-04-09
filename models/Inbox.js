module.exports = (sequelize, DataTypes) => {
    const Inbox = sequelize.define("Inbox", {
        sender: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        receiver: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        RelationshipId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING(20),   // text, image, video, mp4, gif
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('now'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('now'),
        }
    }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    });

    Inbox.associate = (models) => {
        Inbox.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "sender",
            as: "Sender"
        });

        Inbox.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "receiver",
            as: "Receiver"
        });

        Inbox.belongsTo(models.UserRela, {
            onDelete: "cascade",
            foreignKey: "RelationshipId",
        });

    };

    return Inbox;
};