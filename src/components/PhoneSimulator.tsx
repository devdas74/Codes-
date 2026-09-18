import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Battery,
  Wifi,
  Search,
  Camera,
  Phone,
  Settings,
  Upload,
  Sparkles,
  Layers,
  Zap,
  FileVideo,
  PowerOff,
  RefreshCw,
  ShieldAlert,
  Move,
  GripVertical,
  ChevronRight,
  ChevronLeft,
  X,
  Gauge,
  Sliders,
  Play,
} from 'lucide-react';
import { EngineSettings, EngineTelemetry } from '../types';
import { renderWallpaperFrame } from '../engine/proceduralWallpapers';

interface PhoneSimulatorProps {
  settings: EngineSettings;
  telemetry: EngineTelemetry;
  onUpdateTelemetry: (updater: (prev: EngineTelemetry) => EngineTelemetry) => void;
  onToggleKillSwitch: () => void;
  screenView?: 'home';
  onSetScreenView?: (view: 'home') => void;
  uploadedVideoUrl?: string | null;
  uploadedVideoName?: string | null;
  onCustomVideoUploaded?: (url: string, name: string) => void;
  onUpdateSettings?: (updater: (prev: EngineSettings) => EngineSettings) => void;
}

export default function PhoneSimulator({
  settings,
  telemetry,
  onUpdateTelemetry,
  onToggleKillSwitch,
  screenView,
  onSetScreenView,
  uploadedVideoUrl,
  uploadedVideoName,
  onCustomVideoUploaded,
  onUpdateSettings,
}: PhoneSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const chassisRef = useRef<HTMLDivElement | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);

  // Continuous loop state
  const progressRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(performance.now());

  // Drag and drop video file state
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Gyro parallax offset ref directly updated in renderLoop (single rAF thread for max efficiency)
  const smoothedGyroRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetGyroRef = useRef<{ x: number; y: number; hasRealGyro: boolean }>({ x: 0, y: 0, hasRealGyro: false });

  // 4-Direction Moveable Sidebar State with Magnetic Edge Merging
  const [dockPos, setDockPos] = useState<{ x: number; y: number; side: 'left' | 'right'; isDocked: boolean }>({
    x: 100, // 0 (left) to 100 (right) percentage
    y: 42,  // 10 to 88 percentage
    side: 'right',
    isDocked: true,
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
  const [isDraggingDock, setIsDraggingDock] = useState<boolean>(false);

  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number; moved: boolean }>({
    clientX: 0,
    clientY: 0,
    startX: 100,
    startY: 42,
    moved: false,
  });

  // Multidirectional Drag Handlers: Move Left, Right, Up, Down & Merge with Edge
  const handleDockPointerDown = (e: React.PointerEvent, isTapToggle: boolean = false) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingDock(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: dockPos.x,
      startY: dockPos.y,
      moved: false,
    };

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const deltaScreenX = moveEvent.clientX - dragStartRef.current.clientX;
      const deltaScreenY = moveEvent.clientY - dragStartRef.current.clientY;

      if (Math.abs(deltaScreenX) > 3 || Math.abs(deltaScreenY) > 3) {
        dragStartRef.current.moved = true;
      }

      if (screenRef.current) {
        const rect = screenRef.current.getBoundingClientRect();
        const deltaPercentX = (deltaScreenX / rect.width) * 100;
        const deltaPercentY = (deltaScreenY / rect.height) * 100;

        const nextX = Math.max(0, Math.min(100, dragStartRef.current.startX + deltaPercentX));
        const nextY = Math.max(12, Math.min(86, dragStartRef.current.startY + deltaPercentY));

        setDockPos({
          x: nextX,
          y: nextY,
          side: nextX < 50 ? 'left' : 'right',
          isDocked: false,
        });
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      setIsDraggingDock(false);

      // When it's not in the exact middle, or on any drag/touch release, automatically snap & merge to the nearest edge
      setDockPos(prev => {
        const nearestSide: 'left' | 'right' = prev.x <= 50 ? 'left' : 'right';
        return {
          ...prev,
          x: nearestSide === 'left' ? 0 : 100,
          side: nearestSide,
          isDocked: true,
        };
      });

      if (!dragStartRef.current.moved && isTapToggle) {
        setIsSidebarExpanded(prev => !prev);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Listen to mobile device orientation with deadband and low-pass smoothing
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const beta = e.beta; // [-180, 180] Pitch
        const gamma = e.gamma; // [-90, 90] Roll

        const pitchAbs = Math.abs(beta);
        let flatDampening = 1;
        if (pitchAbs < 25) {
          flatDampening = Math.max(0, (pitchAbs - 10) / 15);
        } else if (pitchAbs > 155) {
          flatDampening = Math.max(0, (170 - pitchAbs) / 15);
        }

        const effectiveGamma = gamma * flatDampening;
        const uprightDeltaBeta = (beta - 48) * flatDampening;

        const rawX = Math.max(-18, Math.min(18, (effectiveGamma / 25) * 16));
        const rawY = Math.max(-18, Math.min(18, (uprightDeltaBeta / 25) * 14));

        targetGyroRef.current = { x: rawX, y: rawY, hasRealGyro: true };
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Screen pointer movement simulating gyroscope on desktop
  const handleScreenPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to +1
    const relY = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to +1
    const targetX = Math.round(relX * 18);
    const targetY = Math.round(relY * 16);
    targetGyroRef.current = { x: targetX, y: targetY, hasRealGyro: true };
  };

  const handleScreenPointerLeave = () => {
    targetGyroRef.current = { x: 0, y: 0, hasRealGyro: true };
  };

  // Current wallpaper ID (Dedicated Home Screen)
  const currentWallpaperId = settings.homeScreenWallpaperId;

  // Active loop duration in seconds
  const loopDurationSec = 8.0 / settings.playbackSpeed;

  // Drag & Drop File Handlers on Phone Screen
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|mkv)$/i))) {
      const url = URL.createObjectURL(file);
      if (onCustomVideoUploaded) {
        onCustomVideoUploaded(url, file.name);
      }
    }
  };

  // Synchronize native video speed and playback state cleanly
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = Math.max(0.25, Math.min(4.0, settings.playbackSpeed));

    if (settings.killSwitchActive) {
      video.pause();
    } else if (currentWallpaperId === 'custom_uploaded') {
      video.play().catch(() => {});
    }
  }, [settings.playbackSpeed, settings.killSwitchActive, currentWallpaperId, uploadedVideoUrl]);

  // 60 FPS Render Loop with Ping-Pong forward/reverse
  useEffect(() => {
    if (settings.killSwitchActive) {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      onUpdateTelemetry(prev => ({
        ...prev,
        currentFps: 0,
        frameTimeMs: 0,
        batteryDrainPerHour: 0.1,
        decoderMemoryMb: 0,
      }));
      return;
    }

    let isRunning = true;

    const renderLoop = (now: number) => {
      if (!isRunning) return;

      const deltaMs = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Dynamic Adaptive FPS Governor (Automatic FPS Reduction on System Load)
      let effectiveCap = settings.fpsTarget;
      let loadStatusText: 'Nominal' | 'Moderate Load (-25%)' | 'Heavy Load (-50%)' | 'Thermal Throttled (-66%)' = 'Nominal';

      if (settings.autoFpsMode) {
        if (settings.simulatedSystemLoad === 'moderate') {
          effectiveCap = settings.fpsTarget === 90 ? 60 : settings.fpsTarget === 60 ? 45 : 30;
          loadStatusText = 'Moderate Load (-25%)';
        } else if (settings.simulatedSystemLoad === 'heavy') {
          effectiveCap = settings.fpsTarget === 90 ? 45 : 30;
          loadStatusText = 'Heavy Load (-50%)';
        } else if (settings.simulatedSystemLoad === 'overheat') {
          effectiveCap = 30;
          loadStatusText = 'Thermal Throttled (-66%)';
        }
      }

      // Throttle rendering according to effective FPS cap
      const targetInterval = 1000 / effectiveCap;
      if (deltaMs < targetInterval * 0.85) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      // In-frame smooth gyro parallax interpolation
      if (targetGyroRef.current.hasRealGyro) {
        const cur = smoothedGyroRef.current;
        const tgt = targetGyroRef.current;
        cur.x += (tgt.x - cur.x) * 0.14;
        cur.y += (tgt.y - cur.y) * 0.14;
      }

      // FPS Calculation (Throttled calculation to avoid React thrashing)
      frameCountRef.current++;
      if (now - fpsTimerRef.current >= 800) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / (now - fpsTimerRef.current));
        frameCountRef.current = 0;
        fpsTimerRef.current = now;

        const effectiveFps = Math.min(measuredFps, effectiveCap);
        const baseBatteryDrain =
          effectiveCap === 90
            ? 4.2
            : effectiveCap === 60
            ? 3.6
            : effectiveCap === 45
            ? 2.8
            : 2.1;

        const drain = settings.amoledBlackCrush
          ? parseFloat((baseBatteryDrain * 0.65).toFixed(1))
          : baseBatteryDrain;

        onUpdateTelemetry(prev => ({
          ...prev,
          currentFps: effectiveFps,
          effectiveFpsCap: effectiveCap,
          frameTimeMs: parseFloat(deltaMs.toFixed(1)),
          batteryDrainPerHour: drain,
          progress: progressRef.current,
          systemLoadStatus: loadStatusText,
        }));
      }

      // Advance loop progress
      const dtSec = deltaMs / 1000;
      const progressDelta = dtSec / loopDurationSec;

      progressRef.current += progressDelta;
      if (progressRef.current >= 1.0) {
        progressRef.current = progressRef.current % 1.0;
      }

      // Render wallpaper / sync video playback
      if (currentWallpaperId === 'custom_uploaded' && uploadedVideoUrl) {
        const video = videoRef.current;
        if (video && video.readyState >= 2) {
          const maxAllowedSec = 30.0;
          const rawDuration = video.duration || 5;
          const duration = Math.min(rawDuration, maxAllowedSec);
          const trimStart = Math.max(0, Math.min(settings.trimStartSec, duration - 0.5));
          const trimEnd = Math.min(
            settings.trimEndSec > 0 ? settings.trimEndSec : duration,
            duration,
            maxAllowedSec
          );
          const current = video.currentTime;

          if (video.paused && !settings.killSwitchActive) {
            video.play().catch(() => {});
          }

          if (current >= trimEnd || current >= maxAllowedSec) {
            video.currentTime = trimStart;
          }

          const prog = Math.max(0, Math.min(1, (current - trimStart) / Math.max(0.1, trimEnd - trimStart)));
          progressRef.current = prog;
        }
      } else {
        // High-Density Canvas with Cached 2D Context
        const canvas = canvasRef.current;
        if (canvas) {
          if (!canvasCtxRef.current) {
            canvasCtxRef.current = canvas.getContext('2d', { alpha: false });
          }
          const ctx = canvasCtxRef.current;
          if (ctx) {
            renderWallpaperFrame(currentWallpaperId, {
              ctx,
              width: canvas.width,
              height: canvas.height,
              progress: progressRef.current,
              direction: 'forward',
              time: now * 0.001,
              amoledBlackCrush: settings.amoledBlackCrush,
              lockText: settings.lockScreenMainText,
              lockSubText: settings.lockScreenSubText,
              lockBadge: settings.lockScreenBadge,
            });
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [
    settings.killSwitchActive,
    settings.fpsTarget,
    settings.playbackSpeed,
    settings.amoledBlackCrush,
    settings.lockScreenMainText,
    settings.lockScreenSubText,
    settings.lockScreenBadge,
    currentWallpaperId,
    uploadedVideoUrl,
    loopDurationSec,
  ]);

  return (
    <div className="flex flex-col items-center select-none">
      {/* POCO Pro 5G Outer Chassis Frame with Drag & Drop */}
      <div
        ref={chassisRef}
        id="poco-device-chassis"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-[340px] sm:w-[370px] h-[720px] rounded-[48px] p-3.5 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black shadow-2xl border transition-all duration-300 ring-1 ring-white/10 ${
          isDraggingFile
            ? 'border-cyan-400 ring-4 ring-cyan-500/40 scale-[1.02]'
            : 'border-neutral-700/60'
        }`}
        style={{
          boxShadow: settings.killSwitchActive
            ? '0 0 35px rgba(239, 68, 68, 0.25)'
            : '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 40px rgba(6, 182, 212, 0.15)',
        }}
      >
        {/* Device Volume & Power Keys (POCO Pro 5G Hardware styling) */}
        <div className="absolute -right-2 top-28 w-1.5 h-14 bg-neutral-700 rounded-r-sm" />
        <div className="absolute -right-2 top-48 w-1.5 h-10 bg-neutral-800 rounded-r-sm border-l border-neutral-600" />

        {/* POCO Screen Bezel with Gyro & Touch tracking */}
        <div
          ref={screenRef}
          onPointerMove={handleScreenPointerMove}
          onPointerLeave={handleScreenPointerLeave}
          className="relative w-full h-full rounded-[38px] overflow-hidden bg-black flex flex-col border border-neutral-800/80"
        >
          {/* Main 60 FPS Wallpaper Canvas (renders procedural themes) */}
          <canvas
            ref={canvasRef}
            width={340}
            height={690}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-150 ${
              currentWallpaperId === 'custom_uploaded'
                ? 'opacity-0 pointer-events-none'
                : 'opacity-100 z-10'
            }`}
            style={{
              filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`,
            }}
          />

          {/* Direct Hardware Accelerated Video Player for Continuous Loop */}
          {uploadedVideoUrl && (
            <video
              ref={videoRef}
              key={uploadedVideoUrl}
              src={uploadedVideoUrl}
              crossOrigin="anonymous"
              playsInline
              muted
              autoPlay
              loop
              onLoadedData={() => {
                if (videoRef.current && !settings.killSwitchActive) {
                  videoRef.current.play().catch(() => {});
                }
              }}
              onError={e => {
                console.warn('Video failed to load or decode:', e);
              }}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-150 ${
                currentWallpaperId === 'custom_uploaded' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
              }`}
              style={{
                filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`,
              }}
            />
          )}

          {/* Drag & Drop Overlay */}
          {isDraggingFile && (
            <div className="absolute inset-0 z-50 bg-cyan-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center border-4 border-dashed border-cyan-400 rounded-[38px] animate-pulse">
              <Upload className="w-12 h-12 text-cyan-400 mb-3" />
              <h3 className="text-white font-bold text-base mb-1">
                Drop Video Here
              </h3>
              <p className="text-xs text-cyan-200">
                Instantly load as your 60 FPS live wallpaper
              </p>
            </div>
          )}

          {/* Kill Switch Blanking / Emergency State Overlay */}
          {settings.killSwitchActive && (
            <div
              id="emergency-kill-overlay"
              className="absolute inset-0 z-40 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-4 shadow-lg">
                <PowerOff className="w-7 h-7 animate-pulse" />
              </div>
              <h3 className="text-rose-400 font-bold text-lg tracking-tight mb-1">
                EMERGENCY KILL ACTIVE
              </h3>
              <p className="text-xs text-neutral-400 max-w-[240px] leading-relaxed mb-6">
                Wallpaper engine completely terminated. 0 FPS, 0% CPU, and zero touch interception.
                System Control Center & app launcher are 100% free.
              </p>
              <button
                id="btn-rearm-wallpaper"
                onClick={onToggleKillSwitch}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-arm Wallpaper Engine</span>
              </button>
            </div>
          )}

          {/* POCO HyperOS / MIUI Top Status Bar */}
          <div className="relative z-30 w-full pt-2.5 px-4 pb-1 flex items-center justify-between text-white/90 text-xs font-semibold select-none pointer-events-none">
            {/* Left Clock */}
            <div className="flex items-center gap-1.5">
              <span className="tracking-wide text-[11px] font-mono">12:45</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
            </div>

            {/* Right Status Icons: 5G, Wi-Fi, Battery */}
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="font-extrabold text-[8px] text-cyan-400 tracking-tighter">5G</span>
              <Wifi className="w-3 h-3 text-white/80" />
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono text-neutral-300">88%</span>
                <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/40" />
              </div>
            </div>
          </div>

          {/* Minimal Clean Hardware Punch-Hole Camera Cutout (Centered & Non-Obtrusive) */}
          <div
            id="hardware-camera-notch"
            className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-neutral-950 border border-neutral-800 z-30 flex items-center justify-center shadow-inner pointer-events-none"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-950 border border-neutral-900" />
          </div>

          {/* ========================================================================= */}
          {/* 4-DIRECTION MOVEABLE SIDEBAR DOCK (Snaps & Merges with Screen Edge on Touch) */}
          {/* ========================================================================= */}
          <div
            id="wallpaper-movable-sidebar"
            style={{
              top: `${dockPos.y}%`,
              ...(dockPos.isDocked
                ? dockPos.side === 'left'
                  ? { left: isSidebarExpanded ? '12px' : '0px', right: 'auto' }
                  : { right: isSidebarExpanded ? '12px' : '0px', left: 'auto' }
                : { left: `clamp(100px, ${dockPos.x}%, calc(100% - 100px))` }),
              transform: dockPos.isDocked
                ? 'translateY(-50%)'
                : 'translate(-50%, -50%)',
              touchAction: 'none',
            }}
            className={`absolute z-50 select-none ${
              isDraggingDock ? 'cursor-grabbing scale-105 shadow-2xl' : 'transition-all duration-300 ease-out'
            }`}
          >
            <AnimatePresence mode="wait">
              {/* 1. COLLAPSED VERTICAL HANDLE (Merged Seamlessly into Phone Edge) */}
              {!isSidebarExpanded ? (
                <motion.div
                  key="collapsed-dock-handle"
                  id="sidebar-dock-handle"
                  initial={{ opacity: 0, scale: 0.85, x: dockPos.side === 'left' ? -20 : 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: dockPos.side === 'left' ? -20 : 20 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 320 }}
                  onPointerDown={(e) => handleDockPointerDown(e, true)}
                  title="Drag in any direction (Left, Right, Up, Down). Tap to expand vertical Kill Switch panel."
                  className={`flex flex-col items-center justify-center py-2.5 px-1 cursor-grab active:cursor-grabbing bg-neutral-950/85 hover:bg-black/95 backdrop-blur-2xl border border-white/20 shadow-2xl transition-all ${
                    dockPos.isDocked
                      ? dockPos.side === 'left'
                        ? 'rounded-r-2xl border-l-0 pl-1.5 pr-2'
                        : 'rounded-l-2xl border-r-0 pl-2 pr-1.5'
                      : 'rounded-2xl px-1.5 border'
                  } ${
                    settings.killSwitchActive
                      ? 'border-rose-500/80 bg-rose-950/80 shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                      : 'hover:border-cyan-400/60'
                  }`}
                >
                  {/* Top: 4-Way Move Icon */}
                  <div className="flex flex-col items-center justify-center text-neutral-400 mb-1.5">
                    <Move className="w-3 h-3 text-neutral-400 opacity-80" />
                  </div>

                  {/* Pulsing Status LED */}
                  <div
                    className={`w-2 h-2 rounded-full mb-1.5 ${
                      settings.killSwitchActive
                        ? 'bg-rose-500 animate-ping shadow-[0_0_8px_#ef4444]'
                        : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    }`}
                  />

                  {/* Vertical FPS / Killed Indicator */}
                  <div className="flex flex-col items-center justify-center py-0.5 my-0.5">
                    <span
                      className={`text-[8px] font-mono font-black tracking-tight leading-tight ${
                        settings.killSwitchActive ? 'text-rose-400 font-bold' : 'text-cyan-300'
                      }`}
                    >
                      {settings.killSwitchActive ? 'OFF' : `${telemetry.currentFps}`}
                    </span>
                    <span className="text-[6px] font-mono text-neutral-400 uppercase tracking-tighter leading-none mt-0.5">
                      {settings.killSwitchActive ? 'KILLED' : 'FPS'}
                    </span>
                  </div>

                  {/* Expand Chevron Icon */}
                  <div className="text-neutral-400 mt-1">
                    {dockPos.side === 'right' && dockPos.isDocked ? (
                      <ChevronLeft className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </div>
                </motion.div>
              ) : (
                /* 2. EXPANDED SIDEBAR PANEL WITH KILL ALL PROCESSES BUTTON (Smooth Spring Transition Fully on Screen) */
                <motion.div
                  key="expanded-dock-panel"
                  id="sidebar-expanded-panel"
                  initial={{
                    opacity: 0,
                    scale: 0.88,
                    x: dockPos.side === 'left' ? -35 : 35,
                    originX: dockPos.side === 'left' ? 0 : 1,
                    originY: 0.5,
                  }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.88,
                    x: dockPos.side === 'left' ? -35 : 35,
                  }}
                  transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-52 bg-neutral-950/95 backdrop-blur-2xl border border-white/25 rounded-2xl p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-neutral-200 flex flex-col gap-2"
                >
                  {/* Panel Header & Move Handle */}
                  <div
                    onPointerDown={(e) => handleDockPointerDown(e, false)}
                    title="Drag to move Left, Right, Up, or Down. Merges with edge on release."
                    className="w-full flex items-center justify-between pb-1 border-b border-neutral-800 cursor-grab active:cursor-grabbing hover:bg-white/5 px-1 py-0.5 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <Move className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] font-bold tracking-tight text-white">
                        Movable Edge Dock
                      </span>
                    </div>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => setIsSidebarExpanded(false)}
                      className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Minimize and merge into edge"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* PROMINENT "KILL ALL PROCESSES" BUTTON */}
                  <button
                    id="btn-kill-all-processes-sidebar"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleKillSwitch();
                    }}
                    className={`w-full py-2.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer ${
                      settings.killSwitchActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white border border-emerald-400/40 shadow-emerald-950/60 ring-2 ring-emerald-500/30'
                        : 'bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 hover:from-rose-500 hover:to-red-700 text-white border border-rose-400/50 shadow-rose-950/70 animate-pulse'
                    }`}
                    title={
                      settings.killSwitchActive
                        ? 'Re-arm wallpaper engine and resume render threads'
                        : 'Instantly freeze all canvas loops, pause videos, drop GPU load to 0%'
                    }
                  >
                    {settings.killSwitchActive ? (
                      <>
                        <Play className="w-4 h-4 fill-white text-white" />
                        <div className="flex flex-col items-start text-left leading-tight">
                          <span className="text-[11px] font-black tracking-tight">RESUME PROCESSES</span>
                          <span className="text-[7px] text-emerald-200 font-mono">Engine is frozen</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <PowerOff className="w-4 h-4 text-white animate-pulse" />
                        <div className="flex flex-col items-start text-left leading-tight">
                          <span className="text-[11px] font-black tracking-tight">KILL ALL PROCESSES</span>
                          <span className="text-[7px] text-rose-200 font-mono">0% CPU • Freeze All</span>
                        </div>
                      </>
                    )}
                  </button>

                  {/* Quick Status & Multiplier Grid */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* FPS Tile */}
                    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-1.5 flex flex-col items-center text-center">
                      <div className="flex items-center gap-1 mb-0.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            settings.killSwitchActive
                              ? 'bg-rose-500'
                              : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                          }`}
                        />
                        <span className="text-[7px] font-mono text-neutral-400 uppercase">FPS</span>
                      </div>
                      <span
                        className={`text-[11px] font-mono font-black ${
                          settings.killSwitchActive ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {settings.killSwitchActive ? '0' : `${telemetry.currentFps}`}
                      </span>
                    </div>

                    {/* Battery Drain Tile */}
                    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-1.5 flex flex-col items-center text-center">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Battery className="w-2.5 h-2.5 text-cyan-400" />
                        <span className="text-[7px] font-mono text-neutral-400 uppercase">DRAIN</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-cyan-300">
                        {settings.killSwitchActive ? '0.1%' : `${telemetry.batteryDrainPerHour}%`}
                      </span>
                    </div>
                  </div>

                  {/* Speed Multiplier Pill */}
                  <div className="flex items-center justify-between bg-neutral-900/90 border border-neutral-800 rounded-xl px-2 py-1">
                    <div className="flex items-center gap-1 text-neutral-400">
                      <Gauge className="w-3 h-3 text-amber-400" />
                      <span className="text-[9px] font-medium text-neutral-300">Speed</span>
                    </div>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        if (onUpdateSettings) {
                          const speeds = [0.5, 1.0, 1.5, 2.0];
                          const nextIdx = (speeds.indexOf(settings.playbackSpeed) + 1) % speeds.length;
                          onUpdateSettings(prev => ({ ...prev, playbackSpeed: speeds[nextIdx] }));
                        }
                      }}
                      className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-md text-[9px] font-mono font-bold text-amber-300 cursor-pointer transition-colors"
                      title="Cycle playback speed"
                    >
                      {settings.playbackSpeed}x
                    </button>
                  </div>

                  {/* Dock Position / Edge Flip Controls */}
                  <div className="pt-1 border-t border-neutral-800/80 flex items-center justify-between text-[8px] text-neutral-400 px-0.5">
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        setDockPos(prev => {
                          const nextSide = prev.side === 'right' ? 'left' : 'right';
                          return {
                            ...prev,
                            x: nextSide === 'left' ? 0 : 100,
                            side: nextSide,
                            isDocked: true,
                          };
                        });
                      }}
                      className="px-2 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-cyan-300 border border-neutral-700/60 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Flip edge (Snap to Left / Right)"
                    >
                      <Move className="w-2.5 h-2.5" />
                      <span>Flip Side ({dockPos.side === 'right' ? 'Left' : 'Right'})</span>
                    </button>

                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => setIsSidebarExpanded(false)}
                      className="px-2 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Merge into edge"
                    >
                      <span>Dock</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Screen Content: AUTHENTIC POCO HOME SCREEN */}
          <div className="relative z-20 flex-1 flex flex-col justify-between pt-12 pb-4 px-5 select-none">
            {/* Top Section: Clock & Date Widget */}
            <div className="flex flex-col items-center pt-2 text-center animate-fade-in">
              <div className="text-4xl font-extralight tracking-tight text-white drop-shadow-lg font-sans">
                12:45
              </div>
              <div className="text-[11px] font-medium text-neutral-300 drop-shadow mt-0.5">
                Friday, September 18
              </div>

              {/* Minimal Search Bar Widget */}
              <div className="w-full mt-4 py-1.5 px-3 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-between text-neutral-300 text-xs shadow-md">
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] text-neutral-400">Search apps & web...</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold text-white">
                  G
                </div>
              </div>
            </div>

            {/* Mid Section: 4x2 Home App Grid */}
            <div className="my-auto grid grid-cols-4 gap-y-4 gap-x-3 px-1 py-4">
              {[
                { name: 'Gallery', icon: Sparkles, color: 'bg-gradient-to-tr from-amber-500 to-rose-500' },
                { name: 'Themes', icon: Layers, color: 'bg-gradient-to-tr from-cyan-500 to-blue-600' },
                { name: 'Security', icon: ShieldAlert, color: 'bg-gradient-to-tr from-emerald-500 to-teal-600' },
                { name: 'Settings', icon: Settings, color: 'bg-gradient-to-tr from-neutral-600 to-neutral-800' },
                { name: 'Music', icon: Zap, color: 'bg-gradient-to-tr from-orange-500 to-rose-600' },
                { name: 'Files', icon: FileVideo, color: 'bg-gradient-to-tr from-blue-600 to-indigo-700' },
                { name: 'Camera', icon: Camera, color: 'bg-gradient-to-tr from-rose-600 to-pink-700' },
                { name: 'Browser', icon: Search, color: 'bg-gradient-to-tr from-teal-500 to-cyan-600' },
              ].map((app, idx) => {
                const IconComp = app.icon;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div
                      className={`w-11 h-11 rounded-2xl ${app.color} text-white flex items-center justify-center shadow-lg transform group-hover:scale-105 group-active:scale-90 transition-transform`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-white drop-shadow-md">
                      {app.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Dock & Navigation Bar */}
            <div className="flex flex-col gap-3">
              {/* 4-Icon Bottom Dock */}
              <div className="w-full py-2 px-3 rounded-3xl bg-black/40 border border-white/15 backdrop-blur-md grid grid-cols-4 gap-2 shadow-xl">
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform">
                    <Search className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Android Gesture Pill Navigation */}
              <div className="flex justify-center py-1">
                <div className="w-28 h-1 bg-white/60 rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Upload and Tip Bar Below Chassis */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-4 py-2 rounded-2xl shadow-md text-xs font-semibold text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>POCO Home Screen Live Wallpaper</span>
        </div>

        {/* Quick Upload Button */}
        {onCustomVideoUploaded && (
          <label className="cursor-pointer px-4 py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
            <span>Upload Your Video</span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  onCustomVideoUploaded(url, file.name);
                }
              }}
              className="hidden"
            />
          </label>
        )}
      </div>

      <p className="text-[10px] text-neutral-500 mt-2 font-mono text-center">
        Tip: <strong className="text-cyan-400">Drag the edge handle up/down</strong> to reposition anywhere along the screen edge, or <strong className="text-emerald-400">tap it</strong> to open the blended Wallpaper Edge Dock.
      </p>
    </div>
  );
}

