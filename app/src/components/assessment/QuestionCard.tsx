'use client';

/**
 * 設問カードコンポーネント
 * 5段階リカートスケールの回答UI
 */

import { useState } from 'react';
import type { PersonalityQuestion, AnswerValue } from '@/types/assessment';

interface QuestionCardProps {
  question: PersonalityQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (questionId: string, value: AnswerValue) => void;
  currentAnswer?: AnswerValue;
}

const ANSWER_OPTIONS: { value: AnswerValue; label: string; shortLabel: string }[] = [
  { value: 1, label: '強くあてはまらない', shortLabel: '全く違う' },
  { value: 2, label: 'あてはまらない', shortLabel: '違う' },
  { value: 3, label: 'どちらともいえない', shortLabel: '中立' },
  { value: 4, label: 'あてはまる', shortLabel: 'そう思う' },
  { value: 5, label: '強くあてはまる', shortLabel: 'とてもそう思う' },
];

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  currentAnswer,
}: QuestionCardProps) {
  const [hoveredValue, setHoveredValue] = useState<AnswerValue | null>(null);

  const handleAnswer = (value: AnswerValue) => {
    onAnswer(question.id, value);
  };

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* プログレスバー */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>質問 {questionNumber} / {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 質問カード */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* 質問文 */}
        <p className="text-xl font-medium text-gray-800 mb-8 leading-relaxed">
          {question.text}
        </p>

        {/* 回答オプション */}
        <div className="space-y-3">
          {ANSWER_OPTIONS.map((option) => {
            const isSelected = currentAnswer === option.value;
            const isHovered = hoveredValue === option.value;

            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                onMouseEnter={() => setHoveredValue(option.value)}
                onMouseLeave={() => setHoveredValue(null)}
                className={`
                  w-full p-4 rounded-lg border-2 transition-all duration-200
                  flex items-center justify-between
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : isHovered
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <span className="font-medium">{option.label}</span>
                <span
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    transition-all duration-200
                    ${isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                    }
                  `}
                >
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* モバイル用簡易スケール */}
        <div className="mt-6 md:hidden">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>全く違う</span>
            <span>とてもそう思う</span>
          </div>
          <div className="flex justify-between gap-2">
            {ANSWER_OPTIONS.map((option) => {
              const isSelected = currentAnswer === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`
                    flex-1 py-3 rounded-lg font-bold text-lg transition-all
                    ${isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.value}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
