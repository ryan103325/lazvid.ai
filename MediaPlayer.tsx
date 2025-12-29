import React, { useState, useEffect } from 'react';
import { FileVideo, FileAudio, Loader2, RefreshCw, FileText, AlertCircle, Globe, Gauge, Music, Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize } from 'lucide-react';

interface MediaPlayerProps {
  file: File;
  fileUrl: string;
  isAudio: boolean;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  rawTranscript: string;
  parsedTranscript: { startTime: number; text: string }[];
  isProcessing: boolean;
  handleReset: () => void;
  handleGenerateTranscript: () => void;
  error: string | null;
  t: any;
  mediaRef: React.RefObject<HTMLMediaElement | null>;
  handleTimeUpdate: () => void;
  targetLanguages: { code: string; label: string }[];
  playbackRates: number[];
  viewMode?: 'transcript' | 'refined' | 'summary';
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({
  file,
  fileUrl,
  isAudio,
  playbackRate,
  setPlaybackRate,
  targetLanguage,
  setTargetLanguage,
  rawTranscript,
  parsedTranscript,
  isProcessing,
  handleReset,
  handleGenerateTranscript,
  error,
  t,
  mediaRef,
  handleTimeUpdate,
  targetLanguages,
  playbackRates,
  viewMode
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Sync state with ref on mount or when file changes
  useEffect(() => {
    // Reset state for new file
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    const el = mediaRef.current;
    if (el) {
        setVolume(el.volume);
        setIsMuted(el.muted);
        // If metadata is already loaded
        if (Number.isFinite(el.duration) && el.duration > 0) {
            setDuration(el.duration);
        }
    }
  }, [mediaRef, fileUrl]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-5); 
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (mediaRef.current) {
            const newVol = Math.min(1, mediaRef.current.volume + 0.1);
            mediaRef.current.volume = newVol;
            mediaRef.current.muted = newVol === 0;
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (mediaRef.current) {
            const newVol = Math.max(0, mediaRef.current.volume - 0.1);
            mediaRef.current.volume = newVol;
            mediaRef.current.muted = newVol === 0;
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (mediaRef.current.paused) {
        mediaRef.current.play();
      } else {
        mediaRef.current.pause();
      }
    }
  };

  const skip = (seconds: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime += seconds;
    }
  };

  const toggleFullscreen = () => {
    if (mediaRef.current) {
        if (mediaRef.current.requestFullscreen) {
            mediaRef.current.requestFullscreen();
        } else if ((mediaRef.current as any).webkitEnterFullscreen) {
            (mediaRef.current as any).webkitEnterFullscreen();
        }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (mediaRef.current) {
      mediaRef.current.volume = val;
      mediaRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      const nextMute = !isMuted;
      mediaRef.current.muted = nextMute;
      setIsMuted(nextMute);
      if (nextMute) setVolume(0);
      else setVolume(mediaRef.current.volume || 1);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (mediaRef.current) mediaRef.current.currentTime = time;
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time) || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Event Handlers
  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);
  const onVolumeChange = (e: React.SyntheticEvent<HTMLMediaElement, Event>) => {
      setVolume(e.currentTarget.volume);
      setIsMuted(e.currentTarget.muted);
  }
  
  const onTimeUpdateInternal = (e: React.SyntheticEvent<HTMLMediaElement, Event>) => {
      const el = e.currentTarget;
      setCurrentTime(el.currentTime);
      
      // Fallback: If duration is missing (e.g. iOS issue) but we have a valid duration now, update it.
      if (duration === 0 && Number.isFinite(el.duration) && el.duration > 0) {
          setDuration(el.duration);
      }
      
      handleTimeUpdate(); 
  };
  
  const onDurationChange = (e: React.SyntheticEvent<HTMLMediaElement, Event>) => {
      const dur = e.currentTarget.duration;
      if (Number.isFinite(dur) && dur > 0) setDuration(dur);
  };

  // Find active transcript line for overlay
  const activeLine = parsedTranscript?.find((line, index) => {
    const nextLine = parsedTranscript[index + 1];
    return currentTime >= line.startTime && (!nextLine || currentTime < nextLine.startTime);
  });

  // Determine button text
  const getButtonText = () => {
    if (isProcessing) {
      if (viewMode === 'refined') return t.statusRefined;
      if (viewMode === 'summary') return t.statusSummary;
      return t.statusTranscript; // default for transcript generation
    }
    return rawTranscript ? t.translated : t.startTranslate;
  };

  return (
    <div className="flex flex-col gap-3 lg:gap-4 shrink-0 lg:h-full lg:overflow-y-auto">
      <div 
        className={`relative group bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-700 w-full sticky top-0 z-10 flex items-center justify-center shrink-0 ${isAudio ? 'h-48 bg-slate-900' : 'aspect-video max-h-[40dvh] lg:max-h-none'}`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {fileUrl && (
            isAudio ? (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                     <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center shrink-0 mb-8 animate-pulse">
                        <Music size={40} className="text-blue-400" />
                    </div>
                    <audio 
                        ref={mediaRef as React.RefObject<HTMLAudioElement>} 
                        src={fileUrl} 
                        className="hidden" // Hide native audio
                        onPlay={onPlay}
                        onPause={onPause}
                        onTimeUpdate={onTimeUpdateInternal}
                        onLoadedMetadata={onDurationChange}
                        onDurationChange={onDurationChange}
                        onVolumeChange={onVolumeChange}
                    />
                </div>
            ) : (
                <video 
                    ref={mediaRef as React.RefObject<HTMLVideoElement>} 
                    src={fileUrl} 
                    className="w-full h-full object-contain cursor-pointer" 
                    onClick={togglePlay}
                    onPlay={onPlay}
                    onPause={onPause}
                    onTimeUpdate={onTimeUpdateInternal}
                    onLoadedMetadata={onDurationChange}
                    onDurationChange={onDurationChange}
                    onVolumeChange={onVolumeChange}
                    playsInline
                />
            )
        )}

        {/* Subtitle Overlay */}
        {activeLine && (
           <div className="absolute bottom-16 sm:bottom-20 left-4 right-4 text-center pointer-events-none transition-all duration-300 z-20">
             <span className="inline-block px-4 py-2 bg-black/60 backdrop-blur-sm text-white rounded-xl text-sm sm:text-lg font-medium shadow-lg leading-relaxed max-w-[90%]">
               {activeLine.text}
             </span>
           </div>
        )}

        {/* Custom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 transition-opacity duration-300 ${!isAudio && !showControls && isPlaying ? 'opacity-0' : 'opacity-100'}`}>
            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-1 group/seek">
                <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    value={currentTime} 
                    onChange={handleSeek}
                    className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all group-hover/seek:[&::-webkit-slider-thumb]:scale-125"
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>
                    
                    <div className="flex items-center gap-2 text-slate-300">
                        <button onClick={() => skip(-10)} className="hover:text-white transition-colors p-1" title="Rewind 10s (Left Arrow)">
                            <RotateCcw size={20} />
                        </button>
                        <button onClick={() => skip(10)} className="hover:text-white transition-colors p-1" title="Forward 10s (Right Arrow)">
                            <RotateCw size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 group/vol">
                        <button onClick={toggleMute} className="text-slate-300 hover:text-white" title={isMuted ? "Unmute" : "Mute"}>
                            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        
                        {/* Custom Visual Slider */}
                        <div className="relative w-20 h-1 bg-slate-600 rounded-lg group-hover/vol:w-24 transition-all duration-300 cursor-pointer">
                            <div 
                                className="absolute top-0 left-0 h-full bg-blue-500 rounded-lg pointer-events-none" 
                                style={{ width: `${isMuted ? 0 : volume * 100}%` }} 
                            />
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.05" 
                                value={isMuted ? 0 : volume} 
                                onChange={handleVolumeChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                    
                    <div className="text-xs font-mono text-slate-300">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={toggleFullscreen} className="text-slate-300 hover:text-white" title="Fullscreen">
                        <Maximize size={20} />
                    </button>
                </div>
            </div>
        </div>
      </div>
      
      <div className="bg-slate-800 p-3 lg:p-4 rounded-xl border border-slate-700 flex flex-col gap-3 lg:gap-4 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3 overflow-hidden">
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            <div className="bg-blue-500/10 p-2 rounded-lg shrink-0">
              {isAudio ? <FileAudio size={20} className="text-blue-400" /> : <FileVideo size={20} className="text-blue-400" />}
            </div>
            <span className="truncate text-sm text-slate-300 font-medium" title={file.name}>{file.name}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/50 shrink-0">
            <Gauge size={14} className="text-slate-400 ml-1" />
            <select value={playbackRate} onChange={(e) => setPlaybackRate(parseFloat(e.target.value))} className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer py-1 pr-1">
              {playbackRates.map((rate) => (<option key={rate} value={rate} className="bg-slate-800">{rate}x</option>))}
            </select>
          </div>
        </div>
        
        {!rawTranscript && (
          <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
            <Globe size={16} className="text-slate-400 shrink-0 ml-1" />
            <span className="text-sm text-slate-400 whitespace-nowrap">{t.targetLang}</span>
            <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="bg-transparent text-slate-200 text-sm focus:outline-none w-full cursor-pointer py-1">
              {targetLanguages.map((lang) => (<option key={lang.code} value={lang.code} className="bg-slate-800">{lang.label}</option>))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleReset} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
            <RefreshCw size={16} /> {t.reset}
          </button>
          <button onClick={handleGenerateTranscript} disabled={isProcessing || rawTranscript.length > 0}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all shadow-lg
              ${isProcessing || rawTranscript.length > 0 ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/20'}`}>
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {getButtonText()}
          </button>
        </div>
        {error && (<div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-300 text-xs flex items-start gap-2"><AlertCircle size={14} className="shrink-0 mt-0.5" /><span className="break-words">{error}</span></div>)}
      </div>
    </div>
  );
};

export default MediaPlayer;