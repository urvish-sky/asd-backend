class ProtocolStep {
  final int stepNumber;
  final String titleEn;
  final String titleHi;
  final String instructionEn;
  final String instructionHi;
  final String ttsAudioEn;
  final String ttsAudioHi;
  final List<String> markers;
  final String bunnyAnimation; // 'point', 'talk', 'idle'

  const ProtocolStep({
    required this.stepNumber,
    required this.titleEn,
    required this.titleHi,
    required this.instructionEn,
    required this.instructionHi,
    required this.ttsAudioEn,
    required this.ttsAudioHi,
    required this.markers,
    required this.bunnyAnimation,
  });
}

final List<ProtocolStep> clinicalProtocols = [
  const ProtocolStep(
    stepNumber: 1,
    titleEn: "Step 1: Social Engagement (Name Call)",
    titleHi: "चरण 1: सामाजिक जुड़ाव (नाम पुकारना)",
    instructionEn:
        "Position camera at eye level. Call your child's name 3–4 times from behind without tapping shoulders. Initiate games like peek-a-boo.",
    instructionHi:
        "कैमरा आंख के स्तर पर रखें। कंधे को छुए बिना पीछे से अपने बच्चे का नाम 3-4 बार पुकारें। झाँक-ताक जैसे खेल शुरू करें।",
    ttsAudioEn:
        "Step 1: Social Engagement. Position the camera at eye level. Call your child's name three to four times from behind without tapping shoulders. Observe if they orient to your voice!",
    ttsAudioHi:
        "पहला चरण: सामाजिक जुड़ाव। कैमरा आंख के स्तर पर रखें। कंधे को छुए बिना 3 से 4 बार बच्चे का नाम पुकारें। देखें कि क्या वे मुड़कर देखते हैं!",
    markers: ["Auditory orienting latency", "Eye contact ratio", "Social smiling"],
    bunnyAnimation: "point",
  ),
  const ProtocolStep(
    stepNumber: 2,
    titleEn: "Step 2: Free Play (Motor Exploration)",
    titleHi: "चरण 2: स्वतंत्र खेल (मोटर अन्वेषण)",
    instructionEn:
        "Keep the child's full body in frame. Place varied toys (blocks, spinning objects, cars) on the floor. Let them explore freely for 3 minutes.",
    instructionHi:
        "बच्चे का पूरा शरीर कैमरे में रखें। फर्श पर विभिन्न खिलौने रखें। उन्हें 3 मिनट तक स्वतंत्र रूप से खेलने दें।",
    ttsAudioEn:
        "Step 2: Free Play. Keep your child's entire body in frame. Let them play freely with their favorite toys on the floor.",
    ttsAudioHi:
        "दूसरा चरण: स्वतंत्र खेल। बच्चे का पूरा शरीर फ्रेम में रखें। उन्हें फर्श पर खिलौनों के साथ स्वतंत्र रूप से खेलने दें।",
    markers: ["Repetitive hand-flapping", "Body rocking", "Finger flicking", "Toe-walking"],
    bunnyAnimation: "point",
  ),
  const ProtocolStep(
    stepNumber: 3,
    titleEn: "Step 3: Joint Attention (Shared Requesting)",
    titleHi: "चरण 3: संयुक्त ध्यान (साझा अनुरोध)",
    instructionEn:
        "Place an enticing toy or snack slightly out of reach or point across the room saying 'Look at that!'. Observe if they share attention with you.",
    instructionHi:
        "एक पसंदीदा खिलौना थोड़ी दूरी पर रखें या कमरे के पार इशारा करके कहें 'उसे देखो!'। देखें कि क्या वे आपकी ओर देखकर ध्यान साझा करते हैं।",
    ttsAudioEn:
        "Step 3: Joint Attention. Point to a toy or picture across the room and say 'Look at that!'. Observe if your child looks where you point and shares a smile with you!",
    ttsAudioHi:
        "तीसरा चरण: संयुक्त ध्यान। कमरे के पार किसी खिलौने की ओर इशारा करके कहें 'उसे देखो!'। देखें कि क्या वे आपके इशारे का अनुसरण करते हैं!",
    markers: ["Proto-declarative pointing", "Alternating gaze", "Shared attention initiation"],
    bunnyAnimation: "point",
  ),
];
