module.exports = (sequelize, DataTypes) => {
    const Comments = sequelize.define("Comments", {
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        PostId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        CommentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ReelId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        MediaId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        commentBody: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        likeNumber: {
            type: DataTypes.INTEGER,
            defaultValue: 0
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

    Comments.associate = (models) => {
        Comments.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "UserId",
        });
        Comments.belongsTo(models.Posts, {
            onDelete: "cascade",
            foreignKey: "PostId",
        });
        Comments.belongsTo(models.Comments, {
            onDelete: "cascade",
            foreignKey: "CommentId",
            as: "Reply"
        });
        Comments.hasMany(models.Likes, {
            onDelete: "cascade",
            foreignKey: "CommentId"
        });
        Comments.belongsTo(models.Reel, {
            onDelete: "cascade",
            foreignKey: "ReelId"
        });
        Comments.belongsTo(models.Media, {
            onDelete: "cascade",
            foreignKey: "MediaId"
        });
    };

    return Comments;
};