#!/usr/bin/env node

/**
 * 다중 소스 API 테스트 스크립트
 * 모든 데이터 소스의 연결 상태와 응답 속도를 테스트합니다.
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const TEST_SYMBOLS = ['AAPL', 'TSLA', 'MSFT', 'BTC', 'ETH'];

console.log('🧪 다중 소스 API 연결 테스트 시작...\n');

async function testAPI(name, url, validator) {
  const startTime = Date.now();
  
  try {
    console.log(`📡 ${name} 테스트 중...`);
    
    const response = await fetch(url, { timeout: 10000 });
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const isValid = validator(data);
    
    console.log(`${isValid ? '✅' : '❌'} ${name}: ${responseTime}ms ${isValid ? '(성공)' : '(데이터 검증 실패)'}`);
    
    if (!isValid) {
      console.log('   응답 데이터:', JSON.stringify(data, null, 2).slice(0, 200) + '...');
    }
    
    return { name, success: isValid, responseTime, error: null };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`❌ ${name}: ${responseTime}ms (실패: ${error.message})`);
    return { name, success: false, responseTime, error: error.message };
  }
}

async function runAllTests() {
  const testCases = [
    {
      name: 'CoinGecko 프록시',
      url: `${BASE_URL}/api/proxy-coingecko?endpoint=simple%2Fprice&ids=bitcoin&vs_currencies=usd`,
      validator: (data) => data.success && data.data && data.data.bitcoin && data.data.bitcoin.usd > 0
    },
    {
      name: 'Finnhub 프록시',
      url: `${BASE_URL}/api/proxy-finnhub?endpoint=quote&symbol=AAPL`,
      validator: (data) => data.success && data.data && data.data.price > 0
    },
    {
      name: 'FMP 프록시',
      url: `${BASE_URL}/api/proxy-fmp?endpoint=quote-short&symbol=AAPL`,
      validator: (data) => data.success && data.data && data.data.price > 0
    },
    {
      name: 'Yahoo Finance 프록시',
      url: `${BASE_URL}/api/proxy-yahoo?symbol=AAPL&interval=1d&range=1d`,
      validator: (data) => data.success && data.data && data.data.price > 0
    },
    {
      name: '다중 소스 통합 검색',
      url: `${BASE_URL}/api/multi-source-search?query=AAPL`,
      validator: (data) => data.success && data.results && data.results.length > 0
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await testAPI(testCase.name, testCase.url, testCase.validator);
    results.push(result);
    
    // API Rate Limiting 방지를 위한 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 테스트 결과 요약:');
  console.log('==========================================');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`전체 테스트: ${total}개`);
  console.log(`성공: ${successful}개 (${Math.round(successful/total*100)}%)`);
  console.log(`실패: ${total - successful}개`);
  
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  console.log(`평균 응답 시간: ${Math.round(avgResponseTime)}ms`);
  
  console.log('\n상세 결과:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.responseTime}ms`);
    if (result.error) {
      console.log(`   오류: ${result.error}`);
    }
  });
  
  if (successful === total) {
    console.log('\n🎉 모든 API가 정상 작동합니다!');
    process.exit(0);
  } else {
    console.log('\n⚠️  일부 API에 문제가 있습니다. 환경 변수와 API 키를 확인해주세요.');
    process.exit(1);
  }
}

// 심볼별 개별 테스트
async function testSymbolSearch() {
  console.log('\n🔍 심볼별 검색 테스트...');
  
  for (const symbol of TEST_SYMBOLS) {
    try {
      const response = await fetch(`${BASE_URL}/api/multi-source-search?query=${symbol}`, { timeout: 15000 });
      const data = await response.json();
      
      if (data.success && data.results.length > 0) {
        const result = data.results[0];
        console.log(`✅ ${symbol}: $${result.price} (${result.source})`);
      } else {
        console.log(`❌ ${symbol}: 검색 결과 없음`);
      }
    } catch (error) {
      console.log(`❌ ${symbol}: ${error.message}`);
    }
    
    // Rate limiting 방지
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// 메인 실행
async function main() {
  await runAllTests();
  await testSymbolSearch();
}

main().catch(console.error);