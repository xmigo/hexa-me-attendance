import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

interface AttendanceRecordAttributes {
  id: string;
  userId: string;
  type: 'checkin' | 'checkout';
  timestamp: Date;
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  workZoneId?: string;
  isWithinZone: boolean;
  biometricVerified: boolean;
  biometricType?: 'fingerprint' | 'face';
  notes?: string;
  isViolation: boolean;
  violationReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AttendanceRecordCreationAttributes extends Optional<AttendanceRecordAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class AttendanceRecord extends Model<AttendanceRecordAttributes, AttendanceRecordCreationAttributes> implements AttendanceRecordAttributes {
  public id!: string;
  public userId!: string;
  public type!: 'checkin' | 'checkout';
  public timestamp!: Date;
  public latitude!: number;
  public longitude!: number;
  public accuracy?: number;
  public address?: string;
  public workZoneId?: string;
  public isWithinZone!: boolean;
  public biometricVerified!: boolean;
  public biometricType?: 'fingerprint' | 'face';
  public notes?: string;
  public isViolation!: boolean;
  public violationReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AttendanceRecord.init(
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
    type: {
      type: DataTypes.ENUM('checkin', 'checkout'),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    accuracy: {
      type: DataTypes.FLOAT // in meters
    },
    address: {
      type: DataTypes.TEXT
    },
    workZoneId: {
      type: DataTypes.UUID,
      references: {
        model: 'work_zones',
        key: 'id'
      }
    },
    isWithinZone: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    biometricVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    biometricType: {
      type: DataTypes.ENUM('fingerprint', 'face')
    },
    notes: {
      type: DataTypes.TEXT
    },
    isViolation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    violationReason: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    tableName: 'attendance_records',
    underscored: true
  }
);

// Define associations
AttendanceRecord.belongsTo(User, { foreignKey: 'userId' });


