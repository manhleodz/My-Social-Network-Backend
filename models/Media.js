module.exports = (sequelize, DataTypes) => {
    const Media = sequelize.define("Media", {
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        link: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        ReelId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        PostId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        backgroundColor: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        type: {
            type: DataTypes.SMALLINT,
            allowNull: false
        },
        likeNumber: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        sharedNumber: {
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
    });

    Media.associate = (models) => {
        Media.belongsTo(models.Posts, {
            onDelete: "cascade",
            foreignKey: "PostId"
        });
        Media.belongsTo(models.Reel, {
            onDelete: "cascade",
            foreignKey: "ReelId"
        });
        Media.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "UserId"
        });
        Media.hasMany(models.Saved, {
            onDelete: "cascade",
            foreignKey: "MediaId"
        })
        Media.hasMany(models.Comments, {
            onDelete: "cascade",
            foreignKey: "MediaId"
        })
        Media.hasMany(models.Shared, {
            onDelete: "cascade",
            foreignKey: "MediaId"
        })
        Media.hasMany(models.Saved, {
            onDelete: "cascade",
            foreignKey: "MediaId"
        })
    }
    return Media;
};