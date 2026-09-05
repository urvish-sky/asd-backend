'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, CheckCircle, FileVideo, AlertCircle, ChevronDown, ChevronUp, Sparkles, Activity } from 'lucide-react';
import { VideoAnalysisResult } from '@/lib/types';

const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_SIZE = 150 * 1024 * 1024; // 150 MB

const validateFile = (file: File): string | null => {
  if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(mp4|mov|webm)$/i)) {
    return 'Invalid format. Please upload MP4, MOV, or WebM files only.';
  }
  if (file.size > MAX_SIZE) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 150 MB.`;
  }
  return null;
};

interface VideoUploadCardProps {
  slotNumber: 1 | 2 | 3;
  title: string;
  instructions: string;
  markersAnalyzed: string[];
  onUploadComplete: (
    slotNumber: 1 | 2 | 3,
    fileName: string,
    fileSize: number,
    analysisResult?: VideoAnalysisResult
  ) => void;
  isUploaded: boolean;
  analysisResult?: VideoAnalysisResult;
}

export default function VideoUploadCard({
  slotNumber,
  title,
  instructions,
  markersAnalyzed,
  onUploadComplete,
  isUploaded,
  analysisResult,
}: VideoUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('Uploading video...');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [localAnalysis, setLocalAnalysis] = useState<VideoAnalysisResult | undefined>(analysisResult);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);


  const uploadAndAnalyze = useCallback(
    async (file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setFileName(file.name);
      setUploading(true);
      setProgress(10);
      setStatusMessage('Uploading to MediaPipe CV pipeline...');

      // Clear any prior interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Progress simulation during network upload & frame processing
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) return prev;
          return prev + Math.floor(Math.random() * 8 + 4);
        });
      }, 300);

      // Timeout safeguard: abort fetch after 3 minutes (180,000 ms) to prevent indefinite stalling
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 180000);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const endpoint = `${API_BASE_URL.replace(/\/+$/, '')}/api/upload`;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('protocol_number', String(slotNumber));

        console.log(
          `[VideoUploadCard] Initiating upload of "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) to: ${endpoint}`
        );

        // Send multipart/form-data request to FastAPI video upload endpoint
        let response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        // Fallback to /api/analyze if /api/upload returns 404
        if (!response.ok && response.status === 404) {
          console.warn('[VideoUploadCard] /api/upload returned 404, attempting fallback to /api/analyze');
          response = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/api/analyze`, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });
        }

        clearTimeout(timeoutId);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        console.log(`[VideoUploadCard] Response HTTP Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          console.error(`[VideoUploadCard] Backend returned HTTP ${response.status}:`, errorText);
          throw new Error(`Server returned HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const result: VideoAnalysisResult = await response.json();
        console.log('[VideoUploadCard] Behavioral telemetry extracted successfully:', result);

        // Create an object URL for instant client-side playback fallback
        const localBlobUrl = URL.createObjectURL(file);
        if (result) {
          if (!result.video_url && result.filename) {
            result.video_url = `${API_BASE_URL.replace(/\/+$/, '')}/videos/${result.filename}`;
          }
          if (!result.video_url) {
            result.video_url = localBlobUrl;
          }
        }

        // Jump progress to 100% on successful completion
        setProgress(100);
        setStatusMessage(result.message || 'Telemetry & ISAA flags extracted successfully');
        setLocalAnalysis(result);

        setTimeout(() => {
          setUploading(false);
          onUploadComplete(slotNumber, file.name, file.size, result);
        }, 400);
      } catch (err) {
        clearTimeout(timeoutId);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        const isTimeout = err instanceof Error && err.name === 'AbortError';
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === 'string'
            ? err
            : 'Failed to process video with backend CV pipeline';

        const displayErrorMessage = isTimeout
          ? 'Upload timed out after 3 minutes. Please ensure the backend server is active and try again.'
          : `Upload error: ${errorMessage}`;

        console.error('[VideoUploadCard] Upload/Analysis error caught:', err);

        // Reset state cleanly so user is not stuck
        setUploading(false);
        setProgress(0);
        setStatusMessage('Upload failed');
        setError(displayErrorMessage);
      }
    },
    [slotNumber, onUploadComplete]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadAndAnalyze(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAndAnalyze(file);
  };

  const displayAnalysis = localAnalysis || analysisResult;

  return (
    <div className="clinical-card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
              isUploaded
                ? 'bg-green-100 text-green-700'
                : 'bg-teal-100 text-teal-700'
            }`}
          >
            {isUploaded ? <CheckCircle className="w-5 h-5" /> : slotNumber}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Video Slot {slotNumber} • MediaPipe CV Analyzed</p>
          </div>
        </div>
        {isUploaded && (
          <span className="badge badge-typical">
            <CheckCircle className="w-3 h-3" /> CV Analyzed
          </span>
        )}
      </div>

      {/* Instructions Accordion */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 mb-3 transition-colors"
      >
        {showInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        Recording Protocol & Instructions
      </button>
      {showInstructions && (
        <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 mb-4 animate-fade-in">
          <p className="text-sm text-slate-700 leading-relaxed mb-3">{instructions}</p>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1.5">Markers Analyzed:</p>
            <div className="flex flex-wrap gap-1.5">
              {markersAnalyzed.map((marker) => (
                <span
                  key={marker}
                  className="inline-flex items-center px-2 py-0.5 bg-white border border-teal-200 rounded-md text-[11px] font-medium text-teal-700"
                >
                  {marker}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {!isUploaded && !uploading && (
        <div
          className={`dropzone ${isDragging ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">
            Drag & drop your video here, or{' '}
            <span className="text-teal-600 underline underline-offset-2">browse files</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">MP4, MOV, or WebM • MediaPipe Holistic Vision Pipeline</p>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2 truncate">
              <FileVideo className="w-4 h-4 text-teal-600 animate-pulse" />
              <span className="truncate">{fileName}</span>
            </div>
            <span className="text-xs text-teal-600 font-semibold">{statusMessage}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 text-right">{Math.round(progress)}% processed</p>
        </div>
      )}

      {/* Uploaded State with Telemetry Feedback */}
      {isUploaded && !uploading && (
        <div className="space-y-3">
          <div className="dropzone uploaded flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-green-700">{fileName || 'Video processed'}</p>
                <p className="text-xs text-green-600">MediaPipe Computer Vision telemetry extracted</p>
              </div>
            </div>
          </div>

          {/* Telemetry Summary Badges */}
          {displayAnalysis?.telemetry && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-teal-600" /> Extracted CV Telemetry:
                </span>
                <span className="text-[11px] text-slate-400">
                  {displayAnalysis.telemetry.processed_frames} frames ({displayAnalysis.telemetry.duration_seconds}s)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-slate-500">Face Visibility (Gaze):</span>{' '}
                  <span className="font-bold text-slate-800">
                    {Math.round((displayAnalysis.telemetry.face_visibility_ratio || 0) * 100)}%
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-slate-500">Wrist Motion Velocity:</span>{' '}
                  <span className="font-bold text-slate-800">
                    {displayAnalysis.telemetry.avg_wrist_velocity || 0}
                  </span>
                </div>
              </div>

              {/* ISAA Pre-score flags indicator */}
              {displayAnalysis.isaa_flags && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {displayAnalysis.isaa_flags.item_2_poor_eye_contact && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-medium text-[10px]">
                      <Sparkles className="w-3 h-3 text-teal-600" /> ISAA Item 2 Pre-Scored (Poor Eye Contact)
                    </span>
                  )}
                  {displayAnalysis.isaa_flags.item_25_motor_stereotypies && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-medium text-[10px]">
                      <Sparkles className="w-3 h-3 text-teal-600" /> ISAA Item 25 Pre-Scored (Motor Stereotypy)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
