#!/bin/bash

# Vercel 환경 변수 설정 스크립트

echo "Setting up Vercel environment variables..."

# CoinGecko API Key
echo "CG-XDJgFHwfoyMMnxq5UuWfqvaw" | vercel env add COINGECKO_API_KEY production --yes

# Alpha Vantage API Key  
echo "W81KZ2JQNEQY76VG" | vercel env add ALPHA_VANTAGE_API_KEY production --yes

# Finnhub API Key
echo "csqh8bhr01qv3g2bb5dgcsqh8bhr01qv3g2bb5e0" | vercel env add NEXT_PUBLIC_FINNHUB_API_KEY production --yes

# Financial Modeling Prep API Key
echo "demo" | vercel env add NEXT_PUBLIC_FMP_API_KEY production --yes

# Alpaca Keys (placeholder)
echo "your_alpaca_api_key_here" | vercel env add NEXT_PUBLIC_ALPACA_API_KEY production --yes
echo "your_alpaca_secret_key_here" | vercel env add ALPACA_SECRET_KEY production --yes

echo "Environment variables setup completed!"