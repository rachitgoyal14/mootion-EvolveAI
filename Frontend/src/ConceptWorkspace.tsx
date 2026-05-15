import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Settings2, Globe, FileBadge, Zap, Headphones, ArrowUp, ArrowLeft, Mic, Layers, FileX } from 'lucide-react';

type ExpandedPanel = 'none' | 'storyboard' | 'playground' | 'universe' | 'prove-it' | 'challenge' | 'listen' | 'flashcards' | 'wrong-one';

export default function ConceptWorkspace() {
  const { nodeId } = useParams();
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic') || 'Topic Name';
  const navigate = useNavigate();

  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>('none');
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      text: `Hey! Let's explore ${topic}. What would you like to start with — a quick video, or jump straight into the orbit simulator?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isLeftExpanded = expandedPanel === 'storyboard' || expandedPanel === 'playground' || expandedPanel === 'universe';
  const isRightExpanded = expandedPanel === 'prove-it' || expandedPanel === 'challenge' || expandedPanel === 'listen' || expandedPanel === 'flashcards' || expandedPanel === 'wrong-one';

  const [challengeData, setChallengeData] = useState<any[]>([]);
  const [currentChallengeQ, setCurrentChallengeQ] = useState(0);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState<'playing' | 'completed'>('playing');
  const [challengeSelected, setChallengeSelected] = useState<number | null>(null);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(30);

  const [flashcardData, setFlashcardData] = useState<any[]>([]);
  const [wrongOneData, setWrongOneData] = useState<any[]>([]);
  const [currentWrongOneQ, setCurrentWrongOneQ] = useState(0);
  const [wrongOneScore, setWrongOneScore] = useState(0);
  const [wrongOneStatus, setWrongOneStatus] = useState<'playing' | 'completed'>('playing');
  const [wrongOneSelected, setWrongOneSelected] = useState<number | null>(null);
  const [wrongOneTimeLeft, setWrongOneTimeLeft] = useState(30);

  const [listenSentences, setListenSentences] = useState<string[]>([]);
  const [listenIndex, setListenIndex] = useState(0);
  const [displayedListenIndex, setDisplayedListenIndex] = useState(-1);
  const [isPlayingListen, setIsPlayingListen] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoadingPractice, setIsLoadingPractice] = useState(false);

  // Prove It Chat State
  const [isRecording, setIsRecording] = useState(false);
  const proveItListRef = useRef<HTMLDivElement>(null);
  const [proveItMessages, setProveItMessages] = useState<{role:string, text:string}[]>([
    { role: 'model', text: `Hi! I'm ready to learn about ${topic}. Can you explain it to me?` }
  ]);
  const [proveItInput, setProveItInput] = useState('');
  const [isProveItLoading, setIsProveItLoading] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);

  useEffect(() => {
    if (expandedPanel === 'challenge' && challengeData.length === 0) {
      setIsLoadingPractice(true);
      fetch('/api/practice/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      }).then(r => r.json()).then(data => {
        setChallengeData(Array.isArray(data) ? data : []);
        setIsLoadingPractice(false);
      }).catch(e => {
        console.error(e);
        setIsLoadingPractice(false);
      });
    } else if (expandedPanel === 'flashcards' && flashcardData.length === 0) {
      setIsLoadingPractice(true);
      fetch('/api/practice/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      }).then(r => r.json()).then(data => {
        setFlashcardData(Array.isArray(data) ? data : []);
        setIsLoadingPractice(false);
      }).catch(e => {
        console.error(e);
        setIsLoadingPractice(false);
      });
    } else if (expandedPanel === 'listen' && listenSentences.length === 0) {
      setIsLoadingPractice(true);
      fetch('/api/practice/listen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      }).then(r => r.json()).then(data => {
        setListenSentences(data.sentences || []);
        setIsLoadingPractice(false);
        setIsPlayingListen(true);
      }).catch(e => {
        console.error(e);
        setIsLoadingPractice(false);
      });
    } else if (expandedPanel === 'wrong-one' && wrongOneData.length === 0) {
      setIsLoadingPractice(true);
      fetch('/api/practice/wrong-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      }).then(r => r.json()).then(data => {
        setWrongOneData(Array.isArray(data) ? data : []);
        setIsLoadingPractice(false);
      }).catch(e => {
        console.error(e);
        setIsLoadingPractice(false);
      });
    }
  }, [expandedPanel]);

  const listenAudioCtxRef = useRef<AudioContext | null>(null);
  const listenSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    let cancel = false;
    
    const playCurrentSentence = async () => {
       if (expandedPanel === 'listen' && isPlayingListen && listenSentences.length > 0) {
          if (listenIndex < listenSentences.length) {
             try {
                 if (!listenAudioCtxRef.current) {
                     const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                     listenAudioCtxRef.current = new AudioContextClass({ sampleRate: 24000 });
                 }
                 const audioCtx = listenAudioCtxRef.current;
                 if (audioCtx.state === 'suspended') {
                    await audioCtx.resume();
                 }

                 const res = await fetch("/api/practice/tts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: listenSentences[listenIndex] }),
                 });
                 if (cancel) return;
                 const data = await res.json();
                 
                 if (data.audioBase64 && !cancel) {
                     const binary = atob(data.audioBase64);
                     const bytes = new Uint8Array(binary.length);
                     for (let i = 0; i < binary.length; i++) {
                       bytes[i] = binary.charCodeAt(i);
                     }
                     const int16Array = new Int16Array(bytes.buffer);
                     const float32Array = new Float32Array(int16Array.length);
                     for (let i = 0; i < int16Array.length; i++) {
                       float32Array[i] = int16Array[i] / 0x8000;
                     }
                     const buffer = audioCtx.createBuffer(1, float32Array.length, 24000);
                     buffer.getChannelData(0).set(float32Array);
                     
                     if (cancel) return;

                     const source = audioCtx.createBufferSource();
                     source.buffer = buffer;
                     source.connect(audioCtx.destination);
                     listenSourceRef.current = source;
                     
                     source.onended = () => {
                        if (!cancel) {
                           setListenIndex(prev => prev + 1);
                        }
                     };
                     source.start(0);
                 } else {
                     if (!cancel) setListenIndex(prev => prev + 1);
                 }
             } catch (err) {
                 console.error("TTS fetch failed:", err);
                 if (!cancel) setListenIndex(prev => prev + 1);
             }
          } else {
             setIsPlayingListen(false);
          }
       }
    };
    
    playCurrentSentence();

    return () => {
       cancel = true;
       if (listenSourceRef.current) {
           listenSourceRef.current.stop();
           listenSourceRef.current.disconnect();
           listenSourceRef.current = null;
       }
    };
  }, [listenSentences, listenIndex, isPlayingListen, expandedPanel]);

  useEffect(() => {
    if (expandedPanel === 'challenge' && challengeStatus === 'playing' && challengeData.length > 0) {
      if (challengeSelected !== null) {
         const timer = setTimeout(() => {
            if (currentChallengeQ < challengeData.length - 1) {
               setCurrentChallengeQ(q => q + 1);
               setChallengeSelected(null);
               setChallengeTimeLeft(30);
            } else {
               setChallengeStatus('completed');
            }
         }, 5000);
         return () => clearTimeout(timer);
      } else {
         if (challengeTimeLeft > 0) {
            const timer = setTimeout(() => setChallengeTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
         } else {
            setChallengeSelected(-1);
         }
      }
    }
  }, [expandedPanel, challengeStatus, challengeData.length, challengeTimeLeft, challengeSelected, currentChallengeQ, challengeData]);

  useEffect(() => {
    if (expandedPanel === 'wrong-one' && wrongOneStatus === 'playing' && wrongOneData.length > 0) {
      if (wrongOneSelected !== null) {
         const timer = setTimeout(() => {
            if (currentWrongOneQ < wrongOneData.length - 1) {
               setCurrentWrongOneQ(q => q + 1);
               setWrongOneSelected(null);
               setWrongOneTimeLeft(30);
            } else {
               setWrongOneStatus('completed');
            }
         }, 5000);
         return () => clearTimeout(timer);
      } else {
         if (wrongOneTimeLeft > 0) {
            const timer = setTimeout(() => setWrongOneTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
         } else {
            setWrongOneSelected(-1);
         }
      }
    }
  }, [expandedPanel, wrongOneStatus, wrongOneData.length, wrongOneTimeLeft, wrongOneSelected, currentWrongOneQ, wrongOneData]);

  useEffect(() => {
    if (proveItListRef.current) {
       proveItListRef.current.scrollTop = proveItListRef.current.scrollHeight;
    }
  }, [proveItMessages, isProveItLoading]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  const resetChallenge = () => {
    setCurrentChallengeQ(0);
    setChallengeScore(0);
    setChallengeStatus('playing');
    setChallengeSelected(null);
    setChallengeTimeLeft(30);
  };

  const resetWrongOne = () => {
    setCurrentWrongOneQ(0);
    setWrongOneScore(0);
    setWrongOneStatus('playing');
    setWrongOneSelected(null);
    setWrongOneTimeLeft(30);
  };

  const recognitionRef = useRef<any>(null);

  const stopLiveConversation = () => {
     if (recognitionRef.current) {
        recognitionRef.current.stop();
     }
     setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isSessionEnded) return;
    if (isRecording) {
      stopLiveConversation();
      return;
    }
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
       alert("Speech recognition not supported in this browser.");
       return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
       const text = event.results[event.results.length - 1][0].transcript;
       if (text.trim()) {
          setProveItInput(text);
          handleProveItSubmit(text);
          recognition.stop();
       }
    };
    recognition.onerror = (e: any) => {
       console.error("Speech recognition error", e);
       setIsRecording(false);
    };
    recognition.onend = () => {
       setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    return () => {
       stopLiveConversation();
       if ('speechSynthesis' in window) {
           window.speechSynthesis.cancel();
       }
    };
  }, []);

  const handleEndSession = async () => {
    if (isSessionEnded || isProveItLoading) return;
    setIsSessionEnded(true);
    setIsProveItLoading(true);
    
    stopLiveConversation();
    
    setProveItMessages(prev => [...prev, { role: 'user', text: "[Ended Session.]" }]);
    
    try {
      const res = await fetch('/api/practice/prove-it', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, history: [], message: "The user has ended the voice learning session. Please provide a brief generic wrap-up message and a grade estimate based on standard expectations.", isEndSession: true })
      });
      const data = await res.json();
      setProveItMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch(e) {
      console.error(e);
    } finally {
      setIsProveItLoading(false);
    }
  };

  const handleProveItSubmit = async (textOverride?: string) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : proveItInput;
    if (!textToSend.trim() || isProveItLoading) return;
    
    const newHistory = [...proveItMessages, { role: 'user', text: textToSend }];
    setProveItMessages(newHistory);
    setProveItInput('');
    setIsProveItLoading(true);

    try {
      const res = await fetch('/api/practice/prove-it', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, history: proveItMessages, message: textToSend })
      });
      const data = await res.json();
      setProveItMessages(prev => [...prev, { role: 'model', text: data.text }]);
      
      try {
        const ttsRes = await fetch('/api/practice/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.text })
        });
        const ttsData = await ttsRes.json();
        if (ttsData.audioBase64) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContextClass({ sampleRate: 24000 });
          const binary = atob(ttsData.audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const int16 = new Int16Array(bytes.buffer);
          const float32 = new Float32Array(int16.length);
          for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 0x8000;
          const buffer = audioCtx.createBuffer(1, float32.length, 24000);
          buffer.getChannelData(0).set(float32);
          const source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.destination);
          source.start(0);
        }
      } catch (ttsErr) {
        console.error('Prove It TTS failed:', ttsErr);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setIsProveItLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, preset?: string) => {
    if (e) e.preventDefault();
    const textToSend = preset || inputValue;
    if (!textToSend.trim() || isChatLoading) return;

    const newMsgs = [...messages, { id: Date.now().toString(), role: 'user', text: textToSend }];
    setMessages(newMsgs);
    setInputValue('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          history: newMsgs.slice(0, -1).map(m => ({ role: m.role, text: m.text })),
          message: textToSend
        })
      });
      const data = await res.json();
      const reply = data.text || "Sorry, I couldn't get a response. Try again.";
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: reply }]);
    } catch (err) {
      console.error('Chat API error:', err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row p-2 md:p-4 lg:p-6 gap-2 md:gap-4 lg:gap-6 overflow-hidden relative"
         style={{ background: '#f0f0ed', backgroundImage: 'linear-gradient(to right, #d1d5db 1px, transparent 1px), linear-gradient(to bottom, #d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* LEFT SIDEBAR - VISUAL SPACE */}
      <motion.div 
        layout
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        animate={{
          flex: expandedPanel === 'none' ? 1 : isLeftExpanded ? 3 : 0.001,
          opacity: isRightExpanded ? 0 : 1,
          pointerEvents: isRightExpanded ? 'none' : 'auto',
          borderWidth: isRightExpanded ? '0px' : '1px',
          padding: isRightExpanded ? '0px' : ''
        }}
        style={{ minWidth: 0, minHeight: 0, background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)' }}
        className={`rounded-3xl border border-gray-200/80 flex flex-col h-full flex-shrink-0 relative ${isLeftExpanded ? 'overflow-hidden' : 'overflow-hidden'} ${isRightExpanded ? 'invisible lg:flex' : 'flex'}`}
      >
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
           <h2 className="font-bold text-gray-900 uppercase tracking-widest text-sm">
             {isLeftExpanded
               ? (expandedPanel === 'storyboard' ? 'Storyboard' : expandedPanel === 'playground' ? 'Playground' : 'Universe')
               : 'Visual space'}
           </h2>
           {isLeftExpanded && (
             <button
               onClick={() => setExpandedPanel('none')}
               className="p-2 rounded-full hover:bg-gray-100 border border-gray-200 bg-white transition-colors cursor-pointer"
             >
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
           )}
        </div>
        
        {isLeftExpanded ? (
          <div className="flex-1 relative">
            {expandedPanel === 'storyboard' && (
              <video
                src="/assests/kepler_final.mp4"
                controls
                autoPlay
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#000' }}
              />
            )}
            {expandedPanel === 'playground' && (
              <iframe
                src="/playground/kepler.html"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                title="Kepler Laws Simulation"
                allow="autoplay"
              />
            )}
            {expandedPanel === 'universe' && (
              <iframe
                src="/universe/index.html"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                title="3D Solar System"
                allow="autoplay"
              />
            )}
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 gap-3 flex-1 content-start overflow-y-auto">
             <button onClick={() => setExpandedPanel('storyboard')} className="rounded-2xl p-4 flex flex-col justify-center items-center gap-3 transition-all text-center aspect-square border border-gray-200 hover:border-gray-400 hover:shadow-md" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
                <div className="text-gray-800 rounded-full p-3 border border-gray-200 bg-white/80">
                   <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 text-sm">Storyboard</h3>
                </div>
             </button>
             
             <button onClick={() => setExpandedPanel('playground')} className="rounded-2xl p-4 flex flex-col justify-center items-center gap-3 transition-all text-center aspect-square border border-gray-200 hover:border-gray-400 hover:shadow-md" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}>
                <div className="text-gray-800 rounded-full p-3 border border-gray-200 bg-white/80">
                   <Settings2 className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 text-sm">Playground</h3>
                </div>
             </button>

             <button onClick={() => setExpandedPanel('universe')} className="rounded-2xl p-4 flex flex-col justify-center items-center gap-3 transition-all text-center aspect-square border border-gray-200 hover:border-gray-400 hover:shadow-md" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}>
                <div className="text-gray-800 rounded-full p-3 border border-gray-200 bg-white/80">
                   <Globe className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 text-sm">Universe</h3>
                </div>
             </button>
          </div>
        )}
      </motion.div>

      {/* CENTER CHAT */}
      <motion.div 
        layout
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        animate={{
            flex: expandedPanel === 'none' ? 1.5 : 1,
            opacity: 1
        }}
        style={{ minWidth: 0, minHeight: 0, background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)' }}
        className="rounded-3xl border border-gray-200/80 flex flex-col h-full flex-shrink-0 relative overflow-hidden"
      >
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
           <div className="flex items-center gap-3">
              <button onClick={() => navigate('/roadmap')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-black" />
              </button>
              <h2 className="font-bold text-gray-900 uppercase tracking-widest text-sm line-clamp-1">{topic}</h2>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
           {messages.map(msg => (
             <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[85%] rounded-2xl p-4 leading-relaxed break-words whitespace-pre-wrap ${
                 msg.role === 'user' 
                  ? 'bg-indigo-50 text-indigo-950 rounded-br-sm' 
                  : 'bg-white/80 text-gray-800 rounded-bl-sm border border-gray-100'
               }`}>
                  {msg.text}
               </div>
             </div>
           ))}
           
           {isChatLoading && (
             <div className="flex justify-start">
               <div className="bg-white/80 text-gray-500 rounded-2xl rounded-bl-sm border border-gray-100 px-5 py-3 flex gap-1 items-center">
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
               </div>
             </div>
           )}
           <div ref={chatEndRef} />
           {showOptions && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 mt-2"
              >
                  <p className="text-sm text-gray-500 ml-2">Choose an interactive tool:</p>
                  <div className="flex flex-wrap gap-2">
                     <button onClick={() => setExpandedPanel('storyboard')} className="border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 text-sm font-medium transition-colors">Storyboard</button>
                     <button onClick={() => setExpandedPanel('playground')} className="border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 text-sm font-medium transition-colors">Playground</button>
                     <button onClick={() => setExpandedPanel('universe')} className="border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 text-sm font-medium transition-colors">Universe</button>
                     <button onClick={() => setExpandedPanel('listen')} className="border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 text-sm font-medium transition-colors">Listen</button>
                  </div>
              </motion.div>
           )}
        </div>

        <div className="p-4 pt-2">
            <form onSubmit={handleSendMessage} className="relative">
              <input 
                 type="text" 
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 placeholder="Ask anything about this topic..."
                 className="w-full bg-white/70 border border-gray-200 rounded-2xl py-3.5 pl-4 pr-12 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
              <button 
                 type="submit" 
                 disabled={!inputValue.trim() || isChatLoading}
                 className="absolute right-2 top-2 bottom-2 bg-black text-white rounded-xl w-10 flex items-center justify-center disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
              >
                 <ArrowUp className="w-5 h-5" />
              </button>
            </form>
        </div>
      </motion.div>

      {/* RIGHT SIDEBAR - PRACTICE SPACE */}
      <motion.div 
        layout
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        animate={{
          flex: expandedPanel === 'none' ? 1 : isRightExpanded ? 3 : 0.001,
          opacity: isLeftExpanded ? 0 : 1,
          pointerEvents: isLeftExpanded ? 'none' : 'auto',
          borderWidth: isLeftExpanded ? '0px' : '1px',
          padding: isLeftExpanded ? '0px' : ''
        }}
        style={{ minWidth: 0, minHeight: 0, background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)' }}
        className={`rounded-3xl border border-gray-200/80 flex flex-col h-full flex-shrink-0 relative overflow-hidden ${isLeftExpanded ? 'invisible lg:flex' : 'flex'}`}
      >
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
           <h2 className="font-bold text-gray-900 uppercase tracking-widest text-sm">
             {isRightExpanded
               ? (expandedPanel === 'prove-it' ? 'Prove It' : expandedPanel === 'challenge' ? 'Challenge' : expandedPanel === 'listen' ? 'Listen' : expandedPanel === 'flashcards' ? 'Flashcards' : 'Wrong One')
               : 'Practice space'}
           </h2>
           {isRightExpanded && (
             <button
               onClick={() => setExpandedPanel('none')}
               className="p-2 rounded-full hover:bg-gray-100 border border-gray-200 bg-white transition-colors cursor-pointer"
             >
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
           )}
           {!isRightExpanded && <div />}
        </div>
        
        {isRightExpanded ? (
          <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
         {expandedPanel === 'prove-it' && (
              <div className="w-full h-full flex flex-col p-8 relative z-10 overflow-hidden">
                 <div className="flex-1 w-full max-w-4xl mx-auto bg-white border border-gray-100 shadow-xl rounded-3xl p-6 flex flex-col mt-auto mb-auto relative">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><FileBadge className="w-6 h-6 text-black"/> Teach the AI: {topic}</h3>
                     </div>
                     {isSessionEnded ? (
                        <div className="flex-1 w-full flex flex-col items-center justify-center pt-8">
                           <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 max-w-2xl mx-auto shadow-sm w-full">
                              <h4 className="text-xl font-bold text-gray-900 mb-4">Session Wrap-up</h4>
                              {isProveItLoading ? (
                                 <div className="animate-pulse text-gray-500">Generating your feedback...</div>
                              ) : (
                                 <div className="text-left leading-relaxed text-gray-800 whitespace-pre-wrap">
                                    {proveItMessages[proveItMessages.length - 1]?.text}
                                 </div>
                              )}
                           </div>
                           <button onClick={() => {
                              setIsSessionEnded(false);
                              setProveItMessages([{ role: 'model', text: '' }]);
                           }} className="mt-8 px-8 py-4 bg-black text-white rounded-full font-bold uppercase tracking-wider text-sm hover:bg-gray-800 transition-colors">
                              Try Again
                           </button>
                        </div>
                     ) : (
                        <div className="flex-1 w-full flex flex-col items-center relative min-h-[400px]">
                           <div className="flex-1 w-full flex flex-col items-center justify-center gap-8 mt-12 mb-20">
                               <button 
                                  onClick={toggleRecording} 
                                  className={`w-40 h-40 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${isRecording ? 'bg-gray-800 text-white animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_40px_rgba(0,0,0,0.15)] border-8 border-white' : 'bg-[#f4f4f5] text-gray-500 hover:bg-[#e4e4e7] shadow-sm border-8 border-white'}`}
                               >
                                  <Mic className={`w-16 h-16 ${isRecording ? 'text-white' : 'text-gray-400'}`}/>
                               </button>
                               <div className="text-center">
                                  <p className="text-[22px] font-bold text-gray-900 mb-2 tracking-tight">
                                     {isRecording ? "Listening..." : "Tap to Start Teaching"}
                                  </p>
                                  <p className="text-gray-500 text-[15px]">
                                     {isRecording ? "Speak clearly into your microphone..." : "The AI student is waiting to learn."}
                                  </p>
                               </div>
                               <div className="text-center animate-pulse text-indigo-500 min-h-[30px] font-medium w-full px-8 text-lg">
                                   {isRecording && proveItInput.trim() ? proveItInput : ''}
                               </div>
                           </div>
                           <div className="absolute bottom-4 w-full flex justify-center">
                              {!isSessionEnded && (
                                 <button onClick={handleEndSession} className="px-10 py-3.5 bg-black text-white rounded-full font-semibold tracking-wide hover:bg-gray-800 transition-colors shadow-md">
                                    End Session
                                 </button>
                              )}
                           </div>
                        </div>
                     )}
                     <div className="hidden" ref={proveItListRef}></div>
                  </div>
               </div>
            )}
            {expandedPanel === 'challenge' && (
              <div className="w-full h-full flex flex-col p-6 md:p-8 relative z-10 overflow-hidden">
                <div className="w-full max-w-3xl mx-auto my-auto bg-white border border-gray-100 shadow-xl rounded-3xl flex flex-col max-h-full overflow-hidden">

                  {/* Header */}
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-black" /> Challenge
                    </h3>
                    {challengeData.length > 0 && challengeStatus === 'playing' && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 font-medium">{currentChallengeQ + 1} / {challengeData.length}</span>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold font-mono ${
                          challengeTimeLeft <= 10 ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-700'
                        }`}>
                          0:{challengeTimeLeft.toString().padStart(2, '0')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  {isLoadingPractice ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Generating challenge...</p>
                      </div>
                    </div>
                  ) : challengeData.length > 0 ? (
                    challengeStatus === 'playing' ? (
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Progress bar */}
                        <div className="h-1 bg-gray-100 flex-shrink-0">
                          <div className="h-full bg-black transition-all duration-300" style={{ width: `${((currentChallengeQ) / challengeData.length) * 100}%` }} />
                        </div>
                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'none' }}>
                          <p className="text-base md:text-lg font-semibold text-gray-900 mb-5 leading-relaxed">
                            {challengeData[currentChallengeQ].question}
                          </p>
                          <div className="flex flex-col gap-2.5">
                            {challengeData[currentChallengeQ].options.map((opt: string, optIdx: number) => (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  setChallengeSelected(optIdx);
                                  if (optIdx === challengeData[currentChallengeQ].correctAnswerIndex) setChallengeScore(s => s + 1);
                                }}
                                disabled={challengeSelected !== null}
                                className={`w-full text-left rounded-2xl px-4 py-3.5 border font-medium text-sm transition-all flex items-center gap-3 ${
                                  challengeSelected === null
                                    ? 'bg-gray-50 border-gray-200 hover:border-gray-900 hover:bg-white text-gray-800'
                                    : optIdx === challengeData[currentChallengeQ].correctAnswerIndex
                                      ? 'bg-green-50 border-green-400 text-green-900'
                                      : challengeSelected === optIdx
                                        ? 'bg-red-50 border-red-400 text-red-900'
                                        : 'bg-gray-50 border-gray-100 text-gray-300'
                                }`}
                              >
                                <span className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border ${
                                  challengeSelected !== null && optIdx === challengeData[currentChallengeQ].correctAnswerIndex
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : challengeSelected === optIdx && optIdx !== challengeData[currentChallengeQ].correctAnswerIndex
                                      ? 'bg-red-500 border-red-500 text-white'
                                      : 'border-gray-300 text-gray-500 bg-white'
                                }`}>{String.fromCharCode(65 + optIdx)}</span>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Footer */}
                        {challengeSelected !== null && (
                          <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0">
                            <button
                              onClick={() => {
                                if (currentChallengeQ < challengeData.length - 1) {
                                  setCurrentChallengeQ(q => q + 1);
                                  setChallengeSelected(null);
                                  setChallengeTimeLeft(30);
                                } else {
                                  setChallengeStatus('completed');
                                }
                              }}
                              className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
                            >
                              {currentChallengeQ < challengeData.length - 1 ? 'Next →' : 'See Results'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-28 h-28 rounded-full bg-gray-50 border-4 border-gray-100 flex items-center justify-center mb-5">
                          <span className="text-3xl font-bold text-gray-900">{Math.round((challengeScore / challengeData.length) * 100)}%</span>
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-1">Quiz Complete!</h4>
                        <p className="text-gray-400 mb-1">{challengeScore} correct out of {challengeData.length}</p>
                        <p className="text-gray-400 text-sm mb-8">
                          {challengeScore === challengeData.length ? '🎉 Perfect score!' : challengeScore >= challengeData.length * 0.7 ? '👏 Great job!' : '📚 Keep studying!'}
                        </p>
                        <button onClick={resetChallenge} className="px-8 py-3 bg-black text-white rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors">
                          Try Again
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No questions available.</div>
                  )}
                </div>
              </div>
            )}
            {expandedPanel === 'listen' && (
              <div className="w-full h-full flex flex-col p-8 relative z-10 overflow-hidden">
                 <div className="flex-1 w-full max-w-4xl mx-auto bg-white border border-gray-100 shadow-xl rounded-3xl p-6 flex flex-col mt-auto mb-auto relative">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><Headphones className="w-6 h-6 text-black"/> Listen: {topic}</h3>
                     </div>
                     <div className="flex-1 w-full flex flex-col items-center relative min-h-[400px]">
                        <div className="flex-1 w-full flex flex-col items-center justify-center gap-8 mt-12 mb-20">
                            <div className={`w-40 h-40 rounded-full flex-shrink-0 flex items-center justify-center relative transition-all duration-700 ${isPlayingListen ? 'bg-[#f4f4f5] shadow-[0_0_40px_rgba(0,0,0,0.08)] border-8 border-white animate-[pulse_2s_ease-in-out_infinite]' : 'bg-[#f4f4f5] shadow-sm border-8 border-white'}`}>
                               <Headphones className={`w-16 h-16 transition-all duration-700 ${isPlayingListen ? 'text-gray-700' : 'text-gray-400'}`} />
                            </div>
                            <div className="text-center">
                               <p className="text-[22px] font-bold text-gray-900 mb-2 tracking-tight">
                                  {isLoadingPractice ? 'Preparing audio...' : isPlayingListen ? 'Playing...' : 'Paused'}
                               </p>
                               <p className="text-gray-500 text-[15px]">
                                  {isLoadingPractice ? 'Generating your lecture...' : 'AI audio lecture on this topic'}
                               </p>
                            </div>
                            <div className="min-h-[40px] px-4 w-full flex flex-col items-center justify-center">
                               {isLoadingPractice ? (
                                 <p className="text-sm text-gray-400 animate-pulse tracking-wide font-medium">Synthesizing audio...</p>
                               ) : displayedListenIndex < 0 ? (
                                 <p className="text-[15px] text-gray-400 animate-pulse tracking-wide text-center">Loading audio...</p>
                               ) : (
                                 <p className="text-base leading-relaxed text-gray-600 font-medium tracking-wide text-center line-clamp-2" key={displayedListenIndex}>
                                    {listenSentences[displayedListenIndex] || 'Finished.'}
                                 </p>
                               )}
                            </div>
                        </div>
                        <div className="absolute bottom-4 w-full flex justify-center gap-3">
                           <button
                              onClick={() => { if (isPlayingListen) setIsPlayingListen(false); else setIsPlayingListen(true); }}
                              className="px-8 py-3.5 bg-black text-white rounded-full font-semibold tracking-wide hover:bg-gray-800 transition-colors shadow-md"
                              title={isPlayingListen ? 'Pause' : 'Play'}
                           >
                              {isPlayingListen ? 'Pause' : 'Play'}
                           </button>
                           <button
                              onClick={() => { setListenIndex(0); setDisplayedListenIndex(-1); setIsPlayingListen(true); }}
                              className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-full font-semibold tracking-wide hover:bg-gray-50 transition-colors shadow-sm"
                              title="Restart"
                           >
                              Restart
                           </button>
                        </div>
                     </div>
                 </div>
              </div>
            )}
            {expandedPanel === 'flashcards' && (
               <div className="w-full h-full flex flex-col items-center justify-center p-8 relative z-10">
                 <div className="w-full max-w-2xl text-center flex flex-col items-center mt-auto mb-auto perspective-1000">
                    <div className="flex justify-between items-center w-full mb-8">
                       <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><Layers className="w-6 h-6 text-black"/> Flashcards: {topic}</h3>
                       {flashcardData.length > 0 && !isLoadingPractice && (
                          <button
                             onClick={() => {
                                setIsFlipped(false);
                                setTimeout(() => {
                                   const shuffled = [...flashcardData].sort(() => Math.random() - 0.5);
                                   setFlashcardData(shuffled);
                                   setCurrentFlashcard(0);
                                }, 300);
                             }}
                             className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                          >
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
                             Shuffle
                          </button>
                       )}
                    </div>
                    {isLoadingPractice ? (
                       <div className="text-center py-10 animate-pulse text-gray-500">Generating flashcards...</div>
                    ) : flashcardData.length > 0 ? (
                       <>
                          <div 
                             onClick={() => setIsFlipped(!isFlipped)} 
                             className="w-full h-64 md:h-80 cursor-pointer relative preserve-3d transition-transform duration-500"
                             style={{ transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)', transformStyle: 'preserve-3d' }}
                          >
                             <div className="absolute inset-0 backface-hidden bg-white border border-gray-100 shadow-xl rounded-3xl p-10 flex items-center justify-center text-center">
                                <span className="absolute top-6 left-6 text-2xl font-bold text-gray-200 pointer-events-none">Q</span>
                                <h4 className="text-3xl font-bold text-gray-800 leading-tight">{flashcardData[currentFlashcard].front}</h4>
                                <div className="absolute bottom-6 text-gray-400 text-sm font-medium">Click to flip</div>
                             </div>
                             <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-xl rounded-3xl p-10 flex items-center justify-center text-center" style={{ transform: 'rotateX(180deg)' }}>
                                <span className="absolute top-6 left-6 text-2xl font-bold text-indigo-200 pointer-events-none">A</span>
                                <p className="text-2xl text-indigo-950 font-medium leading-relaxed">{flashcardData[currentFlashcard].back}</p>
                                <div className="absolute bottom-6 text-indigo-300 text-sm font-medium">Click to flip back</div>
                             </div>
                          </div>
                          <div className="flex gap-4 mt-8 w-full justify-between items-center">
                             <button 
                                onClick={() => { setIsFlipped(false); setCurrentFlashcard(prev => Math.max(0, prev - 1)); }} 
                                disabled={currentFlashcard === 0}
                                className="px-6 py-3 bg-white border border-gray-200 rounded-full font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                             >Previous</button>
                             <div className="px-6 py-3 text-gray-500 font-medium">
                                Card {currentFlashcard + 1} of {flashcardData.length}
                             </div>
                             <button 
                                onClick={() => { setIsFlipped(false); setCurrentFlashcard(prev => Math.min(flashcardData.length - 1, prev + 1)); }} 
                                disabled={currentFlashcard === flashcardData.length - 1}
                                className="px-6 py-3 bg-black border border-black text-white rounded-full font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                             >Next</button>
                          </div>
                       </>
                    ) : (
                       <div className="text-center py-10 text-gray-500">No flashcards available.</div>
                    )}
                 </div>
               </div>
            )}
              {expandedPanel === 'wrong-one' && (
              <div className="w-full h-full flex flex-col p-6 md:p-8 relative z-10 overflow-hidden">
                <div className="w-full max-w-3xl mx-auto my-auto bg-white border border-gray-100 shadow-xl rounded-3xl flex flex-col max-h-full overflow-hidden">

                  {/* Header */}
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <FileX className="w-5 h-5 text-black" /> Wrong One
                    </h3>
                    {wrongOneData.length > 0 && wrongOneStatus === 'playing' && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 font-medium">{currentWrongOneQ + 1} / {wrongOneData.length}</span>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold font-mono ${
                          wrongOneTimeLeft <= 10 ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-700'
                        }`}>
                          0:{wrongOneTimeLeft.toString().padStart(2, '0')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  {isLoadingPractice ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Generating trick questions...</p>
                      </div>
                    </div>
                  ) : wrongOneData.length > 0 ? (
                    wrongOneStatus === 'playing' ? (
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Progress bar */}
                        <div className="h-1 bg-gray-100 flex-shrink-0">
                          <div className="h-full bg-black transition-all duration-300" style={{ width: `${((currentWrongOneQ) / wrongOneData.length) * 100}%` }} />
                        </div>
                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'none' }}>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Find the incorrect statement</p>
                          <p className="text-base md:text-lg font-semibold text-gray-900 mb-5 leading-relaxed">
                            Which of the following is WRONG?
                          </p>
                          <div className="flex flex-col gap-2.5">
                            {wrongOneData[currentWrongOneQ].options.map((opt: string, optIdx: number) => (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  setWrongOneSelected(optIdx);
                                  if (optIdx === wrongOneData[currentWrongOneQ].wrongAnswerIndex) setWrongOneScore(s => s + 1);
                                }}
                                disabled={wrongOneSelected !== null}
                                className={`w-full text-left rounded-2xl px-4 py-3.5 border font-medium text-sm transition-all flex items-start gap-3 ${
                                  wrongOneSelected === null
                                    ? 'bg-gray-50 border-gray-200 hover:border-gray-900 hover:bg-white text-gray-800'
                                    : optIdx === wrongOneData[currentWrongOneQ].wrongAnswerIndex
                                      ? 'bg-green-50 border-green-400 text-green-900'
                                      : wrongOneSelected === optIdx
                                        ? 'bg-red-50 border-red-400 text-red-900'
                                        : 'bg-gray-50 border-gray-100 text-gray-300'
                                }`}
                              >
                                <span className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border mt-0.5 ${
                                  wrongOneSelected !== null && optIdx === wrongOneData[currentWrongOneQ].wrongAnswerIndex
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : wrongOneSelected === optIdx && optIdx !== wrongOneData[currentWrongOneQ].wrongAnswerIndex
                                      ? 'bg-red-500 border-red-500 text-white'
                                      : 'border-gray-300 text-gray-500 bg-white'
                                }`}>{String.fromCharCode(65 + optIdx)}</span>
                                <span className="leading-relaxed">{opt}</span>
                              </button>
                            ))}
                          </div>
                          {/* Explanation */}
                          {wrongOneSelected !== null && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Explanation</p>
                              <p className="text-sm text-amber-900 leading-relaxed">{wrongOneData[currentWrongOneQ].explanation}</p>
                            </div>
                          )}
                        </div>
                        {/* Footer */}
                        {wrongOneSelected !== null && (
                          <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0">
                            <button
                              onClick={() => {
                                if (currentWrongOneQ < wrongOneData.length - 1) {
                                  setCurrentWrongOneQ(q => q + 1);
                                  setWrongOneSelected(null);
                                  setWrongOneTimeLeft(30);
                                } else {
                                  setWrongOneStatus('completed');
                                }
                              }}
                              className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
                            >
                              {currentWrongOneQ < wrongOneData.length - 1 ? 'Next →' : 'See Results'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-28 h-28 rounded-full bg-gray-50 border-4 border-gray-100 flex items-center justify-center mb-5">
                          <span className="text-3xl font-bold text-gray-900">{Math.round((wrongOneScore / wrongOneData.length) * 100)}%</span>
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-1">Round Complete!</h4>
                        <p className="text-gray-400 mb-1">{wrongOneScore} correct out of {wrongOneData.length}</p>
                        <p className="text-gray-400 text-sm mb-8">
                          {wrongOneScore === wrongOneData.length ? '🎉 Perfect!' : wrongOneScore >= wrongOneData.length * 0.7 ? '👏 Well done!' : '📚 Keep practising!'}
                        </p>
                        <button onClick={resetWrongOne} className="px-8 py-3 bg-black text-white rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors">
                          Try Again
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No trick questions available.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
           <div className="p-4 grid grid-cols-2 gap-3 flex-1 content-start overflow-y-auto">
             <button onClick={() => setExpandedPanel('prove-it')} className="rounded-2xl p-4 flex flex-col justify-center items-center gap-3 transition-all text-center aspect-square border border-gray-200 hover:border-gray-400 hover:shadow-md" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}>
                <div className="text-gray-800 rounded-full p-3 border border-gray-200 bg-white/80">
                   <FileBadge className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 text-sm">Prove It</h3>
                </div>
             </button>
             
             <button onClick={() => setExpandedPanel('challenge')} className="rounded-2xl p-4 flex flex-col justify-center items-center gap-3 transition-all text-center aspect-square border border-gray-200 hover:border-gray-400 hover:shadow-md" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
                <div className="text-gray-800 rounded-full p-3 border border-gray-200 bg-white/80">
                   <Zap className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 text-sm">Challenge</h3>
                </div>
             </button>

             <button onClick={() => setExpandedPanel('listen')} className="rounded-2xl p-4 flex flex-col justify-center items-center gap-3 transition-all text-center aspect-square border border-gray-200 hover:border-gray-400 hover:shadow-md" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
                <div className="text-gray-800 rounded-full p-3 border border-gray-200 bg-white/80">
                   <Headphones className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 text-sm">Listen</h3>
                </div>
             </button>

             <button onClick={() => setExpandedPanel('flashcards')} className="rounded-2xl p-4 flex flex-col justify-center items-center gap-3 transition-all text-center aspect-square border border-gray-200 hover:border-gray-400 hover:shadow-md" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
                <div className="text-gray-800 rounded-full p-3 border border-gray-200 bg-white/80">
                   <Layers className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 text-sm">Flashcards</h3>
                </div>
             </button>

             <button onClick={() => setExpandedPanel('wrong-one')} className="rounded-2xl p-4 flex flex-col justify-center items-center gap-3 transition-all text-center aspect-square border border-gray-200 hover:border-gray-400 hover:shadow-md" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
                <div className="text-gray-800 rounded-full p-3 border border-gray-200 bg-white/80">
                   <FileX className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 text-sm">Wrong one</h3>
                </div>
             </button>
          </div>
        )}
        
      </motion.div>
    </div>
  );
}