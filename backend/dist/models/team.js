"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Team extends sequelize_1.Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            teamNumber: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                unique: true,
            },
            autoCanScoreBalls: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
            },
            estimatedTotalPoints: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            pointContributionPercent: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            ballsPerCycle: {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: true,
            },
            cyclesPerMatch: {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: true,
            },
            maxBallCapacity: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            shootingTypes: {
                type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
                defaultValue: [],
                get() {
                    const rawValue = this.getDataValue('shootingTypes');
                    return rawValue ? rawValue : [];
                },
                set(value) {
                    if (typeof value === 'string') {
                        try {
                            this.setDataValue('shootingTypes', JSON.parse(value));
                        }
                        catch (_a) {
                            this.setDataValue('shootingTypes', []);
                        }
                    }
                    else if (Array.isArray(value)) {
                        this.setDataValue('shootingTypes', value);
                    }
                    else {
                        this.setDataValue('shootingTypes', []);
                    }
                },
            },
            shootingLocationType: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                defaultValue: 'single',
            },
            shootingLocationNotes: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            autoStartingPosition: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            endgameType: {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: 'none',
            },
            robotWidth: {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: true,
            },
            robotLength: {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: true,
            },
            robotHeight: {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: true,
            },
            robotWeight: {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: true,
            },
            drivetrainType: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            notes: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            imageUrl: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            mustStartSpecificPosition: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
            }
        }, {
            sequelize,
            modelName: 'Team',
            tableName: 'teams'
        });
    }
}
exports.default = Team;
//# sourceMappingURL=team.js.map