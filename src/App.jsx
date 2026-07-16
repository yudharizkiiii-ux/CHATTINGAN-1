import React, { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import { 
  Send, 
  MessageSquare, 
  Users, 
  Settings, 
  Image as ImageIcon, 
  Paperclip, 
  Mic, 
  Smile, 
  Check, 
  CheckCheck, 
  Search, 
  Phone, 
  Video, 
  MoreVertical, 
  LogOut, 
  Plus, 
  Info, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  X, 
  User, 
  CloudLightning,
  Sparkles,
  Play,
  Pause,
  MicOff,
  VideoOff,
  PhoneOff,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Default Avatars
const AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
];

const DEFAULT_BROKERS = [
  { name: 'Local Network Broker (Offline)', url: `ws://${window.location.hostname}:9001` },
  { name: 'HiveMQ Public Broker', url: 'wss://broker.hivemq.com:8884/mqtt' },
  { name: 'EMQX Public Broker', url: 'wss://broker.emqx.io:8083/mqtt' },
  { name: 'Mosquitto Public Broker', url: 'wss://test.mosquitto.org:8081/mqtt' }
];

export default function App() {
  // --- Profile & Preferences ---
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('mqtt_chat_username') || `User_${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem('mqtt_chat_avatar') || AVATARS[Math.floor(Math.random() * AVATARS.length)];
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- MQTT Connection State ---
  const [brokerUrl, setBrokerUrl] = useState(() => {
    let saved = localStorage.getItem('mqtt_chat_broker');
    if (saved && saved.includes(':8000/mqtt')) {
      saved = saved.replace(':8000/mqtt', ':8884/mqtt');
      localStorage.setItem('mqtt_chat_broker', saved);
    }
    return saved || DEFAULT_BROKERS[0].url;
  });
  const [client, setClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected' | 'connecting' | 'disconnected' | 'error'

  // --- Chats & Rooms ---
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('mqtt_chat_rooms');
    return saved ? JSON.parse(saved) : [
      { id: 'general', name: 'General Lounge', description: 'Grup utama untuk mengobrol santai dengan semua orang.' },
      { id: 'tech', name: 'Tech & Code', description: 'Diskusi seputar teknologi, web development, dan programming.' },
      { id: 'random', name: 'Random Fun', description: 'Tempat berbagi meme, candaan, dan topik menarik lainnya.' }
    ];
  });
  const [dms, setDms] = useState(() => {
    const saved = localStorage.getItem('mqtt_chat_dms');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeRoom, setActiveRoom] = useState(rooms[0].id);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('mqtt_chat_messages');
    return saved ? JSON.parse(saved) : {};
  });

  // --- UI Interactions ---
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'dms'
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat' | 'details'
  const [showStartDmModal, setShowStartDmModal] = useState(false);
  const [newDmUsername, setNewDmUsername] = useState('');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // { [roomId]: { [username]: timestamp } }
  const [onlineUsers, setOnlineUsers] = useState({}); // { [roomId]: [ {username, avatar, lastSeen} ] }
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  // --- Audio States & Refs ---
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // --- WebRTC States & Refs ---
  const [callState, setCallState] = useState('idle'); // 'idle' | 'calling' | 'ringing' | 'connected'
  const [callType, setCallType] = useState('video'); // 'voice' | 'video'
  const [partnerUsername, setPartnerUsername] = useState('');
  const [partnerAvatar, setPartnerAvatar] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [callRoomId, setCallRoomId] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const pendingCandidates = useRef([]);
  const ringtoneRef = useRef(null);

  // --- Refs ---
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef({});

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('mqtt_chat_username', username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem('mqtt_chat_avatar', avatar);
  }, [avatar]);

  useEffect(() => {
    localStorage.setItem('mqtt_chat_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('mqtt_chat_dms', JSON.stringify(dms));
  }, [dms]);

  useEffect(() => {
    localStorage.setItem('mqtt_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoom, typingUsers]);

  // Synthesize notification sound
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn('Sound synthesis error:', e);
    }
  };

  // Play synthesized call ringtone
  const playRingtone = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const interval = setInterval(() => {
        if (ringtoneRef.current !== audioCtx) {
          clearInterval(interval);
          return;
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(480, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.9);
      }, 1000);
      ringtoneRef.current = audioCtx;
      ringtoneRef.current.interval = interval;
    } catch (e) {
      console.warn(e);
    }
  };

  const stopRingtone = () => {
    if (ringtoneRef.current) {
      clearInterval(ringtoneRef.current.interval);
      try {
        ringtoneRef.current.close();
      } catch (e) {}
      ringtoneRef.current = null;
    }
  };

  const getDmPartner = (roomId) => {
    if (!roomId || !roomId.startsWith('dm_')) return null;
    const partnerName = roomId.replace('dm_', '').split('_').find(u => u !== username);
    const dmContact = dms.find(d => d.username === partnerName);
    return dmContact || { username: partnerName, avatar: AVATARS[0] };
  };

  const startDmWithUser = (targetUsername, targetAvatar) => {
    if (targetUsername === username) return;
    
    // Check if already exists in DMs
    const existingDm = dms.find(d => d.username === targetUsername);
    let updatedDms = dms;
    if (!existingDm) {
      const newDm = { username: targetUsername, avatar: targetAvatar || AVATARS[0] };
      updatedDms = [...dms, newDm];
      setDms(updatedDms);
      localStorage.setItem('mqtt_chat_dms', JSON.stringify(updatedDms));
    }

    // Send an invite ping so they also subscribe
    if (client && connectionStatus === 'connected') {
      const dmRoomId = 'dm_' + [username, targetUsername].sort().join('_');
      client.subscribe(`mqtt_chat/dms/rooms/${dmRoomId}`);
      client.subscribe(`mqtt_chat/dms/rooms/${dmRoomId}/typing`);
      client.subscribe(`mqtt_chat/dms/rooms/${dmRoomId}/presence`);
      client.publish(`mqtt_chat/users/${targetUsername}/dms`, JSON.stringify({
        type: 'invite',
        sender: username,
        avatar: avatar
      }), { qos: 1 });
    }

    const dmRoomId = 'dm_' + [username, targetUsername].sort().join('_');
    setActiveRoom(dmRoomId);
    setActiveTab('dms');
    setMobileView('chat');
    setShowDetails(false);
  };

  // Start peer connection setup
  const setupPeerConnection = (roomId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && client && connectionStatus === 'connected') {
        const payload = {
          type: 'candidate',
          candidate: event.candidate,
          from: username
        };
        client.publish(`mqtt_chat/calls/${roomId}/${partnerUsername}`, JSON.stringify(payload), { qos: 1 });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current = pc;
    return pc;
  };

  // Initiate call
  const startCall = async (type, targetUser, targetAv) => {
    setCallType(type);
    setPartnerUsername(targetUser);
    setPartnerAvatar(targetAv);
    setCallRoomId(activeRoom);
    setCallState('calling');

    try {
      const constraints = {
        audio: true,
        video: type === 'video'
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = setupPeerConnection(activeRoom);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const payload = {
        type: 'offer',
        sdp: offer,
        from: username,
        avatar: avatar,
        callType: type
      };
      client.publish(`mqtt_chat/calls/${activeRoom}/${targetUser}`, JSON.stringify(payload), { qos: 1 });
    } catch (err) {
      console.error('Call initialization failed:', err);
      alert('Gagal mengakses kamera/mikrofon.');
      endCall();
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    stopRingtone();
    setCallState('connected');

    try {
      const constraints = {
        audio: true,
        video: callType === 'video'
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStream.current = stream;
      
      // Delay setting srcObject slightly to make sure video element has rendered
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }, 100);

      const offerSdp = peerConnection.current?.pendingOfferSdp;
      const pc = setupPeerConnection(callRoomId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));

      // Add any ice candidates received before peer connection was active (must be AFTER setRemoteDescription)
      pendingCandidates.current.forEach(candidate => {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.warn(e));
      });
      pendingCandidates.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const payload = {
        type: 'answer',
        sdp: answer,
        from: username
      };
      client.publish(`mqtt_chat/calls/${callRoomId}/${partnerUsername}`, JSON.stringify(payload), { qos: 1 });
    } catch (err) {
      console.error('Accept call failed:', err);
      endCall();
    }
  };

  // Decline/End Call
  const endCall = (sendSignal = true) => {
    stopRingtone();
    setCallState('idle');
    setIsAudioMuted(false);
    setIsVideoMuted(false);

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }

    if (peerConnection.current) {
      if (peerConnection.current.close) {
        peerConnection.current.close();
      }
      peerConnection.current = null;
    }

    pendingCandidates.current = [];

    if (sendSignal && client && connectionStatus === 'connected' && partnerUsername) {
      const payload = {
        type: 'hangup',
        from: username
      };
      client.publish(`mqtt_chat/calls/${callRoomId}/${partnerUsername}`, JSON.stringify(payload), { qos: 1 });
    }
  };

  // Handle incoming call signal
  const handleCallSignal = async (data, topic) => {
    const parts = topic.split('/');
    const callingRoomId = parts[2];
    setCallRoomId(callingRoomId);

    if (data.type === 'offer') {
      if (callState !== 'idle') {
        const payload = { type: 'hangup', from: username, reason: 'busy' };
        client.publish(`mqtt_chat/calls/${callingRoomId}/${data.from}`, JSON.stringify(payload), { qos: 1 });
        return;
      }
      setPartnerUsername(data.from);
      setPartnerAvatar(data.avatar || AVATARS[0]);
      setCallType(data.callType);
      setCallState('ringing');
      
      if (!peerConnection.current) {
        peerConnection.current = {};
      }
      peerConnection.current.pendingOfferSdp = data.sdp;
      playRingtone();
    } else if (data.type === 'answer') {
      if (peerConnection.current && callState === 'calling') {
        setCallState('connected');
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        pendingCandidates.current.forEach(candidate => {
          peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.warn(e));
        });
        pendingCandidates.current = [];
      }
    } else if (data.type === 'candidate') {
      if (peerConnection.current && peerConnection.current.setRemoteDescription && peerConnection.current.remoteDescription) {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => console.warn(e));
      } else {
        pendingCandidates.current.push(data.candidate);
      }
    } else if (data.type === 'hangup') {
      if (data.reason === 'busy') {
        alert(`${partnerUsername} sedang sibuk.`);
      }
      endCall(false);
    }
  };

  // Toggle Controls
  const toggleAudioMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideoMute = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const handleCallInitiate = (type) => {
    const isDm = activeRoom.startsWith('dm_');
    if (isDm) {
      const partner = getDmPartner(activeRoom);
      const isPartnerOnline = activeRoomOnline.some(u => u.username === partner.username);
      if (!isPartnerOnline) {
        alert(`${partner.username} sedang offline.`);
        return;
      }
      startCall(type, partner.username, partner.avatar);
    } else {
      if (activeRoomOnline.length === 0) {
        alert('Tidak ada anggota online di grup ini yang dapat dihubungi saat ini.');
        return;
      }
      const firstOnline = activeRoomOnline[0];
      startCall(type, firstOnline.username, firstOnline.avatar);
    }
  };



  // --- MQTT Client setup & lifecycle ---
  useEffect(() => {
    setConnectionStatus('connecting');
    const clientId = `mqtt_wa_${Math.random().toString(16).substring(2, 10)}`;
    const mqttClient = mqtt.connect(brokerUrl, {
      clientId,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 2000,
    });

    mqttClient.on('connect', () => {
      setConnectionStatus('connected');
      // Subscribe to all room channels & typing events & presence
      rooms.forEach(room => {
        mqttClient.subscribe(`mqtt_chat/rooms/${room.id}`);
        mqttClient.subscribe(`mqtt_chat/rooms/${room.id}/typing`);
        mqttClient.subscribe(`mqtt_chat/rooms/${room.id}/presence`);
        mqttClient.subscribe(`mqtt_chat/calls/${room.id}/${username}`);
      });
      // Subscribe to DM channels
      dms.forEach(dm => {
        const dmRoomId = 'dm_' + [username, dm.username].sort().join('_');
        mqttClient.subscribe(`mqtt_chat/dms/rooms/${dmRoomId}`);
        mqttClient.subscribe(`mqtt_chat/dms/rooms/${dmRoomId}/typing`);
        mqttClient.subscribe(`mqtt_chat/dms/rooms/${dmRoomId}/presence`);
        mqttClient.subscribe(`mqtt_chat/calls/${dmRoomId}/${username}`);
      });
      // Subscribe to DM invites
      mqttClient.subscribe(`mqtt_chat/users/${username}/dms`);
      
      // Announce self
      announcePresence(mqttClient);
    });

    mqttClient.on('message', (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        
        // Handle DM invites
        if (topic === `mqtt_chat/users/${username}/dms`) {
          if (data.type === 'invite' && data.sender !== username) {
            setDms(prev => {
              if (prev.some(d => d.username === data.sender)) return prev;
              const next = [...prev, { username: data.sender, avatar: data.avatar }];
              localStorage.setItem('mqtt_chat_dms', JSON.stringify(next));
              
              // Subscribe to new DM room topics immediately
              const dmRoomId = 'dm_' + [username, data.sender].sort().join('_');
              mqttClient.subscribe(`mqtt_chat/dms/rooms/${dmRoomId}`);
              mqttClient.subscribe(`mqtt_chat/dms/rooms/${dmRoomId}/typing`);
              mqttClient.subscribe(`mqtt_chat/dms/rooms/${dmRoomId}/presence`);
              mqttClient.subscribe(`mqtt_chat/calls/${dmRoomId}/${username}`);
              return next;
            });
            playNotificationSound();
          }
          return;
        }

        // Handle call signaling
        if (topic.includes('/calls/')) {
          if (data.from !== username) {
            handleCallSignal(data, topic);
          }
          return;
        }
        
        // Handle Typing indicator
        if (topic.endsWith('/typing')) {
          const parts = topic.split('/');
          const roomId = parts[1] === 'dms' ? parts[3] : parts[2];
          if (data.username !== username) {
            setTypingUsers(prev => {
              const roomTyping = { ...prev[roomId] };
              if (data.isTyping) {
                roomTyping[data.username] = Date.now();
              } else {
                delete roomTyping[data.username];
              }
              return { ...prev, [roomId]: roomTyping };
            });
          }
          return;
        }

        // Handle Presence detection
        if (topic.endsWith('/presence')) {
          const parts = topic.split('/');
          const roomId = parts[1] === 'dms' ? parts[3] : parts[2];
          if (data.username !== username) {
            setOnlineUsers(prev => {
              const list = prev[roomId] || [];
              const filtered = list.filter(u => u.username !== data.username);
              return {
                ...prev,
                [roomId]: [...filtered, { username: data.username, avatar: data.avatar, lastSeen: Date.now() }]
              };
            });
          }
          return;
        }

        // Handle Incoming Messages
        let roomId = null;
        if (topic.startsWith('mqtt_chat/rooms/')) {
          roomId = topic.split('/')[2];
        } else if (topic.startsWith('mqtt_chat/dms/rooms/')) {
          roomId = topic.split('/')[3];
        }

        if (roomId) {
          const isSenderSelf = data.username === username;
          const formattedMessage = {
            id: data.id || Math.random().toString(),
            sender: data.username,
            avatar: data.avatar || AVATARS[0],
            text: data.text,
            type: data.type || 'text', // 'text', 'image', 'audio'
            timestamp: data.timestamp || Date.now(),
            mediaData: data.mediaData, // For base64 files
            self: isSenderSelf,
          };

          setMessages(prev => {
            const roomMsgs = prev[roomId] || [];
            // Prevent duplicates
            if (roomMsgs.some(m => m.id === formattedMessage.id)) return prev;
            return {
              ...prev,
              [roomId]: [...roomMsgs, formattedMessage]
            };
          });

          if (!isSenderSelf) {
            playNotificationSound();
          }
        }
      } catch (err) {
        console.error('Failed to parse MQTT message payload', err);
      }
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT connection error', err);
      setConnectionStatus('error');
    });

    mqttClient.on('close', () => {
      setConnectionStatus('disconnected');
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, [brokerUrl, rooms.length, dms.length, username]);

  // Periodic Presence Broadcaster
  useEffect(() => {
    if (!client || connectionStatus !== 'connected') return;

    const interval = setInterval(() => {
      announcePresence(client);
      // Clean up typing and presence timeouts
      const now = Date.now();
      
      setTypingUsers(prev => {
        const next = { ...prev };
        let updated = false;
        Object.keys(next).forEach(roomId => {
          const roomTyping = { ...next[roomId] };
          Object.keys(roomTyping).forEach(user => {
            if (now - roomTyping[user] > 4000) {
              delete roomTyping[user];
              updated = true;
            }
          });
          next[roomId] = roomTyping;
        });
        return updated ? next : prev;
      });

      setOnlineUsers(prev => {
        const next = { ...prev };
        let updated = false;
        Object.keys(next).forEach(roomId => {
          const list = next[roomId] || [];
          const filtered = list.filter(u => now - u.lastSeen < 12000);
          if (filtered.length !== list.length) {
            next[roomId] = filtered;
            updated = true;
          }
        });
        return updated ? next : prev;
      });

    }, 5000);

    return () => clearInterval(interval);
  }, [client, connectionStatus, username, avatar, activeRoom, dms]);

  const announcePresence = (mqttClientInstance) => {
    const payload = JSON.stringify({ username, avatar, timestamp: Date.now() });
    rooms.forEach(room => {
      mqttClientInstance.publish(`mqtt_chat/rooms/${room.id}/presence`, payload, { qos: 0 });
    });
    dms.forEach(dm => {
      const dmRoomId = 'dm_' + [username, dm.username].sort().join('_');
      mqttClientInstance.publish(`mqtt_chat/dms/rooms/${dmRoomId}/presence`, payload, { qos: 0 });
    });
  };

  // --- Send Message Action ---
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !client || connectionStatus !== 'connected') return;

    // Check for Easter Eggs
    if (messageText.trim().toLowerCase() === '/confetti') {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }

    const payload = {
      id: `msg_${Math.random().toString(36).substring(2, 15)}`,
      username,
      avatar,
      text: messageText,
      type: 'text',
      timestamp: Date.now()
    };

    const isDm = activeRoom.startsWith('dm_');
    const topic = isDm ? `mqtt_chat/dms/rooms/${activeRoom}` : `mqtt_chat/rooms/${activeRoom}`;
    client.publish(topic, JSON.stringify(payload), { qos: 1 });

    if (isDm) {
      const partner = getDmPartner(activeRoom);
      if (partner) {
        client.publish(`mqtt_chat/users/${partner.username}/dms`, JSON.stringify({
          type: 'invite',
          sender: username,
          avatar: avatar
        }), { qos: 1 });
      }
    }

    setMessageText('');
    handleTypingIndicator(false);
  };

  // --- Send Base64 Media Action with Auto-Compression ---
  const handleSendImage = (e) => {
    const file = e.target.files[0];
    if (!file || !client || connectionStatus !== 'connected') return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file melebihi batas maksimal 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress quality (0.7 is perfect balance)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

        const payload = {
          id: `msg_${Math.random().toString(36).substring(2, 15)}`,
          username,
          avatar,
          text: `📷 Mengirim foto: ${file.name}`,
          type: 'image',
          mediaData: compressedBase64,
          timestamp: Date.now()
        };

        const isDm = activeRoom.startsWith('dm_');
        const topic = isDm ? `mqtt_chat/dms/rooms/${activeRoom}` : `mqtt_chat/rooms/${activeRoom}`;
        client.publish(topic, JSON.stringify(payload), { qos: 1 });

        if (isDm) {
          const partner = getDmPartner(activeRoom);
          if (partner) {
            client.publish(`mqtt_chat/users/${partner.username}/dms`, JSON.stringify({
              type: 'invite',
              sender: username,
              avatar: avatar
            }), { qos: 1 });
          }
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // --- Real Audio Recorder Actions ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Collect duration from time state since onstop is called synchronously after stopRecording()
        const duration = recordingTime;
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());

        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result.length > 250 * 1024) {
            alert('Ukuran rekaman audio terlalu besar. Silakan rekam pesan yang lebih pendek (maksimal 15-20 detik).');
            return;
          }

          const payload = {
            id: `msg_${Math.random().toString(36).substring(2, 15)}`,
            username,
            avatar,
            text: `🎤 Voice note (${duration}s)`,
            type: 'audio',
            mediaData: reader.result, // base64 encoded audio
            timestamp: Date.now()
          };

          if (client && connectionStatus === 'connected') {
            const isDm = activeRoom.startsWith('dm_');
            const topic = isDm ? `mqtt_chat/dms/rooms/${activeRoom}` : `mqtt_chat/rooms/${activeRoom}`;
            client.publish(topic, JSON.stringify(payload), { qos: 1 });

            if (isDm) {
              const partner = getDmPartner(activeRoom);
              if (partner) {
                client.publish(`mqtt_chat/users/${partner.username}/dms`, JSON.stringify({
                  type: 'invite',
                  sender: username,
                  avatar: avatar
                }), { qos: 1 });
              }
            }
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 20) { // Limit max recording to 20 seconds
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Tidak dapat mengakses mikrofon. Pastikan Anda memberikan izin akses mikrofon di browser Anda.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(recordingTimerRef.current);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      };
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(recordingTimerRef.current);
  };

  const playAudio = (msgId, base64Data) => {
    if (playingAudioId === msgId) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(base64Data);
      audioPlayerRef.current = audio;
      audio.onended = () => {
        setPlayingAudioId(null);
      };
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
      });
      setPlayingAudioId(msgId);
    }
  };

  // --- Send Typing Indicator ---
  const handleTypingIndicator = (isTyping) => {
    if (!client || connectionStatus !== 'connected') return;

    const lastState = typingTimeoutRef.current[activeRoom];
    if (lastState === isTyping) return; // limit reduntant pub

    typingTimeoutRef.current[activeRoom] = isTyping;

    const isDm = activeRoom.startsWith('dm_');
    const topic = isDm ? `mqtt_chat/dms/rooms/${activeRoom}/typing` : `mqtt_chat/rooms/${activeRoom}/typing`;
    const payload = JSON.stringify({ username, isTyping });
    client.publish(topic, payload, { qos: 0 });
  };

  const onInputChange = (e) => {
    setMessageText(e.target.value);
    handleTypingIndicator(true);

    if (typingTimeoutRef.current.timeout) {
      clearTimeout(typingTimeoutRef.current.timeout);
    }

    typingTimeoutRef.current.timeout = setTimeout(() => {
      handleTypingIndicator(false);
    }, 2000);
  };

  // --- Create custom channel/room ---
  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const newId = newRoomName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (rooms.some(r => r.id === newId)) {
      alert('Nama room sudah digunakan.');
      return;
    }

    const newRoom = {
      id: newId,
      name: newRoomName.trim(),
      description: newRoomDesc.trim() || 'Grup baru MQTT Chat.'
    };

    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);

    // Subscribe to new topics immediately
    if (client && connectionStatus === 'connected') {
      client.subscribe(`mqtt_chat/rooms/${newId}`);
      client.subscribe(`mqtt_chat/rooms/${newId}/typing`);
      client.subscribe(`mqtt_chat/rooms/${newId}/presence`);
      client.subscribe(`mqtt_chat/calls/${newId}/${username}`);
    }

    setActiveRoom(newId);
    setNewRoomName('');
    setNewRoomDesc('');
    setShowCreateRoomModal(false);
  };

  // --- Filtered Rooms ---
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Active room data
  const isDmActive = activeRoom.startsWith('dm_');
  const dmPartner = isDmActive ? getDmPartner(activeRoom) : null;
  const currentRoomDetails = isDmActive
    ? { id: activeRoom, name: dmPartner?.username || 'Chat Pribadi', description: 'Obrolan pribadi secara langsung.' }
    : (rooms.find(r => r.id === activeRoom) || rooms[0]);
  const activeRoomMessages = messages[activeRoom] || [];
  const activeRoomTyping = Object.keys(typingUsers[activeRoom] || {});
  const activeRoomOnline = onlineUsers[activeRoom] || [];

  // Extract shared images for Right Panel Media gallery
  const activeRoomImages = activeRoomMessages.filter(m => m.type === 'image');

  // Time formatter
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- Filtered DMs ---
  const filteredDms = dms.filter(dm => 
    dm.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-chat-bg text-gray-200">
      
      {/* 1. LEFT PANEL: Sidebar */}
      <div className={`w-full md:w-[380px] xl:w-[420px] h-full flex flex-col border-r border-gray-800 bg-chat-sidebar shrink-0 z-10 ${
        mobileView === 'list' ? 'flex' : 'hidden md:flex'
      }`}>
        
        {/* User Profile Info Header */}
        <div className="h-16 px-4 flex items-center justify-between bg-chat-header border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowSettings(true)}
              className="relative group transition hover:scale-105"
            >
              <img 
                src={avatar} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full object-cover border-2 border-chat-accent/40"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-chat-sidebar"></span>
            </button>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight text-white hover:text-chat-accent cursor-pointer transition" onClick={() => setShowSettings(true)}>
                {username}
              </span>
              <span className="text-[11px] text-gray-400">Online via MQTT</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              title={soundEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
              className="p-2 hover:bg-chat-active rounded-full text-gray-400 hover:text-white transition"
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button 
              onClick={() => {
                if (activeTab === 'rooms') {
                  setShowCreateRoomModal(true);
                } else {
                  setShowStartDmModal(true);
                }
              }} 
              title={activeTab === 'rooms' ? 'Buat Room Baru' : 'Mulai Obrolan Pribadi'}
              className="p-2 hover:bg-chat-active rounded-full text-gray-400 hover:text-white transition"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={() => setShowSettings(true)} 
              title="Pengaturan MQTT"
              className="p-2 hover:bg-chat-active rounded-full text-gray-400 hover:text-white transition"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Connection Status Banner */}
        <div className={`px-4 py-2 text-xs flex items-center justify-between border-b transition-all duration-300 ${
          connectionStatus === 'connected' ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-400' :
          connectionStatus === 'connecting' ? 'bg-amber-950/40 border-amber-900/40 text-amber-400' :
          'bg-rose-950/40 border-rose-900/40 text-rose-400'
        }`}>
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' :
              'bg-rose-500'
            }`}></span>
            <span className="font-medium">
              {connectionStatus === 'connected' && `Terhubung ke ${DEFAULT_BROKERS.find(b => b.url === brokerUrl)?.name || 'MQTT Broker'}`}
              {connectionStatus === 'connecting' && 'Sedang menghubungkan ke Broker...'}
              {connectionStatus === 'disconnected' && 'Terputus dari Broker'}
              {connectionStatus === 'error' && 'Gagal terhubung ke Broker'}
            </span>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="underline hover:text-white font-semibold transition"
          >
            Ubah
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-800/60 bg-chat-header/30">
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition ${
              activeTab === 'rooms' ? 'border-chat-accent text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Grup Obrolan
          </button>
          <button 
            onClick={() => setActiveTab('dms')}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition ${
              activeTab === 'dms' ? 'border-chat-accent text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Pesan Pribadi
          </button>
        </div>

        {/* Search Chats */}
        <div className="p-3 bg-chat-sidebar">
          <div className="relative flex items-center bg-chat-active rounded-lg px-3 py-2 text-gray-400 border border-transparent focus-within:border-chat-accent/50 transition">
            <Search size={18} className="mr-3" />
            <input 
              type="text" 
              placeholder={activeTab === 'rooms' ? 'Cari grup obrolan' : 'Cari kontak pribadi'} 
              className="bg-transparent border-none outline-none w-full text-sm text-gray-200 placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat Rooms & DMs List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-800/40">
          {activeTab === 'rooms' ? (
            filteredRooms.length > 0 ? (
              filteredRooms.map(room => {
                const roomMsgs = messages[room.id] || [];
                const lastMsg = roomMsgs[roomMsgs.length - 1];
                const isSelected = activeRoom === room.id;

                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setActiveRoom(room.id);
                      setMobileView('chat');
                      setShowEmojiPicker(false);
                    }}
                    className={`w-full text-left p-4 flex items-center space-x-3 transition-colors ${
                      isSelected ? 'bg-chat-active' : 'hover:bg-chat-active/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 flex items-center justify-center border border-emerald-500/10 text-emerald-400 text-xl font-bold shrink-0">
                      {room.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-semibold text-white text-base truncate">{room.name}</span>
                        {lastMsg && (
                          <span className="text-[11px] text-gray-400 shrink-0">{formatTime(lastMsg.timestamp)}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {lastMsg ? (
                          <>
                            <span className="text-gray-300 font-medium">{lastMsg.sender === username ? 'Anda' : lastMsg.sender}: </span>
                            {lastMsg.text}
                          </>
                        ) : (
                          room.description || 'Belum ada obrolan'
                        )}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare size={40} className="text-gray-600 mb-2" />
                <p className="text-gray-500 text-sm">Tidak ada room yang ditemukan</p>
              </div>
            )
          ) : (
            filteredDms.length > 0 ? (
              filteredDms.map(dm => {
                const dmRoomId = 'dm_' + [username, dm.username].sort().join('_');
                const dmMessages = messages[dmRoomId] || [];
                const lastMsg = dmMessages[dmMessages.length - 1];
                const isSelected = activeRoom === dmRoomId;
                const isOnline = (onlineUsers[dmRoomId] || []).some(u => u.username === dm.username);

                return (
                  <button
                    key={dm.username}
                    onClick={() => {
                      setActiveRoom(dmRoomId);
                      setMobileView('chat');
                      setShowEmojiPicker(false);
                    }}
                    className={`w-full text-left p-4 flex items-center space-x-3 transition-colors ${
                      isSelected ? 'bg-chat-active' : 'hover:bg-chat-active/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={dm.avatar} 
                        alt={dm.username} 
                        className="w-12 h-12 rounded-full object-cover border border-gray-800"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-chat-sidebar"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-semibold text-white text-base truncate">{dm.username}</span>
                        {lastMsg && (
                          <span className="text-[11px] text-gray-400 shrink-0">{formatTime(lastMsg.timestamp)}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {lastMsg ? (
                          <>
                            <span className="text-gray-300 font-medium">{lastMsg.sender === username ? 'Anda' : lastMsg.sender}: </span>
                            {lastMsg.text}
                          </>
                        ) : (
                          <span className="italic text-gray-500">Mulai chat pribadi...</span>
                        )}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare size={40} className="text-gray-600 mb-2" />
                <p className="text-gray-500 text-sm">Belum ada obrolan pribadi</p>
                <button
                  onClick={() => setShowStartDmModal(true)}
                  className="mt-3 bg-chat-accent hover:bg-chat-accent/90 text-white text-xs px-3 py-1.5 rounded-lg transition"
                >
                  Mulai Obrolan Baru
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* 2. MIDDLE PANEL: Active Chat Window */}
      <div className={`flex-1 h-full flex flex-col relative bg-[#0b141a] ${
        mobileView === 'chat' ? 'flex' : 'hidden md:flex'
      }`}>
        
        {/* Background Wallpaper Pattern */}
        <div className="chat-wallpaper"></div>

        {/* Chat Window Header */}
        <div className="h-16 px-4 bg-chat-header border-b border-gray-800 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3 cursor-pointer overflow-hidden" onClick={() => setShowDetails(!showDetails)}>
            {/* Back button on mobile */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setMobileView('list');
              }}
              className="md:hidden p-1.5 hover:bg-chat-active rounded-full text-gray-400 hover:text-white transition shrink-0"
            >
              <ArrowLeft size={20} />
            </button>

            {isDmActive ? (
              <img 
                src={dmPartner?.avatar || AVATARS[0]} 
                alt={dmPartner?.username} 
                className="w-10 h-10 rounded-full object-cover border border-gray-800 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 flex items-center justify-center border border-emerald-500/10 text-emerald-400 text-lg font-bold shrink-0">
                {currentRoomDetails.name.charAt(0)}
              </div>
            )}
            <div className="truncate">
              <h3 className="font-semibold text-white text-sm md:text-base leading-tight truncate">
                {currentRoomDetails.name}
              </h3>
              <p className="text-xs text-gray-400 truncate max-w-[150px] md:max-w-xs">
                {isDmActive ? (
                  activeRoomOnline.some(u => u.username === dmPartner?.username) ? (
                    <span className="text-emerald-400 font-medium">Online</span>
                  ) : (
                    <span>Offline</span>
                  )
                ) : activeRoomOnline.length > 0 ? (
                  <span className="text-emerald-400 font-medium">
                    {activeRoomOnline.length + 1} online ({username}, {activeRoomOnline.map(u => u.username).join(', ')})
                  </span>
                ) : (
                  'Hanya Anda di grup ini'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-300">
            <button 
              onClick={() => handleCallInitiate('voice')} 
              className="p-2 hover:bg-chat-active rounded-full transition hover:text-white" 
              title="Panggilan Suara"
            >
              <Phone size={18} />
            </button>
            <button 
              onClick={() => handleCallInitiate('video')} 
              className="p-2 hover:bg-chat-active rounded-full transition hover:text-white" 
              title="Panggilan Video"
            >
              <Video size={18} />
            </button>
            <div className="w-px h-6 bg-gray-800"></div>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className={`p-2 rounded-full transition ${showDetails ? 'bg-chat-active text-chat-accent' : 'hover:bg-chat-active hover:text-white'}`}
              title="Informasi Grup"
            >
              <Info size={18} />
            </button>
          </div>
        </div>

        {/* Messages Body Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-3 z-10 bg-transparent">
          {activeRoomMessages.length > 0 ? (
            activeRoomMessages.map((msg, index) => {
              const showDateHeader = index === 0 || 
                new Date(activeRoomMessages[index - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

              return (
                <div key={msg.id} className="flex flex-col">
                  {showDateHeader && (
                    <div className="flex justify-center my-3">
                      <span className="px-3 py-1 bg-chat-header text-gray-400 rounded-md text-xs border border-gray-800/30">
                        {new Date(msg.timestamp).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  )}

                  <div className={`flex w-full ${msg.self ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] md:max-w-[55%] rounded-lg px-3 py-1.5 shadow-md relative group animate-slideup ${
                      msg.self 
                        ? 'bg-chat-outgoing text-emerald-50 rounded-tr-none' 
                        : 'bg-chat-incoming text-gray-100 rounded-tl-none'
                    }`}>
                      {/* Sender Info for incoming messages */}
                      {!msg.self && (
                        <div className="flex items-center space-x-1.5 mb-1">
                          <img 
                            src={msg.avatar} 
                            alt={msg.sender} 
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-xs font-semibold text-emerald-400">{msg.sender}</span>
                        </div>
                      )}

                      {/* Message Content Type */}
                      {msg.type === 'image' ? (
                        <div className="flex flex-col space-y-1">
                          <img 
                            src={msg.mediaData} 
                            alt="Sent media" 
                            className="rounded max-h-64 object-cover border border-black/10 cursor-pointer hover:brightness-95 transition"
                          />
                          {msg.text && <p className="text-sm mt-1">{msg.text.replace('📷 Mengirim foto: ', '')}</p>}
                        </div>
                      ) : msg.type === 'audio' ? (
                        <div className="flex items-center space-x-3 py-2 px-1 min-w-[200px]">
                          <button 
                            onClick={() => playAudio(msg.id, msg.mediaData)}
                            className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition shrink-0 shadow"
                          >
                            {playingAudioId === msg.id ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center space-x-0.5">
                              {[...Array(16)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`h-4 w-[2px] rounded-full transition-all duration-300 ${
                                    playingAudioId === msg.id && i % 3 === 0 ? 'h-6' : ''
                                  } ${msg.self ? 'bg-emerald-300' : 'bg-gray-400'}`}
                                ></div>
                              ))}
                            </div>
                            <span className="text-[10px] opacity-70 mt-1 block">{msg.text || 'Voice Note'}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                      )}

                      {/* Footer Time + Tick */}
                      <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-gray-400/80">
                        <span>{formatTime(msg.timestamp)}</span>
                        {msg.self && (
                          <span className="text-teal-400">
                            <CheckCheck size={14} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="font-semibold text-lg text-white mb-2">Selamat datang di Room {currentRoomDetails.name}!</h3>
              <p className="text-sm text-gray-400">
                Semua obrolan dikirimkan secara langsung menggunakan MQTT. Ketik pesan Anda di bawah untuk memulai percakapan.
              </p>
            </div>
          )}

          {/* Typing Indicator Bubble */}
          {activeRoomTyping.length > 0 && (
            <div className="flex justify-start items-center space-x-2 animate-pulse mt-2">
              <div className="px-3 py-2 bg-chat-incoming text-gray-400 rounded-lg rounded-tl-none text-xs flex items-center space-x-2 border border-gray-800/30">
                <div className="flex items-center space-x-1 pr-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
                </div>
                <span>
                  {activeRoomTyping.join(', ')} sedang mengetik...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Area */}
        <div className="mt-auto bg-chat-header border-t border-gray-800 p-3 flex flex-col z-10">
          
          {/* Native Emoji Helper Drawer */}
          {showEmojiPicker && (
            <div className="p-3 bg-chat-sidebar rounded-lg border border-gray-800 mb-3 flex flex-wrap gap-2 animate-slideup">
              {['😀','😂','😍','👍','🔥','🙌','👏','🎉','❤️','🤔','💡','🚀','👀','❌','✅','💤'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    setMessageText(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-xl p-2 hover:bg-chat-active rounded transition transform hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-gray-400">
              <button 
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 hover:bg-chat-active rounded-full transition ${showEmojiPicker ? 'text-chat-accent' : 'hover:text-white'}`}
                title="Tambahkan Emoji"
              >
                <Smile size={22} />
              </button>

              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-chat-active rounded-full transition hover:text-white"
                title="Kirim Foto (Max 10MB)"
              >
                <ImageIcon size={22} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleSendImage}
                accept="image/*"
                className="hidden"
              />

              <button 
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 hover:bg-chat-active rounded-full transition ${isRecording ? 'text-red-500 animate-pulse' : 'hover:text-white'}`}
                title={isRecording ? "Kirim Rekaman" : "Mulai Rekam Suara"}
              >
                <Mic size={22} />
              </button>
            </div>

            {isRecording ? (
              <div className="flex-1 flex items-center justify-between bg-red-950/40 border border-red-900/40 py-2.5 px-4 rounded-lg text-red-400 animate-pulse text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                  <span className="font-semibold">Merekam: {recordingTime} detik (Maks 20s)</span>
                </div>
                <button 
                  type="button" 
                  onClick={cancelRecording}
                  className="text-gray-400 hover:text-white underline font-semibold text-xs transition"
                >
                  Batal
                </button>
              </div>
            ) : (
              <input 
                type="text" 
                placeholder={connectionStatus === 'connected' ? "Ketik pesan..." : "Sedang menghubungkan ke Broker..."}
                className="flex-1 bg-chat-active border-none outline-none text-gray-200 text-sm py-2.5 px-4 rounded-lg focus:ring-1 focus:ring-chat-accent transition placeholder-gray-500"
                value={messageText}
                onChange={onInputChange}
                disabled={connectionStatus !== 'connected'}
              />
            )}

            <button
              type="submit"
              disabled={isRecording || !messageText.trim() || connectionStatus !== 'connected'}
              className="w-10 h-10 rounded-full bg-chat-accent text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:bg-gray-700 disabled:text-gray-400 disabled:scale-100 transition shrink-0 shadow-md"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. RIGHT PANEL: Room/Contact Details Info */}
      {showDetails && (
        <div className="w-full md:w-[320px] h-full border-l border-gray-800 bg-chat-sidebar flex flex-col shrink-0 z-20 absolute md:relative inset-y-0 right-0 md:inset-auto animate-slideup">
          <div className="h-16 px-4 bg-chat-header border-b border-gray-800 flex items-center justify-between text-white">
            <span className="font-semibold text-sm">{isDmActive ? 'Informasi Kontak' : 'Informasi Grup'}</span>
            <button 
              onClick={() => setShowDetails(false)}
              className="p-1 hover:bg-chat-active rounded-full text-gray-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Info Banner */}
            <div className="flex flex-col items-center text-center pb-4 border-b border-gray-800/40">
              {isDmActive ? (
                <img 
                  src={dmPartner?.avatar || AVATARS[0]} 
                  alt={dmPartner?.username} 
                  className="w-20 h-20 rounded-full object-cover border border-gray-800 mb-3 shadow"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 flex items-center justify-center border border-emerald-500/10 text-emerald-400 text-3xl font-bold mb-3 shadow">
                  {currentRoomDetails.name.charAt(0)}
                </div>
              )}
              <h4 className="font-semibold text-lg text-white">{currentRoomDetails.name}</h4>
              <p className="text-xs text-gray-400 mt-1">Topic: <code className="bg-chat-active px-1 py-0.5 rounded text-teal-400 text-[10px]">{isDmActive ? `mqtt_chat/dms/rooms/${activeRoom}` : `mqtt_chat/rooms/${activeRoom}`}</code></p>
            </div>

            {/* Description */}
            <div>
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Deskripsi</h5>
              <p className="text-sm text-gray-300 leading-relaxed bg-chat-active/30 p-3 rounded border border-gray-800/20">
                {currentRoomDetails.description}
              </p>
            </div>

            {/* Online Members (Only for Groups) */}
            {!isDmActive && (
              <div>
                <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Anggota Aktif ({activeRoomOnline.length + 1})</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5 p-1">
                    <img src={avatar} className="w-8 h-8 rounded-full object-cover" alt="Me" />
                    <span className="text-sm text-white font-medium">{username} <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1 py-0.2 rounded ml-1">Anda</span></span>
                  </div>
                  {activeRoomOnline.map(member => (
                    <div key={member.username} className="flex items-center justify-between p-1 animate-slideup">
                      <div className="flex items-center space-x-2.5">
                        <img src={member.avatar} className="w-8 h-8 rounded-full object-cover" alt={member.username} />
                        <span className="text-sm text-gray-300 font-medium">{member.username}</span>
                      </div>
                      {member.username !== username && (
                        <button
                          onClick={() => startDmWithUser(member.username, member.avatar)}
                          className="p-1.5 hover:bg-chat-active rounded-full text-chat-accent transition"
                          title={`Kirim pesan ke ${member.username}`}
                        >
                          <MessageSquare size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DM Online Status (Only for DMs) */}
            {isDmActive && (
              <div>
                <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status Koneksi</h5>
                <div className="flex items-center space-x-2 p-3 bg-chat-active/30 rounded border border-gray-800/20">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    activeRoomOnline.some(u => u.username === dmPartner?.username) ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'
                  }`}></span>
                  <span className="text-sm text-gray-300 font-medium">
                    {activeRoomOnline.some(u => u.username === dmPartner?.username) ? 'Online' : 'Offline / Terputus'}
                  </span>
                </div>
              </div>
            )}

            {/* Shared Images Gallery */}
            <div>
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Media Bersama ({activeRoomImages.length})</h5>
              {activeRoomImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {activeRoomImages.map(img => (
                    <img 
                      key={img.id}
                      src={img.mediaData} 
                      className="w-full aspect-square object-cover rounded cursor-pointer hover:scale-105 hover:brightness-110 transition border border-gray-800"
                      onClick={() => alert(`Pengirim: ${img.sender}\nWaktu: ${new Date(img.timestamp).toLocaleString()}`)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">Belum ada media foto yang dibagikan.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SETTINGS MODAL: MQTT & User Profile Configuration */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-chat-sidebar rounded-xl border border-gray-800 shadow-2xl overflow-hidden animate-slideup">
            <div className="px-6 py-4 bg-chat-header border-b border-gray-800 flex items-center justify-between text-white">
              <span className="font-semibold text-base flex items-center"><Settings className="mr-2 text-chat-accent" size={18} /> Pengaturan Profil & MQTT</span>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-chat-active rounded-full text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Profile Config */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama Pengguna (Username)</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ketik username baru..."
                  className="w-full bg-chat-active border-none outline-none text-gray-200 text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-chat-accent"
                />
              </div>

              {/* Avatar Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Pilih Avatar</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATARS.map((av, index) => (
                    <button
                      key={index}
                      onClick={() => setAvatar(av)}
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 transition ${
                        avatar === av ? 'border-chat-accent scale-110 shadow-lg' : 'border-transparent hover:border-gray-700'
                      }`}
                    >
                      <img src={av} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* MQTT Broker Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">MQTT Broker URL (WebSockets)</label>
                <input 
                  type="text" 
                  value={brokerUrl}
                  onChange={(e) => setBrokerUrl(e.target.value)}
                  placeholder="wss://broker-address:port/mqtt"
                  className="w-full bg-chat-active border-none outline-none text-gray-200 text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-chat-accent font-mono text-[11px]"
                />
                <div className="flex gap-2 flex-wrap mt-1">
                  {DEFAULT_BROKERS.map(broker => (
                    <button
                      key={broker.url}
                      onClick={() => setBrokerUrl(broker.url)}
                      className={`text-[10px] px-2 py-1 rounded transition border ${
                        brokerUrl === broker.url 
                          ? 'bg-chat-accent/20 border-chat-accent text-white' 
                          : 'bg-chat-active border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {broker.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset History / Info */}
              <div className="pt-2 border-t border-gray-800/40 flex justify-between items-center text-xs">
                <button
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat pesan dari localStorage?')) {
                      setMessages({});
                      alert('Riwayat pesan dibersihkan.');
                    }
                  }}
                  className="text-rose-400 hover:text-rose-300 underline transition"
                >
                  Hapus Riwayat Chat
                </button>

                <span className="text-gray-500 italic">Vite + MQTT Client v5</span>
              </div>
            </div>

            <div className="px-6 py-3 bg-chat-header border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="bg-chat-accent text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:scale-105 active:scale-95 transition"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CREATE ROOM MODAL */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateRoom} className="w-full max-w-md bg-chat-sidebar rounded-xl border border-gray-800 shadow-2xl overflow-hidden animate-slideup">
            <div className="px-6 py-4 bg-chat-header border-b border-gray-800 flex items-center justify-between text-white">
              <span className="font-semibold text-base flex items-center"><MessageSquare className="mr-2 text-chat-accent" size={18} /> Buat Grup Obrolan Baru</span>
              <button 
                type="button"
                onClick={() => setShowCreateRoomModal(false)}
                className="p-1 hover:bg-chat-active rounded-full text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama Grup</label>
                <input 
                  type="text" 
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Contoh: Diskusi Musik, Mabar Squad"
                  required
                  className="w-full bg-chat-active border-none outline-none text-gray-200 text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-chat-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Deskripsi Grup</label>
                <textarea 
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  placeholder="Jelaskan maksud dan tujuan grup obrolan ini..."
                  className="w-full bg-chat-active border-none outline-none text-gray-200 text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-chat-accent h-20 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-3 bg-chat-header border-t border-gray-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateRoomModal(false)}
                className="text-gray-400 hover:text-white px-4 py-1.5 rounded-lg text-sm transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-chat-accent text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:scale-105 active:scale-95 transition"
              >
                Buat Grup
              </button>
            </div>
          </form>
        </div>
      )}

      {/* START DM MODAL */}
      {showStartDmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (newDmUsername.trim()) {
                startDmWithUser(newDmUsername.trim(), AVATARS[Math.floor(Math.random() * AVATARS.length)]);
                setNewDmUsername('');
                setShowStartDmModal(false);
              }
            }} 
            className="w-full max-w-md bg-chat-sidebar rounded-xl border border-gray-800 shadow-2xl overflow-hidden animate-slideup"
          >
            <div className="px-6 py-4 bg-chat-header border-b border-gray-800 flex items-center justify-between text-white">
              <span className="font-semibold text-base flex items-center"><MessageSquare className="mr-2 text-chat-accent" size={18} /> Mulai Chat Pribadi</span>
              <button 
                type="button"
                onClick={() => setShowStartDmModal(false)}
                className="p-1 hover:bg-chat-active rounded-full text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Username Teman</label>
                <input 
                  type="text" 
                  value={newDmUsername}
                  onChange={(e) => setNewDmUsername(e.target.value)}
                  placeholder="Ketik username teman Anda..."
                  required
                  className="w-full bg-chat-active border-none outline-none text-gray-200 text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-chat-accent"
                />
              </div>
            </div>

            <div className="px-6 py-3 bg-chat-header border-t border-gray-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowStartDmModal(false)}
                className="text-gray-400 hover:text-white px-4 py-1.5 rounded-lg text-sm transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-chat-accent text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:scale-105 active:scale-95 transition"
              >
                Mulai Chat
              </button>
            </div>
          </form>
        </div>
      )}
      {callState !== 'idle' && (
        <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-4xl flex flex-col h-full items-center justify-between py-8">
            
            {/* Caller Info Header */}
            <div className="text-center space-y-3 z-10">
              <img 
                src={partnerAvatar || AVATARS[0]} 
                alt={partnerUsername} 
                className="w-24 h-24 rounded-full object-cover border-4 border-chat-accent/60 mx-auto shadow-2xl animate-pulse"
              />
              <h2 className="text-2xl font-bold text-white tracking-wide">{partnerUsername}</h2>
              <p className="text-sm text-chat-accent font-medium">
                {callState === 'calling' && 'Sedang Memanggil...'}
                {callState === 'ringing' && `Panggilan ${callType === 'video' ? 'Video' : 'Suara'} Masuk...`}
                {callState === 'connected' && `Terhubung • Panggilan ${callType === 'video' ? 'Video' : 'Suara'}`}
              </p>
            </div>

            {/* Video Streams Container */}
            <div className="relative w-full flex-1 max-h-[60%] flex items-center justify-center my-6 rounded-2xl overflow-hidden bg-chat-active/20 border border-gray-800 shadow-inner">
              {/* Remote Video/Audio Stream */}
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover ${callType === 'video' ? 'block' : 'hidden'}`}
              />
              {/* Local Video Stream (PIP) */}
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`absolute bottom-4 right-4 w-32 md:w-44 aspect-video rounded-lg border-2 border-chat-accent/80 object-cover shadow-2xl ${callType === 'video' ? 'block' : 'hidden'}`}
              />

              {callType === 'voice' && (
                /* Voice Call Banner */
                <div className="flex flex-col items-center justify-center space-y-3 z-10">
                  <div className="w-20 h-20 rounded-full bg-chat-accent/10 border border-chat-accent/30 flex items-center justify-center text-chat-accent animate-ping">
                    <Phone size={36} />
                  </div>
                  <span className="text-xs text-gray-500">Audio Only Mode</span>
                </div>
              )}
            </div>

            {/* Calling Control Buttons */}
            <div className="flex items-center space-x-6 z-10">
              {callState === 'ringing' ? (
                /* Callee Options: Accept or Decline */
                <>
                  <button 
                    onClick={() => endCall(true)} 
                    className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    title="Tolak Panggilan"
                  >
                    <PhoneOff size={24} />
                  </button>
                  <button 
                    onClick={acceptCall} 
                    className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform animate-bounce"
                    title="Terima Panggilan"
                  >
                    <Phone size={24} className="rotate-12" />
                  </button>
                </>
              ) : (
                /* Caller or Active Call Options: Mute, Toggle Camera, End Call */
                <>
                  {callState === 'connected' && (
                    <button 
                      onClick={toggleAudioMute} 
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow transition-colors ${
                        isAudioMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                      title={isAudioMuted ? "Unmute Mikrofon" : "Mute Mikrofon"}
                    >
                      {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                  )}

                  <button 
                    onClick={() => endCall(true)} 
                    className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    title="Akhiri Panggilan"
                  >
                    <PhoneOff size={24} />
                  </button>

                  {callState === 'connected' && callType === 'video' && (
                    <button 
                      onClick={toggleVideoMute} 
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow transition-colors ${
                        isVideoMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                      title={isVideoMuted ? "Aktifkan Kamera" : "Matikan Kamera"}
                    >
                      {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}



    </div>
  );
}
