import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:local_auth/local_auth.dart';
import '../providers/attendance_provider.dart';
import '../providers/location_provider.dart';

class CheckInScreen extends StatefulWidget {
  const CheckInScreen({super.key});

  @override
  State<CheckInScreen> createState() => _CheckInScreenState();
}

class _CheckInScreenState extends State<CheckInScreen> {
  final LocalAuthentication _localAuth = LocalAuthentication();
  bool _isAuthenticating = false;
  String? _biometricType;

  Future<void> _authenticateWithBiometric() async {
    setState(() {
      _isAuthenticating = true;
    });

    try {
      final bool canCheckBiometrics = await _localAuth.canCheckBiometrics;
      if (!canCheckBiometrics) {
        _showError('Biometric authentication not available');
        return;
      }

      final List<BiometricType> availableBiometrics =
          await _localAuth.getAvailableBiometrics();

      if (availableBiometrics.isEmpty) {
        _showError('No biometrics available');
        return;
      }

      final bool didAuthenticate = await _localAuth.authenticate(
        localizedReason: 'Please authenticate to check in/out',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );

      if (didAuthenticate) {
        _biometricType = availableBiometrics.contains(BiometricType.face)
            ? 'face'
            : 'fingerprint';
        await _performCheckIn();
      } else {
        _showError('Authentication failed');
      }
    } catch (e) {
      _showError('Error: $e');
    } finally {
      setState(() {
        _isAuthenticating = false;
      });
    }
  }

  Future<void> _performCheckIn() async {
    final locationProvider = Provider.of<LocationProvider>(context, listen: false);
    final attendanceProvider = Provider.of<AttendanceProvider>(context, listen: false);

    // Get current location
    await locationProvider.getCurrentLocation();

    if (locationProvider.currentPosition == null) {
      _showError('Could not get location');
      return;
    }

    final position = locationProvider.currentPosition!;
    final today = attendanceProvider.todayAttendance;
    final isCheckedIn = today?['isCheckedIn'] ?? false;

    final success = isCheckedIn
        ? await attendanceProvider.checkOut(
            position.latitude,
            position.longitude,
            position.accuracy ?? 0,
            biometricType: _biometricType,
            biometricVerified: true,
          )
        : await attendanceProvider.checkIn(
            position.latitude,
            position.longitude,
            position.accuracy ?? 0,
            biometricType: _biometricType,
            biometricVerified: true,
          );

    if (success && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(isCheckedIn ? 'Checked out successfully' : 'Checked in successfully'),
          backgroundColor: Colors.green,
        ),
      );
    } else if (mounted) {
      _showError('Check-in/out failed');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Check In/Out'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.fingerprint,
                size: 100,
                color: Colors.blue,
              ),
              const SizedBox(height: 24),
              const Text(
                'Authenticate to continue',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 48),
              if (_isAuthenticating)
                const CircularProgressIndicator()
              else
                ElevatedButton.icon(
                  onPressed: _authenticateWithBiometric,
                  icon: const Icon(Icons.fingerprint),
                  label: const Text('Authenticate'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 16,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}


