// 간소화된 자산 검색 API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: 'Query parameter required' });
  }

  console.log('🔍 자산 검색 시작:', query);

  const results = [];
  const sources = [];
  const errors = [];

  // 미국 주요 주식 목록
  const US_STOCKS = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    { symbol: 'CRM', name: 'Salesforce Inc.' },
    { symbol: 'ADBE', name: 'Adobe Inc.' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust' }
  ];

  // 주요 암호화폐 목록
  const CRYPTO_LIST = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
    { id: 'solana', symbol: 'SOL', name: 'Solana' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
    { id: 'polygon', symbol: 'MATIC', name: 'Polygon' },
    { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' }
  ];

  const normalizedQuery = query.toLowerCase().trim();
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    // 1. 미국 주식 검색
    const stockMatches = US_STOCKS.filter(stock =>
      stock.symbol.toLowerCase().includes(normalizedQuery) ||
      stock.name.toLowerCase().includes(normalizedQuery)
    ).slice(0, 5);

    console.log(`📊 주식 매칭: ${stockMatches.length}개`);

    // 주식 가격 조회
    for (const stock of stockMatches) {
      try {
        const response = await fetch(`${baseUrl}/api/proxy-yahoo?symbol=${stock.symbol}&interval=1d&range=1d`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            results.push({
              id: stock.symbol,
              symbol: stock.symbol,
              name: stock.name,
              price: data.data.price || 0,
              change: data.data.change || 0,
              changePercent: data.data.changePercent || 0,
              volume: data.data.volume || 0,
              type: 'stock',
              market: 'US',
              currency: 'USD',
              source: 'Yahoo Finance'
            });
          }
        }
      } catch (error) {
        console.warn(`주식 ${stock.symbol} 가격 조회 실패:`, error.message);
      }
    }

    if (stockMatches.length > 0) {
      sources.push('Yahoo Finance');
    }

    // 2. 암호화폐 검색
    const cryptoMatches = CRYPTO_LIST.filter(crypto =>
      crypto.symbol.toLowerCase().includes(normalizedQuery) ||
      crypto.name.toLowerCase().includes(normalizedQuery)
    ).slice(0, 5);

    console.log(`🪙 암호화폐 매칭: ${cryptoMatches.length}개`);

    if (cryptoMatches.length > 0) {
      try {
        const cryptoIds = cryptoMatches.map(c => c.id).join(',');
        const response = await fetch(`${baseUrl}/api/proxy-coingecko?endpoint=simple%2Fprice&ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            cryptoMatches.forEach(crypto => {
              const priceData = data.data[crypto.id];
              if (priceData && priceData.usd) {
                const changePercent = priceData.usd_24h_change || 0;
                results.push({
                  id: crypto.id,
                  symbol: crypto.symbol.toUpperCase(),
                  name: crypto.name,
                  price: priceData.usd,
                  change: (priceData.usd * changePercent) / 100,
                  changePercent: changePercent,
                  type: 'crypto',
                  market: 'CRYPTO',
                  currency: 'USD',
                  source: 'CoinGecko'
                });
              }
            });
            sources.push('CoinGecko');
          }
        }
      } catch (error) {
        console.warn('암호화폐 가격 조회 실패:', error.message);
        errors.push('CoinGecko API 오류');
      }
    }

  } catch (error) {
    console.error('검색 중 오류:', error);
    errors.push(`검색 오류: ${error.message}`);
  }

  // 결과 정렬 (가격 기준 내림차순)
  results.sort((a, b) => b.price - a.price);

  const searchResult = {
    success: true,
    query,
    results: results.slice(0, 10), // 최대 10개 결과
    timestamp: new Date().toISOString(),
    sources,
    totalSources: sources.length,
    errors: errors.length > 0 ? errors : undefined
  };

  console.log(`🎯 검색 완료: ${results.length}개 결과, 소스: ${sources.join(', ')}`);

  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
  res.status(200).json(searchResult);
}