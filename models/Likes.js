module.exports = (sequelize, DataTypes) => {
    const Likes = sequelize.define("Likes", {
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

    Likes.associate = (models) => {
        Likes.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "UserId"
        });

        Likes.belongsTo(models.Posts, {
            onDelete: "cascade",
            foreignKey: "PostId"
        });

        Likes.belongsTo(models.Media, {
            onDelete: "cascade",
            foreignKey: "MediaId"
        });

        Likes.belongsTo(models.Comments, {
            onDelete: "cascade",
            foreignKey: "CommentId"
        });

        Likes.belongsTo(models.Reel, {
            onDelete: "cascade",
            foreignKey: "ReelId"
        });

        Likes.belongsTo(models.Story, {
            onDelete: "cascade",
            foreignKey: "StoryId"
        });
    }

    return Likes;
};