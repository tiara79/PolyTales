//시퀄라이즈 컨벤션 : 엔터티: 대문자시작/테이블명: 복수형 소문자 카멜
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {
            userId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            oauthProvider: {
                type: DataTypes.ENUM("naver", "kakao", "google"),
                allowNull: false
            },
            oauthId: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            email: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            nickName: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            profImg: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        },
        {
            tableName: "users",
            timestamps: false,
            // indexes: [
            //     {
            //         unique: true,
            //         fields: ['oauthProvider', 'oauthId']
            //     }
            // ]
        }
    );

    User.associate = function (models) {
        // User has many Notes
        User.hasMany(models.Note, {
            foreignKey: "userId",
            as: "notes"
        });

        // User has many Progress records
        User.hasMany(models.Progress, {
            foreignKey: "userId",
            as: "progress"
        });

        // User has many Tutor chats
        User.hasMany(models.Tutor, {
            foreignKey: "userId",
            as: "tutorChats"
        });
    };
    return User;
};

