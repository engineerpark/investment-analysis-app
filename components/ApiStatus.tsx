import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Key, Globe } from 'lucide-react';
import { testAPIConnections, getPopularAssets /*, searchUniversalAssets*/ } from '../utils/api_enhanced';

interface ApiStatusProps {
  onClose?: () => void;
  onPerformanceMonitor?: () => void;
}

interface APIStatus {
  name: string;
  status: 'connected' | 'error' | 'testing';
  lastTested?: Date;
  errorMessage?: string;
}

export default function ApiStatus({ onClose, onPerformanceMonitor }: ApiStatusProps) {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    { name: 'CoinGecko', status: 'testing' },
    { name: 'Alpha Vantage', status: 'testing' },
    { name: 'Yahoo Finance', status: 'testing' }
  ]);
  const [isTesting, setIsTesting] = useState(false);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // API 상태 테스트
  const testAPIs = async () => {
    setIsTesting(true);
    setApiStatuses(prev => prev.map(api => ({ ...api, status: 'testing' as const })));

    try {
      const results = await testAPIConnections();
      
      setApiStatuses([
        {
          name: 'CoinGecko',
          status: results['CoinGecko'] ? 'connected' : 'error',
          lastTested: new Date(),
          errorMessage: results['CoinGecko'] ? undefined : 'API 연결 실패'
        },
        {
          name: 'Alpha Vantage',
          status: results['Alpha Vantage'] ? 'connected' : 'error',
          lastTested: new Date(),
          errorMessage: results['Alpha Vantage'] ? undefined : 'API 키 또는 제한 확인 필요'
        },
        {
          name: 'Yahoo Finance',
          status: results['Yahoo Finance'] ? 'connected' : 'error',
          lastTested: new Date(),
          errorMessage: results['Yahoo Finance'] ? undefined : '네트워크 또는 CORS 오류'
        }
      ]);

    } catch (error) {
      console.error('API 테스트 오류:', error);
    }

    setIsTesting(false);
  };

  // 샘플 데이터 로드
  const loadSampleData = async () => {
    try {
      const popularAssets = await getPopularAssets();
      setSampleData(popularAssets.slice(0, 5)); // 상위 5개만 표시
      setLastUpdate(new Date());
    } catch (error) {
      console.error('샘플 데이터 로드 오류:', error);
    }
  };

  // 컴포넌트 마운트 시 테스트 실행
  useEffect(() => {
    testAPIs();
    loadSampleData();
  }, []);

  // 상태에 따른 아이콘 반환
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'testing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  // 상태에 따른 배지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'testing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full bg-background responsive-container">
      <div className="h-full flex flex-col overflow-y-auto">
        <div className="px-4 py-6">
          <div className="w-full max-w-none mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-lg font-semibold">API 연동 상태</h1>
                <p className="text-sm text-muted-foreground">실시간 데이터 연결 상태를 확인합니다</p>
              </div>
              <div className="flex gap-2">
                {onPerformanceMonitor && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onPerformanceMonitor}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                  >
                    🔍 성능 모니터링
                  </Button>
                )}
                {onClose && (
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    ✕
                  </Button>
                )}
              </div>
            </div>

            {/* API 키 상태 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API 키 설정 상태
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CoinGecko Pro</span>
                    <Badge className={process.env.COINGECKO_API_KEY ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {process.env.COINGECKO_API_KEY ? '설정됨' : '기본값'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alpha Vantage</span>
                    <Badge className={process.env.ALPHA_VANTAGE_API_KEY ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {process.env.ALPHA_VANTAGE_API_KEY ? '설정됨' : '미설정'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API 연결 상태 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    API 연결 테스트
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testAPIs}
                    disabled={isTesting}
                    className="text-xs"
                  >
                    {isTesting ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    테스트
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiStatuses.map((api, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(api.status)}
                        <div>
                          <span className="text-sm font-medium">{api.name}</span>
                          {api.lastTested && (
                            <p className="text-xs text-muted-foreground">
                              {api.lastTested.toLocaleTimeString('ko-KR')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusBadge(api.status)}>
                          {api.status === 'connected' ? '정상' : 
                           api.status === 'error' ? '오류' : '테스트중'}
                        </Badge>
                        {api.errorMessage && (
                          <p className="text-xs text-red-600 mt-1">{api.errorMessage}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 실시간 데이터 샘플 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">실시간 데이터 샘플</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadSampleData}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    새로고침
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sampleData.length > 0 ? (
                  <div className="space-y-2">
                    {sampleData.map((asset, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded border">
                        <div>
                          <span className="text-sm font-medium">{asset.symbol}</span>
                          <p className="text-xs text-muted-foreground">{asset.name}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">
                            {asset.currency === 'KRW' ? '₩' : '$'}{asset.price.toLocaleString()}
                          </span>
                          <p className={`text-xs ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">데이터 로딩 중...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API 사용 가이드 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">빠른 설정 가이드</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">1. Alpha Vantage API 키 설정 (권장)</p>
                    <p className="text-muted-foreground text-xs">
                      .env.local 파일에 ALPHA_VANTAGE_API_KEY=your_key 추가
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">2. CoinGecko Pro 업그레이드 (선택)</p>
                    <p className="text-muted-foreground text-xs">
                      더 높은 요청 제한과 안정성을 위해 Pro 플랜 고려
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">3. 문제 해결</p>
                    <p className="text-muted-foreground text-xs">
                      CORS 오류 시 개발자 도구 콘솔에서 자세한 오류 메시지 확인
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}