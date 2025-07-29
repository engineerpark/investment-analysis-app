/**
 * Yahoo Finance API 프록시
 * CORS 문제 해결을 위한 서버사이드 프록시
 */

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

  const { symbol, interval = '1d', range = '1d' } = req.query;

  if (!symbol) {
    res.status(400).json({ error: 'Symbol parameter is required' });
    return;
  }

  try {
    console.log(`Proxying Yahoo Finance request for symbol: ${symbol}`);
    
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // 데이터 유효성 검사
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('Invalid data structure from Yahoo Finance');
    }

    const result = data.chart.result[0];
    const meta = result.meta;

    if (!meta) {
      throw new Error('Missing meta data from Yahoo Finance');
    }

    // 정규화된 응답 반환
    const normalizedResponse = {
      symbol: symbol.toUpperCase(),
      price: meta.regularMarketPrice || meta.previousClose || 0,
      previousClose: meta.previousClose || 0,
      change: (meta.regularMarketPrice || meta.previousClose || 0) - (meta.previousClose || 0),
      changePercent: meta.previousClose ? 
        (((meta.regularMarketPrice || meta.previousClose) - meta.previousClose) / meta.previousClose * 100) : 0,
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap || 0,
      currency: meta.currency || 'USD',
      exchange: meta.exchangeName || 'Unknown',
      timestamp: Date.now(),
      source: 'Yahoo Finance (Proxied)'
    };

    console.log(`Successfully proxied data for ${symbol}:`, {
      price: normalizedResponse.price,
      change: normalizedResponse.change,
      changePercent: normalizedResponse.changePercent.toFixed(2) + '%'
    });

    res.status(200).json({
      success: true,
      data: normalizedResponse
    });

  } catch (error) {
    console.error(`Error proxying Yahoo Finance for ${symbol}:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      symbol: symbol,
      fallbackSuggestion: 'Consider using Alpha Vantage or mock data'
    });
  }
}