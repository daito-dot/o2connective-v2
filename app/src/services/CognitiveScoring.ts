/**
 * 認知能力テスト スコアリングサービス
 */

import type {
  CognitiveAnswer,
  CognitiveTestType,
  CognitiveResult,
  CognitiveLevel,
} from '@/types/assessment';
import { ICAR_16_ITEMS } from '@/data/cognitiveTests';

// =============================================================================
// 規準データ（ICAR-16の標準化データに基づく）
// =============================================================================

/** 標準化パラメータ */
const NORM_PARAMETERS = {
  // ICAR-16の規準データ（成人サンプル）
  mean: 8.5,      // 平均正答数
  sd: 3.2,        // 標準偏差
  n: 1000,        // サンプルサイズ
};

/** パーセンタイル対応表 */
const PERCENTILE_TABLE: Record<number, number> = {
  0: 1, 1: 2, 2: 5, 3: 10, 4: 16,
  5: 25, 6: 35, 7: 45, 8: 50, 9: 55,
  10: 65, 11: 75, 12: 84, 13: 90, 14: 95,
  15: 98, 16: 99,
};

// =============================================================================
// スコアリングクラス
// =============================================================================

export class CognitiveScoring {
  /**
   * 回答から結果を計算
   */
  calculateResult(answers: CognitiveAnswer[]): CognitiveResult {
    // タイプ別の正答数を計算
    const rawScores = this.calculateRawScores(answers);

    // 正規化スコアを計算
    const normalizedScores = this.normalizeScores(rawScores.total);

    // 時間データを計算
    const timingData = this.calculateTimingData(answers);

    return {
      rawScores,
      normalizedScores,
      timingData,
    };
  }

  /**
   * 生スコア（正答数）を計算
   */
  private calculateRawScores(answers: CognitiveAnswer[]): CognitiveResult['rawScores'] {
    const scores: Record<CognitiveTestType, number> = {
      matrix_reasoning: 0,
      letter_number_series: 0,
      verbal_reasoning: 0,
      '3d_rotation': 0,
    };

    for (const answer of answers) {
      if (answer.isCorrect) {
        scores[answer.itemType]++;
      }
    }

    return {
      matrixReasoning: scores.matrix_reasoning,
      letterNumberSeries: scores.letter_number_series,
      verbalReasoning: scores.verbal_reasoning,
      rotation3d: scores['3d_rotation'],
      total: Object.values(scores).reduce((a, b) => a + b, 0),
    };
  }

  /**
   * スコアを正規化
   */
  private normalizeScores(totalCorrect: number): CognitiveResult['normalizedScores'] {
    // パーセンタイルランクを取得
    const percentileRank = PERCENTILE_TABLE[totalCorrect] ?? this.estimatePercentile(totalCorrect);

    // 標準スコア（IQ様式：平均100、SD15）を計算
    const zScore = (totalCorrect - NORM_PARAMETERS.mean) / NORM_PARAMETERS.sd;
    const standardScore = Math.round(100 + (zScore * 15));

    // 相対位置を判定
    const relativePosition = this.determineRelativePosition(standardScore);

    return {
      percentileRank,
      standardScore: Math.max(55, Math.min(145, standardScore)), // 55-145の範囲にクリップ
      relativePosition,
    };
  }

  /**
   * パーセンタイルを推定（テーブルにない場合）
   */
  private estimatePercentile(score: number): number {
    const zScore = (score - NORM_PARAMETERS.mean) / NORM_PARAMETERS.sd;
    const percentile = this.normalCDF(zScore) * 100;
    return Math.max(1, Math.min(99, Math.round(percentile)));
  }

  /**
   * 標準正規分布の累積分布関数
   */
  private normalCDF(z: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * z);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

    return 0.5 * (1.0 + sign * y);
  }

  /**
   * 相対位置を判定
   */
  private determineRelativePosition(standardScore: number): CognitiveLevel {
    if (standardScore >= 130) return 'significantly_above_average';
    if (standardScore >= 115) return 'above_average';
    if (standardScore >= 85) return 'average';
    if (standardScore >= 70) return 'below_average';
    return 'significantly_below_average';
  }

  /**
   * 時間データを計算
   */
  private calculateTimingData(answers: CognitiveAnswer[]): CognitiveResult['timingData'] {
    const totalTime = answers.reduce((sum, a) => sum + (a.responseTimeMs || 0), 0);
    const averageTimePerItem = answers.length > 0 ? totalTime / answers.length : 0;

    const timeByType: Record<CognitiveTestType, number> = {
      matrix_reasoning: 0,
      letter_number_series: 0,
      verbal_reasoning: 0,
      '3d_rotation': 0,
    };

    const countByType: Record<CognitiveTestType, number> = {
      matrix_reasoning: 0,
      letter_number_series: 0,
      verbal_reasoning: 0,
      '3d_rotation': 0,
    };

    for (const answer of answers) {
      timeByType[answer.itemType] += answer.responseTimeMs || 0;
      countByType[answer.itemType]++;
    }

    // 平均時間に変換
    for (const type of Object.keys(timeByType) as CognitiveTestType[]) {
      if (countByType[type] > 0) {
        timeByType[type] = Math.round(timeByType[type] / countByType[type]);
      }
    }

    return {
      totalTime,
      averageTimePerItem: Math.round(averageTimePerItem),
      timeByType,
    };
  }

  /**
   * 相対位置の説明を取得
   */
  getRelativePositionDescription(level: CognitiveLevel): string {
    const descriptions: Record<CognitiveLevel, string> = {
      significantly_above_average: '論理的推論や問題解決において非常に高い能力を示しています。複雑な情報を素早く処理し、パターンを見出す力が優れています。',
      above_average: '論理的推論や問題解決において平均以上の能力を示しています。新しい情報を効率的に学習・適用できます。',
      average: '論理的推論や問題解決において一般的な水準の能力を示しています。多くの業務に必要な認知能力を備えています。',
      below_average: '特定の認知課題において追加のサポートや学習時間が効果的な場合があります。得意分野を活かした役割が推奨されます。',
      significantly_below_average: '個別のサポートや適切な環境設定が効果的です。強みを活かした業務配置を検討することをお勧めします。',
    };
    return descriptions[level];
  }

  /**
   * タイプ別の強み・弱みを分析
   */
  analyzeStrengthsAndWeaknesses(rawScores: CognitiveResult['rawScores']): {
    strengths: CognitiveTestType[];
    weaknesses: CognitiveTestType[];
  } {
    const typeScores: { type: CognitiveTestType; score: number; max: number }[] = [
      { type: 'matrix_reasoning', score: rawScores.matrixReasoning, max: 4 },
      { type: 'letter_number_series', score: rawScores.letterNumberSeries, max: 4 },
      { type: 'verbal_reasoning', score: rawScores.verbalReasoning, max: 4 },
      { type: '3d_rotation', score: rawScores.rotation3d, max: 4 },
    ];

    // 正答率を計算
    const ratedScores = typeScores.map(ts => ({
      ...ts,
      rate: ts.score / ts.max,
    }));

    // 平均正答率
    const avgRate = ratedScores.reduce((sum, ts) => sum + ts.rate, 0) / ratedScores.length;

    // 平均より高いものを強み、低いものを弱みとする
    const strengths = ratedScores
      .filter(ts => ts.rate > avgRate + 0.1) // 平均+10%以上
      .map(ts => ts.type);

    const weaknesses = ratedScores
      .filter(ts => ts.rate < avgRate - 0.1) // 平均-10%以下
      .map(ts => ts.type);

    return { strengths, weaknesses };
  }
}

// シングルトンインスタンス
export const cognitiveScoring = new CognitiveScoring();
