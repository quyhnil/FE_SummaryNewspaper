import React, { useState, useEffect } from 'react';
import './AuthPage.css';

interface TwitterAuth {
  api_key: string;
  api_secret: string;
  bearer_token: string;
  access_token: string;
  access_token_secret: string;
}

interface AuthPageProps {
  onAuthComplete: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthComplete }) => {
  const [auth, setAuth] = useState<TwitterAuth>({
    api_key: '',
    api_secret: '',
    bearer_token: '',
    access_token: '',
    access_token_secret: '',
  });

  useEffect(() => {
    const storedAuth = localStorage.getItem('twitterAuth');
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuth(prevAuth => ({
      ...prevAuth,
      [name]: value,
    }));
  };

  const sendAuthToBackend = async (authData: TwitterAuth) => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/twitter-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Response:', data);
    } catch (error) {
      console.error('Error sending auth data to backend:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem('twitterAuth', JSON.stringify(auth));
    await sendAuthToBackend(auth);
    onAuthComplete();
  };

  return (
    <div className="auth-page">
      <h1>Twitter Authentication</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="api_key">API Key:</label>
          <input
            type="text"
            id="api_key"
            name="api_key"
            value={auth.api_key}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="api_secret">API Secret:</label>
          <input
            type="password"
            id="api_secret"
            name="api_secret"
            value={auth.api_secret}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="bearer_token">Bearer Token:</label>
          <input
            type="text"
            id="bearer_token"
            name="bearer_token"
            value={auth.bearer_token}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="access_token">Access Token:</label>
          <input
            type="text"
            id="access_token"
            name="access_token"
            value={auth.access_token}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="access_token_secret">Access Token Secret:</label>
          <input
            type="password"
            id="access_token_secret"
            name="access_token_secret"
            value={auth.access_token_secret}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Save and Continue</button>
      </form>
    </div>
  );
};

export default AuthPage;