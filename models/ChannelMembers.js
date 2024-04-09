module.exports = (sequelize, DataTypes) => {
    const ChannelMembers = sequelize.define("ChannelMembers", {
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ChannelId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: true
        },
        role: {
            type: DataTypes.INTEGER, //# admin 1, user 2
            allowNull: false
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

    ChannelMembers.associate = (models) => {

        ChannelMembers.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "UserId",
        });

        ChannelMembers.belongsTo(models.Channels, {
            onDelete: "cascade",
            foreignKey: "ChannelId"
        });

        ChannelMembers.hasMany(models.InboxGroup, {
            onDelete: "cascade",
            foreignKey: "sender",
        })

    };

    return ChannelMembers;
};