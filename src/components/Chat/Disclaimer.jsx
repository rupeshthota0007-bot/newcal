import { useState, useEffect } from 'react';
import './Disclaimer.css';

const Disclaimer = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-content">
        <div className="disclaimer-icon">⚠️</div>
        <h1>DISCLAIMER</h1>
        <p>This application is intended for <span className="highlight">educational purposes only.</span> By proceeding, you acknowledge that any misuse of this tool is sole responsibility of the user.</p>
        
        <button className="skip-btn" onClick={onComplete}>
          Skip {timeLeft > 0 && `(${timeLeft}s)`}
        </button>
      </div>
    </div>
  );
};

export default Disclaimer;
