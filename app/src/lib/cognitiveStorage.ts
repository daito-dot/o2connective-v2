/**
 * 認知テスト結果のローカルストレージ管理
 */

import type { CognitiveResult } from '@/types/assessment';

const STORAGE_KEY = 'o2connective_cognitive_results';

/** 保存される結果の型 */
export interface StoredCognitiveResult {
  id: string;
  userName: string;
  result: CognitiveResult;
  completedAt: string;
}

/**
 * 結果を保存
 */
export function saveCognitiveResult(userName: string, result: CognitiveResult): StoredCognitiveResult {
  const stored: StoredCognitiveResult = {
    id: generateId(),
    userName,
    result,
    completedAt: new Date().toISOString(),
  };

  const existing = getAllResults();
  existing.unshift(stored);

  // 最大50件まで保存
  const trimmed = existing.slice(0, 50);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }

  return stored;
}

/**
 * 全結果を取得
 */
export function getAllResults(): StoredCognitiveResult[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as StoredCognitiveResult[];
  } catch {
    return [];
  }
}

/**
 * IDで結果を取得
 */
export function getResultById(id: string): StoredCognitiveResult | null {
  const results = getAllResults();
  return results.find(r => r.id === id) || null;
}

/**
 * ユーザー名で結果をフィルタ
 */
export function getResultsByUserName(userName: string): StoredCognitiveResult[] {
  const results = getAllResults();
  return results.filter(r => r.userName.toLowerCase() === userName.toLowerCase());
}

/**
 * 結果を削除
 */
export function deleteResult(id: string): boolean {
  const results = getAllResults();
  const filtered = results.filter(r => r.id !== id);

  if (filtered.length === results.length) return false;

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  return true;
}

/**
 * 全結果をクリア
 */
export function clearAllResults(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * ユニークIDを生成
 */
function generateId(): string {
  return `cog_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
