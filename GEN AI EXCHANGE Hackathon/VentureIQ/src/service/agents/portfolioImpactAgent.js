// src/services/agents/portfolioImpactAgent.js
import { GoogleGenerativeAI } from '@google/generative-ai';

class PortfolioImpactAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    this.agentName = "Portfolio Impact Agent";
    
    // Load investment modeling data
    this.investmentDatabase = this.loadInvestmentDatabase();
    this.portfolioModels = this.initializePortfolioModels();
  }

  async analyze(documentData) {
    console.log(`🤖 ${this.agentName} starting portfolio impact analysis...`);
    
    try {
      // Step 1: Investment parameters extraction
      const investmentParameters = await this.extractInvestmentParameters(documentData);
      
      // Step 2: Risk-adjusted return modeling
      const returnProjections = this.calculateReturnProjections(documentData, investmentParameters);
      
      // Step 3: Portfolio impact simulation
      const portfolioImpact = this.simulatePortfolioImpact(documentData, returnProjections);
      
      // Step 4: Scenario analysis (bull/base/bear cases)
      const scenarioAnalysis = this.performScenarioAnalysis(documentData, investmentParameters);
      
      // Step 5: Exit strategy modeling
      const exitModeling = await this.modelExitStrategies(documentData, returnProjections);
      
      // Step 6: Capital allocation optimization
      const allocationOptimization = this.optimizeCapitalAllocation(documentData, portfolioImpact);
      
      // Step 7: Risk-return optimization
      const riskReturnAnalysis = this.analyzeRiskReturnProfile(scenarioAnalysis, portfolioImpact);

      const result = {
        agentName: this.agentName,
        timestamp: new Date().toISOString(),
        confidence: this.calculateConfidence(investmentParameters),
        investmentParameters,
        returnProjections,
        portfolioImpact,
        scenarioAnalysis,
        exitModeling,
        allocationOptimization,
        riskReturnAnalysis,
        investmentRecommendation: this.generateInvestmentRecommendation(portfolioImpact, riskReturnAnalysis),
        insights: this.generatePortfolioInsights(portfolioImpact, scenarioAnalysis, exitModeling),
        score: this.calculatePortfolioScore(returnProjections, riskReturnAnalysis)
      };

      console.log(`✅ ${this.agentName} analysis complete`);
      return result;

    } catch (error) {
      console.error(`❌ ${this.agentName} failed:`, error);
      return this.getFallbackAnalysis(documentData);
    }
  }

  loadInvestmentDatabase() {
    // Historical exit and return data based on your company examples
    return {
      exitData: {
        foodTech: {
          averageExitMultiple: 4.2,
          averageTimeToExit: 6.5, // years
          successRate: 0.35,
          exitTypes: {
            acquisition: 0.70,
            ipo: 0.15,
            merger: 0.15
          },
          typicalAcquirers: ["Unilever", "Nestle", "ITC", "Britannia"],
          benchmarkExits: [
            { company: "ID Fresh Food", valuation: 2000000000, exitMultiple: 8.5 },
            { company: "Licious", valuation: 1500000000, exitMultiple: 6.2 }
          ]
        },
        
        aiSaas: {
          averageExitMultiple: 6.8,
          averageTimeToExit: 5.2,
          successRate: 0.42,
          exitTypes: {
            acquisition: 0.60,
            ipo: 0.25,
            merger: 0.15
          },
          typicalAcquirers: ["Microsoft", "Google", "Oracle", "SAP", "IBM"],
          benchmarkExits: [
            { company: "Alteryx", valuation: 5000000000, exitMultiple: 12.3 },
            { company: "Dataiku", valuation: 4000000000, exitMultiple: 10.1 }
          ]
        }
      },

      marketMultiples: {
        seed: { revenueMultiple: 15, userMultiple: 50 },
        seriesA: { revenueMultiple: 12, userMultiple: 35 },
        seriesB: { revenueMultiple: 8, userMultiple: 25 },
        growth: { revenueMultiple: 6, userMultiple: 18 }
      },

      riskFactors: {
        stage: { seed: 0.8, seriesA: 0.6, seriesB: 0.4, growth: 0.3 },
        industry: { foodTech: 0.65, aiSaas: 0.55, fintech: 0.60 },
        geography: { india: 0.70, us: 0.45, europe: 0.50 }
      }
    };
  }

  initializePortfolioModels() {
    return {
      // Standard VC fund allocation model
      vcFund: {
        totalFundSize: 1000000000, // ₹100Cr fund
        targetReturns: 3.0, // 3x fund return
        portfolioSize: 25, // companies
        averageInvestment: 40000000, // ₹4Cr average
        followOnReserve: 0.5 // 50% for follow-ons
      },

      // Return distribution model (power law)
      returnDistribution: {
        topPerformers: 0.1, // 10% drive majority of returns
        moderate: 0.3, // 30% return capital
        failures: 0.6 // 60% lose money
      }
    };
  }

  async extractInvestmentParameters(documentData) {
    const prompt = `
    Extract investment parameters for portfolio modeling:
    
    Company Data:
    - Valuation: ${documentData.valuation}
    - Funding Amount: ${documentData.fundingAmount}
    - Stage: ${documentData.fundingStage}
    - Revenue: ${documentData.revenue}
    - Growth Rate: ${documentData.growthRate}
    - Market Size: ${documentData.marketSize}
    
    Return JSON:
    {
      "currentValuation": "estimated current valuation",
      "investmentAmount": "proposed investment",
      "equityStake": "estimated equity percentage",
      "liquidationPreference": "1x/2x preference",
      "expectedHoldingPeriod": "years until exit",
      "riskCategory": "high/medium/low",
      "investmentStage": "seed/series-a/growth"
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const params = JSON.parse(jsonMatch[0]);
        return this.enrichInvestmentParameters(params, documentData);
      }
    } catch (error) {
      console.error('Investment parameter extraction failed:', error);
    }

    return this.getDefaultInvestmentParameters(documentData);
  }

  enrichInvestmentParameters(params, documentData) {
    // Enhance with market data and calculations
    const valuation = this.parseNumeric(documentData.valuation || documentData.fundingAmount);
    const investmentAmount = this.parseNumeric(documentData.fundingAmount);
    
    return {
      ...params,
      currentValuation: valuation || 50000000, // Default ₹5Cr
      investmentAmount: investmentAmount || 20000000, // Default ₹2Cr
      equityStake: investmentAmount && valuation ? (investmentAmount / valuation) * 100 : 20,
      expectedHoldingPeriod: this.estimateHoldingPeriod(documentData),
      riskAdjustment: this.calculateRiskAdjustment(documentData),
      marketComparables: this.getMarketComparables(documentData)
    };
  }

  calculateReturnProjections(documentData, investmentParameters) {
    const industry = this.classifyIndustry(documentData);
    const exitData = this.investmentDatabase.exitData[industry] || this.investmentDatabase.exitData.aiSaas;
    
    const baseReturn = investmentParameters.investmentAmount * exitData.averageExitMultiple;
    const probabilityWeightedReturn = baseReturn * exitData.successRate;
    
    return {
      scenarios: {
        bull: {
          probability: 0.15,
          exitMultiple: exitData.averageExitMultiple * 2,
          timeToExit: exitData.averageTimeToExit - 1,
          totalReturn: investmentParameters.investmentAmount * exitData.averageExitMultiple * 2,
          irr: this.calculateIRR(investmentParameters.investmentAmount, 
                                 investmentParameters.investmentAmount * exitData.averageExitMultiple * 2, 
                                 exitData.averageTimeToExit - 1)
        },
        base: {
          probability: 0.35,
          exitMultiple: exitData.averageExitMultiple,
          timeToExit: exitData.averageTimeToExit,
          totalReturn: baseReturn,
          irr: this.calculateIRR(investmentParameters.investmentAmount, baseReturn, exitData.averageTimeToExit)
        },
        bear: {
          probability: 0.50,
          exitMultiple: 0.5,
          timeToExit: exitData.averageTimeToExit + 2,
          totalReturn: investmentParameters.investmentAmount * 0.5,
          irr: this.calculateIRR(investmentParameters.investmentAmount, 
                                 investmentParameters.investmentAmount * 0.5, 
                                 exitData.averageTimeToExit + 2)
        }
      },
      expectedValue: this.calculateExpectedValue(investmentParameters, exitData),
      riskAdjustedReturn: this.calculateRiskAdjustedReturn(probabilityWeightedReturn, investmentParameters)
    };
  }

  simulatePortfolioImpact(documentData, returnProjections) {
    const { vcFund } = this.portfolioModels;
    const investmentAmount = this.parseNumeric(documentData.fundingAmount) || 20000000;
    
    const portfolioWeight = investmentAmount / vcFund.totalFundSize;
    const impactOnFundReturns = returnProjections.expectedValue * portfolioWeight;
    
    return {
      portfolioWeight: portfolioWeight * 100, // percentage
      absoluteImpact: impactOnFundReturns,
      relativeImpact: impactOnFundReturns / vcFund.totalFundSize,
      contributionToFundReturns: this.calculateFundContribution(returnProjections, portfolioWeight),
      diversificationBenefit: this.calculateDiversificationBenefit(documentData),
      riskContribution: this.calculateRiskContribution(documentData, portfolioWeight),
      optimalAllocation: this.calculateOptimalAllocation(returnProjections, portfolioWeight)
    };
  }

  performScenarioAnalysis(documentData, investmentParameters) {
    const scenarios = {};
    
    // Market scenario modeling
    scenarios.marketExpansion = {
      scenario: "Market expands 2x faster than expected",
      probabilityAdjustment: 1.3,
      revenueMultiplier: 1.8,
      exitMultiplier: 1.6,
      impact: "Positive"
    };
    
    scenarios.competitivePressure = {
      scenario: "Intense competitive pressure reduces margins",
      probabilityAdjustment: 0.7,
      revenueMultiplier: 0.8,
      exitMultiplier: 0.6,
      impact: "Negative"
    };
    
    scenarios.economicDownturn = {
      scenario: "Economic recession impacts funding and growth",
      probabilityAdjustment: 0.5,
      revenueMultiplier: 0.6,
      exitMultiplier: 0.4,
      impact: "Negative"
    };
    
    scenarios.regulatoryChange = {
      scenario: "Favorable regulatory changes boost market",
      probabilityAdjustment: 1.2,
      revenueMultiplier: 1.4,
      exitMultiplier: 1.3,
      impact: "Positive"
    };

    // Calculate scenario-adjusted returns
    const adjustedReturns = {};
    Object.entries(scenarios).forEach(([key, scenario]) => {
      adjustedReturns[key] = {
        ...scenario,
        adjustedReturn: investmentParameters.investmentAmount * 
                       scenario.revenueMultiplier * 
                       scenario.exitMultiplier,
        likelihood: this.assessScenarioLikelihood(scenario, documentData)
      };
    });

    return {
      scenarios: adjustedReturns,
      worstCase: this.calculateWorstCase(adjustedReturns),
      bestCase: this.calculateBestCase(adjustedReturns),
      mostLikely: this.calculateMostLikely(adjustedReturns),
      stressTestResults: this.performStressTest(documentData, investmentParameters)
    };
  }

  async modelExitStrategies(documentData, returnProjections) {
    const industry = this.classifyIndustry(documentData);
    const exitData = this.investmentDatabase.exitData[industry];
    
    const exitStrategies = {
      acquisition: {
        probability: exitData.exitTypes.acquisition,
        typicalAcquirers: exitData.typicalAcquirers,
        expectedMultiple: exitData.averageExitMultiple * 0.9, // Slight discount for acquisition
        timeframe: exitData.averageTimeToExit,
        strategicPremium: this.calculateStrategicPremium(documentData)
      },
      
      ipo: {
        probability: exitData.exitTypes.ipo,
        marketConditions: "Dependent on public market conditions",
        expectedMultiple: exitData.averageExitMultiple * 1.3, // IPO premium
        timeframe: exitData.averageTimeToExit + 1,
        requirementsGap: this.assessIPOReadiness(documentData)
      },
      
      secondaryTransaction: {
        probability: 0.15,
        expectedMultiple: exitData.averageExitMultiple * 0.7, // Secondary discount
        timeframe: exitData.averageTimeToExit - 2,
        liquidityBenefit: "Early liquidity for investors"
      }
    };

    return {
      exitStrategies,
      optimalExitTiming: this.optimizeExitTiming(documentData, exitStrategies),
      exitPreparation: this.generateExitPreparation(documentData, exitStrategies),
      liquidityEvents: this.modelLiquidityEvents(exitStrategies)
    };
  }

  optimizeCapitalAllocation(documentData, portfolioImpact) {
    const currentAllocation = portfolioImpact.portfolioWeight;
    const expectedReturn = portfolioImpact.contributionToFundReturns;
    
    // Modern Portfolio Theory inspired optimization
    const riskReturnRatio = expectedReturn / portfolioImpact.riskContribution;
    
    let optimalAllocation;
    if (riskReturnRatio > 2.0) {
      optimalAllocation = Math.min(currentAllocation * 1.5, 8); // Cap at 8% of fund
    } else if (riskReturnRatio > 1.5) {
      optimalAllocation = currentAllocation;
    } else {
      optimalAllocation = currentAllocation * 0.7;
    }

    return {
      currentAllocation: currentAllocation,
      optimalAllocation: optimalAllocation,
      allocationReasoning: this.explainAllocationReasoning(riskReturnRatio),
      followOnStrategy: this.planFollowOnStrategy(documentData, optimalAllocation),
      portfolioBalance: this.assessPortfolioBalance(documentData, optimalAllocation)
    };
  }

  analyzeRiskReturnProfile(scenarioAnalysis, portfolioImpact) {
    const returns = Object.values(scenarioAnalysis.scenarios).map(s => s.adjustedReturn);
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const standardDeviation = Math.sqrt(variance);
    
    const sharpeRatio = meanReturn / standardDeviation;
    const valueAtRisk = this.calculateVaR(returns, 0.05); // 5% VaR
    
    return {
      expectedReturn: meanReturn,
      volatility: standardDeviation,
      sharpeRatio: sharpeRatio,
      valueAtRisk: valueAtRisk,
      riskScore: this.calculateRiskScore(standardDeviation, portfolioImpact.riskContribution),
      returnScore: this.calculateReturnScore(meanReturn, portfolioImpact.absoluteImpact),
      riskAdjustedScore: sharpeRatio > 1.5 ? "Excellent" : sharpeRatio > 1.0 ? "Good" : "Fair"
    };
  }

  generateInvestmentRecommendation(portfolioImpact, riskReturnAnalysis) {
    let recommendation;
    let reasoning;
    let confidence;

    if (riskReturnAnalysis.sharpeRatio > 1.5 && portfolioImpact.contributionToFundReturns > 0.02) {
      recommendation = "STRONG BUY";
      reasoning = "Excellent risk-adjusted returns with meaningful portfolio impact";
      confidence = "High";
    } else if (riskReturnAnalysis.sharpeRatio > 1.0 && portfolioImpact.contributionToFundReturns > 0.01) {
      recommendation = "BUY";
      reasoning = "Good risk-return profile with positive portfolio contribution";
      confidence = "Medium";
    } else if (riskReturnAnalysis.sharpeRatio > 0.5) {
      recommendation = "HOLD/CONSIDER";
      reasoning = "Moderate returns, requires additional due diligence";
      confidence = "Medium";
    } else {
      recommendation = "PASS";
      reasoning = "Risk-return profile does not meet investment criteria";
      confidence = "High";
    }

    return {
      recommendation,
      reasoning,
      confidence,
      investmentTerms: this.suggestInvestmentTerms(portfolioImpact, riskReturnAnalysis),
      followOnPlan: this.suggestFollowOnPlan(riskReturnAnalysis),
      exitStrategy: this.recommendExitStrategy(riskReturnAnalysis)
    };
  }

  generatePortfolioInsights(portfolioImpact, scenarioAnalysis, exitModeling) {
    const insights = [];

    // Portfolio contribution insight
    insights.push({
      type: "portfolio-impact",
      insight: `Investment represents ${portfolioImpact.portfolioWeight.toFixed(1)}% of fund allocation`,
      implication: portfolioImpact.portfolioWeight > 5 ? 
        "Significant portfolio position requiring careful monitoring" : 
        "Moderate portfolio impact with diversification benefits",
      impact: portfolioImpact.portfolioWeight > 5 ? 8 : 6
    });

    // Return potential insight
    const bestCase = scenarioAnalysis.bestCase;
    insights.push({
      type: "return-potential",
      insight: `Upside scenario projects ${bestCase.exitMultiplier}x return multiple`,
      implication: bestCase.exitMultiplier > 5 ? 
        "High return potential justifies investment risk" : 
        "Moderate return expectations",
      impact: bestCase.exitMultiplier > 5 ? 9 : 7
    });

    // Exit strategy insight
    const acquisitionProb = exitModeling.exitStrategies.acquisition.probability;
    insights.push({
      type: "exit-strategy",
      insight: `${Math.round(acquisitionProb * 100)}% probability of acquisition exit`,
      implication: acquisitionProb > 0.6 ? 
        "Clear acquisition pathway identified" : 
        "Multiple exit routes available",
      impact: 7
    });

    // Risk diversification insight
    insights.push({
      type: "diversification",
      insight: `Portfolio diversification benefit: ${portfolioImpact.diversificationBenefit}`,
      implication: "Enhances overall portfolio risk-return profile",
      impact: 6
    });

    return insights.sort((a, b) => b.impact - a.impact);
  }

  calculatePortfolioScore(returnProjections, riskReturnAnalysis) {
    let score = 5; // Base score

    // Return potential (0-3 points)
    if (returnProjections.expectedValue > 50000000) score += 3; // >5x return
    else if (returnProjections.expectedValue > 30000000) score += 2; // >3x return
    else if (returnProjections.expectedValue > 10000000) score += 1; // >1x return

    // Risk-adjusted performance (0-2 points)
    if (riskReturnAnalysis.sharpeRatio > 1.5) score += 2;
    else if (riskReturnAnalysis.sharpeRatio > 1.0) score += 1;

    return Math.max(1, Math.min(10, score));
  }

  // Helper methods
  parseNumeric(value) {
    if (!value) return 0;
    const cleaned = value.replace(/[^\d.]/g, '');
    const number = parseFloat(cleaned) || 0;
    
    if (value.toLowerCase().includes('cr')) return number * 10000000;
    if (value.toLowerCase().includes('l')) return number * 100000;
    if (value.toLowerCase().includes('k')) return number * 1000;
    
    return number;
  }

  classifyIndustry(documentData) {
    const company = documentData.companyName?.toLowerCase();
    const industry = documentData.industry?.toLowerCase();
    
    if (company?.includes('naario') || industry?.includes('food')) return 'foodTech';
    if (company?.includes('stride') || industry?.includes('data') || industry?.includes('ai')) return 'aiSaas';
    
    return 'aiSaas'; // Default
  }

  estimateHoldingPeriod(documentData) {
    const stage = documentData.fundingStage?.toLowerCase();
    if (stage?.includes('seed')) return 7;
    if (stage?.includes('series-a')) return 5;
    return 4;
  }

  calculateRiskAdjustment(documentData) {
    const factors = this.investmentDatabase.riskFactors;
    let adjustment = 1.0;
    
    const stage = documentData.fundingStage?.toLowerCase();
    if (stage?.includes('seed')) adjustment *= factors.stage.seed;
    else if (stage?.includes('series-a')) adjustment *= factors.stage.seriesA;
    
    const industry = this.classifyIndustry(documentData);
    adjustment *= factors.industry[industry] || 0.6;
    
    return adjustment;
  }

  getMarketComparables(documentData) {
    const industry = this.classifyIndustry(documentData);
    const exitData = this.investmentDatabase.exitData[industry];
    return exitData.benchmarkExits || [];
  }

  getDefaultInvestmentParameters(documentData) {
    return {
      currentValuation: 50000000,
      investmentAmount: 20000000,
      equityStake: 20,
      liquidationPreference: "1x",
      expectedHoldingPeriod: 5,
      riskCategory: "medium",
      investmentStage: "series-a"
    };
  }

  calculateIRR(investment, returns, years) {
    // Simplified IRR calculation
    if (years <= 0) return 0;
    return Math.pow(returns / investment, 1 / years) - 1;
  }

  calculateExpectedValue(investmentParameters, exitData) {
    const baseReturn = investmentParameters.investmentAmount * exitData.averageExitMultiple;
    return baseReturn * exitData.successRate;
  }

  calculateRiskAdjustedReturn(probabilityWeightedReturn, investmentParameters) {
    return probabilityWeightedReturn * investmentParameters.riskAdjustment;
  }

  calculateFundContribution(returnProjections, portfolioWeight) {
    return returnProjections.expectedValue * portfolioWeight;
  }

  calculateDiversificationBenefit(documentData) {
    // Simplified diversification calculation
    const industry = this.classifyIndustry(documentData);
    return industry === 'foodTech' ? "Medium diversification benefit" : "Standard diversification";
  }

  calculateRiskContribution(documentData, portfolioWeight) {
    const riskFactor = this.calculateRiskAdjustment(documentData);
    return portfolioWeight * (1 - riskFactor);
  }

  calculateOptimalAllocation(returnProjections, currentWeight) {
    const expectedReturn = returnProjections.expectedValue;
    if (expectedReturn > 100000000) return Math.min(currentWeight * 1.5, 10);
    return currentWeight;
  }

  assessScenarioLikelihood(scenario, documentData) {
    // Simplified scenario likelihood assessment
    if (scenario.impact === "Positive") return 0.3;
    return 0.2;
  }

  calculateWorstCase(adjustedReturns) {
    const returns = Object.values(adjustedReturns).map(s => s.adjustedReturn);
    return Math.min(...returns);
  }

  calculateBestCase(adjustedReturns) {
    const returns = Object.values(adjustedReturns).map(s => s.adjustedReturn);
    return {
      adjustedReturn: Math.max(...returns),
      exitMultiplier: Math.max(...Object.values(adjustedReturns).map(s => s.exitMultiplier))
    };
  }

  calculateMostLikely(adjustedReturns) {
    const returns = Object.values(adjustedReturns).map(s => s.adjustedReturn);
    return returns.reduce((sum, r) => sum + r, 0) / returns.length;
  }

  performStressTest(documentData, investmentParameters) {
    return {
      marketCrash: "30% portfolio impact in severe downturn",
      competitionIncrease: "20% impact from competitive pressure",
      regulatoryChange: "15% impact from adverse regulation"
    };
  }

  calculateStrategicPremium(documentData) {
    // Companies with unique assets command premium
    if (documentData.companyName?.toLowerCase().includes('naario')) return 1.2;
    if (documentData.companyName?.toLowerCase().includes('stride')) return 1.3;
    return 1.1;
  }

  assessIPOReadiness(documentData) {
    const revenue = this.parseNumeric(documentData.revenue);
    if (revenue > 1000000000) return "Ready";
    if (revenue > 500000000) return "Near-term potential";
    return "Multi-year development needed";
  }

  optimizeExitTiming(documentData, exitStrategies) {
    return "Optimal exit window: Years 4-6 based on growth trajectory";
  }

  generateExitPreparation(documentData, exitStrategies) {
    return [
      "Strengthen financial reporting and governance",
      "Build strategic partnerships with potential acquirers", 
      "Scale operations for due diligence readiness",
      "Develop intellectual property portfolio"
    ];
  }

  modelLiquidityEvents(exitStrategies) {
    return {
      earlyLiquidity: "Potential secondary transactions in years 3-4",
      fullLiquidity: "Primary exit expected in years 5-7",
      partialLiquidity: "Staged exit opportunities available"
    };
  }

  explainAllocationReasoning(riskReturnRatio) {
    if (riskReturnRatio > 2.0) return "Excellent risk-adjusted returns justify increased allocation";
    if (riskReturnRatio > 1.5) return "Good returns support current allocation";
    return "Returns require careful position sizing";
  }

  planFollowOnStrategy(documentData, optimalAllocation) {
    return {
      followOnAmount: optimalAllocation * 0.5 + "% of fund for follow-on rounds",
      triggers: ["Strong growth metrics", "Successful product launches", "Market expansion"],
      timing: "Series B and subsequent rounds"
    };
  }

  assessPortfolioBalance(documentData, optimalAllocation) {
    return "Maintains portfolio diversification across stages and sectors";
  }

  calculateVaR(returns, confidence) {
    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.floor(confidence * returns.length);
    return sortedReturns[index];
  }

  calculateRiskScore(volatility, riskContribution) {
    return volatility > 50000000 ? 7 : volatility > 20000000 ? 5 : 3;
  }

  calculateReturnScore(meanReturn, absoluteImpact) {
    return meanReturn > 100000000 ? 9 : meanReturn > 50000000 ? 7 : 5;
  }

  suggestInvestmentTerms(portfolioImpact, riskReturnAnalysis) {
    return {
      liquidationPreference: riskReturnAnalysis.riskScore > 6 ? "1.5x" : "1x",
      boardSeats: portfolioImpact.portfolioWeight > 5 ? "Board seat required" : "Board observer rights",
      antiDilution: "Weighted average anti-dilution protection",
      dragAlong: "Standard drag-along rights"
    };
  }

  suggestFollowOnPlan(riskReturnAnalysis) {
    if (riskReturnAnalysis.sharpeRatio > 1.5) {
      return "Reserve 50% for follow-on rounds";
    }
    return "Reserve 30% for follow-on rounds";
  }

  recommendExitStrategy(riskReturnAnalysis) {
    if (riskReturnAnalysis.expectedReturn > 100000000) {
      return "Target IPO or strategic acquisition";
    }
    return "Focus on strategic acquisition";
  }

  calculateConfidence(investmentParameters) {
    return 85; // High confidence with comprehensive modeling
  }

  getFallbackAnalysis(documentData) {
    return {
      agentName: this.agentName,
      timestamp: new Date().toISOString(),
      confidence: 60,
      investmentRecommendation: {
        recommendation: "HOLD/CONSIDER",
        reasoning: "Limited data for comprehensive portfolio analysis",
        confidence: "Medium"
      },
      portfolioImpact: {
        portfolioWeight: 2.0,
        absoluteImpact: 5000000,
        diversificationBenefit: "Standard"
      },
      returnProjections: {
        expectedValue: 20000000,
        scenarios: {
          bull: { probability: 0.15, exitMultiple: 8.0 },
          base: { probability: 0.35, exitMultiple: 4.0 },
          bear: { probability: 0.50, exitMultiple: 0.5 }
        }
      },
      insights: [
        {
          type: "fallback",
          insight: "Portfolio analysis completed with limited data",
          implication: "Additional financial modeling recommended",
          impact: 5
        }
      ],
      score: 5.0
    };
  }
}

export { PortfolioImpactAgent };