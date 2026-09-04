import 'package:flutter/material.dart';
import 'models/patient_profile.dart';
import 'screens/language_selection_screen.dart';
import 'services/tts_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Initialize TTS early
  await TTSService().init();

  runApp(const ParentASDApp());
}

class ParentASDApp extends StatelessWidget {
  const ParentASDApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pediatric ASD Screening - Parent Portal',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Inter',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF319795), // Medical Teal
          primary: const Color(0xFF319795),
          secondary: const Color(0xFF2B6CB0), // Clinical Blue
          surface: Colors.white,
          background: const Color(0xFFF7FAFC),
        ),
        scaffoldBackgroundColor: const Color(0xFFF7FAFC),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0.5,
          iconTheme: IconThemeData(color: Color(0xFF2D3748)),
          titleTextStyle: TextStyle(
            color: Color(0xFF2D3748),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      home: LanguageSelectionScreen(
        profile: PatientProfile(),
      ),
    );
  }
}
