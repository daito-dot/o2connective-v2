'use client';

/**
 * 単純反応時間課題コンポーネント
 * 処理速度を測定するシンプルな認知テストパラダイム
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CognitiveAnswer } from '@/types/assessment';

interface SimpleRTTestProps {
  trialCount: number;         // 本試行数
  practiceTrials: number;     // 練習試行数
  minDelay: number;           // 最小遅延（ms）
  maxDelay: number;           // 最大遅延（ms）
  maxResponseTime: number;    // 最大反応時間（ms）
  onComplete: (answers: CognitiveAnswer[]) => void;
  onProgress?: (current: number, total: number) => void;
}

type Phase = 'instruction' | 'practice' | 'ready' | 'test' | 'feedback' | 'complete';

interface Trial {
  delay: number;              // 刺激出現までの遅延
  index: number;
}

/**
 * 試行シーケンスを生成
 */
function generateTrials(count: number, minDelay: number, maxDelay: number): Trial[] {
  const trials: Trial[] = [];

  for (let i = 0; i < count; i++) {
    const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
    trials.push({ delay, index: i });
  }

  return trials;
}

export function SimpleRTTest({
  trialCount,
  practiceTrials,
  minDelay,
  maxDelay,
  maxResponseTime,
  onComplete,
  onProgress,
}: SimpleRTTestProps) {
  const [phase, setPhase] = useState<Phase>('instruction');
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [showStimulus, setShowStimulus] = useState(false);
  const [showWaiting, setShowWaiting] = useState(false);
  const [answers, setAnswers] = useState<CognitiveAnswer[]>([]);
  const [isPractice, setIsPractice] = useState(true);
  const [practiceResults, setPracticeResults] = useState<{ avgRT: number; validCount: number } | null>(null);
  const [lastRT, setLastRT] = useState<number | null>(null);
  const [error, setError] = useState<'early' | 'late' | null>(null);

  const trialStartTime = useRef<number>(0);
  const responseRecorded = useRef<boolean>(false);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 試行シーケンス初期化
  useEffect(() => {
    const practiceSeq = generateTrials(practiceTrials, minDelay, maxDelay);
    setTrials(practiceSeq);
  }, [practiceTrials, minDelay, maxDelay]);

  // 次の試行へ
  const nextTrial = useCallback(() => {
    setError(null);
    setLastRT(null);
    setShowStimulus(false);
    setShowWaiting(false);
    setCurrentTrialIndex(prev => prev + 1);
  }, []);

  // 試行実行
  const runTrial = useCallback(() => {
    if (currentTrialIndex >= trials.length) {
      if (isPractice) {
        const validAnswers = answers.filter(a => a.isCorrect);
        const avgRT = validAnswers.length > 0
          ? Math.round(validAnswers.reduce((sum, a) => sum + a.responseTimeMs, 0) / validAnswers.length)
          : 0;
        setPracticeResults({ avgRT, validCount: validAnswers.length });
        setPhase('feedback');
      } else {
        setPhase('complete');
        onComplete(answers);
      }
      return;
    }

    responseRecorded.current = false;
    setError(null);
    setLastRT(null);
    setShowWaiting(true);
    setShowStimulus(false);

    const trial = trials[currentTrialIndex];

    // 遅延後に刺激表示
    delayTimerRef.current = setTimeout(() => {
      trialStartTime.current = performance.now();
      setShowWaiting(false);
      setShowStimulus(true);

      // タイムアウト処理
      timeoutTimerRef.current = setTimeout(() => {
        if (!responseRecorded.current) {
          const answer: CognitiveAnswer = {
            testType: 'simple_rt',
            trialIndex: currentTrialIndex,
            response: null,
            isCorrect: false,
            responseTimeMs: maxResponseTime,
            timestamp: new Date(),
          };
          setAnswers(prev => [...prev, answer]);
          setError('late');
          setTimeout(nextTrial, 1000);
        }
      }, maxResponseTime);
    }, trial.delay);
  }, [currentTrialIndex, trials, isPractice, answers, maxResponseTime, onComplete, nextTrial]);

  // フェーズ変更時の処理
  useEffect(() => {
    if (phase === 'practice' || phase === 'test') {
      runTrial();
    }
  }, [phase, currentTrialIndex, runTrial]);

  // キー押下ハンドラ
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (phase !== 'practice' && phase !== 'test') return;
      if (responseRecorded.current) return;
      if (e.key !== ' ') return;

      e.preventDefault();
      responseRecorded.current = true;

      // タイマーをクリア
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);

      // 刺激前の押下（早押しエラー）
      if (!showStimulus) {
        const answer: CognitiveAnswer = {
          testType: 'simple_rt',
          trialIndex: currentTrialIndex,
          response: 'early',
          isCorrect: false,
          responseTimeMs: 0,
          timestamp: new Date(),
        };
        setAnswers(prev => [...prev, answer]);
        setError('early');
        setShowWaiting(false);
        setTimeout(nextTrial, 1000);
        return;
      }

      // 正常な反応
      const rt = performance.now() - trialStartTime.current;

      const answer: CognitiveAnswer = {
        testType: 'simple_rt',
        trialIndex: currentTrialIndex,
        response: ' ',
        isCorrect: true,
        responseTimeMs: rt,
        timestamp: new Date(),
      };

      setAnswers(prev => [...prev, answer]);
      setLastRT(Math.round(rt));
      onProgress?.(currentTrialIndex + 1, trials.length);

      setTimeout(nextTrial, isPractice ? 1500 : 500);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, currentTrialIndex, showStimulus, isPractice, trials, onProgress, nextTrial]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, []);

  // 本試行開始
  const startMainTest = () => {
    const mainTrials = generateTrials(trialCount, minDelay, maxDelay);
    setTrials(mainTrials);
    setCurrentTrialIndex(0);
    setAnswers([]);
    setIsPractice(false);
    setPhase('ready');
  };

  // レンダリング
  if (phase === 'instruction') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          反応時間課題
        </h2>

        <div className="bg-orange-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-orange-800 mb-3">課題の説明</h3>
          <p className="text-gray-700 mb-4">
            画面中央に<strong className="text-orange-700">緑色の円</strong>が表示されたら、
            できるだけ速くスペースキーを押してください。
          </p>

          <div className="bg-white rounded-lg p-4 mb-4 text-center">
            <div className="inline-flex items-center gap-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-2">
                  <span className="text-gray-600">待機</span>
                </div>
                <p className="text-xs text-gray-500">待っている間</p>
              </div>
              <span className="text-2xl text-gray-400">→</span>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">●</span>
                </div>
                <p className="text-xs text-gray-500">押す！</p>
              </div>
            </div>
          </div>

          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 緑色の円が出る前に押すと「早押しエラー」になります</li>
            <li>• できるだけ速く反応することが重要です</li>
            <li>• 反応時間はミリ秒単位で計測されます</li>
          </ul>
        </div>

        <button
          onClick={() => setPhase('practice')}
          className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          練習を始める
        </button>
      </div>
    );
  }

  if (phase === 'practice' || phase === 'test') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-sm text-gray-500 mb-8">
          {isPractice ? '練習' : '本番'} - {currentTrialIndex + 1} / {trials.length}
        </div>

        <div className="w-40 h-40 rounded-full flex items-center justify-center transition-colors duration-100"
          style={{
            backgroundColor: error
              ? (error === 'early' ? '#FEE2E2' : '#FEE2E2')
              : showStimulus
                ? '#22C55E'
                : showWaiting
                  ? '#E5E7EB'
                  : 'white',
            border: '4px solid',
            borderColor: error
              ? '#EF4444'
              : showStimulus
                ? '#16A34A'
                : '#D1D5DB',
          }}
        >
          {error === 'early' && (
            <span className="text-red-600 font-bold">早押し！</span>
          )}
          {error === 'late' && (
            <span className="text-red-600 font-bold">時間切れ</span>
          )}
          {lastRT !== null && (
            <div className="text-center">
              <span className="text-2xl font-bold text-green-700">{lastRT}</span>
              <span className="text-sm text-green-600 block">ms</span>
            </div>
          )}
          {showWaiting && !error && (
            <span className="text-gray-500 text-sm">待機中...</span>
          )}
        </div>

        <div className="mt-8 text-gray-600">
          <p>緑の円が出たら <kbd className="px-2 py-1 bg-gray-200 rounded">Space</kbd> を押す</p>
        </div>
      </div>
    );
  }

  if (phase === 'feedback') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">練習完了！</h3>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-gray-600 mb-2">平均反応時間</p>
          <p className="text-3xl font-bold text-orange-600">
            {practiceResults?.avgRT || '--'} <span className="text-lg">ms</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            有効試行: {practiceResults?.validCount} / {practiceTrials}
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          一般的な反応時間は200〜300ms程度です
        </p>

        <button
          onClick={startMainTest}
          className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
        >
          本番テストを開始
        </button>
      </div>
    );
  }

  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-2xl text-gray-600 mb-4">準備してください...</p>
        <p className="text-gray-400">3秒後に開始します</p>
        {setTimeout(() => setPhase('test'), 3000) && null}
      </div>
    );
  }

  return null;
}
