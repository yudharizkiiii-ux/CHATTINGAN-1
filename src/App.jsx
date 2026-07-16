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
  Volume1,
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
  ArrowLeft,
  Camera,
  Archive,
  CircleDot,
  UserPlus,
  MessageSquareMore,
  MoreHorizontal,
  ChevronDown
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
  const [activeTab, setActiveTab] = useState('chat'); // 'updates' | 'calls' | 'communities' | 'chat' | 'you'
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
  const [isLoudspeakerOn, setIsLoudspeakerOn] = useState(false);

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
    setActiveTab('chat');
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
      console.log('Received remote track:', event.track.kind);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.volume = isLoudspeakerOn ? 1.0 : 0.3;
        if (remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject.addTrack(event.track);
        } else {
          if (event.streams && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          } else {
            const newStream = new MediaStream();
            newStream.addTrack(event.track);
            remoteVideoRef.current.srcObject = newStream;
          }
        }
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
    setIsLoudspeakerOn(false);

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

  const toggleLoudspeaker = () => {
    if (remoteVideoRef.current) {
      if (isLoudspeakerOn) {
        remoteVideoRef.current.volume = 0.3;
      } else {
        remoteVideoRef.current.volume = 1.0;
      }
      setIsLoudspeakerOn(!isLoudspeakerOn);
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

  const getUnifiedChats = () => {
    const allChats = [];
    rooms.forEach(room => {
      const roomMsgs = messages[room.id] || [];
      const lastMsg = roomMsgs[roomMsgs.length - 1];
      allChats.push({
        id: room.id,
        name: room.name,
        description: room.description,
        isGroup: true,
        avatar: null,
        lastMsg,
        timestamp: lastMsg ? lastMsg.timestamp : 0
      });
    });
    dms.forEach(dm => {
      const dmRoomId = 'dm_' + [username, dm.username].sort().join('_');
      const dmMessages = messages[dmRoomId] || [];
      const lastMsg = dmMessages[dmMessages.length - 1];
      allChats.push({
        id: dmRoomId,
        name: dm.username,
        description: 'Chat Pribadi',
        isGroup: false,
        avatar: dm.avatar,
        lastMsg,
        timestamp: lastMsg ? lastMsg.timestamp : 0
      });
    });

    const query = searchQuery.toLowerCase();
    const filtered = allChats.filter(chat => 
      chat.name.toLowerCase().includes(query) || 
      (chat.description && chat.description.toLowerCase().includes(query))
    );

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-chat-bg text-gray-200">
      
      {/* 1. LEFT PANEL: Sidebar */}
      <div className={`w-full md:w-[380px] xl:w-[420px] h-full flex flex-col border-r border-gray-200 bg-white shrink-0 z-10 text-gray-900 ${
        mobileView === 'list' ? 'flex' : 'hidden md:flex'
      }`}>
        
        {/* User Profile Info Header */}
        <div className="h-16 px-4 flex items-center justify-between bg-white border-b border-gray-100">
          {/* Left: Options menu */}
          <button 
            onClick={() => setActiveTab('you')}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition"
            title="Pengaturan"
          >
            <span className="font-bold text-lg">...</span>
          </button>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => alert('Fitur Kamera Jaringan Lokal')}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-700 transition"
              title="Kamera"
            >
              <Camera size={22} />
            </button>
            <button 
              onClick={() => {
                setShowStartDmModal(true);
              }} 
              className="w-9 h-9 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow transition transform active:scale-95"
              title="Chat Baru / Grup Baru"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Content Area based on Tab Selection */}
        {activeTab === 'chat' && (
          <>
            {/* Title */}
            <div className="px-4 py-2">
              <h1 className="text-3xl font-bold text-black tracking-tight">Chat</h1>
            </div>

            {/* Search Chats */}
            <div className="px-4 py-2 bg-white">
              <div className="relative flex items-center bg-[#f0f2f5] rounded-full px-4 py-2 text-gray-500 transition focus-within:bg-gray-200/80">
                <Search size={18} className="mr-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Tanya Meta AI atau cari" 
                  className="bg-transparent border-none outline-none w-full text-sm text-gray-850 placeholder-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Archived Section Row */}
            <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-b border-gray-100/50">
              <div className="flex items-center space-x-4">
                <Archive size={20} className="text-gray-500" />
                <span className="text-sm font-semibold text-gray-800">Diarsipkan</span>
              </div>
              <span className="text-xs text-[#25d366] font-bold">2</span>
            </div>

            {/* Unified Chats List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {getUnifiedChats().length > 0 ? (
                getUnifiedChats().map(chat => {
                  const isSelected = activeRoom === chat.id;
                  const isOnline = !chat.isGroup && (onlineUsers[chat.id] || []).some(u => u.username === chat.name);

                  return (
                    <button
                      key={chat.id}
                      onClick={() => {
                        setActiveRoom(chat.id);
                        setMobileView('chat');
                        setShowEmojiPicker(false);
                      }}
                      className={`w-full text-left p-4 flex items-center space-x-3 transition-colors ${
                        isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {chat.isGroup ? (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 flex items-center justify-center border border-emerald-500/10 text-emerald-600 text-xl font-bold shrink-0">
                            {chat.name.charAt(0)}
                          </div>
                        ) : (
                          <img 
                            src={chat.avatar || AVATARS[0]} 
                            alt={chat.name} 
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          />
                        )}
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-gray-900 text-base truncate">{chat.name}</span>
                          {chat.lastMsg ? (
                            <span className="text-[11px] text-gray-400 shrink-0 font-medium">{formatTime(chat.lastMsg.timestamp)}</span>
                          ) : (
                            <span className="text-[11px] text-gray-400 shrink-0 font-medium">08.55</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500 truncate flex-1 pr-2">
                            {chat.lastMsg ? (
                              <span className="flex items-center space-x-1">
                                {chat.lastMsg.sender === username && (
                                  <CheckCheck size={16} className="text-blue-500 shrink-0 inline mr-1" />
                                )}
                                <span className="truncate">{chat.lastMsg.text}</span>
                              </span>
                            ) : (
                              <span className="italic text-gray-400">{chat.description || 'Mulai obrolan...'}</span>
                            )}
                          </p>
                          {/* Unread mock/active indicator */}
                          {!chat.lastMsg && (
                            <span className="w-5 h-5 rounded-full bg-[#25d366] text-white text-[10px] font-bold flex items-center justify-center">8</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                  <MessageSquare size={40} className="text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">Tidak ada chat ditemukan</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab 2: Updates (Pembaruan) */}
        {activeTab === 'updates' && (
          <div className="flex-1 flex flex-col p-4">
            <h1 className="text-3xl font-bold text-black tracking-tight mb-4">Pembaruan</h1>
            <div className="flex items-center space-x-3 mb-6 p-2">
              <div className="relative">
                <img src={avatar} className="w-14 h-14 rounded-full border-2 border-gray-200 object-cover" />
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#25d366] rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">+</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Status Saya</h4>
                <p className="text-xs text-gray-500">Ketuk untuk menambahkan pembaruan status</p>
              </div>
            </div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pembaruan terkini</h5>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500 p-0.5">
                  <img src={AVATARS[1]} className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-950 text-sm">serda Desta</h4>
                  <p className="text-xs text-gray-400">Baru saja</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Calls (Panggilan) */}
        {activeTab === 'calls' && (
          <div className="flex-1 flex flex-col">
            <div className="p-4">
              <h1 className="text-3xl font-bold text-black tracking-tight">Panggilan</h1>
            </div>
            <div className="flex-1 overflow-y-auto px-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={AVATARS[2]} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">serda Desta</h4>
                    <p className="text-xs text-red-500 flex items-center">✓ Telepon video • 09.55</p>
                  </div>
                </div>
                <Video size={20} className="text-emerald-500 cursor-pointer" onClick={() => startCall('video', 'serda Desta', AVATARS[2])} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={AVATARS[3]} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-gray-950 text-sm">Pratu Dani</h4>
                    <p className="text-xs text-emerald-500 flex items-center">✓ Telepon video • 08.48</p>
                  </div>
                </div>
                <Video size={20} className="text-emerald-500 cursor-pointer" onClick={() => startCall('video', 'Pratu Dani', AVATARS[3])} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Communities (Komunitas) */}
        {activeTab === 'communities' && (
          <div className="flex-1 flex flex-col p-6 items-center justify-center text-center">
            <Users size={64} className="text-emerald-500 mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">Perkenalkan Komunitas</h2>
            <p className="text-sm text-gray-500 max-w-xs">
              Hubungkan grup-grup obrolan yang berkaitan dan kelola dalam satu tempat dengan mudah.
            </p>
          </div>
        )}

        {/* Tab 5: You (Anda) / Native Settings */}
        {activeTab === 'you' && (
          <div className="flex-1 flex flex-col p-4 bg-gray-50 overflow-y-auto">
            <h1 className="text-3xl font-bold text-black tracking-tight mb-4">Anda</h1>
            
            {/* Profile summary card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4 mb-6">
              <div className="relative">
                <img src={avatar} className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="font-bold text-lg text-black bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-500 outline-none w-full"
                />
                <p className="text-xs text-gray-500 mt-0.5">Ketuk untuk ubah nama panggilan</p>
              </div>
            </div>

            {/* Avatar picker */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ubah Foto Profil</h5>
              <div className="flex gap-2.5 flex-wrap">
                {AVATARS.map((av, index) => (
                  <button
                    key={index}
                    onClick={() => setAvatar(av)}
                    className={`w-11 h-11 rounded-full overflow-hidden border-2 transition ${
                      avatar === av ? 'border-emerald-500 scale-105 shadow' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img src={av} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* MQTT Server Setup */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Server Broker MQTT</h5>
              <input 
                type="text" 
                value={brokerUrl}
                onChange={(e) => setBrokerUrl(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 outline-none text-gray-800 text-xs py-2 px-3 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <div className="flex gap-2 flex-wrap mt-2">
                {DEFAULT_BROKERS.map(broker => (
                  <button
                    key={broker.url}
                    onClick={() => setBrokerUrl(broker.url)}
                    className={`text-[10px] px-2 py-1 rounded transition border ${
                      brokerUrl === broker.url 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {broker.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Connection Banner */}
            <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
              connectionStatus === 'connected' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
              connectionStatus === 'connecting' ? 'bg-amber-50 border-amber-200 text-amber-700' :
              'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                  connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' :
                  'bg-red-500'
                }`}></span>
                <span className="font-semibold">
                  {connectionStatus === 'connected' ? 'Broker Terkoneksi' :
                   connectionStatus === 'connecting' ? 'Menghubungkan...' : 'Koneksi Terputus'}
                </span>
              </div>
              <button onClick={() => setMessages({})} className="text-red-500 font-bold hover:underline">Hapus Chat</button>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION BAR */}
        <div className="h-16 border-t border-gray-200 bg-white flex items-center justify-around shrink-0 text-gray-500 select-none z-10">
          <button 
            onClick={() => setActiveTab('updates')} 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition ${
              activeTab === 'updates' ? 'text-black' : 'hover:text-black'
            }`}
          >
            <CircleDot size={20} className={activeTab === 'updates' ? 'text-emerald-600' : ''} />
            <span className="mt-1">Pembaruan</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('calls')} 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition relative ${
              activeTab === 'calls' ? 'text-black' : 'hover:text-black'
            }`}
          >
            <Phone size={20} className={activeTab === 'calls' ? 'text-emerald-600' : ''} />
            <span className="mt-1">Panggilan</span>
            <span className="absolute top-1.5 right-4 w-5 h-5 rounded-full bg-[#25d366] text-white text-[10px] font-bold flex items-center justify-center">32</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('communities')} 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition ${
              activeTab === 'communities' ? 'text-black' : 'hover:text-black'
            }`}
          >
            <Users size={20} className={activeTab === 'communities' ? 'text-emerald-600' : ''} />
            <span className="mt-1">Komunitas</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('chat')} 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition relative ${
              activeTab === 'chat' ? 'text-black' : 'hover:text-black'
            }`}
          >
            <MessageSquareMore size={20} className={activeTab === 'chat' ? 'text-emerald-600' : ''} />
            <span className="mt-1">Chat</span>
            <span className="absolute top-1.5 right-4 w-5 h-5 rounded-full bg-[#25d366] text-white text-[10px] font-bold flex items-center justify-center">50</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('you')} 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition ${
              activeTab === 'you' ? 'text-black' : 'hover:text-black'
            }`}
          >
            <div className="relative w-6 h-6 rounded-full border overflow-hidden">
              <img src={avatar} className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
            </div>
            <span className="mt-1">Anda</span>
          </button>
        </div>
      </div>

      {/* 2. MIDDLE PANEL: Active Chat Window */}
      <div className={`flex-1 h-full flex flex-col relative bg-[#efeae2] ${
        mobileView === 'chat' ? 'flex' : 'hidden md:flex'
      }`}>
        
        {/* Background Wallpaper Pattern */}
        <div className="chat-wallpaper"></div>

        {/* Chat Window Header */}
        <div className="h-16 px-4 bg-[#f0f2f5] border-b border-gray-200 flex items-center justify-between z-10 text-gray-900">
          <div className="flex items-center space-x-3 cursor-pointer overflow-hidden" onClick={() => setShowDetails(!showDetails)}>
            {/* Back button on mobile */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setMobileView('list');
              }}
              className="md:hidden p-1.5 hover:bg-gray-200 rounded-full text-gray-600 hover:text-black transition shrink-0"
            >
              <ArrowLeft size={20} />
            </button>

            {isDmActive ? (
              <img 
                src={dmPartner?.avatar || AVATARS[0]} 
                alt={dmPartner?.username} 
                className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 flex items-center justify-center border border-emerald-500/10 text-emerald-600 text-lg font-bold shrink-0">
                {currentRoomDetails.name.charAt(0)}
              </div>
            )}
            <div className="truncate">
              <h3 className="font-bold text-black text-sm md:text-base leading-tight truncate">
                {currentRoomDetails.name}
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-[150px] md:max-w-xs">
                {isDmActive ? (
                  activeRoomOnline.some(u => u.username === dmPartner?.username) ? (
                    <span className="text-emerald-600 font-medium">Online</span>
                  ) : (
                    <span>Offline</span>
                  )
                ) : activeRoomOnline.length > 0 ? (
                  <span className="text-emerald-600 font-medium">
                    {activeRoomOnline.length + 1} online ({username}, {activeRoomOnline.map(u => u.username).join(', ')})
                  </span>
                ) : (
                  'Hanya Anda di grup ini'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-600">
            <button 
              onClick={() => handleCallInitiate('voice')} 
              className="p-2 hover:bg-gray-200 rounded-full transition hover:text-black" 
              title="Panggilan Suara"
            >
              <Phone size={18} />
            </button>
            <button 
              onClick={() => handleCallInitiate('video')} 
              className="p-2 hover:bg-gray-200 rounded-full transition hover:text-black" 
              title="Panggilan Video"
            >
              <Video size={18} />
            </button>
            <div className="w-px h-6 bg-gray-350"></div>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className={`p-2 rounded-full transition ${showDetails ? 'bg-gray-200 text-emerald-600' : 'hover:bg-gray-200 hover:text-black'}`}
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
                      <span className="px-3 py-1 bg-[#eae6df] text-gray-600 rounded-md text-xs border border-gray-300/20 shadow-sm font-medium">
                        {new Date(msg.timestamp).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  )}

                  <div className={`flex w-full ${msg.self ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] md:max-w-[55%] rounded-lg px-3 py-1.5 shadow-sm relative group animate-slideup ${
                      msg.self 
                        ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none border border-emerald-100/50' 
                        : 'bg-white text-gray-900 rounded-tl-none border border-gray-200/50'
                    }`}>
                      {/* Sender Info for incoming messages */}
                      {!msg.self && (
                        <div className="flex items-center space-x-1.5 mb-1">
                          <img 
                            src={msg.avatar} 
                            alt={msg.sender} 
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-emerald-600">{msg.sender}</span>
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
                                  } ${msg.self ? 'bg-emerald-400' : 'bg-gray-400'}`}
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
                          <span className="text-blue-500">
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
              <h3 className="font-bold text-lg text-gray-900 mb-2">Selamat datang di Room {currentRoomDetails.name}!</h3>
              <p className="text-sm text-gray-500">
                Semua obrolan dikirimkan secara langsung menggunakan MQTT. Ketik pesan Anda di bawah untuk memulai percakapan.
              </p>
            </div>
          )}

          {/* Typing Indicator Bubble */}
          {activeRoomTyping.length > 0 && (
            <div className="flex justify-start items-center space-x-2 animate-pulse mt-2">
              <div className="px-3 py-2 bg-white text-gray-500 rounded-lg rounded-tl-none text-xs flex items-center space-x-2 border border-gray-200/50 shadow-sm">
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
        <div className="mt-auto bg-[#f0f2f5] border-t border-gray-200 p-3 flex flex-col z-10">
          
          {/* Native Emoji Helper Drawer */}
          {showEmojiPicker && (
            <div className="p-3 bg-white rounded-lg border border-gray-200 mb-3 flex flex-wrap gap-2 animate-slideup shadow-sm">
              {['😀','😂','😍','👍','🔥','🙌','👏','🎉','❤️','🤔','💡','🚀','👀','❌','✅','💤'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    setMessageText(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-xl p-2 hover:bg-gray-100 rounded transition transform hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-gray-500">
              <button 
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 hover:bg-gray-200 rounded-full transition ${showEmojiPicker ? 'text-[#00a884]' : 'hover:text-black'}`}
                title="Tambahkan Emoji"
              >
                <Smile size={22} />
              </button>

              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-200 rounded-full transition hover:text-black"
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
                className={`p-2 hover:bg-gray-200 rounded-full transition ${isRecording ? 'text-red-500 animate-pulse' : 'hover:text-black'}`}
                title={isRecording ? "Kirim Rekaman" : "Mulai Rekam Suara"}
              >
                <Mic size={22} />
              </button>
            </div>

            {isRecording ? (
              <div className="flex-1 flex items-center justify-between bg-red-50 border border-red-200 py-2.5 px-4 rounded-lg text-red-500 animate-pulse text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                  <span className="font-semibold">Merekam: {recordingTime} detik (Maks 20s)</span>
                </div>
                <button 
                  type="button" 
                  onClick={cancelRecording}
                  className="text-gray-500 hover:text-black underline font-semibold text-xs transition"
                >
                  Batal
                </button>
              </div>
            ) : (
              <input 
                type="text" 
                placeholder={connectionStatus === 'connected' ? "Ketik pesan..." : "Sedang menghubungkan ke Broker..."}
                className="flex-1 bg-white border border-gray-200 outline-none text-gray-800 text-sm py-2.5 px-4 rounded-lg focus:ring-1 focus:ring-[#00a884] transition placeholder-gray-400"
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
        <div className="fixed inset-0 bg-[#0c1317] z-50 flex flex-col items-center justify-between p-6 select-none">
          {/* Wallpaper pattern for call screen */}
          <div className="call-wallpaper"></div>
          
          {/* 1. Call Screen Header */}
          <div className="w-full flex items-center justify-between z-10">
            {/* Left collapse button */}
            <button 
              onClick={() => endCall(true)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition active:scale-95"
              title="Perkecil"
            >
              <ChevronDown size={20} />
            </button>
            
            {/* Center Call Status */}
            <div className="text-center flex-1 mx-4">
              <h2 className="text-xl font-bold text-white tracking-wide">{partnerUsername || 'Teman Chat'}</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {callState === 'calling' && 'Memanggil...'}
                {callState === 'ringing' && 'Berdering...'}
                {callState === 'connected' && 'Terhubung'}
              </p>
            </div>
            
            {/* Right Add Participant button */}
            <button 
              onClick={() => alert('Fitur panggilan grup lokal')}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition active:scale-95"
              title="Tambah Peserta"
            >
              <UserPlus size={20} />
            </button>
          </div>

          {/* Quick message icon on the right side */}
          <div className="absolute right-6 top-24 z-10 flex flex-col space-y-4">
            <button 
              onClick={() => {
                setMobileView('chat');
                endCall(false); // Go back to chat
              }}
              className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition shadow"
              title="Pesan Singkat"
            >
              <MessageSquareMore size={20} />
            </button>
          </div>

          {/* 2. Center Content Area (Avatar / Video Streams) */}
          <div className="w-full flex-1 flex items-center justify-center my-6 z-10">
            {callType === 'video' && callState === 'connected' ? (
              <div className="relative w-full h-full max-h-[70vh] aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-gray-800">
                {/* Remote Video Stream */}
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                {/* Local PIP Video */}
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute bottom-4 right-4 w-28 md:w-36 aspect-video rounded-xl border-2 border-emerald-500 object-cover shadow-2xl"
                />
              </div>
            ) : (
              /* Big circular profile image exactly like screenshot */
              <div className="relative flex items-center justify-center">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-gray-800/40 shadow-2xl bg-chat-header/30">
                  <img 
                    src={partnerAvatar || AVATARS[0]} 
                    alt={partnerUsername} 
                    className="w-full h-full object-cover grayscale brightness-90" 
                  />
                </div>
                {/* Hidden elements to keep WebRTC working */}
                <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
                <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
              </div>
            )}
          </div>

          {/* 3. Bottom controls capsule bar exactly like screenshot */}
          <div className="w-full max-w-sm bg-[#1e272d]/95 backdrop-blur-md rounded-full px-6 py-4 flex items-center justify-between shadow-2xl border border-white/5 z-10 mb-4">
            {/* More Options */}
            <button 
              onClick={() => alert('Opsi Panggilan Tambahan')}
              className="text-gray-400 hover:text-white p-2 transition active:scale-95"
              title="Opsi Lainnya"
            >
              <MoreHorizontal size={22} />
            </button>

            {/* Video Camera Toggle */}
            <button 
              onClick={toggleVideoMute}
              className={`p-2.5 rounded-full transition active:scale-95 ${
                isVideoMuted ? 'text-rose-500 hover:bg-rose-500/10' : 'text-gray-300 hover:bg-white/10'
              }`}
              title={isVideoMuted ? "Aktifkan Kamera" : "Matikan Kamera"}
            >
              {isVideoMuted ? <VideoOff size={22} /> : <Video size={22} />}
            </button>

            {/* Loudspeaker Volume Toggle */}
            <button 
              onClick={toggleLoudspeaker}
              className={`p-2.5 rounded-full transition active:scale-95 ${
                isLoudspeakerOn ? 'text-[#25d366] hover:bg-emerald-500/10' : 'text-gray-300 hover:bg-white/10'
              }`}
              title={isLoudspeakerOn ? "Matikan Loudspeaker" : "Aktifkan Loudspeaker"}
            >
              {isLoudspeakerOn ? <Volume2 size={22} /> : <Volume1 size={22} />}
            </button>

            {/* Mode Hening (Mute Mic) */}
            <button 
              onClick={toggleAudioMute}
              className={`p-2.5 rounded-full transition active:scale-95 ${
                isAudioMuted ? 'text-rose-500 hover:bg-rose-500/10' : 'text-gray-300 hover:bg-white/10'
              }`}
              title={isAudioMuted ? "Aktifkan Suara" : "Mode Hening"}
            >
              {isAudioMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* Red Hangup Call button */}
            <button 
              onClick={() => endCall(true)}
              className="w-12 h-12 rounded-full bg-[#ea0038] hover:bg-[#d00030] text-white flex items-center justify-center shadow-lg transition transform active:scale-90 hover:scale-105"
              title="Akhiri Panggilan"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      )}



    </div>
  );
}
