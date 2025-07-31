
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define( "users", {
            userid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            oauthprovider: {
                type: DataTypes.ENUM("naver", "kakao", "google"),
                allowNull: false
            },
            oauthid: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            email: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            nickname: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            profimg: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            // 새로 추가된 필드들
            status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                isIn: [[1, 2, 3]]  // 1:정상, 2:경고, 3:강제삭제
            }
            },
            role: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2,
            validate: {
                isIn: [[1, 2]]  // 1:관리자, 2:회원
            }
            },
            plan: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                isIn: [[1, 2, 3]]  // 1:무료, 2:스탠다드, 3:프리미엄
            }
            },
            pay: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                isIn: [[1, 2, 3]]
            }
            } // 1:카카오페이, 2:네이버페이, 3: 토스페이
        },
        {
            tableName: "users",
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ['oauthprovider', 'oauthid']
                }
            ]
        }
    );

    User.associate = function (models) {
        // User has many Notes
        User.hasMany(models.Note, {
            foreignKey: "userid",
            as: "notes"
        });

        // User has many Progress records
        User.hasMany(models.Progress, {
            foreignKey: "userid",
            as: "progress"
        });

        // User has many Tutor chats
        User.hasMany(models.Tutor, {
            foreignKey: "userid",
            as: "tutorChats"
        });
    };
    return User;
};

