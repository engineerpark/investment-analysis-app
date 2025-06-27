// API route for testing search functionality
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: 'Query parameter required' });
  }

  console.log('🔍 API 테스트 검색 시작:', query);

  try {
    // CoinGecko 테스트
    console.log('🪙 CoinGecko 테스트 중...');
    
    const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
    console.log('CoinGecko 응답 상태:', searchResponse.status);
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const coins = (searchData.coins || []).slice(0, 3);
      
      console.log('✅ CoinGecko 검색 성공:', coins.length, '개 발견');
      
      if (coins.length > 0) {
        // 가격 정보도 가져오기
        const coinIds = coins.map(c => c.id).join(',');
        const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`);
        
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          
          const results = coins.map(coin => {
            const price = priceData[coin.id];
            return {
              id: coin.id,
              symbol: coin.symbol,
              name: coin.name,
              price: price ? price.usd : null,
              change: price ? price.usd_24h_change : null,
              type: 'crypto',
              market: 'CRYPTO',
              sector: 'Cryptocurrency'
            };
          });
          
          return res.status(200).json({
            success: true,
            query,
            source: 'CoinGecko',
            results,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    // CoinGecko 실패 시 로컬 데이터 반환
    console.log('❌ CoinGecko 실패, 로컬 데이터 사용');
    
    const cryptos = [
      { symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin' },
      { symbol: 'ETH', name: 'Ethereum', id: 'ethereum' },
      { symbol: 'SOL', name: 'Solana', id: 'solana' }
    ];
    
    const matches = cryptos.filter(crypto => 
      crypto.symbol.toLowerCase().includes(query.toLowerCase()) ||
      crypto.name.toLowerCase().includes(query.toLowerCase())
    );
    
    return res.status(200).json({
      success: false,
      query,
      source: 'Local Database',
      results: matches.map(match => ({
        ...match,
        price: null,
        change: null,
        type: 'crypto',
        market: 'CRYPTO',
        sector: 'Cryptocurrency'
      })),
      timestamp: new Date().toISOString(),
      error: 'CoinGecko API 연결 실패'
    });
    
  } catch (error) {
    console.error('검색 API 오류:', error);
    return res.status(500).json({
      success: false,
      query,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}