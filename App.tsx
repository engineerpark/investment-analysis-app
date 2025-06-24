import React, { useState, useEffect } from "react";
import HomeScreen from "./components/HomeScreen";
import InvestmentSurvey from "./components/InvestmentSurvey";
import PortfolioRecommendation from "./components/PortfolioRecommendation";
import PortfolioAnalysis from "./components/PortfolioAnalysis";
import PortfolioDashboard from "./components/PortfolioDashboard";
import PortfolioListScreen from "./components/PortfolioListScreen";
import AdvancedPerformanceAnalysis from "./components/AdvancedPerformanceAnalysis";
import RiskManagement from "./components/RiskManagement";
import BacktestingScreen from "./components/BacktestingScreen";
import FuturePredictionScreen from "./components/FuturePredictionScreen";
import EducationCenter from "./components/EducationCenter";
import PersonalizedRecommendations from "./components/PersonalizedRecommendations";
import ExternalIntegrations from "./components/ExternalIntegrations";
import ApiStatus from "./components/ApiStatus";
import { initializeAPI } from "./utils/api_enhanced";
import type { Asset, InvestorProfile, InvestmentSettings, SavedPortfolio } from "./types/common";

export type { InvestorProfile } from "./types/common";

export default function App() {
  const [currentStep, setCurrentStep] = useState<
    | "home"
    | "survey"
    | "portfolio"
    | "analysis"
    | "dashboard"
    | "portfolioList"
    | "advancedAnalysis"
    | "riskManagement"
    | "backtesting"
    | "futurePrediction"
    | "education"
    | "recommendations"
    | "integrations"
    | "apiStatus"
  >("home");
  const [investorProfile, setInvestorProfile] =
    useState<InvestorProfile | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>(
    [],
  );
  const [allocations, setAllocations] = useState<
    Record<string, number>
  >({});
  const [investmentSettings, setInvestmentSettings] =
    useState<InvestmentSettings>({
      initialInvestment: 10000,
      rebalancingAmount: 1000,
      rebalancingPeriod: "monthly",
      exchangeRate: 1380,
    });
  const [savedPortfolios, setSavedPortfolios] = useState<
    SavedPortfolio[]
  >([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isViewingPublicPortfolio, setIsViewingPublicPortfolio] = useState(false);
  const [currentPortfolioAuthor, setCurrentPortfolioAuthor] = useState<{
    name: string;
    isVerified?: boolean;
  } | undefined>(undefined);

  // Initialize API system on app startup
  useEffect(() => {
    let isMounted = true;
    
    const initAPI = async () => {
      try {
        await initializeAPI();
      } catch (error) {
        if (isMounted) {
          console.error('Failed to initialize API system:', error);
        }
      }
    };
    
    initAPI();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartInvestmentSurvey = () => {
    setCurrentStep("survey");
  };

  const handleLogin = () => {
    // 로그인 처리 후 포트폴리오 목록으로 이동
    setIsLoggedIn(true);
    setCurrentStep("portfolioList");
  };

  const handleSurveyComplete = (profile: InvestorProfile) => {
    setInvestorProfile(profile);
    setCurrentStep("portfolio");
  };

  const handlePortfolioToAnalysis = (
    assets: Asset[],
    initialAllocations: Record<string, number>,
  ) => {
    setSelectedAssets(assets);
    setAllocations(initialAllocations);
    setCurrentStep("analysis");
  };

  const handleAnalysisToDashboard = (
    finalAllocations: Record<string, number>,
    settings?: InvestmentSettings,
  ) => {
    setAllocations(finalAllocations);
    if (settings) {
      setInvestmentSettings(settings);
    }
    setCurrentStep("dashboard");
  };

  const handleSavePortfolio = () => {
    // 포트폴리오 저장 후 목록으로 이동
    if (investorProfile && selectedAssets.length > 0) {
      const newPortfolio: SavedPortfolio = {
        id: `portfolio-${Date.now()}`,
        name: `${investorProfile.title} 포트폴리오`,
        investorProfile,
        assets: selectedAssets,
        allocations,
        totalValue: investmentSettings.initialInvestment,
        dailyChange: Math.random() * 1000 - 500, // 임시 데이터
        dailyChangePercent: (Math.random() - 0.5) * 4, // 임시 데이터
        createdDate: new Date().toISOString().split("T")[0],
      };

      setSavedPortfolios((prev) => [...prev, newPortfolio]);
      setCurrentStep("portfolioList");
    }
  };

  const handleSavePortfolioFromRecommendation = (
    assets: Asset[],
    allocationData: Record<string, number>
  ) => {
    // 포트폴리오 추천에서 바로 저장
    if (investorProfile && assets.length > 0) {
      setSelectedAssets(assets);
      setAllocations(allocationData);

      const newPortfolio: SavedPortfolio = {
        id: `portfolio-${Date.now()}`,
        name: `${investorProfile.title} 포트폴리오`,
        investorProfile,
        assets,
        allocations: allocationData,
        totalValue: investmentSettings.initialInvestment,
        dailyChange: Math.random() * 1000 - 500, // 임시 데이터
        dailyChangePercent: (Math.random() - 0.5) * 4, // 임시 데이터
        createdDate: new Date().toISOString().split("T")[0],
      };

      setSavedPortfolios((prev) => [...prev, newPortfolio]);
      setCurrentStep("portfolioList");
    }
  };

  const handleBackToHome = () => {
    setCurrentStep("home");
    setInvestorProfile(null);
    setSelectedAssets([]);
    setAllocations({});
    setInvestmentSettings({
      initialInvestment: 10000,
      rebalancingAmount: 1000,
      rebalancingPeriod: "monthly",
      exchangeRate: 1380,
    });
  };

  const handleBackToSurvey = () => {
    setCurrentStep("survey");
    setInvestorProfile(null);
    setSelectedAssets([]);
    setAllocations({});
    setInvestmentSettings({
      initialInvestment: 10000,
      rebalancingAmount: 1000,
      rebalancingPeriod: "monthly",
      exchangeRate: 1380,
    });
  };

  const handleBackToPortfolio = () => {
    setCurrentStep("portfolio");
  };

  const handleBackToAnalysis = () => {
    setCurrentStep("analysis");
  };

  const handleEditPortfolio = () => {
    setCurrentStep("analysis");
  };

  const handleNewPortfolio = () => {
    setCurrentStep("survey");
    setInvestorProfile(null);
    setSelectedAssets([]);
    setAllocations({});
    setInvestmentSettings({
      initialInvestment: 10000,
      rebalancingAmount: 1000,
      rebalancingPeriod: "monthly",
      exchangeRate: 1380,
    });
    setIsViewingPublicPortfolio(false);
    setCurrentPortfolioAuthor(undefined);
  };

  const handleBackToPortfolioList = () => {
    setCurrentStep("portfolioList");
    setIsViewingPublicPortfolio(false);
    setCurrentPortfolioAuthor(undefined);
  };

  const handleViewPortfolioFromList = (
    portfolio: SavedPortfolio,
  ) => {
    // 선택한 포트폴리오 정보로 상태 업데이트
    setInvestorProfile(portfolio.investorProfile);
    setSelectedAssets(portfolio.assets);
    setAllocations(portfolio.allocations);
    
    // 공개 포트폴리오인지 확인 (author가 있으면 공개 포트폴리오)
    const isPublic = !!portfolio.author;
    setIsViewingPublicPortfolio(isPublic);
    setCurrentPortfolioAuthor(portfolio.author);
    
    setCurrentStep("dashboard");
  };

  const handleAdvancedAnalysis = () => {
    setCurrentStep("advancedAnalysis");
  };

  const handleRiskManagement = () => {
    setCurrentStep("riskManagement");
  };

  const handleBacktesting = () => {
    setCurrentStep("backtesting");
  };

  const handleFuturePrediction = () => {
    setCurrentStep("futurePrediction");
  };

  const handleEducationCenter = () => {
    setCurrentStep("education");
  };

  const handlePersonalizedRecommendations = () => {
    setCurrentStep("recommendations");
  };

  const handleExternalIntegrations = () => {
    setCurrentStep("integrations");
  };

  const handleApiStatus = () => {
    setCurrentStep("apiStatus");
  };


  const handleBackToDashboard = () => {
    setCurrentStep("dashboard");
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 py-4">
      <div
        className="bg-white shadow-lg overflow-hidden rounded-lg responsive-container"
      >
        {currentStep === "home" ? (
          <HomeScreen
            onStartInvestmentSurvey={
              handleStartInvestmentSurvey
            }
            onLogin={handleLogin}
          />
        ) : currentStep === "portfolioList" ? (
          <PortfolioListScreen
            onBack={handleBackToHome}
            onCreateNew={handleNewPortfolio}
            onViewPortfolio={handleViewPortfolioFromList}
            currentUserPortfolios={savedPortfolios}
            onEducationCenter={handleEducationCenter}
            onPersonalizedRecommendations={
              handlePersonalizedRecommendations
            }
            onExternalIntegrations={handleExternalIntegrations}
            onApiStatus={handleApiStatus}
          />
        ) : currentStep === "survey" ? (
          <InvestmentSurvey onComplete={handleSurveyComplete} onBack={handleBackToHome} />
        ) : currentStep === "portfolio" ? (
          <PortfolioRecommendation
            investorProfile={investorProfile!}
            onBack={handleBackToSurvey}
            onAnalyze={handlePortfolioToAnalysis}
            onSavePortfolio={handleSavePortfolioFromRecommendation}
          />
        ) : currentStep === "analysis" ? (
          <PortfolioAnalysis
            investorProfile={investorProfile!}
            selectedAssets={selectedAssets}
            initialAllocations={allocations}
            onBack={handleBackToPortfolio}
            onSave={handleAnalysisToDashboard}
          />
        ) : currentStep === "advancedAnalysis" ? (
          <AdvancedPerformanceAnalysis
            assets={selectedAssets}
            allocations={allocations}
            initialInvestment={
              investmentSettings.initialInvestment
            }
            onBack={handleBackToDashboard}
          />
        ) : currentStep === "riskManagement" ? (
          <RiskManagement
            assets={selectedAssets}
            allocations={allocations}
            initialInvestment={
              investmentSettings.initialInvestment
            }
            onBack={handleBackToDashboard}
          />
        ) : currentStep === "backtesting" ? (
          <BacktestingScreen
            investorProfile={investorProfile!}
            selectedAssets={selectedAssets}
            allocations={allocations}
            investmentSettings={investmentSettings}
            onBack={handleBackToDashboard}
          />
        ) : currentStep === "futurePrediction" ? (
          <FuturePredictionScreen
            investorProfile={investorProfile!}
            selectedAssets={selectedAssets}
            allocations={allocations}
            investmentSettings={investmentSettings}
            onBack={handleBackToDashboard}
          />
        ) : currentStep === "education" ? (
          <EducationCenter onBack={handleBackToPortfolioList} />
        ) : currentStep === "recommendations" ? (
          <PersonalizedRecommendations
            onBack={handleBackToPortfolioList}
            investorProfile={investorProfile || undefined}
          />
        ) : currentStep === "integrations" ? (
          <ExternalIntegrations
            onBack={handleBackToPortfolioList}
          />
        ) : currentStep === "apiStatus" ? (
          <ApiStatus
            onClose={handleBackToPortfolioList}
          />
        ) : (
          <PortfolioDashboard
            investorProfile={investorProfile!}
            selectedAssets={selectedAssets}
            allocations={allocations}
            investmentSettings={investmentSettings}
            onBack={
              isLoggedIn
                ? handleBackToPortfolioList
                : handleBackToAnalysis
            }
            onEdit={handleEditPortfolio}
            onNewPortfolio={handleSavePortfolio}
            onAdvancedAnalysis={handleAdvancedAnalysis}
            onRiskManagement={handleRiskManagement}
            onBacktesting={handleBacktesting}
            onFuturePrediction={handleFuturePrediction}
            isPublicView={isViewingPublicPortfolio}
            portfolioAuthor={currentPortfolioAuthor}
          />
        )}
      </div>
    </div>
  );
}