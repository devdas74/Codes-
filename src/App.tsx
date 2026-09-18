import { useState } from 'react';
import {
  Sparkles,
  Smartphone,
  Zap,
  PowerOff,
  ShieldAlert,
  ArrowRightLeft,
  Sliders,
  CheckCircle2,
  Lock,
  Unlock,
  Upload,
  Download,
  FileCode,
} from 'lucide-react';
import { EngineSettings, EngineTelemetry } from './types';
import PhoneSimulator from './components/PhoneSimulator';
import ControlPanel from './components/ControlPanel';
import { generateStandaloneHtml } from './utils/generateStandaloneHtml';

export default function App() {
  // Master Engine Settings
  const [settings, setSettings] = useState<EngineSettings>({
    fpsTarget: 60,
    pingPongLoop: true, // Reverse upon end
    playbackSpeed: 1.0,
    trimStartSec: 0,
    trimEndSec: 10,
    amoledBlackCrush: false,
    brightness: 100,
    contrast: 105,
    saturation: 110,
    
    // Default dual wallpapers
    lockScreenWallpaperId: 'locked_reason_cyber',
    homeScreenWallpaperId: 'cyber_megacity_2099',
    
    // "It's locked for a reason" customizations
    lockScreenMainText: "IT'S LOCKED FOR A REASON",
    lockScreenSubText: 'BIOMETRIC VAULT ENGAGED',
    lockScreenBadge: 'biometric',
    lockScreenGlitchEffect: true,

    // Safety
    killSwitchActive: false,
    zeroTouchPassThrough: true,
    audioIgnored: true,
  });

  // Live Performance & Ping-Pong Telemetry
  const [telemetry, setTelemetry] = useState<EngineTelemetry>({
    currentFps: 60,
    frameTimeMs: 16.6,
    direction: 'forward',
    progress: 0,
    loopCount: 0,
    batteryDrainPerHour: 3.4,
    decoderMemoryMb: 24,
    isObscured: false,
  });

  // Current view on phone (Lock Screen vs Home Screen)
  const [screenView, setScreenView] = useState<'home' | 'lock'>('home');

  // Custom uploaded video state
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);

  // Kill Switch Toggle
  const handleToggleKillSwitch = () => {
    setSettings(prev => ({
      ...prev,
      killSwitchActive: !prev.killSwitchActive,
    }));
  };

  const handleCustomVideoUploaded = (url: string, name: string) => {
    setUploadedVideoUrl(url);
    setUploadedVideoName(name);
    setSettings(prev => ({
      ...prev,
      homeScreenWallpaperId: 'custom_uploaded',
      lockScreenWallpaperId: 'custom_uploaded',
    }));
  };

  const handleDownloadStandaloneHtml = () => {
    const htmlContent = generateStandaloneHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'poco_live_wallpaper_standalone.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="app-root"
      className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200"
    >
      {/* Top App Header */}
      <header className="w-full border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">
                POCO Pro 5G Live Wallpaper Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold">
                60 FPS
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Ping-pong forward/reverse loops • Zero audio • Movable floating HUD & kill switch
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          {/* Download Standalone Single-file HTML */}
          <button
            id="btn-download-standalone-html"
            onClick={handleDownloadStandaloneHtml}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Download complete standalone single-file HTML (Open directly in any browser, edit in any code/text editor)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download .HTML</span>
          </button>
          {/* Direct Header Video Upload */}
          <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload Video</span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  handleCustomVideoUploaded(url, file.name);
                }
              }}
              className="hidden"
            />
          </label>

          {/* Active Screen Mode Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
            {screenView === 'lock' ? (
              <span className="text-rose-400 flex items-center gap-1 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Screen Active</span>
              </span>
            ) : (
              <span className="text-cyan-400 flex items-center gap-1 font-semibold">
                <Unlock className="w-3.5 h-3.5" />
                <span>Home Screen Active</span>
              </span>
            )}
          </div>

          {/* Master Emergency Kill Switch */}
          <button
            id="header-btn-kill-switch"
            onClick={handleToggleKillSwitch}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              settings.killSwitchActive
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse ring-2 ring-rose-500/40'
                : 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-500/40 text-rose-300'
            }`}
            title="Emergency Kill Switch: Instantly terminates rendering to guarantee free gestures & control center"
          >
            <PowerOff className="w-3.5 h-3.5" />
            <span>{settings.killSwitchActive ? 'ENGINE KILLED' : 'KILL SWITCH'}</span>
          </button>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12">
        {/* Left Side: POCO Pro 5G Interactive Simulator Frame */}
        <div className="flex flex-col items-center">
          <PhoneSimulator
            settings={settings}
            telemetry={telemetry}
            onUpdateTelemetry={setTelemetry}
            onToggleKillSwitch={handleToggleKillSwitch}
            screenView={screenView}
            onSetScreenView={setScreenView}
            uploadedVideoUrl={uploadedVideoUrl}
            uploadedVideoName={uploadedVideoName}
            onCustomVideoUploaded={handleCustomVideoUploaded}
          />
        </div>

        {/* Right Side: Comprehensive Engine Control Panel */}
        <div className="w-full max-w-xl flex flex-col items-center">
          <ControlPanel
            settings={settings}
            onUpdateSettings={setSettings}
            telemetry={telemetry}
            onToggleKillSwitch={handleToggleKillSwitch}
            screenView={screenView}
            onSetScreenView={setScreenView}
            onCustomVideoUploaded={handleCustomVideoUploaded}
            uploadedVideoName={uploadedVideoName}
          />
        </div>
      </main>

      {/* Footer Info & Safety Guarantee */}
      <footer className="w-full border-t border-neutral-800/60 py-4 px-6 text-center text-[11px] text-neutral-500 font-mono flex flex-wrap items-center justify-center gap-6">
        <span>Display: 60 FPS AMOLED Engine</span>
        <span>•</span>
        <span>Movable HUD: Integrated Panic Kill Switch on Right Edge</span>
        <span>•</span>
        <span>Audio Track: STRIPPED (0 KB Memory)</span>
        <span>•</span>
        <span>Touch Interception: 0% (Pass-through to Control Center)</span>
        <span>•</span>
        <span>Loop Mode: Ping-Pong Reverse (No Jump Cut)</span>
      </footer>
    </div>
  );
}
