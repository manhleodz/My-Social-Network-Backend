module.exports = (sequelize, DataTypes) => {
    const Saved = sequelize.define("Saved", {
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

    Saved.associate = (models) => {
        Saved.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "UserId"
        });
        Saved.belongsTo(models.Posts, {
            onDelete: "cascade",
            foreignKey: "PostId",
        });
        Saved.belongsTo(models.Reel, {
            onDelete: "cascade",
            foreignKey: "ReelId",
        });
        Saved.belongsTo(models.Media, {
            onDelete: "cascade",
            foreignKey: "MediaId",
        });
        Saved.belongsTo(models.Reel, {
            onDelete: "cascade",
            foreignKey: "ReelId"
        });
    }

    return Saved;
};