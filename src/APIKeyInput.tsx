import React, { useState, useEffect } from 'react';

interface APIKeys {
  api_key: string;
  api_secret: string;
  bearer_token: string;
  access_token: string;
  access_token_secret: string;
}

const APIKeyInput: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    api_key: '',
    api_secret: '',
    bearer_token: '',
    access_token: '',
    access_token_secret: '',
  });

  useEffect(() => {
    const savedKeys = localStorage.getItem('twitter_api_keys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('twitter_api_keys', JSON.stringify(apiKeys));
    
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/twitter-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiKeys),
      });
      
      if (response.ok) {
        alert('API keys updated successfully!');
      } else {
        alert('Failed to update API keys. Please try again.');
      }
    } catch (error) {
      console.error('Error updating API keys:', error);
      alert('An error occurred while updating API keys.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="api_key"
        value={apiKeys.api_key}
        onChange={handleInputChange}
        placeholder="API Key"
      />
      <input
        type="text"
        name="api_secret"
        value={apiKeys.api_secret}
        onChange={handleInputChange}
        placeholder="API Secret"
      />
      <input
        type="text"
        name="bearer_token"
        value={apiKeys.bearer_token}
        onChange={handleInputChange}
        placeholder="Bearer Token"
      />
      <input
        type="text"
        name="access_token"
        value={apiKeys.access_token}
        onChange={handleInputChange}
        placeholder="Access Token"
      />
      <input
        type="text"
        name="access_token_secret"
        value={apiKeys.access_token_secret}
        onChange={handleInputChange}
        placeholder="Access Token Secret"
      />
      <button type="submit">Update API Keys</button>
    </form>
  );
};

export default APIKeyInput;