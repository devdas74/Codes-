import { useEffect, useRef, useState } from 'react';
import {
  Lock,
  Unlock,
  Battery,
  Wifi,
  PowerOff,
  RefreshCw,
  Search,
  MessageSquare,
  Camera,
  Phone,
  Settings,
  GripVertical,
  Upload,
  Sparkles,
} from 'lucide-react';
import { EngineSettings, EngineTelemetry } from '../types';
import { renderWallpaperFrame } from '../engine/proceduralWallpapers';

interface PhoneSimulatorProps {
  settings: EngineSettings;
  telemetry: EngineTelemetry;
  onUpdateTelemetry: (updater: (prev: EngineTelemetry) => EngineTelemetry) => void;
  onToggleKillSwitch: () => void;
  screenView: 'home' | 'lock';
  onSetScreenView: (view: 'home' | 'lock') => void;
  uploadedVideoUrl?: string | null;
  uploadedVideoName?: string | null;
  onCustomVideoUploaded?: (url: string, name: string) => void;
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
}: PhoneSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const chassisRef = useRef<HTMLDivElement | null>(null);

  // Ping-pong loop state
  const progressRef = useRef<number>(0);
  const directionRef = useRef<'forward' | 'reverse'>('forward');
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(performance.now());
  const telemetryTimerRef = useRef<number>(performance.now());

  // Reverse frame buffer for ultra-smooth 60 FPS video reverse without decoder seek stutter
  const reverseFramesRef = useRef<ImageBitmap[]>([]);
  const isBufferingReverseRef = useRef<boolean>(false);
  const reverseFrameIndexRef = useRef<number>(0);

  // Pre-buffer reverse frames whenever a custom video is uploaded or loaded
  useEffect(() => {
    if (!uploadedVideoUrl) {
      // Clear previous frames
      reverseFramesRef.current.forEach(f => {
        try { f.close(); } catch {}
      });
      reverseFramesRef.current = [];
      return;
    }

    let isCancelled = false;

    const bufferReverseVideo = async () => {
      try {
        isBufferingReverseRef.current = true;
        const tempVid = document.createElement('video');
        tempVid.src = uploadedVideoUrl;
        tempVid.crossOrigin = 'anonymous';
        tempVid.muted = true;
        tempVid.playsInline = true;

        await new Promise<void>((resolve, reject) => {
          tempVid.onloadedmetadata = () => resolve();
          tempVid.onerror = reject;
        });

        const duration = tempVid.duration;
        if (!duration || duration > 30 || isCancelled) {
          isBufferingReverseRef.current = false;
          return;
        }

        // Extract frames maintaining native aspect ratio
        const frameStep = 1 / 30;
        const framesCount = Math.min(300, Math.floor(duration / frameStep));
        const offscreen = document.createElement('canvas');
        const vW = tempVid.videoWidth || 720;
        const vH = tempVid.videoHeight || 1280;
        offscreen.width = vW;
        offscreen.height = vH;
        const ctx = offscreen.getContext('2d');
        if (!ctx) return;

        const captured: ImageBitmap[] = [];

        for (let i = framesCount - 1; i >= 0; i--) {
          if (isCancelled) break;
          const targetSec = i * frameStep;
          tempVid.currentTime = targetSec;
          await new Promise<void>(res => {
            const onSeek = () => {
              tempVid.removeEventListener('seeked', onSeek);
              res();
            };
            tempVid.addEventListener('seeked', onSeek);
          });
          ctx.drawImage(tempVid, 0, 0, vW, vH);
          const bitmap = await createImageBitmap(offscreen);
          captured.push(bitmap);
        }

        if (!isCancelled && captured.length > 0) {
          reverseFramesRef.current.forEach(f => {
            try { f.close(); } catch {}
          });
          reverseFramesRef.current = captured;
        }
      } catch (e) {
        console.warn('Could not pre-buffer reverse frames:', e);
      } finally {
        isBufferingReverseRef.current = false;
      }
    };

    bufferReverseVideo();

    return () => {
      isCancelled = true;
      reverseFramesRef.current.forEach(f => {
        try { f.close(); } catch {}
      });
      reverseFramesRef.current = [];
    };
  }, [uploadedVideoUrl]);

  // Drag and drop video file state
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Movable Thin HUD Bar State (Merged with right edge, vertically draggable)
  const [barPosY, setBarPosY] = useState<number>(160);
  const [isDraggingBar, setIsDraggingBar] = useState(false);
  const dragStartYRef = useRef<{ startY: number; initialY: number }>({
    startY: 0,
    initialY: 160,
  });

  // Gyro parallax offset (moves text 10 to 20 px with gyro / tilt)
  const [gyroOffset, setGyroOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothedGyroRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Listen to mobile device orientation with deadband and low-pass smoothing
  // Fixes jumping from left to right when the phone is held flat or lying down
  useEffect(() => {
    let animId: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let hasRealGyro = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        hasRealGyro = true;
        const beta = e.beta; // [-180, 180] Pitch
        const gamma = e.gamma; // [-90, 90] Roll

        // When the device is lying flat or nearly flat on a table/bed (|beta| < 25 deg or |beta| > 155 deg),
        // Euler angle sensors experience gimbal flip where gamma erratically fluctuates between +90 and -90.
        // We smoothly taper dampening to 0 around horizontal orientations to keep the display completely centered.
        const pitchAbs = Math.abs(beta);
        let flatDampening = 1;
        if (pitchAbs < 25) {
          flatDampening = Math.max(0, (pitchAbs - 10) / 15);
        } else if (pitchAbs > 155) {
          flatDampening = Math.max(0, (170 - pitchAbs) / 15);
        }

        // When flat, zero out roll/pitch instability completely so it rests centered without snapping
        const effectiveGamma = gamma * flatDampening;

        // Upright reference angle is ~45-55 deg
        const uprightDeltaBeta = (beta - 48) * flatDampening;

        // Clamp smoothly to [-18px, 18px] range
        const rawX = Math.max(-18, Math.min(18, (effectiveGamma / 25) * 16));
        const rawY = Math.max(-18, Math.min(18, (uprightDeltaBeta / 25) * 14));

        targetX = rawX;
        targetY = rawY;
      }
    };

    // Exponential smoothing tick (0.14 lerp) prevents abrupt discrete jumps
    const smoothLoop = () => {
      const current = smoothedGyroRef.current;
      if (hasRealGyro) {
        const nextX = current.x + (targetX - current.x) * 0.14;
        const nextY = current.y + (targetY - current.y) * 0.14;
        smoothedGyroRef.current = { x: nextX, y: nextY };
        setGyroOffset({
          x: Math.round(nextX * 10) / 10,
          y: Math.round(nextY * 10) / 10,
        });
      }

      animId = requestAnimationFrame(smoothLoop);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    animId = requestAnimationFrame(smoothLoop);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  // Screen pointer movement simulating gyroscope on desktop
  const handleScreenPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingBar) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to +1
    const relY = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to +1
    const targetX = Math.round(relX * 18); // 10 to 20 px range
    const targetY = Math.round(relY * 16);
    smoothedGyroRef.current = { x: targetX, y: targetY };
    setGyroOffset({ x: targetX, y: targetY });
  };

  const handleScreenPointerLeave = () => {
    smoothedGyroRef.current = { x: 0, y: 0 };
    setGyroOffset({ x: 0, y: 0 });
  };

  // Current wallpaper ID based on screenView
  const currentWallpaperId =
    screenView === 'lock'
      ? settings.lockScreenWallpaperId
      : settings.homeScreenWallpaperId;

  // Active loop duration in seconds
  const loopDurationSec = 8.0 / settings.playbackSpeed;

  // Movable Bar Pointer Event Handlers (Vertical edge slider)
  const handleBarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If clicking directly on a button, do not initiate drag
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingBar(true);
    dragStartYRef.current = {
      startY: e.clientY,
      initialY: barPosY,
    };
  };

  const handleBarPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingBar) return;
    const dy = e.clientY - dragStartYRef.current.startY;
    // Constrain sliding vertically along right edge between top status bar and bottom nav
    const newY = Math.max(38, Math.min(480, dragStartYRef.current.initialY + dy));
    setBarPosY(newY);
  };

  const handleBarPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingBar) {
      setIsDraggingBar(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleResetBarPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBarPosY(160);
  };

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

      // Throttle if targeting 24 or 30 FPS
      const targetInterval = 1000 / settings.fpsTarget;
      if (deltaMs < targetInterval * 0.85) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      // FPS Calculation
      frameCountRef.current++;
      if (now - fpsTimerRef.current >= 600) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / (now - fpsTimerRef.current));
        frameCountRef.current = 0;
        fpsTimerRef.current = now;

        const baseBatteryDrain =
          settings.fpsTarget === 60 ? 3.6 : settings.fpsTarget === 30 ? 2.1 : 1.3;

        onUpdateTelemetry(prev => ({
          ...prev,
          currentFps: Math.min(measuredFps, settings.fpsTarget),
          frameTimeMs: parseFloat(deltaMs.toFixed(1)),
          batteryDrainPerHour: settings.amoledBlackCrush
            ? parseFloat((baseBatteryDrain * 0.65).toFixed(1))
            : baseBatteryDrain,
        }));
      }

      // Advance ping-pong progress
      const dtSec = deltaMs / 1000;
      const progressDelta = dtSec / loopDurationSec;

      if (directionRef.current === 'forward') {
        progressRef.current += progressDelta;
        if (progressRef.current >= 1.0) {
          progressRef.current = 1.0;
          if (settings.pingPongLoop) {
            directionRef.current = 'reverse';
          } else {
            progressRef.current = 0.0;
          }
          onUpdateTelemetry(prev => ({ ...prev, loopCount: prev.loopCount + 1 }));
        }
      } else {
        // Reverse playback
        progressRef.current -= progressDelta;
        if (progressRef.current <= 0.0) {
          progressRef.current = 0.0;
          directionRef.current = 'forward';
          onUpdateTelemetry(prev => ({ ...prev, loopCount: prev.loopCount + 1 }));
        }
      }

      // Render wallpaper / sync video playback
      if (currentWallpaperId === 'custom_uploaded' && uploadedVideoUrl) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas?.getContext('2d');

        if (settings.pingPongLoop) {
          // Ping-Pong Mode: Forward plays native video; Reverse plays pre-extracted buffer
          if (directionRef.current === 'forward') {
            if (video && video.readyState >= 2) {
              const duration = video.duration || 5;
              const trimStart = Math.min(settings.trimStartSec, duration - 0.5);
              const trimEnd = settings.trimEndSec > 0 ? Math.min(settings.trimEndSec, duration) : duration;
              const current = video.currentTime;

              if (video.paused && !settings.killSwitchActive) {
                video.play().catch(() => {});
              }

              const prog = Math.max(0, Math.min(1, (current - trimStart) / Math.max(0.1, trimEnd - trimStart)));
              progressRef.current = prog;

              if (current >= trimEnd - 0.08 || video.ended) {
                directionRef.current = 'reverse';
                reverseFrameIndexRef.current = 0;
                if (!video.paused) video.pause();
                onUpdateTelemetry(prev => ({ ...prev, loopCount: prev.loopCount + 1 }));
              }
            }
          } else {
            // Reverse phase: Stream cached reverse frames with 60 FPS precision & zero decoder stutter
            const frames = reverseFramesRef.current;
            if (frames && frames.length > 0 && canvas && ctx) {
              const frameIdx = Math.min(
                frames.length - 1,
                Math.floor(reverseFrameIndexRef.current)
              );
              const frame = frames[frameIdx];
              if (frame) {
                // Precise object-cover math to match HTML5 video object-cover framing
                const cW = canvas.width;
                const cH = canvas.height;
                const fW = frame.width;
                const fH = frame.height;
                const canvasAspect = cW / cH;
                const frameAspect = fW / fH;

                let sX = 0, sY = 0, sW = fW, sH = fH;
                if (frameAspect > canvasAspect) {
                  // Frame is wider than canvas: crop sides
                  sW = fH * canvasAspect;
                  sX = (fW - sW) / 2;
                } else {
                  // Frame is taller than canvas: crop top/bottom
                  sH = fW / canvasAspect;
                  sY = (fH - sH) / 2;
                }

                ctx.drawImage(frame, sX, sY, sW, sH, 0, 0, cW, cH);
              }

              // Advance reverse frame index smoothly based on delta time & playback speed
              const framesPerSec = 30 * settings.playbackSpeed;
              reverseFrameIndexRef.current += (deltaMs / 1000) * framesPerSec;

              const prog = 1.0 - Math.min(1, reverseFrameIndexRef.current / frames.length);
              progressRef.current = prog;

              if (reverseFrameIndexRef.current >= frames.length - 1) {
                directionRef.current = 'forward';
                reverseFrameIndexRef.current = 0;
                if (video) {
                  const duration = video.duration || 5;
                  const trimStart = Math.min(settings.trimStartSec, duration - 0.5);
                  video.currentTime = trimStart;
                  if (!settings.killSwitchActive) {
                    video.play().catch(() => {});
                  }
                }
                onUpdateTelemetry(prev => ({ ...prev, loopCount: prev.loopCount + 1 }));
              }
            } else {
              // Fallback if reverse buffer still building
              directionRef.current = 'forward';
              if (video) {
                const duration = video.duration || 5;
                video.currentTime = Math.min(settings.trimStartSec, duration - 0.5);
                if (!settings.killSwitchActive) video.play().catch(() => {});
              }
            }
          }
        } else {
          // Standard forward loop mode - 100% native smooth decoder
          if (video && video.readyState >= 2) {
            const duration = video.duration || 5;
            const trimStart = Math.min(settings.trimStartSec, duration - 0.5);
            const trimEnd = settings.trimEndSec > 0 ? Math.min(settings.trimEndSec, duration) : duration;
            const current = video.currentTime;

            if (video.paused && !settings.killSwitchActive) {
              video.play().catch(() => {});
            }

            if (trimEnd < duration - 0.05 && current >= trimEnd) {
              video.currentTime = trimStart;
              onUpdateTelemetry(prev => ({ ...prev, loopCount: prev.loopCount + 1 }));
            }

            const prog = Math.max(0, Math.min(1, (current - trimStart) / Math.max(0.1, trimEnd - trimStart)));
            progressRef.current = prog;
            directionRef.current = 'forward';
          }
        }
      } else {
        // Procedural High-Density Canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            renderWallpaperFrame(currentWallpaperId, {
              ctx,
              width: canvas.width,
              height: canvas.height,
              progress: progressRef.current,
              direction: directionRef.current,
              time: now * 0.001,
              amoledBlackCrush: settings.amoledBlackCrush,
              lockText: settings.lockScreenMainText,
              lockSubText: settings.lockScreenSubText,
              lockBadge: settings.lockScreenBadge,
            });
          }
        }
      }

      // Throttle telemetry updates to ~20Hz (every 50ms) to preserve 60 FPS GPU/render loop without React state thrashing
      if (now - telemetryTimerRef.current >= 50) {
        telemetryTimerRef.current = now;
        onUpdateTelemetry(prev => ({
          ...prev,
          progress: progressRef.current,
          direction: directionRef.current,
        }));
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
    settings.pingPongLoop,
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
          onPointerMove={handleScreenPointerMove}
          onPointerLeave={handleScreenPointerLeave}
          className="relative w-full h-full rounded-[38px] overflow-hidden bg-black flex flex-col border border-neutral-800/80"
        >
          {/* Main 60 FPS Wallpaper Canvas (renders procedural themes OR reverse frame buffer for ping-pong) */}
          <canvas
            ref={canvasRef}
            width={340}
            height={690}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-150 ${
              currentWallpaperId === 'custom_uploaded'
                ? settings.pingPongLoop && directionRef.current === 'reverse'
                  ? 'opacity-100 z-20'
                  : 'opacity-0 z-0 pointer-events-none'
                : 'opacity-100 z-10'
            }`}
            style={{
              filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`,
            }}
          />

          {/* Direct Hardware Accelerated Video Player for Forward Phase & Normal Loop */}
          {uploadedVideoUrl && (
            <video
              ref={videoRef}
              key={uploadedVideoUrl}
              src={uploadedVideoUrl}
              crossOrigin="anonymous"
              playsInline
              muted
              autoPlay
              loop={!settings.pingPongLoop}
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

          {/* Top Status Bar (POCO MIUI / HyperOS) */}
          <div className="relative z-30 w-full pt-3 px-6 pb-1 flex items-center justify-between text-white/90 text-xs font-semibold">
            {/* Clock */}
            <span className="tracking-wide text-[11px] font-mono">12:45</span>

            {/* POCO Center Punch-hole Camera */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-neutral-700/60 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
            </div>

            {/* Icons: 5G, Wi-Fi, Battery */}
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="font-extrabold text-[9px] text-cyan-400 tracking-tighter">5G</span>
              <Wifi className="w-3.5 h-3.5 text-white/80" />
              <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400/40" />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THIN EDGE-MERGED MOVABLE HUD BAR (WITH INTEGRATED KILL SWITCH)             */}
          {/* Merged with right edge, sleek vertical profile, sliding along the bezel   */}
          {/* ========================================================================= */}
          <div
            id="movable-right-hud-bar"
            onPointerDown={handleBarPointerDown}
            onPointerMove={handleBarPointerMove}
            onPointerUp={handleBarPointerUp}
            style={{
              top: `${barPosY}px`,
            }}
            className={`absolute z-40 right-0 w-9 rounded-l-2xl border-l border-y border-r-0 bg-neutral-950/85 backdrop-blur-xl flex flex-col items-center py-2 px-1 shadow-2xl transition-colors touch-none cursor-grab active:cursor-grabbing select-none ${
              isDraggingBar
                ? 'border-cyan-400 ring-1 ring-cyan-500/40 bg-neutral-900/95'
                : settings.killSwitchActive
                ? 'border-rose-500/80 ring-1 ring-rose-500/40'
                : 'border-neutral-700/70 hover:border-neutral-500'
            }`}
            title="Edge Sidebar: Drag up/down along edge. Tap button for Panic Kill Switch."
          >
            {/* Movable Drag Grip Handle */}
            <div className="w-full flex justify-center py-0.5 text-neutral-400 hover:text-white">
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            {/* EMERGENCY KILL SWITCH (Integrated inside edge-merged thin bar) */}
            <button
              id="movable-hud-kill-switch"
              onClick={e => {
                e.stopPropagation();
                onToggleKillSwitch();
              }}
              title={
                settings.killSwitchActive
                  ? 'Engine is KILLED! Tap to re-arm'
                  : 'PANIC KILL SWITCH: Tap to freeze wallpaper engine'
              }
              className={`w-7 h-7 mt-1 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md ${
                settings.killSwitchActive
                  ? 'bg-rose-600 text-white animate-pulse ring-1 ring-rose-400'
                  : 'bg-neutral-900 hover:bg-rose-950/80 text-rose-400 border border-rose-500/40 hover:border-rose-400 active:scale-90'
              }`}
            >
              <PowerOff className="w-3.5 h-3.5" />
            </button>

            {/* Hairline Divider */}
            <div className="w-4 h-[1px] bg-neutral-800 my-1.5" />

            {/* Live 60 FPS Indicator */}
            <div className="flex flex-col items-center leading-none text-center">
              <span
                className={`w-1 h-1 rounded-full ${
                  settings.killSwitchActive
                    ? 'bg-neutral-600'
                    : telemetry.currentFps >= 50
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-cyan-400 animate-pulse'
                }`}
              />
              <span
                className={`font-mono font-bold text-[9px] mt-0.5 ${
                  settings.killSwitchActive
                    ? 'text-neutral-500'
                    : telemetry.currentFps >= 50
                    ? 'text-emerald-400'
                    : 'text-cyan-400'
                }`}
              >
                {telemetry.currentFps}
              </span>
              <span className="text-[6px] font-mono text-neutral-500">FPS</span>
            </div>

            {/* Ping-Pong Mini Flow Indicator */}
            <div className="my-1.5 flex flex-col items-center">
              <span
                className={`text-[8px] font-mono font-bold ${
                  telemetry.direction === 'forward' ? 'text-cyan-400' : 'text-pink-400'
                }`}
                title={`Ping-Pong Direction: ${telemetry.direction}`}
              >
                {telemetry.direction === 'forward' ? '▲' : '▼'}
              </span>
              <div className="w-1 h-4 bg-neutral-800 rounded-full overflow-hidden mt-0.5">
                <div
                  className={`w-full transition-all duration-75 ${
                    telemetry.direction === 'forward' ? 'bg-cyan-400' : 'bg-pink-400'
                  }`}
                  style={{ height: `${Math.round(telemetry.progress * 100)}%` }}
                />
              </div>
            </div>

            {/* Battery Drain Rate */}
            <div className="flex flex-col items-center text-[7px] font-mono text-emerald-400/90 leading-none">
              <Battery className="w-2.5 h-2.5 mb-0.5" />
              <span>{telemetry.batteryDrainPerHour}%</span>
            </div>

            {/* Snap Reset Button */}
            <button
              onClick={handleResetBarPosition}
              title="Reset handle to default position"
              className="mt-1.5 p-0.5 text-neutral-600 hover:text-neutral-300 transition-colors"
            >
              <RefreshCw className="w-2 h-2" />
            </button>
          </div>

          {/* Screen Content: LOCK SCREEN vs HOME SCREEN */}
          <div className="relative z-20 flex-1 flex flex-col justify-between p-6">
            {screenView === 'lock' ? (
              /* ================= SIMPLIFIED CLEAN LOCK SCREEN ================= */
              <div className="flex-1 flex flex-col justify-between py-5 animate-fade-in select-none">
                {/* Minimal Lock Header: Clean Clock & Date */}
                <div className="text-center pt-2">
                  <h1 className="text-5xl font-light text-white tracking-tight drop-shadow-md font-sans">
                    12:45
                  </h1>
                  <p className="text-xs text-neutral-300 font-medium drop-shadow mt-1">
                    Thursday, September 17
                  </p>
                </div>

                {/* Center: Simplified Clean "It's locked for a reason" with Gyro Parallax (10-20px) */}
                <div className="my-auto text-center px-4 py-8 flex flex-col items-center justify-center">
                  <div
                    id="gyro-lock-text-container"
                    style={{
                      transform: `translate3d(${gyroOffset.x}px, ${gyroOffset.y}px, 0)`,
                      textShadow: `${-gyroOffset.x * 0.4}px ${-gyroOffset.y * 0.4}px 14px rgba(244, 63, 94, 0.45)`,
                    }}
                    className="transition-transform duration-100 ease-out flex flex-col items-center justify-center cursor-default"
                  >
                    {/* Minimalist Lock Icon */}
                    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/80 mb-3 shadow">
                      <Lock className="w-3.5 h-3.5" />
                    </div>

                    {/* Ambient organic floating text (10-20px range) */}
                    <div className="animate-gyro-float">
                      <div className="text-xs sm:text-sm font-bold tracking-widest font-mono text-white uppercase text-center px-4 py-1.5 rounded-full bg-black/40 border border-white/15 backdrop-blur-md shadow-lg">
                        {settings.lockScreenMainText}
                      </div>
                      {settings.lockScreenSubText && (
                        <p className="text-[10px] font-mono tracking-wider text-rose-300/90 drop-shadow mt-2 text-center">
                          {settings.lockScreenSubText}
                        </p>
                      )}
                    </div>

                    {/* Subtle Gyro Parallax Live Indicator */}
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/30 border border-white/10 text-[9px] font-mono text-neutral-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>
                        Gyro Tilt:{' '}
                        {Math.abs(gyroOffset.x) > 0.5 || Math.abs(gyroOffset.y) > 0.5
                          ? `${gyroOffset.x > 0 ? '+' : ''}${Math.round(gyroOffset.x)}px, ${gyroOffset.y > 0 ? '+' : ''}${Math.round(gyroOffset.y)}px`
                          : 'Centered (0px)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simplified Swipe Up to Unlock Action */}
                <div className="text-center pb-2">
                  <button
                    id="btn-simulate-unlock"
                    onClick={() => onSetScreenView('home')}
                    className="group mx-auto py-2 px-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    <Unlock className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span>Swipe up or tap to unlock</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ================= HOME SCREEN VIEW ================= */
              <div className="flex-1 flex flex-col justify-between py-3 animate-fade-in">
                {/* Search Bar Widget */}
                <div className="pt-2">
                  <div className="w-full py-2 px-3.5 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-between text-neutral-300 text-xs shadow-md">
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[11px] text-neutral-400">Search apps & web...</span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">
                      G
                    </div>
                  </div>
                </div>

                {/* App Icons Grid */}
                <div className="my-auto grid grid-cols-4 gap-4 py-8 px-2">
                  {[
                    { name: 'Phone', icon: Phone, color: 'bg-emerald-500' },
                    { name: 'Messages', icon: MessageSquare, color: 'bg-blue-500' },
                    { name: 'Camera', icon: Camera, color: 'bg-rose-500' },
                    { name: 'Settings', icon: Settings, color: 'bg-neutral-600' },
                  ].map((app, idx) => {
                    const IconComp = app.icon;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-11 h-11 rounded-2xl ${app.color} text-white flex items-center justify-center shadow-lg transform active:scale-90 transition-transform`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-medium text-white drop-shadow">
                          {app.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Lock Screen Return & Dock */}
                <div className="pb-2 flex flex-col gap-2">
                  <button
                    id="btn-simulate-lock"
                    onClick={() => onSetScreenView('lock')}
                    className="w-full py-2 px-3 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 backdrop-blur-md text-neutral-300 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Lock Device (View Lock Screen Wallpaper)</span>
                  </button>

                  {/* Android Navigation Gesture Bar */}
                  <div className="w-28 h-1 rounded-full bg-white/70 mx-auto mt-2 shadow" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Screen Mode Switcher & Quick Upload Bar Below Chassis */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 bg-neutral-900/90 border border-neutral-800 p-1.5 rounded-2xl shadow-md">
          <button
            id="btn-tab-lock-screen"
            onClick={() => onSetScreenView('lock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              screenView === 'lock'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Screen</span>
          </button>

          <button
            id="btn-tab-home-screen"
            onClick={() => onSetScreenView('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              screenView === 'home'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Home Screen</span>
          </button>
        </div>

        {/* Quick Upload Button */}
        {onCustomVideoUploaded && (
          <label className="cursor-pointer px-3 py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Video</span>
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
        Tip: The right sidebar is <strong className="text-neutral-400">thin & edge-merged</strong> (drag vertically). Move cursor or tilt phone to see the lock screen text move 10–20px with <strong className="text-neutral-400">gyro parallax</strong>.
      </p>
    </div>
  );
}
