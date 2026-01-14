'use client';

/**
 * 性格診断ページ
 * 120問の設問に回答し、結果を表示
 */

import { useState, useCallback, useMemo } from 'react';
import { QuestionCard } from '@/components/assessment/QuestionCard';
import { ResultDisplay } from '@/components/assessment/ResultDisplay';
import { PERSONALITY_QUESTIONS, shuffleQuestions } from '@/data/questions';
import { scoreTransformer } from '@/services/ScoreTransformer';
import type {
  PersonalityAnswer,
  AnswerValue,
  DomainScore,
  ReliabilityMetrics,
  AIInterpretationOutput,
} from '@/types/assessment';

type AssessmentPhase = 'intro' | 'questions' | 'calculating' | 'results';

export default function AssessmentPage() {
  const [phase, setPhase] = useState<AssessmentPhase>('intro');
  const [answers, setAnswers] = useState<Map<string, PersonalityAnswer>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);
  const [reliabilityMetrics, setReliabilityMetrics] = useState<ReliabilityMetrics | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState<AIInterpretationOutput | undefined>();

  // 設問をシャッフル（回答バイアス軽減）
  const shuffledQuestions = useMemo(() => shuffleQuestions(PERSONALITY_QUESTIONS), []);

  const currentQuestion = shuffledQuestions[currentIndex];
  const currentAnswer = answers.get(currentQuestion?.id)?.value;

  // 回答を記録
  const handleAnswer = useCallback((questionId: string, value: AnswerValue) => {
    const startTime = performance.now();

    setAnswers(prev => {
      const newAnswers = new Map(prev);
      const existingAnswer = newAnswers.get(questionId);
      const responseTimeMs = existingAnswer
        ? undefined
        : Math.round(performance.now() - startTime);

      newAnswers.set(questionId, {
        questionId,
        value,
        responseTimeMs,
        timestamp: new Date(),
      });
      return newAnswers;
    });

    // 自動で次の質問へ（少し遅延を入れてフィードバックを見せる）
    setTimeout(() => {
      if (currentIndex < shuffledQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 300);
  }, [currentIndex, shuffledQuestions.length]);

  // 前の質問に戻る
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // 診断を開始
  const handleStart = useCallback(() => {
    setPhase('questions');
  }, []);

  // 結果を計算
  const handleComplete = useCallback(async () => {
    setPhase('calculating');

    // 回答をリストに変換
    const answerList = Array.from(answers.values());

    // スコア計算
    const scores = scoreTransformer.transformAllScores(answerList, PERSONALITY_QUESTIONS);
    const reliability = scoreTransformer.calculateReliabilityMetrics(answerList, PERSONALITY_QUESTIONS);

    setDomainScores(scores);
    setReliabilityMetrics(reliability);

    // AI解釈を取得（APIエンドポイント経由）
    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domainScores: scores,
          reliabilityMetrics: reliability,
          purpose: 'individual_report',
        }),
      });

      if (response.ok) {
        const interpretation = await response.json();
        setAiInterpretation(interpretation);
      }
    } catch (error) {
      console.error('AI interpretation failed:', error);
    }

    setPhase('results');
  }, [answers]);

  // 回答済み数
  const answeredCount = answers.size;
  const isComplete = answeredCount === shuffledQuestions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* イントロ画面 */}
      {phase === 'intro' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">
              適性診断テスト
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              このテストでは、あなたの性格特性と行動傾向を分析します。
              全{shuffledQuestions.length}問の質問に直感的にお答えください。
              所要時間は約15〜20分です。
            </p>

            <div className="bg-white rounded-xl p-6 shadow-lg mb-8 text-left">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">回答のポイント</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>「正解」や「不正解」はありません。ありのままの自分で回答してください。</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span>深く考えすぎず、最初に思い浮かんだ答えを選んでください。</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span>「こうあるべき」ではなく「普段の自分」を基準にしてください。</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
            >
              診断を開始する
            </button>
          </div>
        </div>
      )}

      {/* 質問画面 */}
      {phase === 'questions' && currentQuestion && (
        <div className="py-8 px-4">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={shuffledQuestions.length}
            onAnswer={handleAnswer}
            currentAnswer={currentAnswer}
          />

          {/* ナビゲーション */}
          <div className="max-w-2xl mx-auto mt-6 flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentIndex === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              ← 前の質問
            </button>

            {isComplete ? (
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
              >
                結果を見る
              </button>
            ) : (
              <span className="text-sm text-gray-500">
                残り {shuffledQuestions.length - answeredCount} 問
              </span>
            )}
          </div>
        </div>
      )}

      {/* 計算中画面 */}
      {phase === 'calculating' && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
          <p className="text-lg text-gray-600">結果を分析中...</p>
        </div>
      )}

      {/* 結果画面 */}
      {phase === 'results' && reliabilityMetrics && (
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">診断結果</h1>
            <p className="text-gray-600">あなたの性格特性と行動傾向の分析結果です</p>
          </div>

          <ResultDisplay
            domainScores={domainScores}
            reliabilityMetrics={reliabilityMetrics}
            aiInterpretation={aiInterpretation}
          />

          {/* 再診断ボタン */}
          <div className="max-w-4xl mx-auto mt-8 text-center">
            <button
              onClick={() => {
                setPhase('intro');
                setAnswers(new Map());
                setCurrentIndex(0);
                setDomainScores([]);
                setReliabilityMetrics(null);
                setAiInterpretation(undefined);
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors"
            >
              もう一度診断する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
