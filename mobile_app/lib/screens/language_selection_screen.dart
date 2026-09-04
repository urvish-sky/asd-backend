import 'package:flutter/material.dart';
import 'package:flutter_3d_controller/flutter_3d_controller.dart';
import '../models/patient_profile.dart';
import '../widgets/bunny_3d_widget.dart';
import '../services/tts_service.dart';
import 'patient_registration_screen.dart';

class LanguageSelectionScreen extends StatefulWidget {
  final PatientProfile profile;

  const LanguageSelectionScreen({Key? key, required this.profile}) : super(key: key);

  @override
  State<LanguageSelectionScreen> createState() => _LanguageSelectionScreenState();
}

class _LanguageSelectionScreenState extends State<LanguageSelectionScreen> {
  final Flutter3DController _bunnyController = Flutter3DController();
  late String _selectedLang;

  @override
  void initState() {
    super.initState();
    _selectedLang = widget.profile.selectedLanguage;
    _speakGreeting();
  }

  void _speakGreeting() {
    TTSService().speak(
      _selectedLang == 'hi'
          ? "नमस्ते! कृपया अपनी पसंदीदा भाषा चुनें।"
          : "Welcome! Please choose your preferred language.",
      language: _selectedLang,
    );
  }

  void _selectLanguage(String lang) {
    setState(() {
      _selectedLang = lang;
      widget.profile.selectedLanguage = lang;
    });
    _speakGreeting();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFC),
      appBar: AppBar(
        title: const Text(
          "Pediatric ASD Screening",
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A202C),
        elevation: 0.5,
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 8),

              // Title Header
              const Text(
                "Welcome to Parent Portal",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF2D3748),
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                "Select your language to begin guided screening with Bunny",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Color(0xFF718096)),
              ),
              const SizedBox(height: 20),

              // Screen 1: 3D Controller Bunny Model
              Bunny3DWidget(
                controller: _bunnyController,
                height: 260,
                animationToPlay: 'idle',
              ),
              const SizedBox(height: 28),

              // Two Large Localized Buttons: "English" and "हिंदी"
              Row(
                children: [
                  Expanded(
                    child: _buildLanguageCard(
                      label: "English",
                      sublabel: "Standard Guide",
                      code: "en",
                      isSelected: _selectedLang == 'en',
                      icon: "🇬🇧",
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildLanguageCard(
                      label: "हिंदी",
                      sublabel: "मार्गदर्शिका",
                      code: "hi",
                      isSelected: _selectedLang == 'hi',
                      icon: "🇮🇳",
                    ),
                  ),
                ],
              ),

              const Spacer(),

              // Institutional Attribution Footer
              const Text(
                "Developed at IIT BHU • Dept. of Electrical Engineering",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 10, color: Color(0xFFA0AEC0)),
              ),
              const SizedBox(height: 12),

              // Continue Button
              ElevatedButton(
                onPressed: () {
                  TTSService().stop();
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => PatientRegistrationScreen(profile: widget.profile),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF319795),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 2,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _selectedLang == 'hi' ? "आगे बढ़ें (Continue)" : "Continue Setup",
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.arrow_forward_rounded, size: 20),
                  ],
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLanguageCard({
    required String label,
    required String sublabel,
    required String code,
    required bool isSelected,
    required String icon,
  }) {
    return InkWell(
      onTap: () => _selectLanguage(code),
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFE6FFFA) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF319795) : const Color(0xFFE2E8F0),
            width: isSelected ? 2.5 : 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: isSelected
                  ? const Color(0xFF319795).withOpacity(0.15)
                  : Colors.black.withOpacity(0.03),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Text(icon, style: const TextStyle(fontSize: 32)),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isSelected ? const Color(0xFF234E52) : const Color(0xFF2D3748),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              sublabel,
              style: TextStyle(
                fontSize: 12,
                color: isSelected ? const Color(0xFF319795) : const Color(0xFF718096),
              ),
            ),
            const SizedBox(height: 10),
            Icon(
              isSelected ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
              color: isSelected ? const Color(0xFF319795) : const Color(0xFFCBD5E0),
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
