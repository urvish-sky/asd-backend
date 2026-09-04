import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';

class TTSService {
  static final TTSService _instance = TTSService._internal();
  factory TTSService() => _instance;

  final FlutterTts _flutterTts = FlutterTts();
  bool _isInitialized = false;
  bool isSpeaking = false;

  TTSService._internal();

  Future<void> init() async {
    if (_isInitialized) return;
    try {
      await _flutterTts.setSpeechRate(0.5); // Comfortable, clear cadence for parents
      await _flutterTts.setVolume(1.0);
      await _flutterTts.setPitch(1.05);

      _flutterTts.setStartHandler(() {
        isSpeaking = true;
      });

      _flutterTts.setCompletionHandler(() {
        isSpeaking = false;
      });

      _flutterTts.setErrorHandler((msg) {
        isSpeaking = false;
        debugPrint("TTS Error: $msg");
      });

      _isInitialized = true;
    } catch (e) {
      debugPrint("Could not initialize FlutterTts: $e");
    }
  }

  Future<void> speak(String text, {String language = 'en'}) async {
    await init();
    try {
      await _flutterTts.stop();
      if (language == 'hi') {
        await _flutterTts.setLanguage("hi-IN");
      } else {
        await _flutterTts.setLanguage("en-US");
      }
      await _flutterTts.speak(text);
    } catch (e) {
      debugPrint("TTS Speak Error: $e");
    }
  }

  Future<void> stop() async {
    try {
      await _flutterTts.stop();
      isSpeaking = false;
    } catch (e) {
      debugPrint("TTS Stop Error: $e");
    }
  }
}
