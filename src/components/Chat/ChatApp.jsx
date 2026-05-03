import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import './ChatApp.css';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import CallUI from '../Call/CallUI';

const ChatApp = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [showCall, setShowCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [myPeerId, setMyPeerId] = useState('');
  const [chats, setChats] = useState([]);
  const [peer, setPeer] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  
  const connections = useRef({});

  const generateShortId = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  useEffect(() => {
    let savedId = localStorage.getItem('vault_peer_id');
    if (!savedId) {
      savedId = generateShortId();
      localStorage.setItem('vault_peer_id', savedId);
    }
    
    const newPeer = new Peer(savedId, {
      debug: 1, 
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          { urls: 'stun:stun.services.mozilla.com' }
        ],
        sdpSemantics: 'unified-plan'
      }
    });
    
    newPeer.on('open', (id) => {
      setMyPeerId(id);
      localStorage.setItem('vault_peer_id', id);
    });

    newPeer.on('connection', (conn) => {
      setupConnection(conn);
    });

    newPeer.on('call', (call) => {
      setIncomingCall(call);
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
    };
  }, []);

  const setupConnection = (conn) => {
    conn.on('data', (data) => {
      if (data.type === 'ping') return; 
      if (data.type === 'message') {
        updateMessages(conn.peer, { text: data.text, type: 'text' }, 'them');
      } else if (data.type === 'file') {
        const blob = new Blob([data.data], { type: data.fileType });
        const fileUrl = URL.createObjectURL(blob);
        updateMessages(conn.peer, { 
          type: data.fileType.startsWith('image/') ? 'image' : 'file',
          fileUrl,
          fileName: data.fileName 
        }, 'them');
      }
    });

    conn.on('open', () => {
      connections.current[conn.peer] = conn;
      addChatIfNew(conn.peer);
      updateMessages(conn.peer, { text: 'You are now connected securely.', type: 'system' }, 'system');
      
      // Heartbeat to keep connection fast
      const heartbeat = setInterval(() => {
        if (conn.open) conn.send({ type: 'ping' });
      }, 15000);

      conn.on('close', () => clearInterval(heartbeat));
    });
  };

  const addChatIfNew = (peerId) => {
    setChats(prev => {
      if (prev.find(c => c.id === peerId)) return prev;
      return [...prev, {
        id: peerId,
        name: `Peer: ${peerId.substring(0, 8)}`,
        status: 'online',
        lastMessage: 'Connected',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: []
      }];
    });
  };

  const updateMessages = (peerId, content, sender) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChats(prev => {
      return prev.map(chat => {
        if (chat.id === peerId) {
          const newMessage = { 
            id: Date.now(), 
            sender, 
            time,
            ...content
          };
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: content.text || content.fileName || 'Attachment',
            timestamp: time
          };
        }
        return chat;
      });
    });
  };

  const handleSendMessage = (content, isFile = false) => {
    if (!activeChat) return;
    const conn = connections.current[activeChat.id];
    if (!conn || !conn.open) return;

    if (isFile) {
      const file = content;
      const reader = new FileReader();
      reader.onload = () => {
        conn.send({
          type: 'file',
          fileName: file.name,
          fileType: file.type,
          data: reader.result
        });
        
        const fileUrl = URL.createObjectURL(file);
        updateMessages(activeChat.id, { 
          type: file.type.startsWith('image/') ? 'image' : 'file',
          fileUrl,
          fileName: file.name 
        }, 'me');
      };
      reader.readAsArrayBuffer(file);
    } else {
      if (!content.trim()) return;
      conn.send({ type: 'message', text: content });
      updateMessages(activeChat.id, { text: content, type: 'text' }, 'me');
    }
  };

  const connectToPeer = (peerId) => {
    if (!peer || !peerId.trim() || peerId === myPeerId) return;
    
    
    if (connections.current[peerId] && connections.current[peerId].open) {
      const existingChat = chats.find(c => c.id === peerId);
      if (existingChat) setActiveChat(existingChat);
      return;
    }

    const conn = peer.connect(peerId);
    setupConnection(conn);
    
    
    addChatIfNew(peerId);
    const newChat = {
      id: peerId,
      name: `Peer: ${peerId.substring(0, 8)}`,
      status: 'online',
      lastMessage: 'Connecting...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: []
    };
    setActiveChat(newChat);
  };

  const startCall = (type) => {
    if (!activeChat) return;
    setCallType(type);
    setShowCall(true);
  };

  
  useEffect(() => {
    if (incomingCall) {
      const peerId = incomingCall.peer;
      const type = incomingCall.metadata?.type || 'video'; // Default to video if unknown
      setCallType(type);
      addChatIfNew(peerId);
    }
  }, [incomingCall]);

  
  useEffect(() => {
    if (activeChat) {
      const updated = chats.find(c => c.id === activeChat.id);
      if (updated) setActiveChat(updated);
    }
  }, [chats]);

  const deleteChat = (peerId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setChats(prev => prev.filter(c => c.id !== peerId));
      if (activeChat && activeChat.id === peerId) {
        setActiveChat(null);
      }
      if (connections.current[peerId]) {
        connections.current[peerId].close();
        delete connections.current[peerId];
      }
    }
  };

  return (
    <div className={`chat-app-container ${activeChat ? 'showing-chat' : ''}`}>
      <Sidebar 
        chats={chats} 
        activeChat={activeChat} 
        onSelectChat={setActiveChat}
        onDeleteChat={deleteChat}
        myPeerId={myPeerId}
        onConnect={connectToPeer}
      />
      <ChatWindow 
        chat={activeChat} 
        onSendMessage={handleSendMessage}
        onStartCall={startCall}
        onBack={() => setActiveChat(null)}
      />
      
      {(showCall || incomingCall) && (
        <CallUI 
          chat={activeChat || { name: 'Incoming...', id: incomingCall?.peer }} 
          type={incomingCall?.metadata?.type || callType || 'audio'} 
          onClose={() => {
            setShowCall(false);
            setIncomingCall(null);
            setCallType(null);
          }}
          peer={peer}
          incomingCall={incomingCall}
        />
      )}
    </div>
  );
};

export default ChatApp;
