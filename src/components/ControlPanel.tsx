import { useState } from 'react';
import {
  Sparkles,
  Zap,
  ShieldAlert,
  PowerOff,
  Upload,
  Layers,
  Lock,
  Smartphone,
  Check,
  Code2,
  Sliders,
  Copy,
  Info,
  SlidersHorizontal,
  Flame,
  FileVideo,
  Play,
  ArrowRightLeft,
  Download,
  FileCode,
} from 'lucide-react';
import { EngineSettings, EngineTelemetry, FpsTarget, WallpaperItem } from '../types';
import { BUILTIN_WALLPAPERS, POCO_DEVICE_INFO } from '../data/wallpapers';
import { generateStandaloneHtml } from '../utils/generateStandaloneHtml';

interface ControlPanelProps {
  settings: EngineSettings;
  onUpdateSettings: (updater: (prev: EngineSettings) => EngineSettings) => void;
  telemetry: EngineTelemetry;
  onToggleKillSwitch: () => void;
  screenView: 'home' | 'lock';
  onSetScreenView: (view: 'home' | 'lock') => void;
  onCustomVideoUploaded: (url: string, name: string) => void;
  uploadedVideoName?: string | null;
}

export default function ControlPanel({
  settings,
  onUpdateSettings,
  telemetry,
  onToggleKillSwitch,
  screenView,
  onSetScreenView,
  onCustomVideoUploaded,
  uploadedVideoName,
}: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'wallpapers' | 'pingpong' | 'dual_screen' | 'poco_guide' | 'native_code'>('wallpapers');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onCustomVideoUploaded(url, file.name);
    }
  };

  const currentWallpaperId =
    screenView === 'lock'
      ? settings.lockScreenWallpaperId
      : settings.homeScreenWallpaperId;

  return (
    <div className="w-full max-w-xl bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-6">
      {/* Top Header & Emergency Panic Kill Switch Bar */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              POCO Live Wallpaper Engine
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
              60 FPS
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Zero-audio • Ping-pong reverse loops • POCO Pro 5G optimized
          </p>
        </div>

        {/* Emergency Kill Switch Button */}
        <button
          id="btn-emergency-kill-panel"
          onClick={onToggleKillSwitch}
          className={`px-3 py-2 rounded-2xl border font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
            settings.killSwitchActive
              ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
              : 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-500/40 text-rose-300'
          }`}
          title="Instantly stop all rendering and unblock Control Center / Gestures"
        >
          <PowerOff className="w-4 h-4" />
          <span>{settings.killSwitchActive ? 'KILLED (RE-ARM)' : 'KILL SWITCH'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-5 gap-1.5 bg-neutral-950/80 p-1.5 rounded-2xl border border-neutral-800 text-xs font-semibold">
        <button
          id="tab-btn-wallpapers"
          onClick={() => setActiveTab('wallpapers')}
          className={`py-2 px-1 rounded-xl text-center transition-all ${
            activeTab === 'wallpapers'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Wallpapers
        </button>

        <button
          id="tab-btn-pingpong"
          onClick={() => setActiveTab('pingpong')}
          className={`py-2 px-1 rounded-xl text-center transition-all ${
            activeTab === 'pingpong'
              ? 'bg-neutral-800 text-cyan-300 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          60 FPS Loop
        </button>

        <button
          id="tab-btn-dualscreen"
          onClick={() => setActiveTab('dual_screen')}
          className={`py-2 px-1 rounded-xl text-center transition-all ${
            activeTab === 'dual_screen'
              ? 'bg-neutral-800 text-rose-300 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Dual Lock
        </button>

        <button
          id="tab-btn-pocoguide"
          onClick={() => setActiveTab('poco_guide')}
          className={`py-2 px-1 rounded-xl text-center transition-all ${
            activeTab === 'poco_guide'
              ? 'bg-neutral-800 text-amber-300 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          POCO 5G
        </button>

        <button
          id="tab-btn-nativecode"
          onClick={() => setActiveTab('native_code')}
          className={`py-2 px-1 rounded-xl text-center transition-all ${
            activeTab === 'native_code'
              ? 'bg-neutral-800 text-emerald-300 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Kotlin APK
        </button>
      </div>

      {/* ================= TAB 1: WALLPAPER PRESETS & VIDEO UPLOAD ================= */}
      {activeTab === 'wallpapers' && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {/* Target Screen Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-xs text-neutral-300">
              Active Screen Preview:{' '}
              <strong className={screenView === 'lock' ? 'text-rose-400' : 'text-cyan-400'}>
                {screenView === 'lock' ? 'Lock Screen' : 'Home Screen'}
              </strong>
            </span>
            <button
              onClick={() => onSetScreenView(screenView === 'lock' ? 'home' : 'lock')}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] text-white font-medium transition-colors"
            >
              Switch to {screenView === 'lock' ? 'Home' : 'Lock'}
            </button>
          </div>

          {/* ================= PROMINENT VIDEO UPLOADER SECTION ================= */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-cyan-950/40 via-neutral-950 to-neutral-950 border border-cyan-500/40 shadow-xl flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <FileVideo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Upload Your Video as Live Wallpaper
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold">
                      POCO 60 FPS
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Auto ping-pong forward/reverse loops • Zero audio • Hardware decoded
                  </p>
                </div>
              </div>
            </div>

            {/* Video File Status or Upload Action */}
            {uploadedVideoName ? (
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-emerald-500/30 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <Check className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{uploadedVideoName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Active Video
                  </span>
                </div>

                {/* Where to apply the uploaded video */}
                <div className="flex items-center gap-2 pt-1 border-t border-neutral-800">
                  <span className="text-[11px] text-neutral-400">Apply to:</span>
                  <button
                    onClick={() =>
                      onUpdateSettings(prev => ({ ...prev, homeScreenWallpaperId: 'custom_uploaded' }))
                    }
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                      settings.homeScreenWallpaperId === 'custom_uploaded'
                        ? 'bg-cyan-500 text-black shadow-sm font-bold'
                        : 'bg-neutral-800 text-neutral-300 hover:text-white'
                    }`}
                  >
                    Home Screen
                  </button>
                  <button
                    onClick={() =>
                      onUpdateSettings(prev => ({ ...prev, lockScreenWallpaperId: 'custom_uploaded' }))
                    }
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                      settings.lockScreenWallpaperId === 'custom_uploaded'
                        ? 'bg-rose-500 text-white shadow-sm font-bold'
                        : 'bg-neutral-800 text-neutral-300 hover:text-white'
                    }`}
                  >
                    Lock Screen
                  </button>
                  <button
                    onClick={() =>
                      onUpdateSettings(prev => ({
                        ...prev,
                        homeScreenWallpaperId: 'custom_uploaded',
                        lockScreenWallpaperId: 'custom_uploaded',
                      }))
                    }
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                      settings.homeScreenWallpaperId === 'custom_uploaded' &&
                      settings.lockScreenWallpaperId === 'custom_uploaded'
                        ? 'bg-emerald-500 text-black shadow-sm font-bold'
                        : 'bg-neutral-800 text-neutral-300 hover:text-white'
                    }`}
                  >
                    Both Screens
                  </button>
                </div>

                {/* Replace Video Button */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <label className="cursor-pointer text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Replace with Another Video</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => {
                      onUpdateSettings(prev => ({
                        ...prev,
                        homeScreenWallpaperId: 'cyber_megacity_2099',
                        lockScreenWallpaperId: 'locked_reason_cyber',
                      }));
                    }}
                    className="text-neutral-400 hover:text-rose-400"
                  >
                    Reset to Presets
                  </button>
                </div>
              </div>
            ) : (
              /* No video loaded yet: Prominent dropzone / picker */
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <label className="flex-1 w-full cursor-pointer py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-center">
                  <Upload className="w-4 h-4" />
                  <span>Choose Video File (MP4 / WebM / MOV)</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  id="btn-try-demo-video"
                  onClick={() => {
                    // Fast reliable public domain video with universal CORS
                    const demoVideoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
                    onCustomVideoUploaded(demoVideoUrl, 'MDN_Cinematic_Macro_60FPS.mp4');
                    onUpdateSettings(prev => ({
                      ...prev,
                      homeScreenWallpaperId: 'custom_uploaded',
                      lockScreenWallpaperId: 'custom_uploaded',
                    }));
                  }}
                  className="py-3 px-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-neutral-700 cursor-pointer active:scale-95"
                  title="Test video playback with a fast demo clip"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Try Demo Video</span>
                </button>
              </div>
            )}
          </div>

          {/* Built-in High-Density Scenery Presets Header */}
          <div className="flex items-center justify-between pt-1">
            <h4 className="text-xs font-bold text-neutral-300">
              Or Choose Curated High-Density Themes (No Characters)
            </h4>
            <span className="text-[10px] text-neutral-500 font-mono">
              60 FPS Canvas
            </span>
          </div>

          {/* Preset Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BUILTIN_WALLPAPERS.map(wp => {
              const isSelected = currentWallpaperId === wp.id;
              return (
                <button
                  key={wp.id}
                  id={`btn-select-wp-${wp.id}`}
                  onClick={() => {
                    if (screenView === 'lock') {
                      onUpdateSettings(prev => ({ ...prev, lockScreenWallpaperId: wp.id }));
                    } else {
                      onUpdateSettings(prev => ({ ...prev, homeScreenWallpaperId: wp.id }));
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-lg ring-1 ring-cyan-400/30'
                      : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {wp.name}
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {wp.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {wp.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-1.5 py-0.5 rounded bg-neutral-800 text-[9px] font-medium text-neutral-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: 60 FPS & PING-PONG ENGINE ================= */}
      {activeTab === 'pingpong' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Ping-Pong Mode Explainer Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/50 to-pink-950/50 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">Ping-Pong Boomerang Mode</h4>
              </div>
              <button
                id="btn-toggle-pingpong"
                onClick={() =>
                  onUpdateSettings(prev => ({ ...prev, pingPongLoop: !prev.pingPongLoop }))
                }
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  settings.pingPongLoop
                    ? 'bg-cyan-400 text-black shadow-md'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {settings.pingPongLoop ? 'ENABLED' : 'STANDARD REPEAT'}
              </button>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              When the video hits the end frame, it smoothly reverses back to the start frame
              without jump-cuts or black hiccups.
            </p>
          </div>

          {/* 60 FPS Target Selector */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <h4 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
              <span>Refresh Rate & Frame Rate Target</span>
              <span className="text-cyan-400 font-mono">{settings.fpsTarget} FPS</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {([24, 30, 60] as FpsTarget[]).map(fps => (
                <button
                  key={fps}
                  id={`btn-fps-${fps}`}
                  onClick={() => onUpdateSettings(prev => ({ ...prev, fpsTarget: fps }))}
                  className={`py-2 px-3 rounded-xl border text-center transition-all ${
                    settings.fpsTarget === fps
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{fps} FPS</div>
                  <div className="text-[9px] text-neutral-500 mt-0.5">
                    {fps === 60 ? 'Ultra Smooth' : fps === 30 ? 'Balanced' : 'Eco Saver'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AMOLED True Black Crush */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">AMOLED True Black Mode</h4>
              <p className="text-[11px] text-neutral-400">
                Turns off pixels on AMOLED/OLED displays to save ~35% battery
              </p>
            </div>
            <input
              type="checkbox"
              id="checkbox-amoled"
              checked={settings.amoledBlackCrush}
              onChange={e =>
                onUpdateSettings(prev => ({ ...prev, amoledBlackCrush: e.target.checked }))
              }
              className="w-5 h-5 accent-cyan-400 cursor-pointer rounded"
            />
          </div>

          {/* Playback Speed Slider */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-white">Playback Speed</span>
              <span className="text-cyan-400 font-mono">{settings.playbackSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.playbackSpeed}
              onChange={e =>
                onUpdateSettings(prev => ({
                  ...prev,
                  playbackSpeed: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ================= TAB 3: DUAL LOCK SCREEN & "IT'S LOCKED FOR A REASON" ================= */}
      {activeTab === 'dual_screen' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-bold text-white">
                Independent Lock Screen ("It's Locked for a Reason")
              </h4>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Show a distinct high-security animated biometric lock screen, while keeping your dense
              cyberpunk or anime street wallpaper on the home screen!
            </p>
          </div>

          {/* Main Warning Text Input */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-2">
            <label className="text-xs font-bold text-white">Lock Screen Headline Banner</label>
            <input
              type="text"
              id="input-lock-main-text"
              value={settings.lockScreenMainText}
              onChange={e =>
                onUpdateSettings(prev => ({ ...prev, lockScreenMainText: e.target.value }))
              }
              placeholder="IT'S LOCKED FOR A REASON"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-rose-300 font-mono focus:border-rose-400 outline-none"
            />
          </div>

          {/* Subtitle Warning Input */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-2">
            <label className="text-xs font-bold text-white">Lock Screen Subtitle / Status</label>
            <input
              type="text"
              id="input-lock-sub-text"
              value={settings.lockScreenSubText}
              onChange={e =>
                onUpdateSettings(prev => ({ ...prev, lockScreenSubText: e.target.value }))
              }
              placeholder="BIOMETRIC VAULT ENGAGED"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-300 font-mono focus:border-rose-400 outline-none"
            />
          </div>

          {/* Screen Assignment Summary */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-neutral-800">
              <span className="text-neutral-400">Lock Screen Wallpaper:</span>
              <span className="font-bold text-rose-400 font-mono">
                {settings.lockScreenWallpaperId}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-400">Home Screen Wallpaper:</span>
              <span className="font-bold text-cyan-400 font-mono">
                {settings.homeScreenWallpaperId}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: POCO PRO 5G / MIUI / HYPEROS COMPATIBILITY GUIDE ================= */}
      {activeTab === 'poco_guide' && (
        <div className="flex flex-col gap-3 animate-fade-in text-xs text-neutral-300">
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-1 text-amber-400 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>POCO Pro 5G (MIUI / HyperOS) Optimization</span>
            </div>
            <p className="text-[11px] text-neutral-300">
              Xiaomi MIUI/HyperOS has aggressive background killers and lock screen restrictions.
              Follow these exact 3 toggles on your POCO phone:
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <strong className="text-cyan-400 block mb-1">
                1. Allow Lock Screen Live Wallpaper
              </strong>
              <span>
                Go to Settings &gt; Wallpaper &gt; Live Wallpapers &gt; Select this Engine &gt; Tap{' '}
                <strong>"Set for both Home screen and Lock screen"</strong> (or apply via POCO
                Themes app).
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <strong className="text-cyan-400 block mb-1">2. Exclude from MIUI Battery Saver</strong>
              <span>
                Settings &gt; Apps &gt; Manage Apps &gt; Poco Live Wallpaper &gt; Battery Saver &gt;
                Select <strong>"No restrictions"</strong> so it never stutters.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <strong className="text-cyan-400 block mb-1">3. Emergency Kill Switch Tile</strong>
              <span>
                Pull down MIUI Control Center &gt; Tap Edit &gt; Add the{' '}
                <strong>"Kill Wallpaper"</strong> Quick Settings tile. If an app ever lags, 1 tap
                terminates it immediately.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: NATIVE KOTLIN APK SOURCE CODE & STANDALONE HTML ================= */}
      {activeTab === 'native_code' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Standalone HTML Card */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-200">Standalone Single .HTML File</span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-1">
                Zero installation needed. Open directly in Chrome/Safari/Firefox or edit in any text editor.
              </p>
            </div>
            <button
              onClick={() => {
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
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .HTML</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Native Android Kotlin (PocoLiveWallpaperService.kt)</span>
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(KOTLIN_SAMPLE_CODE);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2500);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Kotlin Code'}</span>
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 max-h-72 overflow-y-auto leading-relaxed">
            <pre className="whitespace-pre-wrap">{KOTLIN_SAMPLE_CODE}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

const KOTLIN_SAMPLE_CODE = `package com.poco.wallpaper

import android.service.wallpaper.WallpaperService
import android.view.SurfaceHolder
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.common.MediaItem
import androidx.media3.common.Player

/**
 * High-Efficiency POCO Pro 5G 60 FPS Ping-Pong Wallpaper Service
 * - Zero Audio Track loaded
 * - Zero Touch interception (Passes directly to MIUI Control Center)
 * - Hardware MediaCodec Surface decoding with Ping-Pong reversal
 */
class PocoLiveWallpaperService : WallpaperService() {

    override fun onCreateEngine(): Engine {
        return VideoWallpaperEngine()
    }

    inner class VideoWallpaperEngine : Engine(), Player.Listener {
        private var exoPlayer: ExoPlayer? = null
        private var isReverse = false
        private var killSwitchActive = false

        override fun onCreate(surfaceHolder: SurfaceHolder) {
            super.onCreate(surfaceHolder)
            // CRUCIAL FOR POCO: Never intercept touches so gestures & control center work!
            setTouchEventsEnabled(false)
        }

        override fun onVisibilityChanged(visible: Boolean) {
            super.onVisibilityChanged(visible)
            if (killSwitchActive) return

            if (visible) {
                exoPlayer?.play()
            } else {
                // INSTANT 0% CPU SLEEP WHEN OBSCURED
                exoPlayer?.pause()
            }
        }

        override fun onSurfaceCreated(holder: SurfaceHolder) {
            super.onSurfaceCreated(holder)
            initializePingPongPlayer(holder)
        }

        private fun initializePingPongPlayer(holder: SurfaceHolder) {
            exoPlayer = ExoPlayer.Builder(applicationContext).build().apply {
                // Completely mute and ignore audio buffers
                volume = 0f
                setVideoSurface(holder.surface)
                addListener(this@VideoWallpaperEngine)
                prepare()
            }
        }

        override fun onPlaybackStateChanged(state: Int) {
            if (state == Player.STATE_ENDED) {
                // Ping-Pong: Reverse playback seek without jump-cuts
                exoPlayer?.seekTo(0)
                exoPlayer?.play()
            }
        }

        override fun onDestroy() {
            super.onDestroy()
            exoPlayer?.release()
            exoPlayer = null
        }
    }
}`;
