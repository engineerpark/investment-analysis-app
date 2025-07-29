/**
 * 성능 모니터링 컴포넌트
 * - API 성능 모니터링
 * - 캐시 상태 확인
 * - 에러 로그 관리
 */

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { getCacheStats, clearCache, testAPIConnections } from '../utils/api_enhanced';
import { globalLoadingManager } from '../utils/error-handler';

interface PerformanceStats {
  cache: any;
  apiStatus: Record<string, boolean>;
  loadingStates: Record<string, boolean>;
}

export default function PerformanceMonitor({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refreshStats = async () => {
    setRefreshing(true);
    try {
      const [cacheStats, apiStatus] = await Promise.all([
        getCacheStats(),
        testAPIConnections()
      ]);

      setStats({
        cache: cacheStats,
        apiStatus,
        loadingStates: {
          'asset-search': globalLoadingManager.isLoading('asset-search')
        }
      });
    } catch (error) {
      console.error('성능 통계 조회 실패:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 10000); // 10초마다 갱신
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    clearCache();
    refreshStats();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>성능 통계 로딩 중...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🔍 성능 모니터링</h2>
          <div className="flex gap-2">
            <Button 
              onClick={refreshStats} 
              disabled={refreshing}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {refreshing ? '새로고침 중...' : '새로고침'}
            </Button>
            <Button onClick={onClose} variant="outline">
              닫기
            </Button>
          </div>
        </div>

        {stats && (
          <div className="space-y-6">
            {/* API 상태 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">📡 API 연결 상태</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(stats.apiStatus).map(([api, status]) => (
                  <div 
                    key={api} 
                    className={`p-3 rounded-lg ${status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{api}</span>
                      <div className={`w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <p className="text-sm mt-1">{status ? '정상' : '연결 실패'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 캐시 통계 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">💾 캐시 통계</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800">캐시 크기</h4>
                  <p className="text-2xl font-bold text-blue-600">{stats.cache.size}</p>
                  <p className="text-sm text-blue-600">개 항목</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">총 히트</h4>
                  <p className="text-2xl font-bold text-green-600">{stats.cache.totalHits}</p>
                  <p className="text-sm text-green-600">회</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800">평균 히트</h4>
                  <p className="text-2xl font-bold text-purple-600">{stats.cache.averageHits}</p>
                  <p className="text-sm text-purple-600">회/항목</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800">메모리 사용량</h4>
                  <p className="text-2xl font-bold text-yellow-600">{stats.cache.memory}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">캐시 히트 순위 (Top 5)</h4>
                  <Button 
                    onClick={handleClearCache}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm"
                  >
                    캐시 초기화
                  </Button>
                </div>
                <div className="space-y-2">
                  {stats.cache.topEntries.length > 0 ? (
                    stats.cache.topEntries.map((entry: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                        <span className="font-mono text-sm">{entry.key}</span>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{entry.hits} hits</span>
                          <span>{entry.ageMinutes}분 전</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">캐시 데이터가 없습니다</p>
                  )}
                </div>
              </div>
            </div>

            {/* 로딩 상태 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">⏳ 현재 로딩 상태</h3>
              <div className="space-y-2">
                {Object.entries(stats.loadingStates).map(([key, loading]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{key}</span>
                    <div className={`px-2 py-1 rounded text-sm ${
                      loading ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'
                    }`}>
                      {loading ? '로딩 중' : '완료'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 시스템 정보 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🖥️ 시스템 정보</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>브라우저:</strong> {navigator.userAgent.split(' ')[0]}
                  </div>
                  <div>
                    <strong>온라인 상태:</strong> {navigator.onLine ? '온라인' : '오프라인'}
                  </div>
                  <div>
                    <strong>언어:</strong> {navigator.language}
                  </div>
                  <div>
                    <strong>화면 해상도:</strong> {screen.width}x{screen.height}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}