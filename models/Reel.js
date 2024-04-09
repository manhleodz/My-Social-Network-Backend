module.exports = (sequelize, DataTypes) => {
    const Reel = sequelize.define("Reel", {
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        introduction: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        public: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        likeNumber: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        sharedNumber: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        seen: {
            type: DataTypes.STRING,
            allowNull: true,
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
    });

    Reel.associate = (models) => {
        Reel.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "UserId",
        });

        Reel.hasOne(models.Media, {
            onDelete: "cascade",
            foreignKey: "ReelId",
        });
    };
    return Reel;
};