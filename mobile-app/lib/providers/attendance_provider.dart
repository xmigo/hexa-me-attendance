import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class AttendanceProvider with ChangeNotifier {
  Map<String, dynamic>? _todayAttendance;
  List<Map<String, dynamic>> _history = [];
  bool _isLoading = false;

  Map<String, dynamic>? get todayAttendance => _todayAttendance;
  List<Map<String, dynamic>> get history => _history;
  bool get isLoading => _isLoading;

  final Dio _dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));

  AttendanceProvider() {
    _dio.interceptors.add(InterceptorsWrapper(
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Token expired, try to refresh
          final refreshed = await _refreshToken();
          if (refreshed) {
            // Retry the request
            final opts = Options(
              method: error.requestOptions.method,
              headers: error.requestOptions.headers,
            );
            final clonedRequest = await _dio.request(
              error.requestOptions.path,
              options: opts,
              data: error.requestOptions.data,
              queryParameters: error.requestOptions.queryParameters,
            );
            return handler.resolve(clonedRequest);
          }
        }
        return handler.next(error);
      },
    ));
  }

  Future<bool> _refreshToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString('refreshToken');

      if (refreshToken == null) return false;

      final response = await Dio(BaseOptions(baseUrl: ApiConfig.baseUrl)).post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200) {
        final data = response.data['data'];
        await prefs.setString('token', data['token']);
        await prefs.setString('refreshToken', data['refreshToken']);
        _dio.options.headers['Authorization'] = 'Bearer ${data['token']}';
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<void> _setAuthHeader() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token != null) {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    }
  }

  Future<bool> checkIn(double latitude, double longitude, double accuracy,
      {String? biometricType, bool biometricVerified = false}) async {
    await _setAuthHeader();
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _dio.post(
        ApiConfig.checkinEndpoint,
        data: {
          'latitude': latitude,
          'longitude': longitude,
          'accuracy': accuracy,
          'biometricType': biometricType,
          'biometricVerified': biometricVerified,
        },
      );

      if (response.statusCode == 201) {
        await loadTodayAttendance();
        _isLoading = false;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> checkOut(double latitude, double longitude, double accuracy,
      {String? biometricType, bool biometricVerified = false, String? notes}) async {
    await _setAuthHeader();
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _dio.post(
        ApiConfig.checkoutEndpoint,
        data: {
          'latitude': latitude,
          'longitude': longitude,
          'accuracy': accuracy,
          'biometricType': biometricType,
          'biometricVerified': biometricVerified,
          'notes': notes,
        },
      );

      if (response.statusCode == 201) {
        await loadTodayAttendance();
        _isLoading = false;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadTodayAttendance() async {
    await _setAuthHeader();
    try {
      final response = await _dio.get(ApiConfig.todayAttendanceEndpoint);
      if (response.statusCode == 200) {
        _todayAttendance = response.data['data'];
        notifyListeners();
      }
    } catch (e) {
      // Handle error
    }
  }

  Future<void> loadHistory({DateTime? startDate, DateTime? endDate}) async {
    await _setAuthHeader();
    _isLoading = true;
    notifyListeners();

    try {
      final queryParams = <String, dynamic>{};
      if (startDate != null) {
        queryParams['startDate'] = startDate.toIso8601String();
      }
      if (endDate != null) {
        queryParams['endDate'] = endDate.toIso8601String();
      }

      final response = await _dio.get(
        ApiConfig.attendanceHistoryEndpoint,
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        _history = List<Map<String, dynamic>>.from(response.data['data']['records']);
        _isLoading = false;
        notifyListeners();
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
    }
  }
}


