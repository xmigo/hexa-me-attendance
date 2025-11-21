import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId?: string;
  department?: string;
  jobTitle?: string;
  role: 'admin' | 'manager' | 'hr' | 'employee';
  isActive: boolean;
  profilePhoto?: string;
  startDate?: Date;
  emergencyContact?: string;
  biometricEnrolled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public phone?: string;
  public employeeId?: string;
  public department?: string;
  public jobTitle?: string;
  public role!: 'admin' | 'manager' | 'hr' | 'employee';
  public isActive!: boolean;
  public profilePhoto?: string;
  public startDate?: Date;
  public emergencyContact?: string;
  public biometricEnrolled!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING
    },
    employeeId: {
      type: DataTypes.STRING,
      unique: true
    },
    department: {
      type: DataTypes.STRING
    },
    jobTitle: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'hr', 'employee'),
      defaultValue: 'employee',
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    profilePhoto: {
      type: DataTypes.STRING
    },
    startDate: {
      type: DataTypes.DATE
    },
    emergencyContact: {
      type: DataTypes.STRING
    },
    biometricEnrolled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  }
);


