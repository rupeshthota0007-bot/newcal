import { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, onCancel }) => {
  const [isRegister, setIsRegister] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('vault_users') || '[]');

    if (isRegister) {
      if (users.find(u => u.username === username)) {
        setError('Username already exists');
        return;
      }
      users.push({ username, password, email });
      localStorage.setItem('vault_users', JSON.stringify(users));
      setIsRegister(false);
      setError('');
      alert('Registration successful! Please login.');
    } else {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(true);
      } else {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <button className="close-btn" onClick={onCancel}>✕</button>
        
        <div className="login-header">
          <h1>{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="subheading">{isRegister ? 'Secure Channel Registration' : 'Access your private vault'}</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input 
              type="text" 
              placeholder={isRegister ? "Choose Username" : "Username"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="input-group">
              <span className="input-icon">✉️</span>
              <input 
                type="email" 
                placeholder="Email (Optional)" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input 
              type="password" 
              placeholder={isRegister ? "Choose Password" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className="auth-toggle">
          {isRegister ? 'Already registered?' : "Don't have an account?"}{' '}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Login' : 'Create one'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
