'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { BiomarkerResult } from '@/lib/types';

interface BiomarkerChartProps {
  biomarkers: BiomarkerResult;
}

export default function BiomarkerChart({ biomarkers }: BiomarkerChartProps) {
  // Normalize all biomarkers to 0-100 scale for radar chart
  const data = [
    {
      metric: 'Name-Call\nResponse',
      patient: Math.max(0, Math.min(100, 100 - ((biomarkers.nameCallLatency.measured / 5) * 100))),
      normative: Math.max(0, Math.min(100, 100 - ((biomarkers.nameCallLatency.normalMax / 5) * 100))),
    },
    {
      metric: 'Social\nGaze',
      patient: biomarkers.socialGazeRatio.measured,
      normative: (biomarkers.socialGazeRatio.normalMin + biomarkers.socialGazeRatio.normalMax) / 2,
    },
    {
      metric: 'Motor\nControl',
      patient: Math.max(0, Math.min(100, 100 - ((biomarkers.motorStereotypyIndex.frequency / 10) * 100))),
      normative: Math.max(0, Math.min(100, 100 - ((biomarkers.motorStereotypyIndex.normalMaxFrequency / 10) * 100))),
    },
    {
      metric: 'Joint\nAttention',
      patient: Math.min(100, (biomarkers.jointAttentionEpisodes.count / 10) * 100),
      normative: Math.min(100, (biomarkers.jointAttentionEpisodes.normalMin / 10) * 100),
    },
    {
      metric: 'Vocal\nTurn-Taking',
      patient: Math.min(100, (biomarkers.speechProsody.vocalTurnTaking / 10) * 100),
      normative: Math.min(100, (biomarkers.speechProsody.normalTurnTakingMin / 10) * 100),
    },
  ];

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickCount={5}
          />
          <Radar
            name="Normative Benchmark"
            dataKey="normative"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="6 4"
          />
          <Radar
            name="Patient"
            dataKey="patient"
            stroke="#0d9488"
            fill="#0d9488"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, fontWeight: 500 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            formatter={(value) => [`${Math.round(Number(value))}%`, '']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
