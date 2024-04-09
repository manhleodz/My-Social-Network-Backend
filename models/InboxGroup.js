module.exports = (sequelize, DataTypes) => {
    const InboxGroup = sequelize.define("InboxGroup", {
        sender: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ChannelId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING(20),   // text, image, video, mp4, gif, notification
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

    InboxGroup.associate = (models) => {

        InboxGroup.belongsTo(models.ChannelMembers, {
            onDelete: "cascade",
            foreignKey: 'sender',
        });

        InboxGroup.belongsTo(models.Channels, {
            onDelete: "cascade",
            foreignKey: "ChannelId",
        });

    };

    return InboxGroup;
};