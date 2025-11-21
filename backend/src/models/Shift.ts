import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Shift extends Model {
  public id!: string;
  public name!: string;
  public description?: string;
  public startTime!: string; // HH:MM format
  public endTime!: string; // HH:MM format
  public workDays!: string[]; // ['monday', 'tuesday', etc.]
  public color?: string; // For UI display
  public isActive!: boolean;
  public allowedLateMinutes!: number;
  public allowedEarlyDepartureMinutes!: number;
  public overtimeMultiplier!: number; // 1.5 for 1.5x pay
  public createdAt!: Date;
  public updatedAt!: Date;
}

Shift.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    },
    workDays: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#3B82F6'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    allowedLateMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 15
    },
    allowedEarlyDepartureMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 15
    },
    overtimeMultiplier: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 1.5
    }
  },
  {
    sequelize,
    tableName: 'shifts',
    underscored: true
  }
);
