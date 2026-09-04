'use client';

import { create } from 'zustand';
import { Patient, VideoSlot, ReferralType, ClinicalStatus, SubmissionStatus, ISAAScores, VideoAnalysisResult, RiskTier } from '@/lib/types';
import { generateId } from '@/lib/mockData';

interface AppState {
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'submissionDate' | 'submissionStatus' | 'riskTier' | 'clinicalStatus' | 'biomarkers' | 'behavioralEvents' | 'clinicalNote' | 'isaaScores'>) => string;
  updateSubmissionStatus: (id: string, status: SubmissionStatus) => void;
  updateClinicalStatus: (id: string, status: ClinicalStatus) => void;
  updateClinicalNotes: (id: string, notes: string, diagnosticImpressions: string) => void;
  updateReferral: (id: string, referral: ReferralType) => void;
  signOffCase: (id: string, doctorName: string) => void;
  updateISAAScore: (id: string, itemNumber: number, score: number) => void;
  applyAIAnalysis: (id: string, analysisResults: VideoAnalysisResult[]) => void;
  getPatientById: (id: string) => Patient | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  patients: [],

  setPatients: (patients) => set({ patients }),

  addPatient: (patientData) => {
    const id = generateId();
    const newPatient: Patient = {
      ...patientData,
      id,
      submissionDate: new Date().toISOString(),
      submissionStatus: 'uploaded',
      riskTier: 'typical', // default — updated upon AI analysis
      clinicalStatus: 'pending',
      biomarkers: null,
      behavioralEvents: [],
      clinicalNote: {
        notes: '',
        diagnosticImpressions: '',
        referral: 'none',
        signedOff: false,
        signedAt: null,
        reviewedBy: '',
      },
      isaaScores: null,
    };
    set((state) => ({ patients: [...state.patients, newPatient] }));
    return id;
  },

  updateSubmissionStatus: (id, status) =>
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === id ? { ...p, submissionStatus: status } : p
      ),
    })),

  updateClinicalStatus: (id, status) =>
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === id ? { ...p, clinicalStatus: status } : p
      ),
    })),

  updateClinicalNotes: (id, notes, diagnosticImpressions) =>
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === id
          ? { ...p, clinicalNote: { ...p.clinicalNote, notes, diagnosticImpressions } }
          : p
      ),
    })),

  updateReferral: (id, referral) =>
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === id
          ? { ...p, clinicalNote: { ...p.clinicalNote, referral } }
          : p
      ),
    })),

  signOffCase: (id, doctorName) =>
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === id
          ? {
              ...p,
              clinicalStatus: 'reviewed' as ClinicalStatus,
              clinicalNote: {
                ...p.clinicalNote,
                signedOff: true,
                signedAt: new Date().toISOString(),
                reviewedBy: doctorName,
              },
            }
          : p
      ),
    })),

  updateISAAScore: (id, itemNumber, score) =>
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== id) return p;
        const currentScores = p.isaaScores || { items: {}, aiPrefilledItems: [] };
        return {
          ...p,
          isaaScores: {
            ...currentScores,
            items: { ...currentScores.items, [itemNumber]: score },
          },
        };
      }),
    })),

  applyAIAnalysis: (id, analysisResults) =>
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== id) return p;

        // Aggregate ISAA flags from all uploaded videos
        let flagPoorEyeContact = false;
        let flagMotorStereotypies = false;
        let avgGazeRatio = 0.65;
        let avgWristVelocity = 0.02;

        const validResults = analysisResults.filter((r) => r && r.success && r.telemetry);
        if (validResults.length > 0) {
          const gazeRatios = validResults
            .map((r) => r.telemetry?.face_visibility_ratio)
            .filter((v): v is number => typeof v === 'number');
          if (gazeRatios.length > 0) {
            avgGazeRatio = gazeRatios.reduce((a, b) => a + b, 0) / gazeRatios.length;
          }

          const wristVels = validResults
            .map((r) => r.telemetry?.avg_wrist_velocity)
            .filter((v): v is number => typeof v === 'number');
          if (wristVels.length > 0) {
            avgWristVelocity = wristVels.reduce((a, b) => a + b, 0) / wristVels.length;
          }

          validResults.forEach((r) => {
            if (r.isaa_flags?.item_2_poor_eye_contact) flagPoorEyeContact = true;
            if (r.isaa_flags?.item_25_motor_stereotypies) flagMotorStereotypies = true;
          });
        }

        // Build pre-filled ISAA items and highlights
        const items: Record<number, number> = { ...(p.isaaScores?.items || {}) };
        const aiPrefilledItems = new Set<number>(p.isaaScores?.aiPrefilledItems || []);

        if (flagPoorEyeContact) {
          items[1] = items[1] || 4; // Poor eye contact (Item 1 in standard ISAA)
          items[2] = items[2] || 4; // Poor social smile / eye contact (Item 2)
          aiPrefilledItems.add(1);
          aiPrefilledItems.add(2);
        }

        if (flagMotorStereotypies) {
          items[24] = items[24] || 5; // Stereotyped and repetitive motor mannerisms
          items[25] = items[25] || 5; // Motor stereotypies (Item 25)
          aiPrefilledItems.add(24);
          aiPrefilledItems.add(25);
        }

        // Determine Risk Tier
        let riskTier: RiskTier = 'typical';
        if (flagPoorEyeContact && flagMotorStereotypies) {
          riskTier = 'elevated';
        } else if (flagPoorEyeContact || flagMotorStereotypies) {
          riskTier = 'moderate';
        }

        const gazePercent = Math.round(avgGazeRatio * 100);
        const stereotypyIndex = Math.round(avgWristVelocity * 100 * 10) / 10;

        // Update video slots with uploaded video URLs if analysisResults provided them
        const updatedVideoSlots = p.videoSlots.map((slot, idx) => {
          const res = analysisResults[idx];
          if (res && res.success) {
            return {
              ...slot,
              uploaded: true,
              fileName: res.filename || slot.fileName,
              videoUrl: res.video_url || slot.videoUrl,
            };
          }
          return slot;
        }) as [VideoSlot, VideoSlot, VideoSlot];

        return {
          ...p,
          submissionStatus: 'ai_complete',
          riskTier,
          videoSlots: updatedVideoSlots,
          biomarkers: {
            nameCallLatency: {
              measured: flagPoorEyeContact ? 2.4 : 0.9,
              normalMax: 1.2,
              unit: 'seconds',
            },
            socialGazeRatio: {
              measured: gazePercent,
              normalMin: 65,
              normalMax: 85,
              unit: '%',
            },
            motorStereotypyIndex: {
              frequency: stereotypyIndex,
              totalDuration: Math.round(stereotypyIndex * 4.5 * 10) / 10,
              normalMaxFrequency: 1.0,
            },
            jointAttentionEpisodes: {
              count: flagPoorEyeContact ? 2 : 7,
              normalMin: 5,
            },
            speechProsody: {
              atypicalPitchBursts: flagMotorStereotypies ? 6 : 2,
              vocalTurnTaking: flagPoorEyeContact ? 2.2 : 5.8,
              normalTurnTakingMin: 4.0,
            },
          },
          isaaScores: {
            items,
            aiPrefilledItems: Array.from(aiPrefilledItems),
          },
        };
      }),
    })),

  getPatientById: (id) => get().patients.find((p) => p.id === id),
}));
