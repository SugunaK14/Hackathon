// src/services/multiAgentOrchestrator.js
import { DocumentAgent } from './agents/documentAgent';
import { MarketResearchAgent } from './agents/marketResearchAgent';
import { RiskAssessmentAgent } from './agents/riskAssessmentAgent';
import { CompetitiveIntelligenceAgent } from './agents/competitiveIntelligenceAgent';
import { PortfolioImpactAgent } from './agents/portfolioImpactAgent';

class MultiAgentOrchestrator {
  constructor() {
    this.agents = {
      document: new DocumentAgent(),
      market: new MarketResearchAgent(),
      risk: new RiskAssessmentAgent(),
      competitive: new CompetitiveIntelligenceAgent(),
      portfolio: new PortfolioImpactAgent()
    };
    
    this.analysisStatus = {
      document: 'pending',
      market: 'pending',
      risk: 'pending',
      competitive: 'pending',
      portfolio: 'pending'
    };
  }

  async analyzeStartup(documentFile, progressCallback) {
    console.log('🤖 Multi-Agent Analysis Starting...');
    
    // Reset status
    Object.keys(this.analysisStatus).forEach(key => {
      this.analysisStatus[key] = 'processing';
    });
    
    // Stage 1: Document Intelligence (runs first)
    progressCallback && progressCallback('Document Intelligence Agent activated...', 20);
    const documentData = await this.agents.document.analyze(documentFile);
    this.analysisStatus.document = 'completed';
    
    // Stage 2: Parallel analysis (all agents work simultaneously)
    progressCallback && progressCallback('All agents now working in parallel...', 40);
    
    const parallelPromises = [
      this.runMarketAnalysis(documentData, progressCallback),
      this.runRiskAssessment(documentData, progressCallback),
      this.runCompetitiveIntelligence(documentData, progressCallback),
      this.runPortfolioImpact(documentData, progressCallback)
    ];
    
    const [marketData, riskData, competitiveData, portfolioData] = await Promise.all(parallelPromises);
    
    // Stage 3: Synthesis
    progressCallback && progressCallback('Synthesizing multi-agent insights...', 90);
    const synthesizedReport = await this.synthesizeResults({
      document: documentData,
      market: marketData,
      risk: riskData,
      competitive: competitiveData,
      portfolio: portfolioData
    });
    
    progressCallback && progressCallback('Analysis complete!', 100);
    
    return {
      rawData: {
        document: documentData,
        market: marketData,
        risk: riskData,
        competitive: competitiveData,
        portfolio: portfolioData
      },
      synthesizedReport,
      agentStatus: this.analysisStatus
    };
  }

  async runMarketAnalysis(documentData, progressCallback) {
    try {
      const result = await this.agents.market.analyze(documentData);
      this.analysisStatus.market = 'completed';
      progressCallback && progressCallback('Market Research Agent completed', 60);
      return result;
    } catch (error) {
      console.error('Market analysis failed:', error);
      this.analysisStatus.market = 'failed';
      return this.getMarketFallback(documentData);
    }
  }

  async runRiskAssessment(documentData, progressCallback) {
    try {
      const result = await this.agents.risk.analyze(documentData);
      this.analysisStatus.risk = 'completed';
      progressCallback && progressCallback('Risk Assessment Agent completed', 65);
      return result;
    } catch (error) {
      console.error('Risk assessment failed:', error);
      this.analysisStatus.risk = 'failed';
      return this.getRiskFallback(documentData);
    }
  }

  async runCompetitiveIntelligence(documentData, progressCallback) {
    try {
      const result = await this.agents.competitive.analyze(documentData);
      this.analysisStatus.competitive = 'completed';
      progressCallback && progressCallback('Competitive Intelligence Agent completed', 70);
      return result;
    } catch (error) {
      console.error('Competitive analysis failed:', error);
      this.analysisStatus.competitive = 'failed';
      return this.getCompetitiveFallback(documentData);
    }
  }

  async runPortfolioImpact(documentData, progressCallback) {
    try {
      const result = await this.agents.portfolio.analyze(documentData);
      this.analysisStatus.portfolio = 'completed';
      progressCallback && progressCallback('Portfolio Impact Agent completed', 75);
      return result;
    } catch (error) {
      console.error('Portfolio analysis failed:', error);
      this.analysisStatus.portfolio = 'failed';
      return this.getPortfolioFallback(documentData);
    }
  }

  async synthesizeResults(agentResults) {
    // Combine insights from all agents
    const synthesis = {
      executiveSummary: this.generateExecutiveSummary(agentResults),
      investmentScore: this.calculateInvestmentScore(agentResults),
      keyInsights: this.extractKeyInsights(agentResults),
      riskFactors: this.consolidateRisks(agentResults),
      recommendation: this.generateRecommendation(agentResults),
      nextSteps: this.suggestNextSteps(agentResults)
    };

    return synthesis;
  }

  generateExecutiveSummary(results) {
    const { document, market, risk, competitive, portfolio } = results;
    
    return `${document.companyName} is a ${document.industry || 'technology'} company seeking ${document.fundingAmount || 'Series A'} funding. 
    Market analysis shows ${market.marketPosition || 'competitive positioning'} in a ${market.marketSize || 'significant'} market. 
    Risk assessment indicates ${risk.overallRisk || 'moderate'} risk profile. 
    Competitive analysis reveals ${competitive.competitiveAdvantage || 'differentiated approach'}. 
    Portfolio impact modeling suggests ${portfolio.expectedReturn || 'positive'} returns.`;
  }

  calculateInvestmentScore(results) {
    // Weighted scoring from all agents
    const weights = {
      market: 0.25,
      risk: 0.30,
      competitive: 0.20,
      portfolio: 0.25
    };

    const scores = {
      market: results.market.score || 7,
      risk: 10 - (results.risk.riskScore || 5), // Invert risk score
      competitive: results.competitive.score || 6,
      portfolio: results.portfolio.score || 7
    };

    const weightedScore = Object.keys(weights).reduce((total, key) => {
      return total + (scores[key] * weights[key]);
    }, 0);

    return Math.round(weightedScore * 10) / 10;
  }

  extractKeyInsights(results) {
    const insights = [];
    
    // Collect insights from each agent
    if (results.market.insights) insights.push(...results.market.insights);
    if (results.risk.insights) insights.push(...results.risk.insights);
    if (results.competitive.insights) insights.push(...results.competitive.insights);
    if (results.portfolio.insights) insights.push(...results.portfolio.insights);
    
    // Sort by impact and return top 5
    return insights
      .sort((a, b) => (b.impact || 0) - (a.impact || 0))
      .slice(0, 5);
  }

  consolidateRisks(results) {
    const allRisks = [];
    
    if (results.risk.risks) allRisks.push(...results.risk.risks);
    if (results.competitive.risks) allRisks.push(...results.competitive.risks);
    if (results.market.risks) allRisks.push(...results.market.risks);
    
    return allRisks.sort((a, b) => (b.severity || 0) - (a.severity || 0));
  }

  generateRecommendation(results) {
    const score = this.calculateInvestmentScore(results);
    
    if (score >= 8) {
      return {
        decision: 'STRONG BUY',
        confidence: 'High',
        reasoning: 'Multiple agents confirm strong investment opportunity with minimal risks'
      };
    } else if (score >= 6) {
      return {
        decision: 'PROCEED WITH CAUTION',
        confidence: 'Medium',
        reasoning: 'Mixed signals from agents suggest thorough due diligence required'
      };
    } else {
      return {
        decision: 'PASS',
        confidence: 'High',
        reasoning: 'Multiple risk factors identified across agent analysis'
      };
    }
  }

  suggestNextSteps(results) {
    const steps = [];
    
    if (results.risk.riskScore > 7) {
      steps.push('Conduct detailed financial audit');
    }
    
    if (results.competitive.threats?.length > 0) {
      steps.push('Deep dive competitive analysis');
    }
    
    if (results.market.marketShare < 0.05) {
      steps.push('Validate market size assumptions');
    }
    
    return steps;
  }

  // Fallback methods for when agents fail
  getMarketFallback(documentData) {
    return {
      marketPosition: 'Analysis pending',
      marketSize: documentData.marketSize || 'Not specified',
      score: 5,
      insights: []
    };
  }

  getRiskFallback(documentData) {
    return {
      riskScore: 5,
      overallRisk: 'Medium',
      risks: [],
      insights: []
    };
  }

  getCompetitiveFallback(documentData) {
    return {
      competitiveAdvantage: 'Analysis pending',
      score: 5,
      insights: [],
      threats: []
    };
  }

  getPortfolioFallback(documentData) {
    return {
      expectedReturn: 'Modeling pending',
      score: 5,
      insights: []
    };
  }
}

export { MultiAgentOrchestrator };
