'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Volume2, VolumeX, Sparkles, Languages, CheckCircle2 } from 'lucide-react';

export interface ProtocolContent {
  id: 1 | 2 | 3;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  scriptEn: string;
  scriptHi: string;
}

export const PROTOCOL_SCRIPTS: Record<1 | 2 | 3, ProtocolContent> = {
  1: {
    id: 1,
    titleEn: 'Social Engagement',
    titleHi: 'सामाजिक जुड़ाव (नाम पुकारना)',
    subtitleEn: 'Protocol 1 • Name Call & Head Turn',
    subtitleHi: 'प्रोटोकॉल 1 • नाम पुकारना व प्रतिक्रिया',
    scriptEn:
      'Protocol 1: Social Engagement. Stand behind your child, wait until they are calm, and call their name clearly. Record their head-turn reaction time!',
    scriptHi:
      'प्रोटोकॉल 1: सामाजिक जुड़ाव। अपने बच्चे के पीछे खड़े हों और उनका नाम स्पष्ट रूप से पुकारें। रिकॉर्ड करें कि वे आपकी आवाज़ पर कितनी जल्दी मुड़ते हैं।',
  },
  2: {
    id: 2,
    titleEn: 'Free Play & Motor',
    titleHi: 'स्वतंत्र खेल (मोटर कौशल)',
    subtitleEn: 'Protocol 2 • Motor Exploration',
    subtitleHi: 'प्रोटोकॉल 2 • खिलौनों से खेलना',
    scriptEn:
      'Protocol 2: Free Play. Let your child play freely with their favorite toys for three minutes. Keep their hands and full body clearly visible in the frame.',
    scriptHi:
      'प्रोटोकॉल 2: स्वतंत्र खेल। बच्चे को तीन मिनट अपने पसंदीदा खिलौनों से खेलने दें। उनके हाथ और शरीर कैमरे में साफ़ दिखने चाहिए।',
  },
  3: {
    id: 3,
    titleEn: 'Joint Attention',
    titleHi: 'संयुक्त ध्यान (साझा ध्यान)',
    subtitleEn: 'Protocol 3 • Shared Requesting & Pointing',
    subtitleHi: 'प्रोटोकॉल 3 • वस्तु की ओर इशारा',
    scriptEn:
      "Protocol 3: Joint Attention. Point to an object across the room and say 'Look at that!'. Record whether your child follows your pointing finger and gaze.",
    scriptHi:
      "प्रोटोकॉल 3: संयुक्त ध्यान। कमरे में किसी वस्तु की ओर इशारा करें और कहें 'वहाँ देखो!'. देखें कि क्या बच्चा आपकी उंगली और नज़र का पीछा करता है।",
  },
};

/**
 * Returns the mapped image path based on active protocol and selected language.
 * Uses the high-resolution protocol cards generated from user clinical assets.
 */
export function getProtocolImagePath(protocolId: 1 | 2 | 3, language: 'en-US' | 'hi-IN'): string {
  const langKey = language === 'hi-IN' ? 'hi' : 'en';
  return `/protocol_${protocolId}_${langKey}.png`;
}

interface ProtocolGuideViewerProps {
  className?: string;
  activeStep?: number;
  onProtocolChange?: (protocolId: 1 | 2 | 3) => void;
}

export default function ProtocolGuideViewer({
  className = '',
  activeStep = 1,
  onProtocolChange,
}: ProtocolGuideViewerProps) {
  // 1. State: language ('en-US' or 'hi-IN') and activeProtocol (1, 2, or 3)
  const [language, setLanguage] = useState<'en-US' | 'hi-IN'>('en-US');
  const [activeProtocol, setActiveProtocol] = useState<1 | 2 | 3>(
    activeStep === 2 ? 2 : activeStep === 3 ? 3 : 1
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  // Sync with activeStep prop if changed externally
  useEffect(() => {
    if (activeStep === 1 || activeStep === 2 || activeStep === 3) {
      setActiveProtocol(activeStep as 1 | 2 | 3);
    }
  }, [activeStep]);

  // Load and cache available voices on mount using window.speechSynthesis.getVoices()
  useEffect(() => {
    setHasMounted(true);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const loadVoices = () => {
      try {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices && availableVoices.length > 0) {
          setVoices(availableVoices);
        }
      } catch {
        // Fail silently
      }
    };

    loadVoices();

    try {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    } catch {
      // Fail silently
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.onvoiceschanged = null;
        } catch {
          // Fail silently
        }
      }
    };
  }, []);

  // 2. speakInstructions(protocolId, lang) using native Web Speech API
  const speakInstructions = useCallback(
    (protocolId?: 1 | 2 | 3, langOverride?: 'en-US' | 'hi-IN') => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      const targetProto = protocolId ?? activeProtocol;
      const targetLang = langOverride ?? language;

      // Ensure window.speechSynthesis.cancel() is called before speaking
      try {
        window.speechSynthesis.cancel();
      } catch {}

      const text =
        targetLang === 'hi-IN'
          ? PROTOCOL_SCRIPTS[targetProto].scriptHi
          : PROTOCOL_SCRIPTS[targetProto].scriptEn;

      // Create new SpeechSynthesisUtterance, pitch = 1.4, rate = 0.9
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      utterance.pitch = 1.4;
      utterance.rate = 0.9;
      utterance.volume = 1.0;

      // Attach appropriate language voice if found
      if (voices.length > 0) {
        const match = voices.find((v) => {
          const vLang = v.lang.toLowerCase();
          if (targetLang === 'hi-IN') {
            return vLang === 'hi-in' || vLang.startsWith('hi');
          } else {
            return vLang === 'en-us' || vLang === 'en_us' || vLang.startsWith('en');
          }
        });
        if (match) {
          utterance.voice = match;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsSpeaking(false);
      }
    },
    [activeProtocol, language, voices]
  );

  // Switching language immediately updates displayed image and TTS language
  const handleLanguageChange = (newLang: 'en-US' | 'hi-IN') => {
    setLanguage(newLang);
    speakInstructions(activeProtocol, newLang);
  };

  // Clicking protocol card updates activeProtocol, displayed image, spoken guidance, and narration
  const handleProtocolClick = (protocolId: 1 | 2 | 3) => {
    setActiveProtocol(protocolId);
    if (onProtocolChange) {
      onProtocolChange(protocolId);
    }
    speakInstructions(protocolId, language);
  };

  const activeContent = PROTOCOL_SCRIPTS[activeProtocol];
  const spokenGuidanceText = language === 'hi-IN' ? activeContent.scriptHi : activeContent.scriptEn;
  const currentImagePath = getProtocolImagePath(activeProtocol, language);

  return (
    <div
      className={`clinical-card overflow-hidden border-2 border-teal-100/90 bg-gradient-to-br from-white via-teal-50/25 to-sky-50/30 p-5 mb-6 shadow-sm ${className}`}
    >
      {/* ─── Top Row: Title & Language Toggle Buttons ──────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-teal-100/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-base shadow-sm">
            <Languages className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>Interactive Protocol Visual Guide</span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Visual &amp; Voice Assisted
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Clinical Recording Instructions • Pediatric ASD Video Screening
            </p>
          </div>
        </div>

        {/* Pill-Shaped Language Toggle */}
        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-full border border-slate-200/80 shadow-xs self-start sm:self-center">
          <button
            type="button"
            onClick={() => handleLanguageChange('en-US')}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
              language === 'en-US'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Switch protocol guide to English"
          >
            English
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('hi-IN')}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
              language === 'hi-IN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="प्रोटोकॉल गाइड भाषा को हिंदी में बदलें"
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* ─── Middle Section: Image Viewer & Spoken Guidance Bubble ──────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column: 2D Dynamic Image Viewer */}
        <div className="md:col-span-5 flex flex-col">
          <div
            onClick={() => speakInstructions(activeProtocol, language)}
            className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-inner group cursor-pointer transition-all duration-200 hover:border-emerald-400 hover:shadow-md"
            title="Click image to listen to audio guidance"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                speakInstructions(activeProtocol, language);
              }
            }}
          >
            {/* Top Status Overlay Badge */}
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur shadow-sm border border-emerald-200 text-[10px] font-bold text-emerald-900">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSpeaking ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                }`}
              />
              <span>{isSpeaking ? 'Narrating Protocol...' : 'Click Card to Listen'}</span>
            </div>

            {/* Protocol Number Badge */}
            <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold tracking-wide backdrop-blur">
              P{activeProtocol} • {language === 'hi-IN' ? 'हिंदी' : 'EN'}
            </div>

            {/* Dynamic Protocol Image */}
            <div className="w-full h-[380px] relative flex items-center justify-center p-2">
              <Image
                src={currentImagePath}
                alt={`Protocol ${activeProtocol} guide`}
                width={901}
                height={1417}
                unoptimized
                priority
                className="w-full h-[380px] object-contain bg-slate-50 rounded-lg shadow-inner cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </div>
          </div>

          {/* Listen Button Directly Beneath Image */}
          <button
            type="button"
            onClick={() => {
              if (isSpeaking) {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
              } else {
                speakInstructions(activeProtocol, language);
              }
            }}
            className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isSpeaking
                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700/20'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 text-amber-700" />
                <span>Stop Speaking / बोलना रोकें</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-white" />
                <span>
                  {language === 'hi-IN'
                    ? 'निर्देश सुनें (Listen to Instructions)'
                    : 'Listen to Instructions / निर्देश सुनें'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Dynamic Spoken Guidance Bubble & Details */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div className="relative bg-white rounded-2xl p-5 sm:p-6 border border-emerald-100 shadow-sm flex flex-col justify-between min-h-[380px]">
            {/* Bubble Tail */}
            <div className="hidden md:block absolute -left-2 top-10 w-4 h-4 bg-white border-l border-b border-emerald-100 transform rotate-45" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    SPOKEN GUIDANCE
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {language === 'hi-IN' ? activeContent.subtitleHi : activeContent.subtitleEn}
                  </span>
                  {isSpeaking && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                      <Volume2 className="w-3 h-3 text-amber-600" /> Speaking Now
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {language === 'hi-IN' ? 'Web Speech API (hi-IN)' : 'Web Speech API (en-US)'}
                </span>
              </div>

              {/* Dynamic Transcription Box */}
              <blockquote className="p-4 bg-slate-50/90 rounded-xl border border-slate-100 text-sm sm:text-base text-slate-800 leading-relaxed font-medium italic">
                &ldquo;{spokenGuidanceText}&rdquo;
              </blockquote>

              {/* Clinical Recording Instructions Breakdown */}
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100/70 text-xs text-slate-700 space-y-2">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Clinical Recording Recommendations:</span>
                </div>
                {activeProtocol === 1 && (
                  <ul className="list-disc list-inside space-y-1 text-[12px] text-slate-600 pl-1">
                    <li>Position the camera at the child&apos;s eye level, 1–2 meters away.</li>
                    <li>Call their name clearly 3–4 times from behind or slightly to the side.</li>
                    <li>Do not tap their shoulder or touch them before calling.</li>
                  </ul>
                )}
                {activeProtocol === 2 && (
                  <ul className="list-disc list-inside space-y-1 text-[12px] text-slate-600 pl-1">
                    <li>Keep the child&apos;s full body and hands in frame throughout the 3 minutes.</li>
                    <li>Place a diverse set of toys (blocks, spinning items, stacking cups).</li>
                    <li>Allow independent free play without parent interference or prompting.</li>
                  </ul>
                )}
                {activeProtocol === 3 && (
                  <ul className="list-disc list-inside space-y-1 text-[12px] text-slate-600 pl-1">
                    <li>Point distinctly across the room towards an interesting object or toy.</li>
                    <li>Say &ldquo;Look at that!&rdquo; or &ldquo;वहाँ देखो!&rdquo; with enthusiasm.</li>
                    <li>Capture whether the child alternates gaze between your finger and the target.</li>
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>IIT BHU Pediatric ASD Screening CDS System</span>
              <span>Voice Pitch: 1.4 • Rate: 0.9</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: 3 Clickable Protocol Cards ─────────────────── */}
      <div className="mt-5 pt-4 border-t border-teal-100/70">
        <p className="text-xs font-semibold text-slate-600 mb-2.5">
          Select a standardized protocol step to view its clinical visual guide &amp; audio instructions:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([1, 2, 3] as const).map((protoId) => {
            const proto = PROTOCOL_SCRIPTS[protoId];
            const isActive = activeProtocol === protoId;

            return (
              <div
                key={protoId}
                onClick={() => handleProtocolClick(protoId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProtocolClick(protoId);
                  }
                }}
                className={`p-3.5 rounded-xl cursor-pointer transition-all duration-200 border-2 shadow-xs ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-emerald-300'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Protocol {protoId}
                  </span>
                  <div className="flex items-center gap-1">
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    <Volume2
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <h4 className="text-xs font-bold leading-tight mb-1">
                  {language === 'hi-IN' ? proto.titleHi : proto.titleEn}
                </h4>

                <p className="text-[11px] leading-snug line-clamp-2 opacity-80">
                  {language === 'hi-IN' ? proto.scriptHi : proto.scriptEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
