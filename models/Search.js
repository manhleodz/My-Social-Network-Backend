
module.exports = (sequelize, DataTypes) => {
    const Search = sequelize.define("Search", {

        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        anotherId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        times: {
            type: DataTypes.INTEGER,
            defaultValue: 1
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

    Search.associate = (models) => {
        Search.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "UserId",
            as: "Owner"
        });

        Search.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "anotherId",
            as: "Result"
        });
    };

    return Search;
};