/**
 * Type definitions for Poco Live Wallpaper Engine
 */

export type FpsTarget = 30 | 45 | 60 | 90;

export type WallpaperCategory = 'cyberpunk_city' | 'tokyo_street' | 'anime_scenery' | 'lock_screen' | 'custom';

export type LockBadgeStyle = 'biometric' | 'classified' | 'neon_lock' | 'glitch_warning';

export interface WallpaperItem {
  id: string;
  name: string;
  category: WallpaperCategory;
  description: string;
  videoUrl?: string; // Optional direct video URL
  fallbackType?: 'canvas_procedural' | 'uploaded_video';
  tags: string[];
  aspectRatio: string;
  previewColor: string;
}

export interface EngineSettings {
  fpsTarget: FpsTarget;
  autoFpsMode: boolean; // Dynamic Adaptive Refresh Rate under system load / thermal throttling
  simulatedSystemLoad: 'normal' | 'moderate' | 'heavy' | 'overheat'; // Load simulator for testing
  playbackSpeed: number; // 0.5x to 2.0x
  trimStartSec: number;
  trimEndSec: number;
  amoledBlackCrush: boolean; // Deep blacks for AMOLED power saving
  brightness: number; // 80 - 120%
  contrast: number; // 80 - 140%
  saturation: number; // 80 - 140%
  
  // Dual Screen Configuration
  lockScreenWallpaperId: string;
  homeScreenWallpaperId: string;
  
  // "It's locked for a reason" Lock Screen Customization
  lockScreenMainText: string;
  lockScreenSubText: string;
  lockScreenBadge: LockBadgeStyle;
  lockScreenGlitchEffect: boolean;

  // Safety & Performance
  killSwitchActive: boolean; // Panic button triggered
  zeroTouchPassThrough: boolean; // Never intercept gestures / control center
  audioIgnored: boolean; // Stripped audio pipeline
}

export interface EngineTelemetry {
  currentFps: number;
  effectiveFpsCap: number; // Dynamic throttled cap when under load
  frameTimeMs: number;
  progress: number; // 0.0 to 1.0
  loopCount: number;
  batteryDrainPerHour: number; // Estimated % / hour on Poco Pro 5G (5000mAh)
  decoderMemoryMb: number;
  isObscured: boolean; // True when app opened or screen turned off
  systemLoadStatus: 'Nominal' | 'Moderate Load (-25%)' | 'Heavy Load (-50%)' | 'Thermal Throttled (-66%)';
}

export interface PocoDeviceSpecs {
  model: string;
  screenSize: string;
  refreshRate: string;
  batteryCapacity: string;
  osName: string;
  gpu: string;
}
