import React from 'react';
import { useContactInfo } from '../../hooks/useContactInfo';

const DebugContactInfo: React.FC = () => {
  const { contactInfo, loading, error, refresh } = useContactInfo();

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid red', 
      padding: '10px', 
      zIndex: 9999,
      maxWidth: '300px',
      fontSize: '12px'
    }}>
      <h3>Debug Contact Info</h3>
      <button onClick={refresh} style={{ marginBottom: '10px', padding: '5px 10px', fontSize: '10px' }}>
        🔄 Refresh
      </button>
      <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      <p><strong>Error:</strong> {error || 'None'}</p>
      <p><strong>Phone:</strong> "{contactInfo.phone}" (Type: {typeof contactInfo.phone})</p>
      <p><strong>Email:</strong> "{contactInfo.email}" (Type: {typeof contactInfo.email})</p>
      <p><strong>City:</strong> "{contactInfo.city}" (Type: {typeof contactInfo.city})</p>
      <p><strong>Country:</strong> "{contactInfo.country}" (Type: {typeof contactInfo.country})</p>
      <p><strong>Address:</strong> "{contactInfo.address}" (Type: {typeof contactInfo.address})</p>
      <p><strong>Phone Empty:</strong> {!contactInfo.phone ? 'Yes' : 'No'}</p>
      <p><strong>Email Empty:</strong> {!contactInfo.email ? 'Yes' : 'No'}</p>
      <details>
        <summary>Full Data</summary>
        <pre>{JSON.stringify(contactInfo, null, 2)}</pre>
      </details>
    </div>
  );
};

export default DebugContactInfo;
