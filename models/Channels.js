module.exports = (sequelize, DataTypes) => {
    const Channels = sequelize.define("Channels", {
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        avatar: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        background: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        public: {
            type: DataTypes.BOOLEAN,
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
        },
        lastMessage: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    });

    Channels.associate = (models) => {
        Channels.hasMany(models.InboxGroup, {
            onDelete: "cascade",
            foreignKey: "ChannelId"
        })

        Channels.hasMany(models.ChannelMembers, {
            onDelete: "cascade",
            foreignKey: "ChannelId"
        })

    };

    return Channels;
};