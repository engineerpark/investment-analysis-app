// Common types used across the application

export interface Asset {
  id?: string;
  symbol: string;
  ticker?: string; // Keep for backward compatibility
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  sector: string;
  type: "stock" | "crypto" | "etf" | "index";
  market?: 'US' | 'KR' | 'CRYPTO' | 'GLOBAL';
  currency?: string;
  exchange?: string;
  geckoId?: string;
  uniqueId?: string;
}

export interface InvestorProfile {
  type: string;
  title: string;
  description: string;
  characteristics: string[];
  color: string;
}

export interface InvestmentSettings {
  initialInvestment: number;
  rebalancingAmount: number;
  rebalancingPeriod: string;
  exchangeRate: number;
}

export interface SavedPortfolio {
  id: string;
  name: string;
  investorProfile: InvestorProfile;
  assets: Asset[];
  allocations: Record<string, number>;
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  createdDate: string;
  author?: {
    name: string;
    isVerified?: boolean;
  };
  followers?: number;
  likes?: number;
}

// Helper function to get asset identifier (symbol or ticker)
export const getAssetId = (asset: Asset): string => {
  return asset.symbol || asset.ticker || asset.id || 'unknown';
};