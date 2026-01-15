'use client';

/**
 * 認知能力テストページ
 * jsPsychパラダイムベースの認知機能テストバッテリー
 */

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { NBackTest } from '@/components/cognitive/NBackTest';
import { StroopTest } from '@/components/cognitive/StroopTest';
import { SimpleRTTest } from '@/components/cognitive/SimpleRTTest';
import { cognitiveScoring } from '@/services/CognitiveScoring';
import { saveCognitiveResult, type StoredCognitiveResult } from '@/lib/cognitiveStorage';
import type { CognitiveAnswer, CognitiveTestType, CognitiveResult } from '@/types/assessment';

type TestPhase = 'intro' | 'nback' | 'stroop' | 'simple_rt' | 'calculating' | 'results';

// テスト設定
const TEST_CONFIG = {
  nBack: {
    nLevel: 2 as const,
    trialCount: 30,
    practiceTrials: 10,
    stimulusDuration: 1500,
    isi: 500,
  },
  stroop: {
    trialCount: 40,
    practiceTrials: 8,
    stimulusDuration: 2000,
    isi: 300,
  },
  simpleRT: {
    trialCount: 20,
    practiceTrials: 5,
    minDelay: 1000,
    maxDelay: 3000,
    maxResponseTime: 1000,
  },
};

export default function CognitiveTestPage() {
  const [phase, setPhase] = useState<TestPhase>('intro');
  const [allAnswers, setAllAnswers] = useState<Record<CognitiveTestType, CognitiveAnswer[]>>({
    n_back: [],
    stroop: [],
    simple_rt: [],
  });
  const [result, setResult] = useState<CognitiveResult | null>(null);
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [userName, setUserName] = useState<string>('');
  const [savedResult, setSavedResult] = useState<StoredCognitiveResult | null>(null);

  // 前回のユーザー名を復元
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastUserName = localStorage.getItem('o2connective_last_username');
      if (lastUserName) {
        setUserName(lastUserName);
      }
    }
  }, []);

  // N-back完了
  const handleNBackComplete = useCallback((answers: CognitiveAnswer[]) => {
    setAllAnswers(prev => ({ ...prev, n_back: answers }));
    setPhase('stroop');
  }, []);

  // Stroop完了
  const handleStroopComplete = useCallback((answers: CognitiveAnswer[]) => {
    setAllAnswers(prev => ({ ...prev, stroop: answers }));
    setPhase('simple_rt');
  }, []);

  // 反応時間テスト完了
  const handleSimpleRTComplete = useCallback((answers: CognitiveAnswer[]) => {
    setAllAnswers(prev => ({ ...prev, simple_rt: answers }));
    calculateResults({ ...allAnswers, simple_rt: answers });
  }, [allAnswers]);

  // 結果計算（CognitiveScoringサービスを使用）
  const calculateResults = (answers: Record<CognitiveTestType, CognitiveAnswer[]>) => {
    setPhase('calculating');

    setTimeout(() => {
      const totalTime = performance.now() - testStartTime;

      // スコアリングサービスで結果を計算
      const cognitiveResult = cognitiveScoring.calculateResult(answers, totalTime);

      // 結果を保存
      const stored = saveCognitiveResult(userName, cognitiveResult);
      setSavedResult(stored);

      setResult(cognitiveResult);
      setPhase('results');
    }, 1500);
  };

  // テスト開始
  const startTest = () => {
    if (!userName.trim()) {
      alert('お名前を入力してください');
      return;
    }
    // ユーザー名を保存
    localStorage.setItem('o2connective_last_username', userName.trim());
    setTestStartTime(performance.now());
    setPhase('nback');
  };

  // イントロ画面
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              認知機能テスト
            </h1>

            <div className="bg-indigo-50 rounded-lg p-6 mb-6">
              <h2 className="font-semibold text-indigo-800 mb-3">テストについて</h2>
              <p className="text-gray-700 mb-4">
                このテストは、認知心理学で確立された3つの課題を通じて、
                あなたの認知機能を多角的に測定します。
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">N-back課題</h3>
                    <p className="text-sm text-gray-600">ワーキングメモリの測定</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">ストループ課題</h3>
                    <p className="text-sm text-gray-600">抑制制御・注意の測定</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">反応時間課題</h3>
                    <p className="text-sm text-gray-600">処理速度の測定</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">所要時間</h3>
              <p className="text-sm text-amber-700">約10〜15分</p>
            </div>

            {/* ユーザー名入力 */}
            <div className="mb-8">
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                お名前（結果の保存に使用します）
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="例: 山田太郎"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                maxLength={50}
              />
            </div>

            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                戻る
              </Link>
              <button
                type="button"
                onClick={startTest}
                disabled={!userName.trim()}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg ${
                  userName.trim()
                    ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                テストを開始する
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // N-back テスト
  if (phase === 'nback') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <NBackTest
          nLevel={TEST_CONFIG.nBack.nLevel}
          trialCount={TEST_CONFIG.nBack.trialCount}
          practiceTrials={TEST_CONFIG.nBack.practiceTrials}
          stimulusDuration={TEST_CONFIG.nBack.stimulusDuration}
          isi={TEST_CONFIG.nBack.isi}
          onComplete={handleNBackComplete}
        />
      </div>
    );
  }

  // Stroop テスト
  if (phase === 'stroop') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
        <StroopTest
          trialCount={TEST_CONFIG.stroop.trialCount}
          practiceTrials={TEST_CONFIG.stroop.practiceTrials}
          stimulusDuration={TEST_CONFIG.stroop.stimulusDuration}
          isi={TEST_CONFIG.stroop.isi}
          onComplete={handleStroopComplete}
        />
      </div>
    );
  }

  // 反応時間テスト
  if (phase === 'simple_rt') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 py-12 px-4">
        <SimpleRTTest
          trialCount={TEST_CONFIG.simpleRT.trialCount}
          practiceTrials={TEST_CONFIG.simpleRT.practiceTrials}
          minDelay={TEST_CONFIG.simpleRT.minDelay}
          maxDelay={TEST_CONFIG.simpleRT.maxDelay}
          maxResponseTime={TEST_CONFIG.simpleRT.maxResponseTime}
          onComplete={handleSimpleRTComplete}
        />
      </div>
    );
  }

  // 計算中
  if (phase === 'calculating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">結果を計算中...</h2>
          <p className="text-gray-600">しばらくお待ちください</p>
        </div>
      </div>
    );
  }

  // 結果表示
  if (phase === 'results' && result) {
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
        significantly_above_average: 'text-green-600',
        above_average: 'text-green-500',
        average: 'text-blue-600',
        below_average: 'text-orange-500',
        significantly_below_average: 'text-red-500',
      };
      return colors[level] || 'text-gray-600';
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              認知機能テスト結果
            </h1>

            {/* ユーザー名と保存確認 */}
            {savedResult && (
              <div className="text-center mb-6">
                <p className="text-gray-600">{savedResult.userName} さんの結果</p>
                <p className="text-xs text-green-600 mt-1">
                  結果を保存しました（{new Date(savedResult.completedAt).toLocaleString('ja-JP')}）
                </p>
              </div>
            )}

            {/* 総合スコア */}
            <div className="bg-indigo-50 rounded-lg p-6 mb-8 text-center">
              <p className="text-gray-600 mb-2">総合スコア</p>
              <p className="text-5xl font-bold text-indigo-600 mb-2">
                {result.overallScore.standardScore}
              </p>
              <p className={`font-medium ${getLevelColor(result.overallScore.level)}`}>
                {getLevelLabel(result.overallScore.level)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                パーセンタイル: {result.overallScore.compositePercentile}%
              </p>
            </div>

            {/* ドメイン別スコア */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">領域別スコア</h2>
            <div className="grid gap-4 mb-8">
              {/* ワーキングメモリ */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">ワーキングメモリ</h3>
                  <span className={`font-medium ${getLevelColor(result.domainScores.working_memory.level)}`}>
                    {getLevelLabel(result.domainScores.working_memory.level)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${result.domainScores.working_memory.percentile}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  正答率: {Math.round(result.domainScores.working_memory.accuracy * 100)}%
                </p>
              </div>

              {/* 抑制制御 */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">抑制制御</h3>
                  <span className={`font-medium ${getLevelColor(result.domainScores.inhibition.level)}`}>
                    {getLevelLabel(result.domainScores.inhibition.level)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${result.domainScores.inhibition.percentile}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  正答率: {Math.round(result.domainScores.inhibition.accuracy * 100)}%
                </p>
              </div>

              {/* 処理速度 */}
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">処理速度</h3>
                  <span className={`font-medium ${getLevelColor(result.domainScores.processing_speed.level)}`}>
                    {getLevelLabel(result.domainScores.processing_speed.level)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${result.domainScores.processing_speed.percentile}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  平均反応時間: {Math.round(result.domainScores.processing_speed.meanRT)}ms
                </p>
              </div>
            </div>

            {/* ナビゲーション */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                ホームに戻る
              </Link>
              <Link
                href="/cognitive/history"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                結果履歴を見る
              </Link>
              <Link
                href="/assessment"
                className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
              >
                性格診断を受ける
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
