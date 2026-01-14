import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">O2CONNECTIVE</h1>
          <nav className="flex gap-4">
            <Link href="/assessment" className="text-gray-600 hover:text-gray-800">
              診断
            </Link>
            <Link href="/cognitive" className="text-gray-600 hover:text-gray-800">
              認知テスト
            </Link>
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* ヒーローセクション */}
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            組織コミュニケーションを
            <br />
            <span className="text-blue-600">科学的に改善</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            性格診断と認知能力テストを組み合わせた新しいアプローチで、
            チームの相互理解とコミュニケーションを促進します。
          </p>
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
          >
            診断を始める
          </Link>
        </section>

        {/* 特徴セクション */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          {/* 性格診断 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">性格診断</h3>
            <p className="text-gray-600 mb-4">
              Big Five + Dark Triad を含む11次元の性格特性を分析。
              120問の設問で詳細なプロファイルを作成します。
            </p>
            <Link href="/assessment" className="text-blue-600 font-medium hover:underline">
              診断を開始 →
            </Link>
          </div>

          {/* 認知能力テスト */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">認知能力テスト</h3>
            <p className="text-gray-600 mb-4">
              ICAR-16による科学的な認知能力測定。
              論理推論、パターン認識、空間認知を評価します。
            </p>
            <Link href="/cognitive" className="text-purple-600 font-medium hover:underline">
              テストを開始 →
            </Link>
          </div>

          {/* AI分析 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">AI分析</h3>
            <p className="text-gray-600 mb-4">
              バイアスを軽減したAI解釈で、
              強みと成長機会を客観的に分析します。
            </p>
            <span className="text-gray-400 font-medium">
              診断後に自動実行
            </span>
          </div>
        </section>

        {/* 特徴説明 */}
        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            従来の適性診断との違い
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">従来の問題点</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">×</span>
                  スコアの高低が「良い・悪い」と誤解される
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">×</span>
                  性格特性を「能力」と混同してしまう
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">×</span>
                  AI解釈にバイアスが生じやすい
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">本サービスの解決策</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  傾向レベルと自然言語記述で中立的に表現
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  認知能力テストを分離して明確に区別
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  バイアス軽減プロンプトで客観的な解釈
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 O2CONNECTIVE - 組織コミュニケーション適性診断サービス
          </p>
        </div>
      </footer>
    </div>
  );
}
