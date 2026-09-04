# Pediatric ASD Screening Decision Support System — Parent Portal Mobile App

**Developed by Urvish Soni and Zankhana Mehta at IIT BHU under the guidance of Professor Shyam Kamal, Department of Electrical Engineering.**

---

## 📱 Overview

The parent-facing Flutter mobile portal provides an intuitive, non-alarmist developmental screening workflow for parents of toddlers aged 12–36 months. An interactive 3D Bunny character guides caregivers through clinical video recording protocols in either **English** or **हिंदी**.

### Key Capabilities
1. **Interactive 3D Bunny Guide:** Rendered using `flutter_3d_controller` with `assets/bunny.glb`. Supports talking and pointing animations.
2. **Bilingual Text-to-Speech (TTS):** English (`en-US`) and Hindi (`hi-IN`) audio guidance via `flutter_tts`.
3. **Camera & Video Protocol Engine:** Standardized capture of:
   - Child profile snapshot (`image_picker`)
   - Protocol 1: Social Engagement & Name-Call (Auditory orienting, eye contact ratio)
   - Protocol 2: Free Play & Motor Exploration (Stereotypy detection, body rocking)
   - Protocol 3: Joint Attention & Shared Requesting (Proto-declarative pointing, triadic gaze)
4. **FastAPI Multipart Synchronization:** Posts multipart payload to `/api/analyze` and displays AI telemetry preview.

---

## 🚀 Running the App

```bash
cd mobile_app
flutter pub get
flutter run
```

### Backend Connection
By default, the app routes requests to the FastAPI backend:
- **Android Emulator:** `http://10.0.2.2:8000`
- **iOS Simulator / Desktop:** `http://localhost:8000`
