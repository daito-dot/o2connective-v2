/**
 * ICAR-16 認知能力テストデータ
 * 4種類 × 4問 = 16問
 */

import type { CognitiveTestItem, CognitiveTestType } from '@/types/assessment';

/**
 * 行列推理（Matrix Reasoning）テスト項目
 * パターン認識・論理推論能力を測定
 */
const MATRIX_REASONING_ITEMS: CognitiveTestItem[] = [
  {
    id: 'MR-1',
    type: 'matrix_reasoning',
    stimulus: {
      description: '3×3のマトリクス。各行・列で図形が規則的に変化している。',
      pattern: '円→四角→三角の順序、サイズ小→中→大',
      hint: '行と列の両方のパターンを見つけてください',
    },
    options: ['A: 大きな三角形', 'B: 小さな円', 'C: 中くらいの四角', 'D: 大きな円'],
    correctAnswer: 'A',
    difficulty: 0.3,
    timeLimit: 60,
  },
  {
    id: 'MR-2',
    type: 'matrix_reasoning',
    stimulus: {
      description: '3×3のマトリクス。図形の数と色が変化する。',
      pattern: '1個→2個→3個、白→灰→黒',
      hint: '図形の数と色の両方に注目してください',
    },
    options: ['A: 黒い円3個', 'B: 白い円1個', 'C: 灰色の円2個', 'D: 黒い四角3個'],
    correctAnswer: 'A',
    difficulty: 0.4,
    timeLimit: 60,
  },
  {
    id: 'MR-3',
    type: 'matrix_reasoning',
    stimulus: {
      description: '3×3のマトリクス。図形の向きと内部パターンが変化。',
      pattern: '時計回りに90度回転、内部の線が1本→2本→3本',
      hint: '回転パターンと内部の要素を別々に考えてください',
    },
    options: ['A: 右向き矢印・線3本', 'B: 下向き矢印・線2本', 'C: 左向き矢印・線1本', 'D: 上向き矢印・線3本'],
    correctAnswer: 'A',
    difficulty: 0.5,
    timeLimit: 75,
  },
  {
    id: 'MR-4',
    type: 'matrix_reasoning',
    stimulus: {
      description: '3×3のマトリクス。複数の図形が組み合わさり、XOR的な変化。',
      pattern: '行と列の要素を組み合わせた結果',
      hint: '各行の1番目と2番目を組み合わせると3番目になります',
    },
    options: ['A: 円と三角の重なり', 'B: 四角のみ', 'C: 三角と四角の重なり', 'D: 円のみ'],
    correctAnswer: 'C',
    difficulty: 0.6,
    timeLimit: 90,
  },
];

/**
 * 文字数列（Letter Number Series）テスト項目
 * 系列完成・作業記憶能力を測定
 */
const LETTER_NUMBER_SERIES_ITEMS: CognitiveTestItem[] = [
  {
    id: 'LN-1',
    type: 'letter_number_series',
    stimulus: {
      sequence: 'A 1, B 2, C 3, D 4, ?',
      description: '文字と数字が交互に増加するパターン',
    },
    options: ['A: E 5', 'B: D 5', 'C: E 4', 'D: F 5'],
    correctAnswer: 'A',
    difficulty: 0.2,
    timeLimit: 45,
  },
  {
    id: 'LN-2',
    type: 'letter_number_series',
    stimulus: {
      sequence: '2, 4, 8, 16, ?',
      description: '2倍ずつ増加する数列',
    },
    options: ['A: 24', 'B: 32', 'C: 18', 'D: 20'],
    correctAnswer: 'B',
    difficulty: 0.3,
    timeLimit: 45,
  },
  {
    id: 'LN-3',
    type: 'letter_number_series',
    stimulus: {
      sequence: 'A Z, B Y, C X, D ?',
      description: 'アルファベットの始まりと終わりが同時に進む',
    },
    options: ['A: W', 'B: E', 'C: V', 'D: D'],
    correctAnswer: 'A',
    difficulty: 0.4,
    timeLimit: 60,
  },
  {
    id: 'LN-4',
    type: 'letter_number_series',
    stimulus: {
      sequence: '1, 1, 2, 3, 5, 8, ?',
      description: 'フィボナッチ数列',
    },
    options: ['A: 10', 'B: 11', 'C: 12', 'D: 13'],
    correctAnswer: 'D',
    difficulty: 0.5,
    timeLimit: 60,
  },
];

/**
 * 言語推理（Verbal Reasoning）テスト項目
 * 言語理解・推論能力を測定
 */
const VERBAL_REASONING_ITEMS: CognitiveTestItem[] = [
  {
    id: 'VR-1',
    type: 'verbal_reasoning',
    stimulus: {
      premise1: 'すべての犬は動物である',
      premise2: 'ポチは犬である',
      question: '結論として正しいものは？',
    },
    options: [
      'A: ポチは動物である',
      'B: すべての動物は犬である',
      'C: ポチは猫ではない',
      'D: 動物はすべてポチである',
    ],
    correctAnswer: 'A',
    difficulty: 0.2,
    timeLimit: 45,
  },
  {
    id: 'VR-2',
    type: 'verbal_reasoning',
    stimulus: {
      premise1: 'AはBより背が高い',
      premise2: 'CはBより背が低い',
      question: '確実に言えることは？',
    },
    options: [
      'A: AはCより背が高い',
      'B: CはAより背が高い',
      'C: BはCより背が高い',
      'D: 3人の中でAが一番背が高い',
    ],
    correctAnswer: 'C',
    difficulty: 0.4,
    timeLimit: 60,
  },
  {
    id: 'VR-3',
    type: 'verbal_reasoning',
    stimulus: {
      premise1: '会議に出席した人は全員、報告書を読んでいる',
      premise2: '田中さんは報告書を読んでいない',
      question: '確実に言えることは？',
    },
    options: [
      'A: 田中さんは会議に出席していない',
      'B: 田中さんは会議に出席した',
      'C: 報告書を読んだ人は全員会議に出席した',
      'D: 田中さんは報告書を読む予定だ',
    ],
    correctAnswer: 'A',
    difficulty: 0.5,
    timeLimit: 75,
  },
  {
    id: 'VR-4',
    type: 'verbal_reasoning',
    stimulus: {
      premise1: '赤いボールを持っている人は、青いボールを持っていない',
      premise2: '太郎は青いボールを持っている',
      premise3: '青いボールを持っていない人は全員、緑のボールを持っている',
      question: '確実に言えることは？',
    },
    options: [
      'A: 太郎は緑のボールを持っている',
      'B: 太郎は赤いボールを持っていない',
      'C: 太郎は3色全てのボールを持っている',
      'D: 赤いボールを持っている人は緑のボールを持っている',
    ],
    correctAnswer: 'B',
    difficulty: 0.6,
    timeLimit: 90,
  },
];

/**
 * 3D回転（3D Rotation）テスト項目
 * 空間認知・メンタルローテーション能力を測定
 */
const ROTATION_3D_ITEMS: CognitiveTestItem[] = [
  {
    id: 'RT-1',
    type: '3d_rotation',
    stimulus: {
      description: 'L字型の3Dブロック',
      reference: '基準となる形状',
      question: '同じ形状を回転させたものはどれ？',
    },
    options: ['A: 90度右回転', 'B: 鏡像（異なる形状）', 'C: 180度回転', 'D: 90度左回転'],
    correctAnswer: 'A',
    difficulty: 0.3,
    timeLimit: 60,
  },
  {
    id: 'RT-2',
    type: '3d_rotation',
    stimulus: {
      description: 'T字型の3Dブロック',
      reference: '基準となる形状',
      question: '同じ形状を回転させたものはどれ？（複数の軸で回転）',
    },
    options: ['A: X軸90度回転', 'B: 鏡像', 'C: Y軸90度回転', 'D: Z軸180度回転'],
    correctAnswer: 'D',
    difficulty: 0.4,
    timeLimit: 75,
  },
  {
    id: 'RT-3',
    type: '3d_rotation',
    stimulus: {
      description: '階段状の3Dブロック',
      reference: '基準となる形状',
      question: '同じ形状を回転させたものはどれ？',
    },
    options: ['A: 複合回転A', 'B: 複合回転B', 'C: 鏡像A', 'D: 鏡像B'],
    correctAnswer: 'B',
    difficulty: 0.5,
    timeLimit: 75,
  },
  {
    id: 'RT-4',
    type: '3d_rotation',
    stimulus: {
      description: '非対称な複雑3Dブロック',
      reference: '基準となる形状',
      question: '同じ形状を回転させたものはどれ？',
    },
    options: ['A: 複合回転A', 'B: 複合回転B', 'C: 複合回転C', 'D: 鏡像'],
    correctAnswer: 'C',
    difficulty: 0.6,
    timeLimit: 90,
  },
];

/** 全ICAR-16テスト項目 */
export const ICAR_16_ITEMS: CognitiveTestItem[] = [
  ...MATRIX_REASONING_ITEMS,
  ...LETTER_NUMBER_SERIES_ITEMS,
  ...VERBAL_REASONING_ITEMS,
  ...ROTATION_3D_ITEMS,
];

/** テストタイプ別に項目を取得 */
export function getItemsByType(type: CognitiveTestType): CognitiveTestItem[] {
  return ICAR_16_ITEMS.filter(item => item.type === type);
}

/** テストタイプの説明 */
export const TEST_TYPE_DESCRIPTIONS: Record<CognitiveTestType, { name: string; description: string }> = {
  matrix_reasoning: {
    name: '行列推理',
    description: 'パターンを見つけ、欠けている要素を推測する能力を測定します。',
  },
  letter_number_series: {
    name: '文字数列',
    description: '系列のルールを見つけ、次の要素を予測する能力を測定します。',
  },
  verbal_reasoning: {
    name: '言語推理',
    description: '論理的な文章から正しい結論を導く能力を測定します。',
  },
  '3d_rotation': {
    name: '3D回転',
    description: '立体図形を頭の中で回転させ、同じ形状を見つける能力を測定します。',
  },
};

/** テストの総所要時間（秒） */
export const TOTAL_TEST_TIME = ICAR_16_ITEMS.reduce((sum, item) => sum + item.timeLimit, 0);

/** テストサマリー */
export const TEST_SUMMARY = {
  totalItems: ICAR_16_ITEMS.length,
  byType: {
    matrix_reasoning: getItemsByType('matrix_reasoning').length,
    letter_number_series: getItemsByType('letter_number_series').length,
    verbal_reasoning: getItemsByType('verbal_reasoning').length,
    '3d_rotation': getItemsByType('3d_rotation').length,
  },
  estimatedTime: '15-20分',
};
