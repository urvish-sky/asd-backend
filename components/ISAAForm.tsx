'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Percent,
  Edit3,
  Check,
  RotateCcw,
  AlertCircle,
  Database,
} from 'lucide-react';

export interface ScoreOverrideItem {
  originalScore: number;
  newScore: number;
  justification: string;
  isOverridden: boolean;
}

// ─── ISAA Domain & Item Definitions (Official 40-Item Scale) ────────

interface ISAAItem {
  number: number;
  text: string;
}

interface ISAADomain {
  name: string;
  items: ISAAItem[];
}

const ISAA_DOMAINS: ISAADomain[] = [
  {
    name: 'Domain 1: Social Relationships & Reciprocity',
    items: [
      { number: 1, text: 'Has poor eye contact' },
      { number: 2, text: 'Lacks social smile' },
      { number: 3, text: 'Remains aloof' },
      { number: 4, text: 'Does not reach out to others' },
      { number: 5, text: 'Unable to relate to people' },
      { number: 6, text: 'Unable to respond to social/environmental cues' },
      { number: 7, text: 'Engages in solitary and repetitive play activities' },
      { number: 8, text: 'Unable to take turns in social interaction' },
      { number: 9, text: 'Does not maintain peer relationships' },
    ],
  },
  {
    name: 'Domain 2: Emotional Responsiveness',
    items: [
      { number: 10, text: 'Shows inappropriate emotional response' },
      { number: 11, text: 'Shows exaggerated emotions' },
      { number: 12, text: 'Engages in self-stimulating emotions' },
      { number: 13, text: 'Lacks fear of danger' },
      { number: 14, text: 'Excited or agitated for no apparent reason' },
    ],
  },
  {
    name: 'Domain 3: Speech, Language & Communication',
    items: [
      { number: 15, text: 'Acquired speech and lost it' },
      { number: 16, text: 'Has difficulty in using non-verbal language or gestures to communicate' },
      { number: 17, text: 'Engages in stereotyped and repetitive use of language' },
      { number: 18, text: 'Engages in echolalic speech' },
      { number: 19, text: 'Produces infantile squeals/unusual noises' },
      { number: 20, text: 'Unable to initiate or sustain conversation with others' },
      { number: 21, text: 'Does not respond to name when called' },
      { number: 22, text: 'Unable to grasp pragmatics of communication (social use of language)' },
      { number: 23, text: 'Engages in incessant questioning' },
    ],
  },
  {
    name: 'Domain 4: Behavior Patterns',
    items: [
      { number: 24, text: 'Engages in stereotyped and repetitive motor mannerisms' },
      { number: 25, text: 'Shows attachment to inanimate objects' },
      { number: 26, text: 'Shows hyperactivity/restlessness' },
      { number: 27, text: 'Exhibits aggressive behavior' },
      { number: 28, text: 'Throws temper tantrums' },
      { number: 29, text: 'Engages in self-injurious behavior' },
      { number: 30, text: 'Insists on sameness' },
    ],
  },
  {
    name: 'Domain 5: Sensory Aspects',
    items: [
      { number: 31, text: 'Unusually sensitive to sensory stimuli' },
      { number: 32, text: 'Stares into space for long periods of time' },
      { number: 33, text: 'Has difficulty in tracking objects' },
      { number: 34, text: 'Has unusual vision' },
      { number: 35, text: 'Insensitive to pain' },
      { number: 36, text: 'Responds to objects/people unusually by smelling, touching, or tasting' },
    ],
  },
  {
    name: 'Domain 6: Cognitive Components',
    items: [
      { number: 37, text: 'Inconsistent attention and concentration' },
      { number: 38, text: 'Shows delay in responding' },
      { number: 39, text: 'Has unusual memory of certain things' },
      { number: 40, text: 'Has savant abilities' },
    ],
  },
];

const SCORE_LABELS: Record<number, { label: string; range: string }> = {
  1: { label: 'Rarely', range: '≤ 20%' },
  2: { label: 'Sometimes', range: '21–40%' },
  3: { label: 'Frequently', range: '41–60%' },
  4: { label: 'Mostly', range: '61–80%' },
  5: { label: 'Always', range: '81–100%' },
};

// ─── Severity Calculation Helpers ────────────────────────────────────

function getSeverityBand(totalScore: number): { label: string; color: string; bgColor: string; borderColor: string } {
  if (totalScore < 70) return { label: 'No Autism', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-300' };
  if (totalScore <= 106) return { label: 'Mild Autism', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300' };
  if (totalScore <= 153) return { label: 'Moderate Autism', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' };
  return { label: 'Severe Autism', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-300' };
}

function getDisabilityPercentage(totalScore: number): number {
  if (totalScore < 70) return 0;
  const disability = ((totalScore - 70) * 100 / 130) + 40;
  return Math.min(Math.round(disability * 10) / 10, 100);
}

// ─── Component Props ─────────────────────────────────────────────────

interface ISAAFormProps {
  patientId: string;
  patientName: string;
  patientAge: number;
  scores: Record<number, number>;
  aiPrefilledItems: number[];
  onScoreChange: (itemNumber: number, score: number) => void;
  // Continuous Learning Overrides
  overrides?: Record<number, ScoreOverrideItem>;
  onOverrideToggle?: (itemNumber: number, enabled: boolean) => void;
  onJustificationChange?: (itemNumber: number, justification: string) => void;
  validationErrors?: Record<number, string>;
}

export default function ISAAForm({
  patientId,
  patientName,
  patientAge,
  scores,
  aiPrefilledItems,
  onScoreChange,
  overrides,
  onOverrideToggle,
  onJustificationChange,
  validationErrors,
}: ISAAFormProps) {
  const [expandedDomains, setExpandedDomains] = useState<Record<number, boolean>>({ 0: true });
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Internal fallback state if overrides not controlled externally
  const [localOverrides, setLocalOverrides] = useState<Record<number, boolean>>({});
  const [localJustifications, setLocalJustifications] = useState<Record<number, string>>({});
  const [originalAiScores] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {};
    aiPrefilledItems.forEach((num) => {
      map[num] = scores[num] || 0;
    });
    return map;
  });

  const isOverrideActive = (itemNumber: number) => {
    if (overrides && overrides[itemNumber] !== undefined) {
      return overrides[itemNumber].isOverridden;
    }
    return localOverrides[itemNumber] ?? false;
  };

  const getJustification = (itemNumber: number) => {
    if (overrides && overrides[itemNumber] !== undefined) {
      return overrides[itemNumber].justification;
    }
    return localJustifications[itemNumber] || '';
  };

  const getOriginalScore = (itemNumber: number) => {
    if (overrides && overrides[itemNumber]?.originalScore !== undefined) {
      return overrides[itemNumber].originalScore;
    }
    return originalAiScores[itemNumber] || scores[itemNumber] || 0;
  };

  const handleToggleOverride = (itemNumber: number) => {
    const nextState = !isOverrideActive(itemNumber);
    if (onOverrideToggle) {
      onOverrideToggle(itemNumber, nextState);
    } else {
      setLocalOverrides((prev) => ({ ...prev, [itemNumber]: nextState }));
    }
  };

  const handleJustificationInput = (itemNumber: number, text: string) => {
    if (onJustificationChange) {
      onJustificationChange(itemNumber, text);
    } else {
      setLocalJustifications((prev) => ({ ...prev, [itemNumber]: text }));
    }
  };

  const toggleDomain = (index: number) => {
    setExpandedDomains((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // ─── Computed Scores ──────────────────────────────────────────────

  const totalScore = useMemo(() => {
    let sum = 0;
    for (let i = 1; i <= 40; i++) {
      sum += scores[i] || 0;
    }
    return sum;
  }, [scores]);

  const scoredItemCount = useMemo(() => {
    let count = 0;
    for (let i = 1; i <= 40; i++) {
      if (scores[i] && scores[i] > 0) count++;
    }
    return count;
  }, [scores]);

  const domainScores = useMemo(() => {
    return ISAA_DOMAINS.map((domain) => {
      let sum = 0;
      let scored = 0;
      domain.items.forEach((item) => {
        const s = scores[item.number] || 0;
        sum += s;
        if (s > 0) scored++;
      });
      return { sum, scored, total: domain.items.length };
    });
  }, [scores]);

  // "Effective" total: scored items contribute their value; unscored default to 1 (minimum)
  const effectiveTotal = useMemo(() => {
    let sum = 0;
    for (let i = 1; i <= 40; i++) {
      sum += scores[i] && scores[i] > 0 ? scores[i] : 1;
    }
    return sum;
  }, [scores]);

  const severity = getSeverityBand(effectiveTotal);
  const disability = getDisabilityPercentage(effectiveTotal);

  const handleDownloadCertificate = () => {
    const now = new Date();
    const text = [
      '═══════════════════════════════════════════════════════════════',
      '        INDIAN SCALE FOR ASSESSMENT OF AUTISM (ISAA)',
      '                  OFFICIAL ASSESSMENT CERTIFICATE',
      '═══════════════════════════════════════════════════════════════',
      '',
      `Date of Assessment:    ${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      `Certificate No:        ISAA-${patientId}-${now.getFullYear()}`,
      '',
      '─── PATIENT INFORMATION ───────────────────────────────────────',
      `Patient ID:            ${patientId}`,
      `Name:                  ${patientName}`,
      `Age:                   ${patientAge} months`,
      '',
      '─── ISAA SCORING SUMMARY ──────────────────────────────────────',
      '',
      ...ISAA_DOMAINS.map((domain, di) => {
        const ds = domainScores[di];
        const lines = [`  ${domain.name} (${ds.sum}/${ds.total * 5})`];
        domain.items.forEach((item) => {
          const s = scores[item.number] || 0;
          const label = s > 0 ? SCORE_LABELS[s].label : 'Not scored';
          lines.push(`    Item ${item.number}: ${item.text} — ${s} (${label})`);
        });
        return lines.join('\n');
      }),
      '',
      '─── RESULTS ───────────────────────────────────────────────────',
      `Total ISAA Score:      ${effectiveTotal} / 200`,
      `Items Scored:          ${scoredItemCount} / 40`,
      `Severity Band:         ${severity.label}`,
      `Disability Percentage: ${disability}%`,
      '',
      '─── CLASSIFICATION CRITERIA ───────────────────────────────────',
      '  Score < 70:    No Autism',
      '  70 – 106:      Mild Autism (Disability 40–67%)',
      '  107 – 153:     Moderate Autism (Disability 68–100%)',
      '  > 153:         Severe Autism (Disability 100%)',
      '',
      '─── CERTIFICATION ─────────────────────────────────────────────',
      '',
      'This assessment has been conducted using the Indian Scale for',
      'Assessment of Autism (ISAA) as prescribed by the National Trust',
      'for Welfare of Persons with Autism, Cerebral Palsy, Mental',
      'Retardation and Multiple Disabilities Act, 1999.',
      '',
      'Assessing Clinician: ___________________________________________',
      'Designation:         ___________________________________________',
      'Registration No:     ___________________________________________',
      'Signature & Seal:    ___________________________________________',
      '',
      '═══════════════════════════════════════════════════════════════',
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ISAA-Certificate-${patientId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* ─── ISAA Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">ISAA — Digital Scoring Matrix</h2>
            <p className="text-xs text-slate-500">Indian Scale for Assessment of Autism • 40 Items across 6 Domains</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">{scoredItemCount}/40 items scored</p>
          <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${(scoredItemCount / 40) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── AI Pre-fill Notice ──────────────────────────────────── */}
      {aiPrefilledItems.length > 0 && (
        <div className="flex items-start gap-3 p-3 bg-teal-50 border border-teal-200 rounded-xl animate-fade-in">
          <Sparkles className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-teal-800">AI Pre-Scored Items</p>
            <p className="text-xs text-teal-700 mt-0.5">
              {aiPrefilledItems.length} item{aiPrefilledItems.length > 1 ? 's have' : ' has'} been
              pre-scored based on video telemetry analysis. Items are highlighted with a{' '}
              <span className="inline-flex items-center gap-0.5 text-teal-600"><Sparkles className="w-3 h-3" />teal</span> indicator.
              You may overwrite any AI suggestion.
            </p>
          </div>
        </div>
      )}

      {/* ─── Domain Accordions ───────────────────────────────────── */}
      <div className="space-y-2">
        {ISAA_DOMAINS.map((domain, domainIndex) => {
          const ds = domainScores[domainIndex];
          const isExpanded = expandedDomains[domainIndex] ?? false;

          return (
            <div
              key={domainIndex}
              className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-sm"
            >
              {/* Domain Header */}
              <button
                onClick={() => toggleDomain(domainIndex)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-sm font-semibold text-slate-800">{domain.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {ds.scored}/{ds.total} scored
                  </span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {ds.sum}/{ds.total * 5}
                  </span>
                </div>
              </button>

              {/* Domain Items */}
              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {domain.items.map((item) => {
                    const isAiPrefilled = aiPrefilledItems.includes(item.number);
                    const currentScore = scores[item.number] || 0;

                    return (
                      <div
                        key={item.number}
                        className={`flex flex-col gap-2 px-4 py-3 transition-colors ${
                          isAiPrefilled ? 'bg-teal-50/60' : 'bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Item Label & AI Badges */}
                          <div className="flex items-start gap-2 sm:w-2/5 min-w-0">
                            <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">
                              {item.number}
                            </span>
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-start gap-1.5">
                                {isAiPrefilled && (
                                  <Sparkles className="w-3.5 h-3.5 text-teal-500 mt-0.5 flex-shrink-0" />
                                )}
                                <span className="text-sm text-slate-700 leading-snug">{item.text}</span>
                              </div>

                              {/* AI Prediction & Override Toggle */}
                              {isAiPrefilled && (
                                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                                    <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                                    AI Predicted: Score {getOriginalScore(item.number)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleOverride(item.number)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                      isOverrideActive(item.number)
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-xs'
                                        : 'bg-white text-teal-700 border border-teal-300 hover:bg-teal-50 shadow-xs'
                                    }`}
                                    title="Allow modifying this AI prediction"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    {isOverrideActive(item.number) ? 'Override Active' : 'Override AI Prediction'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Score Radio Buttons */}
                          <div className="flex items-center gap-1 sm:w-3/5 justify-end">
                            {[1, 2, 3, 4, 5].map((score) => {
                              const isOriginalAi = isAiPrefilled && getOriginalScore(item.number) === score;
                              const isSelected = currentScore === score;

                              return (
                                <button
                                  key={score}
                                  onClick={() => {
                                    if (isAiPrefilled && !isOverrideActive(item.number)) {
                                      handleToggleOverride(item.number);
                                    }
                                    onScoreChange(item.number, score);
                                  }}
                                  title={`${SCORE_LABELS[score].label} (${SCORE_LABELS[score].range})${isOriginalAi ? ' - AI Original' : ''}`}
                                  className={`relative flex flex-col items-center justify-center w-14 h-12 rounded-lg border text-xs font-medium transition-all duration-150 ${
                                    isSelected
                                      ? isAiPrefilled && isSelected && !isOverrideActive(item.number)
                                        ? 'bg-teal-100 border-teal-400 text-teal-800 ring-2 ring-teal-300 shadow-sm'
                                        : 'bg-indigo-100 border-indigo-400 text-indigo-800 ring-2 ring-indigo-300 shadow-sm'
                                      : isOriginalAi
                                      ? 'bg-teal-50/50 border-teal-200 text-teal-700 hover:bg-teal-100/50'
                                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                                  }`}
                                >
                                  <span className="font-bold text-sm">{score}</span>
                                  <span className="text-[9px] leading-none opacity-70">{SCORE_LABELS[score].label}</span>
                                  {isOriginalAi && !isSelected && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" />
                                  )}
                                </button>
                              );
                            })}

                            {/* Clear button */}
                            {currentScore > 0 && (
                              <button
                                onClick={() => {
                                  if (isAiPrefilled && !isOverrideActive(item.number)) {
                                    handleToggleOverride(item.number);
                                  }
                                  onScoreChange(item.number, 0);
                                }}
                                className="ml-1 w-8 h-12 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-all"
                                title="Clear score"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Mandatory Clinical Justification Textarea (Immediately displays when doctor modifies AI score) */}
                        {isAiPrefilled && currentScore > 0 && currentScore !== getOriginalScore(item.number) && (
                          <div className="mt-2 p-3 bg-amber-50/90 border border-amber-300 rounded-xl space-y-1.5 animate-fade-in">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                Clinical Justification for Score Modification *
                              </label>
                              <span className="text-[10px] font-semibold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded font-mono">
                                AI: {getOriginalScore(item.number)} ➔ Clinician: {currentScore}
                              </span>
                            </div>
                            <textarea
                              className={`w-full form-input text-xs min-h-[65px] resize-y bg-white ${
                                validationErrors?.[item.number] ? 'border-red-500 ring-2 ring-red-400' : 'border-amber-300'
                              }`}
                              placeholder="Explain clinical observations or reasons for overriding this AI-predicted score (mandatory for IIT BHU continuous learning)..."
                              value={getJustification(item.number)}
                              onChange={(e) => handleJustificationInput(item.number, e.target.value)}
                            />
                            {validationErrors?.[item.number] && (
                              <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5 text-red-500" />
                                {validationErrors[item.number]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Sticky Summary Card ─────────────────────────────────── */}
      <div className={`sticky bottom-4 z-40 rounded-2xl border-2 ${severity.borderColor} ${severity.bgColor} p-5 shadow-lg backdrop-blur-sm`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Score & Severity */}
          <div className="flex items-center gap-6">
            {/* Total Score */}
            <div className="text-center">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Score</p>
              <p className="text-3xl font-extrabold text-slate-800">{effectiveTotal}</p>
              <p className="text-[10px] text-slate-400">of 200</p>
            </div>

            {/* Divider */}
            <div className="w-px h-14 bg-slate-300/50" />

            {/* Severity Band */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Severity Classification</p>
              <div className={`flex items-center gap-2 ${severity.color}`}>
                {effectiveTotal < 70 ? (
                  <CheckCircle className="w-5 h-5" />
                ) : effectiveTotal <= 106 ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <span className="text-lg font-bold">{severity.label}</span>
              </div>
              <div className="flex gap-1 mt-1.5">
                {[
                  { range: '< 70', active: effectiveTotal < 70, color: 'bg-green-400' },
                  { range: '70–106', active: effectiveTotal >= 70 && effectiveTotal <= 106, color: 'bg-yellow-400' },
                  { range: '107–153', active: effectiveTotal > 106 && effectiveTotal <= 153, color: 'bg-orange-400' },
                  { range: '> 153', active: effectiveTotal > 153, color: 'bg-red-400' },
                ].map((band) => (
                  <div
                    key={band.range}
                    className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                      band.active ? band.color : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-14 bg-slate-300/50 hidden lg:block" />

            {/* Disability Percentage */}
            <div className="hidden lg:block">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Govt. Disability %
              </p>
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-slate-500" />
                <span className="text-2xl font-extrabold text-slate-800">
                  {disability}
                  <span className="text-sm font-semibold text-slate-400">%</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {disability === 0 ? 'Below threshold' : disability >= 100 ? 'Maximum disability' : 'Estimated'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="lg:hidden text-center px-3">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Disability</p>
              <p className="text-xl font-extrabold text-slate-800">{disability}%</p>
            </div>
            <button
              onClick={() => setShowCertificateModal(true)}
              className="btn-primary whitespace-nowrap"
              disabled={scoredItemCount < 20}
            >
              <FileText className="w-4 h-4" />
              Generate ISAA Certificate
            </button>
          </div>
        </div>

        {/* Scoring Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-200/50">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Scale:</span>
          {Object.entries(SCORE_LABELS).map(([score, info]) => (
            <span key={score} className="text-[10px] text-slate-500">
              <span className="font-bold text-slate-600">{score}</span> = {info.label} ({info.range})
            </span>
          ))}
        </div>
      </div>

      {/* ─── Certificate Modal ───────────────────────────────────── */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="clinical-card max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">ISAA Assessment Certificate</h2>
                  <p className="text-xs text-slate-500">Official format per National Trust guidelines</p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Certificate Preview */}
            <div className="bg-slate-50 rounded-xl p-6 space-y-5 border border-slate-200">
              {/* Header */}
              <div className="text-center border-b border-slate-300 pb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Government of India • National Trust
                </p>
                <h3 className="text-base font-bold text-slate-800 mt-1">
                  Indian Scale for Assessment of Autism (ISAA)
                </h3>
                <p className="text-xs text-slate-500 mt-1">Assessment Certificate</p>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 text-xs font-semibold">Patient Name</span>
                  <p className="font-bold text-slate-800">{patientName}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold">Patient ID</span>
                  <p className="font-mono font-bold text-slate-800">{patientId}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold">Age</span>
                  <p className="font-bold text-slate-800">{patientAge} months</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold">Date of Assessment</span>
                  <p className="font-bold text-slate-800">
                    {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Domain Breakdown */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Domain-Wise Scores</h4>
                <div className="space-y-2">
                  {ISAA_DOMAINS.map((domain, i) => {
                    const ds = domainScores[i];
                    const maxScore = ds.total * 5;
                    const pct = maxScore > 0 ? (ds.sum / maxScore) * 100 : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-slate-600 w-64 truncate">{domain.name}</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-14 text-right">{ds.sum}/{maxScore}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Results Box */}
              <div className={`border-2 ${severity.borderColor} ${severity.bgColor} rounded-xl p-5`}>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Total Score</p>
                    <p className="text-2xl font-extrabold text-slate-800">{effectiveTotal}/200</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Severity</p>
                    <p className={`text-xl font-extrabold ${severity.color}`}>{severity.label}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Disability %</p>
                    <p className="text-2xl font-extrabold text-slate-800">{disability}%</p>
                  </div>
                </div>
              </div>

              {/* Classification */}
              <div className="text-xs text-slate-500 space-y-1 border-t border-slate-200 pt-3">
                <p className="font-semibold text-slate-600">ISAA Classification Criteria:</p>
                <p>• Score &lt; 70: No Autism &nbsp;|&nbsp; 70–106: Mild &nbsp;|&nbsp; 107–153: Moderate &nbsp;|&nbsp; &gt; 153: Severe</p>
                <p className="mt-2 italic">
                  Assessed using the standardized ISAA instrument as prescribed under the Rights of Persons
                  with Disabilities Act, 2016 (RPwD Act) and National Trust Act, 1999.
                </p>
              </div>

              {/* Signature Lines */}
              <div className="grid grid-cols-2 gap-8 pt-6 mt-4 border-t border-slate-300">
                <div className="text-center">
                  <div className="border-b border-slate-400 mb-1 h-10" />
                  <p className="text-xs text-slate-500">Assessing Clinician</p>
                  <p className="text-[10px] text-slate-400">Name, Designation & Reg. No.</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-400 mb-1 h-10" />
                  <p className="text-xs text-slate-500">Signature & Seal</p>
                  <p className="text-[10px] text-slate-400">Date</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCertificateModal(false)} className="btn-secondary">
                Close
              </button>
              <button onClick={handleDownloadCertificate} className="btn-primary">
                <Download className="w-4 h-4" /> Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
