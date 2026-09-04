class PatientProfile {
  String childName;
  int ageInMonths;
  String biologicalSex;
  String parentName;
  String contactPhone;
  String? photoPath;
  String selectedLanguage; // 'en' or 'hi'
  Map<int, String> videoPaths; // 1: Social, 2: Motor, 3: Joint Attention

  PatientProfile({
    this.childName = '',
    this.ageInMonths = 24,
    this.biologicalSex = 'male',
    this.parentName = '',
    this.contactPhone = '',
    this.photoPath,
    this.selectedLanguage = 'en',
    Map<int, String>? videoPaths,
  }) : videoPaths = videoPaths ?? {};

  bool get isRegistrationComplete =>
      childName.trim().isNotEmpty &&
      ageInMonths >= 12 &&
      ageInMonths <= 36 &&
      photoPath != null;

  bool get areAllVideosRecorded =>
      videoPaths.containsKey(1) &&
      videoPaths.containsKey(2) &&
      videoPaths.containsKey(3);
}
