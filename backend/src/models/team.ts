import { Model, DataTypes, Sequelize } from 'sequelize';

class Team extends Model {
  public id!: number;
  public teamNumber!: number;
  public autoCanScoreBalls!: boolean;
  public estimatedTotalPoints!: number | null;
  public pointContributionPercent!: number | null;
  public ballsPerCycle!: number | null;
  public cyclesPerMatch!: number | null;
  public maxBallCapacity!: number | null;
  public shootingTypes!: string[];
  public shootingLocationType!: string;
  public shootingLocationNotes!: string | null;
  public autoStartingPosition!: string;
  public endgameType!: string;
  public robotWidth!: number;
  public robotLength!: number;
  public robotHeight!: number;
  public robotWeight!: number;
  public drivetrainType!: string;
  public notes!: string;
  public imageUrl!: string;
  public mustStartSpecificPosition!: boolean;

  public static initialize(sequelize: Sequelize) {
    this.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      teamNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      autoCanScoreBalls: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      estimatedTotalPoints: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pointContributionPercent: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ballsPerCycle: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      cyclesPerMatch: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      maxBallCapacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      shootingTypes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        get() {
          const rawValue = this.getDataValue('shootingTypes');
          return rawValue ? rawValue : [];
        },
        set(value: any) {
          if (typeof value === 'string') {
            try {
              this.setDataValue('shootingTypes', JSON.parse(value));
            } catch {
              this.setDataValue('shootingTypes', []);
            }
          } else if (Array.isArray(value)) {
            this.setDataValue('shootingTypes', value);
          } else {
            this.setDataValue('shootingTypes', []);
          }
        },
      },
      shootingLocationType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'single',
      },
      shootingLocationNotes: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      autoStartingPosition: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      endgameType: {
        type: DataTypes.STRING,
        defaultValue: 'none',
      },
      robotWidth: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      robotLength: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      robotHeight: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      robotWeight: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      drivetrainType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mustStartSpecificPosition: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
    }, {
      sequelize,
      modelName: 'Team',
      tableName: 'teams'
    });
  }
}

export default Team; 
