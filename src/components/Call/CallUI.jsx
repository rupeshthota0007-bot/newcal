import { useState, useEffect, useRef } from 'react';
import './CallUI.css';

const CallUI = ({ chat, type, onClose, peer, incomingCall }) => {
  const [isAccepted, setIsAccepted] = useState(!incomingCall);
  const [callStatus, setCallStatus] = useState(incomingCall ? 'Incoming Call...' : 'Calling...');
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [stream, setStream] = useState(null);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const activeCallRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    let interval;
    if (callStatus === 'Connected') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (isAccepted && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startCallFlow();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (activeCallRef.current) {
        activeCallRef.current.close();
      }
    };
  }, [isAccepted]);

  const startCallFlow = async () => {
    try {
      setCallStatus('Connecting...');
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        },
        video: type === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      
      if (incomingCall) {
        setCallStatus('Connecting...');
        incomingCall.answer(mediaStream);
        setupCallListeners(incomingCall);
      } else if (peer && chat.id) {
        setCallStatus('Calling Peer...');
        const call = peer.call(chat.id, mediaStream, { metadata: { type } });
        setupCallListeners(call);
      } else {
        setCallStatus('Error: No Peer');
      }

    } catch (err) {
      console.error("Error accessing media devices:", err);
      setCallStatus('Access Denied');
    }
  };

  const setupCallListeners = (call) => {
    activeCallRef.current = call;
    
    call.on('stream', (remoteStream) => {
      console.log("Received remote stream with tracks:", remoteStream.getTracks().map(t => t.kind));
      setCallStatus('Connected');
      
      const hasVideo = remoteStream.getVideoTracks().length > 0;
      setHasRemoteVideo(hasVideo);
      
      const targetRef = (type === 'video' || hasVideo) ? remoteVideoRef : remoteAudioRef;
      
      if (targetRef.current) {
        targetRef.current.srcObject = remoteStream;
        targetRef.current.play().catch(e => console.error("Error playing remote stream:", e));
      } else {
        console.warn("Target video/audio element not found for stream attachment");
      }
    });

    call.on('close', () => {
      setCallStatus('Finished');
      onClose();
    });

    call.on('error', (err) => {
      console.error("Call error:", err);
      setCallStatus('Failed');
      setTimeout(onClose, 2000);
    });
  };

  const handleDecline = () => {
    if (incomingCall) {
      incomingCall.close();
    }
    onClose();
  };

  const [isSpeakerOff, setIsSpeakerOff] = useState(false);

  const toggleSpeaker = () => {
    const newVal = !isSpeakerOff;
    setIsSpeakerOff(newVal);
    if (remoteVideoRef.current) remoteVideoRef.current.muted = newVal;
    if (remoteAudioRef.current) remoteAudioRef.current.muted = newVal;
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream && type === 'video') {
      stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="call-overlay">
      <div className={`call-container ${type}`}>
        {!isAccepted ? (
          <div className="ios-incoming-screen">
            <div className="caller-info">
              <div className="avatar-placeholder lg">{chat.name[0]}</div>
              <h1>{chat.name}</h1>
              <p>Other</p>
            </div>
            
            <div className="bottom-actions">
              <div className="action-item">
                <button className="ios-btn decline" onClick={handleDecline}>
                  <span>📞</span>
                </button>
                <span>Decline</span>
              </div>
              <div className="action-item">
                <button className="ios-btn accept" onClick={() => setIsAccepted(true)}>
                  <span>📞</span>
                </button>
                <span>Accept</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="remote-view">
              {(type === 'video' || hasRemoteVideo) ? (
                <>
                  {callStatus === 'Connected' && <div className="video-timer">{formatTime(timer)}</div>}
                  {(callStatus !== 'Connected' && !hasRemoteVideo) && (
                    <div className="video-placeholder">
                      <div className="avatar-placeholder lg">{chat.name[0]}</div>
                      <div className="status-label">{callStatus}</div>
                    </div>
                  )}
                  <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
                </>
              ) : (
                <div className="audio-view">
                  {callStatus === 'Connected' && <div className="call-timer">{formatTime(timer)}</div>}
                  <div className="pulsing-avatar">
                    <div className="avatar-placeholder lg">{chat.name[0]}</div>
                  </div>
                  <h3>{chat.name}</h3>
                  <p>{callStatus}</p>
                  <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
                </div>
              )}
            </div>

            {type === 'video' && (
              <div className="local-view">
                {!isVideoOff ? (
                  <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
                ) : (
                  <div className="video-off-placeholder">Camera Off</div>
                )}
              </div>
            )}

            <div className="call-controls">
              <button 
                className={`control-btn speaker ${isSpeakerOff ? 'active' : ''}`} 
                onClick={toggleSpeaker}
                title={isSpeakerOff ? 'Turn Speaker On' : 'Turn Speaker Off'}
              >
                {isSpeakerOff ? '🔇' : '🔊'}
              </button>
              
              {type === 'video' && (
                <button 
                  className={`control-btn ${isVideoOff ? 'active' : ''}`} 
                  onClick={toggleVideo}
                  title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoOff ? '📹' : '🎥'}
                </button>
              )}

              <button 
                className={`control-btn ${isMuted ? 'active' : ''}`} 
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? '🎙️' : '🎙️'}
              </button>

              <button className="control-btn hangup" onClick={onClose} title="End Call">
                📞
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CallUI;
