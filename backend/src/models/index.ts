// Export all models for easy importing
export { User } from './User';
export { WorkZone } from './WorkZone';
export { AttendanceRecord } from './AttendanceRecord';
export { LocationHistory } from './LocationHistory';
export { BiometricEnrollment } from './BiometricEnrollment';
export { Shift } from './Shift';
export { UserShift } from './UserShift';
export { Overtime } from './Overtime';

// Initialize associations
import { User } from './User';
import { AttendanceRecord } from './AttendanceRecord';
import { LocationHistory } from './LocationHistory';
import { BiometricEnrollment } from './BiometricEnrollment';
import { Shift } from './Shift';
import { UserShift } from './UserShift';
import { Overtime } from './Overtime';

// Define all associations
AttendanceRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });
LocationHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
BiometricEnrollment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(AttendanceRecord, { foreignKey: 'userId', as: 'attendanceRecords' });
User.hasMany(LocationHistory, { foreignKey: 'userId', as: 'locationHistory' });
User.hasMany(BiometricEnrollment, { foreignKey: 'userId', as: 'biometricEnrollments' });

// Note: Shift, UserShift, and Overtime associations are defined in their respective model files


