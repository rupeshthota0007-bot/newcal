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
        <h2>{isRegister ? 'Create Vault' : 'Open Vault'}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {isRegister && (
            <input 
              type="email" 
              placeholder="Email (Optional)" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">
            {isRegister ? 'Create' : 'Unlock'}
          </button>
        </form>

        <p className="auth-toggle" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have a vault? Login' : 'New here? Create vault'}
        </p>
      </div>
    </div>
  );
};

export default Login;
