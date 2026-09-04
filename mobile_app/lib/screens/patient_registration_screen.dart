import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_3d_controller/flutter_3d_controller.dart';
import 'package:image_picker/image_picker.dart';
import '../models/patient_profile.dart';
import '../widgets/bunny_3d_widget.dart';
import '../services/tts_service.dart';
import 'recording_guide_screen.dart';

class PatientRegistrationScreen extends StatefulWidget {
  final PatientProfile profile;

  const PatientRegistrationScreen({Key? key, required this.profile}) : super(key: key);

  @override
  State<PatientRegistrationScreen> createState() => _PatientRegistrationScreenState();
}

class _PatientRegistrationScreenState extends State<PatientRegistrationScreen> {
  final Flutter3DController _bunnyController = Flutter3DController();
  final ImagePicker _picker = ImagePicker();

  late TextEditingController _nameController;
  late TextEditingController _ageController;
  late String _sex;
  String? _photoPath;
  bool _isCameraActive = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.profile.childName);
    _ageController = TextEditingController(text: widget.profile.ageInMonths.toString());
    _sex = widget.profile.biologicalSex;
    _photoPath = widget.profile.photoPath;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _triggerBunnyTalkingAndAudio();
    });
  }

  void _triggerBunnyTalkingAndAudio() {
    // Screen 2: Trigger the bunny to play talking animation
    try {
      _bunnyController.playAnimation(animationName: 'talk');
    } catch (_) {}

    // Screen 2: Output TTS speech
    final text = widget.profile.selectedLanguage == 'hi'
        ? "नमस्ते! आइए एक प्रोफाइल बनाते हैं! क्या आप अपने बच्चे की एक त्वरित तस्वीर खींच सकते हैं?"
        : "Hi! Let's set up a profile! Can you snap a quick photo of your child?";

    TTSService().speak(text, language: widget.profile.selectedLanguage);
  }

  Future<void> _takeChildPhoto() async {
    setState(() => _isCameraActive = true);
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.front,
        maxWidth: 1280,
        maxHeight: 1280,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _photoPath = image.path;
          widget.profile.photoPath = image.path;
        });

        // Reassuring feedback
        final successMsg = widget.profile.selectedLanguage == 'hi'
            ? "बहुत बढ़िया! तस्वीर सुरक्षित हो गई है।"
            : "Awesome photo! Profile picture set.";
        TTSService().speak(successMsg, language: widget.profile.selectedLanguage);
      }
    } catch (e) {
      debugPrint("Camera error: $e");
    } finally {
      setState(() => _isCameraActive = false);
    }
  }

  void _proceedToRecordingGuide() {
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter the child's name.")),
      );
      return;
    }

    final age = int.tryParse(_ageController.text) ?? 24;
    widget.profile.childName = _nameController.text.trim();
    widget.profile.ageInMonths = age;
    widget.profile.biologicalSex = _sex;
    widget.profile.photoPath = _photoPath;

    TTSService().stop();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => RecordingGuideScreen(profile: widget.profile),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _ageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isHi = widget.profile.selectedLanguage == 'hi';

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFC),
      appBar: AppBar(
        title: Text(
          isHi ? "बच्चे का पंजीकरण" : "Patient Registration",
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A202C),
        elevation: 0.5,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Screen 2: 3D Bunny with Talking Animation
              Bunny3DWidget(
                controller: _bunnyController,
                height: 200,
                animationToPlay: 'talk',
              ),
              const SizedBox(height: 16),

              // Speech Bubble
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF81E6D9), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF319795).withOpacity(0.08),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.volume_up_rounded, color: Color(0xFF319795)),
                      onPressed: _triggerBunnyTalkingAndAudio,
                      tooltip: "Play Bunny Audio",
                    ),
                    Expanded(
                      child: Text(
                        isHi
                            ? "“नमस्ते! आइए एक प्रोफाइल बनाते हैं! क्या आप अपने बच्चे की एक त्वरित तस्वीर खींच सकते हैं?”"
                            : "“Hi! Let's set up a profile! Can you snap a quick photo of your child?”",
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF234E52),
                          height: 1.35,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Photo Capture Area with image_picker Camera Trigger
              Center(
                child: GestureDetector(
                  onTap: _takeChildPhoto,
                  child: Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      Container(
                        width: 110,
                        height: 110,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFFE6FFFA),
                          border: Border.all(color: const Color(0xFF319795), width: 3),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF319795).withOpacity(0.15),
                              blurRadius: 12,
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: _photoPath != null
                              ? Image.file(
                                  File(_photoPath!),
                                  fit: BoxFit.cover,
                                )
                              : Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.camera_alt_rounded, size: 36, color: Color(0xFF319795)),
                                    const SizedBox(height: 4),
                                    Text(
                                      isHi ? "तस्वीर लें" : "Snap Photo",
                                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF319795)),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(
                          color: Color(0xFF319795),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.add_a_photo_rounded, size: 16, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Registration Form Fields
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isHi ? "बच्चे का नाम *" : "Child's Full Name or Pseudonym *",
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF4A5568)),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _nameController,
                      decoration: InputDecoration(
                        hintText: isHi ? "उदा. आरव शर्मा" : "e.g. Aarav M.",
                        filled: true,
                        fillColor: const Color(0xFFF7FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFCBD5E0))),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 16),

                    Text(
                      isHi ? "उम्र (महीनों में, 12-36) *" : "Age in Months (12–36) *",
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF4A5568)),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _ageController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        hintText: "24",
                        filled: true,
                        fillColor: const Color(0xFFF7FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFCBD5E0))),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 16),

                    Text(
                      isHi ? "लिंग *" : "Biological Sex *",
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF4A5568)),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        _buildSexOption("male", isHi ? "बालक (Boy)" : "Male"),
                        const SizedBox(width: 12),
                        _buildSexOption("female", isHi ? "बालिका (Girl)" : "Female"),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Action Button to Continue to Video Protocols
              ElevatedButton(
                onPressed: _proceedToRecordingGuide,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF319795),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      isHi ? "वीडियो रिकॉर्डिंग चरण (Next)" : "Continue to Video Guide",
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.arrow_forward_rounded, size: 20),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSexOption(String value, String label) {
    final isSelected = _sex == value;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _sex = value),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFE6FFFA) : const Color(0xFFF7FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? const Color(0xFF319795) : const Color(0xFFCBD5E0),
              width: isSelected ? 2 : 1,
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              color: isSelected ? const Color(0xFF234E52) : const Color(0xFF4A5568),
            ),
          ),
        ),
      ),
    );
  }
}
