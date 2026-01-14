'use client';

/**
 * 結果表示コンポーネント
 * 多層スコアの可視化とAI解釈の表示
 */

import type {
  DomainScore,
  PersonalityDomain,
  ReliabilityMetrics,
  AIInterpretationOutput,
  TendencyLevel,
} from '@/types/assessment';
import { DOMAIN_NAMES } from '@/types/assessment';

interface ResultDisplayProps {
  domainScores: DomainScore[];
  reliabilityMetrics: ReliabilityMetrics;
  aiInterpretation?: AIInterpretationOutput;
}

// 傾向レベルの色マッピング
const TENDENCY_COLORS: Record<TendencyLevel, { bg: string; text: string; bar: string }> = {
  very_characteristic: { bg: 'bg-blue-100', text: 'text-blue-800', bar: 'bg-blue-500' },
  characteristic: { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-400' },
  moderate: { bg: 'bg-gray-100', text: 'text-gray-700', bar: 'bg-gray-400' },
  less_characteristic: { bg: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-400' },
  not_characteristic: { bg: 'bg-orange-100', text: 'text-orange-800', bar: 'bg-orange-500' },
};

// 傾向レベルの日本語ラベル
const TENDENCY_LABELS: Record<TendencyLevel, string> = {
  very_characteristic: '非常に特徴的',
  characteristic: '特徴的',
  moderate: '中程度',
  less_characteristic: 'やや控えめ',
  not_characteristic: '控えめ',
};

// ドメインのカテゴリ分け
const DOMAIN_GROUPS = {
  bigfive: ['EX', 'CO', 'AG', 'NE', 'OP'] as PersonalityDomain[],
  darktriad: ['MA', 'NA', 'PS'] as PersonalityDomain[],
  additional: ['EM', 'WR'] as PersonalityDomain[],
};

export function ResultDisplay({
  domainScores,
  reliabilityMetrics,
  aiInterpretation,
}: ResultDisplayProps) {
  const scoreMap = new Map(domainScores.map(ds => [ds.domain, ds]));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* 信頼性バナー */}
      {reliabilityMetrics.socialDesirability.flag !== 'high' && (
        <div
          className={`p-4 rounded-lg ${
            reliabilityMetrics.socialDesirability.flag === 'low'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{reliabilityMetrics.interpretationNote}</span>
          </div>
        </div>
      )}

      {/* Big Five セクション */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm">
            5
          </span>
          Big Five 性格特性
        </h2>
        <p className="text-gray-600 mb-6">
          性格の基本的な傾向を示します。能力ではなく「どのような環境・状況で力を発揮しやすいか」の指標です。
        </p>
        <div className="space-y-4">
          {DOMAIN_GROUPS.bigfive.map(domain => {
            const score = scoreMap.get(domain);
            if (!score) return null;
            return <ScoreBar key={domain} domainScore={score} />;
          })}
        </div>
      </section>

      {/* Dark Triad セクション */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm">
            3
          </span>
          対人関係スタイル
        </h2>
        <p className="text-gray-600 mb-6">
          対人場面での行動パターンを示します。適切な文脈では強みとなる特性です。
        </p>
        <div className="space-y-4">
          {DOMAIN_GROUPS.darktriad.map(domain => {
            const score = scoreMap.get(domain);
            if (!score) return null;
            return <ScoreBar key={domain} domainScore={score} />;
          })}
        </div>
      </section>

      {/* 追加特性セクション */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-sm">
            +
          </span>
          追加特性
        </h2>
        <div className="space-y-4">
          {DOMAIN_GROUPS.additional.map(domain => {
            const score = scoreMap.get(domain);
            if (!score) return null;
            return <ScoreBar key={domain} domainScore={score} />;
          })}
        </div>
      </section>

      {/* AI解釈セクション */}
      {aiInterpretation && (
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI分析結果
          </h2>

          {/* 強み */}
          {aiInterpretation.strengths.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">あなたの強み</h3>
              <div className="grid gap-3">
                {aiInterpretation.strengths.map((strength, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-blue-700">{strength.area}</h4>
                    <p className="text-gray-600 text-sm mt-1">{strength.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 成長機会 */}
          {aiInterpretation.growthOpportunities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">成長機会</h3>
              <div className="grid gap-3">
                {aiInterpretation.growthOpportunities.map((opportunity, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-green-700">{opportunity.area}</h4>
                    <p className="text-gray-600 text-sm mt-1">{opportunity.suggestion}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      効果的な環境: {opportunity.supportingConditions}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* コミュニケーションスタイル */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">コミュニケーションスタイル</h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-gray-700">{aiInterpretation.communicationProfile.preferredStyle}</p>
              {aiInterpretation.communicationProfile.effectiveApproaches.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-2">効果的なアプローチ:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {aiInterpretation.communicationProfile.effectiveApproaches.map((approach, i) => (
                      <li key={i}>{approach}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* チーム適性 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">チーム適性</h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {aiInterpretation.teamFit.naturalRoles.map((role, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {role}
                  </span>
                ))}
              </div>
              {aiInterpretation.teamFit.teamContributions.length > 0 && (
                <p className="text-gray-600 text-sm mt-3">
                  チームへの貢献: {aiInterpretation.teamFit.teamContributions.join('、')}
                </p>
              )}
            </div>
          </div>

          {/* 解釈の確度 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              解釈の確度:{' '}
              <span
                className={`font-medium ${
                  aiInterpretation.interpretationConfidence.level === 'high'
                    ? 'text-green-600'
                    : aiInterpretation.interpretationConfidence.level === 'moderate'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {aiInterpretation.interpretationConfidence.level === 'high'
                  ? '高'
                  : aiInterpretation.interpretationConfidence.level === 'moderate'
                    ? '中'
                    : '低'}
              </span>
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

// スコアバーコンポーネント
function ScoreBar({ domainScore }: { domainScore: DomainScore }) {
  const { domain, score } = domainScore;
  const colors = TENDENCY_COLORS[score.tendencyLevel];

  // T-scoreを0-100のパーセンテージに変換（20-80の範囲を0-100に）
  const barWidth = Math.max(0, Math.min(100, ((score.tScore - 20) / 60) * 100));

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-800">{DOMAIN_NAMES[domain]}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
            {TENDENCY_LABELS[score.tendencyLevel]}
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-700">{score.tScore}</span>
          <span className="text-xs text-gray-500 block">T-score</span>
        </div>
      </div>

      {/* スコアバー */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
        {/* 中央マーカー（T-score 50） */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 z-10" />
        {/* スコアバー */}
        <div
          className={`h-full ${colors.bar} transition-all duration-500`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* 傾向の説明 */}
      <p className="text-sm text-gray-600">{score.description}</p>
    </div>
  );
}
