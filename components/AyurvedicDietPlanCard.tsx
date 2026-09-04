'use client';

import React from 'react';
import ParwaaRecommendationCard from './ParwaaRecommendationCard';

interface AyurvedicDietPlanCardProps {
  childName?: string;
  childAge?: number;
  variant?: 'reward' | 'dashboard';
  className?: string;
}

/**
 * AyurvedicDietPlanCard renders the PARWAA Clinical Recommendation Framework
 * (Preventive and Remedial Education for Welfare of Autistic Children Through Ayurveda)
 * formulated by Dr. Vaibhav Jaisawal, Department of Bala Roga, Faculty of Ayurveda, IMS, BHU.
 */
export default function AyurvedicDietPlanCard({
  childName,
  childAge,
  variant = 'reward',
  className = '',
}: AyurvedicDietPlanCardProps) {
  return (
    <ParwaaRecommendationCard
      childName={childName}
      childAge={childAge}
      variant={variant}
      className={className}
    />
  );
}
