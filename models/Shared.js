module.exports = (sequelize, DataTypes) => {
    const Shared = sequelize.define("Shared", {
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        PostId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        MediaId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ReelId: {
            type: DataTypes.INTEGER,
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

    Shared.associate = (models) => {
        Shared.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "UserId"
        });
        Shared.belongsTo(models.Posts, {
            onDelete: "cascade",
            foreignKey: "PostId"
        });
        Shared.belongsTo(models.Media, {
            onDelete: "cascade",
            foreignKey: "MediaId"
        });
        Shared.belongsTo(models.Reel, {
            onDelete: "cascade",
            foreignKey: "ReelId"
        });
    }

    return Shared;
};