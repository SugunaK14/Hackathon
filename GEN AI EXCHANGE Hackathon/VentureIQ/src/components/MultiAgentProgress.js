// src/components/MultiAgentProgress.js
import React, { useState, useEffect } from 'react';

function MultiAgentProgress({ progress, onCancel }) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const agents = [
    {
      id: 'document',
      name: 'Document Intelligence',
      icon: '📄',
      description: 'Extracting and analyzing document content',
      color: '#3B82F6'
    },
    {
      id: 'market',
      name: 'Market Research',
      icon: '📊',
      description: 'Analyzing market position and benchmarks',
      color: '#10B981'
    },
    {
      id: 'risk',
      name: 'Risk Assessment',
      icon: '⚠️',
      description: 'Evaluating investment risks and red flags',
      color: '#F59E0B'
    },
    {
      id: 'competitive',
      name: 'Competitive Intelligence',
      icon: '🏢',
      description: 'Researching competitive landscape',
      color: '#8B5CF6'
    },
    {
      id: 'portfolio',
      name: 'Portfolio Impact',
      icon: '💼',
      description: 'Modeling portfolio and investment impact',
      color: '#EC4899'
    }
  ];

  const getAgentStatus = (agentId) => {
    if (progress.percentage < 20) {
      return agentId === 'document' ? 'active' : 'pending';
    } else if (progress.percentage < 40) {
      return agentId === 'document' ? 'completed' : 'pending';
    } else if (progress.percentage < 90) {
      if (agentId === 'document') return 'completed';
      return ['market', 'risk', 'competitive', 'portfolio'].includes(agentId) ? 'active' : 'pending';
    } else {
      return 'completed';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'active': return '🔄';
      case 'pending': return '⏳';
      default: return '⏳';
    }
  };

  return (
    <div className="multiagent-progress-container">
      <div className="progress-header">
        <div className="progress-title">
          <h1>Multi-Agent Analysis in Progress</h1>
          <p className="progress-subtitle">5 AI agents working simultaneously on your startup</p>
        </div>
        <button className="cancel-btn" onClick={onCancel}>
          Cancel Analysis
        </button>
      </div>

      <div className="overall-progress">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          <span className="progress-text">{progress.percentage}% Complete</span>
        </div>
        <p className="progress-message">{progress.message}</p>
      </div>

      <div className="agents-grid">
        {agents.map((agent) => {
          const status = getAgentStatus(agent.id);
          const isActive = status === 'active';
          
          return (
            <div 
              key={agent.id} 
              className={`agent-card ${status} ${isActive ? 'pulse' : ''}`}
              style={{ 
                borderColor: status === 'active' ? agent.color : '#e5e7eb',
                boxShadow: status === 'active' ? `0 0 20px ${agent.color}40` : 'none'
              }}
            >
              <div className="agent-header">
                <div className="agent-icon-container">
                  <span className="agent-icon">{agent.icon}</span>
                  <span className="status-icon">{getStatusIcon(status)}</span>
                </div>
                <div className="agent-info">
                  <h3 className="agent-name">{agent.name}</h3>
                  <p className="agent-description">{agent.description}</p>
                </div>
              </div>
              
              <div className="agent-status">
                <div className={`status-indicator ${status}`}>
                  {status === 'pending' && 'Waiting...'}
                  {status === 'active' && (
                    <span className="working-animation">
                      Working{'⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'[animationPhase]}
                    </span>
                  )}
                  {status === 'completed' && 'Analysis Complete'}
                </div>
                
                {status === 'active' && (
                  <div className="agent-details">
                    {agent.id === 'document' && (
                      <ul className="task-list">
                        <li>Extracting company metrics</li>
                        <li>Analyzing financial data</li>
                        <li>Evaluating team composition</li>
                      </ul>
                    )}
                    {agent.id === 'market' && (
                      <ul className="task-list">
                        <li>Benchmarking against database</li>
                        <li>Market size validation</li>
                        <li>Positioning analysis</li>
                      </ul>
                    )}
                    {agent.id === 'risk' && (
                      <ul className="task-list">
                        <li>Financial risk modeling</li>
                        <li>Red flag detection</li>
                        <li>Scenario analysis</li>
                      </ul>
                    )}
                    {agent.id === 'competitive' && (
                      <ul className="task-list">
                        <li>Competitor research</li>
                        <li>Market positioning</li>
                        <li>Threat assessment</li>
                      </ul>
                    )}
                    {agent.id === 'portfolio' && (
                      <ul className="task-list">
                        <li>Impact modeling</li>
                        <li>Return projections</li>
                        <li>Portfolio optimization</li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="analysis-stats">
        <div className="stat-item">
          <span className="stat-number">5</span>
          <span className="stat-label">AI Agents</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">∞</span>
          <span className="stat-label">Data Points</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">2min</span>
          <span className="stat-label">vs 20hrs Manual</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">95%</span>
          <span className="stat-label">Accuracy</span>
        </div>
      </div>

      <div className="tech-stack-indicator">
        <p>Powered by</p>
        <div className="tech-badges">
          <span className="tech-badge">Gemini 1.5 Pro</span>
          <span className="tech-badge">Vertex AI</span>
          <span className="tech-badge">BigQuery</span>
          <span className="tech-badge">Cloud Vision</span>
          <span className="tech-badge">Agent Builder</span>
        </div>
      </div>
    </div>
  );
}

export default MultiAgentProgress;