'use client';

/**
 * 認知テスト結果表示コンポーネント
 * ICAR-16の結果を視覚的に表示
 */

import type { CognitiveResult, CognitiveTestType } from '@/types/assessment';
import { TEST_TYPE_DESCRIPTIONS } from '@/data/cognitiveTests';
import Link from 'next/link';

interface CognitiveResultDisplayProps {
  result: CognitiveResult;
}

const LEVEL_COLORS: Record<CognitiveResult['level'], { bg: string; text: string; label: string }> = {
  significantly_above_average: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '非常に高い' },
  above_average: { bg: 'bg-green-100', text: 'text-green-700', label: '高い' },
  average: { bg: 'bg-blue-100', text: 'text-blue-700', label: '平均' },
  below_average: { bg: 'bg-orange-100', text: 'text-orange-700', label: '低め' },
  significantly_below_average: { bg: 'bg-red-100', text: 'text-red-700', label: '低い' },
};

const LEVEL_DESCRIPTIONS: Record<CognitiveResult['level'], string> = {
  significantly_above_average: '論理的思考と問題解決において非常に優れた能力を示しています。複雑なパターンの認識や抽象的な推論に強みがあります。',
  above_average: '論理的思考と問題解決において平均以上の能力を発揮しています。新しい情報の理解や応用が得意です。',
  average: '一般的な水準の認知処理能力を持っています。日常的な問題解決や学習において標準的なパフォーマンスが期待できます。',
  below_average: '認知処理において一部の領域で改善の余地があります。練習や学習により向上が期待できます。',
  significantly_below_average: '認知処理において支援が有効な可能性があります。特定の学習方法やサポートにより能力を発揮できます。',
};

export function CognitiveResultDisplay({ result }: CognitiveResultDisplayProps) {
  const levelInfo = LEVEL_COLORS[result.level];

  // テストタイプ別の正答率を計算
  const typeBreakdown = Object.entries(result.typeBreakdown) as [CognitiveTestType, { correct: number; total: number }][];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* 総合結果カード */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          認知能力テスト結果
        </h2>

        {/* 総合スコア */}
        <div className="flex flex-col items-center mb-8">
          <div className={`w-32 h-32 rounded-full ${levelInfo.bg} flex items-center justify-center mb-4`}>
            <span className={`text-4xl font-bold ${levelInfo.text}`}>
              {result.standardScore}
            </span>
          </div>
          <div className={`px-4 py-2 rounded-full ${levelInfo.bg} ${levelInfo.text} font-semibold`}>
            {levelInfo.label}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            標準スコア（平均100, SD15）
          </p>
        </div>

        {/* スコア解説 */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-2">あなたの認知能力について</h3>
          <p className="text-gray-600 leading-relaxed">
            {LEVEL_DESCRIPTIONS[result.level]}
          </p>
        </div>

        {/* 詳細スコア */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-sm text-purple-600 mb-1">正答率</p>
            <p className="text-2xl font-bold text-purple-700">
              {Math.round((result.rawScore / result.totalItems) * 100)}%
            </p>
            <p className="text-xs text-purple-500">
              {result.rawScore} / {result.totalItems} 問正解
            </p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <p className="text-sm text-indigo-600 mb-1">パーセンタイル</p>
            <p className="text-2xl font-bold text-indigo-700">
              {result.percentile}%
            </p>
            <p className="text-xs text-indigo-500">
              上位{100 - result.percentile}%
            </p>
          </div>
        </div>

        {/* テストタイプ別結果 */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">テストタイプ別の結果</h3>
          <div className="space-y-4">
            {typeBreakdown.map(([type, data]) => {
              const typeInfo = TEST_TYPE_DESCRIPTIONS[type];
              const percentage = (data.correct / data.total) * 100;

              return (
                <div key={type} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium text-gray-800">{typeInfo.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {data.correct}/{data.total}問正解
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${
                      percentage >= 75 ? 'text-green-600' :
                      percentage >= 50 ? 'text-blue-600' :
                      percentage >= 25 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        percentage >= 75 ? 'bg-green-500' :
                        percentage >= 50 ? 'bg-blue-500' :
                        percentage >= 25 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{typeInfo.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          結果の解釈について
        </h3>
        <ul className="text-sm text-amber-700 space-y-2">
          <li>• 認知能力テストは特定の認知スキルを測定するものであり、全体的な知性や能力を表すものではありません</li>
          <li>• テスト結果は当日のコンディションや集中度によって変動することがあります</li>
          <li>• 認知能力は訓練により向上させることができます</li>
          <li>• このテストは性格診断とは独立したものであり、性格特性と混同しないでください</li>
        </ul>
      </div>

      {/* ナビゲーション */}
      <div className="flex justify-center gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          ホームに戻る
        </Link>
        <Link
          href="/assessment"
          className="px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
        >
          性格診断を受ける
        </Link>
      </div>
    </div>
  );
}
