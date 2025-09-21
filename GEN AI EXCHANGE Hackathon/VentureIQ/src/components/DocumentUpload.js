// src/components/DocumentUpload.js
import React, { useState, useRef } from 'react';

function DocumentUpload({ onAnalysisComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid document (PDF, PPT, DOC, TXT, or image)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      // Pass the file to the parent component for analysis
      await onAnalysisComplete(selectedFile);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Analysis failed. Please try again.');
    }
    
    setIsUploading(false);
  };

  const runDemoAnalysis = async (demoType) => {
    setIsUploading(true);
    
    try {
      // Create a demo "file" object
      const demoFile = {
        name: `${demoType}-demo.pdf`,
        type: 'application/pdf',
        size: 1024000,
        demoType: demoType
      };
      
      await onAnalysisComplete(demoFile);
    } catch (error) {
      console.error('Demo analysis failed:', error);
      alert('Demo analysis failed. Please try again.');
    }
    
    setIsUploading(false);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="document-upload-container">
      <div className="upload-header">
        <h1>VentureIQ Investment Analysis</h1>
        <p className="upload-subtitle">
          Upload your startup pitch deck or document for instant multi-agent analysis
        </p>
      </div>

      <div className="upload-section">
        {!selectedFile ? (
          <div
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="file-input"
              onChange={handleChange}
              accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.jpg,.jpeg,.png"
            />
            
            <div className="upload-content">
              <div className="upload-icon">📄</div>
              <h3>Drop your document here</h3>
              <p>or click to browse files</p>
              <div className="supported-formats">
                <span>Supported formats:</span>
                <div className="format-tags">
                  <span className="format-tag">PDF</span>
                  <span className="format-tag">PPT</span>
                  <span className="format-tag">DOC</span>
                  <span className="format-tag">TXT</span>
                  <span className="format-tag">JPG</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="file-selected">
            <div className="file-info">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <h3>{selectedFile.name}</h3>
                <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button className="remove-file" onClick={clearFile}>✕</button>
            </div>
            
            <button 
              className="analyze-btn"
              onClick={startAnalysis}
              disabled={isUploading}
            >
              {isUploading ? 'Starting Analysis...' : 'Start Multi-Agent Analysis'}
            </button>
          </div>
        )}
      </div>

      <div className="demo-section">
        <div className="demo-header">
          <h2>Try Demo Analysis</h2>
          <p>Experience VentureIQ with sample startup data</p>
        </div>
        
        <div className="demo-options">
          <div className="demo-card" onClick={() => runDemoAnalysis('foodtech')}>
            <div className="demo-icon">🍃</div>
            <h3>Food Tech Startup</h3>
            <p>Community-driven health food brand</p>
            <div className="demo-metrics">
              <span>₹14L MRR</span>
              <span>25% Growth</span>
              <span>12 Team</span>
            </div>
            <button className="demo-btn">Analyze Demo</button>
          </div>
          
          <div className="demo-card" onClick={() => runDemoAnalysis('aitech')}>
            <div className="demo-icon">🤖</div>
            <h3>AI/Data Analytics</h3>
            <p>Enterprise data intelligence platform</p>
            <div className="demo-metrics">
              <span>$400K ARR</span>
              <span>Enterprise B2B</span>
              <span>11 Team</span>
            </div>
            <button className="demo-btn">Analyze Demo</button>
          </div>
          
          <div className="demo-card" onClick={() => runDemoAnalysis('general')}>
            <div className="demo-icon">🚀</div>
            <h3>General SaaS</h3>
            <p>Typical SaaS startup profile</p>
            <div className="demo-metrics">
              <span>$100K MRR</span>
              <span>Series A</span>
              <span>15 Team</span>
            </div>
            <button className="demo-btn">Analyze Demo</button>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Multi-Agent Analysis Features</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">📄</div>
            <h3>Document Intelligence</h3>
            <p>Extract and analyze financial data, team info, and business metrics from any document format</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <h3>Market Research</h3>
            <p>Benchmark against 500+ real startups with industry-specific performance comparisons</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">⚠️</div>
            <h3>Risk Assessment</h3>
            <p>ML-powered risk analysis with success probability predictions and red flag detection</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">🏢</div>
            <h3>Competitive Intelligence</h3>
            <p>Real-time competitive research and market positioning analysis with threat assessment</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">💼</div>
            <h3>Portfolio Impact</h3>
            <p>Investment modeling with scenario analysis, return projections, and portfolio optimization</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>2-Minute Analysis</h3>
            <p>Complete investment analysis in 2 minutes vs 20 hours of manual due diligence</p>
          </div>
        </div>
      </div>

      <div className="tech-stack-section">
        <h2>Powered by Google AI</h2>
        <div className="tech-grid">
          <div className="tech-item">
            <div className="tech-name">Gemini 1.5 Pro</div>
            <div className="tech-desc">Advanced language understanding</div>
          </div>
          <div className="tech-item">
            <div className="tech-name">Vertex AI</div>
            <div className="tech-desc">Machine learning predictions</div>
          </div>
          <div className="tech-item">
            <div className="tech-name">BigQuery</div>
            <div className="tech-desc">Real startup data benchmarking</div>
          </div>
          <div className="tech-item">
            <div className="tech-name">Cloud Vision</div>
            <div className="tech-desc">Document and image analysis</div>
          </div>
          <div className="tech-item">
            <div className="tech-name">Agent Builder</div>
            <div className="tech-desc">Autonomous research agents</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentUpload;