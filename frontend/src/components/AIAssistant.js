import React, { useState } from 'react';
import axios from 'axios';

const AIAssistant = ({ apiBaseUrl, user }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const getSuggestions = async (subject, topic) => {
    try {
      setLoading(true);
      const response = await axios.post(`${apiBaseUrl}/ai/suggest-content`, {
        subject,
        topic,
        department: user.department
      });
      
      if (response.data.success) {
        const suggestionsData = JSON.parse(response.data.suggestions);
        setSuggestions(suggestionsData);
      }
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressAnalysis = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${apiBaseUrl}/ai/analyze-progress`);
      
      if (response.data.success) {
        const analysisData = JSON.parse(response.data.analysis);
        setAnalysis(analysisData);
      }
    } catch (error) {
      console.error('Failed to get progress analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSmartSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${apiBaseUrl}/ai/smart-search`, {
        query: searchQuery
      });
      
      if (response.data.success) {
        const results = JSON.parse(response.data.results);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Smart search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      <div className="page-header">
        <h1 className="page-title">AI Assistant</h1>
        <p className="page-subtitle">Get intelligent insights and suggestions</p>
      </div>

      {/* Content Suggestions */}
      <div className="content-card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="card-title">Content Suggestions</h2>
        <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
          Get AI-powered suggestions for teaching content and methods
        </p>
        
        <button 
          onClick={() => getSuggestions('Programming', 'Variables & Data Types')}
          className="btn-primary"
          disabled={loading}
          style={{ marginRight: '1rem' }}
        >
          {loading ? 'Getting Suggestions...' : 'Get Content Suggestions'}
        </button>

        {suggestions && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#1a1d26', borderRadius: '8px' }}>
            <h3 style={{ color: '#d4a843', marginBottom: '1rem' }}>AI Suggestions</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#e8e9ed', fontSize: '1rem' }}>Content Items:</h4>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.5rem' }}>
                {suggestions.content_items?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#e8e9ed', fontSize: '1rem' }}>Learning Objectives:</h4>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.5rem' }}>
                {suggestions.learning_objectives?.map((obj, index) => (
                  <li key={index}>{obj}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#e8e9ed', fontSize: '1rem' }}>Teaching Methods:</h4>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.5rem' }}>
                {suggestions.teaching_methods?.map((method, index) => (
                  <li key={index}>{method}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Progress Analysis */}
      <div className="content-card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="card-title">Progress Analysis</h2>
        <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
          Get AI analysis of your teaching progress and personalized recommendations
        </p>
        
        <button 
          onClick={getProgressAnalysis}
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze My Progress'}
        </button>

        {analysis && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#1a1d26', borderRadius: '8px' }}>
            <h3 style={{ color: '#d4a843', marginBottom: '1rem' }}>AI Analysis</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#e8e9ed', fontSize: '1rem' }}>Overall Performance:</h4>
              <p style={{ color: '#9ca3af' }}>{analysis.overall_performance}</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#e8e9ed', fontSize: '1rem' }}>Strengths:</h4>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.5rem' }}>
                {analysis.strengths?.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#e8e9ed', fontSize: '1rem' }}>Recommendations:</h4>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.5rem' }}>
                {analysis.recommendations?.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#e8e9ed', fontSize: '1rem' }}>Next Suggested Topics:</h4>
              <ul style={{ color: '#9ca3af', paddingLeft: '1.5rem' }}>
                {analysis.next_suggested_topics?.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Smart Search */}
      <div className="content-card">
        <h2 className="card-title">Smart Search</h2>
        <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
          Search your diary entries using natural language
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., 'Show me all Database topics I covered last month'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button 
            onClick={performSmartSearch}
            className="btn-primary"
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#1a1d26', borderRadius: '8px' }}>
            <h3 style={{ color: '#d4a843', marginBottom: '1rem' }}>Search Results</h3>
            <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
              <strong>Interpretation:</strong> {searchResults.interpretation}
            </p>
            
            {searchResults.matches?.map((match, index) => (
              <div key={index} style={{ 
                marginBottom: '1rem', 
                padding: '0.75rem', 
                background: '#13161f', 
                borderRadius: '6px',
                border: '1px solid #2a2d3a'
              }}>
                <div style={{ color: '#e8e9ed', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {match.summary}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                  {match.relevance}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;