// 검색 API 테스트 스크립트
async function testCoinGeckoSearch(query) {
  console.log(`🪙 CoinGecko "${query}" 검색 테스트:`);
  
  try {
    // 1. 검색 API 테스트
    const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
    console.log('검색 응답 상태:', searchResponse.status);
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const coins = (searchData.coins || []).slice(0, 3);
      console.log(`✅ 검색 성공: ${coins.length}개 코인 발견`);
      
      coins.forEach(coin => {
        console.log(`  - ${coin.symbol}: ${coin.name}`);
      });
      
      if (coins.length > 0) {
        // 2. 가격 API 테스트
        const coinIds = coins.map(c => c.id).join(',');
        const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`);
        
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          console.log('💰 가격 정보:');
          Object.entries(priceData).forEach(([id, data]) => {
            console.log(`  - ${id}: $${data.usd} (${data.usd_24h_change?.toFixed(2)}%)`);
          });
        } else {
          console.log('❌ 가격 조회 실패:', priceResponse.status);
        }
      }
    } else {
      console.log('❌ 검색 실패:', searchResponse.status);
    }
  } catch (error) {
    console.log('❌ 네트워크 오류:', error.message);
  }
}

async function testUSStockSearch(query) {
  console.log(`\n📈 미국 주식 "${query}" 검색 테스트:`);
  
  // 로컬 데이터베이스에서 검색
  const US_STOCKS = [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
    { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', sector: 'Technology' },
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' }
  ];
  
  const matches = US_STOCKS.filter(stock =>
    stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
    stock.name.toLowerCase().includes(query.toLowerCase())
  );
  
  console.log(`✅ 로컬 매치: ${matches.length}개 주식 발견`);
  matches.forEach(stock => {
    console.log(`  - ${stock.symbol}: ${stock.name}`);
  });
  
  // Yahoo Finance API 테스트 (제한 때문에 skip)
  console.log('⚠️  Yahoo Finance API는 요청 제한으로 테스트 생략');
}

async function testKoreanStockSearch(query) {
  console.log(`\n🇰🇷 한국 주식 "${query}" 검색 테스트:`);
  
  const KOREAN_STOCKS = [
    { symbol: '005930', name: '삼성전자', sector: 'Technology' },
    { symbol: '000660', name: 'SK하이닉스', sector: 'Technology' },
    { symbol: '035420', name: 'NAVER', sector: 'Technology' },
    { symbol: '035720', name: '카카오', sector: 'Technology' }
  ];
  
  const matches = KOREAN_STOCKS.filter(stock =>
    stock.symbol.includes(query) ||
    stock.name.includes(query)
  );
  
  console.log(`✅ 로컬 매치: ${matches.length}개 주식 발견`);
  matches.forEach(stock => {
    console.log(`  - ${stock.symbol}: ${stock.name}`);
  });
}

// 테스트 실행
async function runAllTests() {
  console.log('🧪 종목 검색 API 테스트 시작\n');
  
  // 암호화폐 테스트
  await testCoinGeckoSearch('bitcoin');
  await testCoinGeckoSearch('ethereum');
  
  // 미국 주식 테스트
  await testUSStockSearch('apple');
  await testUSStockSearch('tesla');
  
  // 한국 주식 테스트
  await testKoreanStockSearch('삼성');
  await testKoreanStockSearch('005930');
  
  console.log('\n🎯 테스트 완료');
}

// Node.js 환경에서 실행
if (typeof module !== 'undefined' && module.exports) {
  // fetch polyfill for Node.js
  const fetch = require('node-fetch');
  global.fetch = fetch;
  runAllTests();
}

// 브라우저 환경에서도 실행 가능
if (typeof window !== 'undefined') {
  window.testSearch = runAllTests;
}