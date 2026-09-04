import { NextResponse } from 'next/server';
import { mockPatients } from '@/lib/mockData';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockPatients,
    count: mockPatients.length,
  });
}
