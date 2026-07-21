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
  ChevronDown,
  MapPin,
  Map
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

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys & People',
    icon: '😀',
    emojis: [
      { char: '😀', tags: 'smile senyum ketawa gembira happy' },
      { char: '😃', tags: 'smile senyum ketawa gembira happy' },
      { char: '😄', tags: 'smile senyum ketawa gembira happy' },
      { char: '😁', tags: 'smile senyum ketawa gembira happy gigi' },
      { char: '😆', tags: 'smile senyum ketawa gembira happy lol' },
      { char: '😅', tags: 'smile senyum ketawa gembira happy keringat' },
      { char: '😂', tags: 'smile senyum ketawa gembira happy lol wkwk nangis' },
      { char: '🤣', tags: 'smile senyum ketawa gembira happy lol wkwk guling' },
      { char: '😊', tags: 'smile senyum ketawa gembira happy blush' },
      { char: '😇', tags: 'smile senyum ketawa gembira happy malaikat angel' },
      { char: '🙂', tags: 'smile senyum ketawa gembira happy' },
      { char: '🙃', tags: 'smile senyum ketawa gembira happy kebalik' },
      { char: '😉', tags: 'smile senyum ketawa gembira happy kedip wink' },
      { char: '😌', tags: 'smile senyum gembira happy lega' },
      { char: '😍', tags: 'smile senyum gembira happy love cinta takjub suka' },
      { char: '🥰', tags: 'smile senyum gembira happy love cinta takjub suka blush' },
      { char: '😘', tags: 'smile senyum gembira happy love cinta cium kiss' },
      { char: '😗', tags: 'smile senyum gembira happy cium kiss' },
      { char: '😙', tags: 'smile senyum gembira happy cium kiss' },
      { char: '😚', tags: 'smile senyum gembira happy cium kiss' },
      { char: '😋', tags: 'smile senyum gembira happy lezat makan lidah' },
      { char: '😛', tags: 'smile senyum gembira happy lidah' },
      { char: '😝', tags: 'smile senyum gembira happy lidah melet' },
      { char: '😜', tags: 'smile senyum gembira happy lidah melet kedip' },
      { char: '🤪', tags: 'smile senyum gembira happy lidah melet gila mad' },
      { char: '🤨', tags: 'smile senyum heran bingung alismata' },
      { char: '🧐', tags: 'smile senyum heran bingung kaca pembesar kacamata' },
      { char: '🤓', tags: 'smile senyum pintar kacamata nerd' },
      { char: '😎', tags: 'smile senyum kacamata hitam cool gaul kacamata' },
      { char: '🥸', tags: 'smile senyum kacamata topeng samaran' },
      { char: '🤩', tags: 'smile senyum gembira happy takjub mata bintang' },
      { char: '🥳', tags: 'smile senyum gembira happy pesta party' },
      { char: '😏', tags: 'smile senyum licik smirk' },
      { char: '😒', tags: 'smile sedih kesal unamused' },
      { char: '😞', tags: 'sad sedih kecewa' },
      { char: '😔', tags: 'sad sedih pensive kecewa' },
      { char: '😟', tags: 'sad sedih khawatir' },
      { char: '😕', tags: 'sad sedih bingung' },
      { char: '🙁', tags: 'sad sedih cemberut' },
      { char: '☹️', tags: 'sad sedih cemberut parah' },
      { char: '😣', tags: 'sad sedih kesal lelah' },
      { char: '😖', tags: 'sad sedih kesal lelah' },
      { char: '😫', tags: 'sad sedih kesal lelah capek' },
      { char: '😩', tags: 'sad sedih kesal lelah capek' },
      { char: '🥺', tags: 'sad sedih mohon memelas imut' },
      { char: '😢', tags: 'sad sedih nangis cry air mata' },
      { char: '😭', tags: 'sad sedih nangis cry air mata deras' },
      { char: '😤', tags: 'sad sedih kesal marah' },
      { char: '😠', tags: 'sad sedih kesal marah angry' },
      { char: '😡', tags: 'sad sedih kesal marah angry merah red' },
      { char: '🤬', tags: 'sad sedih kesal marah angry sumpah serapah' },
      { char: '🤯', tags: 'sad sedih takjub kepala meledak mindblown' },
      { char: '😳', tags: 'blush malu kaget terkejut flushed' },
      { char: '🥵', tags: 'panas hot gerah merah' },
      { char: '🥶', tags: 'dingin cold beku biru' },
      { char: '😱', tags: 'kaget terkejut takut scream' },
      { char: '😨', tags: 'kaget terkejut takut' },
      { char: '😰', tags: 'kaget terkejut takut cemas keringat' },
      { char: '😥', tags: 'kaget terkejut cemas keringat lega' },
      { char: '😓', tags: 'sedih kesal lelah keringat capek' },
      { char: '🤗', tags: 'smile senyum gembira happy peluk hug' },
      { char: '🤔', tags: 'heran bingung mikir think' },
      { char: '🫣', tags: 'mengintip takut malu peek' },
      { char: '🤭', tags: 'senyum ketawa malu tutup mulut' },
      { char: '🫢', tags: 'kaget terkejut tutup mulut terperangah' },
      { char: '🫡', tags: 'hormat hormat salute' },
      { char: '🤫', tags: 'diam shh quiet' },
      { char: '🫠', tags: 'meleleh lemas melt' },
      { char: '🤥', tags: 'bohong lie pinokio' },
      { char: '😶', tags: 'diam no mouth kosong' },
      { char: '🫥', tags: 'diam kosong ilang' },
      { char: '😐', tags: 'datar netral biasa' },
      { char: '😑', tags: 'datar netral biasa males' },
      { char: '😬', tags: 'meringis tegang grimace' },
      { char: '🙄', tags: 'malas rolling eyes' },
      { char: '😯', tags: 'kaget terkejut terperangah' },
      { char: '😦', tags: 'kaget terkejut' },
      { char: '😧', tags: 'kaget terkejut cemas' },
      { char: '😮', tags: 'kaget terkejut terperangah' },
      { char: '😲', tags: 'kaget terkejut terperangah luar biasa' },
      { char: '🥱', tags: 'ngantuk nguap yawn' },
      { char: '😴', tags: 'tidur ngantuk sleep' },
      { char: '🤤', tags: 'ngiler' },
      { char: '😪', tags: 'tidur ngantuk lelah' },
      { char: '😵', tags: 'pusing mabuk pingsan dizzy' },
      { char: '😵‍💫', tags: 'pusing mabuk pingsan dizzy muter' },
      { char: '🫨', tags: 'gemetar shake kaget' },
      { char: '🤐', tags: 'diam tutup mulut kunci sleting zipper' },
      { char: '🥴', tags: 'pusing mabuk woozy' },
      { char: '🤢', tags: 'mual muntah sick' },
      { char: '🤮', tags: 'muntah sick' },
      { char: '🤧', tags: 'bersin flu sakit sick' },
      { char: '😷', tags: 'masker sakit sick' },
      { char: '🤒', tags: 'sakit demam termometer sick' },
      { char: '🤕', tags: 'sakit luka perban sick' },
      { char: '🤑', tags: 'uang kaya money rich' },
      { char: '🤠', tags: 'koboi cowboy' },
      { char: '😈', tags: 'iblis setan devil ungu' },
      { char: '👿', tags: 'iblis setan devil marah ungu' },
      { char: '👹', tags: 'ogre monster jepang' },
      { char: '👺', tags: 'goblin monster jepang merah' },
      { char: '🤡', tags: 'badut clown lucu' },
      { char: '💩', tags: 'poop pup kotoran lucu' },
      { char: '👻', tags: 'hantu setan ghost serem' },
      { char: '💀', tags: 'tengkorak skull mati death' },
      { char: '☠️', tags: 'tengkorak racun danger bahaya' },
      { char: '👽', tags: 'alien luar angkasa' },
      { char: '👾', tags: 'monster game space invader' },
      { char: '🤖', tags: 'robot mesin tech' },
      { char: '👋', tags: 'tangan dada halo dadah bye wave' },
      { char: '👍', tags: 'setuju oke mantap sip bagus yes like jempol' },
      { char: '👎', tags: 'tolak buruk jelek dislike jempol' },
      { char: '✊', tags: 'kepal tinju semangat' },
      { char: '👊', tags: 'kepal tinju punch tos' },
      { char: '🤛', tags: 'tinju kiri' },
      { char: '🤜', tags: 'tinju kanan' },
      { char: '👏', tags: 'tepuk tangan applause' },
      { char: '🙌', tags: 'hore hore gembira angkat tangan' },
      { char: '👐', tags: 'tangan terbuka' },
      { char: '🤲', tags: 'doa meminta' },
      { char: '🤝', tags: 'jabat tangan setuju deal' },
      { char: '🙏', tags: 'tolong maaf terima kasih doa sujud plise please' },
      { char: '💪', tags: 'semangat kuat otot muscle' }
    ]
  },
  {
    id: 'animals',
    name: 'Animals & Nature',
    icon: '🐶',
    emojis: [
      { char: '🐶', tags: 'anjing dog guk' },
      { char: '🐱', tags: 'kucing cat meong' },
      { char: '🐭', tags: 'tikus mouse' },
      { char: '🐹', tags: 'hamster' },
      { char: '🐰', tags: 'kelinci rabbit' },
      { char: '🦊', tags: 'rubah fox' },
      { char: '🐻', tags: 'beruang bear' },
      { char: '🐼', tags: 'panda' },
      { char: '🐨', tags: 'koala' },
      { char: '🐯', tags: 'harimau tiger' },
      { char: '🦁', tags: 'singa lion' },
      { char: '🐮', tags: 'sapi cow' },
      { char: '🐷', tags: 'babi pig' },
      { char: '🐸', tags: 'katak kodok frog' },
      { char: '🐵', tags: 'monyet monkey' },
      { char: '🐔', tags: 'ayam chicken' },
      { char: '🐧', tags: 'pinguin penguin' },
      { char: '🐦', tags: 'burung bird' },
      { char: '🦆', tags: 'bebek duck' },
      { char: '🦅', tags: 'elang eagle' },
      { char: '🦉', tags: 'burung hantu owl' },
      { char: '🐝', tags: 'lebah bee madu' },
      { char: '🦋', tags: 'kupu kupu butterfly' },
      { char: '🐢', tags: 'kura kura turtle' },
      { char: '🐍', tags: 'ular snake' },
      { char: '🐙', tags: 'gurita octopus' },
      { char: '🦑', tags: 'cumi squid' },
      { char: '🦀', tags: 'kepiting crab' },
      { char: '🐠', tags: 'ikan fish' },
      { char: '🐬', tags: 'lumba dolphin' },
      { char: '🐳', tags: 'paus whale' },
      { char: '🦈', tags: 'hiu shark' },
      { char: '🐊', tags: 'buaya crocodile' },
      { char: '🌴', tags: 'pohon palem kelapa tree' },
      { char: '🌲', tags: 'pohon cemara pinus tree' },
      { char: '🌳', tags: 'pohon rindang tree' },
      { char: '🍀', tags: 'daun semanggi clover keberuntungan' },
      { char: '🍁', tags: 'daun maple gugur' },
      { char: '🌸', tags: 'bunga sakura flower' },
      { char: '🌹', tags: 'bunga mawar rose merah flower' },
      { char: '🌻', tags: 'bunga matahari sunflower kuning' }
    ]
  },
  {
    id: 'food',
    name: 'Food & Drink',
    icon: '🍏',
    emojis: [
      { char: '🍏', tags: 'apel apple hijau buah fruit' },
      { char: '🍎', tags: 'apel apple merah buah fruit' },
      { char: '🍌', tags: 'pisang banana kuning buah fruit' },
      { char: '🍉', tags: 'semangka watermelon buah fruit' },
      { char: '🍇', tags: 'anggur grape buah fruit' },
      { char: '🍓', tags: 'stroberi strawberry buah fruit' },
      { char: '🍒', tags: 'ceri cherry buah fruit' },
      { char: '🥭', tags: 'mangga mango buah fruit' },
      { char: '🍍', tags: 'nanas pineapple buah fruit' },
      { char: '🥥', tags: 'kelapa coconut buah fruit' },
      { char: '🥑', tags: 'alpukat avocado buah fruit' },
      { char: '🍆', tags: 'terong eggplant' },
      { char: '🌽', tags: 'jagung corn' },
      { char: '🌶️', tags: 'cabai chili pedas hot' },
      { char: '🍞', tags: 'roti bread' },
      { char: '🥩', tags: 'daging steak meat' },
      { char: '🍔', tags: 'burger hamburger' },
      { char: '🍟', tags: 'kentang goreng french fries' },
      { char: '🍕', tags: 'pizza' },
      { char: '🍜', tags: 'mie bakso ramen noodle' },
      { char: '🍣', tags: 'sushi' },
      { char: '🍩', tags: 'donat donut' },
      { char: '🍪', tags: 'kue kering cookie biskuit' },
      { char: '🎂', tags: 'kue ulang tahun cake birthday' },
      { char: '🍫', tags: 'cokelat chocolate' },
      { char: '🍬', tags: 'permen candy' },
      { char: '☕', tags: 'kopi teh cup coffee tea' },
      { char: '🍺', tags: 'bir beer alkohol' },
      { char: '🍻', tags: 'bir beer tos cheers' },
      { char: '🥂', tags: 'sampanye toast cheers' },
      { char: '🥃', tags: 'wiski glass whiskey' },
      { char: '🥤', tags: 'minuman soda cup drink' },
      { char: '🧃', tags: 'jus kotak juice' },
      { char: '🧊', tags: 'es batu ice' }
    ]
  },
  {
    id: 'activities',
    name: 'Activities & Sports',
    icon: '⚽',
    emojis: [
      { char: '⚽', tags: 'bola sepak bola soccer football' },
      { char: '🏀', tags: 'basket basketball' },
      { char: '🏈', tags: 'rugby football' },
      { char: '⚾', tags: 'bisbol baseball' },
      { char: '🎾', tags: 'tenis tennis' },
      { char: '🏐', tags: 'voli volleyball' },
      { char: '🎱', tags: 'biliar billiard 8ball' },
      { char: '🏓', tags: 'pingpong table tennis' },
      { char: '🏸', tags: 'bulutangkis badminton' },
      { char: '⛳', tags: 'golf' },
      { char: '🏆', tags: 'piala trofi trophy juara winner' },
      { char: '🥇', tags: 'medali emas gold medal' },
      { char: '🎖️', tags: 'medali militer medal' },
      { char: '🎨', tags: 'melukis lukisan art paint' },
      { char: '🎬', tags: 'film bioskop movie clapperboard' },
      { char: '🎤', tags: 'mikrofon mic nyanyi sing' },
      { char: '🎧', tags: 'headphone musik music' },
      { char: '🎸', tags: 'gitar guitar musik music' },
      { char: '🎹', tags: 'piano keyboard musik music' },
      { char: '🎮', tags: 'game konsol stik controller play' },
      { char: '🎯', tags: 'target panah dart bullseye' },
      { char: '🎲', tags: 'dadu dice game' }
    ]
  },
  {
    id: 'travel',
    name: 'Travel & Places',
    icon: '🚗',
    emojis: [
      { char: '🚗', tags: 'mobil car merah' },
      { char: '🚕', tags: 'taksi taxi kuning' },
      { char: '🏎️', tags: 'mobil balap race car' },
      { char: '🚓', tags: 'mobil polisi police car' },
      { char: '🚌', tags: 'bus bis' },
      { char: '🏍️', tags: 'motor motorcycle' },
      { char: '🚲', tags: 'sepeda bicycle' },
      { char: '🚨', tags: 'sirine polisi darurat emergency' },
      { char: '⛵', tags: 'perahu kapal boat sail' },
      { char: '🚢', tags: 'kapal pesiar ship cruise' },
      { char: '✈️', tags: 'pesawat terbang plane flight' },
      { char: '🚀', tags: 'roket rocket luar angkasa space' },
      { char: '🛸', tags: 'ufo piring terbang alien' },
      { char: '⏰', tags: 'jam weker alarm clock time' },
      { char: '⏱️', tags: 'stopwatch waktu' },
      { char: '🗺️', tags: 'peta map' },
      { char: '☀️', tags: 'matahari panas cerah sun day' },
      { char: '⭐', tags: 'bintang star' },
      { char: '🌟', tags: 'bintang bersinar star' },
      { char: '☁️', tags: 'awan mendung cloud' },
      { char: '⛈️', tags: 'hujan petir storm rain' },
      { char: '🌈', tags: 'pelangi rainbow' },
      { char: '⚡', tags: 'petir kilat listrik thunder' },
      { char: '❄️', tags: 'salju dingin snow winter' },
      { char: '🔥', tags: 'api panas bakar fire burn' },
      { char: '🌊', tags: 'ombak laut air water wave' }
    ]
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: '📱',
    emojis: [
      { char: '📱', tags: 'hp handphone smartphone telepon' },
      { char: '💻', tags: 'laptop komputer computer' },
      { char: '🖥️', tags: 'komputer monitor screen pc' },
      { char: '📷', tags: 'kamera foto camera photo' },
      { char: '🎥', tags: 'kamera video movie cam' },
      { char: '📞', tags: 'telepon lama phone call' },
      { char: '📺', tags: 'tv televisi television' },
      { char: '🎙️', tags: 'mic studio microphone broadcast' },
      { char: '💡', tags: 'lampu ide lightbulb idea' },
      { char: '🔦', tags: 'senter flashlight' },
      { char: '✉️', tags: 'surat amplop email mail letter' },
      { char: '📦', tags: 'paket kardus box package' },
      { char: '🔑', tags: 'kunci key' },
      { char: '🔒', tags: 'gembok kunci lock' },
      { char: '🔓', tags: 'gembok buka unlock' },
      { char: '📝', tags: 'catatan kertas memo note pen' },
      { char: '📅', tags: 'kalender tanggal calendar date' },
      { char: '🗑️', tags: 'tempat sampah trash bin' },
      { char: '📌', tags: 'pin paku payung' },
      { char: '📍', tags: 'pin peta lokasi location' },
      { char: '💵', tags: 'uang kertas dollar money cash' },
      { char: '💳', tags: 'kartu kredit credit card bank' },
      { char: '🛍️', tags: 'belanja tas shopping bag' }
    ]
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: '❤️',
    emojis: [
      { char: '❤️', tags: 'hati merah love cinta heart' },
      { char: '🧡', tags: 'hati oranye love cinta heart orange' },
      { char: '💛', tags: 'hati kuning love cinta heart yellow' },
      { char: '💚', tags: 'hati hijau love cinta heart green' },
      { char: '💙', tags: 'hati biru love cinta heart blue' },
      { char: '💜', tags: 'hati ungu love cinta heart purple' },
      { char: '🖤', tags: 'hati hitam love cinta heart black' },
      { char: '🤍', tags: 'hati putih love cinta heart white' },
      { char: '🤎', tags: 'hati cokelat love cinta heart brown' },
      { char: '💔', tags: 'patah hati broken heart sedih' },
      { char: '❣️', tags: 'tanda seru hati exclamation heart' },
      { char: '💕', tags: 'dua hati love cinta heart' },
      { char: '💞', tags: 'hati berputar love cinta heart' },
      { char: '✨', tags: 'kilau bintang sparkle' },
      { char: '💥', tags: 'ledakan boom spark' },
      { char: '💦', tags: 'keringat cipratan air sweat water' },
      { char: '💨', tags: 'angin lari cepat dash' },
      { char: '💯', tags: 'seratus sempurna 100' },
      { char: '⚠️', tags: 'peringatan bahaya warning danger' },
      { char: '✅', tags: 'centang hijau check yes' },
      { char: '❌', tags: 'silang merah cross no' },
      { char: '💤', tags: 'tidur dengkur sleep' }
    ]
  }
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
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('');
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('smileys');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  // --- Location & Map Sharing States & Refs ---
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [isSharingLive, setIsSharingLive] = useState(false);
  const [liveLocations, setLiveLocations] = useState({}); // { [roomId]: { [username]: { latitude, longitude, avatar, lastUpdated, liveId } } }
  const [mapModal, setMapModal] = useState({ isOpen: false, type: 'static', lat: -6.2000, lng: 106.8166, label: '', roomId: '' });
  const liveWatchRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapMarkersRef = useRef({});

  // --- Audio States & Refs ---
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recordingTimeRef = useRef(0);
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

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const selectionStartRef = useRef(0);
  const typingTimeoutRef = useRef({});

  const handleEmojiClick = (emoji) => {
    const input = messageInputRef.current;
    const start = selectionStartRef.current;
    const text = messageText;
    const before = text.substring(0, start);
    const after = text.substring(start, text.length);
    const newText = before + emoji + after;
    setMessageText(newText);
    
    // Update the selection reference
    selectionStartRef.current = start + emoji.length;
    
    if (input) {
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 10);
    }
    handleTypingIndicator(true);
  };

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

  // Initialize and Update Leaflet Map in Modal
  useEffect(() => {
    if (!mapModal.isOpen) return;

    const timer = setTimeout(() => {
      const container = document.getElementById('leaflet-map-container');
      if (!container) return;

      if (window.L) {
        const L = window.L;
        
        const defaultIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #00a884; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        if (!mapInstanceRef.current) {
          const map = L.map('leaflet-map-container').setView([mapModal.lat, mapModal.lng], 15);
          
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
          }).addTo(map);

          mapInstanceRef.current = map;
        }

        const map = mapInstanceRef.current;

        if (mapModal.type === 'static') {
          Object.values(mapMarkersRef.current).forEach(m => m.remove());
          mapMarkersRef.current = {};

          const marker = L.marker([mapModal.lat, mapModal.lng], { icon: defaultIcon }).addTo(map);
          if (mapModal.label) {
            marker.bindPopup(`<b style="color:#000;">${mapModal.label}</b>`).openPopup();
          }
          mapMarkersRef.current['static'] = marker;
          map.setView([mapModal.lat, mapModal.lng], 15);
        } else if (mapModal.type === 'live') {
          const activeRoomId = mapModal.roomId || activeRoom;
          const sharers = liveLocations[activeRoomId] || {};
          const activeUsers = Object.keys(sharers);
          
          Object.keys(mapMarkersRef.current).forEach(userKey => {
            if (!activeUsers.includes(userKey) && userKey !== 'static') {
              mapMarkersRef.current[userKey].remove();
              delete mapMarkersRef.current[userKey];
            }
          });

          const latLngList = [];
          Object.entries(sharers).forEach(([userKey, data]) => {
            const isMe = userKey === username;
            const labelText = isMe ? 'Anda (Live)' : `${userKey} (Live)`;
            const avatarUrl = data.avatar || AVATARS[0];
            
            const avatarIcon = L.divIcon({
              className: 'custom-avatar-icon',
              html: `
                <div style="position: relative; width: 40px; height: 40px;">
                  <img src="${avatarUrl}" style="width: 32px; height: 32px; border-radius: 50%; border: 3px solid ${isMe ? '#00a884' : '#0ea5e9'}; object-fit: cover; box-shadow: 0 2px 5px rgba(0,0,0,0.4);" />
                  <div style="position: absolute; bottom: 0; left: 14px; width: 12px; height: 12px; border-radius: 50%; background-color: #10b981; border: 2px solid white; box-shadow: 0 0 2px rgba(0,0,0,0.5);" class="animate-pulse"></div>
                </div>
              `,
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            });

            const latLng = [data.latitude, data.longitude];
            latLngList.push(latLng);

            if (mapMarkersRef.current[userKey]) {
              mapMarkersRef.current[userKey].setLatLng(latLng);
            } else {
              const marker = L.marker(latLng, { icon: avatarIcon }).addTo(map);
              marker.bindPopup(`<b style="color:#000;">${labelText}</b>`);
              mapMarkersRef.current[userKey] = marker;
            }
          });

          if (latLngList.length > 0) {
            const bounds = L.latLngBounds(latLngList);
            if (latLngList.length === 1) {
              map.setView(latLngList[0], 15);
            } else {
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          }
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [mapModal.isOpen, mapModal.lat, mapModal.lng, mapModal.type, liveLocations, activeRoom]);

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

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
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
      
      // Subscribe to Live Location sharing wildcards
      mqttClient.subscribe('mqtt_chat/rooms/+/live_location/+');
      mqttClient.subscribe('mqtt_chat/dms/rooms/+/live_location/+');
      
      // Announce self
      announcePresence(mqttClient);
    });

    mqttClient.on('message', (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());

        // Handle Live Location data
        if (topic.includes('/live_location/')) {
          const parts = topic.split('/');
          const isDm = parts[1] === 'dms';
          const roomId = isDm ? parts[3] : parts[2];
          const senderUser = isDm ? parts[5] : parts[4];
          
          if (senderUser !== username) {
            setLiveLocations(prev => {
              const roomLive = { ...prev[roomId] } || {};
              if (data.type === 'stop') {
                delete roomLive[senderUser];
              } else {
                roomLive[senderUser] = {
                  latitude: data.latitude,
                  longitude: data.longitude,
                  avatar: data.avatar,
                  liveId: data.liveId,
                  lastUpdated: Date.now()
                };
              }
              return { ...prev, [roomId]: roomLive };
            });
          }
          return;
        }
        
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
          if (data.type === 'live-location-stopped') {
            setMessages(prev => {
              const roomMsgs = prev[roomId] || [];
              const updated = roomMsgs.map(m => {
                if (m.type === 'live-location' && m.liveId === data.liveId) {
                  return { ...m, isLiveStopped: true };
                }
                return m;
              });
              return { ...prev, [roomId]: updated };
            });
            return;
          }

          const isSenderSelf = data.username === username;
          const formattedMessage = {
            id: data.id || Math.random().toString(),
            sender: data.username,
            avatar: data.avatar || AVATARS[0],
            text: data.text,
            type: data.type || 'text', // 'text', 'image', 'audio', 'location', 'live-location'
            timestamp: data.timestamp || Date.now(),
            mediaData: data.mediaData,
            latitude: data.latitude,
            longitude: data.longitude,
            liveId: data.liveId,
            isLiveStopped: data.isLiveStopped,
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
    selectionStartRef.current = 0;
    handleTypingIndicator(false);
  };

  // --- Geolocation Sharing Actions ---
  const handleSendStaticLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolokasi tidak didukung oleh browser Anda.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        const payload = {
          id: `msg_${Math.random().toString(36).substring(2, 15)}`,
          username,
          avatar,
          text: `📍 Lokasi Dibagikan`,
          type: 'location',
          latitude: lat,
          longitude: lng,
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
        setShowLocationMenu(false);
      },
      (error) => {
        console.error(error);
        alert("Gagal mendapatkan lokasi Anda. Pastikan izin lokasi diberikan.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleStartLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolokasi tidak didukung oleh browser Anda.");
      return;
    }
    
    if (isSharingLive) {
      handleStopLiveLocation();
      return;
    }
    
    const liveId = `live_${username}_${Date.now()}`;
    setIsSharingLive(true);
    setShowLocationMenu(false);
    
    const initPayload = {
      id: `msg_${Math.random().toString(36).substring(2, 15)}`,
      username,
      avatar,
      text: `📍 Berbagi Lokasi Terkini (Live)`,
      type: 'live-location',
      liveId,
      isLiveStopped: false,
      timestamp: Date.now()
    };
    
    const isDm = activeRoom.startsWith('dm_');
    const chatTopic = isDm ? `mqtt_chat/dms/rooms/${activeRoom}` : `mqtt_chat/rooms/${activeRoom}`;
    client.publish(chatTopic, JSON.stringify(initPayload), { qos: 1 });
    
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
    
    const locTopic = isDm 
      ? `mqtt_chat/dms/rooms/${activeRoom}/live_location/${username}` 
      : `mqtt_chat/rooms/${activeRoom}/live_location/${username}`;
      
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        const payload = {
          latitude: lat,
          longitude: lng,
          avatar,
          liveId,
          timestamp: Date.now()
        };
        client.publish(locTopic, JSON.stringify(payload), { qos: 0 });
        
        setLiveLocations(prev => {
          const roomLive = prev[activeRoom] ? { ...prev[activeRoom] } : {};
          roomLive[username] = {
            latitude: lat,
            longitude: lng,
            avatar,
            liveId,
            lastUpdated: Date.now()
          };
          return { ...prev, [activeRoom]: roomLive };
        });
      },
      (err) => {
        console.error(err);
      },
      { enableHighAccuracy: true }
    );
    
    liveWatchRef.current = { watchId, liveId, roomId: activeRoom };
    
    // Auto-timeout after 15 mins
    setTimeout(() => {
      handleStopLiveLocation();
    }, 15 * 60 * 1000);
  };

  const handleStopLiveLocation = () => {
    if (liveWatchRef.current) {
      const { watchId, liveId, roomId } = liveWatchRef.current;
      navigator.geolocation.clearWatch(watchId);
      
      const isDm = roomId.startsWith('dm_');
      const locTopic = isDm 
        ? `mqtt_chat/dms/rooms/${roomId}/live_location/${username}` 
        : `mqtt_chat/rooms/${roomId}/live_location/${username}`;
      client.publish(locTopic, JSON.stringify({ type: 'stop' }), { qos: 1 });
      
      const stopPayload = {
        type: 'live-location-stopped',
        liveId,
        username,
        timestamp: Date.now()
      };
      const chatTopic = isDm ? `mqtt_chat/dms/rooms/${roomId}` : `mqtt_chat/rooms/${roomId}`;
      client.publish(chatTopic, JSON.stringify(stopPayload), { qos: 1 });
      
      setLiveLocations(prev => {
        const roomLive = prev[roomId] ? { ...prev[roomId] } : {};
        delete roomLive[username];
        return { ...prev, [roomId]: roomLive };
      });
      
      setMessages(prev => {
        const roomMsgs = prev[roomId] || [];
        const updated = roomMsgs.map(m => {
          if (m.type === 'live-location' && m.liveId === liveId) {
            return { ...m, isLiveStopped: true };
          }
          return m;
        });
        return { ...prev, [roomId]: updated };
      });
      
      setIsSharingLive(false);
      liveWatchRef.current = null;
    }
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
    e.target.value = '';
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
        const duration = recordingTimeRef.current;
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
      recordingTimeRef.current = 0;

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          recordingTimeRef.current = next;
          if (next >= 20) { // Limit max recording to 20 seconds
            stopRecording();
          }
          return next;
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
      <div className={`w-full md:w-[380px] xl:w-[420px] h-full flex flex-col border-r border-gray-800 bg-chat-sidebar shrink-0 z-10 text-gray-300 ${
        mobileView === 'list' ? 'flex' : 'hidden md:flex'
      }`}>
        
        {/* User Profile Info Header */}
        <div className="h-16 px-4 flex items-center justify-between bg-chat-header border-b border-gray-800">
          {/* Left: Options menu */}
          <button 
            onClick={() => setActiveTab('you')}
            className="w-10 h-10 rounded-full bg-chat-active hover:bg-chat-active/80 flex items-center justify-center text-gray-300 transition"
            title="Pengaturan"
          >
            <span className="font-bold text-lg text-white">...</span>
          </button>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => alert('Fitur Kamera Jaringan Lokal')}
              className="p-2 hover:bg-chat-active rounded-full text-gray-300 transition"
              title="Kamera"
            >
              <Camera size={22} />
            </button>
            <button 
              onClick={() => {
                setShowStartDmModal(true);
              }} 
              className="w-9 h-9 bg-chat-accent hover:bg-chat-accent/90 text-white rounded-full flex items-center justify-center shadow transition transform active:scale-95"
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
            <div className="px-4 py-2 bg-chat-sidebar">
              <h1 className="text-3xl font-bold text-white tracking-tight">Chat</h1>
            </div>

            {/* Search Chats */}
            <div className="px-4 py-2 bg-chat-sidebar">
              <div className="relative flex items-center bg-chat-active rounded-lg px-4 py-2 text-gray-400 transition focus-within:bg-chat-active/80">
                <Search size={18} className="mr-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari atau mulai chat baru" 
                  className="bg-transparent border-none outline-none w-full text-sm text-gray-200 placeholder-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Archived Section Row */}
            <div className="px-4 py-3 flex items-center justify-between hover:bg-chat-active/50 cursor-pointer border-b border-gray-800/40">
              <div className="flex items-center space-x-4">
                <Archive size={20} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-300">Diarsipkan</span>
              </div>
              <span className="text-xs text-chat-accent font-bold">2</span>
            </div>

            {/* Unified Chats List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-800/40 bg-chat-sidebar">
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
                        isSelected ? 'bg-chat-active' : 'hover:bg-chat-active/55'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {chat.isGroup ? (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 flex items-center justify-center border border-emerald-500/10 text-emerald-400 text-xl font-bold shrink-0">
                            {chat.name.charAt(0)}
                          </div>
                        ) : (
                          <img 
                            src={chat.avatar || AVATARS[0]} 
                            alt={chat.name} 
                            className="w-12 h-12 rounded-full object-cover border border-gray-800"
                          />
                        )}
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-chat-sidebar"></span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-white text-base truncate">{chat.name}</span>
                          {chat.lastMsg ? (
                            <span className="text-[11px] text-gray-400 shrink-0 font-medium">{formatTime(chat.lastMsg.timestamp)}</span>
                          ) : (
                            <span className="text-[11px] text-gray-400 shrink-0 font-medium">08.55</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-400 truncate flex-1 pr-2">
                            {chat.lastMsg ? (
                              <span className="flex items-center space-x-1">
                                {chat.lastMsg.sender === username && (
                                  <CheckCheck size={16} className="text-blue-500 shrink-0 inline mr-1" />
                                )}
                                <span className="truncate">{chat.lastMsg.text}</span>
                              </span>
                            ) : (
                              <span className="italic text-gray-500">{chat.description || 'Mulai obrolan...'}</span>
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
          <div className="flex-1 flex flex-col p-4 bg-chat-sidebar">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-4">Pembaruan</h1>
            <div className="flex items-center space-x-3 mb-6 p-2">
              <div className="relative">
                <img src={avatar} className="w-14 h-14 rounded-full border-2 border-gray-800 object-cover" />
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-chat-accent rounded-full border-2 border-chat-sidebar flex items-center justify-center text-white text-xs font-bold">+</span>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Status Saya</h4>
                <p className="text-xs text-gray-400">Ketuk untuk menambahkan pembaruan status</p>
              </div>
            </div>
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pembaruan terkini</h5>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full border-2 border-chat-accent p-0.5">
                  <img src={AVATARS[1]} className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">serda Desta</h4>
                  <p className="text-xs text-gray-400">Baru saja</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Calls (Panggilan) */}
        {activeTab === 'calls' && (
          <div className="flex-1 flex flex-col bg-chat-sidebar">
            <div className="p-4">
              <h1 className="text-3xl font-bold text-white tracking-tight">Panggilan</h1>
            </div>
            <div className="flex-1 overflow-y-auto px-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={AVATARS[2]} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-white text-sm">serda Desta</h4>
                    <p className="text-xs text-red-400 flex items-center">✓ Telepon video • 09.55</p>
                  </div>
                </div>
                <Video size={20} className="text-chat-accent cursor-pointer" onClick={() => startCall('video', 'serda Desta', AVATARS[2])} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={AVATARS[3]} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Pratu Dani</h4>
                    <p className="text-xs text-chat-accent flex items-center">✓ Telepon video • 08.48</p>
                  </div>
                </div>
                <Video size={20} className="text-chat-accent cursor-pointer" onClick={() => startCall('video', 'Pratu Dani', AVATARS[3])} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Communities (Komunitas) */}
        {activeTab === 'communities' && (
          <div className="flex-1 flex flex-col p-6 items-center justify-center text-center bg-chat-sidebar">
            <Users size={64} className="text-chat-accent mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Perkenalkan Komunitas</h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Hubungkan grup-grup obrolan yang berkaitan dan kelola dalam satu tempat dengan mudah.
            </p>
          </div>
        )}

        {/* Tab 5: You (Anda) / Native Settings */}
        {activeTab === 'you' && (
          <div className="flex-1 flex flex-col p-4 bg-chat-sidebar overflow-y-auto">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-4">Anda</h1>
            
            {/* Profile summary card */}
            <div className="bg-chat-active rounded-xl p-4 shadow-sm border border-gray-800 flex items-center space-x-4 mb-6">
              <div className="relative">
                <img src={avatar} className="w-16 h-16 rounded-full object-cover border border-gray-800" />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-chat-active"></span>
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="font-bold text-lg text-white bg-transparent border-b border-transparent hover:border-gray-700 focus:border-chat-accent outline-none w-full"
                />
                <p className="text-xs text-gray-400 mt-0.5">Ketuk untuk ubah nama panggilan</p>
              </div>
            </div>

            {/* Avatar picker */}
            <div className="bg-chat-active rounded-xl p-4 shadow-sm border border-gray-800 mb-6">
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ubah Foto Profil</h5>
              <div className="flex gap-2.5 flex-wrap">
                {AVATARS.map((av, index) => (
                  <button
                    key={index}
                    onClick={() => setAvatar(av)}
                    className={`w-11 h-11 rounded-full overflow-hidden border-2 transition ${
                      avatar === av ? 'border-chat-accent scale-105 shadow' : 'border-transparent hover:border-gray-750'
                    }`}
                  >
                    <img src={av} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* MQTT Server Setup */}
            <div className="bg-chat-active rounded-xl p-4 shadow-sm border border-gray-800 mb-6">
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Server Broker MQTT</h5>
              <input 
                type="text" 
                value={brokerUrl}
                onChange={(e) => setBrokerUrl(e.target.value)}
                className="w-full bg-chat-sidebar border border-gray-800 outline-none text-white text-xs py-2 px-3 rounded-lg focus:ring-1 focus:ring-chat-accent font-mono"
              />
              <div className="flex gap-2 flex-wrap mt-2">
                {DEFAULT_BROKERS.map(broker => (
                  <button
                    key={broker.url}
                    onClick={() => setBrokerUrl(broker.url)}
                    className={`text-[10px] px-2 py-1 rounded transition border ${
                      brokerUrl === broker.url 
                        ? 'bg-chat-accent/20 border-chat-accent text-white' 
                        : 'bg-chat-sidebar border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {broker.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Connection Banner */}
            <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
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
                <span className="font-semibold">
                  {connectionStatus === 'connected' ? 'Broker Terkoneksi' :
                   connectionStatus === 'connecting' ? 'Menghubungkan...' : 'Koneksi Terputus'}
                </span>
              </div>
              <button onClick={() => setMessages({})} className="text-rose-400 font-bold hover:underline">Hapus Chat</button>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION BAR */}
        <div className="h-16 border-t border-gray-800 bg-chat-header flex items-center justify-around shrink-0 text-gray-400 select-none z-10">
          <button 
            onClick={() => setActiveTab('updates')} 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition ${
              activeTab === 'updates' ? 'text-white' : 'hover:text-white'
            }`}
          >
            <CircleDot size={20} className={activeTab === 'updates' ? 'text-chat-accent' : ''} />
            <span className="mt-1">Pembaruan</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('calls')} 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition relative ${
              activeTab === 'calls' ? 'text-white' : 'hover:text-white'
            }`}
          >
            <Phone size={20} className={activeTab === 'calls' ? 'text-chat-accent' : ''} />
            <span className="mt-1">Panggilan</span>
            <span className="absolute top-1.5 right-4 w-5 h-5 rounded-full bg-chat-accent text-white text-[10px] font-bold flex items-center justify-center">32</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('communities')} 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition ${
              activeTab === 'communities' ? 'text-white' : 'hover:text-white'
            }`}
          >
            <Users size={20} className={activeTab === 'communities' ? 'text-chat-accent' : ''} />
            <span className="mt-1">Komunitas</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('chat')} 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition relative ${
              activeTab === 'chat' ? 'text-white' : 'hover:text-white'
            }`}
          >
            <MessageSquareMore size={20} className={activeTab === 'chat' ? 'text-chat-accent' : ''} />
            <span className="mt-1">Chat</span>
            <span className="absolute top-1.5 right-4 w-5 h-5 rounded-full bg-chat-accent text-white text-[10px] font-bold flex items-center justify-center">50</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('you')} 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition ${
              activeTab === 'you' ? 'text-white' : 'hover:text-white'
            }`}
          >
            <div className="relative w-6 h-6 rounded-full border border-gray-800 overflow-hidden">
              <img src={avatar} className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-chat-header"></span>
            </div>
            <span className="mt-1">Anda</span>
          </button>
        </div>
      </div>

      {/* 2. MIDDLE PANEL: Active Chat Window */}
      <div className={`flex-1 h-full flex flex-col relative bg-chat-bg ${
        mobileView === 'chat' ? 'flex' : 'hidden md:flex'
      }`}>
        
        {/* Background Wallpaper Pattern */}
        <div className="chat-wallpaper"></div>

        {/* Chat Window Header */}
        <div className="h-16 px-4 bg-chat-header border-b border-gray-800 flex items-center justify-between z-10 text-white">
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
              <h3 className="font-bold text-white text-sm md:text-base leading-tight truncate">
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

          <div className="flex items-center space-x-3 text-gray-400">
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

        {/* Live Location Alert Bar */}
        {Object.keys(liveLocations[activeRoom] || {}).length > 0 && (
          <div className="bg-[#005c4b]/20 border-b border-[#00a884]/20 py-2 px-4 flex items-center justify-between z-10 animate-slideup text-xs md:text-sm shrink-0">
            <div className="flex items-center space-x-2 text-emerald-400 font-medium truncate pr-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shrink-0"></span>
              <MapPin size={16} className="shrink-0" />
              <span className="truncate">
                {Object.keys(liveLocations[activeRoom]).map(u => u === username ? 'Anda' : u).join(', ')} sedang berbagi lokasi terkini
              </span>
            </div>
            <button
              onClick={() => {
                const sharers = liveLocations[activeRoom];
                const firstUser = Object.keys(sharers)[0];
                const data = sharers[firstUser];
                setMapModal({
                  isOpen: true,
                  type: 'live',
                  lat: data.latitude,
                  lng: data.longitude,
                  label: firstUser,
                  roomId: activeRoom
                });
              }}
              className="text-[#00a884] hover:underline font-bold text-xs shrink-0 cursor-pointer"
            >
              Lihat di Peta
            </button>
          </div>
        )}

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
                      <span className="px-3 py-1 bg-chat-header text-gray-300 rounded-md text-xs border border-gray-800/30 shadow-sm font-medium">
                        {new Date(msg.timestamp).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  )}

                  <div className={`flex w-full ${msg.self ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] md:max-w-[55%] rounded-lg px-3 py-1.5 shadow-sm relative group animate-slideup ${
                      msg.self 
                        ? 'bg-chat-outgoing text-white rounded-tr-none border border-emerald-950/20' 
                        : 'bg-chat-incoming text-white rounded-tl-none border border-gray-800/30'
                    }`}>
                      {/* Sender Info for incoming messages */}
                      {!msg.self && (
                        <div className="flex items-center space-x-1.5 mb-1">
                          <img 
                            src={msg.avatar} 
                            alt={msg.sender} 
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-chat-accent">{msg.sender}</span>
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
                            className="w-9 h-9 rounded-full bg-chat-accent hover:bg-chat-accent/90 text-white flex items-center justify-center transition shrink-0 shadow"
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
                                  } ${msg.self ? 'bg-emerald-400' : 'bg-gray-500'}`}
                                ></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : msg.type === 'location' ? (
                        <div className="flex flex-col space-y-2 p-1 min-w-[200px]">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                              <MapPin size={18} />
                            </div>
                            <div className="truncate">
                              <h4 className="text-xs font-bold text-emerald-400">Lokasi Dibagikan</h4>
                              <p className="text-[10px] text-gray-400 truncate">
                                {msg.latitude ? msg.latitude.toFixed(5) : '0'}, {msg.longitude ? msg.longitude.toFixed(5) : '0'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setMapModal({
                              isOpen: true,
                              type: 'static',
                              lat: msg.latitude,
                              lng: msg.longitude,
                              label: `${msg.sender} membagikan lokasi`,
                              roomId: activeRoom
                            })}
                            className="w-full py-1.5 bg-chat-active hover:bg-chat-active/85 text-white rounded text-xs font-semibold transition"
                          >
                            Lihat Peta
                          </button>
                        </div>
                      ) : msg.type === 'live-location' ? (
                        <div className="flex flex-col space-y-2 p-1 min-w-[220px]">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                              <MapPin size={18} className={!msg.isLiveStopped ? 'animate-pulse' : ''} />
                            </div>
                            <div className="truncate">
                              <h4 className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                                <span>Lokasi Terkini (Live)</span>
                                {!msg.isLiveStopped && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>}
                              </h4>
                              <p className="text-[10px] text-gray-400">
                                {!msg.isLiveStopped ? 'Sedang membagikan...' : 'Berbagi lokasi berakhir'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const sharers = liveLocations[activeRoom] || {};
                                const userData = sharers[msg.sender];
                                const targetLat = userData?.latitude || msg.latitude || -6.2000;
                                const targetLng = userData?.longitude || msg.longitude || 106.8166;
                                
                                setMapModal({
                                  isOpen: true,
                                  type: 'live',
                                  lat: targetLat,
                                  lng: targetLng,
                                  label: msg.sender,
                                  roomId: activeRoom
                                });
                              }}
                              className="flex-1 py-1.5 bg-chat-active hover:bg-chat-active/85 text-white rounded text-xs font-semibold transition"
                            >
                              {!msg.isLiveStopped ? 'Lihat Live' : 'Lihat Lokasi'}
                            </button>
                            
                            {!msg.isLiveStopped && msg.self && (
                              <button
                                onClick={handleStopLiveLocation}
                                className="py-1.5 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/30 rounded text-xs font-semibold transition shrink-0"
                              >
                                Hentikan
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                      )}

                      {/* Footer Time + Tick */}
                      <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-gray-400/80">
                        <span>{formatTime(msg.timestamp)}</span>
                        {msg.self && (
                          <span className="text-chat-accent">
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
              <div className="w-16 h-16 rounded-full bg-chat-active border border-gray-800 text-chat-accent flex items-center justify-center mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Selamat datang di Room {currentRoomDetails.name}!</h3>
              <p className="text-sm text-gray-400">
                Semua obrolan dikirimkan secara langsung menggunakan MQTT. Ketik pesan Anda di bawah untuk memulai percakapan.
              </p>
            </div>
          )}

          {/* Typing Indicator Bubble */}
          {activeRoomTyping.length > 0 && (
            <div className="flex justify-start items-center space-x-2 animate-pulse mt-2">
              <div className="px-3 py-2 bg-chat-incoming text-gray-400 rounded-lg rounded-tl-none text-xs flex items-center space-x-2 border border-gray-800/30 shadow-sm">
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
          
          {/* WhatsApp Web Style Emoji Picker Drawer */}
          {showEmojiPicker && (
            <div className="flex flex-col bg-[#111b21] rounded-lg border border-[#222e35] mb-3 overflow-hidden animate-slideup shadow-lg h-72">
              {/* Category tabs */}
              <div className="flex bg-[#202c33] border-b border-[#222e35] p-1 justify-around text-lg shrink-0 select-none">
                {EMOJI_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setActiveEmojiCategory(category.id);
                      setEmojiSearchQuery('');
                    }}
                    className={`p-1.5 rounded transition ${activeEmojiCategory === category.id && !emojiSearchQuery ? 'bg-[#2a3942] text-[#00a884]' : 'text-gray-400 hover:text-white'}`}
                    title={category.name}
                  >
                    {category.icon}
                  </button>
                ))}
              </div>
              
              {/* Search bar */}
              <div className="p-2 border-b border-[#222e35] shrink-0">
                <input
                  type="text"
                  placeholder="Cari emoji..."
                  value={emojiSearchQuery}
                  onChange={(e) => setEmojiSearchQuery(e.target.value)}
                  className="w-full bg-[#202c33] border-none outline-none text-gray-200 text-xs py-1.5 px-3 rounded-lg focus:ring-1 focus:ring-[#00a884] placeholder-gray-500"
                />
              </div>

              {/* Emoji Grid */}
              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                {emojiSearchQuery ? (
                  // Search Results
                  <div className="flex flex-col space-y-2">
                    <h4 className="text-xs font-semibold text-gray-400 select-none px-1">
                      Hasil Pencarian
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {EMOJI_CATEGORIES.flatMap(cat => cat.emojis)
                        .filter(item => item.tags.toLowerCase().includes(emojiSearchQuery.toLowerCase()))
                        .slice(0, 100)
                        .map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleEmojiClick(item.char)}
                            className="text-2xl p-1.5 hover:bg-[#2a3942] rounded transition transform hover:scale-110 active:scale-95 duration-100"
                          >
                            {item.char}
                          </button>
                        ))
                      }
                      {EMOJI_CATEGORIES.flatMap(cat => cat.emojis)
                        .filter(item => item.tags.toLowerCase().includes(emojiSearchQuery.toLowerCase()))
                        .length === 0 && (
                          <p className="text-xs text-gray-500 italic p-1">Tidak ada emoji yang cocok.</p>
                        )
                      }
                    </div>
                  </div>
                ) : (
                  // Selected Category
                  <div className="flex flex-col space-y-2">
                    <h4 className="text-xs font-semibold text-gray-400 select-none px-1">
                      {EMOJI_CATEGORIES.find(c => c.id === activeEmojiCategory)?.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {EMOJI_CATEGORIES.find(c => c.id === activeEmojiCategory)?.emojis.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleEmojiClick(item.char)}
                          className="text-2xl p-1.5 hover:bg-[#2a3942] rounded transition transform hover:scale-110 active:scale-95 duration-100"
                        >
                          {item.char}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location Picker Drawer */}
          {showLocationMenu && (
            <div className="p-3 bg-chat-sidebar rounded-lg border border-gray-800 mb-3 flex flex-col gap-2 animate-slideup shadow-sm max-w-xs text-sm">
              <button
                type="button"
                onClick={handleSendStaticLocation}
                className="w-full flex items-center space-x-3 p-2 hover:bg-chat-active rounded-lg text-left transition text-white"
              >
                <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-chat-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs">Kirim Lokasi Saat Ini</div>
                  <div className="text-[10px] text-gray-400">Bagikan koordinat GPS instan Anda</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={handleStartLiveLocation}
                className="w-full flex items-center space-x-3 p-2 hover:bg-chat-active rounded-lg text-left transition text-white"
              >
                <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={18} className={`text-chat-accent ${isSharingLive ? 'animate-pulse' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs">{isSharingLive ? 'Hentikan Berbagi Lokasi' : 'Bagikan Lokasi Terkini (Live)'}</div>
                  <div className="text-[10px] text-gray-400">
                    {isSharingLive ? 'Sedang aktif berbagi...' : 'Pelacakan real-time di peta'}
                  </div>
                </div>
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-gray-400">
              <button 
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowLocationMenu(false);
                }}
                className={`p-2 hover:bg-chat-active rounded-full transition ${showEmojiPicker ? 'text-chat-accent' : 'hover:text-white'}`}
                title="Tambahkan Emoji"
              >
                <Smile size={22} />
              </button>

              <button 
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowLocationMenu(false);
                  setShowEmojiPicker(false);
                }}
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
                onClick={() => {
                  if (isRecording) {
                    stopRecording();
                  } else {
                    startRecording();
                  }
                  setShowLocationMenu(false);
                  setShowEmojiPicker(false);
                }}
                className={`p-2 hover:bg-chat-active rounded-full transition ${isRecording ? 'text-red-500 animate-pulse' : 'hover:text-white'}`}
                title={isRecording ? "Kirim Rekaman" : "Mulai Rekam Suara"}
              >
                <Mic size={22} />
              </button>

              <button 
                type="button"
                onClick={() => {
                  setShowLocationMenu(!showLocationMenu);
                  setShowEmojiPicker(false);
                }}
                className={`p-2 hover:bg-chat-active rounded-full transition ${showLocationMenu ? 'text-chat-accent' : 'hover:text-white'}`}
                title="Bagikan Lokasi"
              >
                <MapPin size={22} />
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
                ref={messageInputRef}
                type="text" 
                placeholder={connectionStatus === 'connected' ? "Ketik pesan..." : "Sedang menghubungkan ke Broker..."}
                className="flex-1 bg-chat-active border-none outline-none text-gray-200 text-sm py-2.5 px-4 rounded-lg focus:ring-1 focus:ring-chat-accent transition placeholder-gray-500"
                value={messageText}
                onChange={onInputChange}
                disabled={connectionStatus !== 'connected'}
                onSelect={(e) => {
                  selectionStartRef.current = e.target.selectionStart;
                }}
                onClick={(e) => {
                  selectionStartRef.current = e.target.selectionStart;
                }}
                onKeyUp={(e) => {
                  selectionStartRef.current = e.target.selectionStart;
                }}
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
          {callState === 'ringing' ? (
            <div className="w-full max-w-sm bg-[#1e272d]/95 backdrop-blur-md rounded-full px-8 py-4 flex items-center justify-center space-x-12 shadow-2xl border border-white/5 z-10 mb-4">
              {/* Decline (Red) */}
              <button 
                onClick={() => endCall(true)}
                className="w-14 h-14 rounded-full bg-[#ea0038] hover:bg-[#d00030] text-white flex items-center justify-center shadow-lg transition transform active:scale-90 hover:scale-105"
                title="Tolak Panggilan"
              >
                <PhoneOff size={24} />
              </button>
              {/* Accept (Green) */}
              <button 
                onClick={acceptCall}
                className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg transition transform active:scale-90 hover:scale-105 animate-bounce"
                title="Terima Panggilan"
              >
                <Phone size={24} />
              </button>
            </div>
          ) : (
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
          )}
        </div>
      )}

      {/* 6. LEAFLET MAP MODAL */}
      {mapModal.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
          <div className="w-full max-w-4xl h-[85vh] bg-chat-sidebar rounded-xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col animate-slideup">
            <div className="px-4 md:px-6 py-4 bg-chat-header border-b border-gray-800 flex items-center justify-between text-white shrink-0">
              <span className="font-semibold text-sm md:text-base flex items-center">
                <Map className="mr-2 text-chat-accent" size={18} /> 
                {mapModal.type === 'live' ? 'Pelacakan Lokasi Terkini (Live Location)' : 'Peta Lokasi'}
              </span>
              <button 
                onClick={() => {
                  setMapModal(prev => ({ ...prev, isOpen: false }));
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.remove();
                    mapInstanceRef.current = null;
                  }
                  mapMarkersRef.current = {};
                }}
                className="p-1.5 hover:bg-chat-active rounded-full text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div id="leaflet-map-container" className="flex-1 bg-[#0b141a] relative" style={{ minHeight: '300px' }}></div>

            <div className="px-4 md:px-6 py-3 bg-chat-header border-t border-gray-800 flex flex-col md:flex-row md:justify-between md:items-center gap-2 text-xs text-gray-400 shrink-0">
              <span className="truncate">{mapModal.type === 'live' ? 'Peta melacak lokasi bergerak secara real-time.' : `Koordinat: ${mapModal.lat.toFixed(6)}, ${mapModal.lng.toFixed(6)}`}</span>
              <button
                onClick={() => {
                  setMapModal(prev => ({ ...prev, isOpen: false }));
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.remove();
                    mapInstanceRef.current = null;
                  }
                  mapMarkersRef.current = {};
                }}
                className="bg-chat-accent text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:scale-105 active:scale-95 transition self-end md:self-auto"
              >
                Tutup Peta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
