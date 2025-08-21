/**
 * Finnhub API 프록시 (백업 실시간 데이터)
 * CORS 문제 해결 및 API 키 보안을 위한 서버사이드 프록시
 */

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || 'demo';

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

  try {
    console.log(`Proxying Finnhub request for endpoint: ${endpoint}`);
    
    // 지원되는 엔드포인트만 허용
    const allowedEndpoints = [
      'quote',
      'profile2', 
      'metric',
      'recommendation',
      'news',
      'earnings',
      'financials-reported'
    ];

    if (!allowedEndpoints.includes(endpoint)) {
      throw new Error(`Endpoint '${endpoint}' is not allowed`);
    }

    // Finnhub API URL 구성
    const baseUrl = 'https://finnhub.io/api/v1';
    const url = new URL(`${baseUrl}/${endpoint}`);
    
    // 심볼이 있으면 추가
    if (symbol) {
      url.searchParams.append('symbol', symbol);
    }
    
    // 기타 쿼리 파라미터 추가
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
    
    // API 토큰 추가
    url.searchParams.append('token', FINNHUB_API_KEY);

    console.log('Finnhub API URL:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Investment-Analysis-App/2.1.5'
      }
    });

    if (!response.ok) {
      throw new Error(`Finnhub API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // API 응답 유효성 검사
    if (endpoint === 'quote' && (!data || typeof data.c === 'undefined')) {
      throw new Error('Invalid quote response from Finnhub');
    }

    console.log(`Successfully proxied Finnhub ${endpoint}:`, {
      status: response.status,
      symbol: symbol,
      hasData: !!data
    });

    // 응답 데이터 정규화
    let normalizedData = data;
    
    if (endpoint === 'quote') {
      normalizedData = {
        symbol: symbol,
        price: data.c || 0, // Current price
        previousClose: data.pc || 0, // Previous close
        change: data.d || 0, // Change
        changePercent: data.dp || 0, // Percent change
        high: data.h || 0, // High
        low: data.l || 0, // Low
        open: data.o || 0, // Open
        timestamp: Date.now(),
        source: 'Finnhub (Proxied)'
      };
    }

    res.status(200).json({
      success: true,
      data: normalizedData,
      source: 'Finnhub (Proxied)',
      endpoint: endpoint,
      symbol: symbol,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error(`Error proxying Finnhub ${endpoint}:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: endpoint,
      symbol: symbol,
      suggestion: 'Check API key and rate limits'
    });
  }
}