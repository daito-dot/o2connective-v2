/**
 * AI解釈APIエンドポイント
 * POST /api/interpret
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiInterpretationService } from '@/services/AIInterpretation';
import type { DomainScore, ReliabilityMetrics, AnalysisPurpose } from '@/types/assessment';

interface InterpretRequest {
  domainScores: DomainScore[];
  reliabilityMetrics: ReliabilityMetrics;
  purpose: AnalysisPurpose;
}

export async function POST(request: NextRequest) {
  try {
    const body: InterpretRequest = await request.json();
    const { domainScores, reliabilityMetrics, purpose } = body;

    // バリデーション
    if (!domainScores || !reliabilityMetrics || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // AI解釈を取得
    const interpretation = await aiInterpretationService.interpret(
      domainScores,
      reliabilityMetrics,
      purpose
    );

    return NextResponse.json(interpretation);
  } catch (error) {
    console.error('Interpretation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
