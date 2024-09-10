import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './DashBoard';
import AuthPage from './AuthPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('twitterAuth');
    if (storedAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthComplete = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <AuthPage onAuthComplete={handleAuthComplete} />
      ) : (
        <>
          <h1>Data Table</h1>
          <Dashboard />
        </>
      )}
      
    </div>
  );
}

export default App;