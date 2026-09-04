import 'package:flutter/material.dart';
import 'package:flutter_3d_controller/flutter_3d_controller.dart';
import 'package:image_picker/image_picker.dart';
import '../models/patient_profile.dart';
import '../models/protocol_step.dart';
import '../widgets/bunny_3d_widget.dart';
import '../services/tts_service.dart';
import 'upload_sync_screen.dart';

class RecordingGuideScreen extends StatefulWidget {
  final PatientProfile profile;

  const RecordingGuideScreen({Key? key, required this.profile}) : super(key: key);

  @override
  State<RecordingGuideScreen> createState() => _RecordingGuideScreenState();
}

class _RecordingGuideScreenState extends State<RecordingGuideScreen> {
  final PageController _pageController = PageController();
  final Flutter3DController _bunnyController = Flutter3DController();
  final ImagePicker _picker = ImagePicker();

  int _currentPage = 0;
  bool _isRecording = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _explainCurrentStep();
    });
  }

  void _explainCurrentStep() {
    final step = clinicalProtocols[_currentPage];
    final isHi = widget.profile.selectedLanguage == 'hi';

    // Play pointing animation
    try {
      _bunnyController.playAnimation(animationName: 'point');
    } catch (_) {}

    // Speak localized TTS instruction
    final ttsText = isHi ? step.ttsAudioHi : step.ttsAudioEn;
    TTSService().speak(ttsText, language: widget.profile.selectedLanguage);
  }

  Future<void> _recordVideoForCurrentStep() async {
    final stepNumber = _currentPage + 1;
    setState(() => _isRecording = true);

    try {
      // Screen 3: "Record Video" action button per step using image_picker
      final XFile? video = await _picker.pickVideo(
        source: ImageSource.camera,
        maxDuration: const Duration(minutes: 3),
        preferredCameraDevice: CameraDevice.back,
      );

      if (video != null) {
        setState(() {
          widget.profile.videoPaths[stepNumber] = video.path;
        });

        final isHi = widget.profile.selectedLanguage == 'hi';
        final successMsg = isHi
            ? "वीडियो सफलतापूर्वक रिकॉर्ड हो गया है!"
            : "Video recorded successfully for step $stepNumber!";
        TTSService().speak(successMsg, language: widget.profile.selectedLanguage);
      }
    } catch (e) {
      debugPrint("Video recording error: $e");
    } finally {
      setState(() => _isRecording = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isHi = widget.profile.selectedLanguage == 'hi';
    final currentStep = clinicalProtocols[_currentPage];
    final bool hasCurrentVideo = widget.profile.videoPaths.containsKey(_currentPage + 1);

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFC),
      appBar: AppBar(
        title: Text(
          isHi ? "प्रोटोकॉल वीडियो गाइड" : "Interactive Recording Guide",
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A202C),
        elevation: 0.5,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 3D Bunny Guide with Pointing Animation
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Bunny3DWidget(
                controller: _bunnyController,
                height: 200,
                animationToPlay: 'point',
              ),
            ),

            // Step Indicator Tabs
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
              child: Row(
                children: List.generate(3, (index) {
                  final isCurrent = index == _currentPage;
                  final isCompleted = widget.profile.videoPaths.containsKey(index + 1);

                  return Expanded(
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      height: 6,
                      decoration: BoxDecoration(
                        color: isCompleted
                            ? const Color(0xFF38A169)
                            : isCurrent
                                ? const Color(0xFF319795)
                                : const Color(0xFFE2E8F0),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                  );
                }),
              ),
            ),

            // 3-Step Carousel for Clinical Protocols
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: clinicalProtocols.length,
                onPageChanged: (pageIndex) {
                  setState(() => _currentPage = pageIndex);
                  _explainCurrentStep();
                },
                itemBuilder: (context, index) {
                  final step = clinicalProtocols[index];
                  final isRecorded = widget.profile.videoPaths.containsKey(index + 1);

                  return SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Protocol Step Card
                        Container(
                          padding: const EdgeInsets.all(18),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isRecorded ? const Color(0xFF9AE6B4) : const Color(0xFFCBD5E0),
                              width: isRecorded ? 2 : 1,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.04),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Step Header
                              Row(
                                mainAxisAlignment: MainAxisAlignment.between,
                                children: [
                                  Expanded(
                                    child: Text(
                                      isHi ? step.titleHi : step.titleEn,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w800,
                                        color: Color(0xFF2D3748),
                                      ),
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.volume_up_rounded, color: Color(0xFF319795)),
                                    onPressed: _explainCurrentStep,
                                    tooltip: "Listen to Bunny Instructions",
                                  ),
                                ],
                              ),
                              const Divider(height: 16),

                              // Instructions
                              Text(
                                isHi ? step.instructionHi : step.instructionEn,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Color(0xFF4A5568),
                                  height: 1.45,
                                ),
                              ),
                              const SizedBox(height: 12),

                              // Key Clinical Markers
                              const Text(
                                "AI Behavioral Markers Analyzed:",
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF319795),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Wrap(
                                spacing: 6,
                                runSpacing: 4,
                                children: step.markers.map((m) {
                                  return Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFE6FFFA),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      "• $m",
                                      style: const TextStyle(fontSize: 11, color: Color(0xFF234E52)),
                                    ),
                                  );
                                }).toList(),
                              ),

                              if (isRecorded) ...[
                                const SizedBox(height: 14),
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF0FFF4),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: const Color(0xFF9AE6B4)),
                                  ),
                                  child: const Row(
                                    children: [
                                      Icon(Icons.check_circle_rounded, color: Color(0xFF38A169), size: 18),
                                      SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          "Protocol video recorded & verified",
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF276749),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // "Record Video" Action Button per step
                        ElevatedButton.icon(
                          onPressed: _isRecording ? null : _recordVideoForCurrentStep,
                          icon: Icon(
                            isRecorded ? Icons.replay_rounded : Icons.videocam_rounded,
                            size: 22,
                          ),
                          label: Text(
                            isRecorded
                                ? (isHi ? "पुनः रिकॉर्ड करें (Re-record)" : "Re-record Video")
                                : (isHi ? "वीडियो रिकॉर्ड करें (Record Video)" : "Record Video (3 min)"),
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isRecorded ? const Color(0xFF4A5568) : const Color(0xFFE53E3E),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Bottom Navigation Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
              ),
              child: Row(
                children: [
                  if (_currentPage > 0)
                    OutlinedButton(
                      onPressed: () {
                        _pageController.previousPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text("Previous"),
                    ),
                  const Spacer(),
                  if (_currentPage < 2)
                    ElevatedButton(
                      onPressed: () {
                        _pageController.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF319795),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Row(
                        children: [
                          Text("Next Step"),
                          SizedBox(width: 4),
                          Icon(Icons.arrow_forward_rounded, size: 16),
                        ],
                      ),
                    )
                  else
                    ElevatedButton(
                      onPressed: () {
                        TTSService().stop();
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => UploadSyncScreen(profile: widget.profile),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2B6CB0),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Row(
                        children: [
                          Text("Upload & Sync", style: TextStyle(fontWeight: FontWeight.bold)),
                          SizedBox(width: 6),
                          Icon(Icons.cloud_upload_rounded, size: 18),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
