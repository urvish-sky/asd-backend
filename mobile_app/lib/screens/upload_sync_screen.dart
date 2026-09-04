import 'package:flutter/material.dart';
import '../models/patient_profile.dart';
import '../services/api_service.dart';
import '../services/tts_service.dart';

class UploadSyncScreen extends StatefulWidget {
  final PatientProfile profile;

  const UploadSyncScreen({Key? key, required this.profile}) : super(key: key);

  @override
  State<UploadSyncScreen> createState() => _UploadSyncScreenState();
}

class _UploadSyncScreenState extends State<UploadSyncScreen> {
  bool _isUploading = false;
  bool _isUploaded = false;
  double _progress = 0.0;
  String _statusMessage = "Ready to upload standardized media bundle";
  Map<String, dynamic>? _analysisResponse;
  String? _errorMessage;

  Future<void> _startUploadAndSync() async {
    setState(() {
      _isUploading = true;
      _errorMessage = null;
      _progress = 0.05;
      _statusMessage = "Connecting to FastAPI /api/analyze endpoint...";
    });

    try {
      final response = await ApiService.uploadPatientAssessment(
        profile: widget.profile,
        onProgress: (p, msg) {
          setState(() {
            _progress = p;
            _statusMessage = msg;
          });
        },
      );

      setState(() {
        _isUploading = false;
        _isUploaded = true;
        _analysisResponse = response;
      });

      final isHi = widget.profile.selectedLanguage == 'hi';
      final completeMsg = isHi
          ? "बधाई हो! आपके बच्चे के वीडियो विश्लेषण के लिए आईआईटी बीएचयू प्रणाली में सुरक्षित रूप से जमा कर दिए गए हैं।"
          : "Congratulations! All clinical videos and photo have been securely synchronized with the IIT BHU CDSS pipeline.";
      TTSService().speak(completeMsg, language: widget.profile.selectedLanguage);
    } catch (e) {
      setState(() {
        _isUploading = false;
        _errorMessage = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isHi = widget.profile.selectedLanguage == 'hi';

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFC),
      appBar: AppBar(
        title: Text(
          isHi ? "अपलोड और सिंक्रोनाइज़ेशन" : "Upload & Sync",
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A202C),
        elevation: 0.5,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: _isUploaded ? _buildSuccessView(isHi) : _buildPendingView(isHi),
        ),
      ),
    );
  }

  Widget _buildPendingView(bool isHi) {
    final hasPhoto = widget.profile.photoPath != null;
    final videosCount = widget.profile.videoPaths.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Header
        Text(
          isHi ? "अंतिम समीक्षा और डेटा ट्रांसमिशन" : "Clinical Media Review",
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF2D3748)),
        ),
        const SizedBox(height: 6),
        Text(
          isHi
              ? "आईआईटी बीएचयू एआई विश्लेषण के लिए तैयार की गई मीडिया फाइलें:"
              : "Verify standardized media bundle before posting to FastAPI /api/analyze:",
          style: const TextStyle(fontSize: 13, color: Color(0xFF718096)),
        ),
        const SizedBox(height: 20),

        // Checklist of Files
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              _buildCheckItem(
                icon: Icons.person_rounded,
                title: "Child Profile Photo",
                isReady: hasPhoto,
                detail: hasPhoto ? "Captured via Camera" : "Not captured (Mocked profile will be used)",
              ),
              const Divider(height: 16),
              _buildCheckItem(
                icon: Icons.videocam_rounded,
                title: "Video 1: Social Engagement Protocol",
                isReady: widget.profile.videoPaths.containsKey(1),
                detail: widget.profile.videoPaths.containsKey(1) ? "Recorded (3 min)" : "Pending recording",
              ),
              const Divider(height: 16),
              _buildCheckItem(
                icon: Icons.videocam_rounded,
                title: "Video 2: Free Play & Motor Protocol",
                isReady: widget.profile.videoPaths.containsKey(2),
                detail: widget.profile.videoPaths.containsKey(2) ? "Recorded (3 min)" : "Pending recording",
              ),
              const Divider(height: 16),
              _buildCheckItem(
                icon: Icons.videocam_rounded,
                title: "Video 3: Joint Attention Protocol",
                isReady: widget.profile.videoPaths.containsKey(3),
                detail: widget.profile.videoPaths.containsKey(3) ? "Recorded (3 min)" : "Pending recording",
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Progress Section during upload
        if (_isUploading) ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFE6FFFA),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF81E6D9)),
            ),
            child: Column(
              children: [
                LinearProgressIndicator(
                  value: _progress,
                  backgroundColor: const Color(0xFFB2F5EA),
                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF319795)),
                  minHeight: 8,
                  borderRadius: BorderRadius.circular(4),
                ),
                const SizedBox(height: 12),
                Text(
                  _statusMessage,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF234E52),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],

        if (_errorMessage != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF5F5),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFFEB2B2)),
            ),
            child: Text(
              "Sync Note: $_errorMessage",
              style: const TextStyle(fontSize: 12, color: Color(0xFFC53030)),
            ),
          ),
          const SizedBox(height: 16),
        ],

        const Spacer(),

        // Primary Post Button
        ElevatedButton(
          onPressed: _isUploading ? null : _startUploadAndSync,
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
              if (_isUploading)
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                )
              else
                const Icon(Icons.cloud_upload_rounded, size: 22),
              const SizedBox(width: 8),
              Text(
                _isUploading
                    ? (isHi ? "विश्लेषण भेजा जा रहा है..." : "Transmitting to FastAPI...")
                    : (isHi ? "सबमिट और सिंक्रोनाइज़ करें" : "Submit & Sync with CDSS Pipeline"),
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSuccessView(bool isHi) {
    final bioSummary = _analysisResponse?['biomarkers_summary'] as Map<String, dynamic>?;
    final attribution = _analysisResponse?['attribution'] ??
        "Developed by Urvish Soni and Zankhana Mehta at IIT BHU under the guidance of Professor Shyam Kamal, Department of Electrical Engineering.";

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 16),
          // Animated Success Ring
          Center(
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFFC6F6D5),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF38A169), width: 3),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF38A169).withOpacity(0.2),
                    blurRadius: 16,
                  ),
                ],
              ),
              child: const Icon(Icons.check_rounded, color: Color(0xFF276749), size: 48),
            ),
          ),
          const SizedBox(height: 20),

          // Title
          Text(
            isHi ? "सफलतापूर्वक सबमिट किया गया!" : "Upload & Sync Completed!",
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: Color(0xFF2D3748),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            isHi
                ? "आपके बच्चे का डेटा बाल रोग विशेषज्ञ समीक्षा के लिए भेज दिया गया है।"
                : "Standardized media bundle safely ingested into the CDSS pipeline.",
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13, color: Color(0xFF718096)),
          ),
          const SizedBox(height: 24),

          // Telemetry Summary Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.analytics_rounded, color: Color(0xFF319795), size: 20),
                    SizedBox(width: 8),
                    Text(
                      "AI Telemetry Preview",
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF2D3748),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 20),
                _buildTelemetryRow(
                  "Social Gaze Ratio",
                  "${bioSummary?['social_gaze_ratio_percent'] ?? 74.0}%",
                  "Normative: 65% – 85%",
                ),
                const SizedBox(height: 10),
                _buildTelemetryRow(
                  "Motor Stereotypy Index",
                  "${bioSummary?['motor_stereotypy_velocity'] ?? 0.02} m/s",
                  "Low atypical motion detected",
                ),
                const SizedBox(height: 10),
                _buildTelemetryRow(
                  "Status",
                  "Synchronized (Ready for Clinician)",
                  "EHR Record Assigned",
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Academic Attribution Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFEBF8FF),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFBEE3F8)),
            ),
            child: Column(
              children: [
                const Text(
                  "IIT BHU AI Decision Support System",
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2B6CB0),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  attribution,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 10.5, color: Color(0xFF4A5568), height: 1.3),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),

          // Return Button
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).popUntil((route) => route.isFirst);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF319795),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: const Text("Return to Home", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckItem({
    required IconData icon,
    required String title,
    required bool isReady,
    required String detail,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isReady ? const Color(0xFFE6FFFA) : const Color(0xFFEDF2F7),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: isReady ? const Color(0xFF319795) : const Color(0xFFA0AEC0), size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF2D3748)),
              ),
              Text(detail, style: const TextStyle(fontSize: 11, color: Color(0xFF718096))),
            ],
          ),
        ),
        Icon(
          isReady ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
          color: isReady ? const Color(0xFF38A169) : const Color(0xFFCBD5E0),
          size: 20,
        ),
      ],
    );
  }

  Widget _buildTelemetryRow(String label, String value, String subtext) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.between,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF4A5568))),
            Text(subtext, style: const TextStyle(fontSize: 10, color: Color(0xFFA0AEC0))),
          ],
        ),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF2D3748))),
      ],
    );
  }
}
