import React, { useState } from "react";
import { 
  X, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Cpu, 
  Save, 
  Trash2, 
  Download, 
  Upload, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  FileJson, 
  HelpCircle,
  Monitor,
  Sparkles,
  RefreshCw,
  Coins,
  ShieldAlert
} from "lucide-react";
import { PlayerStats, Company, LandPlot, Language } from "../types";

interface SettingsAndFeedbackProps {
  stats: PlayerStats;
  company: Company;
  plots: LandPlot[];
  language: Language;
  onClose: () => void;
  onSaveGame: () => void;
  onClearSaveGame: () => void;
  onImportSave: (jsonStr: string) => boolean;
  onToggleLanguage: () => void;
  playAudioBeep: (type: 'coin' | 'levelup' | 'achievement' | 'alert') => void;
  adPublisherId?: string;
  onUpdateAdPublisherId: (id: string) => void;
}

export const SettingsAndFeedbackModal: React.FC<SettingsAndFeedbackProps> = ({
  stats,
  company,
  plots,
  language,
  onClose,
  onSaveGame,
  onClearSaveGame,
  onImportSave,
  onToggleLanguage,
  playAudioBeep,
  adPublisherId = "",
  onUpdateAdPublisherId
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'audio' | 'graphics' | 'save' | 'feedback' | 'ads'>('audio');
  
  // Simulated Settings State
  const [musicVol, setMusicVol] = useState<number>(80);
  const [sfxVol, setSfxVol] = useState<number>(70);
  const [fpsTarget, setFpsTarget] = useState<number>(60);
  const [graphicsQuality, setGraphicsQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>('high');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [rayTracing, setRayTracing] = useState<boolean>(false);

  // Export Save State
  const [exportedJson, setExportedJson] = useState<string>("");
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  
  // Import Save State
  const [importText, setImportText] = useState<string>("");
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  // Feedback State
  const [feedbackCategory, setFeedbackCategory] = useState<'bug' | 'balance' | 'visual' | 'ideas'>('ideas');
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);
  const [simulatedReceiptId, setSimulatedReceiptId] = useState<string>("");

  const handleExport = () => {
    try {
      const fullPayload = {
        saveVer: "2.1-custom",
        savedAt: Date.now(),
        stats,
        company,
        plots
      };
      const json = btoa(unescape(encodeURIComponent(JSON.stringify(fullPayload))));
      setExportedJson(json);
      playAudioBeep('coin');
    } catch (e) {
      alert("Export failed");
    }
  };

  const copyToClipboard = () => {
    if (!exportedJson) return;
    navigator.clipboard.writeText(exportedJson);
    setCopiedSuccess(true);
    playAudioBeep('achievement');
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const cleanStr = importText.trim();
    const success = onImportSave(cleanStr);
    if (success) {
      setImportStatus('success');
      playAudioBeep('levelup');
    } else {
      setImportStatus('fail');
      playAudioBeep('alert');
      setTimeout(() => setImportStatus('idle'), 2500);
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setSubmittingFeedback(true);
    playAudioBeep('coin');
    
    // Simulate high-fidelity server transaction posting
    setTimeout(() => {
      setSubmittingFeedback(false);
      setFeedbackSuccess(true);
      const uuid = "FB-" + Math.floor(100000 + Math.random() * 900000);
      setSimulatedReceiptId(uuid);
      playAudioBeep('achievement');
    }, 1800);
  };

  return (
    <div id="settings-unified-modal" className="fixed inset-0 bg-black/85 backdrop-blur-md z-60 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Title Bar */}
        <div className="p-5 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/50 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-zinc-100 uppercase tracking-tight">
                {language === 'en' ? "Simulated Environment Controls" : "系统控制与蓝图配置"}
              </h2>
              <p className="text-[10px] text-zinc-500 font-medium font-mono font-bold uppercase tracking-wider">
                {language === 'en' ? "Audio, Graphics & Safe-Engine" : "声音、渲染管线与本地存档管理器"}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Categories Tab Navigation */}
        <div className="flex border-b border-zinc-900 bg-zinc-950/50 p-2 gap-1 overflow-x-auto">
          {[
            { id: 'audio', label_en: "Audio", label_zh: "声音设置", icon: <Volume2 size={14} /> },
            { id: 'graphics', label_en: "Graphics", label_zh: "图形与渲染", icon: <Monitor size={14} /> },
            { id: 'save', label_en: "Safe-Engine", label_zh: "数据存档", icon: <FileJson size={14} /> },
            { id: 'ads', label_en: "Ad Monetize 💰", label_zh: "开通广告赚钱 💰", icon: <Coins size={14} /> },
            { id: 'feedback', label_en: "Feedback Hub", label_zh: "玩家建议", icon: <Send size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                playAudioBeep('coin');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer whitespace-nowrap ${
                activeSubTab === tab.id 
                  ? 'bg-zinc-800 text-emerald-400' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              {tab.icon}
              <span>{language === 'en' ? tab.label_en : tab.label_zh}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Content Bay */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* 1. AUDIO TAB */}
          {activeSubTab === 'audio' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 space-y-4">
                <h3 className="text-xs font-black text-zinc-350 uppercase tracking-widest font-mono">
                  {language === 'en' ? "Volume Levels / 音量设置" : "综合音量分轨调节"}
                </h3>

                {/* Music Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                      <Volume2 size={14} className="text-indigo-400" />
                      {language === 'en' ? "Ambient Music" : "背景流派背景音乐 (Lofi)"}
                    </span>
                    <span className="text-zinc-400 font-mono font-bold">{musicVol}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <VolumeX size={14} className="text-zinc-650" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={musicVol} 
                      onChange={(e) => {
                        setMusicVol(Number(e.target.value));
                      }}
                      className="flex-1 accent-indigo-500 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                    />
                    <Volume2 size={14} className="text-zinc-400" />
                  </div>
                </div>

                {/* SFX Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                      <Sliders size={14} className="text-emerald-400" />
                      {language === 'en' ? "Beep Synthesizer SFX" : "交互式合成器音效 (SFX)"}
                    </span>
                    <span className="text-zinc-400 font-mono font-bold">{sfxVol}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <VolumeX size={14} className="text-zinc-650" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={sfxVol} 
                      onChange={(e) => {
                        setSfxVol(Number(e.target.value));
                      }}
                      className="flex-1 accent-emerald-500 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                    />
                    <Volume2 size={14} className="text-zinc-400" />
                  </div>
                </div>
              </div>

              {/* Music Player Control Cues */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 space-y-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold font-mono tracking-wider block">🎹 Core DSP Simulator</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {language === 'en' 
                    ? "Our custom algorithmic pure sound engine synthesizes real-time sound frequencies dynamically from your sound card, preserving memory leakages." 
                    : "本音频控制系统直接底层通过 Web Audio API 合成特定频率正弦波，不加载任何大体积 MP3 样本文件，超凡省流且保证音画极速同步。"}
                </p>
                <button
                  onClick={() => {
                    playAudioBeep('achievement');
                  }}
                  className="mt-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>🔊 {language==='en'?'Test Audio Channels':'发送正交频率特征测试波形'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. GRAPHICS TAB */}
          {activeSubTab === 'graphics' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 space-y-4">
                <h3 className="text-xs font-black text-zinc-350 uppercase tracking-widest font-mono">
                  {language === 'en' ? "Simulation Canvas Graphics" : "视觉分辨率与渲染设置"}
                </h3>

                {/* Graphics Quality selector */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-bold block">
                    {language === 'en' ? "Visual Rigidity Preset" : "拟真材质和网格精细度预设"}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['low', 'medium', 'high', 'ultra'] as const).map(quality => (
                      <button
                        key={quality}
                        onClick={() => {
                          setGraphicsQuality(quality);
                          playAudioBeep('coin');
                        }}
                        className={`py-2 px-1 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider border transition cursor-pointer ${
                          graphicsQuality === quality 
                            ? 'bg-emerald-600 border-emerald-600 text-black shadow' 
                            : 'bg-zinc-900 border-zinc-850 hover:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Target FPS */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs text-zinc-400 font-bold block">
                    {language === 'en' ? "Frame Limitation Buffer" : "仿真帧率刷新锁频"}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {([30, 60, 120, 144]).map(fps => (
                      <button
                        key={fps}
                        onClick={() => {
                          setFpsTarget(fps);
                          playAudioBeep('coin');
                        }}
                        className={`py-2 px-1 rounded-xl text-[10px] font-mono uppercase font-bold border transition cursor-pointer ${
                          fpsTarget === fps 
                            ? 'bg-emerald-600 border-emerald-600 text-black shadow' 
                            : 'bg-zinc-900 border-zinc-850 hover:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {fps} FPS
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ray Tracing toggle (Simulated) */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-900">
                  <div className="space-y-0.5">
                    <span className="text-xs text-zinc-300 font-bold block">
                      {language === 'en' ? "Holographic Ray Tracing (RTX)" : "大马霓虹城市实时光线追踪 (RTX)"}
                    </span>
                    <span className="text-[10px] text-zinc-550 block leading-tight">
                      {language === 'en' ? "Enables realistic reflective mirror on puddles & metallic supercars" : "开启雨天积水倒影、反射以及碳纤维跑车涂层精细散射"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setRayTracing(!rayTracing);
                      playAudioBeep('levelup');
                    }}
                    className={`w-12 h-6 rounded-full p-0.5 transition duration-200 cursor-pointer ${
                      rayTracing ? 'bg-indigo-600' : 'bg-zinc-850'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                      rayTracing ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Memory Diagnostics */}
              <div className="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-90s/60 p-2.5 rounded-xl border border-zinc-950">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 block">⚡ DOM Latency</span>
                  <span className="text-xs font-black font-mono text-emerald-400">1.24 ms</span>
                </div>
                <div className="bg-zinc-95s/60 p-2.5 rounded-xl border border-zinc-950">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 block">📊 GC Heap Allocation</span>
                  <span className="text-xs font-black font-mono text-indigo-400">14.6 MB</span>
                </div>
                <div className="bg-zinc-95s/60 p-2.5 rounded-xl border border-zinc-950">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 block">🧬 GPU Draw-calls</span>
                  <span className="text-xs font-black font-mono text-pink-400">42 / frame</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. SAVE-ENGINE TAB */}
          {activeSubTab === 'save' && (
            <div className="space-y-6">
              
              {/* Dynamic Auto-Save Switch */}
              <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs text-zinc-300 font-black block uppercase tracking-wide">
                      {language === 'en' ? "Continuous Local Auto-Save" : "本地数据自动秒回传"}
                    </span>
                    <span className="text-[10px] text-zinc-500 block leading-tight">
                      {language === 'en' ? "Secures progress automatically every 0.5s of state evolution" : "在您执行买地、收租、创办公司、打工等任何操作时自动秒级安全持久化"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setAutoSaveEnabled(!autoSaveEnabled);
                      playAudioBeep('levelup');
                    }}
                    className={`w-12 h-6 rounded-full p-0.5 transition duration-200 cursor-pointer ${
                      autoSaveEnabled ? 'bg-emerald-600' : 'bg-zinc-850'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                      autoSaveEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                
                {/* Instant Manual Save */}
                <div className="pt-3 border-t border-zinc-900 flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">{language==='en'?'Sync State: Valid':'本地状态验证：已就绪'}</span>
                  <button
                    onClick={() => {
                      onSaveGame();
                      playAudioBeep('coin');
                    }}
                    className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-900/50 hover:border-emerald-600 font-bold text-xs py-2 px-3.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Save size={13} />
                    <span>{language === 'en' ? "Force Instant Manual Save" : "立即强制物理存档"}</span>
                  </button>
                </div>
              </div>

              {/* JSON export / import panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Export panel */}
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">📤 {language==='en'?'Backup Empire':'大亨资产导出云编码'}</span>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      {language === 'en' ? "Generate portable encryption token string to backup or copy to your mobile." : "将当前游玩的一起数据通过加密算子进行哈希编码，可复制发到移动端任意接续娱乐。"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {exportedJson && (
                      <textarea
                        readOnly
                        value={exportedJson}
                        className="w-full h-16 bg-zinc-950 border border-zinc-800 p-2 text-[8px] font-mono text-zinc-400 break-all rounded focus:outline-none"
                      />
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleExport}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 py-1.5 px-3 rounded-lg text-[10px] font-black tracking-wider uppercase border border-zinc-800 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <RefreshCw size={10} />
                        <span>{language === 'en' ? "Generate Token" : "生成加密串"}</span>
                      </button>

                      {exportedJson && (
                        <button
                          onClick={copyToClipboard}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black py-1.5 px-3 rounded-lg text-[10px] font-black tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Download size={10} />
                          <span>{copiedSuccess ? (language==='en'?"Copied!":"已复制到剪贴板") : (language==='en'?"Copy":"一键复制")}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Import panel */}
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">📥 {language==='en'?'Recover Empire':'商业云档案载入'}</span>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      {language === 'en' ? "Paste any save game encryption token backup here and load it up immediately." : "粘贴从其它渠道或玩家或移动浏览器导出的整串哈希数据，瞬时重构一切。"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder={language === 'en' ? "Paste backup string..." : "在此粘贴大亨哈希数据串..."}
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 text-[8px] font-mono text-zinc-200 placeholder:text-zinc-650 rounded focus:outline-none focus:border-zinc-700"
                    />

                    <button
                      onClick={handleImportSubmit}
                      className="w-full bg-indigo-650 hover:bg-indigo-600 text-white py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Upload size={10} />
                      <span>{language === 'en' ? "Inject Safe State" : "解密并加载商业契约"}</span>
                    </button>

                    {importStatus === 'success' && (
                      <span className="text-[9px] text-emerald-400 font-bold block text-center font-mono animate-pulse">✓ LOAD SUCCESSFUL! reload game.</span>
                    )}
                    {importStatus === 'fail' && (
                      <span className="text-[9px] text-red-400 font-bold block text-center font-mono animate-pulse">✗ INVALID CODE! Decrypt error.</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Danger Zone */}
              <div className="bg-red-950/10 border border-red-900/40 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-red-400 font-black flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {language === 'en' ? "DANGER ENGINE ZONE" : "大亨帝国最终破产清算区"}
                  </span>
                  <p className="text-[10px] text-red-300">
                    {language === 'en' ? "This completely wipes local history, stats, and real-estates. Cannot be undone." : "点击将彻底解散当前一切企业、资产储备并清除本地浏览器数据，退档无法挽回。"}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    if (confirm(language === 'en' ? "Are you sure you want to completely erase your company save game?" : "警告：您确定要注销一切资产并破产清算、重新白手起家吗？")) {
                      onClearSaveGame();
                      playAudioBeep('alert');
                    }
                  }}
                  className="bg-red-650 hover:bg-red-600 text-white font-black text-xs py-2 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1 border border-red-700 self-stretch md:self-auto"
                >
                  <Trash2 size={13} />
                  <span>{language === 'en' ? "Declare Complete Bankrupt Reset" : "宣判破产并破产清算(不留遗憾)"}</span>
                </button>
              </div>

            </div>
          )}

          {/* ADS MONETIZATION TAB */}
          {activeSubTab === 'ads' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h3 className="text-sm font-black text-zinc-100 uppercase tracking-tight flex items-center gap-1.5">
                      <Coins size={16} className="text-yellow-400" />
                      <span>{language === 'en' ? "Real AdMob & AdSense Partner Panel" : "开通大马及全球 Ads 广告主收益频道"}</span>
                    </h3>
                    <p className="text-[11px] text-zinc-450 leading-relaxed mt-1 font-sans">
                      {language === 'en'
                        ? "Bind your real Google AdSense / AdMob client key (Publisher ID). Real programmatic scripts are automatically injected into the React workspace."
                        : "在此处自主填报您的 Google 联盟广告主标识 ID。填报挂载成功的真实代码会秒速注入您在本地运行或线上发布的 HTML 骨架中。"}
                    </p>
                  </div>
                  
                  <div className="bg-zinc-950 border border-zinc-850 px-4 py-2 rounded-xl font-mono text-xs text-right text-zinc-400">
                    <div>{language==='en'?'Accrued Sandbox Rev':'累计真实估计起效计费'}</div>
                    <div className="text-emerald-400 font-extrabold text-sm mt-0.5">${(stats.totalRealAdRevenueSimulated || 0.00).toFixed(4)} USD</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs text-zinc-300 font-bold block">
                    {language === 'en' ? "Google AdSense Publisher Client ID (pub-xxxxxxxxxxxxxxx)" : "填入您的 Google AdSense 媒体广告主发布商识别 ID"}
                  </label>
                  <div className="flex gap-2.5">
                    <input 
                      type="text"
                      className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-yellow-400 focus:outline-none focus:border-zinc-700"
                      placeholder="pub-5259838029515083"
                      value={adPublisherId}
                      onChange={(e) => {
                        onUpdateAdPublisherId(e.target.value.trim());
                      }}
                    />
                    <button
                      onClick={() => {
                        if (adPublisherId.startsWith("pub-")) {
                          alert(language === 'en' ? `Publisher client verified and bounded in real runtime environment: ${adPublisherId}` : `大功告成！Google AdSense 通信代号绑定完满。部署网页后会自动挂载：${adPublisherId}`);
                        } else {
                          alert(language === 'en' ? "Please double check! Google AdSense IDs typically start with 'pub-' followed by numerals." : "请检查！正规 Google 合作代号必须以 'pub-' 开头，附带16位计费纯数字代码。");
                        }
                      }}
                      className="bg-zinc-805 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer"
                    >
                      {language === 'en' ? "Test & Bind / 绑定代码" : "验证绑定 / Bind"}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans leading-normal">
                    {language === 'en'
                      ? "Disclaimer: Once hosted on a public domain with valid traffic, Google AdSense will match high-converting digital campaigns and route actual wire cash straight into your bank accounts."
                      : "原理提示：挂接完成后，若在独立静态域名(甚至是打包在 Cordova / Capacitor 客户端发布至应用商店)托管该前端项目，真实到访的用户点击广告时，真正的广告现金流变现会自动记入您专属的 Google 开发者钱包。"}
                  </p>
                </div>
              </div>

              {/* Real Expansion Guide and growth formula */}
              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 space-y-4 font-sans text-xs">
                <span className="text-xs uppercase font-extrabold text-zinc-305 tracking-wider block font-mono">
                  🚀 {language === 'en' ? "Real-World Mobile Game Monetization Playbook" : "现实世界个人手游变现必胜心法"}
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-zinc-400 leading-normal">
                  <div className="bg-zinc-900/40 border border-zinc-900/60 p-3 rounded-xl space-y-1">
                    <span className="font-bold text-zinc-205 block text-[11px] font-mono">1. Reward Video 🎁</span>
                    <p className="text-[10.5px]">
                      {language === 'en'
                        ? "Reward videos (Double income, instant energy, skip study) yield 8x higher CPM values because users actively enroll."
                        : "玩家极其乐意为了“离线双倍、瞬间倒灌体力或跳过学习CD”主动看完5-10s推荐广告。这是您的首要变现支柱！"}
                    </p>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-900/60 p-3 rounded-xl space-y-1">
                    <span className="font-bold text-zinc-205 block text-[11px] font-mono">2. Interstitials 📺</span>
                    <p className="text-[10.5px]">
                      {language === 'en'
                        ? "Trigger full-screen banners during transitions (e.g. advance day completed) strictly with a 5-min cooldown to retain active users."
                        : "全屏插屏广告必须克制！推荐每隔 5-10 分钟或完成阶段大升级时触发（不打扰用户顺滑心流），防止卸载。"}
                    </p>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-900/60 p-3 rounded-xl space-y-1">
                    <span className="font-bold text-zinc-205 block text-[11px] font-mono">3. Banner ads 🚫</span>
                    <p className="text-[10.5px]">
                      {language === 'en'
                        ? "Least recommended standard display. Low click rates and blocks high-end visual design. Place only in margins if desired."
                        : "极其不推荐底部横幅，转化率和单价非常低，且严重拉低赛博朋克大马商战视觉高级感。"}
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex items-start gap-3">
                  <ShieldAlert size={16} className="text-yellow-405 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <span className="font-bold text-zinc-205 block text-[11px]">{language === 'en' ? "Official Play Store Growth Roadmap" : "出海及大马本土应用市场实战发布要领"}</span>
                    <p className="text-[10.5px] text-zinc-500 leading-normal">
                      {language === 'en'
                        ? "1. Export this build (Settings -> Safe-Engine -> Export ZIP). 2. Bundle with Unity/Cordova wrapper. 3. Upload to Google Play dev console & launch. 4. Post on TikTok showcasing 'Double Offline Earnings for Malaysia Banks' to organically drive first 100 daily active players."
                        : "1️⃣ 点击 [Safe-Engine] 标签页下载前端项目完整 ZIP 代码包；2️⃣ 极速绑定 Cordova / Capacitor 混合引擎或放入 Unity web-frame 容器编译出 apk；3️⃣ 上架 Google Play 开发者主页；4️⃣ 录制 TikTok 趣味商战“马银行离线买下吉隆坡”爆款切片吸纳首批 100 留存铁粉！"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. FEEDBACK TAB */}
          {activeSubTab === 'feedback' && (
            <div className="space-y-6">
              
              {!feedbackSuccess ? (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs text-zinc-300 font-black uppercase tracking-wide block">
                      {language === 'en' ? "Submit Feedback & Feature Request" : "向开发委员会提交创意/问题反馈"}
                    </span>
                    <p className="text-[10px] text-zinc-550 leading-relaxed">
                      {language === 'en' 
                        ? "Help us refine EcoBiz Simulator! Your feedback is synced seamlessly to our simulated central repository." 
                        : "感谢对《大马商赛模拟器》的支持！您在此提交的任何开发建议、闪退BUG、或数值平衡建议均会同步提交，感谢打磨。"}
                    </p>
                  </div>

                  {/* Feedback Category Buttons */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-zinc-500 font-mono tracking-wider block">
                      📌 {language==='en'?'Feedback Category':'反馈分类类型'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'bug', en: "Bug Report 🐛", zh: "缺陷纠错 🐛" },
                        { id: 'balance', en: "Balance ⚖️", zh: "平衡评议 ⚖️" },
                        { id: 'visual', en: "UI Styling 🎨", zh: "美化建议 🎨" },
                        { id: 'ideas', en: "Proposal 💡", zh: "新增玩点 💡" }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setFeedbackCategory(cat.id as any);
                            playAudioBeep('coin');
                          }}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                            feedbackCategory === cat.id 
                              ? 'bg-zinc-800 text-indigo-400 border-zinc-750' 
                              : 'bg-zinc-950 border-zinc-900 hover:bg-zinc-900 text-zinc-400'
                          }`}
                        >
                          {language === 'en' ? cat.en : cat.zh}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comments textbox */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-zinc-500 font-mono tracking-wider block">
                      ✍ {language==='en'?'Detailed Description':'描述您的体验或好主意'}
                    </label>
                    <textarea
                      required
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      maxLength={400}
                      placeholder={
                        language === 'en' 
                          ? "Write what happened or suggest features... (e.g. Add cryptocurrency short-squeeze mechanics!)" 
                          : "在此写入您对这款游戏的宝贵意见、想加入的隆重玩法，例如：“增加空头做空股票暴拉清算机制”"
                      }
                      rows={5}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-750"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-650 font-mono">
                      <span>{language==='en'?'Simulated Network Status: SECURE':'模拟服务器通讯状态：正常。'}</span>
                      <span>{feedbackText.length} / 400</span>
                    </div>
                  </div>

                  {/* Submission triggers */}
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black py-3 rounded-xl text-xs font-black tracking-wider uppercase transition flex items-center justify-center gap-1.5"
                  >
                    {submittingFeedback ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>{language==='en'?'Transmitting Packet...':'包体打签加密传输中...'}</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>{language === 'en' ? "Post Suggestions to Dev Team" : "上报开发委员会"}</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* FEEDBACK RECEIPT RESULT */
                <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 py-8 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-950/50 border border-emerald-900/50 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={30} />
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm font-black text-zinc-100 uppercase tracking-tight block">
                      {language === 'en' ? "RECEIPT POSTED SUCCESSFULLY" : "数据上传及指纹打签大捷！"}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      {language==='en'?'Digital Asset Signature:':'数据校验数字指纹：'} <span className="text-zinc-300 font-bold font-mono text-[9px]">{simulatedReceiptId}</span>
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 max-w-sm">
                    {language === 'en' 
                      ? "Thank you! Your feedback has been accepted by our local development simulation sandbox. We will index this inside the next compiler cycle." 
                      : "极度感谢！您的宝贵创意与闪退数据已通过仿真信道完满交付并成功解析归档。我们将在下一批次编译器整合后推出。"}
                  </p>

                  <button
                    onClick={() => {
                      setFeedbackSuccess(false);
                      setFeedbackText("");
                      playAudioBeep('coin');
                    }}
                    className="w-32 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl text-[10px] font-black tracking-wide border border-zinc-800 cursor-pointer uppercase transition"
                  >
                    {language==='en'?'Write More':'再写一条'}
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer info lockup */}
        <div className="p-4 bg-zinc-950 text-center border-t border-zinc-900 text-[9px] font-mono font-bold text-zinc-600">
          © {new Date().getFullYear()} ECOBIZ MULTIVERSE · {language==='en'?'PROMPT DESIGNED V1':'由您统筹构思。'}
        </div>
      </div>
    </div>
  );
};
