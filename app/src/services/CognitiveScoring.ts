/**
 * 認知能力テスト スコアリングサービス
 * jsPsychパラダイムベース（N-back, Stroop, Simple RT）
 */

import type {
  CognitiveAnswer,
  CognitiveTestType,
  CognitiveDomain,
  CognitiveResult,
  CognitiveLevel,
  CognitiveDomainScore,
} from '@/types/assessment';

// =============================================================================
// 規準データ（各パラダイムの標準化データに基づく）
// =============================================================================

/** N-back規準データ（2-back、成人サンプル） */
const NBACK_NORMS = {
  accuracy: { mean: 0.75, sd: 0.12 },
  rt: { mean: 650, sd: 150 },  // ms
};

/** Stroop規準データ（成人サンプル） */
const STROOP_NORMS = {
  accuracy: { mean: 0.85, sd: 0.10 },
  rt: { mean: 750, sd: 120 },  // ms
  // 干渉効果の規準
  interferenceEffect: { mean: 100, sd: 50 },  // 不一致-一致のRT差
};

/** 単純反応時間規準データ（成人サンプル） */
const SIMPLE_RT_NORMS = {
  rt: { mean: 280, sd: 40 },  // ms
  sd: { mean: 50, sd: 20 },    // 反応時間の変動性
};

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * 標準正規分布の累積分布関数
 */
function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * absZ);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Z-scoreをパーセンタイルに変換
 */
function zToPercentile(z: number): number {
  const percentile = normalCDF(z) * 100;
  return Math.max(1, Math.min(99, Math.round(percentile)));
}

/**
 * パーセンタイルから認知レベルを判定
 */
function percentileToLevel(percentile: number): CognitiveLevel {
  if (percentile >= 98) return 'significantly_above_average';
  if (percentile >= 84) return 'above_average';
  if (percentile >= 16) return 'average';
  if (percentile >= 2) return 'below_average';
  return 'significantly_below_average';
}

/**
 * 平均と標準偏差を計算
 */
function calculateStats(values: number[]): { mean: number; sd: number } {
  if (values.length === 0) return { mean: 0, sd: 0 };

  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  if (values.length < 2) return { mean, sd: 0 };

  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  const sd = Math.sqrt(variance);

  return { mean, sd };
}

// =============================================================================
// スコアリングクラス
// =============================================================================

export class CognitiveScoring {
  /**
   * 全テスト結果から認知能力結果を計算
   */
  calculateResult(
    allAnswers: Record<CognitiveTestType, CognitiveAnswer[]>,
    totalTestTime: number
  ): CognitiveResult {
    // ドメイン別スコアを計算
    const workingMemoryScore = this.calculateNBackScore(allAnswers.n_back);
    const inhibitionScore = this.calculateStroopScore(allAnswers.stroop);
    const processingSpeedScore = this.calculateSimpleRTScore(allAnswers.simple_rt);

    // 総合スコアを計算
    const compositePercentile = Math.round(
      (workingMemoryScore.percentile + inhibitionScore.percentile + processingSpeedScore.percentile) / 3
    );

    // 標準スコア（平均100、SD15）に変換
    const compositeZ = (compositePercentile - 50) / 34;
    const standardScore = Math.round(100 + compositeZ * 15);
    const clampedStandardScore = Math.max(55, Math.min(145, standardScore));

    // 信頼性を評価
    const validTrials =
      allAnswers.n_back.filter(a => a.responseTimeMs > 100 && a.responseTimeMs < 3000).length +
      allAnswers.stroop.filter(a => a.responseTimeMs > 100 && a.responseTimeMs < 3000).length +
      allAnswers.simple_rt.filter(a => a.responseTimeMs > 50 && a.responseTimeMs < 1500).length;

    const invalidTrials =
      allAnswers.n_back.filter(a => a.responseTimeMs <= 100 || a.responseTimeMs >= 3000).length +
      allAnswers.stroop.filter(a => a.responseTimeMs <= 100 || a.responseTimeMs >= 3000).length +
      allAnswers.simple_rt.filter(a => a.responseTimeMs <= 50 || a.responseTimeMs >= 1500).length;

    const totalTrials = allAnswers.n_back.length + allAnswers.stroop.length + allAnswers.simple_rt.length;
    const isReliable = totalTrials > 0 && (validTrials / totalTrials) >= 0.8;

    return {
      domainScores: {
        working_memory: workingMemoryScore,
        inhibition: inhibitionScore,
        processing_speed: processingSpeedScore,
      },
      overallScore: {
        compositePercentile,
        standardScore: clampedStandardScore,
        level: percentileToLevel(compositePercentile),
      },
      testDetails: [
        this.getTestDetails(allAnswers.n_back, 'n_back'),
        this.getTestDetails(allAnswers.stroop, 'stroop'),
        this.getTestDetails(allAnswers.simple_rt, 'simple_rt'),
      ],
      timingData: {
        totalTime: totalTestTime,
        timeByTest: {
          n_back: allAnswers.n_back.reduce((sum, a) => sum + a.responseTimeMs, 0),
          stroop: allAnswers.stroop.reduce((sum, a) => sum + a.responseTimeMs, 0),
          simple_rt: allAnswers.simple_rt.reduce((sum, a) => sum + a.responseTimeMs, 0),
        },
      },
      reliability: {
        validTrials,
        invalidTrials,
        isReliable,
      },
    };
  }

  /**
   * N-backスコアを計算
   */
  private calculateNBackScore(answers: CognitiveAnswer[]): CognitiveDomainScore {
    const validAnswers = answers.filter(a => a.responseTimeMs > 100 && a.responseTimeMs < 3000);
    const correctAnswers = validAnswers.filter(a => a.isCorrect);

    const accuracy = validAnswers.length > 0 ? correctAnswers.length / validAnswers.length : 0;
    const correctRTs = correctAnswers.map(a => a.responseTimeMs);
    const rtStats = calculateStats(correctRTs);

    // Z-scoreを計算
    const accuracyZ = (accuracy - NBACK_NORMS.accuracy.mean) / NBACK_NORMS.accuracy.sd;
    const rtZ = rtStats.mean > 0
      ? (NBACK_NORMS.rt.mean - rtStats.mean) / NBACK_NORMS.rt.sd  // RTは低いほど良い
      : 0;

    // 効率性を計算（正答率とRTの複合指標）
    const efficiency = rtStats.mean > 0 ? accuracy / Math.log(rtStats.mean) : 0;

    // 複合Z-scoreを計算（正答率70%、RT30%の重み付け）
    const compositeZ = accuracyZ * 0.7 + rtZ * 0.3;
    const percentile = zToPercentile(compositeZ);

    return {
      domain: 'working_memory',
      accuracy,
      meanRT: rtStats.mean,
      sdRT: rtStats.sd,
      efficiency,
      percentile,
      level: percentileToLevel(percentile),
    };
  }

  /**
   * Stroopスコアを計算
   */
  private calculateStroopScore(answers: CognitiveAnswer[]): CognitiveDomainScore {
    const validAnswers = answers.filter(a => a.responseTimeMs > 100 && a.responseTimeMs < 3000);
    const correctAnswers = validAnswers.filter(a => a.isCorrect);

    const accuracy = validAnswers.length > 0 ? correctAnswers.length / validAnswers.length : 0;
    const correctRTs = correctAnswers.map(a => a.responseTimeMs);
    const rtStats = calculateStats(correctRTs);

    // Z-scoreを計算
    const accuracyZ = (accuracy - STROOP_NORMS.accuracy.mean) / STROOP_NORMS.accuracy.sd;
    const rtZ = rtStats.mean > 0
      ? (STROOP_NORMS.rt.mean - rtStats.mean) / STROOP_NORMS.rt.sd
      : 0;

    const efficiency = rtStats.mean > 0 ? accuracy / Math.log(rtStats.mean) : 0;

    // 複合Z-score（正答率60%、RT40%の重み付け - Stroopは速度も重要）
    const compositeZ = accuracyZ * 0.6 + rtZ * 0.4;
    const percentile = zToPercentile(compositeZ);

    return {
      domain: 'inhibition',
      accuracy,
      meanRT: rtStats.mean,
      sdRT: rtStats.sd,
      efficiency,
      percentile,
      level: percentileToLevel(percentile),
    };
  }

  /**
   * 単純反応時間スコアを計算
   */
  private calculateSimpleRTScore(answers: CognitiveAnswer[]): CognitiveDomainScore {
    const validAnswers = answers.filter(
      a => a.isCorrect && a.responseTimeMs > 50 && a.responseTimeMs < 1500
    );

    const rts = validAnswers.map(a => a.responseTimeMs);
    const rtStats = calculateStats(rts);

    // 早押しや遅すぎる反応を除いた正答率
    const accuracy = answers.length > 0 ? validAnswers.length / answers.length : 0;

    // Z-scoreを計算（RTのみ、低いほど良い）
    const rtZ = rtStats.mean > 0
      ? (SIMPLE_RT_NORMS.rt.mean - rtStats.mean) / SIMPLE_RT_NORMS.rt.sd
      : 0;

    // 変動性も考慮（一貫性が高いほど良い）
    const variabilityZ = rtStats.sd > 0
      ? (SIMPLE_RT_NORMS.sd.mean - rtStats.sd) / SIMPLE_RT_NORMS.sd.sd
      : 0;

    // 複合Z-score（平均RT80%、変動性20%の重み付け）
    const compositeZ = rtZ * 0.8 + variabilityZ * 0.2;
    const percentile = zToPercentile(compositeZ);

    const efficiency = rtStats.mean > 0 ? accuracy / Math.log(rtStats.mean) : 0;

    return {
      domain: 'processing_speed',
      accuracy,
      meanRT: rtStats.mean,
      sdRT: rtStats.sd,
      efficiency,
      percentile,
      level: percentileToLevel(percentile),
    };
  }

  /**
   * テスト詳細情報を取得
   */
  private getTestDetails(
    answers: CognitiveAnswer[],
    testType: CognitiveTestType
  ): CognitiveResult['testDetails'][0] {
    const correctAnswers = answers.filter(a => a.isCorrect);
    const correctRTs = correctAnswers.map(a => a.responseTimeMs);
    const rtStats = calculateStats(correctRTs);

    return {
      type: testType,
      totalTrials: answers.length,
      correctTrials: correctAnswers.length,
      accuracy: answers.length > 0 ? correctAnswers.length / answers.length : 0,
      meanRT: rtStats.mean,
      sdRT: rtStats.sd,
    };
  }

  /**
   * 認知レベルの説明を取得
   */
  getLevelDescription(level: CognitiveLevel): string {
    const descriptions: Record<CognitiveLevel, string> = {
      significantly_above_average: '認知機能が非常に高い水準にあります。情報処理、ワーキングメモリ、抑制制御において優れた能力を示しています。',
      above_average: '認知機能が平均以上の水準にあります。多くの認知的タスクを効率的に処理できます。',
      average: '認知機能が一般的な水準にあります。日常的な認知的要求に十分対応できる能力を備えています。',
      below_average: '一部の認知領域で追加のサポートが効果的な場合があります。得意な領域を活かした活動が推奨されます。',
      significantly_below_average: '認知的タスクにおいて個別の配慮やサポートが効果的です。強みを活かした環境設定を検討することをお勧めします。',
    };
    return descriptions[level];
  }

  /**
   * ドメイン別の詳細説明を取得
   */
  getDomainDescription(domain: CognitiveDomain, level: CognitiveLevel): string {
    const descriptions: Record<CognitiveDomain, Record<CognitiveLevel, string>> = {
      working_memory: {
        significantly_above_average: '複数の情報を同時に保持・操作する能力が非常に高く、複雑なタスクを効率的に処理できます。',
        above_average: '情報の一時的な保持と操作が得意で、マルチタスクを比較的容易にこなせます。',
        average: '一般的なワーキングメモリ容量を持ち、日常的なタスクに十分対応できます。',
        below_average: '複数の情報を同時に扱う際に、メモやリストを活用すると効果的です。',
        significantly_below_average: '情報を段階的に処理し、外部記憶ツールを積極的に活用することをお勧めします。',
      },
      inhibition: {
        significantly_above_average: '不要な反応を抑制し、注意を適切にコントロールする能力が非常に高いです。',
        above_average: '干渉に強く、集中力を維持しながらタスクを遂行できます。',
        average: '一般的な抑制制御能力を持ち、通常の環境で適切に注意をコントロールできます。',
        below_average: '刺激の少ない環境で作業すると、パフォーマンスが向上しやすいです。',
        significantly_below_average: '静かで構造化された環境で、一つのタスクに集中することが効果的です。',
      },
      processing_speed: {
        significantly_above_average: '情報処理が非常に速く、迅速な判断と反応が求められる場面で強みを発揮します。',
        above_average: '平均以上の速度で情報を処理でき、効率的なタスク遂行が可能です。',
        average: '一般的な処理速度を持ち、通常のペースでタスクをこなせます。',
        below_average: '十分な時間をかけることで、正確な処理が可能です。',
        significantly_below_average: '時間に余裕を持ったスケジューリングで、質の高い成果を出せます。',
      },
    };
    return descriptions[domain][level];
  }

  /**
   * Stroop効果（干渉効果）を計算
   */
  calculateStroopEffect(answers: CognitiveAnswer[]): {
    congruentRT: number;
    incongruentRT: number;
    interferenceEffect: number;
    percentile: number;
  } | null {
    // この機能を使うには、回答にcongruent/incongruent情報が必要
    // 現状のCognitiveAnswer型には含まれていないため、将来の拡張用
    return null;
  }
}

// シングルトンインスタンス
export const cognitiveScoring = new CognitiveScoring();
