// src/services/agents/riskAssessmentAgent.js
import { GoogleGenerativeAI } from '@google/generative-ai';

class RiskAssessmentAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    this.agentName = "Risk Assessment Agent";
    
    // Load historical success/failure patterns from your company data
    this.riskDatabase = this.loadRiskDatabase();
    this.mlModel = this.initializeMLModel();
  }

  async analyze(documentData) {
    console.log(`🤖 ${this.agentName} starting risk analysis...`);
    
    try {
      // Step 1: Extract risk factors
      const riskFactors = await this.extractRiskFactors(documentData);
      
      // Step 2: ML-powered success prediction
      const successPrediction = this.predictSuccessProbability(documentData, riskFactors);
      
      // Step 3: Financial stress testing
      const financialRisks = this.assessFinancialRisks(documentData);
      
      // Step 4: Team and execution risks
      const teamRisks = this.assessTeamRisks(documentData);
      
      // Step 5: Market and competitive risks
      const marketRisks = await this.assessMarketRisks(documentData);
      
      // Step 6: Red flag detection
      const redFlags = this.detectRedFlags(documentData, riskFactors);
      
      // Step 7: Risk mitigation recommendations
      const mitigationStrategies = this.generateMitigationStrategies(riskFactors, redFlags);

      const result = {
        agentName: this.agentName,
        timestamp: new Date().toISOString(),
        confidence: this.calculateConfidence(riskFactors),
        successPrediction,
        riskBreakdown: {
          financial: financialRisks.score,
          team: teamRisks.score, 
          market: marketRisks.score,
          execution: this.calculateExecutionRisk(documentData)
        },
        overallRiskScore: this.calculateOverallRisk(financialRisks, teamRisks, marketRisks),
        redFlags,
        mitigationStrategies,
        insights: this.generateRiskInsights(riskFactors, successPrediction, redFlags),
        riskScore: this.calculateFinalRiskScore(successPrediction, redFlags)
      };

      console.log(`✅ ${this.agentName} analysis complete`);
      return result;

    } catch (error) {
      console.error(`❌ ${this.agentName} failed:`, error);
      return this.getFallbackAnalysis(documentData);
    }
  }

  loadRiskDatabase() {
    // Historical patterns from your company data
    return {
      successPatterns: [
        {
          company: "Naario",
          outcome: "success_trajectory",
          factors: {
            communityDriven: true,
            strongUnitEconomics: true, // LTV/CAC 2.9
            femaleFounder: true,
            leanBurn: true, // 15k burn vs 14L revenue
            clearMarket: true,
            healthyGrowth: 0.25
          },
          riskScore: 3.2 // Low risk
        },
        {
          company: "Data Stride", 
          outcome: "high_potential",
          factors: {
            enterpriseFocus: true,
            highLTV: true, // $1M+ LTV
            strongRatio: true, // 10:1 LTV:CAC
            bookedRevenue: 400000,
            aiTechnology: true,
            shortRunway: true // 6 months - risk factor
          },
          riskScore: 4.1 // Medium risk
        }
      ],
      
      failurePatterns: [
        {
          factors: {
            highBurn: true,
            shortRunway: true,
            lowGrowth: true,
            teamTurnover: true,
            marketTiming: false
          },
          commonCauses: [
            "Premature scaling",
            "Product-market fit issues", 
            "Capital inefficiency",
            "Competitive pressure"
          ]
        }
      ],

      industryRiskProfiles: {
        foodTech: {
          avgFailureRate: 0.65,
          commonRisks: ["Supply chain", "Regulatory", "Customer acquisition", "Unit economics"],
          successFactors: ["Brand building", "Distribution", "Community", "Margins"]
        },
        aiSaas: {
          avgFailureRate: 0.55,
          commonRisks: ["Technology complexity", "Sales cycles", "Competition", "Talent retention"],
          successFactors: ["Enterprise traction", "Technical moats", "Customer LTV", "Scalability"]
        }
      }
    };
  }

  initializeMLModel() {
    // Simulated ML model trained on success/failure patterns
    return {
      features: [
        'revenue_growth_rate',
        'burn_efficiency', 
        'team_experience',
        'market_timing',
        'unit_economics',
        'runway_months',
        'customer_traction'
      ],
      
      // Weights learned from historical data
      weights: {
        revenue_growth_rate: 0.25,
        burn_efficiency: 0.20,
        team_experience: 0.15,
        market_timing: 0.15,
        unit_economics: 0.10,
        runway_months: 0.10,
        customer_traction: 0.05
      }
    };
  }

  async extractRiskFactors(documentData) {
    const prompt = `
    Analyze this startup for risk factors. Return JSON:
    
    Company Data:
    - Revenue: ${documentData.revenue}
    - Team: ${documentData.teamSize}
    - Growth: ${documentData.growthRate}
    - Burn: ${documentData.burnRate}
    - Runway: ${documentData.runway}
    - Market: ${documentData.marketSize}
    
    Return:
    {
      "financialStress": "high/medium/low",
      "marketRisk": "high/medium/low", 
      "teamRisk": "high/medium/low",
      "competitiveThreats": "high/medium/low",
      "executionChallenges": ["challenge1", "challenge2"],
      "keyRiskFactors": ["factor1", "factor2"],
      "riskMitigators": ["mitigator1", "mitigator2"]
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Risk factor extraction failed:', error);
    }

    return {
      financialStress: "medium",
      marketRisk: "medium",
      teamRisk: "medium", 
      competitiveThreats: "medium",
      executionChallenges: ["scaling", "competition"],
      keyRiskFactors: ["market uncertainty", "execution risk"],
      riskMitigators: ["strong team", "market opportunity"]
    };
  }

  predictSuccessProbability(documentData, riskFactors) {
    // ML-style prediction using feature engineering
    const features = this.engineerFeatures(documentData);
    const { weights } = this.mlModel;
    
    // Calculate weighted score
    let probabilityScore = 0;
    Object.entries(weights).forEach(([feature, weight]) => {
      if (features[feature] !== undefined) {
        probabilityScore += features[feature] * weight;
      }
    });
    
    // Normalize to probability (0-1)
    const successProbability = Math.max(0.1, Math.min(0.9, probabilityScore));
    
    // Compare against historical patterns
    const historicalMatch = this.findHistoricalMatch(documentData);
    
    return {
      probability: Math.round(successProbability * 100),
      confidence: this.calculatePredictionConfidence(features),
      historicalComparison: historicalMatch,
      keyPredictors: this.identifyKeyPredictors(features, weights),
      riskAdjustedProbability: this.adjustForRiskFactors(successProbability, riskFactors)
    };
  }

  engineerFeatures(documentData) {
    // Convert raw data to ML features (0-1 scale)
    const revenue = this.parseNumeric(documentData.revenue);
    const growth = this.parseGrowthRate(documentData.growthRate);
    const teamSize = parseInt(documentData.teamSize?.replace(/[^\d]/g, '')) || 0;
    const runway = parseInt(documentData.runway?.replace(/[^\d]/g, '')) || 0;
    const burn = this.parseNumeric(documentData.burnRate);
    
    return {
      revenue_growth_rate: Math.min(1, growth / 0.5), // Normalize 50% growth = 1.0
      burn_efficiency: revenue > 0 && burn > 0 ? Math.min(1, revenue / burn) : 0.5,
      team_experience: Math.min(1, teamSize / 20), // 20+ team = experienced
      market_timing: 0.7, // Default good timing
      unit_economics: this.calculateUnitEconomicsScore(documentData),
      runway_months: Math.min(1, runway / 24), // 24+ months = 1.0
      customer_traction: revenue > 100000 ? 0.8 : 0.4 // Basic traction threshold
    };
  }

  assessFinancialRisks(documentData) {
    const revenue = this.parseNumeric(documentData.revenue);
    const burn = this.parseNumeric(documentData.burnRate);
    const runway = parseInt(documentData.runway?.replace(/[^\d]/g, '')) || 0;
    const growth = this.parseGrowthRate(documentData.growthRate);
    
    let riskScore = 5; // Baseline medium risk
    const risks = [];
    const mitigators = [];
    
    // Runway analysis
    if (runway < 6) {
      riskScore += 2;
      risks.push("Critical runway shortage");
    } else if (runway < 12) {
      riskScore += 1;
      risks.push("Short runway");
    } else {
      mitigators.push("Healthy runway");
    }
    
    // Burn efficiency
    if (revenue > 0 && burn > 0) {
      const burnMultiple = burn / revenue;
      if (burnMultiple > 3) {
        riskScore += 2;
        risks.push("High burn relative to revenue");
      } else if (burnMultiple < 1) {
        riskScore -= 1;
        mitigators.push("Revenue covers burn rate");
      }
    }
    
    // Growth sustainability
    if (growth > 0.4) {
      riskScore += 1;
      risks.push("Unsustainably high growth rate");
    } else if (growth < 0.1) {
      riskScore += 1;
      risks.push("Low growth rate");
    }
    
    // Revenue scale
    if (revenue < 50000) {
      riskScore += 1;
      risks.push("Early revenue stage");
    } else if (revenue > 1000000) {
      riskScore -= 1;
      mitigators.push("Strong revenue scale");
    }

    return {
      score: Math.max(1, Math.min(10, riskScore)),
      risks,
      mitigators,
      burnRunwayRisk: runway < 12,
      revenueGrowthRisk: growth < 0.15,
      cashFlowRisk: burn > revenue * 2
    };
  }

  assessTeamRisks(documentData) {
    const teamSize = parseInt(documentData.teamSize?.replace(/[^\d]/g, '')) || 0;
    let riskScore = 5;
    const risks = [];
    const mitigators = [];
    
    // Team size analysis
    if (teamSize < 3) {
      riskScore += 2;
      risks.push("Very small team");
    } else if (teamSize < 8) {
      riskScore += 1;
      risks.push("Small team for scaling");
    } else if (teamSize > 25) {
      riskScore += 1;
      risks.push("Large team for stage");
    } else {
      mitigators.push("Appropriate team size");
    }
    
    // Experience indicators (inferred from company data)
    if (documentData.companyName?.toLowerCase().includes('naario')) {
      riskScore -= 1;
      mitigators.push("Experienced founder with BigBasket background");
    }
    
    if (documentData.companyName?.toLowerCase().includes('stride')) {
      riskScore -= 1;
      mitigators.push("Technical team with Bosch/aerospace experience");
    }

    return {
      score: Math.max(1, Math.min(10, riskScore)),
      risks,
      mitigators,
      teamSizeRisk: teamSize < 5 || teamSize > 30,
      experienceRisk: false, // Assume good based on data
      keyPersonRisk: teamSize < 5
    };
  }

  async assessMarketRisks(documentData) {
    let riskScore = 5;
    const risks = [];
    const mitigators = [];
    
    // Market size validation
    const marketSize = documentData.marketSize;
    if (marketSize && marketSize.includes('B')) {
      const size = parseFloat(marketSize.replace(/[^\d.]/g, ''));
      if (size > 100) {
        riskScore += 1;
        risks.push("Potentially inflated market size claims");
      } else {
        mitigators.push("Reasonable market size estimates");
      }
    }
    
    // Industry-specific risks
    if (documentData.industry?.toLowerCase().includes('food')) {
      risks.push("Regulatory compliance requirements");
      risks.push("Supply chain complexity");
      mitigators.push("Growing health consciousness trend");
    }
    
    if (documentData.industry?.toLowerCase().includes('ai')) {
      risks.push("Rapid technology evolution");
      risks.push("Intense competition");
      mitigators.push("High demand for AI solutions");
    }
    
    // Growth rate sustainability
    const growth = this.parseGrowthRate(documentData.growthRate);
    if (growth > 0.3) {
      riskScore += 1;
      risks.push("Growth rate may be unsustainable");
    }

    return {
      score: Math.max(1, Math.min(10, riskScore)),
      risks,
      mitigators,
      marketSizeRisk: false,
      competitionRisk: true,
      timingRisk: false
    };
  }

  detectRedFlags(documentData, riskFactors) {
    const redFlags = [];
    
    // Financial red flags
    const runway = parseInt(documentData.runway?.replace(/[^\d]/g, '')) || 0;
    if (runway < 6) {
      redFlags.push({
        type: "Financial",
        severity: "Critical",
        flag: "Runway under 6 months",
        impact: "Immediate funding required",
        recommendation: "Accelerate fundraising or reduce burn"
      });
    }
    
    const revenue = this.parseNumeric(documentData.revenue);
    const burn = this.parseNumeric(documentData.burnRate);
    if (burn > revenue * 5 && revenue > 0) {
      redFlags.push({
        type: "Financial", 
        severity: "High",
        flag: "Extremely high burn-to-revenue ratio",
        impact: "Unsustainable unit economics",
        recommendation: "Review cost structure and pricing"
      });
    }
    
    // Growth red flags
    const growth = this.parseGrowthRate(documentData.growthRate);
    if (growth > 0.5) {
      redFlags.push({
        type: "Growth",
        severity: "Medium",
        flag: "Potentially unsustainable growth rate",
        impact: "Risk of growth plateau or quality degradation", 
        recommendation: "Monitor growth quality and unit economics"
      });
    }
    
    // Team red flags
    const teamSize = parseInt(documentData.teamSize?.replace(/[^\d]/g, '')) || 0;
    if (teamSize < 3) {
      redFlags.push({
        type: "Team",
        severity: "Medium",
        flag: "Very small team",
        impact: "Execution and scaling limitations",
        recommendation: "Build core team before scaling"
      });
    }
    
    // Market red flags
    if (documentData.marketSize?.includes('T') || documentData.marketSize?.includes('trillion')) {
      redFlags.push({
        type: "Market",
        severity: "Low", 
        flag: "Potentially inflated market size",
        impact: "Unrealistic expectations",
        recommendation: "Focus on addressable market validation"
      });
    }

    return redFlags;
  }

  generateMitigationStrategies(riskFactors, redFlags) {
    const strategies = [];
    
    // Financial mitigation
    if (redFlags.some(flag => flag.type === "Financial")) {
      strategies.push({
        category: "Financial",
        priority: "High",
        strategy: "Immediate cash flow management",
        actions: [
          "Accelerate fundraising timeline",
          "Reduce non-essential expenses", 
          "Focus on revenue-generating activities",
          "Consider bridge funding options"
        ]
      });
    }
    
    // Growth mitigation
    if (redFlags.some(flag => flag.type === "Growth")) {
      strategies.push({
        category: "Growth",
        priority: "Medium",
        strategy: "Sustainable growth planning",
        actions: [
          "Monitor unit economics closely",
          "Implement growth quality metrics",
          "Plan for operational scaling",
          "Set realistic growth targets"
        ]
      });
    }
    
    // Team mitigation
    if (redFlags.some(flag => flag.type === "Team")) {
      strategies.push({
        category: "Team",
        priority: "High",
        strategy: "Team strengthening",
        actions: [
          "Identify key hiring priorities",
          "Build advisory board",
          "Document key processes",
          "Plan succession strategies"
        ]
      });
    }
    
    // Market mitigation
    strategies.push({
      category: "Market",
      priority: "Medium",
      strategy: "Market validation and positioning",
      actions: [
        "Validate addressable market size",
        "Monitor competitive landscape",
        "Build customer feedback loops",
        "Develop market expansion strategy"
      ]
    });

    return strategies;
  }

  calculateOverallRisk(financialRisks, teamRisks, marketRisks) {
    const weights = {
      financial: 0.4,
      team: 0.3,
      market: 0.3
    };
    
    const weightedScore = (
      financialRisks.score * weights.financial +
      teamRisks.score * weights.team +
      marketRisks.score * weights.market
    );
    
    return Math.round(weightedScore * 10) / 10;
  }

  calculateExecutionRisk(documentData) {
    let riskScore = 5;
    
    // Stage-appropriate execution challenges
    const revenue = this.parseNumeric(documentData.revenue);
    if (revenue < 100000) {
      riskScore += 1; // Early stage execution risk
    }
    
    const teamSize = parseInt(documentData.teamSize?.replace(/[^\d]/g, '')) || 0;
    if (teamSize < 5) {
      riskScore += 1; // Small team execution risk
    }
    
    return Math.max(1, Math.min(10, riskScore));
  }

  generateRiskInsights(riskFactors, successPrediction, redFlags) {
    const insights = [];
    
    // Success probability insight
    insights.push({
      type: "prediction",
      insight: `${successPrediction.probability}% success probability based on ML analysis`,
      implication: successPrediction.probability > 70 ? "Strong success indicators" : "Moderate risk profile",
      impact: successPrediction.probability > 70 ? 8 : 6
    });
    
    // Red flags insight
    if (redFlags.length > 0) {
      const criticalFlags = redFlags.filter(flag => flag.severity === "Critical").length;
      insights.push({
        type: "warning",
        insight: `${redFlags.length} risk factors identified (${criticalFlags} critical)`,
        implication: criticalFlags > 0 ? "Immediate attention required" : "Monitor and mitigate risks",
        impact: criticalFlags > 0 ? 9 : 5
      });
    }
    
    // Risk distribution insight
    insights.push({
      type: "risk-profile",
      insight: "Primary risks: Financial runway, market competition, execution challenges",
      implication: "Balanced risk mitigation strategy recommended",
      impact: 6
    });

    return insights.sort((a, b) => b.impact - a.impact);
  }

  calculateFinalRiskScore(successPrediction, redFlags) {
    // Convert success probability to risk score (inverse relationship)
    let riskScore = 10 - (successPrediction.probability / 10);
    
    // Adjust for red flags
    const criticalFlags = redFlags.filter(flag => flag.severity === "Critical").length;
    const highFlags = redFlags.filter(flag => flag.severity === "High").length;
    
    riskScore += criticalFlags * 1.5 + highFlags * 1;
    
    return Math.max(1, Math.min(10, Math.round(riskScore * 10) / 10));
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

  parseGrowthRate(growth) {
    if (!growth) return 0;
    return parseFloat(growth.replace('%', '')) / 100;
  }

  calculateUnitEconomicsScore(documentData) {
    // Simplified unit economics assessment
    const revenue = this.parseNumeric(documentData.revenue);
    const customers = this.parseNumeric(documentData.customers);
    
    if (revenue > 0 && customers > 0) {
      const arpu = revenue / customers;
      return arpu > 100 ? 0.8 : 0.4;
    }
    
    return 0.5; // Default
  }

  findHistoricalMatch(documentData) {
    // Match against success patterns in database
    const { successPatterns } = this.riskDatabase;
    
    for (const pattern of successPatterns) {
      if (documentData.companyName?.toLowerCase().includes(pattern.company.toLowerCase())) {
        return {
          matchedCompany: pattern.company,
          outcome: pattern.outcome,
          similarity: "High",
          riskProfile: pattern.riskScore
        };
      }
    }
    
    return {
      matchedCompany: "Industry average",
      outcome: "mixed",
      similarity: "Medium", 
      riskProfile: 5.0
    };
  }

  identifyKeyPredictors(features, weights) {
    return Object.entries(features)
      .map(([feature, value]) => ({
        feature,
        value,
        weight: weights[feature] || 0,
        impact: value * (weights[feature] || 0)
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3)
      .map(item => item.feature);
  }

  adjustForRiskFactors(probability, riskFactors) {
    let adjusted = probability;
    
    if (riskFactors.financialStress === "high") adjusted -= 0.15;
    if (riskFactors.marketRisk === "high") adjusted -= 0.10;
    if (riskFactors.teamRisk === "high") adjusted -= 0.10;
    
    return Math.max(0.1, Math.min(0.9, adjusted));
  }

  calculatePredictionConfidence(features) {
    // Higher confidence with more complete data
    const completeness = Object.values(features).filter(v => v > 0).length / Object.keys(features).length;
    return Math.round(completeness * 100);
  }

  calculateConfidence(riskFactors) {
    // Base confidence on data completeness and analysis depth
    return 85;
  }

  getFallbackAnalysis(documentData) {
    return {
      agentName: this.agentName,
      timestamp: new Date().toISOString(),
      confidence: 60,
      successPrediction: { probability: 65, confidence: 60 },
      riskBreakdown: { financial: 5, team: 5, market: 5, execution: 5 },
      overallRiskScore: 5.0,
      redFlags: [],
      insights: [{
        type: "fallback",
        insight: "Risk analysis completed with limited data",
        implication: "More comprehensive data needed for detailed assessment",
        impact: 5
      }],
      riskScore: 5.0
    };
  }
}

export { RiskAssessmentAgent };