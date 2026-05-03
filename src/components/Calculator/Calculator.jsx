import { useState, useEffect } from 'react';
import './Calculator.css';

const Calculator = ({ onSecretCode }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleButtonClick = (value) => {
    if (value === 'AC') {
      setDisplay('0');
      setEquation('');
      return;
    }

    if (value === 'DEL') {
      if (display.length === 1) {
        setDisplay('0');
      } else {
        setDisplay(display.slice(0, -1));
      }
      return;
    }

    if (value === '=') {
      if (display === '1456') {
        if (onSecretCode) onSecretCode();
        return;
      }
      try {
        const formula = (equation + display)
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-');
        
        // Safety check for math expressions only
        if (/^[0-9+\-*/().\s%]+$/.test(formula)) {
          const result = Function('"use strict"; return (' + formula + ')')();
          setDisplay(String(result));
          setEquation('');
        } else {
          setDisplay('Error');
        }
      } catch (error) {
        setDisplay('Error');
      }
      return;
    }

    if (['+', '−', '×', '÷', '%'].includes(value)) {
      setEquation(display + ' ' + value + ' ');
      setDisplay('0');
      return;
    }

    if (display === '0') {
      setDisplay(value);
    } else {
      setDisplay(display + value);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (/[0-9]/.test(key)) handleButtonClick(key);
      if (key === '.') handleButtonClick('.');
      if (key === '+') handleButtonClick('+');
      if (key === '-') handleButtonClick('−');
      if (key === '*') handleButtonClick('×');
      if (key === '/') handleButtonClick('÷');
      if (key === 'Enter' || key === '=') handleButtonClick('=');
      if (key === 'Backspace') handleButtonClick('DEL');
      if (key === 'Escape') handleButtonClick('AC');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, equation]);

  return (
    <div className="calculator-container">
      <div className="calculator-card">
        <div className="calc-display">
          <div className="equation">{equation}</div>
          <div className="current-value">{display}</div>
        </div>
        <div className="calculator-buttons">
          <button className="calc-btn function" onClick={() => handleButtonClick('AC')}>C</button>
          <button className="calc-btn function" onClick={() => handleButtonClick('DEL')}>⌫</button>
          <button className="calc-btn function" onClick={() => handleButtonClick('%')}>%</button>
          <button className="calc-btn operator" onClick={() => handleButtonClick('÷')}>÷</button>

          <button className="calc-btn number" onClick={() => handleButtonClick('7')}>7</button>
          <button className="calc-btn number" onClick={() => handleButtonClick('8')}>8</button>
          <button className="calc-btn number" onClick={() => handleButtonClick('9')}>9</button>
          <button className="calc-btn operator" onClick={() => handleButtonClick('×')}>×</button>

          <button className="calc-btn number" onClick={() => handleButtonClick('4')}>4</button>
          <button className="calc-btn number" onClick={() => handleButtonClick('5')}>5</button>
          <button className="calc-btn number" onClick={() => handleButtonClick('6')}>6</button>
          <button className="calc-btn operator" onClick={() => handleButtonClick('−')}>-</button>

          <button className="calc-btn number" onClick={() => handleButtonClick('1')}>1</button>
          <button className="calc-btn number" onClick={() => handleButtonClick('2')}>2</button>
          <button className="calc-btn number" onClick={() => handleButtonClick('3')}>3</button>
          <button className="calc-btn operator" onClick={() => handleButtonClick('+')}>+</button>

          <button className="calc-btn number" onClick={() => handleButtonClick('0')}>0</button>
          <button className="calc-btn number" onClick={() => handleButtonClick('.')}>.</button>
          <button className="calc-btn operator primary" onClick={() => handleButtonClick('=')}>=</button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
