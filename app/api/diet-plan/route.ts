import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

/**
 * PARWAA Ayurvedic Diet & Care Plan PDF Download Route
 * Serves the official clinical guide formulated by Dr. Vaibhav Jaisawal,
 * Department of Bala Roga, Faculty of Ayurveda, IMS BHU Varanasi.
 */
export async function GET() {
  try {
    const pdfPath = path.join(process.cwd(), 'public', 'ayurvedic-diet-plan.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { error: 'PARWAA care plan document not found' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(pdfPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="PARWAA_Ayurvedic_Diet_Care_Plan.pdf"',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve PARWAA care plan document' },
      { status: 500 }
    );
  }
}
