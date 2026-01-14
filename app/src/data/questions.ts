/**
 * 適性診断 設問データ
 * 旧版設問.txtから移行した120問の設問データ
 */

import type { PersonalityQuestion, PersonalityDomain } from '@/types/assessment';
import { DOMAIN_CATEGORIES } from '@/types/assessment';

/** 設問データ */
export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  // ==========================================================================
  // 外向性（EX）- 10問
  // ==========================================================================
  { id: 'EX-1', text: '難しい課題に直面すると、むしろやる気が出ます。', domain: 'EX', category: 'bigfive', keyed: 'plus', order: 1 },
  { id: 'EX-2', text: '初対面の人とも気軽に話すことができます。', domain: 'EX', category: 'bigfive', keyed: 'plus', order: 2 },
  { id: 'EX-3', text: '人前で意見を述べることに抵抗はありません。', domain: 'EX', category: 'bigfive', keyed: 'plus', order: 3 },
  { id: 'EX-4', text: '静かな環境よりも、にぎやかな場の方が活気が出ます。', domain: 'EX', category: 'bigfive', keyed: 'plus', order: 4 },
  { id: 'EX-5', text: '周囲を巻き込んで物事を進めるのが得意です。', domain: 'EX', category: 'bigfive', keyed: 'plus', order: 5 },
  { id: 'EX-6', text: 'あまり知らない人と話すのは緊張します。', domain: 'EX', category: 'bigfive', keyed: 'minus', order: 6 },
  { id: 'EX-7', text: '自分の考えを表現するのは得意な方です。', domain: 'EX', category: 'bigfive', keyed: 'plus', order: 7 },
  { id: 'EX-8', text: '他人から注目されるとプレッシャーを感じます。', domain: 'EX', category: 'bigfive', keyed: 'minus', order: 8 },
  { id: 'EX-9', text: 'チームでの会話を楽しむことが多いです。', domain: 'EX', category: 'bigfive', keyed: 'plus', order: 9 },
  { id: 'EX-10', text: '会議では積極的に発言する方です。', domain: 'EX', category: 'bigfive', keyed: 'plus', order: 10 },

  // ==========================================================================
  // 誠実性（CO）- 12問
  // ==========================================================================
  { id: 'CO-1', text: '物事を計画的に進めるのが得意です。', domain: 'CO', category: 'bigfive', keyed: 'plus', order: 11 },
  { id: 'CO-2', text: '期限を守ることを特に意識しています。', domain: 'CO', category: 'bigfive', keyed: 'plus', order: 12 },
  { id: 'CO-3', text: '面倒な作業も途中で投げ出さずに取り組みます。', domain: 'CO', category: 'bigfive', keyed: 'plus', order: 13 },
  { id: 'CO-4', text: '予定外のことがあると混乱してしまいます。', domain: 'CO', category: 'bigfive', keyed: 'minus', order: 14 },
  { id: 'CO-5', text: '仕事は丁寧さよりスピードを優先します。', domain: 'CO', category: 'bigfive', keyed: 'minus', order: 15 },
  { id: 'CO-6', text: '一度決めた目標は最後までやり遂げます。', domain: 'CO', category: 'bigfive', keyed: 'plus', order: 16 },
  { id: 'CO-7', text: '小さな約束でもきちんと守るようにしています。', domain: 'CO', category: 'bigfive', keyed: 'plus', order: 17 },
  { id: 'CO-8', text: '自分のやるべきことを後回しにすることがあります。', domain: 'CO', category: 'bigfive', keyed: 'minus', order: 18 },
  { id: 'CO-9', text: '整理整頓ができていると安心します。', domain: 'CO', category: 'bigfive', keyed: 'plus', order: 19 },
  { id: 'CO-10', text: '仕事を始める前に段取りを確認します。', domain: 'CO', category: 'bigfive', keyed: 'plus', order: 20 },
  { id: 'CO-11', text: '計画的に動くと安心します。', domain: 'CO', category: 'bigfive', keyed: 'plus', order: 111 },
  { id: 'CO-12', text: '思いつきで行動することが多いです。', domain: 'CO', category: 'bigfive', keyed: 'minus', order: 112 },

  // ==========================================================================
  // 協調性（AG）- 12問
  // ==========================================================================
  { id: 'AG-1', text: '相手の立場に立って考えるようにしています。', domain: 'AG', category: 'bigfive', keyed: 'plus', order: 21 },
  { id: 'AG-2', text: '人の意見を聞く前に自分の考えを決めることがあります。', domain: 'AG', category: 'bigfive', keyed: 'minus', order: 22 },
  { id: 'AG-3', text: '他人の失敗を責めるより、助けたいと思います。', domain: 'AG', category: 'bigfive', keyed: 'plus', order: 23 },
  { id: 'AG-4', text: '衝突を避けるために、意見を控えることがあります。', domain: 'AG', category: 'bigfive', keyed: 'plus', order: 24 },
  { id: 'AG-5', text: '困っている人を見ると放っておけません。', domain: 'AG', category: 'bigfive', keyed: 'plus', order: 25 },
  { id: 'AG-6', text: '他人の意見が違っても冷静に受け止められます。', domain: 'AG', category: 'bigfive', keyed: 'plus', order: 26 },
  { id: 'AG-7', text: '自分の意見を通すことを優先することがあります。', domain: 'AG', category: 'bigfive', keyed: 'minus', order: 27 },
  { id: 'AG-8', text: '周囲の空気を読みすぎて疲れることがあります。', domain: 'AG', category: 'bigfive', keyed: 'plus', order: 28 },
  { id: 'AG-9', text: 'チームの雰囲気を良くするよう意識しています。', domain: 'AG', category: 'bigfive', keyed: 'plus', order: 29 },
  { id: 'AG-10', text: '他人の成功を素直に喜ぶことができます。', domain: 'AG', category: 'bigfive', keyed: 'plus', order: 30 },
  { id: 'AG-11', text: '自分が中心になるより、協力して進める方が好きです。', domain: 'AG', category: 'bigfive', keyed: 'plus', order: 117 },
  { id: 'AG-12', text: '人をリードするより、支える方が得意です。', domain: 'AG', category: 'bigfive', keyed: 'plus', order: 118 },

  // ==========================================================================
  // 情緒安定性（NE）- 12問
  // ==========================================================================
  { id: 'NE-1', text: 'プレッシャーの中でも冷静さを保てます。', domain: 'NE', category: 'bigfive', keyed: 'plus', order: 31 },
  { id: 'NE-2', text: '注意されたことをいつまでも気にしてしまいます。', domain: 'NE', category: 'bigfive', keyed: 'minus', order: 32 },
  { id: 'NE-3', text: 'ミスをしてもすぐに切り替えることができます。', domain: 'NE', category: 'bigfive', keyed: 'plus', order: 33 },
  { id: 'NE-4', text: '不安を感じると集中しづらくなります。', domain: 'NE', category: 'bigfive', keyed: 'minus', order: 34 },
  { id: 'NE-5', text: '落ち着いた気持ちで人と接することが多いです。', domain: 'NE', category: 'bigfive', keyed: 'plus', order: 35 },
  { id: 'NE-6', text: '感情の浮き沈みが大きい方だと思います。', domain: 'NE', category: 'bigfive', keyed: 'minus', order: 36 },
  { id: 'NE-7', text: '小さなトラブルでも動揺せず対応できます。', domain: 'NE', category: 'bigfive', keyed: 'plus', order: 37 },
  { id: 'NE-8', text: '気分が変わりやすいと感じることがあります。', domain: 'NE', category: 'bigfive', keyed: 'minus', order: 38 },
  { id: 'NE-9', text: '緊張しても自分を落ち着かせることが得意です。', domain: 'NE', category: 'bigfive', keyed: 'plus', order: 39 },
  { id: 'NE-10', text: '感情を整理してから話すようにしています。', domain: 'NE', category: 'bigfive', keyed: 'plus', order: 40 },
  { id: 'NE-11', text: '失敗しても前向きに考える方です。', domain: 'NE', category: 'bigfive', keyed: 'plus', order: 115 },
  { id: 'NE-12', text: '失敗すると長く引きずってしまいます。', domain: 'NE', category: 'bigfive', keyed: 'minus', order: 116 },

  // ==========================================================================
  // 開放性（OP）- 12問
  // ==========================================================================
  { id: 'OP-1', text: '新しい考え方や方法を試すことが好きです。', domain: 'OP', category: 'bigfive', keyed: 'plus', order: 41 },
  { id: 'OP-2', text: 'これまでのやり方に強くこだわる方です。', domain: 'OP', category: 'bigfive', keyed: 'minus', order: 42 },
  { id: 'OP-3', text: '自分と異なる意見を聞くと刺激を受けます。', domain: 'OP', category: 'bigfive', keyed: 'plus', order: 43 },
  { id: 'OP-4', text: '新しい環境にすぐに適応できます。', domain: 'OP', category: 'bigfive', keyed: 'plus', order: 44 },
  { id: 'OP-5', text: '変化が多い仕事を好む傾向があります。', domain: 'OP', category: 'bigfive', keyed: 'plus', order: 45 },
  { id: 'OP-6', text: '慣れた方法を変えるのは不安です。', domain: 'OP', category: 'bigfive', keyed: 'minus', order: 46 },
  { id: 'OP-7', text: '幅広い分野の知識を学びたいと思います。', domain: 'OP', category: 'bigfive', keyed: 'plus', order: 47 },
  { id: 'OP-8', text: '発想を広げるために他業界の話を聞くことがあります。', domain: 'OP', category: 'bigfive', keyed: 'plus', order: 48 },
  { id: 'OP-9', text: '新しいアイデアを考えることが楽しいです。', domain: 'OP', category: 'bigfive', keyed: 'plus', order: 49 },
  { id: 'OP-10', text: '同じことを繰り返すよりも、新しい挑戦をしたいです。', domain: 'OP', category: 'bigfive', keyed: 'plus', order: 50 },
  { id: 'OP-11', text: '新しいことを学ぶのが好きです。', domain: 'OP', category: 'bigfive', keyed: 'plus', order: 119 },
  { id: 'OP-12', text: '変化より安定を求める方です。', domain: 'OP', category: 'bigfive', keyed: 'minus', order: 120 },

  // ==========================================================================
  // マキャベリズム（MA）- 10問
  // ==========================================================================
  { id: 'MA-1', text: '相手の性格を考えて行動を工夫します。', domain: 'MA', category: 'darktriad', keyed: 'plus', order: 51 },
  { id: 'MA-2', text: '自分の目的のためなら多少の駆け引きも必要だと思います。', domain: 'MA', category: 'darktriad', keyed: 'plus', order: 52 },
  { id: 'MA-3', text: '相手の感情よりも結果を優先することがあります。', domain: 'MA', category: 'darktriad', keyed: 'plus', order: 53 },
  { id: 'MA-4', text: '他人の弱点を利用するのは好ましくないと思います。', domain: 'MA', category: 'darktriad', keyed: 'minus', order: 54 },
  { id: 'MA-5', text: '相手を説得するのが得意です。', domain: 'MA', category: 'darktriad', keyed: 'plus', order: 55 },
  { id: 'MA-6', text: '相手の心理を読むのは難しいと感じます。', domain: 'MA', category: 'darktriad', keyed: 'minus', order: 56 },
  { id: 'MA-7', text: '目的のためには柔軟に立ち回るべきだと思います。', domain: 'MA', category: 'darktriad', keyed: 'plus', order: 57 },
  { id: 'MA-8', text: '正直すぎると損をすることがあると思います。', domain: 'MA', category: 'darktriad', keyed: 'plus', order: 58 },
  { id: 'MA-9', text: '人を動かすことにやりがいを感じます。', domain: 'MA', category: 'darktriad', keyed: 'plus', order: 59 },
  { id: 'MA-10', text: '他人の考えを先に予想して動くようにしています。', domain: 'MA', category: 'darktriad', keyed: 'plus', order: 60 },

  // ==========================================================================
  // ナルシシズム（NA）- 10問
  // ==========================================================================
  { id: 'NA-1', text: '評価されると大きな喜びを感じます。', domain: 'NA', category: 'darktriad', keyed: 'plus', order: 61 },
  { id: 'NA-2', text: '自分の意見を正しいと信じることが多いです。', domain: 'NA', category: 'darktriad', keyed: 'plus', order: 62 },
  { id: 'NA-3', text: '注目される場面が好きです。', domain: 'NA', category: 'darktriad', keyed: 'plus', order: 63 },
  { id: 'NA-4', text: '自分より優れた人を見ると刺激を受けます。', domain: 'NA', category: 'darktriad', keyed: 'plus', order: 64 },
  { id: 'NA-5', text: '自分の功績を誇張したくなることがあります。', domain: 'NA', category: 'darktriad', keyed: 'plus', order: 65 },
  { id: 'NA-6', text: '他人に認められないとやる気を失うことがあります。', domain: 'NA', category: 'darktriad', keyed: 'plus', order: 66 },
  { id: 'NA-7', text: '自分が中心になって動く方が効率的だと感じます。', domain: 'NA', category: 'darktriad', keyed: 'plus', order: 67 },
  { id: 'NA-8', text: '他人の評価はあまり気になりません。', domain: 'NA', category: 'darktriad', keyed: 'minus', order: 68 },
  { id: 'NA-9', text: '競争の中でこそ力を発揮します。', domain: 'NA', category: 'darktriad', keyed: 'plus', order: 69 },
  { id: 'NA-10', text: '人に頼られると嬉しくなります。', domain: 'NA', category: 'darktriad', keyed: 'plus', order: 70 },

  // ==========================================================================
  // サイコパシー（PS）- 10問
  // ==========================================================================
  { id: 'PS-1', text: '感情的な人との関わりが苦手です。', domain: 'PS', category: 'darktriad', keyed: 'plus', order: 71 },
  { id: 'PS-2', text: '相手が落ち込んでいてもあまり影響を受けません。', domain: 'PS', category: 'darktriad', keyed: 'plus', order: 72 },
  { id: 'PS-3', text: '自分の感情はコントロールできる方です。', domain: 'PS', category: 'darktriad', keyed: 'plus', order: 73 },
  { id: 'PS-4', text: '他人の感情に振り回されることが多いです。', domain: 'PS', category: 'darktriad', keyed: 'minus', order: 74 },
  { id: 'PS-5', text: '困難な状況でも冷静に判断できます。', domain: 'PS', category: 'darktriad', keyed: 'plus', order: 75 },
  { id: 'PS-6', text: '強い感情を表に出すのは避けます。', domain: 'PS', category: 'darktriad', keyed: 'plus', order: 76 },
  { id: 'PS-7', text: '相手に共感しすぎると疲れてしまいます。', domain: 'PS', category: 'darktriad', keyed: 'plus', order: 77 },
  { id: 'PS-8', text: '感情よりも理屈で物事を考えます。', domain: 'PS', category: 'darktriad', keyed: 'plus', order: 78 },
  { id: 'PS-9', text: '周囲の反応に左右されず判断できます。', domain: 'PS', category: 'darktriad', keyed: 'plus', order: 79 },
  { id: 'PS-10', text: '感情的な反応を見ても動じません。', domain: 'PS', category: 'darktriad', keyed: 'plus', order: 80 },

  // ==========================================================================
  // 共感性（EM）- 12問
  // ==========================================================================
  { id: 'EM-1', text: '相手の表情の変化に気づきやすいです。', domain: 'EM', category: 'additional', keyed: 'plus', order: 81 },
  { id: 'EM-2', text: '誰かが落ち込んでいると、気持ちを察して声をかけます。', domain: 'EM', category: 'additional', keyed: 'plus', order: 82 },
  { id: 'EM-3', text: '相手が喜んでいると、自分も嬉しくなります。', domain: 'EM', category: 'additional', keyed: 'plus', order: 83 },
  { id: 'EM-4', text: '周囲の感情に影響されやすいです。', domain: 'EM', category: 'additional', keyed: 'minus', order: 84 },
  { id: 'EM-5', text: '他人の話を最後まで聞こうと努めます。', domain: 'EM', category: 'additional', keyed: 'plus', order: 85 },
  { id: 'EM-6', text: '感情的な発言をされると戸惑うことがあります。', domain: 'EM', category: 'additional', keyed: 'minus', order: 86 },
  { id: 'EM-7', text: '他人の立場を理解しようと意識します。', domain: 'EM', category: 'additional', keyed: 'plus', order: 87 },
  { id: 'EM-8', text: '人の小さな変化に気づくことがあります。', domain: 'EM', category: 'additional', keyed: 'plus', order: 88 },
  { id: 'EM-9', text: '誰かのために行動することに喜びを感じます。', domain: 'EM', category: 'additional', keyed: 'plus', order: 89 },
  { id: 'EM-10', text: '優しい言葉をかけることを心がけています。', domain: 'EM', category: 'additional', keyed: 'plus', order: 90 },
  { id: 'EM-11', text: '相手の感情を読むのが得意です。', domain: 'EM', category: 'additional', keyed: 'plus', order: 113 },
  { id: 'EM-12', text: '他人の感情の変化に気づくことは少ないです。', domain: 'EM', category: 'additional', keyed: 'minus', order: 114 },

  // ==========================================================================
  // 仕事への姿勢（WR）- 10問
  // ==========================================================================
  { id: 'WR-1', text: '仕事の準備は念入りに行う方です。', domain: 'WR', category: 'additional', keyed: 'plus', order: 91 },
  { id: 'WR-2', text: '納期を守るために逆算して計画します。', domain: 'WR', category: 'additional', keyed: 'plus', order: 92 },
  { id: 'WR-3', text: '責任感が強い方だと思います。', domain: 'WR', category: 'additional', keyed: 'plus', order: 93 },
  { id: 'WR-4', text: '上司や同僚に相談しながら進めます。', domain: 'WR', category: 'additional', keyed: 'plus', order: 94 },
  { id: 'WR-5', text: '困難な状況でも最後まで粘り強く取り組みます。', domain: 'WR', category: 'additional', keyed: 'plus', order: 95 },
  { id: 'WR-6', text: '忙しいときに優先順位をつけるのが苦手です。', domain: 'WR', category: 'additional', keyed: 'minus', order: 96 },
  { id: 'WR-7', text: '目標があると力を発揮できます。', domain: 'WR', category: 'additional', keyed: 'plus', order: 97 },
  { id: 'WR-8', text: '周囲に頼まれた仕事を断ることが苦手です。', domain: 'WR', category: 'additional', keyed: 'minus', order: 98 },
  { id: 'WR-9', text: '自分の役割を理解して行動します。', domain: 'WR', category: 'additional', keyed: 'plus', order: 99 },
  { id: 'WR-10', text: '新しい課題に取り組むときは前向きな気持ちになります。', domain: 'WR', category: 'additional', keyed: 'plus', order: 100 },

  // ==========================================================================
  // 回答信頼性（LI）- 10問
  // ==========================================================================
  { id: 'LI-1', text: 'これまで一度も嘘をついたことがありません。', domain: 'LI', category: 'validity', keyed: 'minus', order: 101 },
  { id: 'LI-2', text: '失敗をしたことがない方だと思います。', domain: 'LI', category: 'validity', keyed: 'minus', order: 102 },
  { id: 'LI-3', text: 'どんなときも怒ったことがありません。', domain: 'LI', category: 'validity', keyed: 'minus', order: 103 },
  { id: 'LI-4', text: '誠実でありたいと常に思っています。', domain: 'LI', category: 'validity', keyed: 'plus', order: 104 },
  { id: 'LI-5', text: '小さなことでも正直に話すようにしています。', domain: 'LI', category: 'validity', keyed: 'plus', order: 105 },
  { id: 'LI-6', text: '自分の行動を振り返る時間を持っています。', domain: 'LI', category: 'validity', keyed: 'plus', order: 106 },
  { id: 'LI-7', text: '言ったこととやっていることが一致していると思います。', domain: 'LI', category: 'validity', keyed: 'plus', order: 107 },
  { id: 'LI-8', text: '同じ質問を2回されたとき、答えが変わらないように意識します。', domain: 'LI', category: 'validity', keyed: 'plus', order: 108 },
  { id: 'LI-9', text: '無理に良く見せようとすることはありません。', domain: 'LI', category: 'validity', keyed: 'plus', order: 109 },
  { id: 'LI-10', text: '正直であることを大切にしています。', domain: 'LI', category: 'validity', keyed: 'plus', order: 110 },
];

/** ドメイン別に設問を取得 */
export function getQuestionsByDomain(domain: PersonalityDomain): PersonalityQuestion[] {
  return PERSONALITY_QUESTIONS.filter(q => q.domain === domain);
}

/** カテゴリ別に設問を取得 */
export function getQuestionsByCategory(category: string): PersonalityQuestion[] {
  return PERSONALITY_QUESTIONS.filter(q => q.category === category);
}

/** 設問をシャッフル（回答バイアス軽減） */
export function shuffleQuestions(questions: PersonalityQuestion[]): PersonalityQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** 設問数のサマリー */
export const QUESTION_SUMMARY = {
  total: PERSONALITY_QUESTIONS.length,
  byDomain: {
    EX: getQuestionsByDomain('EX').length,
    CO: getQuestionsByDomain('CO').length,
    AG: getQuestionsByDomain('AG').length,
    NE: getQuestionsByDomain('NE').length,
    OP: getQuestionsByDomain('OP').length,
    MA: getQuestionsByDomain('MA').length,
    NA: getQuestionsByDomain('NA').length,
    PS: getQuestionsByDomain('PS').length,
    EM: getQuestionsByDomain('EM').length,
    WR: getQuestionsByDomain('WR').length,
    LI: getQuestionsByDomain('LI').length,
  },
  byCategory: {
    bigfive: getQuestionsByCategory('bigfive').length,
    darktriad: getQuestionsByCategory('darktriad').length,
    additional: getQuestionsByCategory('additional').length,
    validity: getQuestionsByCategory('validity').length,
  },
};
