import { Patient, BehavioralEvent } from './types';

// ─── Helper ──────────────────────────────────────────────────────────

function generateId(): string {
  return 'ASD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── Behavioral Events for Each Patient ──────────────────────────────

const typicalEvents: BehavioralEvent[] = [
  { id: 'evt-t1', videoSlot: 1, timestampSeconds: 12, label: 'Name-call response — immediate head turn', durationSeconds: 0.8, severity: 'normal' },
  { id: 'evt-t2', videoSlot: 1, timestampSeconds: 45, label: 'Sustained eye contact during peek-a-boo', durationSeconds: 4.2, severity: 'normal' },
  { id: 'evt-t3', videoSlot: 1, timestampSeconds: 98, label: 'Social smile initiated spontaneously', durationSeconds: 2.1, severity: 'normal' },
  { id: 'evt-t4', videoSlot: 2, timestampSeconds: 22, label: 'Varied toy exploration — stacking blocks', durationSeconds: 18.0, severity: 'normal' },
  { id: 'evt-t5', videoSlot: 2, timestampSeconds: 85, label: 'Switches between toys appropriately', durationSeconds: 5.0, severity: 'normal' },
  { id: 'evt-t6', videoSlot: 3, timestampSeconds: 15, label: 'Points to toy and looks at parent', durationSeconds: 2.5, severity: 'normal' },
  { id: 'evt-t7', videoSlot: 3, timestampSeconds: 67, label: 'Follows parent\'s pointing gesture', durationSeconds: 1.8, severity: 'normal' },
  { id: 'evt-t8', videoSlot: 3, timestampSeconds: 120, label: 'Triadic gaze shift (object → parent → object)', durationSeconds: 3.0, severity: 'normal' },
];

const moderateEvents: BehavioralEvent[] = [
  { id: 'evt-m1', videoSlot: 1, timestampSeconds: 18, label: 'Delayed name-call response (2nd call)', durationSeconds: 2.1, severity: 'borderline' },
  { id: 'evt-m2', videoSlot: 1, timestampSeconds: 52, label: 'Brief eye contact — breaks after 1.2s', durationSeconds: 1.2, severity: 'borderline' },
  { id: 'evt-m3', videoSlot: 1, timestampSeconds: 134, label: 'No response to 3rd name call', durationSeconds: 0, severity: 'atypical' },
  { id: 'evt-m4', videoSlot: 2, timestampSeconds: 30, label: 'Intermittent bilateral hand-flapping', durationSeconds: 3.8, severity: 'borderline' },
  { id: 'evt-m5', videoSlot: 2, timestampSeconds: 78, label: 'Repetitive spinning of toy wheels', durationSeconds: 12.5, severity: 'borderline' },
  { id: 'evt-m6', videoSlot: 2, timestampSeconds: 145, label: 'Brief body rocking episode', durationSeconds: 4.2, severity: 'borderline' },
  { id: 'evt-m7', videoSlot: 3, timestampSeconds: 25, label: 'Does not follow pointing — looks at hand only', durationSeconds: 2.0, severity: 'borderline' },
  { id: 'evt-m8', videoSlot: 3, timestampSeconds: 90, label: 'Reaches for toy without looking at parent', durationSeconds: 3.5, severity: 'borderline' },
];

const elevatedEvents: BehavioralEvent[] = [
  { id: 'evt-e1', videoSlot: 1, timestampSeconds: 15, label: 'Unresponsive to Name Call (1st attempt)', durationSeconds: 0, severity: 'atypical' },
  { id: 'evt-e2', videoSlot: 1, timestampSeconds: 48, label: 'Unresponsive to Name Call (2nd attempt)', durationSeconds: 0, severity: 'atypical' },
  { id: 'evt-e3', videoSlot: 1, timestampSeconds: 94, label: 'Delayed head turn on 4th call (3.6s latency)', durationSeconds: 3.6, severity: 'atypical' },
  { id: 'evt-e4', videoSlot: 1, timestampSeconds: 130, label: 'Averts gaze from parent\'s face', durationSeconds: 8.0, severity: 'atypical' },
  { id: 'evt-e5', videoSlot: 2, timestampSeconds: 20, label: 'Sustained bilateral hand-flapping episode', durationSeconds: 8.5, severity: 'atypical' },
  { id: 'evt-e6', videoSlot: 2, timestampSeconds: 65, label: 'Continuous body rocking', durationSeconds: 15.0, severity: 'atypical' },
  { id: 'evt-e7', videoSlot: 2, timestampSeconds: 110, label: 'Finger flicking with spinning object fixation', durationSeconds: 22.0, severity: 'atypical' },
  { id: 'evt-e8', videoSlot: 2, timestampSeconds: 155, label: 'Toe-walking across play area', durationSeconds: 6.2, severity: 'atypical' },
  { id: 'evt-e9', videoSlot: 3, timestampSeconds: 30, label: 'No proto-declarative pointing observed', durationSeconds: 0, severity: 'atypical' },
  { id: 'evt-e10', videoSlot: 3, timestampSeconds: 75, label: 'No gaze alternation — fixates on object only', durationSeconds: 12.0, severity: 'atypical' },
  { id: 'evt-e11', videoSlot: 3, timestampSeconds: 140, label: 'Reaches past parent without social reference', durationSeconds: 4.0, severity: 'atypical' },
];

// ─── Pre-Seeded Patient Records ──────────────────────────────────────

export const mockPatients: Patient[] = [
  {
    id: 'ASD-PT001',
    childName: 'Arjun M.',
    dateOfBirth: '2024-09-15',
    ageInMonths: 24,
    biologicalSex: 'male',
    parentName: 'Kavita Mehta',
    contactEmail: 'kavita.mehta@example.com',
    contactPhone: '+91-98765-43210',
    submissionDate: '2026-08-28T10:30:00Z',
    submissionStatus: 'ai_complete',
    riskTier: 'typical',
    clinicalStatus: 'pending',
    videoSlots: [
      { slotNumber: 1, title: 'Social Engagement & Name-Call Protocol', fileName: 'arjun_social_engagement.mp4', fileSize: 85_000_000, uploaded: true, videoUrl: '/videos/arjun_social_engagement.mp4', qualityMetrics: { framingQuality: 94, lighting: 'good', resolution: '1080p' } },
      { slotNumber: 2, title: 'Free Play & Motor Exploration', fileName: 'arjun_free_play.mp4', fileSize: 92_000_000, uploaded: true, videoUrl: '/videos/arjun_free_play.mp4', qualityMetrics: { framingQuality: 88, lighting: 'good', resolution: '1080p' } },
      { slotNumber: 3, title: 'Joint Attention & Shared Requesting', fileName: 'arjun_joint_attention.mp4', fileSize: 78_000_000, uploaded: true, videoUrl: '/videos/arjun_joint_attention.mp4', qualityMetrics: { framingQuality: 91, lighting: 'adequate', resolution: '1080p' } },
    ],
    biomarkers: {
      nameCallLatency: { measured: 0.8, normalMax: 1.2, unit: 'seconds' },
      socialGazeRatio: { measured: 72, normalMin: 65, normalMax: 85, unit: '%' },
      motorStereotypyIndex: { frequency: 0.2, totalDuration: 1.5, normalMaxFrequency: 1.0 },
      jointAttentionEpisodes: { count: 8, normalMin: 5 },
      speechProsody: { atypicalPitchBursts: 1, vocalTurnTaking: 6.5, normalTurnTakingMin: 4.0 },
    },
    behavioralEvents: typicalEvents,
    clinicalNote: { notes: '', diagnosticImpressions: '', referral: 'none', signedOff: false, signedAt: null, reviewedBy: '' },
    isaaScores: null,
  },
  {
    id: 'ASD-PT002',
    childName: 'Priya K.',
    dateOfBirth: '2025-03-10',
    ageInMonths: 18,
    biologicalSex: 'female',
    parentName: 'Ravi Kumar',
    contactEmail: 'ravi.kumar@example.com',
    contactPhone: '+91-91234-56789',
    submissionDate: '2026-08-30T14:15:00Z',
    submissionStatus: 'ai_complete',
    riskTier: 'moderate',
    clinicalStatus: 'pending',
    videoSlots: [
      { slotNumber: 1, title: 'Social Engagement & Name-Call Protocol', fileName: 'priya_social.mov', fileSize: 110_000_000, uploaded: true, videoUrl: '/videos/priya_social.mov', qualityMetrics: { framingQuality: 82, lighting: 'adequate', resolution: '720p' } },
      { slotNumber: 2, title: 'Free Play & Motor Exploration', fileName: 'priya_play.mov', fileSize: 105_000_000, uploaded: true, videoUrl: '/videos/priya_play.mov', qualityMetrics: { framingQuality: 79, lighting: 'adequate', resolution: '720p' } },
      { slotNumber: 3, title: 'Joint Attention & Shared Requesting', fileName: 'priya_attention.mov', fileSize: 98_000_000, uploaded: true, videoUrl: '/videos/priya_attention.mov', qualityMetrics: { framingQuality: 85, lighting: 'good', resolution: '720p' } },
    ],
    biomarkers: {
      nameCallLatency: { measured: 2.1, normalMax: 1.2, unit: 'seconds' },
      socialGazeRatio: { measured: 45, normalMin: 65, normalMax: 85, unit: '%' },
      motorStereotypyIndex: { frequency: 2.8, totalDuration: 18.5, normalMaxFrequency: 1.0 },
      jointAttentionEpisodes: { count: 3, normalMin: 5 },
      speechProsody: { atypicalPitchBursts: 5, vocalTurnTaking: 2.8, normalTurnTakingMin: 4.0 },
    },
    behavioralEvents: moderateEvents,
    clinicalNote: { notes: '', diagnosticImpressions: '', referral: 'none', signedOff: false, signedAt: null, reviewedBy: '' },
    isaaScores: {
      items: { 2: 3, 25: 3 },
      aiPrefilledItems: [2, 25],
    },
  },
  {
    id: 'ASD-PT003',
    childName: 'Rohan S.',
    dateOfBirth: '2024-03-01',
    ageInMonths: 30,
    biologicalSex: 'male',
    parentName: 'Anita Sharma',
    contactEmail: 'anita.sharma@example.com',
    contactPhone: '+91-87654-32109',
    submissionDate: '2026-09-01T09:45:00Z',
    submissionStatus: 'under_review',
    riskTier: 'elevated',
    clinicalStatus: 'pending',
    videoSlots: [
      { slotNumber: 1, title: 'Social Engagement & Name-Call Protocol', fileName: 'rohan_social.webm', fileSize: 130_000_000, uploaded: true, videoUrl: '/videos/rohan_social.webm', qualityMetrics: { framingQuality: 76, lighting: 'adequate', resolution: '1080p' } },
      { slotNumber: 2, title: 'Free Play & Motor Exploration', fileName: 'rohan_play.webm', fileSize: 142_000_000, uploaded: true, videoUrl: '/videos/rohan_play.webm', qualityMetrics: { framingQuality: 71, lighting: 'poor', resolution: '1080p' } },
      { slotNumber: 3, title: 'Joint Attention & Shared Requesting', fileName: 'rohan_attention.webm', fileSize: 125_000_000, uploaded: true, videoUrl: '/videos/rohan_attention.webm', qualityMetrics: { framingQuality: 68, lighting: 'adequate', resolution: '720p' } },
    ],
    biomarkers: {
      nameCallLatency: { measured: 3.6, normalMax: 1.2, unit: 'seconds' },
      socialGazeRatio: { measured: 28, normalMin: 65, normalMax: 85, unit: '%' },
      motorStereotypyIndex: { frequency: 6.4, totalDuration: 51.7, normalMaxFrequency: 1.0 },
      jointAttentionEpisodes: { count: 1, normalMin: 5 },
      speechProsody: { atypicalPitchBursts: 14, vocalTurnTaking: 1.2, normalTurnTakingMin: 4.0 },
    },
    behavioralEvents: elevatedEvents,
    clinicalNote: { notes: '', diagnosticImpressions: '', referral: 'none', signedOff: false, signedAt: null, reviewedBy: '' },
    isaaScores: {
      items: { 2: 4, 14: 4, 25: 5, 31: 4, 35: 4 },
      aiPrefilledItems: [2, 14, 25, 31, 35],
    },
  },
];

export { generateId };
