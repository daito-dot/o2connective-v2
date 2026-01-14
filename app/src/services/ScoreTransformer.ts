/**
 * スコア変換サービス
 * 生スコア → Z-score → T-score → パーセンタイル → 傾向レベル → 自然言語記述
 */

import type {
  PersonalityDomain,
  PersonalityQuestion,
  PersonalityAnswer,
  AnswerValue,
  MultiLayerScore,
  TendencyLevel,
  NormDistribution,
  DomainScore,
  ReliabilityMetrics,
  ReliabilityStatus,
} from '@/types/assessment';
import { DOMAIN_NAMES, TENDENCY_THRESHOLDS } from '@/types/assessment';

// =============================================================================
// 母集団統計（デフォルト規準データ）
// 実際の運用では、蓄積データから更新する
// =============================================================================

/** デフォルト母集団統計 */
export const DEFAULT_NORM_DISTRIBUTIONS: Record<PersonalityDomain, NormDistribution> = {
  EX: { mean: 3.2, sd: 0.8, n: 1000 },
  CO: { mean: 3.5, sd: 0.7, n: 1000 },
  AG: { mean: 3.6, sd: 0.6, n: 1000 },
  NE: { mean: 3.0, sd: 0.9, n: 1000 },
  OP: { mean: 3.4, sd: 0.7, n: 1000 },
  MA: { mean: 2.8, sd: 0.9, n: 1000 },
  NA: { mean: 3.1, sd: 0.8, n: 1000 },
  PS: { mean: 2.9, sd: 0.8, n: 1000 },
  EM: { mean: 3.5, sd: 0.7, n: 1000 },
  WR: { mean: 3.4, sd: 0.6, n: 1000 },
  LI: { mean: 3.5, sd: 0.7, n: 1000 },
};

// =============================================================================
// 傾向レベルの自然言語記述マッピング
// =============================================================================

/** ドメイン別傾向記述 */
export const TENDENCY_DESCRIPTIONS: Record<PersonalityDomain, Record<TendencyLevel, string>> = {
  EX: {
    very_characteristic: '社交的な場面でエネルギーを得やすい傾向が非常に強い',
    characteristic: '人との交流を楽しむ傾向がある',
    moderate: '状況に応じて社交性を発揮する',
    less_characteristic: '一人の時間も大切にする傾向がある',
    not_characteristic: '静かな環境でエネルギーを充電しやすい傾向がある',
  },
  CO: {
    very_characteristic: '計画性と規律を非常に重視する傾向がある',
    characteristic: '物事を着実に進める傾向がある',
    moderate: '状況に応じて柔軟に対応する',
    less_characteristic: '柔軟性を重視する傾向がある',
    not_characteristic: '自発的・即興的なアプローチを好む傾向がある',
  },
  AG: {
    very_characteristic: '他者との調和を非常に重視する傾向がある',
    characteristic: 'チームの雰囲気を大切にする傾向がある',
    moderate: '状況に応じて協調と主張のバランスを取る',
    less_characteristic: '自分の意見を率直に伝える傾向がある',
    not_characteristic: '独立した判断を重視する傾向がある',
  },
  NE: {
    very_characteristic: '感情的に非常に安定しており、ストレスに強い',
    characteristic: '感情をコントロールしやすい傾向がある',
    moderate: '一般的な感情の起伏がある',
    less_characteristic: '環境の変化に敏感に反応する傾向がある',
    not_characteristic: '細やかな感情の変化に気づきやすい傾向がある',
  },
  OP: {
    very_characteristic: '新しいアイデアや経験を非常に積極的に求める',
    characteristic: '変化や革新を楽しむ傾向がある',
    moderate: '新しさと安定のバランスを取る',
    less_characteristic: '実績のある方法を好む傾向がある',
    not_characteristic: '確立された手法を重視する傾向がある',
  },
  MA: {
    very_characteristic: '戦略的思考と交渉力が非常に高い',
    characteristic: '目的達成のための柔軟な対応ができる',
    moderate: '状況に応じた対人戦略を取る',
    less_characteristic: '率直で直接的なコミュニケーションを好む',
    not_characteristic: '誠実さと透明性を最優先にする傾向がある',
  },
  NA: {
    very_characteristic: '自己肯定感が高く、リーダーシップ意欲が強い',
    characteristic: '自信を持って行動する傾向がある',
    moderate: '適度な自己評価を持っている',
    less_characteristic: '謙虚さを重視する傾向がある',
    not_characteristic: '控えめで周囲を立てる傾向がある',
  },
  PS: {
    very_characteristic: '感情に左右されず冷静に判断できる傾向が非常に強い',
    characteristic: 'プレッシャー下でも冷静さを保てる傾向がある',
    moderate: '状況に応じて感情と理性のバランスを取る',
    less_characteristic: '他者の感情に寄り添う傾向がある',
    not_characteristic: '共感力が高く、他者の気持ちに敏感な傾向がある',
  },
  EM: {
    very_characteristic: '他者の感情を深く理解し、共感する傾向が非常に強い',
    characteristic: '相手の気持ちを察する傾向がある',
    moderate: '状況に応じて共感を示す',
    less_characteristic: '客観的な視点を重視する傾向がある',
    not_characteristic: '論理的・分析的なアプローチを好む傾向がある',
  },
  WR: {
    very_characteristic: '仕事への責任感と準備性が非常に高い',
    characteristic: '計画的に仕事を進める傾向がある',
    moderate: '標準的な仕事への取り組み方をする',
    less_characteristic: '柔軟なワークスタイルを好む傾向がある',
    not_characteristic: '自由度の高い働き方を好む傾向がある',
  },
  LI: {
    very_characteristic: '回答の一貫性が非常に高い',
    characteristic: '回答に一定の一貫性がある',
    moderate: '一般的な回答パターンを示す',
    less_characteristic: '回答にやや矛盾が見られる',
    not_characteristic: '回答の信頼性に注意が必要',
  },
};

// =============================================================================
// スコア変換クラス
// =============================================================================

export class ScoreTransformer {
  private normDistributions: Record<PersonalityDomain, NormDistribution>;

  constructor(
    normDistributions: Record<PersonalityDomain, NormDistribution> = DEFAULT_NORM_DISTRIBUTIONS
  ) {
    this.normDistributions = normDistributions;
  }

  // ---------------------------------------------------------------------------
  // 生スコア計算
  // ---------------------------------------------------------------------------

  /**
   * 回答から生スコアを計算（逆転項目処理済み）
   */
  calculateRawScore(
    answers: PersonalityAnswer[],
    questions: PersonalityQuestion[]
  ): number {
    if (answers.length === 0) return 0;

    const questionMap = new Map(questions.map(q => [q.id, q]));
    let sum = 0;
    let count = 0;

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      // 逆転項目の処理
      const score = question.keyed === 'minus'
        ? (6 - answer.value) as AnswerValue
        : answer.value;

      sum += score;
      count++;
    }

    return count > 0 ? sum / count : 0;
  }

  /**
   * ドメイン別の生スコアを計算
   */
  calculateDomainRawScores(
    answers: PersonalityAnswer[],
    questions: PersonalityQuestion[]
  ): Record<PersonalityDomain, { rawScore: number; itemCount: number }> {
    const result: Record<string, { rawScore: number; itemCount: number }> = {};
    const domains = new Set(questions.map(q => q.domain));

    for (const domain of domains) {
      const domainQuestions = questions.filter(q => q.domain === domain);
      const domainAnswers = answers.filter(a =>
        domainQuestions.some(q => q.id === a.questionId)
      );

      result[domain] = {
        rawScore: this.calculateRawScore(domainAnswers, domainQuestions),
        itemCount: domainAnswers.length,
      };
    }

    return result as Record<PersonalityDomain, { rawScore: number; itemCount: number }>;
  }

  // ---------------------------------------------------------------------------
  // 統計的変換
  // ---------------------------------------------------------------------------

  /**
   * Z-score変換
   */
  toZScore(rawScore: number, domain: PersonalityDomain): number {
    const norm = this.normDistributions[domain];
    if (!norm || norm.sd === 0) return 0;
    return (rawScore - norm.mean) / norm.sd;
  }

  /**
   * T-score変換（平均50、SD10）
   */
  toTScore(zScore: number): number {
    const tScore = 50 + (zScore * 10);
    // 20-80の範囲にクリップ
    return Math.max(20, Math.min(80, Math.round(tScore)));
  }

  /**
   * パーセンタイル変換（正規分布仮定）
   */
  toPercentile(zScore: number): number {
    // 標準正規分布の累積分布関数
    const percentile = this.normalCDF(zScore) * 100;
    return Math.max(1, Math.min(99, Math.round(percentile)));
  }

  /**
   * 標準正規分布の累積分布関数（近似）
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

  // ---------------------------------------------------------------------------
  // カテゴリカル変換
  // ---------------------------------------------------------------------------

  /**
   * T-scoreから傾向レベルへ変換
   */
  toTendencyLevel(tScore: number): TendencyLevel {
    if (tScore >= 65) return 'very_characteristic';
    if (tScore >= 55) return 'characteristic';
    if (tScore >= 45) return 'moderate';
    if (tScore >= 35) return 'less_characteristic';
    return 'not_characteristic';
  }

  /**
   * ドメインと傾向レベルから自然言語記述を取得
   */
  getDescription(domain: PersonalityDomain, tendencyLevel: TendencyLevel): string {
    return TENDENCY_DESCRIPTIONS[domain]?.[tendencyLevel] ?? '';
  }

  // ---------------------------------------------------------------------------
  // 多層スコア生成
  // ---------------------------------------------------------------------------

  /**
   * 生スコアから多層スコアを生成
   */
  transformScore(rawScore: number, domain: PersonalityDomain): MultiLayerScore {
    const zScore = this.toZScore(rawScore, domain);
    const tScore = this.toTScore(zScore);
    const percentile = this.toPercentile(zScore);
    const tendencyLevel = this.toTendencyLevel(tScore);
    const description = this.getDescription(domain, tendencyLevel);

    // 信頼区間（95%）の計算
    const norm = this.normDistributions[domain];
    const se = norm.sd / Math.sqrt(norm.n);
    const marginOfError = 1.96 * se;

    return {
      rawScore: Math.round(rawScore * 100) / 100,
      zScore: Math.round(zScore * 100) / 100,
      tScore,
      percentile,
      tendencyLevel,
      description,
      confidenceInterval: {
        lower: Math.round((rawScore - marginOfError) * 100) / 100,
        upper: Math.round((rawScore + marginOfError) * 100) / 100,
        confidence: 0.95,
      },
    };
  }

  /**
   * 全ドメインのスコアを生成
   */
  transformAllScores(
    answers: PersonalityAnswer[],
    questions: PersonalityQuestion[]
  ): DomainScore[] {
    const rawScores = this.calculateDomainRawScores(answers, questions);
    const results: DomainScore[] = [];

    for (const [domain, { rawScore, itemCount }] of Object.entries(rawScores)) {
      if (itemCount === 0) continue;

      results.push({
        domain: domain as PersonalityDomain,
        score: this.transformScore(rawScore, domain as PersonalityDomain),
        itemCount,
      });
    }

    return results;
  }

  // ---------------------------------------------------------------------------
  // 信頼性メトリクス計算
  // ---------------------------------------------------------------------------

  /**
   * 回答信頼性メトリクスを計算
   */
  calculateReliabilityMetrics(
    answers: PersonalityAnswer[],
    questions: PersonalityQuestion[]
  ): ReliabilityMetrics {
    // LIドメインの設問を取得
    const liQuestions = questions.filter(q => q.domain === 'LI');
    const liAnswers = answers.filter(a =>
      liQuestions.some(q => q.id === a.questionId)
    );

    // 逆転項目と通常項目を分離
    const liReverseQuestions = liQuestions.filter(q => q.keyed === 'minus');
    const liNormalQuestions = liQuestions.filter(q => q.keyed === 'plus');

    // 逆転項目の平均（社会的望ましさバイアス検出）
    const reverseAnswers = liAnswers.filter(a =>
      liReverseQuestions.some(q => q.id === a.questionId)
    );
    const reverseAvg = reverseAnswers.length > 0
      ? reverseAnswers.reduce((sum, a) => sum + a.value, 0) / reverseAnswers.length
      : 0;

    // 通常項目の平均
    const normalAnswers = liAnswers.filter(a =>
      liNormalQuestions.some(q => q.id === a.questionId)
    );
    const normalAvg = normalAnswers.length > 0
      ? normalAnswers.reduce((sum, a) => sum + a.value, 0) / normalAnswers.length
      : 0;

    // 社会的望ましさバイアスの判定
    let flag: ReliabilityStatus;
    let reliabilityScore: number;

    if (reverseAvg >= 4.0) {
      flag = 'low';
      reliabilityScore = normalAvg * 50;
    } else if (reverseAvg >= 3.5) {
      flag = 'moderate';
      reliabilityScore = normalAvg * 80;
    } else {
      flag = 'high';
      reliabilityScore = normalAvg * 100;
    }

    // 回答パターン分析
    const responsePattern = this.analyzeResponsePattern(answers);

    // 総合信頼性スコアの調整
    if (responsePattern.straightlining) {
      reliabilityScore *= 0.7;
    }
    if (responsePattern.extremeResponding > 50) {
      reliabilityScore *= 0.9;
    }

    return {
      socialDesirability: {
        score: Math.round(reliabilityScore),
        flag,
        reverseItemConsistency: Math.round((5 - reverseAvg) * 20),
      },
      responsePattern,
      overallReliability: Math.max(0, Math.min(100, Math.round(reliabilityScore))),
      interpretationNote: this.getReliabilityNote(flag, responsePattern),
    };
  }

  /**
   * 回答パターンを分析
   */
  private analyzeResponsePattern(answers: PersonalityAnswer[]): ReliabilityMetrics['responsePattern'] {
    if (answers.length === 0) {
      return {
        straightlining: false,
        extremeResponding: 0,
        midpointResponding: 0,
      };
    }

    // 同一回答連続のチェック（5問以上連続で同じ回答）
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    for (let i = 1; i < answers.length; i++) {
      if (answers[i].value === answers[i - 1].value) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }
    const straightlining = maxConsecutive >= 5;

    // 極端回答率（1または5の回答率）
    const extremeCount = answers.filter(a => a.value === 1 || a.value === 5).length;
    const extremeResponding = Math.round((extremeCount / answers.length) * 100);

    // 中間回答率（3の回答率）
    const midpointCount = answers.filter(a => a.value === 3).length;
    const midpointResponding = Math.round((midpointCount / answers.length) * 100);

    // 回答時間の分析
    const timesWithData = answers.filter(a => a.responseTimeMs !== undefined);
    let responseTime: ReliabilityMetrics['responsePattern']['responseTime'];

    if (timesWithData.length > 0) {
      const times = timesWithData.map(a => a.responseTimeMs!);
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const variance = times.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / times.length;

      responseTime = {
        average: Math.round(avgTime),
        variance: Math.round(variance),
        suspiciouslyFast: avgTime < 1000, // 1秒未満は疑わしい
      };
    }

    return {
      straightlining,
      extremeResponding,
      midpointResponding,
      responseTime,
    };
  }

  /**
   * 信頼性に関する注記を生成
   */
  private getReliabilityNote(
    flag: ReliabilityStatus,
    pattern: ReliabilityMetrics['responsePattern']
  ): string {
    const notes: string[] = [];

    if (flag === 'low') {
      notes.push('回答の信頼性に重大な問題があります。結果の解釈には十分注意してください。');
    } else if (flag === 'moderate') {
      notes.push('回答にやや矛盾が見られます。結果の解釈は慎重に行ってください。');
    }

    if (pattern.straightlining) {
      notes.push('同一回答の連続が検出されました。');
    }

    if (pattern.extremeResponding > 50) {
      notes.push('極端な回答が多い傾向があります。');
    }

    if (pattern.midpointResponding > 50) {
      notes.push('中間回答が多い傾向があります。');
    }

    if (pattern.responseTime?.suspiciouslyFast) {
      notes.push('回答時間が非常に短いです。');
    }

    return notes.length > 0 ? notes.join(' ') : '回答の信頼性に問題は検出されませんでした。';
  }
}

// シングルトンインスタンス
export const scoreTransformer = new ScoreTransformer();
