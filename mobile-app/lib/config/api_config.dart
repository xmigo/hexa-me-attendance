class ApiConfig {
  // For Android Emulator, use 10.0.2.2 instead of localhost
  // For Physical Device, use your computer's IP address
  // static const String baseUrl = 'http://10.0.2.2:3000/api';
  // For physical device on same network, use your computer's IP:
  static const String baseUrl = 'http://192.168.8.136:3000/api';
  // For production, use your server URL:
  // static const String baseUrl = 'https://your-api-domain.com/api';
  
  static const String loginEndpoint = '/auth/login';
  static const String checkinEndpoint = '/attendance/checkin';
  static const String checkoutEndpoint = '/attendance/checkout';
  static const String todayAttendanceEndpoint = '/attendance/today';
  static const String attendanceHistoryEndpoint = '/attendance/history';
  static const String geofenceEndpoint = '/geofence';
  static const String locationEndpoint = '/location';
}

