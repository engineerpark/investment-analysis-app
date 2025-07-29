/**
 * CoinGecko API 프록시
 * CORS 문제 해결 및 API 키 보안을 위한 서버사이드 프록시
 */

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || 'CG-XDJgFHwfoyMMnxq5UuWfqvaw';

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

  const { endpoint, ...queryParams } = req.query;

  if (!endpoint) {
    res.status(400).json({ error: 'Endpoint parameter is required' });
    return;
  }

  try {
    console.log(`Proxying CoinGecko request for endpoint: ${endpoint}`);
    
    // 지원되는 엔드포인트만 허용
    const allowedEndpoints = [
      'ping',
      'global', 
      'search',
      'simple/price',
      'coins/markets',
      'search/trending'
    ];

    if (!allowedEndpoints.includes(endpoint)) {
      throw new Error(`Endpoint '${endpoint}' is not allowed`);
    }

    // CoinGecko API URL 구성
    const baseUrl = 'https://api.coingecko.com/api/v3';
    const url = new URL(`${baseUrl}/${endpoint}`);
    
    // 쿼리 파라미터 추가
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    // API 요청 헤더 설정
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'Investment-Analysis-App/2.1.3'
    };

    // Pro API 키가 있으면 추가
    if (COINGECKO_API_KEY && COINGECKO_API_KEY.startsWith('CG-')) {
      headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
      console.log('Using CoinGecko Pro API key');
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // API 응답 유효성 검사
    if (endpoint === 'ping' && !data.gecko_says) {
      throw new Error('Invalid ping response from CoinGecko');
    }

    console.log(`Successfully proxied CoinGecko ${endpoint}:`, {
      status: response.status,
      dataKeys: Object.keys(data).slice(0, 5) // 첫 5개 키만 로깅
    });

    res.status(200).json({
      success: true,
      data: data,
      source: 'CoinGecko (Proxied)',
      endpoint: endpoint,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error(`Error proxying CoinGecko ${endpoint}:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: endpoint,
      suggestion: 'Check API key and network connectivity'
    });
  }
}