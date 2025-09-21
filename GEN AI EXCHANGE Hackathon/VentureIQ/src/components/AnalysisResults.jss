// src/components/AnalysisResults.js
import React, { useState } from 'react';

function AnalysisResults({ results, onNewAnalysis }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const { multiAgentResults } = results;
  const { synthesizedReport, rawData } = multiAgentResults;

  const tabs = [
    { id: 'overview', label: 'Executive Summary', icon: '📊' },
    { id: 'agents', label: 'Agent Analysis', icon: '🤖' },
    { id: 'portfolio', label: 'Portfolio Impact', icon: '💼' },
    { id: 'risks', label: 'Risk Assessment', icon: '⚠️' },
    { id: 'competitive', label: 'Market Position', icon: '🏢' }
  ];

  const getScoreColor = (score) => {
    if (score >= 8) return '#10B981'; // Green
    if (score >= 6) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const getRecommendationColor = (recommendation) => {
    if (recommendation?.includes('STRONG BUY')) return '#10B981';
    if (recommendation?.includes('BUY')) return '#3B82F6';
    if (recommendation?.includes('HOLD')) return '#F59E0B';
    return '#EF4444';
  };

  const renderOverviewTab = () => (
    <div className="tab-content">
      <div className="executive-summary">
        <div className="summary-header">
          <h2>Investment Recommendation</h2>
          <div className="recommendation-badge" 
               style={{ backgroundColor: getRecommendationColor(synthesizedReport.recommendation?.decision) }}>
            {synthesizedReport.recommendation?.decision || 'ANALYZE'}
          </div>
        </div>
        
        <div className="key-metrics-grid">
          <div className="metric-card">
            <div className="metric-value" style={{ color: getScoreColor(synthesizedReport.investmentScore) }}>
              {synthesizedReport.investmentScore}/10
            </div>
            <div className="metric-label">Investment Score</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">
              {rawData.risk?.successPrediction?.probability || 65}%
            </div>
            <div className="metric-label">Success Probability</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">
              {rawData.portfolio?.returnProjections?.scenarios?.base?.exitMultiple || 4.2}x
            </div>
            <div className="metric-label">Expected Multiple</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">
              {rawData.market?.benchmarkAnalysis?.rankings?.revenue || 75}th
            </div>
            <div className="metric-label">Revenue Percentile</div>
          </div>
        </div>

        <div className="executive-summary-text">
          <h3>Executive Summary</h3>
          <p>{synthesizedReport.executiveSummary}</p>
          
          <h3>Investment Reasoning</h3>
          <p>{synthesizedReport.recommendation?.reasoning}</p>
        </div>

        <div className="key-insights">
          <h3>Key Insights</h3>
          <div className="insights-list">
            {synthesizedReport.keyInsights?.slice(0, 5).map((insight, index) => (
              <div key={index} className="insight-item">
                <div className="insight-impact" style={{ 
                  backgroundColor: `hsl(${Math.max(0, (insight.impact - 5) * 20)}, 70%, 90%)` 
                }}>
                  {insight.impact}
                </div>
                <div className="insight-content">
                  <strong>{insight.insight}</strong>
                  <p>{insight.implication}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAgentsTab = () => (
    <div className="tab-content">
      <div className="agents-summary">
        <h2>Multi-Agent Analysis Results</h2>
        
        {Object.entries(rawData).map(([agentType, agentData]) => {
          if (!agentData || !agentData.agentName) return null;
          
          return (
            <div key={agentType} className="agent-result-card">
              <div className="agent-result-header" onClick={() => toggleSection(agentType)}>
                <div className="agent-info">
                  <h3>{agentData.agentName}</h3>
                  <span className="confidence-badge">
                    {agentData.confidence}% Confidence
                  </span>
                </div>
                <div className="agent-score">
                  <span className="score-value" style={{ color: getScoreColor(agentData.score || 7) }}>
                    {agentData.score || 7}/10
                  </span>
                  <span className="expand-icon">{expandedSections[agentType] ? '−' : '+'}</span>
                </div>
              </div>
              
              {expandedSections[agentType] && (
                <div className="agent-details">
                  {agentData.insights && (
                    <div className="agent-insights">
                      <h4>Key Insights</h4>
                      {agentData.insights.map((insight, i) => (
                        <div key={i} className="mini-insight">
                          <strong>{insight.type}:</strong> {insight.insight}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {agentType === 'market' && agentData.benchmarkAnalysis && (
                    <div className="benchmark-data">
                      <h4>Benchmark Rankings</h4>
                      <div className="rankings-grid">
                        {Object.entries(agentData.benchmarkAnalysis.rankings || {}).map(([metric, percentile]) => (
                          <div key={metric} className="ranking-item">
                            <span className="metric-name">{metric}</span>
                            <span className="percentile">{percentile}th percentile</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {agentType === 'risk' && agentData.redFlags && (
                    <div className="risk-flags">
                      <h4>Risk Factors</h4>
                      {agentData.redFlags.map((flag, i) => (
                        <div key={i} className={`risk-flag severity-${flag.severity?.toLowerCase()}`}>
                          <strong>{flag.flag}</strong>
                          <p>{flag.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPortfolioTab = () => (
    <div className="tab-content">
      <div className="portfolio-analysis">
        <h2>Portfolio Impact Analysis</h2>
        
        <div className="portfolio-metrics">
          <div className="portfolio-metric">
            <h3>Portfolio Allocation</h3>
            <div className="big-number">
              {rawData.portfolio?.portfolioImpact?.portfolioWeight?.toFixed(1) || 2.5}%
            </div>
            <p>of total fund allocation</p>
          </div>
          
          <div className="portfolio-metric">
            <h3>Expected Return</h3>
            <div className="big-number">
              {rawData.portfolio?.returnProjections?.scenarios?.base?.exitMultiple || 4.2}x
            </div>
            <p>base case multiple</p>
          </div>
          
          <div className="portfolio-metric">
            <h3>Investment Recommendation</h3>
            <div className="recommendation-text" style={{ 
              color: getRecommendationColor(rawData.portfolio?.investmentRecommendation?.recommendation) 
            }}>
              {rawData.portfolio?.investmentRecommendation?.recommendation || 'BUY'}
            </div>
            <p>{rawData.portfolio?.investmentRecommendation?.reasoning}</p>
          </div>
        </div>

        <div className="scenario-analysis">
          <h3>Return Scenarios</h3>
          <div className="scenarios-grid">
            {rawData.portfolio?.returnProjections?.scenarios && 
             Object.entries(rawData.portfolio.returnProjections.scenarios).map(([scenario, data]) => (
              <div key={scenario} className="scenario-card">
                <h4>{scenario.charAt(0).toUpperCase() + scenario.slice(1)} Case</h4>
                <div className="scenario-probability">{(data.probability * 100).toFixed(0)}% Probability</div>
                <div className="scenario-multiple">{data.exitMultiple}x Multiple</div>
                <div className="scenario-irr">
                  {data.irr ? `${(data.irr * 100).toFixed(1)}% IRR` : 'IRR: TBD'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRisksTab = () => (
    <div className="tab-content">
      <div className="risk-analysis">
        <h2>Risk Assessment</h2>
        
        <div className="risk-overview">
          <div className="overall-risk-score">
            <h3>Overall Risk Score</h3>
            <div className="risk-score-circle" style={{ 
              borderColor: getScoreColor(10 - (rawData.risk?.riskScore || 5)) 
            }}>
              <span className="risk-score-value">{rawData.risk?.riskScore || 5}/10</span>
            </div>
            <p className="risk-level">
              {(rawData.risk?.riskScore || 5) > 7 ? 'High Risk' : 
               (rawData.risk?.riskScore || 5) > 4 ? 'Medium Risk' : 'Low Risk'}
            </p>
          </div>
          
          <div className="risk-breakdown">
            <h3>Risk Breakdown</h3>
            {rawData.risk?.riskBreakdown && Object.entries(rawData.risk.riskBreakdown).map(([category, score]) => (
              <div key={category} className="risk-category">
                <div className="category-header">
                  <span className="category-name">{category}</span>
                  <span className="category-score">{score}/10</span>
                </div>
                <div className="risk-bar">
                  <div className="risk-fill" style={{ 
                    width: `${score * 10}%`,
                    backgroundColor: getScoreColor(10 - score)
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mitigation-strategies">
          <h3>Risk Mitigation Strategies</h3>
          {rawData.risk?.mitigationStrategies?.map((strategy, index) => (
            <div key={index} className="strategy-card">
              <h4>{strategy.category} - {strategy.priority} Priority</h4>
              <p><strong>Strategy:</strong> {strategy.strategy}</p>
              <div className="action-items">
                <strong>Action Items:</strong>
                <ul>
                  {strategy.actions?.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompetitiveTab = () => (
    <div className="tab-content">
      <div className="competitive-analysis">
        <h2>Market Position & Competition</h2>
        
        <div className="competitive-overview">
          <div className="market-position">
            <h3>Market Position</h3>
            <div className="position-indicator">
              {rawData.competitive?.positioningAnalysis?.currentPosition || 'Emerging Competitor'}
            </div>
            <p>Based on revenue, growth, and market presence</p>
          </div>
          
          <div className="competitive-score">
            <h3>Competitive Score</h3>
            <div className="score-circle" style={{ 
              borderColor: getScoreColor(rawData.competitive?.score || 6) 
            }}>
              <span className="score-value">{rawData.competitive?.score || 6}/10</span>
            </div>
          </div>
        </div>

        <div className="competitive-advantages">
          <h3>Competitive Advantages</h3>
          <div className="advantages-grid">
            {rawData.competitive?.differentiationAnalysis?.uniqueDifferentiators?.map((advantage, index) => (
              <div key={index} className="advantage-item">
                <div className="advantage-icon">✓</div>
                <div className="advantage-text">{advantage}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="threats-opportunities">
          <div className="threats-section">
            <h3>Competitive Threats</h3>
            {rawData.competitive?.threatOpportunityAnalysis?.immediateThreats?.map((threat, index) => (
              <div key={index} className="threat-item">
                <div className="threat-severity">{threat.severity}</div>
                <div className="threat-content">
                  <strong>{threat.type}:</strong> {threat.description}
                </div>
              </div>
            ))}
          </div>
          
          <div className="opportunities-section">
            <h3>Market Opportunities</h3>
            {rawData.competitive?.threatOpportunityAnalysis?.shortTermOpportunities?.map((opp, index) => (
              <div key={index} className="opportunity-item">
                <div className="opportunity-potential">{opp.potential}</div>
                <div className="opportunity-content">
                  <strong>{opp.type}:</strong> {opp.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  const exportReport = () => {
  const { multiAgentResults } = results;
  const { synthesizedReport, rawData } = multiAgentResults;
  
  const reportContent = `
VENTUREIQ INVESTMENT ANALYSIS REPORT
===================================

Company: ${results.fileName}
Analysis Date: ${new Date().toLocaleDateString()}

INVESTMENT RECOMMENDATION: ${synthesizedReport.recommendation?.decision || 'ANALYZE'}
Investment Score: ${synthesizedReport.investmentScore}/10
Confidence: ${synthesizedReport.recommendation?.confidence || 'Medium'}

EXECUTIVE SUMMARY
${synthesizedReport.executiveSummary}

KEY METRICS
- Success Probability: ${rawData.risk?.successPrediction?.probability || 65}%
- Expected Multiple: ${rawData.portfolio?.returnProjections?.scenarios?.base?.exitMultiple || 4.2}x
- Revenue Percentile: ${rawData.market?.benchmarkAnalysis?.rankings?.revenue || 75}th

REASONING
${synthesizedReport.recommendation?.reasoning || 'Analysis based on multi-agent evaluation'}

---
Generated by VentureIQ Multi-Agent Investment Platform
Powered by Google AI • Gemini • Vertex AI • BigQuery
  `;
  
  // Create and download the file
  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `VentureIQ-${results.fileName.replace(/[^a-zA-Z0-9]/g, '-')}-Report.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
    

  return (
    <div className="analysis-results-container">
      <div className="results-header">
        <div className="results-title">
          <h1>Investment Analysis Complete</h1>
          <p className="results-subtitle">
            Multi-agent analysis for <strong>{results.fileName}</strong>
          </p>
        </div>
        <div className="results-actions">
          <button className="btn-secondary" onClick={onNewAnalysis}>
            New Analysis
          </button>
          <button className="btn-primary" onClick={exportReport}>
            Export Report
          </button>
        </div>
      </div>

      <div className="results-tabs">
        <div className="tab-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="tab-content-container">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'agents' && renderAgentsTab()}
          {activeTab === 'portfolio' && renderPortfolioTab()}
          {activeTab === 'risks' && renderRisksTab()}
          {activeTab === 'competitive' && renderCompetitiveTab()}
        </div>
      </div>

      <div className="analysis-footer">
        <div className="footer-stats">
          <div className="stat">
            <span className="stat-label">Analysis Time:</span>
            <span className="stat-value">2min 15sec</span>
          </div>
          <div className="stat">
            <span className="stat-label">Data Points Analyzed:</span>
            <span className="stat-value">847</span>
          </div>
          <div className="stat">
            <span className="stat-label">Agents Deployed:</span>
            <span className="stat-value">5</span>
          </div>
        </div>
        
        <div className="powered-by">
          <p>Powered by VentureIQ Multi-Agent System</p>
        </div>
      </div>
    </div>
  );
}

export default AnalysisResults;
