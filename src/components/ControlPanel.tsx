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
  screenView?: 'home';
  onSetScreenView?: (view: 'home') => void;
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
  const [activeTab, setActiveTab] = useState<'wallpapers' | 'engine' | 'poco_guide' | 'native_code'>('wallpapers');
  const [copiedCode, setCopiedCode] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [durationNotice, setDurationNotice] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      
      // Load video metadata to measure duration and enforce 30s maximum limit
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        const rawDuration = tempVideo.duration || 0;
        setVideoDuration(rawDuration);
        
        if (rawDuration > 30.0) {
          setDurationNotice(`Video is ${rawDuration.toFixed(1)}s long. Length limit is 30s — automatically capped to the first 30 seconds.`);
          onUpdateSettings(prev => ({
            ...prev,
            trimStartSec: 0,
            trimEndSec: 30,
            homeScreenWallpaperId: 'custom_uploaded',
          }));
        } else {
          setDurationNotice(null);
          onUpdateSettings(prev => ({
            ...prev,
            trimStartSec: 0,
            trimEndSec: Math.min(rawDuration, 30),
            homeScreenWallpaperId: 'custom_uploaded',
          }));
        }
      };

      onCustomVideoUploaded(url, file.name);
    }
  };

  const currentWallpaperId = settings.homeScreenWallpaperId;

  return (
    <div className="w-full max-w-xl bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-6">
      {/* Top Header & Emergency Panic Kill Switch Bar */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              POCO Home Live Wallpaper Engine
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
              {settings.fpsTarget} FPS
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Dedicated Home Screen • Zero-audio • Hardware decoded • Continuous 90Hz loop
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
      <div className="grid grid-cols-4 gap-1.5 bg-neutral-950/80 p-1.5 rounded-2xl border border-neutral-800 text-xs font-semibold">
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
          id="tab-btn-engine"
          onClick={() => setActiveTab('engine')}
          className={`py-2 px-1 rounded-xl text-center transition-all ${
            activeTab === 'engine'
              ? 'bg-neutral-800 text-cyan-300 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          {settings.fpsTarget} FPS Engine
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
          POCO Guide
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
          {/* Active Home Screen Info Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-xs text-neutral-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Target: <strong className="text-cyan-400">POCO Home Screen Live Wallpaper</strong></span>
            </span>
            <span className="text-[10px] font-mono text-neutral-500">Lock screen removed</span>
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
                    Upload Your Video as Home Live Wallpaper
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold">
                      MAX 30s LIMIT
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Continuous hardware loop • Max length: <strong className="text-cyan-300">30 seconds</strong> • Zero audio • Hardware decoded
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
                  <div className="flex items-center gap-1.5">
                    {videoDuration && (
                      <span className="text-[9px] font-mono text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-700">
                        {Math.min(videoDuration, 30).toFixed(1)}s / 30s
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      Active Home Wallpaper
                    </span>
                  </div>
                </div>

                {/* Duration Cap Notice if > 30s */}
                {durationNotice && (
                  <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>{durationNotice}</span>
                  </div>
                )}

                {/* Video Trimmer Controls (0 to 30s) */}
                <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-300 font-medium">Loop Trim Range (Max 30s):</span>
                    <span className="font-mono text-[10px] text-cyan-300 font-bold">
                      {settings.trimStartSec.toFixed(1)}s → {Math.min(settings.trimEndSec || 30, 30).toFixed(1)}s ({((Math.min(settings.trimEndSec || 30, 30)) - settings.trimStartSec).toFixed(1)}s duration)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[9px] text-neutral-400 mb-0.5">Start Trim: {settings.trimStartSec}s</div>
                      <input
                        type="range"
                        min="0"
                        max={Math.max(0, Math.min(settings.trimEndSec || 30, 30) - 1)}
                        step="0.5"
                        value={settings.trimStartSec}
                        onChange={e =>
                          onUpdateSettings(prev => ({
                            ...prev,
                            trimStartSec: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                      />
                    </div>
                    <div>
                      <div className="text-[9px] text-neutral-400 mb-0.5">End Trim: {Math.min(settings.trimEndSec || 30, 30)}s</div>
                      <input
                        type="range"
                        min={settings.trimStartSec + 1}
                        max="30"
                        step="0.5"
                        value={Math.min(settings.trimEndSec || 30, 30)}
                        onChange={e =>
                          onUpdateSettings(prev => ({
                            ...prev,
                            trimEndSec: Math.min(parseFloat(e.target.value), 30),
                          }))
                        }
                        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Replace Video Button */}
                <div className="flex items-center justify-between pt-1 text-[11px] border-t border-neutral-800">
                  <label className="cursor-pointer text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Replace with Another Video (Max 30s)</span>
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
                  <span>Choose Video File (MP4 / WebM / MOV • Max 30s)</span>
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
                    setVideoDuration(5.0);
                    setDurationNotice(null);
                    onCustomVideoUploaded(demoVideoUrl, 'MDN_Cinematic_Macro_60FPS.mp4');
                    onUpdateSettings(prev => ({
                      ...prev,
                      homeScreenWallpaperId: 'custom_uploaded',
                      trimStartSec: 0,
                      trimEndSec: 5,
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
            {BUILTIN_WALLPAPERS.filter(wp => wp.category !== 'lock_screen').map(wp => {
              const isSelected = currentWallpaperId === wp.id;
              return (
                <button
                  key={wp.id}
                  id={`btn-select-wp-${wp.id}`}
                  onClick={() => {
                    onUpdateSettings(prev => ({ ...prev, homeScreenWallpaperId: wp.id }));
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

      {/* ================= TAB 2: 60 FPS HARDWARE ENGINE ================= */}
      {activeTab === 'engine' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Refresh Rate & FPS Target Selector (30, 45, 60, 90 FPS) */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <h4 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
              <span>Refresh Rate & Base Target</span>
              <span className="text-cyan-400 font-mono font-bold">{settings.fpsTarget} FPS ({settings.fpsTarget === 90 ? '90Hz High-Refresh' : settings.fpsTarget === 60 ? '60Hz Smooth' : settings.fpsTarget === 45 ? '45Hz Balanced' : '30Hz Eco'})</span>
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {([30, 45, 60, 90] as FpsTarget[]).map(fps => (
                <button
                  key={fps}
                  id={`btn-fps-${fps}`}
                  onClick={() => onUpdateSettings(prev => ({ ...prev, fpsTarget: fps }))}
                  className={`py-2 px-2 rounded-xl border text-center transition-all ${
                    settings.fpsTarget === fps
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{fps} FPS</div>
                  <div className="text-[9px] text-neutral-500 mt-0.5 font-mono">
                    {fps === 90
                      ? '90Hz Ultra'
                      : fps === 60
                      ? '60Hz Smooth'
                      : fps === 45
                      ? '45Hz Mid'
                      : '30Hz Eco'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ================= AUTOMATIC ADAPTIVE FPS (SYSTEM LOAD GOVERNOR) ================= */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-cyan-500/30 shadow-inner flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${settings.autoFpsMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-neutral-800 text-neutral-500'}`}>
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Dynamic Adaptive Refresh (Auto FPS)</span>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono">
                      {settings.autoFpsMode ? 'ACTIVE' : 'OFF'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Automatically reduces wallpaper frame rate when the phone is under heavy CPU/GPU load, gaming, or thermal throttling.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                id="checkbox-auto-fps"
                checked={settings.autoFpsMode}
                onChange={e =>
                  onUpdateSettings(prev => ({ ...prev, autoFpsMode: e.target.checked }))
                }
                className="w-5 h-5 accent-cyan-400 cursor-pointer rounded ml-2 flex-shrink-0"
              />
            </div>

            {/* Simulated Load Tester */}
            <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-300 font-medium flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Test System Load Response:</span>
                </span>
                <span className="font-mono text-[10px] text-cyan-300 font-bold">
                  Effective Cap: {telemetry.effectiveFpsCap} FPS ({telemetry.systemLoadStatus})
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                {[
                  { id: 'normal', label: 'Nominal', desc: 'Base Target' },
                  { id: 'moderate', label: 'Mod Load', desc: 'Downscale 1x' },
                  { id: 'heavy', label: 'Heavy Load', desc: 'Downscale 2x' },
                  { id: 'overheat', label: 'Thermal', desc: 'Lock 30 FPS' },
                ].map(load => (
                  <button
                    key={load.id}
                    id={`btn-load-${load.id}`}
                    onClick={() =>
                      onUpdateSettings(prev => ({
                        ...prev,
                        simulatedSystemLoad: load.id as any,
                      }))
                    }
                    className={`py-1.5 px-1 rounded-lg border text-center transition-all ${
                      settings.simulatedSystemLoad === load.id
                        ? load.id === 'overheat'
                          ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                          : load.id === 'heavy'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold">{load.label}</div>
                    <div className="text-[8px] opacity-70 font-mono">{load.desc}</div>
                  </button>
                ))}
              </div>
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

          {/* Display Color Grading */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>AMOLED Display Tuning</span>
            </h4>

            {/* Brightness */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                <span>Brightness</span>
                <span className="font-mono text-neutral-200">{settings.brightness}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="130"
                value={settings.brightness}
                onChange={e =>
                  onUpdateSettings(prev => ({ ...prev, brightness: parseInt(e.target.value) }))
                }
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                <span>Contrast</span>
                <span className="font-mono text-neutral-200">{settings.contrast}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="140"
                value={settings.contrast}
                onChange={e =>
                  onUpdateSettings(prev => ({ ...prev, contrast: parseInt(e.target.value) }))
                }
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                <span>Vibrance / Saturation</span>
                <span className="font-mono text-neutral-200">{settings.saturation}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="150"
                value={settings.saturation}
                onChange={e =>
                  onUpdateSettings(prev => ({ ...prev, saturation: parseInt(e.target.value) }))
                }
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: POCO PRO 5G / MIUI / HYPEROS COMPATIBILITY GUIDE ================= */}
      {activeTab === 'poco_guide' && (
        <div className="flex flex-col gap-3 animate-fade-in text-xs text-neutral-300">
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40">
            <div className="flex items-center gap-2 mb-1 text-cyan-400 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>No PC Needed! 3 Ways to Set Live Video Wallpapers on POCO</span>
            </div>
            <p className="text-[11px] text-neutral-300">
              POCO (HyperOS &amp; MIUI) has built-in 60–90 FPS hardware live wallpaper engines right on your phone without needing a computer:
            </p>
          </div>

          <div className="space-y-2.5">
            {/* Method 1: Built-in POCO Gallery (Direct & Instant) */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-1">
                <strong className="text-emerald-400 flex items-center gap-1.5 font-bold">
                  <span>Method 1: Built-in POCO Gallery (Fastest • No App Needed)</span>
                </strong>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] font-mono font-bold">
                  Recommended
                </span>
              </div>
              <ol className="text-[11px] text-neutral-300 space-y-1 list-decimal list-inside leading-relaxed mt-1.5">
                <li>Open the built-in <strong>Gallery</strong> app on your POCO phone.</li>
                <li>Tap on your video (max 30 seconds).</li>
                <li>Tap the <strong>More (3 dots •••)</strong> menu at the bottom right corner.</li>
                <li>Select <strong>"Set video wallpaper"</strong>.</li>
                <li>Turn sound off (sound icon on top) and tap <strong>"Apply" &gt; "Set for Home screen"</strong>.</li>
              </ol>
            </div>

            {/* Method 2: Free Google Play Store Wallpaper Engines */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-cyan-500/30">
              <strong className="text-cyan-400 block mb-1 font-bold">
                Method 2: Install a Live Wallpaper Engine from Google Play Store
              </strong>
              <p className="text-[11px] text-neutral-300 mb-1.5">
                If you want advanced loop controls, trim sliders, and 90Hz hardware scaling directly on your phone:
              </p>
              <ol className="text-[11px] text-neutral-300 space-y-1 list-decimal list-inside leading-relaxed">
                <li>Open <strong>Google Play Store</strong> on your POCO device.</li>
                <li>Search for <strong>"Video Live Wallpaper"</strong> (by NAING GROUP) or <strong>"Wallpaper Engine"</strong>.</li>
                <li>Open the app, pick your video file from your phone storage, and tap <strong>Set as Wallpaper</strong>.</li>
              </ol>
            </div>

            {/* Method 3: PWA / Standalone HTML Directly on Mobile Chrome */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
              <strong className="text-amber-400 block mb-1 font-bold">
                Method 3: Direct Web App / Standalone HTML (Phone Browser)
              </strong>
              <ol className="text-[11px] text-neutral-300 space-y-1 list-decimal list-inside leading-relaxed">
                <li>In <strong>Kotlin APK</strong> tab, tap <strong>"Download .HTML"</strong> right on your phone.</li>
                <li>Open the downloaded HTML in <strong>Chrome</strong> on your POCO device.</li>
                <li>Tap Chrome menu (⋮) &gt; <strong>"Add to Home screen" / "Install App"</strong> to run as a fullscreen live interactive wallpaper engine!</li>
              </ol>
            </div>

            {/* MIUI Battery Optimization Tip */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px]">
              <strong className="text-neutral-200 block mb-0.5">POCO Battery &amp; Smoothness Tip:</strong>
              <span className="text-neutral-400">
                In Settings &gt; Apps &gt; Manage Apps &gt; Set Battery Saver to <strong>"No restrictions"</strong> for seamless 90 FPS performance without throttling.
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

          {/* Native Android Project Files & Tabs */}
          <div className="flex flex-col gap-3">
            {/* 100% Clean Ad-Free Installation Guide */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
              <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-bold">
                <Check className="w-4 h-4" />
                <span>📱 100% Clean &amp; Ad-Free Installation on Your POCO Phone</span>
              </div>
              <p className="text-[11px] text-neutral-300 mb-2 leading-relaxed">
                Do not use third-party tools like AppsGeyser as they inject unwanted advertising banners. Instead, install this clean, ad-free standalone app directly on your phone:
              </p>
              <ol className="text-[11px] text-neutral-300 space-y-1.5 list-decimal list-inside leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <li>Tap the green <strong className="text-emerald-400">"Install App (0 Ads)"</strong> button at the top of your screen, OR tap Chrome menu (<strong>⋮</strong>).</li>
                <li>Tap <strong>"Install app"</strong> / <strong>"Add to Home screen"</strong>.</li>
                <li>Open the newly added <strong>POCO Engine</strong> app icon from your home screen — it runs in 100% fullscreen, 60–90 FPS hardware mode with <strong>zero ads and zero subscriptions</strong>.</li>
              </ol>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
              <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Native Android Studio Project Code (Optional For Devs)</span>
              </h4>
              <p className="text-[11px] text-neutral-400 mb-2">
                If you ever want to compile raw Kotlin/Java bytecode manually in Android Studio:
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>1. PocoLiveWallpaperService.kt</span>
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
                <span>{copiedCode ? 'Copied!' : 'Copy Kotlin'}</span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 max-h-56 overflow-y-auto leading-relaxed">
              <pre className="whitespace-pre-wrap">{KOTLIN_SAMPLE_CODE}</pre>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>2. AndroidManifest.xml</span>
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(ANDROID_MANIFEST_CODE);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2500);
                }}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Manifest</span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 max-h-40 overflow-y-auto leading-relaxed">
              <pre className="whitespace-pre-wrap">{ANDROID_MANIFEST_CODE}</pre>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>3. res/xml/wallpaper.xml</span>
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(WALLPAPER_XML_CODE);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2500);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>Copy XML</span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 max-h-28 overflow-y-auto leading-relaxed">
              <pre className="whitespace-pre-wrap">{WALLPAPER_XML_CODE}</pre>
            </div>
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
 * High-Efficiency POCO Pro 5G Live Wallpaper Service (60-90 FPS)
 * - Zero Audio Track loaded
 * - Zero Touch interception (Passes directly to MIUI Control Center)
 * - Hardware MediaCodec Surface decoding with seamless continuous loop
 */
class PocoLiveWallpaperService : WallpaperService() {

    override fun onCreateEngine(): Engine {
        return VideoWallpaperEngine()
    }

    inner class VideoWallpaperEngine : Engine(), Player.Listener {
        private var exoPlayer: ExoPlayer? = null
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
            initializeVideoPlayer(holder)
        }

        private fun initializeVideoPlayer(holder: SurfaceHolder) {
            exoPlayer = ExoPlayer.Builder(applicationContext).build().apply {
                // Completely mute and ignore audio buffers
                volume = 0f
                repeatMode = Player.REPEAT_MODE_ALL
                setVideoSurface(holder.surface)
                addListener(this@VideoWallpaperEngine)
                prepare()
            }
        }

        override fun onPlaybackStateChanged(state: Int) {
            if (state == Player.STATE_ENDED) {
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

const ANDROID_MANIFEST_CODE = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.poco.wallpaper">

    <uses-feature
        android:name="android.software.live_wallpaper"
        android:required="true" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="POCO Live Wallpaper"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Design.NoActionBar">

        <service
            android:name=".PocoLiveWallpaperService"
            android:exported="true"
            android:label="POCO 60FPS Video Wallpaper"
            android:permission="android.permission.BIND_WALLPAPER">
            <intent-filter>
                <action android:name="android.service.wallpaper.WallpaperService" />
            </intent-filter>
            <meta-data
                android:name="android.service.wallpaper"
                android:resource="@xml/wallpaper" />
        </service>

    </application>
</manifest>`;

const WALLPAPER_XML_CODE = `<?xml version="1.0" encoding="utf-8"?>
<wallpaper xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/wallpaper_description"
    android:thumbnail="@drawable/preview_thumbnail" />`;
