import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Shift } from './Shift';

export class UserShift extends Model {
  public id!: string;
  public userId!: string;
  public shiftId!: string;
  public effectiveFrom!: Date;
  public effectiveTo?: Date;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

UserShift.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    shiftId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'shifts',
        key: 'id'
      }
    },
    effectiveFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    effectiveTo: {
      type: DataTypes.DATE
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'user_shifts',
    underscored: true
  }
);

// Define associations
UserShift.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserShift.belongsTo(Shift, { foreignKey: 'shiftId', as: 'shift' });
User.hasMany(UserShift, { foreignKey: 'userId', as: 'userShifts' });
Shift.hasMany(UserShift, { foreignKey: 'shiftId', as: 'userShifts' });
