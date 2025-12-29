import React, { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { Upload, FileVideo, FileAudio, Loader2, RefreshCw, FileText, AlertCircle, Link as LinkIcon, ArrowRight, Info, ExternalLink, Check, Copy, Search, ShieldCheck, List, FilePenLine, Globe, BookOpen, Download, Gauge, Music, ChevronRight, Zap, Layers, Languages, Sparkles, Printer, Key, LogOut } from 'lucide-react';

// Lazy load MediaPlayer
const MediaPlayer = React.lazy(() => import('./MediaPlayer'));

// --- Types ---

type DownloadTool = {
  name: string;
  url: string;
  icon: React.ReactNode;
  description: string;
  isRecommended?: boolean;
  tag?: string;
};

type TranscriptLine = {
  startTime: number;
  timeLabel: string;
  text: string;
  originalText: string;
};

type ViewMode = 'transcript' | 'refined' | 'summary';

type UILanguage = 'en' | 'zh';

// --- Constants & Data ---

const TARGET_LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Traditional Chinese (Taiwan usage)', label: '繁體中文 (台灣)' },
  { code: 'Simplified Chinese', label: '简体中文' },
  { code: 'Japanese', label: '日本語' },
  { code: 'Korean', label: '한국어' },
  { code: 'Spanish', label: 'Español' },
  { code: 'French', label: 'Français' },
  { code: 'German', label: 'Deutsch' },
];

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

// UI String Dictionary for i18n
const UI_STRINGS = {
  en: {
    appTitle: "LazVid.ai",
    welcomeHeader: "Welcome to LazVid.ai",
    welcomeSub: "Your AI-powered assistant for video translation, summarization, and reading.",
    apiKeyHeader: "Enter Gemini API Key",
    apiKeySub: "To use LazVid.ai, you need your own Google Gemini API Key. Your key is stored locally in your browser.",
    apiKeyPlaceholder: "Paste your API Key here (starts with AIza...)",
    apiKeyBtn: "Start Using App",
    getApiKey: "Get API Key from Google AI Studio",
    removeKey: "Remove Key",
    uploadTab: "Upload",
    playTab: "Player",
    step1: "Download File",
    step1Desc: "Due to browser security restrictions, please download the file using these tools first.",
    step1Tip: "Suggestion: Download as Audio / MP3 for faster processing.",
    step2: "Upload File",
    step2Desc: "Once downloaded, drag and drop the file into the box above or click to select.",
    step2Drop: "Click or drag file here",
    linkCopied: "Link Copied! Follow the steps below:",
    searchYoutube: "Search YouTube Tools",
    searchInsta: "Search IG Tools",
    searchGeneral: "Search Video Tools",
    cobaltDesc: "Recommended: Open Source, Ad-free, Fast",
    turboDesc: "Free & Unlimited Downloader",
    turboWarning: "Note: Copyrighted videos may not be downloadable.",
    dragTitle: "Upload File (Video/Audio)",
    dragSubtitle: "Supports MP4, MOV, MP3, M4A, WAV",
    dragTip: "For long content (>10m), Audio format is recommended.",
    selectFileBtn: "Select File",
    orLink: "Or use link (YT/IG/FB etc)",
    linkPlaceholder: "Paste YouTube / Shorts / Instagram link...",
    targetLang: "Target Language:",
    reset: "Reset",
    startTranslate: "Translate",
    processing: "Processing",
    translated: "Done",
    refineBtn: "Generate Full Text",
    summaryBtn: "Journalist Summary",
    tabTranscript: "Transcript",
    tabRefined: "Full Text",
    tabSummary: "Summary",
    exportSub: "Export Subs:",
    errorTitle: "Error Occurred",
    // Processing Status
    statusTranscript: "Generating Transcript...",
    statusRefined: "Generating Full Text...",
    statusSummary: "Generating Summary...",
    // Error Messages
    errFileTooLarge: "File too large (>60MB).\nTip: Download as Audio (MP3) for long videos to save space and speed up processing!",
    errUnsupported: "Unsupported format. Please upload video or audio.",
    errNetwork: "Network error detected. Please check your internet connection and try again.",
    errSafety: "The content was blocked by safety filters. Please try a different file.",
    errServer: "AI Service is currently busy (503). Please wait a moment and try again.",
    errGeneral: "An unexpected error occurred. Please try again.",
    errNoKey: "API Key is missing. Please enter your key.",
    // Loading States
    loadingMedia: "Loading media...",
    listening: (lang: string) => `Gemini is listening and translating to ${lang}...`,
    refining: "Generating Full Text...",
    summarizing: "Generating Summary...",
    // Empty States
    emptyTranscript: "No transcript yet.",
    guideAction: "Click 'Translate' on the left to start generating content.",
    clickToGenerateRefine: "Click 'Generate Now' to produce a readable full text version",
    clickToGenerateSummary: "Click 'Generate Now' to analyze key points",
    generateNow: "Generate Now",
    // Tools & Copy
    toolCobalt: "Cobalt",
    toolTurbo: "TurboScribe",
    toolGoogle: "Google Search",
    toolTagBest: "Best Tool",
    toolTagFree: "Free Tool",
    tipCobalt: "is recommended; try",
    tipTurbo: "if it fails.",
    totalLines: (count: number) => `Total ${count} lines`,
    copy: "Copy",
    copied: "Copied!",
    // Downloads
    downloadMd: "Download .MD",
    printPdf: "Print / Save PDF",
  },
  zh: {
    appTitle: "LazVid.ai",
    welcomeHeader: "歡迎使用 LazVid.ai",
    welcomeSub: "您的 AI 影片翻譯、摘要與閱讀助手。",
    apiKeyHeader: "輸入 Gemini API Key",
    apiKeySub: "為了使用本服務，請輸入您個人的 Google Gemini API Key。您的金鑰僅會儲存在瀏覽器端。",
    apiKeyPlaceholder: "在此貼上您的 API Key (以 AIza 開頭...)",
    apiKeyBtn: "開始使用",
    getApiKey: "前往 Google AI Studio 取得免費 Key",
    removeKey: "移除 Key",
    uploadTab: "上傳",
    playTab: "播放",
    step1: "下載檔案 (推薦 MP3)",
    step1Desc: "受限於瀏覽器安全限制，請先透過以下工具下載檔案。",
    step1Tip: "強烈建議下載 Audio / MP3 格式，速度最快且不佔空間。",
    step2: "上傳檔案",
    step2Desc: "下載完成後，請將檔案拖曳到上方虛線框，或點擊下方框框選取檔案。",
    step2Drop: "點擊或拖曳檔案至此",
    linkCopied: "連結已複製！接下來請依照步驟操作：",
    searchYoutube: "搜尋其他 YouTube 工具",
    searchInsta: "搜尋其他 IG 工具",
    searchGeneral: "搜尋通用下載工具",
    cobaltDesc: "首選推薦：開源、無廣告、支援多平台",
    turboDesc: "免費且無限制的下載工具",
    turboWarning: "注意：有版權的影片可能無法下載",
    dragTitle: "上傳檔案 (影片/音訊)",
    dragSubtitle: "支援 MP4, MOV, MP3, M4A, WAV",
    dragTip: "長內容 (>10分鐘) 建議使用音訊檔",
    selectFileBtn: "選擇檔案",
    orLink: "或使用連結 (YT/IG/FB 等)",
    linkPlaceholder: "貼上 YouTube / Shorts / Instagram 連結...",
    targetLang: "目標語言：",
    reset: "重來",
    startTranslate: "開始翻譯",
    processing: "處理中",
    translated: "已翻譯",
    refineBtn: "生成全文",
    summaryBtn: "記者摘要",
    tabTranscript: "逐字稿",
    tabRefined: "全文",
    tabSummary: "重點筆記",
    exportSub: "匯出字幕：",
    errorTitle: "發生錯誤",
    // Processing Status
    statusTranscript: "逐字稿生成中...",
    statusRefined: "全文生成中...",
    statusSummary: "摘要生成中...",
    // Error Messages
    errFileTooLarge: "檔案過大 (>60MB)。\nGemini 小技巧：長影片或 Shorts 請先下載為「音訊檔 (MP3)」後再上傳，速度更快且不佔空間！",
    errUnsupported: "不支援的檔案格式。請上傳影片或音訊檔。",
    errNetwork: "偵測到網路錯誤。請檢查您的網路連線後重試。",
    errSafety: "內容因觸發安全篩選機制而被阻擋。請嘗試其他檔案。",
    errServer: "AI 服務目前繁忙 (503)。請稍後再試一次。",
    errGeneral: "發生未預期的錯誤，請重試。",
    errNoKey: "缺少 API Key，請重新輸入。",
    // Loading States
    loadingMedia: "正在讀取媒體資料...",
    listening: (lang: string) => `Gemini 正在聆聽內容並翻譯成${lang}...`,
    refining: "全文生成中...",
    summarizing: "摘要生成中...",
    // Empty States
    emptyTranscript: "尚未生成內容",
    guideAction: "請點擊左側「開始翻譯」按鈕以開始生成逐字稿。",
    clickToGenerateRefine: "點擊「立即生成」按鈕開始生成全文文章",
    clickToGenerateSummary: "點擊「立即生成」按鈕開始分析內容",
    generateNow: "立即生成",
    // Tools & Copy
    toolCobalt: "Cobalt",
    toolTurbo: "TurboScribe",
    toolGoogle: "Google 搜尋",
    toolTagBest: "最強工具",
    toolTagFree: "免費工具",
    tipCobalt: "最為推薦；若遇失敗請嘗試",
    tipTurbo: "。",
    totalLines: (count: number) => `共 ${count} 行字幕`,
    copy: "複製內容",
    copied: "已複製！",
    // Downloads
    downloadMd: "下載 .MD",
    printPdf: "列印 / 存為 PDF",
  }
};

// --- Components ---

const CustomLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="logo_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="24" fill="url(#logo_grad)" />
    <path d="M38 32 L 72 50 L 38 68 V 32 Z" fill="white" stroke="white" strokeWidth="4" strokeLinejoin="round" />
    <path d="M78 20 L 80.5 14 L 83 20 L 89 22.5 L 83 25 L 80.5 31 L 78 25 L 72 22.5 Z" fill="white" />
  </svg>
);

const CopyButton = ({ text, t }: { text: string, t: any }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm border
        ${copied
          ? 'bg-green-500/20 text-green-400 border-green-500/50'
          : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600 hover:text-white'
        }`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span>{copied ? t.copied : t.copy}</span>
    </button>
  );
};

const SimpleMarkdown = ({ content }: { content: string }) => {
  if (!content) return null;
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listBuffer: React.ReactNode[] = [];
  let inList = false;

  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="text-blue-200 font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const flushList = () => {
    if (inList && listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-3 my-6 pl-2">
          {listBuffer}
        </ul>
      );
      listBuffer = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    if (trimmed.startsWith('#')) {
      flushList();
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const text = trimmed.replace(/^#+\s*/, '');
      if (level === 1) {
        elements.push(<h1 key={index} className="text-3xl font-bold text-white mt-10 mb-6 border-b border-slate-700 pb-4 leading-tight">{text}</h1>);
      } else if (level === 2) {
        elements.push(<h2 key={index} className="text-2xl font-bold text-blue-300 mt-10 mb-5 leading-tight">{text}</h2>);
      } else {
        elements.push(<h3 key={index} className="text-xl font-bold text-cyan-300 mt-8 mb-4 leading-tight">{text}</h3>);
      }
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      const text = trimmed.substring(2);
      listBuffer.push(
        <li key={index} className="flex gap-3 text-slate-300 text-lg leading-8 tracking-wide">
          <span className="text-blue-400 mt-2 shrink-0 text-xs">●</span>
          <span>{parseInline(text)}</span>
        </li>
      );
    } else {
      flushList();
      elements.push(
        <p key={index} className="text-lg text-slate-300 leading-9 mb-6 tracking-wide text-justify">
          {parseInline(trimmed)}
        </p>
      );
    }
  });
  flushList();
  return <div className="markdown-body max-w-3xl mx-auto pb-20">{elements}</div>;
};

const ApiKeyScreen = ({ onSave, t }: { onSave: (key: string) => void, t: any }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim().length > 10) {
      onSave(inputKey.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Key size={120} className="text-blue-400" />
        </div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <CustomLogo className="w-16 h-16 drop-shadow-lg mb-4" />
          <h1 className="text-2xl font-bold text-white">{t.apiKeyHeader}</h1>
          <p className="text-slate-400 text-center text-sm mt-2 leading-relaxed">
            {t.apiKeySub}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Key size={18} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder={t.apiKeyPlaceholder}
                className="w-full bg-slate-900/50 border border-slate-600 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 font-mono text-sm"
                required
              />
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors w-fit ml-1"
            >
              <ExternalLink size={12} /> {t.getApiKey}
            </a>
          </div>

          <button
            type="submit"
            disabled={inputKey.length < 10}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {t.apiKeyBtn}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  // State: App Settings
  const [uiLanguage, setUiLanguage] = useState<UILanguage>('en'); // Default to English
  const t = UI_STRINGS[uiLanguage]; // Current translation object
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Load API Key from localStorage
  useEffect(() => {
    const storedKey = localStorage.getItem('lazvid_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('lazvid_api_key', key);
    setApiKey(key);
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('lazvid_api_key');
    setApiKey(null);
    setFile(null); // Reset current session
  };

  // State: Media Data
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isAudio, setIsAudio] = useState(false);

  // State: Content Data
  const [rawTranscript, setRawTranscript] = useState<string>('');
  const [parsedTranscript, setParsedTranscript] = useState<TranscriptLine[]>([]);
  const [refinedText, setRefinedText] = useState<string>('');
  const [summaryText, setSummaryText] = useState<string>('');

  // State: UI Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('transcript');
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // State: Settings
  // Default Target Language: Traditional Chinese (Index 1)
  const [targetLanguage, setTargetLanguage] = useState<string>(TARGET_LANGUAGES[1].code);
  const [playbackRate, setPlaybackRate] = useState(1);

  // State: Download Helper
  const [detectedPlatform, setDetectedPlatform] = useState<'youtube' | 'instagram' | 'other' | null>(null);
  const [showDownloadHelper, setShowDownloadHelper] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLMediaElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  // Parse Transcript Logic
  useEffect(() => {
    if (!rawTranscript) {
      setParsedTranscript([]);
      return;
    }
    const lines = rawTranscript.split('\n');
    const parsed: TranscriptLine[] = [];
    lines.forEach(line => {
      const match = line.match(/^\[(\d{2}):(\d{2})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const totalSeconds = minutes * 60 + seconds;
        parsed.push({
          startTime: totalSeconds,
          timeLabel: match[1] + ':' + match[2],
          text: match[3].trim(),
          originalText: line
        });
      }
    });
    setParsedTranscript(parsed);
  }, [rawTranscript]);

  // Auto-scroll
  useEffect(() => {
    if (viewMode === 'transcript' && activeLineRef.current && transcriptContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [currentTime, viewMode]);

  // Playback Rate - Handled in MediaPlayer or via ref if needed
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Helper: Friendly Error Messages
  const getFriendlyErrorMessage = (err: any) => {
    const msg = err.message || JSON.stringify(err);
    if (msg.includes('400') || msg.includes('SAFETY')) return t.errSafety;
    if (msg.includes('503') || msg.includes('500')) return t.errServer;
    if (msg.includes('fetch') || msg.includes('network')) return t.errNetwork;
    return `${t.errGeneral}\n(${msg.substring(0, 100)}...)`;
  };

  // File Handling
  const processFile = (selectedFile: File) => {
    if (selectedFile.size > 60 * 1024 * 1024) {
      setError(t.errFileTooLarge);
      return;
    }
    const isAudioFile = selectedFile.type.startsWith('audio/');
    setIsAudio(isAudioFile);
    setFile(selectedFile);
    setFileUrl(URL.createObjectURL(selectedFile));

    // Reset data
    setRawTranscript('');
    setRefinedText('');
    setSummaryText('');
    setParsedTranscript([]);
    setError(null);
    setUrlInput('');
    setShowDownloadHelper(false);
    setViewMode('transcript');
    setPlaybackRate(1);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type.startsWith('video/') || droppedFile.type.startsWith('audio/')) {
        processFile(droppedFile);
      } else {
        setError(t.errUnsupported);
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) { console.error('Failed to copy', err); }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setError(null);
    setShowDownloadHelper(true);
    const lowerUrl = urlInput.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      setDetectedPlatform('youtube');
    } else if (lowerUrl.includes('instagram.com')) {
      setDetectedPlatform('instagram');
    } else {
      setDetectedPlatform('other');
    }
    copyToClipboard(urlInput);
  };

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  // --- API Actions ---

  const handleGenerateTranscript = async () => {
    if (!file) return;
    if (!apiKey) {
      setError(t.errNoKey);
      return;
    }
    setIsProcessing(true);
    setLoadingStatus(t.loadingMedia);
    setError(null);
    setViewMode('transcript');

    try {
      const mediaPart = await fileToGenerativePart(file);
      setLoadingStatus(t.listening(TARGET_LANGUAGES.find(l => l.code === targetLanguage)?.label || targetLanguage));

      const ai = new GoogleGenAI({ apiKey: apiKey });
      const model = 'gemini-2.5-flash';

      const prompt = `
        You are a professional subtitle translator.
        Please listen to the audio content of this media and translate it into ${targetLanguage}.
        
        Please output in the following format (one line per sentence):
        [MM:SS] Translated content in ${targetLanguage}
        
        Example:
        [00:01] (Translated text here)
        [00:05] (Translated text here)
        
        Ensure the translation is natural and fluent. Ignore background music or non-vocal segments.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [mediaPart, { text: prompt }] }
      });

      if (response.text) {
        setRawTranscript(response.text);
      } else {
        throw new Error("Failed to generate content. Please ensure the file has audio.");
      }
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsProcessing(false);
      setLoadingStatus('');
    }
  };

  const handleRefineText = async () => {
    if (!rawTranscript) return;
    if (!apiKey) {
      setError(t.errNoKey);
      return;
    }
    // setViewMode('refined'); // handled by caller
    if (refinedText) return;
    setIsProcessing(true);
    setLoadingStatus(t.refining);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Please convert the following transcript into a fluent, readable article in ${targetLanguage}.
            
            Requirements:
            1. Provide a catchy Title (use # H1 format).
            2. Use Markdown format.
            3. Remove timestamps and filler words.
            4. Organize into paragraphs with spacing.
            5. Use **bold** for important concepts.
            
            Transcript:
            ${rawTranscript}`
      });
      if (response.text) setRefinedText(response.text);
    } catch (err: any) { setError(getFriendlyErrorMessage(err)); }
    finally { setIsProcessing(false); setLoadingStatus(''); }
  };

  // Senior Journalist Summary Logic
  const handleSummarize = async () => {
    if (!rawTranscript) return;
    if (!apiKey) {
      setError(t.errNoKey);
      return;
    }
    // setViewMode('summary'); // handled by caller
    if (summaryText) return;
    setIsProcessing(true);
    setLoadingStatus(t.summarizing);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Act as a Senior Journalist from a top-tier news agency (like Reuters or AP). 
            Write a news summary of the following transcript in ${targetLanguage}.
            
            Strictly follow the 'Inverted Pyramid' structure:
            
            1. **Headline** (Use # H1): Professional, objective, and catchy.
            2. **The Lead** (Use ## H2): The first paragraph must summarize the 'Who, what, when, where, and why' in 2-3 concise sentences.
            3. **Key Details** (Use ## H2): A bulleted list of the most factual and important data points or arguments.
            4. **Context & Quotes** (Use ## H2): Significant quotes (if any) or background context mentioned in the text.
            5. **Conclusion** (Use ## H2): A brief impartial closing sentence.
            
            Tone: Objective, third-person, professional, concise.
            
            Transcript:
            ${rawTranscript}`
      });
      if (response.text) setSummaryText(response.text);
    } catch (err: any) { setError(getFriendlyErrorMessage(err)); }
    finally { setIsProcessing(false); setLoadingStatus(''); }
  };

  // Export
  const formatTime = (seconds: number, separator: string, msSeparator: string) => {
    const date = new Date(0);
    date.setSeconds(seconds);
    const timeString = date.toISOString().substr(11, 8);
    return `${timeString}${msSeparator}000`;
  };

  const handleExportSubtitles = (format: 'srt' | 'vtt') => {
    if (parsedTranscript.length === 0) return;
    let content = format === 'vtt' ? 'WEBVTT\n\n' : '';

    parsedTranscript.forEach((line, index) => {
      const nextLine = parsedTranscript[index + 1];
      const endTime = nextLine ? nextLine.startTime : line.startTime + 5;
      const start = format === 'srt' ? formatTime(line.startTime, ':', ',') : formatTime(line.startTime, ':', '.');
      const end = format === 'srt' ? formatTime(endTime, ':', ',') : formatTime(endTime, ':', '.');

      if (format === 'srt') {
        content += `${index + 1}\n${start} --> ${end}\n${line.text}\n\n`;
      } else {
        content += `${start} --> ${end}\n${line.text}\n\n`;
      }
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMD = (content: string, prefix: string) => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prefix}-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = (content: string) => {
    if (!content) return;
    // Simple way to print PDF without libraries: Open new window, render HTML, print.
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    // Basic conversion of Markdown to HTML for the print view
    let htmlContent = content
      .replace(/^# (.*$)/gim, '<h1 style="font-size:24px; font-weight:bold; margin-bottom:16px;">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size:20px; font-weight:bold; margin-top:24px; margin-bottom:12px; color:#333;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="font-size:18px; font-weight:bold; margin-top:20px; margin-bottom:10px;">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
      .replace(/^\- (.*$)/gim, '<li style="margin-bottom:8px;">$1</li>')
      .replace(/\n/gim, '<br />');

    printWindow.document.write(`
        <html>
            <head>
                <title>Print / Save as PDF</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #000; }
                    h1, h2, h3 { color: #000; }
                </style>
            </head>
            <body>
                ${htmlContent}
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
  };

  const handleReset = () => {
    setFile(null); setFileUrl(null); setIsAudio(false);
    setRawTranscript(''); setRefinedText(''); setSummaryText('');
    setParsedTranscript([]); setError(null); setUrlInput('');
    setShowDownloadHelper(false); setPlaybackRate(1);
  };

  const handleTimeUpdate = useCallback(() => {
    if (mediaRef.current) setCurrentTime(mediaRef.current.currentTime);
  }, []);

  // --- Render Helpers ---

  const renderDownloadTools = () => {
    const bestTools: DownloadTool[] = [
      {
        name: t.toolCobalt,
        url: 'https://cobalt.tools/',
        icon: <ShieldCheck size={18} />,
        description: t.cobaltDesc,
        isRecommended: true,
        tag: t.toolTagBest
      },
      {
        name: t.toolTurbo,
        url: 'https://turboscribe.ai/downloader',
        icon: <FileAudio size={18} />,
        description: t.turboDesc,
        isRecommended: false,
        tag: t.toolTagFree
      }
    ];

    let searchUrl = '', searchLabel = '';
    if (detectedPlatform === 'youtube') {
      searchUrl = 'https://www.google.com/search?q=youtube+to+mp3+clean';
      searchLabel = t.searchYoutube;
    } else if (detectedPlatform === 'instagram') {
      searchUrl = 'https://www.google.com/search?q=instagram+downloader';
      searchLabel = t.searchInsta;
    } else {
      searchUrl = 'https://www.google.com/search?q=video+downloader';
      searchLabel = t.searchGeneral;
    }

    const allTools: DownloadTool[] = [
      ...bestTools,
      { name: t.toolGoogle, url: searchUrl, icon: <Search size={18} />, description: searchLabel }
    ];

    return (
      <div className="mt-6 bg-slate-800/90 border border-blue-500/30 rounded-2xl p-4 sm:p-6 animate-in fade-in zoom-in duration-300 shadow-2xl w-full max-w-full box-border relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Download size={100} className="text-blue-400" />
        </div>
        <div className="relative z-10">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <div className="bg-green-500 rounded-full p-1"><Check size={14} className="text-white" /></div>
            {t.linkCopied}
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-lg">
                <span className="bg-blue-500/20 w-8 h-8 rounded-full flex items-center justify-center text-sm border border-blue-500/50">1</span>
                {t.step1}
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t.step1Desc}<br />
                <span className="text-orange-400">💡 {t.step1Tip}</span>
              </p>
              <div className="flex flex-col gap-2 mt-2">
                {allTools.map((tool, idx) => (
                  <div key={idx} className="flex flex-col">
                    <a href={tool.url} target="_blank" rel="noopener noreferrer nofollow" referrerPolicy="no-referrer"
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all group border mb-1
                               ${tool.isRecommended ? 'bg-blue-900/40 border-blue-500/50 hover:bg-blue-900/60 hover:border-blue-400' : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500'}`}>
                      <div className={`p-2 rounded-lg transition-colors text-white shrink-0 ${tool.isRecommended ? 'bg-blue-600' : 'bg-slate-600 group-hover:bg-slate-500'}`}>
                        {tool.icon}
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <div className="font-bold text-sm text-white flex items-center gap-2 justify-between">
                          <span className="truncate flex items-center gap-2">
                            {tool.name}
                            {tool.tag && <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-white font-normal">{tool.tag}</span>}
                          </span>
                          <ExternalLink size={14} className="opacity-70" />
                        </div>
                        <div className="text-xs text-slate-400 truncate">{tool.description}</div>
                      </div>
                    </a>
                    {tool.name === t.toolTurbo && (
                      <div className="text-[11px] text-amber-500/80 px-2 mb-1 flex items-center gap-1.5">
                        <Info size={12} className="shrink-0" />
                        <span>{t.turboWarning}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 border-t border-slate-700 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6 relative">
              <div className="hidden md:block absolute top-1/2 -left-3 -mt-3 bg-slate-800 rounded-full p-1 text-slate-500 z-20">
                <ChevronRight size={16} />
              </div>
              <div className="flex items-center gap-2 text-blue-300 font-bold text-lg">
                <span className="bg-blue-500/20 w-8 h-8 rounded-full flex items-center justify-center text-sm border border-blue-500/50">2</span>
                {t.step2}
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{t.step2Desc}</p>
              <div className={`bg-slate-900/50 p-4 rounded-xl border border-dashed transition-all flex flex-col items-center justify-center text-slate-500 gap-2 h-32 cursor-pointer group
                            ${isDragging ? 'border-blue-500 bg-slate-800/80' : 'border-slate-600 hover:border-blue-500 hover:bg-slate-800/50'}`}
                onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDragEnter={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <div className="p-3 bg-slate-800 rounded-full group-hover:scale-110 transition-transform pointer-events-none">
                  <Upload size={20} className="text-blue-400" />
                </div>
                <span className="text-xs group-hover:text-blue-300 pointer-events-none">{t.step2Drop}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-start gap-2 justify-center">
            <Zap size={14} className="text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 text-left">
              <span className="text-slate-300 font-bold">{t.toolCobalt}</span> {t.tipCobalt} <span className="text-slate-300 font-bold">{t.toolTurbo}</span> {t.tipTurbo}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // If no API Key is present, show the Key Entry Screen
  if (!apiKey) {
    return (
      <>
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setUiLanguage('en')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border border-slate-700 ${uiLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            English
          </button>
          <button
            onClick={() => setUiLanguage('zh')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border border-slate-700 ${uiLanguage === 'zh' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            中文
          </button>
        </div>
        <ApiKeyScreen onSave={handleSaveApiKey} t={t} />
      </>
    );
  }

  return (
    <div className="h-[100dvh] bg-slate-900 text-slate-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CustomLogo className="w-10 h-10 drop-shadow-md" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              {t.appTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* API Key Logout */}
            <button
              onClick={handleRemoveApiKey}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-colors"
              title={t.removeKey}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">{t.removeKey}</span>
            </button>

            {/* UI Language Switcher */}
            <div className="flex items-center gap-2 bg-slate-800 rounded-full p-1 border border-slate-700">
              <button
                onClick={() => setUiLanguage('en')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${uiLanguage === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                English
              </button>
              <button
                onClick={() => setUiLanguage('zh')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${uiLanguage === 'zh' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                中文
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-4 flex flex-col overflow-hidden">
        {!file ? (
          /* Upload Interface */
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 overflow-y-auto">
            <div className="w-full max-w-2xl space-y-8 py-8 px-4 relative">

              {/* Welcome Header */}
              <div className="text-center space-y-2 mb-4">
                <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                  <Sparkles className="text-yellow-400" />
                  {t.welcomeHeader}
                </h2>
                <p className="text-slate-400">{t.welcomeSub}</p>
              </div>

              {/* Target Language Selection (Upload Screen) */}
              <div className="flex justify-end mb-2">
                <div className="flex items-center gap-2 bg-slate-800 p-2 pl-3 rounded-lg border border-slate-700 text-sm">
                  <Globe size={16} className="text-slate-400" />
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {TARGET_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-slate-800">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className={`w-full border-4 border-dashed transition-all rounded-3xl p-8 sm:p-12 text-center cursor-pointer group relative overflow-hidden
                  ${isDragging ? 'border-blue-500 bg-slate-800/80 scale-105' : 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/50'}
                `}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver} onDragEnter={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="video/*,audio/*" onChange={handleFileChange} />
                <div className="bg-slate-800 p-6 rounded-full inline-block mb-6 group-hover:scale-110 transition-transform relative z-10 pointer-events-none">
                  <Upload size={48} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-white relative z-10 pointer-events-none">{t.dragTitle}</h2>
                <p className="text-slate-400 mb-2 relative z-10 pointer-events-none">{t.dragSubtitle}</p>
                <div className="inline-block bg-blue-900/30 border border-blue-500/30 px-3 py-1 rounded-full text-xs text-blue-300 relative z-10 pointer-events-none">
                  💡 {t.dragTip}
                </div>
                <div className="mt-6 relative z-10">
                  <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-colors pointer-events-none">
                    {t.selectFileBtn}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-600">
                <div className="h-px bg-slate-700 flex-1"></div>
                <span className="text-sm">{t.orLink}</span>
                <div className="h-px bg-slate-700 flex-1"></div>
              </div>

              <form onSubmit={handleUrlSubmit} className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <LinkIcon size={20} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="url"
                  placeholder={t.linkPlaceholder}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 shadow-lg"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (!e.target.value) setShowDownloadHelper(false);
                  }}
                />
                <button type="submit" className="absolute inset-y-2 right-2 p-2 bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl transition-colors">
                  <ArrowRight size={20} />
                </button>
              </form>

              {showDownloadHelper && renderDownloadTools()}

              {error && (
                <div className="flex items-start gap-3 text-red-200 bg-red-900/30 border border-red-500/30 px-5 py-4 rounded-2xl animate-in slide-in-from-top-2">
                  <AlertCircle size={24} className="shrink-0 text-red-400" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-bold text-red-400">{t.errorTitle}</p>
                    <p className="text-sm opacity-90 leading-relaxed break-words whitespace-pre-wrap">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Player & Content Interface */
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6 h-full min-h-0 pb-0 lg:pb-4">
            {/* Left Col: Player & Controls (Lazy Loaded) */}
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
                <Loader2 size={40} className="animate-spin text-blue-500" />
                <p>{t.loadingMedia}</p>
              </div>
            }>
              <MediaPlayer
                file={file}
                fileUrl={fileUrl!}
                isAudio={isAudio}
                playbackRate={playbackRate}
                setPlaybackRate={setPlaybackRate}
                targetLanguage={targetLanguage}
                setTargetLanguage={setTargetLanguage}
                rawTranscript={rawTranscript}
                parsedTranscript={parsedTranscript}
                isProcessing={isProcessing}
                handleReset={handleReset}
                handleGenerateTranscript={handleGenerateTranscript}
                error={error}
                t={t}
                mediaRef={mediaRef}
                handleTimeUpdate={handleTimeUpdate}
                targetLanguages={TARGET_LANGUAGES}
                playbackRates={PLAYBACK_RATES}
                viewMode={viewMode}
              />
            </Suspense>

            {/* Right Col: Content Display */}
            <div className="flex flex-col flex-1 min-h-0 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
              <div className="flex border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-10 shrink-0">
                <button onClick={() => setViewMode('transcript')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${viewMode === 'transcript' ? 'border-cyan-400 text-cyan-400 bg-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                  <FileText size={14} /> {t.tabTranscript}
                </button>
                <button onClick={() => setViewMode('refined')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${viewMode === 'refined' ? 'border-purple-400 text-purple-400 bg-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                  <BookOpen size={14} /> {t.tabRefined}
                </button>
                <button onClick={() => setViewMode('summary')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${viewMode === 'summary' ? 'border-amber-400 text-amber-400 bg-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                  <List size={14} /> {t.tabSummary}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth custom-scrollbar relative" ref={transcriptContainerRef}>
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-4 bg-slate-800/90 z-20">
                    <Loader2 size={40} className="animate-spin text-blue-500" />
                    <p className="animate-pulse font-medium">{loadingStatus}</p>
                    <p className="text-xs text-slate-500">AI is working hard...</p>
                  </div>
                ) : null}

                {viewMode === 'transcript' && (
                  <div className="space-y-4">
                    {parsedTranscript.length > 0 ? (
                      parsedTranscript.map((line, index) => {
                        const isActive = currentTime >= line.startTime && (index === parsedTranscript.length - 1 || currentTime < parsedTranscript[index + 1].startTime);
                        return (
                          <div key={index} ref={isActive ? activeLineRef : null}
                            className={`flex flex-col sm:flex-row gap-2 sm:gap-4 p-4 rounded-xl transition-all duration-300 group border cursor-pointer ${isActive ? 'bg-blue-900/20 border-blue-500/30 shadow-lg' : 'border-transparent hover:bg-slate-700/30'}`}
                            onClick={() => { if (mediaRef.current) { mediaRef.current.currentTime = line.startTime; if (mediaRef.current.paused) mediaRef.current.play(); } }}>
                            <div className={`font-mono text-sm sm:w-14 shrink-0 pt-1 transition-colors ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-500 group-hover:text-slate-400'}`}>
                              {line.timeLabel}
                            </div>
                            <p className={`text-base sm:text-lg leading-relaxed break-words min-w-0 ${isActive ? 'text-slate-100 font-medium' : 'text-slate-300 group-hover:text-slate-200'}`}>
                              {line.text}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 py-12 text-center px-4">
                        <FileText size={64} className="mb-4" />
                        <p className="font-bold mb-1">{t.emptyTranscript}</p>
                        <p className="text-sm">{t.guideAction}</p>
                      </div>
                    )}
                  </div>
                )}

                {viewMode === 'refined' && (
                  <div className="min-h-full relative pb-16">
                    {refinedText && (
                      <div className="absolute top-0 right-0 z-10">
                        <CopyButton text={refinedText} t={t} />
                      </div>
                    )}
                    {refinedText ? (<SimpleMarkdown content={refinedText} />) : (!isProcessing && (
                      <div className="flex flex-col items-center justify-center text-slate-500 py-12 gap-4">
                        <BookOpen size={48} className="opacity-50" />
                        <p>{t.clickToGenerateRefine}</p>
                        <button onClick={handleRefineText} disabled={!rawTranscript} className={`px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed`}>{t.generateNow}</button>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'summary' && (
                  <div className="min-h-full relative pb-16">
                    {summaryText && (
                      <div className="absolute top-0 right-0 z-10">
                        <CopyButton text={summaryText} t={t} />
                      </div>
                    )}
                    {summaryText ? (<SimpleMarkdown content={summaryText} />) : (!isProcessing && (
                      <div className="flex flex-col items-center justify-center text-slate-500 py-12 gap-4">
                        <List size={48} className="opacity-50" />
                        <p>{t.clickToGenerateSummary}</p>
                        <button onClick={handleSummarize} disabled={!rawTranscript} className={`px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed`}>{t.generateNow}</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-4 border-t border-slate-700 bg-slate-900/50 backdrop-blur flex items-center justify-between shrink-0 animate-in slide-in-from-bottom-2">
                {viewMode === 'transcript' && parsedTranscript.length > 0 && (
                  <>
                    <div className="text-xs text-slate-500 font-mono hidden sm:block">{t.totalLines(parsedTranscript.length)}</div>
                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <span className="text-xs text-slate-400 mr-1 font-medium">{t.exportSub}</span>
                      <button onClick={() => handleExportSubtitles('srt')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 hover:text-white rounded-lg text-xs text-slate-300 transition-all border border-slate-600 font-medium"><Download size={14} /> .SRT</button>
                      <button onClick={() => handleExportSubtitles('vtt')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 hover:text-white rounded-lg text-xs text-slate-300 transition-all border border-slate-600 font-medium"><Download size={14} /> .VTT</button>
                    </div>
                  </>
                )}
                {viewMode === 'refined' && refinedText && (
                  <div className="flex items-center gap-2 w-full justify-end">
                    <button onClick={() => handleDownloadMD(refinedText, 'full_text')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 hover:text-white rounded-lg text-xs text-slate-300 transition-all border border-slate-600 font-medium"><Download size={14} /> {t.downloadMd}</button>
                    <button onClick={() => handlePrintPDF(refinedText)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white rounded-lg text-xs transition-all border border-purple-500/30 font-medium"><Printer size={14} /> {t.printPdf}</button>
                  </div>
                )}
                {viewMode === 'summary' && summaryText && (
                  <div className="flex items-center gap-2 w-full justify-end">
                    <button onClick={() => handleDownloadMD(summaryText, 'summary')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 hover:text-white rounded-lg text-xs text-slate-300 transition-all border border-slate-600 font-medium"><Download size={14} /> {t.downloadMd}</button>
                    <button onClick={() => handlePrintPDF(summaryText)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 hover:text-white rounded-lg text-xs transition-all border border-amber-500/30 font-medium"><Printer size={14} /> {t.printPdf}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
const root = createRoot(document.getElementById('app')!);
root.render(<App />);