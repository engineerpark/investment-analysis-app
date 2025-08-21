/**
 * Financial Modeling Prep API 프록시 (펀더멘털 데이터)
 * CORS 문제 해결 및 API 키 보안을 위한 서버사이드 프록시
 */

const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY || 'demo';

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
    console.log(`Proxying FMP request for endpoint: ${endpoint}`);
    
    // 지원되는 엔드포인트만 허용 (무료 플랜 고려)
    const allowedEndpoints = [
      'quote-short',
      'quote',
      'profile',
      'income-statement',
      'balance-sheet-statement', 
      'cash-flow-statement',
      'financial-ratios',
      'enterprise-values',
      'company-rating',
      'historical-price-full',
      'search'
    ];

    if (!allowedEndpoints.includes(endpoint)) {
      throw new Error(`Endpoint '${endpoint}' is not allowed`);
    }

    // FMP API URL 구성
    const baseUrl = 'https://financialmodelingprep.com/api/v3';
    let apiUrl = `${baseUrl}/${endpoint}`;
    
    // 심볼이 필요한 엔드포인트 처리
    if (symbol && !endpoint.includes('search')) {
      apiUrl += `/${symbol}`;
    }
    
    const url = new URL(apiUrl);
    
    // 기본 쿼리 파라미터
    if (endpoint === 'income-statement' && !queryParams.limit) {
      url.searchParams.append('limit', '5');
    }
    
    // 기타 쿼리 파라미터 추가
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
    
    // API 키 추가
    url.searchParams.append('apikey', FMP_API_KEY);

    console.log('FMP API URL:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Investment-Analysis-App/2.1.5'
      }
    });

    if (!response.ok) {
      throw new Error(`FMP API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // API 응답 유효성 검사
    if (endpoint === 'quote-short' && (!data || data.length === 0)) {
      throw new Error('Invalid quote response from FMP');
    }

    console.log(`Successfully proxied FMP ${endpoint}:`, {
      status: response.status,
      symbol: symbol,
      hasData: !!data,
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : 'N/A'
    });

    // 응답 데이터 정규화
    let normalizedData = data;
    
    if (endpoint === 'quote-short' && Array.isArray(data) && data.length > 0) {
      const quote = data[0];
      normalizedData = {
        symbol: quote.symbol,
        price: quote.price || 0,
        change: quote.change || 0,
        changePercent: quote.changesPercentage || 0,
        volume: quote.volume || 0,
        timestamp: Date.now(),
        source: 'FMP (Proxied)'
      };
    } else if (endpoint === 'profile' && Array.isArray(data) && data.length > 0) {
      normalizedData = {
        ...data[0],
        source: 'FMP (Proxied)'
      };
    }

    res.status(200).json({
      success: true,
      data: normalizedData,
      source: 'FMP (Proxied)',
      endpoint: endpoint,
      symbol: symbol,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error(`Error proxying FMP ${endpoint}:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: endpoint,
      symbol: symbol,
      suggestion: 'Check API key and rate limits. FMP demo key has limited access.'
    });
  }
}