'use client';

/**
 * 認知能力テスト（ICAR-16）ページ
 * テストフロー全体を管理
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ICAR_16_ITEMS, TEST_TYPE_DESCRIPTIONS } from '@/data/cognitiveTests';
import { CognitiveScoring } from '@/services/CognitiveScoring';
import { CognitiveTestCard } from '@/components/cognitive/CognitiveTestCard';
import { CognitiveResultDisplay } from '@/components/cognitive/CognitiveResultDisplay';
import type { CognitiveAnswer, CognitiveResult } from '@/types/assessment';

type TestPhase = 'intro' | 'testing' | 'calculating' | 'results';

export default function CognitiveTestPage() {
  const [phase, setPhase] = useState<TestPhase>('intro');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [answers, setAnswers] = useState<CognitiveAnswer[]>([]);
  const [result, setResult] = useState<CognitiveResult | null>(null);

  // シャッフルしたテスト項目（初期化時に一度だけ）
  const [testItems] = useState(() => {
    // テストタイプをランダムに混ぜる
    const shuffled = [...ICAR_16_ITEMS].sort(() => Math.random() - 0.5);
    return shuffled;
  });

  const currentItem = testItems[currentItemIndex];
  const totalItems = testItems.length;

  // 回答処理
  const handleAnswer = useCallback((itemId: string, selectedAnswer: string, responseTimeMs: number) => {
    const item = testItems.find(i => i.id === itemId);
    if (!item) return;

    const newAnswer: CognitiveAnswer = {
      itemId,
      selectedAnswer,
      isCorrect: selectedAnswer === item.correctAnswer,
      responseTimeMs,
    };

    setAnswers(prev => [...prev, newAnswer]);

    // 次の問題へ、または結果計算へ
    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else {
      calculateResults([...answers, newAnswer]);
    }
  }, [currentItemIndex, totalItems, answers, testItems]);

  // タイムアウト処理
  const handleTimeout = useCallback((itemId: string) => {
    const newAnswer: CognitiveAnswer = {
      itemId,
      selectedAnswer: '',
      isCorrect: false,
      responseTimeMs: testItems.find(i => i.id === itemId)?.timeLimit ?? 60 * 1000,
    };

    setAnswers(prev => [...prev, newAnswer]);

    // 次の問題へ、または結果計算へ
    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else {
      calculateResults([...answers, newAnswer]);
    }
  }, [currentItemIndex, totalItems, answers, testItems]);

  // 結果計算
  const calculateResults = (finalAnswers: CognitiveAnswer[]) => {
    setPhase('calculating');

    // 計算をシミュレート
    setTimeout(() => {
      const cognitiveResult = CognitiveScoring.calculateResult(finalAnswers, testItems);
      setResult(cognitiveResult);
      setPhase('results');
    }, 1500);
  };

  // テスト開始
  const startTest = () => {
    setPhase('testing');
  };

  // フェーズ別レンダリング
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              認知能力テスト
            </h1>

            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h2 className="font-semibold text-purple-800 mb-3">テストについて</h2>
              <p className="text-gray-700 mb-4">
                このテストは、ICAR（International Cognitive Ability Resource）に基づく
                16問の認知能力テストです。論理的思考、パターン認識、言語推論、空間認知の
                4つの領域を測定します。
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">●</span>
                  <span><strong>問題数:</strong> 16問（4種類×4問）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">●</span>
                  <span><strong>所要時間:</strong> 約15-20分</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">●</span>
                  <span><strong>制限時間:</strong> 各問題に制限時間があります</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="font-semibold text-gray-800 mb-3">テストの種類</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-800">行列推理</p>
                  <p className="text-xs text-gray-500">パターン認識</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-800">文字数列</p>
                  <p className="text-xs text-gray-500">系列完成</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-800">言語推理</p>
                  <p className="text-xs text-gray-500">論理的推論</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-800">3D回転</p>
                  <p className="text-xs text-gray-500">空間認知</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                注意事項
              </h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• 静かな環境で集中して取り組んでください</li>
                <li>• 各問題には制限時間があります</li>
                <li>• 一度回答すると前の問題には戻れません</li>
                <li>• 分からない場合は推測して回答してください</li>
              </ul>
            </div>

            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                戻る
              </Link>
              <button
                onClick={startTest}
                className="px-8 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors shadow-lg"
              >
                テストを開始する
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'testing' && currentItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
        <CognitiveTestCard
          item={currentItem}
          questionNumber={currentItemIndex + 1}
          totalQuestions={totalItems}
          onAnswer={handleAnswer}
          onTimeout={handleTimeout}
        />
      </div>
    );
  }

  if (phase === 'calculating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">結果を計算中...</h2>
          <p className="text-gray-600">しばらくお待ちください</p>
        </div>
      </div>
    );
  }

  if (phase === 'results' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
        <CognitiveResultDisplay result={result} />
      </div>
    );
  }

  return null;
}
