'use client';

/**
 * ストループ課題コンポーネント
 * 抑制制御・注意を測定する確立された認知テストパラダイム
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { StroopTrial, CognitiveAnswer } from '@/types/assessment';

interface StroopTestProps {
  trialCount: number;         // 本試行数
  practiceTrials: number;     // 練習試行数
  stimulusDuration: number;   // 刺激表示時間（ms）
  isi: number;                // 刺激間隔（ms）
  onComplete: (answers: CognitiveAnswer[]) => void;
  onProgress?: (current: number, total: number) => void;
}

type Phase = 'instruction' | 'practice' | 'ready' | 'test' | 'feedback' | 'complete';

// 色とキーのマッピング
const COLOR_MAP = {
  red: { name: 'あか', hex: '#EF4444', key: 'f' },
  blue: { name: 'あお', hex: '#3B82F6', key: 'j' },
  green: { name: 'みどり', hex: '#22C55E', key: 'k' },
  yellow: { name: 'きいろ', hex: '#EAB308', key: 'd' },
};

type ColorKey = keyof typeof COLOR_MAP;

// 一致/不一致の割合
const CONGRUENT_RATE = 0.5;

/**
 * Stroop試行シーケンスを生成
 */
function generateTrials(count: number): StroopTrial[] {
  const trials: StroopTrial[] = [];
  const colors = Object.keys(COLOR_MAP) as ColorKey[];

  for (let i = 0; i < count; i++) {
    const isCongruent = Math.random() < CONGRUENT_RATE;

    // ランダムに色を選択
    const wordColorIndex = Math.floor(Math.random() * colors.length);
    const wordColor = colors[wordColorIndex];

    let inkColor: ColorKey;
    if (isCongruent) {
      // 一致条件：単語と文字色が同じ
      inkColor = wordColor;
    } else {
      // 不一致条件：単語と文字色が異なる
      const otherColors = colors.filter(c => c !== wordColor);
      inkColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    }

    trials.push({
      word: COLOR_MAP[wordColor].name,
      color: COLOR_MAP[inkColor].hex,
      isCongruent,
      correctResponse: COLOR_MAP[inkColor].key,
    });
  }

  return trials;
}

export function StroopTest({
  trialCount,
  practiceTrials,
  stimulusDuration,
  isi,
  onComplete,
  onProgress,
}: StroopTestProps) {
  const [phase, setPhase] = useState<Phase>('instruction');
  const [trials, setTrials] = useState<StroopTrial[]>([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [showStimulus, setShowStimulus] = useState(false);
  const [answers, setAnswers] = useState<CognitiveAnswer[]>([]);
  const [isPractice, setIsPractice] = useState(true);
  const [practiceResults, setPracticeResults] = useState<{ correct: number; total: number } | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const trialStartTime = useRef<number>(0);
  const responseRecorded = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 試行シーケンス初期化
  useEffect(() => {
    const practiceSeq = generateTrials(practiceTrials);
    setTrials(practiceSeq);
  }, [practiceTrials]);

  // 次の試行へ
  const nextTrial = useCallback(() => {
    setShowFeedback(null);
    setCurrentTrialIndex(prev => prev + 1);
  }, []);

  // 試行実行
  const runTrial = useCallback(() => {
    if (currentTrialIndex >= trials.length) {
      if (isPractice) {
        const correct = answers.filter(a => a.isCorrect).length;
        setPracticeResults({ correct, total: answers.length });
        setPhase('feedback');
      } else {
        setPhase('complete');
        onComplete(answers);
      }
      return;
    }

    responseRecorded.current = false;
    trialStartTime.current = performance.now();
    setShowStimulus(true);

    // タイムアウト処理
    timerRef.current = setTimeout(() => {
      if (!responseRecorded.current) {
        const trial = trials[currentTrialIndex];
        const answer: CognitiveAnswer = {
          testType: 'stroop',
          trialIndex: currentTrialIndex,
          response: null,
          isCorrect: false,
          responseTimeMs: stimulusDuration,
          timestamp: new Date(),
        };
        setAnswers(prev => [...prev, answer]);

        if (isPractice) {
          setShowFeedback('incorrect');
          setTimeout(nextTrial, 500);
        } else {
          setShowStimulus(false);
          setTimeout(() => setCurrentTrialIndex(prev => prev + 1), isi);
        }
      }
    }, stimulusDuration);
  }, [currentTrialIndex, trials, isPractice, answers, stimulusDuration, isi, onComplete, nextTrial]);

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

      const validKeys = ['f', 'j', 'k', 'd'];
      if (!validKeys.includes(e.key.toLowerCase())) return;

      e.preventDefault();
      responseRecorded.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);

      const rt = performance.now() - trialStartTime.current;
      const trial = trials[currentTrialIndex];
      const isCorrect = e.key.toLowerCase() === trial.correctResponse;

      const answer: CognitiveAnswer = {
        testType: 'stroop',
        trialIndex: currentTrialIndex,
        response: e.key.toLowerCase(),
        isCorrect,
        responseTimeMs: rt,
        timestamp: new Date(),
      };

      setAnswers(prev => [...prev, answer]);
      onProgress?.(currentTrialIndex + 1, trials.length);

      setShowStimulus(false);

      if (isPractice) {
        setShowFeedback(isCorrect ? 'correct' : 'incorrect');
        setTimeout(nextTrial, 500);
      } else {
        setTimeout(() => setCurrentTrialIndex(prev => prev + 1), isi);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, currentTrialIndex, trials, isPractice, isi, onProgress, nextTrial]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 本試行開始
  const startMainTest = () => {
    const mainTrials = generateTrials(trialCount);
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
          ストループ課題
        </h2>

        <div className="bg-purple-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-purple-800 mb-3">課題の説明</h3>
          <p className="text-gray-700 mb-4">
            色のついた文字が表示されます。
            <strong className="text-purple-700">
              文字の意味ではなく、文字の「色」
            </strong>
            に対応するキーを押してください。
          </p>

          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-3">キーと色の対応：</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1 bg-gray-200 rounded font-mono">D</kbd>
                <span className="w-4 h-4 rounded bg-yellow-500"></span>
                <span>きいろ</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1 bg-gray-200 rounded font-mono">F</kbd>
                <span className="w-4 h-4 rounded bg-red-500"></span>
                <span>あか</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1 bg-gray-200 rounded font-mono">J</kbd>
                <span className="w-4 h-4 rounded bg-blue-500"></span>
                <span>あお</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1 bg-gray-200 rounded font-mono">K</kbd>
                <span className="w-4 h-4 rounded bg-green-500"></span>
                <span>みどり</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">例：</p>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-2xl font-bold" style={{ color: '#3B82F6' }}>あか</span>
                <p className="text-xs text-gray-500 mt-1">→ Jキー（青色）を押す</p>
              </div>
              <div>
                <span className="text-2xl font-bold" style={{ color: '#EF4444' }}>あか</span>
                <p className="text-xs text-gray-500 mt-1">→ Fキー（赤色）を押す</p>
              </div>
            </div>
          </div>

          <ul className="text-sm text-gray-600 space-y-1">
            <li>• できるだけ速く、正確に反応してください</li>
            <li>• 文字の意味に惑わされないように！</li>
          </ul>
        </div>

        <button
          onClick={() => setPhase('practice')}
          className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
        >
          練習を始める
        </button>
      </div>
    );
  }

  if (phase === 'practice' || phase === 'test') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-sm text-gray-500 mb-4">
          {isPractice ? '練習' : '本番'} - {currentTrialIndex + 1} / {trials.length}
        </div>

        <div className="w-64 h-40 flex items-center justify-center bg-gray-100 rounded-xl border-4 border-gray-200 relative">
          {showStimulus && trials[currentTrialIndex] && (
            <span
              className="text-5xl font-bold"
              style={{ color: trials[currentTrialIndex].color }}
            >
              {trials[currentTrialIndex].word}
            </span>
          )}

          {showFeedback && (
            <div className={`absolute inset-0 flex items-center justify-center rounded-xl ${
              showFeedback === 'correct' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <span className={`text-3xl ${
                showFeedback === 'correct' ? 'text-green-600' : 'text-red-600'
              }`}>
                {showFeedback === 'correct' ? '○' : '×'}
              </span>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <kbd className="px-3 py-2 bg-yellow-100 rounded font-mono">D</kbd>
            <div className="mt-1 w-4 h-4 mx-auto rounded bg-yellow-500"></div>
          </div>
          <div className="text-center">
            <kbd className="px-3 py-2 bg-red-100 rounded font-mono">F</kbd>
            <div className="mt-1 w-4 h-4 mx-auto rounded bg-red-500"></div>
          </div>
          <div className="text-center">
            <kbd className="px-3 py-2 bg-blue-100 rounded font-mono">J</kbd>
            <div className="mt-1 w-4 h-4 mx-auto rounded bg-blue-500"></div>
          </div>
          <div className="text-center">
            <kbd className="px-3 py-2 bg-green-100 rounded font-mono">K</kbd>
            <div className="mt-1 w-4 h-4 mx-auto rounded bg-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'feedback') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">練習完了！</h3>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-gray-600 mb-2">練習結果</p>
          <p className="text-3xl font-bold text-purple-600">
            {practiceResults?.correct} / {practiceResults?.total}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            正答率: {Math.round((practiceResults?.correct || 0) / (practiceResults?.total || 1) * 100)}%
          </p>
        </div>

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
