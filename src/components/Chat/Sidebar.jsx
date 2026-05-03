import { useState } from 'react';

const Sidebar = ({ chats, activeChat, onSelectChat, onDeleteChat, myPeerId, onConnect }) => {
  const [search, setSearch] = useState('');
  const [targetId, setTargetId] = useState('');

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleConnect = (e) => {
    e.preventDefault();
    if (targetId.trim()) {
      onConnect(targetId);
      setTargetId('');
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(myPeerId);
    alert('Peer ID copied!');
  };

  return (
    <aside className="chat-sidebar">
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="avatar-placeholder self">JD</div>
          <div className="user-info">
            <h4>My Secure ID</h4>
            <div className="id-container" onClick={copyId} title="Click to copy">
              <span className="my-id-text">
                {myPeerId || 'Initializing...'}
              </span>
              <span className="copy-icon">📋</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="connect-peer-area">
        <form onSubmit={handleConnect} className="connect-form">
          <input 
            type="text" 
            placeholder="Enter Peer ID to connect" 
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>
      </div>

      <div className="search-container">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search chats" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="chat-list">
        {filteredChats.length === 0 ? (
          <div className="empty-chats">
            <p>No active chats</p>
            <span>Connect to a peer ID to start</span>
          </div>
        ) : (
          filteredChats.map(chat => (
            <div 
              key={chat.id} 
              className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="avatar-wrapper">
                <div className="avatar-placeholder">{getInitials(chat.name)}</div>
                <span className={`status-dot ${chat.status}`}></span>
              </div>
              <div className="chat-info">
                <div className="chat-header">
                  <span className="chat-name">{chat.name}</span>
                  <div className="chat-header-right">
                    <span className="chat-time">{chat.timestamp}</span>
                    <button 
                      className="delete-chat-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      title="Delete Chat"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="chat-preview">
                  <p className="last-msg">{chat.lastMessage}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
