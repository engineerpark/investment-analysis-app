-- Investment Analysis App Database Schema
-- Execute this SQL in your Supabase investment-analysis project SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    age INTEGER,
    risk_tolerance TEXT NOT NULL CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
    investment_experience TEXT NOT NULL CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced')),
    investment_goals TEXT[] NOT NULL DEFAULT '{}',
    monthly_investment DECIMAL(12,2),
    investment_period INTEGER, -- in months
    financial_situation TEXT,
    preferred_sectors TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create portfolio_recommendations table
CREATE TABLE IF NOT EXISTS portfolio_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    recommendation_data JSONB NOT NULL,
    risk_score DECIMAL(5,2) NOT NULL,
    expected_return DECIMAL(5,2) NOT NULL,
    allocation_percentages JSONB NOT NULL,
    recommended_assets TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved_portfolios table  
CREATE TABLE IF NOT EXISTS saved_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    portfolio_name TEXT NOT NULL,
    portfolio_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    performance_data JSONB,
    last_rebalanced TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_recommendations_user_id ON portfolio_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_recommendations_created_at ON portfolio_recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_portfolios_user_id ON saved_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_portfolios_is_active ON saved_portfolios(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_portfolios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - adjust as needed)
-- Note: These policies allow all operations. In production, you should implement proper user authentication

-- User Profiles policies
CREATE POLICY "Allow all operations on user_profiles" ON user_profiles FOR ALL USING (true);

-- Portfolio Recommendations policies  
CREATE POLICY "Allow all operations on portfolio_recommendations" ON portfolio_recommendations FOR ALL USING (true);

-- Saved Portfolios policies
CREATE POLICY "Allow all operations on saved_portfolios" ON saved_portfolios FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolio_recommendations_updated_at BEFORE UPDATE ON portfolio_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_portfolios_updated_at BEFORE UPDATE ON saved_portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();