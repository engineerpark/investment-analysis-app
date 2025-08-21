// 다중 소스 통합 검색 API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: 'Query parameter required' });
  }

  console.log('🔍 다중 소스 통합 검색 시작:', query);

  const results = [];
  const sources = [];
  const errors = [];

  try {
    // 1. FMP 실시간 검색 (1순위 - 빠름)
    console.log('💰 FMP 실시간 검색 중...');
    try {
      const fmpResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/proxy-fmp?endpoint=quote-short&symbol=${encodeURIComponent(query.toUpperCase())}`);
      
      if (fmpResponse.ok) {
        const fmpData = await fmpResponse.json();
        if (fmpData.success && fmpData.data.price > 0) {
          results.push({
            id: fmpData.data.symbol,
            symbol: fmpData.data.symbol,
            name: fmpData.data.symbol,
            price: fmpData.data.price,
            change: fmpData.data.change,
            changePercent: fmpData.data.changePercent,
            volume: fmpData.data.volume,
            type: 'stock',
            market: 'US',
            sector: 'Unknown',
            currency: 'USD',
            source: 'FMP',
            timestamp: fmpData.timestamp
          });
          sources.push('Financial Modeling Prep');
          console.log(`✅ FMP 성공: ${fmpData.data.symbol} $${fmpData.data.price}`);
        }
      }
    } catch (fmpError) {
      console.warn('FMP 검색 실패:', fmpError.message);
      errors.push(`FMP: ${fmpError.message}`);
    }

    // 2. Finnhub 백업 검색 (2순위)
    console.log('📊 Finnhub 백업 검색 중...');
    try {
      const finnhubResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/proxy-finnhub?endpoint=quote&symbol=${encodeURIComponent(query.toUpperCase())}`);
      
      if (finnhubResponse.ok) {
        const finnhubData = await finnhubResponse.json();
        if (finnhubData.success && finnhubData.data.price > 0) {
          results.push({
            id: finnhubData.data.symbol,
            symbol: finnhubData.data.symbol,
            name: finnhubData.data.symbol,
            price: finnhubData.data.price,
            change: finnhubData.data.change,
            changePercent: finnhubData.data.changePercent,
            volume: 0,
            type: 'stock',
            market: 'US',
            sector: 'Unknown',
            currency: 'USD',
            source: 'Finnhub',
            timestamp: finnhubData.timestamp
          });
          sources.push('Finnhub');
          console.log(`✅ Finnhub 성공: ${finnhubData.data.symbol} $${finnhubData.data.price}`);
        }
      }
    } catch (finnhubError) {
      console.warn('Finnhub 검색 실패:', finnhubError.message);
      errors.push(`Finnhub: ${finnhubError.message}`);
    }

    // 3. CoinGecko 암호화폐 검색 (3순위)
    console.log('🪙 CoinGecko 암호화폐 검색 중...');
    try {
      const coinGeckoResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/proxy-coingecko?endpoint=search&query=${encodeURIComponent(query)}`);
      
      if (coinGeckoResponse.ok) {
        const coinGeckoData = await coinGeckoResponse.json();
        if (coinGeckoData.success && coinGeckoData.data.coins && coinGeckoData.data.coins.length > 0) {
          // 상위 3개 코인 선택
          const topCoins = coinGeckoData.data.coins.slice(0, 3);
          const coinIds = topCoins.map(coin => coin.id).join(',');
          
          // 가격 정보 조회
          const priceResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/proxy-coingecko?endpoint=simple%2Fprice&ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`);
          
          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            if (priceData.success) {
              topCoins.forEach(coin => {
                const priceInfo = priceData.data[coin.id];
                if (priceInfo && priceInfo.usd) {
                  results.push({
                    id: coin.id,
                    symbol: coin.symbol.toUpperCase(),
                    name: coin.name,
                    price: priceInfo.usd,
                    change: priceInfo.usd * (priceInfo.usd_24h_change || 0) / 100,
                    changePercent: priceInfo.usd_24h_change || 0,
                    volume: 0,
                    type: 'crypto',
                    market: 'CRYPTO',
                    sector: 'Cryptocurrency',
                    currency: 'USD',
                    source: 'CoinGecko',
                    timestamp: priceData.timestamp
                  });
                }
              });
              sources.push('CoinGecko');
              console.log(`✅ CoinGecko 성공: ${topCoins.length}개 코인`);
            }
          }
        }
      }
    } catch (coinGeckoError) {
      console.warn('CoinGecko 검색 실패:', coinGeckoError.message);
      errors.push(`CoinGecko: ${coinGeckoError.message}`);
    }

    // 4. Alpha Vantage 검색 (4순위 - 느리지만 안정적)
    if (results.length === 0) {
      console.log('📈 Alpha Vantage 최후 검색 중...');
      try {
        const alphaVantageUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(query.toUpperCase())}&apikey=${process.env.ALPHA_VANTAGE_API_KEY || 'W81KZ2JQNEQY76VG'}`;
        const alphaResponse = await fetch(alphaVantageUrl);
        
        if (alphaResponse.ok) {
          const alphaData = await alphaResponse.json();
          const quote = alphaData['Global Quote'];
          
          if (quote && quote['05. price']) {
            results.push({
              id: quote['01. symbol'],
              symbol: quote['01. symbol'],
              name: quote['01. symbol'],
              price: parseFloat(quote['05. price']),
              change: parseFloat(quote['09. change']),
              changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
              volume: parseInt(quote['06. volume'] || '0'),
              type: 'stock',
              market: 'US',
              sector: 'Unknown',
              currency: 'USD',
              source: 'Alpha Vantage',
              timestamp: Date.now()
            });
            sources.push('Alpha Vantage');
            console.log(`✅ Alpha Vantage 성공: ${quote['01. symbol']} $${quote['05. price']}`);
          }
        }
      } catch (alphaError) {
        console.warn('Alpha Vantage 검색 실패:', alphaError.message);
        errors.push(`Alpha Vantage: ${alphaError.message}`);
      }
    }

    // 결과 정리 및 중복 제거
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.symbol === result.symbol)
    );

    const response = {
      success: true,
      query,
      results: uniqueResults.slice(0, 10), // 최대 10개 결과
      sources: [...new Set(sources)],
      timestamp: new Date().toISOString(),
      totalSources: sources.length,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('🎯 다중 소스 검색 완료:', {
      query,
      totalResults: uniqueResults.length,
      sources: response.sources,
      errors: errors.length
    });

    return res.status(200).json(response);

  } catch (error) {
    console.error('다중 소스 검색 전체 실패:', error);
    return res.status(500).json({
      success: false,
      query,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}