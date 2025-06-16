interface Asset {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  type: 'stock' | 'crypto';
  geckoId?: string;
  uniqueId?: string;
}

interface VolatilityAnalysis {
  asset: string;
  name: string;
  volatility: number;
  contributionToPortfolio: number;
  allocation: number;
}

interface CorrelationMatrix {
  assets: string[];
  correlations: number[][];
}

interface VaRResult {
  confidence: number;
  var1Day: number;
  var1Week: number;
  var1Month: number;
  expectedShortfall: number;
  worstCase: number;
  bestCase: number;
}

interface StressTestScenario {
  name: string;
  description: string;
  marketShock: number;
  sectorShocks: Record<string, number>;
  result: number;
  probability: number;
}

interface StressTestResult {
  scenarios: StressTestScenario[];
  portfolioResilience: number;
  riskRating: 'Low' | 'Medium' | 'High' | 'Very High';
}

// 포트폴리오 변동성 분석
export function analyzePortfolioVolatility(
  assets: Asset[],
  allocations: Record<string, number>,
  correlationMatrix?: number[][]
): {
  portfolioVolatility: number;
  assetVolatilities: VolatilityAnalysis[];
  diversificationBenefit: number;
} {
  const assetVolatilities: VolatilityAnalysis[] = [];
  let weightedVolatilitySum = 0;
  let portfolioVariance = 0;

  // 개별 자산 변동성 계산
  assets.forEach((asset, i) => {
    const allocation = allocations[asset.ticker] / 100;
    let volatility = 0;
    
    // 자산 타입별 예상 변동성
    if (asset.type === 'crypto') {
      volatility = 0.6 + Math.random() * 0.4; // 60-100%
    } else if (asset.sector?.includes('Technology')) {
      volatility = 0.25 + Math.random() * 0.2; // 25-45%
    } else if (asset.sector?.includes('Bonds')) {
      volatility = 0.03 + Math.random() * 0.05; // 3-8%
    } else if (asset.sector?.includes('Precious Metals')) {
      volatility = 0.15 + Math.random() * 0.15; // 15-30%
    } else {
      volatility = 0.18 + Math.random() * 0.12; // 18-30%
    }

    const contributionToPortfolio = allocation * allocation * volatility * volatility;
    
    assetVolatilities.push({
      asset: asset.ticker,
      name: asset.name,
      volatility: volatility * 100,
      contributionToPortfolio: contributionToPortfolio * 100,
      allocation: allocation * 100
    });

    weightedVolatilitySum += allocation * volatility;
    portfolioVariance += contributionToPortfolio;
  });

  // 상관관계를 고려한 포트폴리오 분산 계산
  if (correlationMatrix) {
    let correlationContribution = 0;
    for (let i = 0; i < assets.length; i++) {
      for (let j = 0; j < assets.length; j++) {
        if (i !== j) {
          const allocation_i = allocations[assets[i].ticker] / 100;
          const allocation_j = allocations[assets[j].ticker] / 100;
          const vol_i = assetVolatilities[i].volatility / 100;
          const vol_j = assetVolatilities[j].volatility / 100;
          const correlation = correlationMatrix[i][j];
          
          correlationContribution += allocation_i * allocation_j * vol_i * vol_j * correlation;
        }
      }
    }
    portfolioVariance += correlationContribution;
  }

  const portfolioVolatility = Math.sqrt(portfolioVariance) * 100;
  const diversificationBenefit = (weightedVolatilitySum * 100) - portfolioVolatility;

  return {
    portfolioVolatility,
    assetVolatilities: assetVolatilities.sort((a, b) => b.contributionToPortfolio - a.contributionToPortfolio),
    diversificationBenefit
  };
}

// 상관관계 매트릭스 생성
export function generateCorrelationMatrix(assets: Asset[]): CorrelationMatrix {
  const n = assets.length;
  const correlations: number[][] = [];

  // 시드 생성 (일관된 결과를 위해)
  const generateSeed = (ticker1: string, ticker2: string): number => {
    const combined = ticker1 + ticker2;
    return combined.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  };

  const seededRandom = (seed: number): number => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < n; i++) {
    correlations[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        correlations[i][j] = 1.0; // 자기 자신과의 상관관계는 1
      } else {
        const asset1 = assets[i];
        const asset2 = assets[j];
        
        // 상관관계 기본값 설정
        let baseCorrelation = 0;
        
        // 같은 섹터인 경우 높은 상관관계
        if (asset1.sector === asset2.sector) {
          baseCorrelation = 0.6;
        } 
        // 같은 자산 타입인 경우 중간 상관관계
        else if (asset1.type === asset2.type) {
          if (asset1.type === 'crypto') {
            baseCorrelation = 0.5;
          } else {
            baseCorrelation = 0.3;
          }
        }
        // 서로 다른 타입인 경우 낮은 상관관계
        else {
          baseCorrelation = 0.1;
        }

        // 랜덤 변동 추가
        const seed = generateSeed(asset1.ticker, asset2.ticker);
        const randomFactor = (seededRandom(seed) - 0.5) * 0.4;
        let correlation = baseCorrelation + randomFactor;
        
        // 상관관계는 -1과 1 사이의 값
        correlation = Math.max(-0.8, Math.min(0.9, correlation));
        
        correlations[i][j] = correlation;
        correlations[j] = correlations[j] || [];
        correlations[j][i] = correlation; // 대칭 매트릭스
      }
    }
  }

  return {
    assets: assets.map(asset => asset.ticker),
    correlations
  };
}

// VaR 계산 (몬테카를로 시뮬레이션)
export function calculateVaR(
  assets: Asset[],
  allocations: Record<string, number>,
  portfolioValue: number,
  correlationMatrix: number[][],
  simulations: number = 10000
): VaRResult[] {
  const confidenceLevels = [0.95, 0.99];
  const results: VaRResult[] = [];

  confidenceLevels.forEach(confidence => {
    const returns: number[] = [];
    
    // 몬테카를로 시뮬레이션
    for (let sim = 0; sim < simulations; sim++) {
      let portfolioReturn = 0;
      
      // 상관관계를 고려한 랜덤 수익률 생성
      const randomReturns = generateCorrelatedReturns(assets, correlationMatrix);
      
      assets.forEach((asset, i) => {
        const allocation = allocations[asset.ticker] / 100;
        portfolioReturn += allocation * randomReturns[i];
      });
      
      returns.push(portfolioReturn);
    }
    
    // 수익률 정렬
    returns.sort((a, b) => a - b);
    
    // VaR 계산
    const varIndex = Math.floor((1 - confidence) * simulations);
    const var1Day = -returns[varIndex] * portfolioValue;
    const var1Week = var1Day * Math.sqrt(7);
    const var1Month = var1Day * Math.sqrt(30);
    
    // Expected Shortfall (조건부 VaR)
    const tailReturns = returns.slice(0, varIndex);
    const expectedShortfall = tailReturns.length > 0 
      ? -tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length * portfolioValue
      : 0;

    results.push({
      confidence,
      var1Day,
      var1Week,
      var1Month,
      expectedShortfall,
      worstCase: -returns[0] * portfolioValue,
      bestCase: -returns[returns.length - 1] * portfolioValue
    });
  });

  return results;
}

// 상관관계를 고려한 랜덤 수익률 생성
function generateCorrelatedReturns(assets: Asset[], correlationMatrix: number[][]): number[] {
  const n = assets.length;
  const independentReturns: number[] = [];
  
  // 독립적인 정규분포 수익률 생성
  for (let i = 0; i < n; i++) {
    const asset = assets[i];
    let expectedReturn = 0;
    let volatility = 0;
    
    // 자산별 예상 수익률과 변동성
    if (asset.type === 'crypto') {
      expectedReturn = 0.001; // 일일 0.1%
      volatility = 0.06; // 일일 6%
    } else if (asset.sector?.includes('Technology')) {
      expectedReturn = 0.0008;
      volatility = 0.025;
    } else if (asset.sector?.includes('Bonds')) {
      expectedReturn = 0.0002;
      volatility = 0.005;
    } else {
      expectedReturn = 0.0005;
      volatility = 0.02;
    }
    
    // Box-Muller 변환으로 정규분포 생성
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    independentReturns.push(expectedReturn + volatility * z);
  }
  
  // 콜레스키 분해를 통한 상관관계 적용 (단순화된 버전)
  const correlatedReturns: number[] = [...independentReturns];
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      const correlation = correlationMatrix[i][j];
      correlatedReturns[i] += correlation * 0.3 * independentReturns[j];
    }
  }
  
  return correlatedReturns;
}

// 스트레스 테스트
export function performStressTest(
  assets: Asset[],
  allocations: Record<string, number>,
  portfolioValue: number
): StressTestResult {
  const scenarios: StressTestScenario[] = [
    {
      name: '2008 글로벌 금융위기',
      description: '주식 -37%, 채권 +5%, 금 +5%, 암호화폐 -80%',
      marketShock: -0.2,
      sectorShocks: {
        'Technology': -0.45,
        'Healthcare': -0.25,
        'Financial': -0.55,
        'Bonds': 0.05,
        'Precious Metals': 0.05,
        'Crypto': -0.8
      },
      result: 0,
      probability: 0.02
    },
    {
      name: '2020 코로나19 팬데믹',
      description: '주식 -34%, 기술주 +15%, 암호화폐 -50%',
      marketShock: -0.15,
      sectorShocks: {
        'Technology': 0.15,
        'Healthcare': -0.1,
        'Travel': -0.7,
        'Energy': -0.5,
        'Bonds': 0.08,
        'Crypto': -0.5
      },
      result: 0,
      probability: 0.05
    },
    {
      name: '급격한 금리 인상',
      description: '금리 3%p 상승, 채권 -15%, 성장주 -25%',
      marketShock: -0.1,
      sectorShocks: {
        'Technology': -0.25,
        'Real Estate': -0.3,
        'Bonds': -0.15,
        'Precious Metals': -0.1,
        'Financial': 0.1
      },
      result: 0,
      probability: 0.15
    },
    {
      name: '인플레이션 급등',
      description: '인플레이션 8%, 금 +20%, 채권 -10%',
      marketShock: -0.05,
      sectorShocks: {
        'Precious Metals': 0.2,
        'Energy': 0.15,
        'Bonds': -0.1,
        'Technology': -0.15,
        'Consumer': -0.08
      },
      result: 0,
      probability: 0.1
    },
    {
      name: '암호화폐 붕괴',
      description: '주요 암호화폐 -90%, 연관 기술주 -20%',
      marketShock: -0.02,
      sectorShocks: {
        'Crypto': -0.9,
        'Technology': -0.2,
        'Financial': -0.1
      },
      result: 0,
      probability: 0.08
    }
  ];

  // 각 시나리오별 포트폴리오 영향 계산
  scenarios.forEach(scenario => {
    let portfolioLoss = 0;
    
    assets.forEach(asset => {
      const allocation = allocations[asset.ticker] / 100;
      const assetValue = allocation * portfolioValue;
      
      let assetShock = scenario.marketShock;
      
      // 섹터별 충격 적용
      if (asset.type === 'crypto') {
        assetShock = scenario.sectorShocks['Crypto'] || scenario.marketShock;
      } else {
        assetShock = scenario.sectorShocks[asset.sector] || scenario.marketShock;
      }
      
      portfolioLoss += assetValue * assetShock;
    });
    
    scenario.result = portfolioLoss;
  });

  // 포트폴리오 회복력 계산
  const averageLoss = scenarios.reduce((sum, s) => sum + Math.abs(s.result), 0) / scenarios.length;
  const maxLoss = Math.min(...scenarios.map(s => s.result));
  
  const resilience = Math.max(0, 100 - (Math.abs(maxLoss) / portfolioValue * 100));
  
  let riskRating: 'Low' | 'Medium' | 'High' | 'Very High';
  if (resilience > 80) riskRating = 'Low';
  else if (resilience > 60) riskRating = 'Medium';
  else if (resilience > 40) riskRating = 'High';
  else riskRating = 'Very High';

  return {
    scenarios: scenarios.sort((a, b) => a.result - b.result),
    portfolioResilience: resilience,
    riskRating
  };
}

// 위험 분산 효과 계산
export function calculateDiversificationEffect(
  assets: Asset[],
  allocations: Record<string, number>
): {
  herfindahlIndex: number;
  effectiveAssets: number;
  concentrationRisk: 'Low' | 'Medium' | 'High';
  recommendations: string[];
} {
  // 허핀달-허시만 지수 (HHI) 계산
  const hhi = assets.reduce((sum, asset) => {
    const allocation = allocations[asset.ticker] / 100;
    return sum + allocation * allocation;
  }, 0);

  // 유효 자산 수
  const effectiveAssets = 1 / hhi;

  // 집중도 위험 평가
  let concentrationRisk: 'Low' | 'Medium' | 'High';
  if (hhi < 0.15) concentrationRisk = 'Low';
  else if (hhi < 0.25) concentrationRisk = 'Medium';
  else concentrationRisk = 'High';

  // 추천사항
  const recommendations: string[] = [];
  
  if (hhi > 0.25) {
    recommendations.push('포트폴리오가 과도하게 집중되어 있습니다. 분산투자를 고려해보세요.');
  }
  
  const maxAllocation = Math.max(...assets.map(asset => allocations[asset.ticker]));
  if (maxAllocation > 30) {
    recommendations.push('단일 자산 비중이 30%를 초과합니다. 위험 분산을 위해 비중을 줄여보세요.');
  }
  
  const cryptoAllocation = assets
    .filter(asset => asset.type === 'crypto')
    .reduce((sum, asset) => sum + allocations[asset.ticker], 0);
  if (cryptoAllocation > 20) {
    recommendations.push('암호화폐 비중이 높습니다. 변동성 위험을 고려해 비중을 조정해보세요.');
  }

  return {
    herfindahlIndex: hhi,
    effectiveAssets,
    concentrationRisk,
    recommendations
  };
}

export type {
  VolatilityAnalysis,
  CorrelationMatrix,
  VaRResult,
  StressTestScenario,
  StressTestResult
};