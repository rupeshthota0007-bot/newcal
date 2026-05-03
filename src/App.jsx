import { useState } from 'react'
import './App.css'
import Calculator from './components/Calculator/Calculator'
import ChatApp from './components/Chat/ChatApp'
import Disclaimer from './components/Chat/Disclaimer'

export default function App() {
  const [view, setView] = useState('calc') // 'calc', 'disclaimer', 'login', 'chat'
  const [isUnlocked, setIsUnlocked] = useState(false)

  const handleSecretCode = () => {
    setView('disclaimer')
  }

  const handleDisclaimerComplete = () => {
    setView('login')
  }

  const handleLogin = (success) => {
    if (success) {
      setIsUnlocked(true)
      setView('chat')
    }
  }

  const handleLogout = () => {
    setIsUnlocked(false)
    setView('calc')
  }

  return (
    <div className="app-wrapper">
      <div className="app-container">
        {view === 'calc' && (
          <Calculator onSecretCode={handleSecretCode} />
        )}

        {view === 'disclaimer' && (
          <Disclaimer onComplete={handleDisclaimerComplete} />
        )}
        
        {view === 'login' && (
          <Login onLogin={handleLogin} onCancel={() => setView('calc')} />
        )}
        
        {view === 'chat' && isUnlocked && (
          <ChatApp onLogout={handleLogout} />
        )}
      </div>
    </div>
  )
}
