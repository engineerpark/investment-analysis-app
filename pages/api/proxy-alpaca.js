/**
 * Alpaca Market Data API 프록시 (실시간 데이터)
 * CORS 문제 해결 및 API 키 보안을 위한 서버사이드 프록시
 */

const ALPACA_API_KEY = process.env.NEXT_PUBLIC_ALPACA_API_KEY || '';
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY || '';

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { endpoint, symbol, ...queryParams } = req.query;

  if (!endpoint) {
    res.status(400).json({ error: 'Endpoint parameter is required' });
    return;
  }

  // API 키 확인
  if (!ALPACA_API_KEY || !ALPACA_SECRET_KEY) {
    res.status(400).json({ 
      error: 'Alpaca API credentials not configured',
      suggestion: 'Set NEXT_PUBLIC_ALPACA_API_KEY and ALPACA_SECRET_KEY environment variables'
    });
    return;
  }

  try {
    console.log(`Proxying Alpaca request for endpoint: ${endpoint}`);
    
    // 지원되는 엔드포인트만 허용 (Basic 플랜)
    const allowedEndpoints = [
      'stocks/bars', // 봉 데이터
      'stocks/quotes', // 호가 데이터  
      'stocks/trades', // 체결 데이터
      'stocks/snapshots', // 스냅샷
      'stocks/meta/exchanges', // 거래소 정보
      'stocks/meta/conditions' // 조건 정보
    ];

    if (!allowedEndpoints.some(allowed => endpoint.startsWith(allowed.replace('/', '%2F')))) {
      throw new Error(`Endpoint '${endpoint}' is not allowed`);
    }

    // Alpaca API URL 구성 (IEX Basic 플랜)
    const baseUrl = 'https://data.alpaca.markets/v2';
    const apiUrl = `${baseUrl}/${endpoint.replace('%2F', '/')}`;
    const url = new URL(apiUrl);
    
    // 심볼 파라미터 추가
    if (symbol) {
      url.searchParams.append('symbols', symbol);
    }
    
    // 기타 쿼리 파라미터 추가
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value && key !== 'symbols') {
        url.searchParams.append(key, value);
      }
    });

    console.log('Alpaca API URL:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Investment-Analysis-App/2.1.5',
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Alpaca API returned ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log(`Successfully proxied Alpaca ${endpoint}:`, {
      status: response.status,
      symbol: symbol,
      hasData: !!data,
      dataKeys: Object.keys(data).slice(0, 5) // 첫 5개 키만 로깅
    });

    // 응답 데이터 정규화
    let normalizedData = data;
    
    if (endpoint.includes('snapshots') && data && symbol) {
      const snapshot = data[symbol];
      if (snapshot) {
        normalizedData = {
          symbol: symbol,
          price: snapshot.latestTrade?.p || 0,
          volume: snapshot.latestTrade?.s || 0,
          timestamp: snapshot.latestTrade?.t ? new Date(snapshot.latestTrade.t).getTime() : Date.now(),
          bid: snapshot.latestQuote?.bp || 0,
          ask: snapshot.latestQuote?.ap || 0,
          source: 'Alpaca IEX (Proxied)'
        };
      }
    }

    res.status(200).json({
      success: true,
      data: normalizedData,
      source: 'Alpaca IEX (Proxied)',
      endpoint: endpoint,
      symbol: symbol,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error(`Error proxying Alpaca ${endpoint}:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: endpoint,
      symbol: symbol,
      suggestion: 'Check Alpaca API credentials and Basic plan limits (30 symbols max for WebSocket)'
    });
  }
}