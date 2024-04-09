
module.exports = (sequelize, DataTypes) => {
    const UserRela = sequelize.define("UserRela", {
        User1: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        User2: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        lastMessage: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        status: {                                     // 0: chờ xác nhận
            type: DataTypes.INTEGER,                  // 1: đã là bạn
            defaultValue: 0                           // 2: chưa là bạn nhưng có thể nhắn tin
        },
        seen: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
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

    UserRela.associate = (models) => {

        UserRela.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "User1",
            as: "Sender"
        });

        UserRela.belongsTo(models.Users, {
            onDelete: "cascade",
            foreignKey: "User2",
            as: "Receiver"
        });

        UserRela.hasMany(models.Inbox, {
            onDelete: "cascade",
            foreignKey: "RelationshipId",
        })

    }

    return UserRela;
};