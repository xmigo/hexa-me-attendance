import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

interface LocationHistoryAttributes {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LocationHistoryCreationAttributes extends Optional<LocationHistoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class LocationHistory extends Model<LocationHistoryAttributes, LocationHistoryCreationAttributes> implements LocationHistoryAttributes {
  public id!: string;
  public userId!: string;
  public latitude!: number;
  public longitude!: number;
  public accuracy?: number;
  public speed?: number;
  public heading?: number;
  public timestamp!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LocationHistory.init(
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
    speed: {
      type: DataTypes.DECIMAL(8, 2) // in m/s
    },
    heading: {
      type: DataTypes.DECIMAL(5, 2) // in degrees
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'location_history',
    underscored: true
  }
);

LocationHistory.belongsTo(User, { foreignKey: 'userId' });


