import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';

const DebugPage = () => {
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken?.substring(0, 50) + '...' || 'No token');
        
        const response = await axiosInstance.get('/auth/whoami');
        setUserData(response);
      } catch (err) {
        setError(`Error: ${err.message}`);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🐛 Debug Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h2>Token Status</h2>
        <p><strong>Token in localStorage:</strong> {token || 'None'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h2>Current User Info</h2>
        {userData ? (
          <div>
            <p><strong>Name:</strong> {userData.user?.name}</p>
            <p><strong>Email:</strong> {userData.user?.email}</p>
            <p><strong>Role:</strong> {userData.user?.role}</p>
            <p><strong>ID:</strong> {userData.user?.id}</p>
            <p style={{ color: 'green', fontWeight: 'bold' }}>{userData.user?.message}</p>
          </div>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h2>Check Browser Console</h2>
        <p>Open F12 Developer Tools → Console tab to see detailed logs</p>
        <button onClick={() => window.location.href = '/'}>Go Home</button>
      </div>
    </div>
  );
};

export default DebugPage;
