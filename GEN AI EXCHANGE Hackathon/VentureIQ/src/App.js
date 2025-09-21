// src/App.js
import React, { useState } from 'react';
import './App.css';
import DocumentUpload from './components/DocumentUpload';
import AnalysisResults from './components/AnalysisResults';
import MultiAgentProgress from './components/MultiAgentProgress';
import { MultiAgentOrchestrator } from './services/multiAgentOrchestrator';

function App() {
  const [currentView, setCurrentView] = useState('upload');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState({
    message: '',
    percentage: 0,
    activeAgents: []
  });

  const orchestrator = new MultiAgentOrchestrator();

  const handleDocumentUpload = async (document) => {
    setCurrentView('analyzing');
    
    try {
      // Progress callback for real-time updates
      const progressCallback = (message, percentage, activeAgents = []) => {
        setAnalysisProgress({
          message,
          percentage,
          activeAgents
        });
      };

      // Run multi-agent analysis
      const results = await orchestrator.analyzeStartup(document, progressCallback);
      
      // Transform results for display
      const transformedResults = {
        fileName: typeof document === 'string' ? 'Demo Analysis' : document.name,
        multiAgentResults: results,
        // Legacy format for compatibility
        analysis: results.rawData.document.extractedData,
        riskAssessment: {
          score: results.synthesizedReport.investmentScore,
          breakdown: {
            financial: results.rawData.risk?.financialRisk || 5,
            market: results.rawData.market?.marketRisk || 5,
            team: results.rawData.risk?.teamRisk || 5,
            competitive: results.rawData.competitive?.competitiveRisk || 5
          },
          recommendation: results.synthesizedReport.recommendation,
          redFlags: results.synthesizedReport.riskFactors || []
        },
        insights: results.synthesizedReport.keyInsights,
        investmentReport: results.synthesizedReport.executiveSummary
      };

      setAnalysisResults(transformedResults);
      setCurrentView('results');

    } catch (error) {
      console.error('Multi-agent analysis failed:', error);
      // Fallback to simplified analysis
      setCurrentView('upload');
    }
  };

  const handleNewAnalysis = () => {
    setCurrentView('upload');
    setAnalysisResults(null);
    setAnalysisProgress({ message: '', percentage: 0, activeAgents: [] });
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>VentureIQ</h1>
          <div className="header-subtitle">
            <span className="tagline">Multi-Agent Investment Analysis Platform</span>
            <span className="tech-stack">Powered by Google AI • Gemini • Vertex AI • BigQuery</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        {currentView === 'upload' && (
          <DocumentUpload onAnalysisComplete={handleDocumentUpload} />
        )}

        {currentView === 'analyzing' && (
          <MultiAgentProgress 
            progress={analysisProgress}
            onCancel={handleNewAnalysis}
          />
        )}

        {currentView === 'results' && analysisResults && (
          <AnalysisResults 
            results={analysisResults}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>VentureIQ Multi-Agent System • Transforming Investment Analysis</p>
          <div className="agent-indicators">
            <span className="agent-indicator">📄 Document Intelligence</span>
            <span className="agent-indicator">📊 Market Research</span>
            <span className="agent-indicator">⚠️ Risk Assessment</span>
            <span className="agent-indicator">🏢 Competitive Analysis</span>
            <span className="agent-indicator">💼 Portfolio Impact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;