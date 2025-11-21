import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export class Overtime extends Model {
  public id!: string;
  public userId!: string;
  public date!: Date;
  public regularHours!: number;
  public overtimeHours!: number;
  public totalHours!: number;
  public overtimeMultiplier!: number;
  public status!: 'pending' | 'approved' | 'rejected';
  public approvedBy?: string;
  public approvedAt?: Date;
  public notes?: string;
  public checkInTime!: Date;
  public checkOutTime!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Overtime.init(
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    regularHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    overtimeHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    overtimeMultiplier: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 1.5
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    approvedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approvedAt: {
      type: DataTypes.DATE
    },
    notes: {
      type: DataTypes.TEXT
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    checkOutTime: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'overtime',
    underscored: true,
    indexes: [
      {
        fields: ['user_id', 'date']
      },
      {
        fields: ['status']
      }
    ]
  }
);

// Define associations
Overtime.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Overtime.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
