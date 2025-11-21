import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

interface BiometricEnrollmentAttributes {
  id: string;
  userId: string;
  biometricType: 'fingerprint' | 'face';
  template: string; // Encrypted biometric template
  qualityScore?: number;
  enrolledAt: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BiometricEnrollmentCreationAttributes extends Optional<BiometricEnrollmentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class BiometricEnrollment extends Model<BiometricEnrollmentAttributes, BiometricEnrollmentCreationAttributes> implements BiometricEnrollmentAttributes {
  public id!: string;
  public userId!: string;
  public biometricType!: 'fingerprint' | 'face';
  public template!: string;
  public qualityScore?: number;
  public enrolledAt!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BiometricEnrollment.init(
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
    biometricType: {
      type: DataTypes.ENUM('fingerprint', 'face'),
      allowNull: false
    },
    template: {
      type: DataTypes.TEXT, // Encrypted biometric template
      allowNull: false
    },
    qualityScore: {
      type: DataTypes.DECIMAL(5, 2) // 0-100
    },
    enrolledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'biometric_enrollments',
    underscored: true
  }
);

BiometricEnrollment.belongsTo(User, { foreignKey: 'userId' });


