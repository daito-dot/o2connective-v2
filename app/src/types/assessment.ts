/**
 * 適性診断サービス 型定義
 * 性格診断・認知能力テスト・AI連携の型を定義
 */

// =============================================================================
// 性格診断関連の型
// =============================================================================

/** Big Five ドメイン */
export type BigFiveDomain = 'EX' | 'CO' | 'AG' | 'NE' | 'OP';

/** Dark Triad ドメイン */
export type DarkTriadDomain = 'MA' | 'NA' | 'PS';

/** 追加ドメイン */
export type AdditionalDomain = 'EM' | 'WR' | 'LI';

/** 全性格ドメイン */
export type PersonalityDomain = BigFiveDomain | DarkTriadDomain | AdditionalDomain;

/** ドメイン名称マッピング */
export const DOMAIN_NAMES: Record<PersonalityDomain, string> = {
  EX: '外向性',
  CO: '誠実性',
  AG: '協調性',
  NE: '情緒安定性',
  OP: '開放性',
  MA: 'マキャベリズム',
  NA: 'ナルシシズム',
  PS: 'サイコパシー',
  EM: '共感性',
  WR: '仕事への姿勢',
  LI: '回答信頼性',
};

/** ドメインカテゴリ */
export const DOMAIN_CATEGORIES: Record<PersonalityDomain, string> = {
  EX: 'bigfive',
  CO: 'bigfive',
  AG: 'bigfive',
  NE: 'bigfive',
  OP: 'bigfive',
  MA: 'darktriad',
  NA: 'darktriad',
  PS: 'darktriad',
  EM: 'additional',
  WR: 'additional',
  LI: 'validity',
};

/** 設問アイテム */
export interface PersonalityQuestion {
  id: string;                     // UUID or "EX-1"形式
  text: string;                   // 設問文（日本語）
  textEn?: string;                // 設問文（英語、AI連携用）
  domain: PersonalityDomain;      // 所属ドメイン
  category: string;               // bigfive, darktriad, additional, validity
  keyed: 'plus' | 'minus';        // スコア方向（minus = 逆転項目）
  order: number;                  // 表示順
}

/** 回答値 */
export type AnswerValue = 1 | 2 | 3 | 4 | 5;

/** 回答 */
export interface PersonalityAnswer {
  questionId: string;
  value: AnswerValue;
  responseTimeMs?: number;
  timestamp: Date;
}

// =============================================================================
// スコア関連の型
// =============================================================================

/** 傾向レベル（5段階カテゴリカル） */
export type TendencyLevel =
  | 'very_characteristic'     // 非常に特徴的 (T > 65)
  | 'characteristic'          // 特徴的 (T 55-65)
  | 'moderate'                // 中程度 (T 45-55)
  | 'less_characteristic'     // やや控えめ (T 35-45)
  | 'not_characteristic';     // あまり見られない (T < 35)

/** 傾向レベルの閾値 */
export const TENDENCY_THRESHOLDS: Record<TendencyLevel, { min: number; max: number }> = {
  very_characteristic: { min: 65, max: 100 },
  characteristic: { min: 55, max: 65 },
  moderate: { min: 45, max: 55 },
  less_characteristic: { min: 35, max: 45 },
  not_characteristic: { min: 0, max: 35 },
};

/** 多層スコア構造 */
export interface MultiLayerScore {
  /** Layer 1: 生スコア（内部処理用） */
  rawScore: number;           // 1.0 - 5.0

  /** Layer 2: 統計的変換スコア */
  zScore: number;             // 標準偏差単位 (-3.0 ~ +3.0)
  tScore: number;             // T-score (20 - 80, 平均50, SD10)
  percentile: number;         // パーセンタイル (1 - 99)

  /** Layer 3: カテゴリカル表現 */
  tendencyLevel: TendencyLevel;
  description: string;        // 自然言語記述

  /** Layer 4: 信頼区間 */
  confidenceInterval?: {
    lower: number;
    upper: number;
    confidence: 0.95;
  };
}

/** ドメインスコア */
export interface DomainScore {
  domain: PersonalityDomain;
  score: MultiLayerScore;
  itemCount: number;          // 回答した設問数
}

/** 母集団統計（規準データ） */
export interface NormDistribution {
  mean: number;
  sd: number;
  n: number;                  // サンプルサイズ
  percentiles?: Record<number, number>; // {5: 2.1, 10: 2.3, ...}
}

/** 規準集団 */
export interface NormGroup {
  id: string;
  name: string;               // 例: '日本人成人20-60歳'
  distributions: Record<PersonalityDomain, NormDistribution>;
  lastUpdated: Date;
}

// =============================================================================
// 信頼性指標の型
// =============================================================================

/** 信頼性ステータス */
export type ReliabilityStatus = 'high' | 'moderate' | 'low';

/** 信頼性メトリクス */
export interface ReliabilityMetrics {
  /** 社会的望ましさバイアス検出 */
  socialDesirability: {
    score: number;            // 0-100
    flag: ReliabilityStatus;
    reverseItemConsistency: number;
  };

  /** 回答パターン分析 */
  responsePattern: {
    straightlining: boolean;  // 同一回答連続
    extremeResponding: number; // 極端回答率 (%)
    midpointResponding: number; // 中間回答率 (%)
    responseTime?: {
      average: number;
      variance: number;
      suspiciouslyFast: boolean;
    };
  };

  /** 総合信頼性スコア */
  overallReliability: number;  // 0-100
  interpretationNote: string;
}

// =============================================================================
// 認知能力テスト関連の型
// =============================================================================

/** 認知テストタイプ */
export type CognitiveTestType =
  | 'matrix_reasoning'      // 行列推理
  | 'letter_number_series'  // 文字数列
  | 'verbal_reasoning'      // 言語推理
  | '3d_rotation';          // 3D回転

/** 認知テストアイテム */
export interface CognitiveTestItem {
  id: string;
  type: CognitiveTestType;
  stimulus: string | object;  // 問題の刺激（画像URL or データ）
  options: string[];          // 選択肢
  correctAnswer: string;
  difficulty?: number;        // IRT難易度パラメータ
  timeLimit: number;          // 秒
}

/** 認知テスト回答 */
export interface CognitiveAnswer {
  itemId: string;
  itemType: CognitiveTestType;
  selectedAnswer: string | null;
  isCorrect: boolean;
  responseTimeMs: number;
  timestamp: Date;
}

/** 認知能力レベル */
export type CognitiveLevel =
  | 'significantly_below_average'  // <70
  | 'below_average'                // 70-85
  | 'average'                      // 85-115
  | 'above_average'                // 115-130
  | 'significantly_above_average'; // >130

/** 認知テスト結果 */
export interface CognitiveResult {
  /** 生スコア */
  rawScores: {
    matrixReasoning: number;
    letterNumberSeries: number;
    verbalReasoning: number;
    rotation3d: number;
    total: number;
  };

  /** 正規化スコア */
  normalizedScores: {
    percentileRank: number;     // 0-100
    standardScore: number;      // IQ様式（平均100, SD15）
    relativePosition: CognitiveLevel;
  };

  /** 時間データ */
  timingData: {
    totalTime: number;
    averageTimePerItem: number;
    timeByType: Record<CognitiveTestType, number>;
  };
}

// =============================================================================
// AI連携関連の型
// =============================================================================

/** 分析目的 */
export type AnalysisPurpose =
  | 'individual_report'     // 個人レポート
  | 'team_matching'         // チームマッチング
  | 'one_on_one_support'    // 1on1支援
  | 'manager_report'        // 上司向けレポート
  | 'team_building'         // チームビルディング
  | 'career_development';   // キャリア開発

/** AI入力ペイロード */
export interface AIInputPayload {
  /** メタデータ */
  metadata: {
    version: '2.0';
    generatedAt: string;
    reliabilityStatus: ReliabilityStatus;
    analysisPurpose: AnalysisPurpose;
  };

  /** 性格プロファイル（バイアス軽減表現） */
  personalityProfile: {
    bigFive: Record<BigFiveDomain, TraitAIRepresentation>;
    darkTriad: Record<DarkTriadDomain, TraitAIRepresentation>;
    empathy: TraitAIRepresentation;
    workStyle: TraitAIRepresentation;
  };

  /** 認知能力（オプション、性格と完全分離） */
  cognitiveProfile?: {
    overallLevel: CognitiveLevel;
    description: string;
    strengthAreas: CognitiveTestType[];
    developmentAreas: CognitiveTestType[];
  };

  /** 信頼性注記 */
  reliabilityNote: string;

  /** 追加コンテキスト */
  additionalContext?: string;
}

/** 特性のAI向け表現（バイアス軽減） */
export interface TraitAIRepresentation {
  /** 傾向レベル（数値ではなくカテゴリ） */
  tendencyLevel: TendencyLevel;

  /** 自然言語記述 */
  description: string;

  /** 強み */
  strengths: string[];

  /** 考慮点 */
  considerations: string[];
}

/** AI出力構造 */
export interface AIInterpretationOutput {
  /** 主な強み */
  strengths: {
    area: string;
    description: string;
    evidenceBasis: string;
  }[];

  /** 成長機会 */
  growthOpportunities: {
    area: string;
    suggestion: string;
    supportingConditions: string;
  }[];

  /** コミュニケーションスタイル */
  communicationProfile: {
    preferredStyle: string;
    effectiveApproaches: string[];
    potentialFrictions: string[];
  };

  /** チーム適性 */
  teamFit: {
    naturalRoles: string[];
    complementaryProfiles: string[];
    teamContributions: string[];
  };

  /** 認知能力との統合解釈 */
  cognitiveIntegration?: {
    learningStyle: string;
    problemSolvingApproach: string;
    developmentRecommendations: string[];
  };

  /** 解釈の確度 */
  interpretationConfidence: {
    level: 'high' | 'moderate' | 'low';
    factors: string[];
  };
}

// =============================================================================
// セッション関連の型
// =============================================================================

/** 性格診断セッション */
export interface PersonalitySession {
  id: string;
  userId: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  answers: PersonalityAnswer[];
  result?: {
    domainScores: DomainScore[];
    reliabilityMetrics: ReliabilityMetrics;
    normGroupId: string;
  };
}

/** 認知テストセッション */
export interface CognitiveSession {
  id: string;
  userId: string;
  testType: 'standard' | 'adaptive';
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  answers: CognitiveAnswer[];
  result?: CognitiveResult;
}
