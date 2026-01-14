'use client';

/**
 * 認知テストカードコンポーネント
 * タイマー付きの問題表示UI
 */

import { useState, useEffect, useCallback } from 'react';
import type { CognitiveTestItem, CognitiveTestType } from '@/types/assessment';
import { TEST_TYPE_DESCRIPTIONS } from '@/data/cognitiveTests';

interface CognitiveTestCardProps {
  item: CognitiveTestItem;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (itemId: string, selectedAnswer: string, responseTimeMs: number) => void;
  onTimeout: (itemId: string) => void;
}

export function CognitiveTestCard({
  item,
  questionNumber,
  totalQuestions,
  onAnswer,
  onTimeout,
}: CognitiveTestCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(item.timeLimit);
  const [startTime] = useState(Date.now());
  const [isAnswered, setIsAnswered] = useState(false);

  const typeInfo = TEST_TYPE_DESCRIPTIONS[item.type];
  const progress = (questionNumber / totalQuestions) * 100;

  // タイマー処理
  useEffect(() => {
    if (isAnswered) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout(item.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [item.id, isAnswered, onTimeout]);

  // 回答選択
  const handleSelectOption = useCallback((option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const responseTime = Date.now() - startTime;
    // 選択肢の先頭文字（A, B, C, D）を抽出
    const answer = option.charAt(0);

    // 少し遅延を入れてから次へ
    setTimeout(() => {
      onAnswer(item.id, answer, responseTime);
    }, 500);
  }, [isAnswered, startTime, item.id, onAnswer]);

  // タイマーの色
  const getTimerColor = () => {
    if (timeRemaining <= 10) return 'text-red-600 bg-red-100';
    if (timeRemaining <= 20) return 'text-orange-600 bg-orange-100';
    return 'text-blue-600 bg-blue-100';
  };

  // 問題の刺激を表示
  const renderStimulus = () => {
    const stimulus = item.stimulus as Record<string, string>;

    switch (item.type) {
      case 'matrix_reasoning':
        return (
          <div className="bg-gray-100 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <span className="text-sm text-gray-500">{stimulus.description}</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-48 h-48 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-sm text-center px-4">
                  [3×3マトリクス]<br />
                  パターン: {stimulus.pattern}
                </span>
              </div>
            </div>
            <p className="text-center text-sm text-blue-600 mt-4">{stimulus.hint}</p>
          </div>
        );

      case 'letter_number_series':
        return (
          <div className="bg-gray-100 rounded-xl p-6 mb-6">
            <div className="text-center">
              <p className="text-3xl font-mono tracking-widest text-gray-800 mb-4">
                {stimulus.sequence}
              </p>
              <p className="text-sm text-gray-500">{stimulus.description}</p>
            </div>
          </div>
        );

      case 'verbal_reasoning':
        return (
          <div className="bg-gray-100 rounded-xl p-6 mb-6 space-y-4">
            {stimulus.premise1 && (
              <p className="text-gray-800">
                <span className="font-semibold text-blue-600">前提1:</span> {stimulus.premise1}
              </p>
            )}
            {stimulus.premise2 && (
              <p className="text-gray-800">
                <span className="font-semibold text-blue-600">前提2:</span> {stimulus.premise2}
              </p>
            )}
            {stimulus.premise3 && (
              <p className="text-gray-800">
                <span className="font-semibold text-blue-600">前提3:</span> {stimulus.premise3}
              </p>
            )}
            <div className="border-t border-gray-300 pt-4">
              <p className="font-semibold text-gray-800">{stimulus.question}</p>
            </div>
          </div>
        );

      case '3d_rotation':
        return (
          <div className="bg-gray-100 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <span className="text-sm text-gray-500">{stimulus.description}</span>
            </div>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-white rounded-lg border-2 border-blue-300 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">[基準図形]</span>
                </div>
                <span className="text-xs text-gray-500 mt-2 block">基準</span>
              </div>
              <span className="text-2xl text-gray-400">→</span>
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">?</span>
                </div>
                <span className="text-xs text-gray-500 mt-2 block">{stimulus.question}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* ヘッダー：プログレスとタイマー */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-sm text-gray-500">問題 {questionNumber} / {totalQuestions}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-sm font-medium text-purple-600">{typeInfo.name}</span>
          </div>
          <div className={`px-4 py-2 rounded-full font-mono font-bold ${getTimerColor()}`}>
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 問題カード */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* テストタイプの説明 */}
        <p className="text-sm text-gray-500 mb-4">{typeInfo.description}</p>

        {/* 問題の刺激 */}
        {renderStimulus()}

        {/* 選択肢 */}
        <div className="space-y-3">
          {item.options.map((option, index) => {
            const isSelected = selectedOption === option;
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D

            return (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered}
                className={`
                  w-full p-4 rounded-lg border-2 transition-all duration-200
                  flex items-center gap-4 text-left
                  ${isSelected
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : isAnswered
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <span
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-semibold
                    ${isSelected
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {optionLetter}
                </span>
                <span className="flex-1">{option.substring(3)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
