// src/services/agents/documentAgent.js
import { GoogleGenerativeAI } from '@google/generative-ai';

class DocumentAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    this.agentName = "Document Intelligence Agent";
  }

  async analyze(documentInput) {
    console.log(`🤖 ${this.agentName} starting analysis...`);
    
    try {
      // Handle different input types (file, text, mock data)
      let documentText;
      
      if (typeof documentInput === 'string') {
        documentText = documentInput;
      } else if (documentInput && documentInput.name) {
        // File upload - for demo, use mock data based on filename
        documentText = this.getMockDocumentText(documentInput.name);
      } else {
        throw new Error('Invalid document input');
      }

      // Enhanced document analysis with structured extraction
      const extractedData = await this.extractStructuredData(documentText);
      const financialMetrics = await this.analyzeFinancialMetrics(documentText);
      const teamAnalysis = await this.analyzeTeamComposition(documentText);
      const businessModelAnalysis = await this.analyzeBusinessModel(documentText);
      
      const result = {
        agentName: this.agentName,
        timestamp: new Date().toISOString(),
        confidence: this.calculateConfidence(extractedData),
        extractedData,
        financialMetrics,
        teamAnalysis,
        businessModelAnalysis,
        insights: this.generateDocumentInsights(extractedData, financialMetrics, teamAnalysis)
      };

      console.log(`✅ ${this.agentName} analysis complete`);
      return result;

    } catch (error) {
      console.error(`❌ ${this.agentName} failed:`, error);
      return this.getFallbackAnalysis(documentInput);
    }
  }

  async extractStructuredData(documentText) {
    const prompt = `
    You are a senior investment analyst. Extract key startup data from this document.
    Return ONLY valid JSON with this exact structure:

    {
      "companyName": "string",
      "industry": "string", 
      "foundedYear": "string",
      "location": "string",
      "revenue": "string",
      "customers": "string",
      "teamSize": "string",
      "fundingStage": "string",
      "fundingAmount": "string",
      "marketSize": "string",
      "growthRate": "string",
      "burnRate": "string",
      "runway": "string",
      "valuation": "string",
      "previousFunding": "string"
    }

    Document: ${documentText}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found');
    } catch (error) {
      console.error('Structured extraction failed:', error);
      return this.getDefaultStructuredData();
    }
  }

  async analyzeFinancialMetrics(documentText) {
    const prompt = `
    Analyze the financial health of this startup. Look for:
    - Revenue trends and sustainability
    - Unit economics (CAC, LTV, etc.)
    - Cash flow patterns
    - Burn rate efficiency
    - Path to profitability

    Return JSON format:
    {
      "revenueGrowth": "assessment",
      "unitEconomics": "analysis", 
      "cashFlow": "status",
      "burnEfficiency": "rating",
      "profitabilityPath": "timeline",
      "financialRisks": ["risk1", "risk2"],
      "financialStrengths": ["strength1", "strength2"]
    }

    Document: ${documentText}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Financial analysis failed');
    } catch (error) {
      return this.getDefaultFinancialMetrics();
    }
  }

  async analyzeTeamComposition(documentText) {
    const prompt = `
    Analyze the founding team and organizational structure:
    - Founder backgrounds and expertise
    - Team completeness for current stage
    - Key hiring needs
    - Advisory board strength
    - Organizational risks

    Return JSON:
    {
      "founderExperience": "assessment",
      "teamCompleteness": "rating",
      "keyRoles": ["role1", "role2"],
      "advisors": "quality assessment",
      "cultureFit": "analysis",
      "teamRisks": ["risk1", "risk2"],
      "teamStrengths": ["strength1", "strength2"]
    }

    Document: ${documentText}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Team analysis failed');
    } catch (error) {
      return this.getDefaultTeamAnalysis();
    }
  }

  async analyzeBusinessModel(documentText) {
    const prompt = `
    Analyze the business model viability:
    - Revenue model sustainability
    - Market fit evidence
    - Scalability potential
    - Competitive moats
    - Go-to-market strategy

    Return JSON:
    {
      "revenueModel": "analysis",
      "marketFit": "evidence level",
      "scalability": "potential",
      "competitiveMoats": ["moat1", "moat2"],
      "gtmStrategy": "assessment",
      "modelRisks": ["risk1", "risk2"],
      "modelStrengths": ["strength1", "strength2"]
    }

    Document: ${documentText}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Business model analysis failed');
    } catch (error) {
      return this.getDefaultBusinessModel();
    }
  }

  generateDocumentInsights(extractedData, financialMetrics, teamAnalysis) {
    const insights = [];

    // Revenue insight
    if (extractedData.revenue && extractedData.customers) {
      const revenue = this.parseNumericValue(extractedData.revenue);
      const customers = this.parseNumericValue(extractedData.customers);
      if (revenue && customers) {
        const arpu = revenue / customers;
        insights.push({
          type: 'financial',
          insight: `ARPU of $${Math.round(arpu)}`,
          implication: arpu > 100 ? 'Strong unit economics' : 'Low ARPU may indicate scaling challenges',
          impact: arpu > 100 ? 8 : 4
        });
      }
    }

    // Growth insight
    if (extractedData.growthRate) {
      const growth = parseFloat(extractedData.growthRate.replace('%', ''));
      if (growth) {
        insights.push({
          type: 'growth',
          insight: `${growth}% growth rate`,
          implication: growth > 20 ? 'Exceptional growth trajectory' : 'Moderate growth pace',
          impact: growth > 20 ? 9 : 6
        });
      }
    }

    // Team size insight
    if (extractedData.teamSize && extractedData.revenue) {
      const teamSize = this.parseNumericValue(extractedData.teamSize);
      const revenue = this.parseNumericValue(extractedData.revenue);
      if (teamSize && revenue) {
        const revenuePerEmployee = revenue / teamSize;
        insights.push({
          type: 'efficiency',
          insight: `$${Math.round(revenuePerEmployee)}K revenue per employee`,
          implication: revenuePerEmployee > 100 ? 'High team efficiency' : 'Team efficiency below benchmarks',
          impact: revenuePerEmployee > 100 ? 7 : 5
        });
      }
    }

    return insights.sort((a, b) => b.impact - a.impact);
  }

  calculateConfidence(extractedData) {
    let confidence = 0;
    const keyFields = ['companyName', 'revenue', 'customers', 'teamSize', 'fundingStage'];
    
    keyFields.forEach(field => {
      if (extractedData[field] && extractedData[field] !== 'Not specified') {
        confidence += 20;
      }
    });
    
    return Math.min(100, confidence);
  }

  parseNumericValue(valueString) {
    if (!valueString) return 0;
    
    const cleaned = valueString.replace(/[^\d.]/g, '');
    const number = parseFloat(cleaned) || 0;
    
    if (valueString.toLowerCase().includes('b')) return number * 1000000;
    if (valueString.toLowerCase().includes('m')) return number * 1000;
    if (valueString.toLowerCase().includes('k')) return number;
    
    return number;
  }

  getMockDocumentText(filename) {
    // Enhanced mock data based on your company dataset
    const mockData = {
      'foodieai': `
        FoodieAI - AI-Powered Restaurant Discovery Platform
        
        Company Overview:
        Founded: 2023
        Location: San Francisco, CA
        Industry: Food Technology / AI
        
        Financial Metrics:
        - Monthly Recurring Revenue: $120K
        - Annual Revenue Run Rate: $1.44M
        - Customer Base: 15,000 active monthly users
        - Average Revenue Per User: $8/month
        - Monthly Growth Rate: 28%
        - Customer Acquisition Cost: $25
        - Lifetime Value: $240
        - Monthly Burn Rate: $95K
        - Current Runway: 16 months
        - Previous Funding: $500K pre-seed
        
        Team:
        - Total Employees: 14
        - Engineering: 6 (ML specialists, mobile devs)
        - Sales & Marketing: 4
        - Operations: 2
        - Leadership: 2 (CEO: ex-Google, CTO: ex-Uber)
        
        Business Model:
        - SaaS subscriptions for restaurants: $149/month
        - Consumer premium subscriptions: $9.99/month  
        - Commission on bookings: 3.5%
        - Data licensing to food brands: $50K/contract
        
        Current Funding Round:
        - Raising: $2.5M Series A
        - Use of funds: Product development (40%), Marketing (35%), Team expansion (25%)
        - Target valuation: $15M pre-money
        
        Traction:
        - 850+ restaurant partners across 12 cities
        - 4.9 star app rating (App Store)
        - Featured in TechCrunch, Food & Wine, Eater
        - 85% customer retention rate
        - 40% month-over-month booking growth
      `,
      
      'mediconnect': `
        MediConnect - Healthcare AI Diagnostic Platform
        
        Company Overview:
        Founded: 2022
        Location: Boston, MA
        Industry: Healthcare Technology / AI
        
        Financial Metrics:
        - Monthly Recurring Revenue: $85K
        - Annual Revenue Run Rate: $1.02M
        - Customer Base: 35 medical practices
        - Average Revenue Per Practice: $2,400/month
        - Monthly Growth Rate: 32%
        - Customer Acquisition Cost: $8,500
        - Lifetime Value: $28,800
        - Monthly Burn Rate: $75K
        - Current Runway: 14 months
        
        Team:
        - Total Employees: 11
        - Engineering: 5 (AI/ML engineers, backend)
        - Medical Affairs: 3 (MDs, clinical validation)
        - Sales: 2
        - Leadership: 1 (CEO: MD from Johns Hopkins)
        
        Business Model:
        - SaaS platform for medical practices: $2,400/month
        - Per-diagnosis fee: $15
        - API licensing to EHR providers: $100K/year
        - Training and certification: $5K per practice
        
        Current Funding Round:
        - Raising: $1.8M Seed
        - Use of funds: Clinical trials (45%), Sales team (30%), Product (25%)
        - Target valuation: $8M pre-money
        
        Technology & Compliance:
        - FDA 510(k) clearance pending
        - HIPAA compliant infrastructure
        - Integration with Epic, Cerner, Allscripts
        - 94% diagnostic accuracy in clinical trials
        - Processing 2,500+ cases monthly
      `
    };

    const key = filename.toLowerCase().replace(/[^a-z]/g, '');
    return mockData[key] || mockData['foodieai'];
  }

  // Fallback methods
  getDefaultStructuredData() {
    return {
      companyName: "Sample Company",
      industry: "Technology",
      foundedYear: "2023",
      location: "San Francisco",
      revenue: "$100K MRR",
      customers: "10,000",
      teamSize: "12",
      fundingStage: "Series A",
      fundingAmount: "$2M",
      marketSize: "$50B",
      growthRate: "25%",
      burnRate: "$80K",
      runway: "18 months",
      valuation: "Not specified",
      previousFunding: "$500K"
    };
  }

  getDefaultFinancialMetrics() {
    return {
      revenueGrowth: "Strong month-over-month growth",
      unitEconomics: "Positive unit economics with healthy LTV/CAC ratio",
      cashFlow: "Negative but improving",
      burnEfficiency: "Moderate efficiency",
      profitabilityPath: "24-36 months to profitability",
      financialRisks: ["High burn rate", "Revenue concentration"],
      financialStrengths: ["Strong growth", "Recurring revenue model"]
    };
  }

  getDefaultTeamAnalysis() {
    return {
      founderExperience: "Strong technical background",
      teamCompleteness: "Well-rounded for current stage",
      keyRoles: ["VP Sales", "Head of Marketing"],
      advisors: "Industry veterans providing guidance",
      cultureFit: "Strong engineering culture",
      teamRisks: ["Key person dependency", "Limited sales experience"],
      teamStrengths: ["Technical expertise", "Product vision"]
    };
  }

  getDefaultBusinessModel() {
    return {
      revenueModel: "Recurring SaaS model with multiple revenue streams",
      marketFit: "Strong early indicators",
      scalability: "High scalability potential",
      competitiveMoats: ["Technology differentiation", "Network effects"],
      gtmStrategy: "Direct sales with inbound marketing",
      modelRisks: ["Market timing", "Customer concentration"],
      modelStrengths: ["Recurring revenue", "High margins"]
    };
  }

  getFallbackAnalysis(documentInput) {
    return {
      agentName: this.agentName,
      timestamp: new Date().toISOString(),
      confidence: 50,
      extractedData: this.getDefaultStructuredData(),
      financialMetrics: this.getDefaultFinancialMetrics(),
      teamAnalysis: this.getDefaultTeamAnalysis(),
      businessModelAnalysis: this.getDefaultBusinessModel(),
      insights: [
        {
          type: 'fallback',
          insight: 'Analysis completed with limited data',
          implication: 'Additional documentation needed for comprehensive assessment',
          impact: 5
        }
      ]
    };
  }
}

export { DocumentAgent };