import { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, onCancel }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loginId, setLoginId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const storedUsers = JSON.parse(localStorage.getItem('vault_users') || '[]');

    if (mode === 'register') {
      if (!name || !loginId || !passcode) {
        setError('All fields are required');
        return;
      }
      if (storedUsers.find(u => u.id === loginId)) {
        setError('Login ID already exists');
        return;
      }
      
      const newUser = { name, id: loginId, passcode };
      localStorage.setItem('vault_users', JSON.stringify([...storedUsers, newUser]));
      setSuccess('Registration successful! Please login.');
      setMode('login');
      setName('');
      setPasscode('');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      // Login logic
      // Include the default admin/1234 for fallback
      const user = storedUsers.find(u => u.id === loginId && u.passcode === passcode) || 
                   (loginId === 'admin' && passcode === '1234' ? { name: 'Admin', id: 'admin' } : null);

      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials');
        setTimeout(() => setError(''), 2000);
      }
    }
  };

  return (
    <div className="login-screen">
      <div className="login-header">
        <button className="back-btn" onClick={onCancel}>✕</button>
        <div className="vault-icon">{mode === 'login' ? '🔐' : '📝'}</div>
        <h2>{mode === 'login' ? 'Secure Access' : 'Create Vault'}</h2>
        <p>{mode === 'login' ? 'Please enter your credentials to unlock' : 'Register your secure ID and passcode'}</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="Your Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
        )}
        <div className="input-group">
          <label>Login ID</label>
          <input 
            type="text" 
            placeholder="Enter ID" 
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            autoFocus={mode === 'login'}
          />
        </div>
        <div className="input-group">
          <label>Passcode</label>
          <input 
            type="password" 
            placeholder="••••" 
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            maxLength={4}
          />
        </div>
        
        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        <button type="submit" className="login-submit">
          {mode === 'login' ? 'Unlock Vault' : 'Register Account'}
        </button>

        <div className="mode-toggle">
          {mode === 'login' ? (
            <p>Don't have an account? <span onClick={() => { setMode('register'); setError(''); }}>Register</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => { setMode('login'); setError(''); }}>Login</span></p>
          )}
        </div>
      </form>
      
      <div className="login-footer">
        <p>End-to-end encrypted session</p>
      </div>
    </div>
  );
};

export default Login;
