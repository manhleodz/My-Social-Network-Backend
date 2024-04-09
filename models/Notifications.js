module.exports = (sequelize, DataTypes) => {
    const Notifications = sequelize.define("Notifications", {
        sender: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        receiver: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        seen: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        type: {
            type: DataTypes.STRING(20),   // friend, post, account
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

    Notifications.associate = (models) => {

        Notifications.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "sender",
            as: "Sender"
        });

        Notifications.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "receiver",
            as: "Receiver"
        });

    };

    return Notifications;
};