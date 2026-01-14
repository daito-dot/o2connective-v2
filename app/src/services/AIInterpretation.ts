/**
 * AI解釈サービス
 * バイアス軽減プロンプト生成と結果解釈
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  PersonalityDomain,
  BigFiveDomain,
  DarkTriadDomain,
  DomainScore,
  TendencyLevel,
  ReliabilityMetrics,
  ReliabilityStatus,
  AnalysisPurpose,
  AIInputPayload,
  TraitAIRepresentation,
  AIInterpretationOutput,
  CognitiveResult,
  CognitiveLevel,
} from '@/types/assessment';
import { DOMAIN_NAMES } from '@/types/assessment';
import { TENDENCY_DESCRIPTIONS } from './ScoreTransformer';

// =============================================================================
// システムプロンプト（バイアス軽減の核心部分）
// =============================================================================

const SYSTEM_PROMPT = `あなたは組織心理学とキャリア開発の専門家です。適性診断結果を解釈し、組織コミュニケーションの改善に役立つアドバイスを提供します。

## 重要な前提条件

### 性格特性と能力の明確な区別
- **性格特性**（Big Five, Dark Triad）= 行動傾向・スタイル。変化しにくい特性。
- **認知能力**（ICAR結果）= 情報処理・問題解決能力。訓練で向上可能。
- これらは完全に別の次元であり、混同してはいけません。

### スコアの解釈ガイドライン
- T-score 50 = 一般的な傾向（基準点）
- T-score 40-60 = 一般的な範囲内
- T-score 60以上 = その傾向が特徴的に現れやすい
- T-score 40以下 = その傾向は控えめ（逆の傾向が出やすい）

### 絶対に避けるべき解釈（重要）
1. 「外向性が低い = コミュニケーション能力が低い」→ **誤り**
   - 正しくは「静かな環境で力を発揮しやすい」「深い対話を好む」など
2. 「誠実性が高い = 仕事ができる」→ **誤り**
   - 正しくは「計画的なアプローチを好む」「規律を重視する傾向がある」
3. 「情緒安定性が低い = 精神的に弱い」→ **誤り**
   - 正しくは「環境の変化に敏感」「細やかな配慮ができる」
4. 数値の大小を「良い・悪い」「優秀・劣等」と結びつけること → **禁止**

### Dark Triadの建設的解釈
Dark Triadの特性は、適切な文脈では強みになります：
- **マキャベリズム** → 戦略的思考、交渉力、状況判断力
- **ナルシシズム** → 自信、リーダーシップ意欲、目標達成力
- **サイコパシー** → プレッシャー耐性、冷静な判断、感情に流されない決断力

ネガティブなラベリングを避け、組織での活用可能性を探ってください。

### 信頼性の考慮
回答信頼性が「moderate」または「low」の場合、解釈の確度を下げて提示してください。

## 出力形式
JSON形式で、以下の構造に従って出力してください。
`;

// =============================================================================
// 強みと考慮点のマッピング
// =============================================================================

const TRAIT_STRENGTHS: Record<PersonalityDomain, Record<TendencyLevel, string[]>> = {
  EX: {
    very_characteristic: ['チームの活性化', '初対面でも円滑なコミュニケーション', 'プレゼンテーション力'],
    characteristic: ['積極的な発言', 'ネットワーキング', 'チームへの貢献'],
    moderate: ['状況に応じた柔軟性', 'バランスの取れた対人関係'],
    less_characteristic: ['傾聴力', '深い思考', '落ち着いた判断'],
    not_characteristic: ['集中力', '独立した作業', '慎重な意思決定'],
  },
  CO: {
    very_characteristic: ['計画立案', '期限遵守', '品質管理'],
    characteristic: ['着実な実行', '責任感', '整理整頓'],
    moderate: ['柔軟性と計画性のバランス', '適応力'],
    less_characteristic: ['臨機応変な対応', '創造的な解決'],
    not_characteristic: ['即興的な対応', '柔軟なアプローチ', '変化への適応'],
  },
  AG: {
    very_characteristic: ['チームワーク', '対人関係の調整', '共感力'],
    characteristic: ['協力的な姿勢', '他者への配慮', '調和の維持'],
    moderate: ['バランスの取れた主張', '状況判断'],
    less_characteristic: ['率直なフィードバック', '自己主張', '独立した判断'],
    not_characteristic: ['批判的思考', '客観的な評価', '難しい決断'],
  },
  NE: {
    very_characteristic: ['ストレス耐性', '冷静な判断', '安定したパフォーマンス'],
    characteristic: ['感情のコントロール', '落ち着いた対応'],
    moderate: ['適度な感情表現', 'バランスの取れた反応'],
    less_characteristic: ['感受性', '細やかな気配り', '環境への敏感さ'],
    not_characteristic: ['共感力', '感情的な理解', '繊細な対応'],
  },
  OP: {
    very_characteristic: ['イノベーション', '新規事業開発', '創造的問題解決'],
    characteristic: ['新しいアイデアへの受容性', '学習意欲'],
    moderate: ['バランスの取れたアプローチ', '状況に応じた判断'],
    less_characteristic: ['実績重視', '安定した運用', '確実性'],
    not_characteristic: ['専門性の深化', '確立された手法の活用', '安定志向'],
  },
  MA: {
    very_characteristic: ['戦略的思考', '交渉力', '影響力の行使'],
    characteristic: ['状況分析', '柔軟な対応', '目的達成力'],
    moderate: ['バランスの取れた対人関係'],
    less_characteristic: ['率直さ', '透明性', '誠実なコミュニケーション'],
    not_characteristic: ['正直さ', '信頼関係の構築', '開放的な姿勢'],
  },
  NA: {
    very_characteristic: ['リーダーシップ', '自信', '目標達成への意欲'],
    characteristic: ['自己主張', '競争力', '成果志向'],
    moderate: ['適度な自己評価', 'バランスの取れた姿勢'],
    less_characteristic: ['謙虚さ', 'チームプレイ', '他者の尊重'],
    not_characteristic: ['控えめな姿勢', 'サポート役', '協調性'],
  },
  PS: {
    very_characteristic: ['冷静な判断', 'プレッシャー耐性', '感情に流されない決断'],
    characteristic: ['客観的な分析', '論理的思考'],
    moderate: ['バランスの取れた判断'],
    less_characteristic: ['共感力', '感情的なサポート', '人間関係の構築'],
    not_characteristic: ['深い共感', '感情的なつながり', '思いやり'],
  },
  EM: {
    very_characteristic: ['共感力', '感情的サポート', 'チームケア'],
    characteristic: ['他者理解', '傾聴', '対人関係の構築'],
    moderate: ['バランスの取れた対人関係'],
    less_characteristic: ['客観的な判断', '感情に左右されない決定'],
    not_characteristic: ['論理的分析', '客観的な評価', '冷静な判断'],
  },
  WR: {
    very_characteristic: ['責任感', '準備性', '計画的な遂行'],
    characteristic: ['着実な仕事ぶり', '信頼性'],
    moderate: ['標準的な仕事への取り組み'],
    less_characteristic: ['柔軟な働き方', '適応力'],
    not_characteristic: ['自由な発想', '独自のアプローチ'],
  },
  LI: {
    very_characteristic: ['一貫性', '信頼性'],
    characteristic: ['安定した回答'],
    moderate: ['標準的なパターン'],
    less_characteristic: ['注意が必要'],
    not_characteristic: ['慎重な解釈が必要'],
  },
};

// =============================================================================
// AI連携クラス
// =============================================================================

export class AIInterpretationService {
  private client: Anthropic | null = null;

  constructor() {
    // APIキーが設定されている場合のみクライアントを初期化
    if (process.env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // AIペイロード生成
  // ---------------------------------------------------------------------------

  /**
   * ドメインスコアからAI入力用ペイロードを生成
   */
  generatePayload(
    domainScores: DomainScore[],
    reliabilityMetrics: ReliabilityMetrics,
    purpose: AnalysisPurpose,
    cognitiveResult?: CognitiveResult
  ): AIInputPayload {
    // ドメインスコアをマップに変換
    const scoreMap = new Map(domainScores.map(ds => [ds.domain, ds]));

    // Big Five のAI表現を生成
    const bigFive: Record<BigFiveDomain, TraitAIRepresentation> = {
      EX: this.createTraitRepresentation(scoreMap.get('EX')),
      CO: this.createTraitRepresentation(scoreMap.get('CO')),
      AG: this.createTraitRepresentation(scoreMap.get('AG')),
      NE: this.createTraitRepresentation(scoreMap.get('NE')),
      OP: this.createTraitRepresentation(scoreMap.get('OP')),
    };

    // Dark Triad のAI表現を生成
    const darkTriad: Record<DarkTriadDomain, TraitAIRepresentation> = {
      MA: this.createTraitRepresentation(scoreMap.get('MA')),
      NA: this.createTraitRepresentation(scoreMap.get('NA')),
      PS: this.createTraitRepresentation(scoreMap.get('PS')),
    };

    // 認知能力プロファイル（オプション）
    let cognitiveProfile: AIInputPayload['cognitiveProfile'];
    if (cognitiveResult) {
      cognitiveProfile = {
        overallLevel: cognitiveResult.normalizedScores.relativePosition,
        description: this.getCognitiveLevelDescription(cognitiveResult.normalizedScores.relativePosition),
        strengthAreas: this.identifyStrengthAreas(cognitiveResult),
        developmentAreas: this.identifyDevelopmentAreas(cognitiveResult),
      };
    }

    return {
      metadata: {
        version: '2.0',
        generatedAt: new Date().toISOString(),
        reliabilityStatus: reliabilityMetrics.socialDesirability.flag,
        analysisPurpose: purpose,
      },
      personalityProfile: {
        bigFive,
        darkTriad,
        empathy: this.createTraitRepresentation(scoreMap.get('EM')),
        workStyle: this.createTraitRepresentation(scoreMap.get('WR')),
      },
      cognitiveProfile,
      reliabilityNote: reliabilityMetrics.interpretationNote,
    };
  }

  /**
   * 特性のAI向け表現を生成
   */
  private createTraitRepresentation(domainScore?: DomainScore): TraitAIRepresentation {
    if (!domainScore) {
      return {
        tendencyLevel: 'moderate',
        description: 'データがありません',
        strengths: [],
        considerations: [],
      };
    }

    const { domain, score } = domainScore;
    const tendencyLevel = score.tendencyLevel;

    return {
      tendencyLevel,
      description: score.description,
      strengths: TRAIT_STRENGTHS[domain]?.[tendencyLevel] ?? [],
      considerations: this.getConsiderations(domain, tendencyLevel),
    };
  }

  /**
   * 考慮点を取得
   */
  private getConsiderations(domain: PersonalityDomain, tendencyLevel: TendencyLevel): string[] {
    // 傾向が極端な場合のみ考慮点を追加
    if (tendencyLevel === 'very_characteristic' || tendencyLevel === 'not_characteristic') {
      return [`${DOMAIN_NAMES[domain]}の傾向が${tendencyLevel === 'very_characteristic' ? '強い' : '控えめな'}ため、状況に応じた調整が効果的です`];
    }
    return [];
  }

  /**
   * 認知能力レベルの説明を取得
   */
  private getCognitiveLevelDescription(level: CognitiveLevel): string {
    const descriptions: Record<CognitiveLevel, string> = {
      significantly_above_average: '論理的推論や問題解決において非常に高い能力を示しています',
      above_average: '論理的推論や問題解決において平均以上の能力を示しています',
      average: '論理的推論や問題解決において一般的な水準の能力を示しています',
      below_average: '特定の領域でのサポートが効果的な場合があります',
      significantly_below_average: '個別のサポートや適切な環境設定が効果的です',
    };
    return descriptions[level];
  }

  /**
   * 認知能力の強み領域を特定
   */
  private identifyStrengthAreas(result: CognitiveResult): CognitiveLevel[] {
    const scores = result.rawScores;
    const avg = scores.total / 4;
    const strengths: CognitiveLevel[] = [];

    // 平均以上の領域を特定
    // （簡易実装：実際にはより詳細な分析が必要）
    return strengths;
  }

  /**
   * 認知能力の発展領域を特定
   */
  private identifyDevelopmentAreas(result: CognitiveResult): CognitiveLevel[] {
    return [];
  }

  // ---------------------------------------------------------------------------
  // プロンプト生成
  // ---------------------------------------------------------------------------

  /**
   * 目的別プロンプトを生成
   */
  generatePrompt(payload: AIInputPayload): string {
    const purposeInstructions = this.getPurposeInstructions(payload.metadata.analysisPurpose);

    return `${SYSTEM_PROMPT}

## 分析目的
${purposeInstructions}

## プロファイルデータ
${JSON.stringify(payload, null, 2)}

## 出力構造
以下のJSON構造で出力してください：
{
  "strengths": [
    { "area": "強みの領域", "description": "説明", "evidenceBasis": "根拠となる特性" }
  ],
  "growthOpportunities": [
    { "area": "成長領域", "suggestion": "提案", "supportingConditions": "効果的な環境" }
  ],
  "communicationProfile": {
    "preferredStyle": "好むコミュニケーションスタイル",
    "effectiveApproaches": ["効果的なアプローチ"],
    "potentialFrictions": ["潜在的な摩擦点"]
  },
  "teamFit": {
    "naturalRoles": ["自然に担う役割"],
    "complementaryProfiles": ["相性の良いプロファイル"],
    "teamContributions": ["チームへの貢献"]
  },
  "interpretationConfidence": {
    "level": "high|moderate|low",
    "factors": ["信頼性に影響する要因"]
  }
}`;
  }

  /**
   * 目的別の指示を取得
   */
  private getPurposeInstructions(purpose: AnalysisPurpose): string {
    const instructions: Record<AnalysisPurpose, string> = {
      individual_report: `
個人の強み、成長機会、コミュニケーションスタイルを分析してください。
- 性格特性の強みを3-5つ特定
- 成長機会を2-3つ提案
- 好むコミュニケーションスタイルを説明`,

      team_matching: `
チーム適性を分析してください。
- この人が力を発揮しやすいチーム環境
- 補完関係を築きやすいメンバータイプ
- 潜在的な摩擦ポイントと対処法
- 推奨される役割・ポジション`,

      one_on_one_support: `
1on1ミーティング支援情報を提供してください。
- 効果的なコミュニケーションスタイル
- モチベーション要因と阻害要因
- フィードバックの受け取り方の特徴
- 成長支援のアプローチ提案`,

      manager_report: `
上司向けの管理ポイントを整理してください。
- 効果的な指示の出し方
- 適切な監督レベル
- 成果を出しやすい環境条件
- 注意すべきストレス要因`,

      team_building: `
チームビルディング向けの情報を提供してください。
- チーム内での自然な役割
- 他メンバーとの協働ポイント
- チーム貢献の形
- 活かすべき強み`,

      career_development: `
キャリア開発向けの情報を提供してください。
- 強みを活かせる役割・職種
- 成長のための推奨アクション
- 長期的なキャリア展望
- スキル開発の優先順位`,
    };

    return instructions[purpose];
  }

  // ---------------------------------------------------------------------------
  // AI呼び出し
  // ---------------------------------------------------------------------------

  /**
   * Claude APIを呼び出して解釈を取得
   */
  async interpret(
    domainScores: DomainScore[],
    reliabilityMetrics: ReliabilityMetrics,
    purpose: AnalysisPurpose,
    cognitiveResult?: CognitiveResult
  ): Promise<AIInterpretationOutput> {
    // APIキーがない場合はデフォルト出力を返す
    if (!this.client) {
      console.warn('Anthropic API key not configured. Returning default interpretation.');
      return this.getDefaultInterpretation(domainScores, reliabilityMetrics);
    }

    const payload = this.generatePayload(domainScores, reliabilityMetrics, purpose, cognitiveResult);
    const prompt = this.generatePrompt(payload);

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // レスポンスからJSONを抽出
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      // JSON部分を抽出してパース
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]) as AIInterpretationOutput;
    } catch (error) {
      console.error('AI interpretation error:', error);
      return this.getDefaultInterpretation(domainScores, reliabilityMetrics);
    }
  }

  /**
   * デフォルトの解釈を生成（API呼び出し失敗時のフォールバック）
   */
  private getDefaultInterpretation(
    domainScores: DomainScore[],
    reliabilityMetrics: ReliabilityMetrics
  ): AIInterpretationOutput {
    const scoreMap = new Map(domainScores.map(ds => [ds.domain, ds]));

    // 強みを特定（T-score 55以上の特性）
    const strengths = domainScores
      .filter(ds => ds.score.tScore >= 55 && ds.domain !== 'LI')
      .slice(0, 3)
      .map(ds => ({
        area: DOMAIN_NAMES[ds.domain],
        description: ds.score.description,
        evidenceBasis: `${DOMAIN_NAMES[ds.domain]}の傾向が特徴的`,
      }));

    return {
      strengths,
      growthOpportunities: [
        {
          area: '自己理解の深化',
          suggestion: '診断結果を振り返り、自分の強みと特徴を意識する',
          supportingConditions: '定期的な自己振り返りの機会',
        },
      ],
      communicationProfile: {
        preferredStyle: '状況に応じた柔軟なコミュニケーション',
        effectiveApproaches: ['相手の状況を確認してから伝える', 'フィードバックを求める'],
        potentialFrictions: [],
      },
      teamFit: {
        naturalRoles: ['チームメンバー'],
        complementaryProfiles: ['多様なスタイルのメンバー'],
        teamContributions: ['チームの目標達成への貢献'],
      },
      interpretationConfidence: {
        level: reliabilityMetrics.socialDesirability.flag === 'high' ? 'high' : 'moderate',
        factors: [reliabilityMetrics.interpretationNote],
      },
    };
  }
}

// シングルトンインスタンス
export const aiInterpretationService = new AIInterpretationService();
