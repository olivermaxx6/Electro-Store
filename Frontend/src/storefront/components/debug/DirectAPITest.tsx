import React, { useState, useEffect } from 'react';

const DirectAPITest: React.FC = () => {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `http://127.0.0.1:8001/api/public/store-settings/?t=${Date.now()}&r=${Math.random()}`;
      console.log('Direct API Test - URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('Direct API Test - Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Direct API Test - Data:', data);
      setApiData(data);
      
    } catch (err) {
      console.error('Direct API Test - Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      background: 'white', 
      border: '2px solid blue', 
      padding: '10px', 
      zIndex: 9999,
      maxWidth: '400px',
      fontSize: '12px'
    }}>
      <h3>Direct API Test</h3>
      <button onClick={testAPI} style={{ marginBottom: '10px', padding: '5px 10px', fontSize: '10px' }}>
        🔄 Test API
      </button>
      <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      <p><strong>Error:</strong> {error || 'None'}</p>
      {apiData && (
        <div>
          <p><strong>Phone:</strong> "{apiData.phone}"</p>
          <p><strong>Email:</strong> "{apiData.email}"</p>
          <p><strong>City:</strong> "{apiData.city}"</p>
          <p><strong>Country:</strong> "{apiData.country}"</p>
          <p><strong>Address:</strong> "{apiData.street_address}"</p>
          <details>
            <summary>Full API Response</summary>
            <pre>{JSON.stringify(apiData, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default DirectAPITest;
