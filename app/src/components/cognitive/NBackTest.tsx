'use client';

/**
 * N-back課題コンポーネント
 * ワーキングメモリを測定する確立された認知テストパラダイム
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { NBackTrial, CognitiveAnswer } from '@/types/assessment';

interface NBackTestProps {
  nLevel: 1 | 2;              // 1-back or 2-back
  trialCount: number;         // 本試行数
  practiceTrials: number;     // 練習試行数
  stimulusDuration: number;   // 刺激表示時間（ms）
  isi: number;                // 刺激間隔（ms）
  onComplete: (answers: CognitiveAnswer[]) => void;
  onProgress?: (current: number, total: number) => void;
}

type Phase = 'instruction' | 'practice' | 'ready' | 'test' | 'feedback' | 'complete';

// 使用する刺激セット（文字）
const STIMULI = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// ターゲット率（N個前と一致する確率）
const TARGET_RATE = 0.3;

/**
 * N-back試行シーケンスを生成
 */
function generateTrials(n: number, count: number): NBackTrial[] {
  const trials: NBackTrial[] = [];

  for (let i = 0; i < count; i++) {
    let stimulus: string;
    let isTarget = false;

    if (i >= n && Math.random() < TARGET_RATE) {
      // ターゲット試行：N個前と同じ刺激
      stimulus = trials[i - n].stimulus;
      isTarget = true;
    } else {
      // 非ターゲット試行：N個前と異なる刺激
      const previousStimulus = i >= n ? trials[i - n].stimulus : null;
      const availableStimuli = STIMULI.filter(s => s !== previousStimulus);
      stimulus = availableStimuli[Math.floor(Math.random() * availableStimuli.length)];
    }

    trials.push({ stimulus, isTarget, position: i });
  }

  return trials;
}

export function NBackTest({
  nLevel,
  trialCount,
  practiceTrials,
  stimulusDuration,
  isi,
  onComplete,
  onProgress,
}: NBackTestProps) {
  const [phase, setPhase] = useState<Phase>('instruction');
  const [trials, setTrials] = useState<NBackTrial[]>([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [showStimulus, setShowStimulus] = useState(false);
  const [answers, setAnswers] = useState<CognitiveAnswer[]>([]);
  const [isPractice, setIsPractice] = useState(true);
  const [practiceResults, setPracticeResults] = useState<{ correct: number; total: number } | null>(null);

  const trialStartTime = useRef<number>(0);
  const responseRecorded = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 試行シーケンス初期化
  useEffect(() => {
    const practiceSeq = generateTrials(nLevel, practiceTrials);
    setTrials(practiceSeq);
  }, [nLevel, practiceTrials]);

  // 試行実行
  const runTrial = useCallback(() => {
    if (currentTrialIndex >= trials.length) {
      if (isPractice) {
        // 練習終了
        const correct = answers.filter(a => a.isCorrect).length;
        setPracticeResults({ correct, total: answers.length });
        setPhase('feedback');
      } else {
        // 本試行終了
        setPhase('complete');
        onComplete(answers);
      }
      return;
    }

    responseRecorded.current = false;
    trialStartTime.current = performance.now();
    setShowStimulus(true);

    // 刺激表示時間後に非表示
    timerRef.current = setTimeout(() => {
      setShowStimulus(false);

      // 反応がなかった場合の処理
      setTimeout(() => {
        if (!responseRecorded.current) {
          const trial = trials[currentTrialIndex];
          const answer: CognitiveAnswer = {
            testType: 'n_back',
            trialIndex: currentTrialIndex,
            response: null,
            isCorrect: !trial.isTarget, // ターゲットに無反応 = 誤り
            responseTimeMs: stimulusDuration + isi,
            timestamp: new Date(),
          };
          setAnswers(prev => [...prev, answer]);
        }
        setCurrentTrialIndex(prev => prev + 1);
      }, isi);
    }, stimulusDuration);
  }, [currentTrialIndex, trials, isPractice, answers, stimulusDuration, isi, onComplete]);

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
      if (e.key !== ' ' && e.key.toLowerCase() !== 'm') return;

      e.preventDefault();
      responseRecorded.current = true;

      const rt = performance.now() - trialStartTime.current;
      const trial = trials[currentTrialIndex];
      const isCorrect = trial.isTarget; // ターゲットに反応 = 正解

      const answer: CognitiveAnswer = {
        testType: 'n_back',
        trialIndex: currentTrialIndex,
        response: e.key,
        isCorrect,
        responseTimeMs: rt,
        timestamp: new Date(),
      };

      setAnswers(prev => [...prev, answer]);
      onProgress?.(currentTrialIndex + 1, trials.length);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, currentTrialIndex, trials, onProgress]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 本試行開始
  const startMainTest = () => {
    const mainTrials = generateTrials(nLevel, trialCount);
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
          N-back課題（{nLevel}-back）
        </h2>

        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-800 mb-3">課題の説明</h3>
          <p className="text-gray-700 mb-4">
            画面に文字が次々と表示されます。
            <strong className="text-blue-700">
              {nLevel}つ前と同じ文字が出たら
            </strong>
            、スペースキーまたはMキーを押してください。
          </p>

          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">例（{nLevel}-back）：</p>
            <div className="flex items-center gap-2 text-lg font-mono">
              {nLevel === 1 ? (
                <>
                  <span className="px-3 py-1 bg-gray-100 rounded">A</span>
                  <span className="text-gray-400">→</span>
                  <span className="px-3 py-1 bg-gray-100 rounded">B</span>
                  <span className="text-gray-400">→</span>
                  <span className="px-3 py-1 bg-green-100 border-2 border-green-500 rounded">B</span>
                  <span className="text-green-600 text-sm ml-2">← 押す！</span>
                </>
              ) : (
                <>
                  <span className="px-3 py-1 bg-gray-100 rounded">A</span>
                  <span className="text-gray-400">→</span>
                  <span className="px-3 py-1 bg-gray-100 rounded">B</span>
                  <span className="text-gray-400">→</span>
                  <span className="px-3 py-1 bg-green-100 border-2 border-green-500 rounded">A</span>
                  <span className="text-green-600 text-sm ml-2">← 押す！</span>
                </>
              )}
            </div>
          </div>

          <ul className="text-sm text-gray-600 space-y-1">
            <li>• できるだけ速く、正確に反応してください</li>
            <li>• 違う文字の時は何も押さないでください</li>
            <li>• まず練習を行います</li>
          </ul>
        </div>

        <button
          onClick={() => setPhase('practice')}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
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

        <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded-xl border-4 border-gray-200">
          {showStimulus && trials[currentTrialIndex] && (
            <span className="text-6xl font-bold text-gray-800">
              {trials[currentTrialIndex].stimulus}
            </span>
          )}
        </div>

        <div className="mt-8 text-gray-600">
          <p>{nLevel}つ前と同じなら <kbd className="px-2 py-1 bg-gray-200 rounded">Space</kbd> を押す</p>
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
          <p className="text-3xl font-bold text-blue-600">
            {practiceResults?.correct} / {practiceResults?.total}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            正答率: {Math.round((practiceResults?.correct || 0) / (practiceResults?.total || 1) * 100)}%
          </p>
        </div>

        <p className="text-gray-600 mb-6">
          準備ができたら本番テストを開始してください。
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
