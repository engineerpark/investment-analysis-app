import React, { useState } from 'react';
// import { searchUniversalAssets } from '../utils/api_enhanced';

export default function TestSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResults(null);
    
    console.log('🔍 검색 시작:', query);
    
    try {
      // const result = await searchUniversalAssets(query.trim());
      const result = { results: [] }; // 임시 빈 결과
      console.log('✅ 검색 결과:', result);
      setResults(result);
    } catch (err: any) {
      console.error('❌ 검색 실패:', err);
      setError(err.message || '검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔍 종목 검색 테스트</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요 (예: bitcoin, apple, 삼성)"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '검색 중...' : '검색'}
            </button>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            테스트할 검색어 예시:
            <div className="flex gap-2 mt-2">
              {['bitcoin', 'ethereum', 'apple', 'tesla', '삼성', '005930'].map(example => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="px-3 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span>검색 중... (콘솔을 확인하세요)</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">❌ 검색 실패</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {results && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📊 검색 결과</h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p><strong>검색어:</strong> {results.query}</p>
              <p><strong>결과 수:</strong> {results.results.length}개</p>
              <p><strong>데이터 소스:</strong> {results.sources.join(', ')}</p>
              <p><strong>검색 시간:</strong> {new Date(results.timestamp).toLocaleString()}</p>
            </div>

            {results.results.length > 0 ? (
              <div className="space-y-3">
                {results.results.map((asset: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{asset.symbol}</h3>
                        <p className="text-gray-600">{asset.name}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {asset.type}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            {asset.market}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {asset.sector}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {asset.price ? (
                          <>
                            <p className="text-xl font-bold">${asset.price.toLocaleString()}</p>
                            <p className={`text-sm ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent?.toFixed(2)}%
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-500">가격 정보 없음</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">검색 결과가 없습니다.</p>
            )}
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">🛠️ 개발자 정보</h3>
          <p className="text-yellow-700 text-sm">
            브라우저 개발자 도구(F12)의 콘솔을 열어서 상세한 API 호출 로그를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}