import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface WorkZoneAttributes {
  id: string;
  name: string;
  description?: string;
  zoneType: 'circle' | 'polygon';
  centerLat?: number;
  centerLng?: number;
  radius?: number; // in meters
  coordinates?: string; // JSON array for polygon coordinates
  isRestricted: boolean; // true for red zones
  department?: string; // null means all departments
  assignedUserIds?: string[]; // null means all users
  timeRestrictions?: string; // JSON for time-based restrictions
  bufferDistance: number; // in meters
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WorkZoneCreationAttributes extends Optional<WorkZoneAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class WorkZone extends Model<WorkZoneAttributes, WorkZoneCreationAttributes> implements WorkZoneAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public zoneType!: 'circle' | 'polygon';
  public centerLat?: number;
  public centerLng?: number;
  public radius?: number;
  public coordinates?: string;
  public isRestricted!: boolean;
  public department?: string;
  public assignedUserIds?: string[];
  public timeRestrictions?: string;
  public bufferDistance!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WorkZone.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    zoneType: {
      type: DataTypes.ENUM('circle', 'polygon'),
      allowNull: false
    },
    centerLat: {
      type: DataTypes.DECIMAL(10, 8)
    },
    centerLng: {
      type: DataTypes.DECIMAL(11, 8)
    },
    radius: {
      type: DataTypes.INTEGER // in meters
    },
    coordinates: {
      type: DataTypes.TEXT // JSON array of {lat, lng} pairs
    },
    isRestricted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    department: {
      type: DataTypes.STRING
    },
    assignedUserIds: {
      type: DataTypes.ARRAY(DataTypes.UUID)
    },
    timeRestrictions: {
      type: DataTypes.TEXT // JSON for time-based rules
    },
    bufferDistance: {
      type: DataTypes.INTEGER,
      defaultValue: 50 // default 50 meters
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'work_zones'
  }
);


