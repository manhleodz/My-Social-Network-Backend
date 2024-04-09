
module.exports = (sequelize, DataTypes) => {
    const Posts = sequelize.define("Posts", {
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        postText: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        public: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        likeNumber: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        commentNumber: {
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
    }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    }, {

    }, {
        deletedAt: 'deletedAt',
        paranoid: true,
        timestamps: true
    });

    Posts.associate = (models) => {
        Posts.hasMany(models.Comments, {
            onDelete: "cascade",
            foreignKey: "PostId",
        });

        Posts.hasMany(models.Likes, {
            onDelete: "cascade",
            foreignKey: "PostId",
        });

        Posts.hasMany(models.Media, {
            onDelete: "cascade",
            foreignKey: "PostId",
        });

        Posts.hasMany(models.Saved, {
            onDelete: "cascade",
            foreignKey: "PostId",

        });

        Posts.hasMany(models.Shared, {
            onDelete: "cascade",
            foreignKey: "PostId",
        })

        Posts.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "UserId",
        })
    }

    return Posts;
};