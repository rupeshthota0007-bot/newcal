import { useState, useRef, useEffect } from 'react';

const ChatWindow = ({ chat, onSendMessage, onStartCall, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onSendMessage(file, true);
      e.target.value = '';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        onSendMessage(audioFile, true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  if (!chat) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h2>Select a chat to start messaging</h2>
          <p>Send and receive messages in real-time with end-to-end encryption.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="active-user">
          <button className="mobile-back-btn" onClick={onBack}>←</button>
          <div className="avatar-placeholder sm">{chat.name[0]}</div>
          <div className="active-user-info">
            <h4>{chat.name}</h4>
            <span className={chat.status}>{chat.status}</span>
          </div>
        </div>
        <div className="chat-actions">
          <button className="action-btn" title="Audio Call" onClick={() => onStartCall('audio')}>📞</button>
          <button className="action-btn" title="Video Call" onClick={() => onStartCall('video')}>📹</button>
        </div>
      </div>

      <div className="messages-container">
        {chat.messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.sender}`}>
            <div className="message-content">
              {msg.sender === 'system' ? (
                <div className="system-message">{msg.text}</div>
              ) : msg.type === 'image' ? (
                <img src={msg.fileUrl} alt="Sent" className="sent-image" onClick={() => window.open(msg.fileUrl)} />
              ) : msg.type === 'file' && msg.fileUrl.includes('audio') ? (
                <div className="audio-message">
                  <audio controls src={msg.fileUrl}></audio>
                </div>
              ) : msg.type === 'file' ? (
                <div className="file-attachment">
                  <span className="file-icon">📄</span>
                  <div className="file-info">
                    <span className="file-name">{msg.fileName}</span>
                    <a href={msg.fileUrl} download={msg.fileName} className="download-link">Download</a>
                  </div>
                </div>
              ) : msg.type === 'call' ? (
                <div className="call-log-bubble">
                  <span className="call-icon">
                    {msg.callType === 'video' ? '📹' : '📞'}
                  </span>
                  <div className="call-info">
                    <span className="call-text">{msg.text}</span>
                    <span className="call-status-label">{msg.status}</span>
                  </div>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
              {msg.sender !== 'system' && <span className="message-time">{msg.time}</span>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <button className="attach-btn" onClick={() => fileInputRef.current.click()}>📎</button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />
        <form onSubmit={handleSubmit} className="input-form">
          <input 
            type="text" 
            placeholder={isRecording ? "Recording..." : "Type a message"} 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isRecording}
          />
        </form>
        {inputText.trim() ? (
          <button className="send-btn" onClick={handleSubmit}>➤</button>
        ) : (
          <button 
            className={`send-btn ${isRecording ? 'recording' : ''}`} 
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
