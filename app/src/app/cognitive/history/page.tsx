'use client';

/**
 * 認知テスト結果履歴ページ
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllResults, deleteResult, type StoredCognitiveResult } from '@/lib/cognitiveStorage';

export default function CognitiveHistoryPage() {
  const [results, setResults] = useState<StoredCognitiveResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setResults(getAllResults());
    setIsLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('この結果を削除しますか？')) {
      deleteResult(id);
      setResults(getAllResults());
    }
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      significantly_above_average: '非常に高い',
      above_average: '高め',
      average: '平均的',
      below_average: 'やや低め',
      significantly_below_average: '低め',
    };
    return labels[level] || '平均的';
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      significantly_above_average: 'bg-green-100 text-green-700',
      above_average: 'bg-green-50 text-green-600',
      average: 'bg-blue-50 text-blue-600',
      below_average: 'bg-orange-50 text-orange-600',
      significantly_below_average: 'bg-red-50 text-red-600',
    };
    return colors[level] || 'bg-gray-50 text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              認知テスト結果履歴
            </h1>
            <div className="flex gap-3">
              <Link
                href="/cognitive"
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
              >
                新しいテストを受ける
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
        </div>

        {/* 結果一覧 */}
        {results.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">まだ結果がありません</p>
            <Link
              href="/cognitive"
              className="inline-block px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
            >
              テストを受ける
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((storedResult) => (
              <div
                key={storedResult.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {storedResult.userName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date(storedResult.completedAt).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(storedResult.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="削除"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* スコアサマリー */}
                <div className="grid grid-cols-4 gap-4">
                  {/* 総合スコア */}
                  <div className="bg-indigo-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-indigo-600 mb-1">総合スコア</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {storedResult.result.overallScore.standardScore}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getLevelColor(storedResult.result.overallScore.level)}`}>
                      {getLevelLabel(storedResult.result.overallScore.level)}
                    </span>
                  </div>

                  {/* ワーキングメモリ */}
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-600 mb-1">ワーキングメモリ</p>
                    <p className="text-lg font-semibold text-blue-700">
                      {storedResult.result.domainScores.working_memory.percentile}%
                    </p>
                    <p className="text-xs text-gray-500">
                      正答率 {Math.round(storedResult.result.domainScores.working_memory.accuracy * 100)}%
                    </p>
                  </div>

                  {/* 抑制制御 */}
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-purple-600 mb-1">抑制制御</p>
                    <p className="text-lg font-semibold text-purple-700">
                      {storedResult.result.domainScores.inhibition.percentile}%
                    </p>
                    <p className="text-xs text-gray-500">
                      正答率 {Math.round(storedResult.result.domainScores.inhibition.accuracy * 100)}%
                    </p>
                  </div>

                  {/* 処理速度 */}
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-orange-600 mb-1">処理速度</p>
                    <p className="text-lg font-semibold text-orange-700">
                      {storedResult.result.domainScores.processing_speed.percentile}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(storedResult.result.domainScores.processing_speed.meanRT)}ms
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* フッター情報 */}
        {results.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            {results.length}件の結果を表示中（最大50件まで保存）
          </div>
        )}
      </div>
    </div>
  );
}
