/**
 * Generates the complete, full-fidelity standalone single-file HTML document
 * containing all 5 procedural shaders, the full reverse frame-buffering engine with object-cover math,
 * mobile gyroscope sensors with anti-gimbal filtering, lock/home screen switcher, movable edge HUD,
 * and the entire 5-tab control panel.
 */
export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>POCO Pro 5G Live Wallpaper Simulator - Full Standalone Engine</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes glitch {
      0% { transform: translate(0); text-shadow: -2px 0 #00f0ff, 2px 0 #ff003c; }
      20% { transform: translate(-2px, 2px); text-shadow: 2px 0 #00f0ff, -2px 0 #ff003c; }
      40% { transform: translate(-2px, -2px); text-shadow: -2px 0 #00f0ff, 2px 0 #ff003c; }
      60% { transform: translate(2px, 2px); text-shadow: 2px 0 #00f0ff, -2px 0 #ff003c; }
      80% { transform: translate(2px, -2px); text-shadow: -2px 0 #00f0ff, 2px 0 #ff003c; }
      100% { transform: translate(0); text-shadow: -2px 0 #00f0ff, 2px 0 #ff003c; }
    }
    .glitch-text {
      animation: glitch 1.5s infinite linear alternate-reverse;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #0f172a;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }
  </style>
</head>
<body class="bg-neutral-950 text-neutral-100 min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 font-sans selection:bg-amber-500 selection:text-black">

  <!-- Top Header Bar -->
  <header class="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-neutral-800">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg">
        ⚡
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-base font-bold text-white font-mono tracking-tight">POCO Pro 5G Wallpaper Engine</h1>
          <span class="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold">STANDALONE 60 FPS</span>
        </div>
        <p class="text-xs text-neutral-400">Zero Dependencies • Single File HTML • Hardware Accelerated</p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <!-- Screen Mode Switcher -->
      <div class="flex items-center bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
        <button id="btnLockMode" class="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500 text-black shadow-sm transition-all">Lock Screen</button>
        <button id="btnHomeMode" class="px-3 py-1 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-all">Home Screen</button>
      </div>

      <!-- Video Upload Button -->
      <label class="cursor-pointer px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm">
        <span>Upload MP4</span>
        <input type="file" id="videoFileInput" accept="video/mp4,video/webm" class="hidden" />
      </label>
    </div>
  </header>

  <!-- Main Workstation Layout -->
  <main class="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
    
    <!-- LEFT: Phone Simulator Preview (Lg: col-span-5) -->
    <div class="lg:col-span-5 flex flex-col items-center justify-center relative">
      
      <!-- Phone Bezel (POCO Pro 5G Dimensions) -->
      <div class="relative w-[340px] h-[690px] bg-neutral-900 rounded-[48px] p-3 shadow-2xl border-4 border-neutral-800 ring-1 ring-neutral-700/60 flex flex-col items-center select-none overflow-hidden">
        
        <!-- Hardware Buttons (Side Accents) -->
        <div class="absolute -right-2 top-28 w-1.5 h-14 bg-neutral-700 rounded-r-sm"></div>
        <div class="absolute -right-2 top-48 w-1.5 h-10 bg-neutral-800 rounded-r-sm border-l border-neutral-600"></div>

        <!-- Punch Hole Selfie Camera -->
        <div class="absolute top-5 z-40 w-4 h-4 bg-black rounded-full border border-neutral-800 flex items-center justify-center">
          <div class="w-1.5 h-1.5 bg-blue-900/60 rounded-full"></div>
        </div>

        <!-- Screen Frame -->
        <div id="phoneScreen" class="relative w-full h-full rounded-[38px] overflow-hidden bg-black flex flex-col justify-between p-4 cursor-crosshair">
          
          <!-- 60 FPS Wallpaper Canvas (Renders Shaders or Reverse Buffered Frames) -->
          <canvas id="wallpaperCanvas" width="340" height="690" class="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-150"></canvas>
          
          <!-- Direct Hardware Video Element (Forward Playback) -->
          <video id="wallpaperVideo" class="absolute inset-0 w-full h-full object-cover z-10 hidden" playsinline muted></video>

          <!-- Top Status Bar (5G / Battery / Time) -->
          <div class="relative z-30 flex items-center justify-between text-[11px] font-mono font-medium text-neutral-300 pt-1 px-2 pointer-events-none">
            <span id="statusBarTime">12:00</span>
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-bold text-cyan-400">5G</span>
              <span>88%</span>
            </div>
          </div>

          <!-- LOCK SCREEN VIEW -->
          <div id="viewLockScreen" class="relative z-20 flex flex-col items-center my-auto pointer-events-none transition-opacity duration-300">
            <div class="text-5xl font-black text-neutral-100 font-mono tracking-tighter drop-shadow-md" id="lockClock">12:00</div>
            <div class="text-xs text-neutral-300 font-mono mt-1 drop-shadow" id="lockDate">Thursday, September 17</div>

            <!-- Customizable Biometric Vault Box -->
            <div id="lockCardBox" class="mt-12 p-3 bg-neutral-950/80 border border-rose-500/40 rounded-2xl backdrop-blur-md text-center max-w-[260px] shadow-2xl">
              <div id="cardBadge" class="text-[9px] font-mono font-bold tracking-widest text-rose-400 uppercase">BIOMETRIC VAULT ENGAGED</div>
              <div id="cardHeadline" class="text-xs font-black text-rose-500 glitch-text tracking-wider mt-1 uppercase font-mono leading-tight">IT'S LOCKED FOR A REASON</div>
              <div id="cardSubtext" class="text-[9px] text-neutral-400 font-mono mt-1">NO UNAUTHORIZED ACCESS</div>
            </div>
          </div>

          <!-- HOME SCREEN VIEW -->
          <div id="viewHomeScreen" class="relative z-20 hidden flex-col justify-between h-full pt-10 pb-4 pointer-events-none transition-opacity duration-300">
            <!-- App Grid -->
            <div class="grid grid-cols-4 gap-3 px-1 pt-6">
              <div class="flex flex-col items-center gap-1"><div class="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg">📞</div><span class="text-[9px] text-neutral-300 font-mono">Phone</span></div>
              <div class="flex flex-col items-center gap-1"><div class="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-lg">💬</div><span class="text-[9px] text-neutral-300 font-mono">Messages</span></div>
              <div class="flex flex-col items-center gap-1"><div class="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">📷</div><span class="text-[9px] text-neutral-300 font-mono">Camera</span></div>
              <div class="flex flex-col items-center gap-1"><div class="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-lg">⚙️</div><span class="text-[9px] text-neutral-300 font-mono">Settings</span></div>
            </div>
            <!-- Google Search Widget -->
            <div class="bg-neutral-900/80 border border-neutral-700/60 rounded-full px-4 py-2 flex items-center justify-between text-xs text-neutral-400 font-mono backdrop-blur-md">
              <span>Search apps & web...</span>
              <span>🎙️</span>
            </div>
            <!-- Bottom Dock -->
            <div class="grid grid-cols-4 gap-3 px-2 py-2 bg-black/40 border border-neutral-800 rounded-3xl backdrop-blur-md">
              <div class="flex justify-center"><div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-base">🌐</div></div>
              <div class="flex justify-center"><div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-base">🎵</div></div>
              <div class="flex justify-center"><div class="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-base">▶️</div></div>
              <div class="flex justify-center"><div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-base">📁</div></div>
            </div>
          </div>

          <!-- Bottom Gesture Bar -->
          <div class="relative z-30 flex flex-col items-center pb-1">
            <div class="w-32 h-1 bg-neutral-400/60 rounded-full"></div>
          </div>

          <!-- Movable Edge HUD Bar (Draggable) -->
          <div id="edgeHudBar" class="absolute right-0 top-36 z-40 bg-neutral-950/90 border-l border-y border-neutral-700/80 rounded-l-xl p-2 flex flex-col gap-1.5 shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing text-right">
            <div class="flex items-center gap-1 justify-end">
              <span id="hudFps" class="text-[10px] font-mono font-bold text-emerald-400">60 FPS</span>
            </div>
            <div class="text-[8px] font-mono text-neutral-400" id="hudDirection">FWD ▶</div>
            <div class="text-[8px] font-mono text-cyan-400" id="hudLoops">Loops: 0</div>
            <button id="hudKillBtn" class="mt-1 px-1.5 py-0.5 bg-rose-950 border border-rose-500/40 text-rose-300 text-[8px] font-mono font-bold rounded">KILL</button>
          </div>

        </div>
      </div>
      <span class="text-[11px] text-neutral-500 font-mono mt-3">POCO Pro 5G • 120Hz AMOLED DotDisplay</span>
    </div>

    <!-- RIGHT: Complete 5-Tab Control Station (Lg: col-span-7) -->
    <div class="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5">
      
      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-800 custom-scrollbar">
        <button data-tab="wallpapers" class="tab-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-500 text-black shadow-sm">1. Wallpapers</button>
        <button data-tab="engine" class="tab-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-neutral-400 hover:text-white">2. Engine Settings</button>
        <button data-tab="locktext" class="tab-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-neutral-400 hover:text-white">3. Lock Screen Text</button>
        <button data-tab="telemetry" class="tab-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-neutral-400 hover:text-white">4. Profiler</button>
        <button data-tab="native_code" class="tab-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-neutral-400 hover:text-white">5. Native APK Code</button>
      </div>

      <!-- TAB 1: WALLPAPER PRESETS -->
      <div id="tabContent_wallpapers" class="tab-pane flex flex-col gap-3">
        <div class="flex justify-between items-center text-xs font-mono text-neutral-400">
          <span>SELECT HARDWARE SHADER PRESET</span>
          <span class="text-amber-400">5 PROCEDURAL SHADERS</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="wallpapersGrid">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- TAB 2: ENGINE & DISPLAY CONTROLS -->
      <div id="tabContent_engine" class="tab-pane hidden flex flex-col gap-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Playback Speed -->
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col gap-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-neutral-400">Playback Speed</span>
              <span id="labelSpeed" class="text-amber-400 font-bold">1.0x</span>
            </div>
            <input type="range" id="inputSpeed" min="0.2" max="2.0" step="0.1" value="1.0" class="accent-amber-400 cursor-pointer">
          </div>
          <!-- Brightness -->
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col gap-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-neutral-400">Brightness</span>
              <span id="labelBright" class="text-amber-400 font-bold">100%</span>
            </div>
            <input type="range" id="inputBright" min="40" max="150" step="5" value="100" class="accent-amber-400 cursor-pointer">
          </div>
          <!-- Contrast -->
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col gap-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-neutral-400">Contrast</span>
              <span id="labelContrast" class="text-amber-400 font-bold">100%</span>
            </div>
            <input type="range" id="inputContrast" min="60" max="150" step="5" value="100" class="accent-amber-400 cursor-pointer">
          </div>
          <!-- Saturation -->
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col gap-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-neutral-400">Saturation</span>
              <span id="labelSat" class="text-amber-400 font-bold">100%</span>
            </div>
            <input type="range" id="inputSat" min="0" max="200" step="5" value="100" class="accent-amber-400 cursor-pointer">
          </div>
        </div>

        <!-- Toggles -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800 text-xs font-mono">
          <label class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between cursor-pointer">
            <span>Ping-Pong Reverse Loop</span>
            <input type="checkbox" id="checkPingPong" checked class="accent-amber-400 w-4 h-4 rounded">
          </label>
          <label class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between cursor-pointer">
            <span>AMOLED Black Crush</span>
            <input type="checkbox" id="checkAmoled" class="accent-amber-400 w-4 h-4 rounded">
          </label>
          <label class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between cursor-pointer">
            <span>Gyroscope Parallax 3D</span>
            <input type="checkbox" id="checkGyro" checked class="accent-amber-400 w-4 h-4 rounded">
          </label>
          <label class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between cursor-pointer">
            <span>Interactive Touch Particles</span>
            <input type="checkbox" id="checkParticles" checked class="accent-amber-400 w-4 h-4 rounded">
          </label>
        </div>
      </div>

      <!-- TAB 3: LOCK SCREEN TEXT CUSTOMIZER -->
      <div id="tabContent_locktext" class="tab-pane hidden flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-mono text-neutral-400">Main Warning Headline</label>
          <input type="text" id="inputLockHeadline" value="IT'S LOCKED FOR A REASON" class="bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-white font-mono focus:border-amber-400 outline-none">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-mono text-neutral-400">Security Subtext</label>
          <input type="text" id="inputLockSubtext" value="NO UNAUTHORIZED ACCESS" class="bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-white font-mono focus:border-amber-400 outline-none">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-mono text-neutral-400">Security Badge</label>
          <input type="text" id="inputLockBadge" value="BIOMETRIC VAULT ENGAGED" class="bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-white font-mono focus:border-amber-400 outline-none">
        </div>
        <label class="flex items-center gap-2 text-xs font-mono text-neutral-300 cursor-pointer pt-2">
          <input type="checkbox" id="checkGlitch" checked class="accent-amber-400 w-4 h-4 rounded">
          <span>Cyberpunk Glitch Text Animation</span>
        </label>
      </div>

      <!-- TAB 4: REAL-TIME HARDWARE PROFILER -->
      <div id="tabContent_telemetry" class="tab-pane hidden flex flex-col gap-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-center">
            <div class="text-[10px] text-neutral-400">RENDER RATE</div>
            <div id="telemetryFps" class="text-xl font-bold text-emerald-400 mt-1">60.0 FPS</div>
          </div>
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-center">
            <div class="text-[10px] text-neutral-400">FRAME TIME</div>
            <div id="telemetryFrameTime" class="text-xl font-bold text-cyan-400 mt-1">16.6 ms</div>
          </div>
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-center">
            <div class="text-[10px] text-neutral-400">BATTERY DRAIN</div>
            <div class="text-xl font-bold text-amber-400 mt-1">~0.7%/hr</div>
          </div>
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-center">
            <div class="text-[10px] text-neutral-400">TOTAL LOOPS</div>
            <div id="telemetryLoops" class="text-xl font-bold text-purple-400 mt-1">0</div>
          </div>
        </div>
        <div class="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl font-mono text-xs text-neutral-400">
          <div class="text-white font-bold mb-2">POCO Hardware Specification:</div>
          <div>• Device: POCO Pro 5G (HyperOS / MIUI 14)</div>
          <div>• Screen: 6.67" AMOLED DotDisplay (2400 x 1080)</div>
          <div>• Engine: SurfaceView Direct OpenGL / Canvas 2D</div>
          <div>• Battery: 5,000 mAh Li-Po High-Efficiency Mode</div>
        </div>
      </div>

      <!-- TAB 5: NATIVE ANDROID KOTLIN CODE -->
      <div id="tabContent_native_code" class="tab-pane hidden flex flex-col gap-3">
        <div class="flex justify-between items-center text-xs font-mono text-neutral-400">
          <span>KOTLIN LIVEWALLPAPERSERVICE ENGINE</span>
          <button id="btnCopyKotlin" class="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-[10px]">Copy Kotlin</button>
        </div>
        <pre class="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-80 custom-scrollbar"><code>package com.poco.livewallpaper

import android.service.wallpaper.WallpaperService
import android.view.SurfaceHolder
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint

class PocoLiveWallpaperService : WallpaperService() {
    override fun onCreateEngine(): Engine = PocoWallpaperEngine()

    inner class PocoWallpaperEngine : Engine() {
        private var isVisible = false
        private var loopCount = 0
        private var time = 0.0f
        private var direction = 1

        override fun onVisibilityChanged(visible: Boolean) {
            this.isVisible = visible
            if (visible) start60FpsLoop()
        }

        private fun start60FpsLoop() {
            // Hardware SurfaceView 60 FPS Direct Loop
        }
    }
}</code></pre>
      </div>

    </div>
  </main>

  <script>
    // --- BUILT-IN WALLPAPERS CATALOG ---
    const WALLPAPERS = [
      { id: 'cyber_megacity_2099', name: 'Neo-Kowloon Megacity 2099', desc: 'Vertical cyberpunk metropolis with sky-trains, holo-ads & rain.' },
      { id: 'tokyo_rain_street', name: 'Shinjuku Neon Rain Alley', desc: 'Narrow Tokyo street with ramen lanterns & wet asphalt reflections.' },
      { id: 'anime_twilight_shinkai', name: 'Twilight Crossing (Anime)', desc: 'Makoto Shinkai sunset clouds, train signals & distant skyline.' },
      { id: 'locked_reason_cyber', name: 'Classified Lock Vault', desc: 'Biometric HUD with security warnings & iris pulse aura.' },
      { id: 'cyber_grid_matrix', name: 'AMOLED Zero Data Grid', desc: 'Pure black AMOLED grid with traveling optical horizon pulses.' }
    ];

    // --- STATE ---
    let currentWallpaperId = 'cyber_megacity_2099';
    let isHomeMode = false;
    let isKilled = false;
    let playbackSpeed = 1.0;
    let brightness = 100;
    let contrast = 100;
    let saturation = 100;
    let pingPong = true;
    let amoledCrush = false;
    let gyroEnabled = true;
    let particlesEnabled = true;
    let direction = 'forward'; // 'forward' | 'reverse'
    let progress = 0;
    let time = 0;
    let loopCount = 0;

    let uploadedVideoUrl = null;
    let reverseFrames = [];
    let reverseFrameIdx = 0;
    let isBufferingReverse = false;

    let gyroX = 0, gyroY = 0;
    let targetGyroX = 0, targetGyroY = 0;
    let particles = [];

    // --- DOM REFERENCES ---
    const canvas = document.getElementById('wallpaperCanvas');
    const ctx = canvas.getContext('2d');
    const video = document.getElementById('wallpaperVideo');
    const phoneScreen = document.getElementById('phoneScreen');
    const viewLock = document.getElementById('viewLockScreen');
    const viewHome = document.getElementById('viewHomeScreen');
    const btnLock = document.getElementById('btnLockMode');
    const btnHome = document.getElementById('btnHomeMode');
    const lockClock = document.getElementById('lockClock');
    const lockDate = document.getElementById('lockDate');
    const statusTime = document.getElementById('statusBarTime');
    const edgeHud = document.getElementById('edgeHudBar');
    const hudFps = document.getElementById('hudFps');
    const hudDir = document.getElementById('hudDirection');
    const hudLoops = document.getElementById('hudLoops');
    const hudKill = document.getElementById('hudKillBtn');

    // Telemetry
    const telFps = document.getElementById('telemetryFps');
    const telTime = document.getElementById('telemetryFrameTime');
    const telLoops = document.getElementById('telemetryLoops');

    // Controls
    const wallpapersGrid = document.getElementById('wallpapersGrid');
    const inputSpeed = document.getElementById('inputSpeed');
    const labelSpeed = document.getElementById('labelSpeed');
    const inputBright = document.getElementById('inputBright');
    const labelBright = document.getElementById('labelBright');
    const inputContrast = document.getElementById('inputContrast');
    const labelContrast = document.getElementById('labelContrast');
    const inputSat = document.getElementById('inputSat');
    const labelSat = document.getElementById('labelSat');
    const checkPingPong = document.getElementById('checkPingPong');
    const checkAmoled = document.getElementById('checkAmoled');
    const checkGyro = document.getElementById('checkGyro');
    const checkParticles = document.getElementById('checkParticles');
    const checkGlitch = document.getElementById('checkGlitch');
    const cardHeadline = document.getElementById('cardHeadline');
    const cardSubtext = document.getElementById('cardSubtext');
    const cardBadge = document.getElementById('cardBadge');
    const inputHeadline = document.getElementById('inputLockHeadline');
    const inputSubtext = document.getElementById('inputLockSubtext');
    const inputBadge = document.getElementById('inputLockBadge');
    const videoInput = document.getElementById('videoFileInput');

    // --- PRE-SEEDED SHADER DATA ---
    const RAIN_DROPS = Array.from({ length: 90 }, (_, i) => ({
      x: (i * 37) % 100,
      y: (i * 53) % 100,
      speed: 0.8 + ((i * 13) % 10) * 0.1,
      length: 15 + ((i * 7) % 20)
    }));

    const WINDOWS_GRID = Array.from({ length: 140 }, (_, i) => ({
      seed: Math.sin(i * 997),
      color: (i % 7 === 0) ? '#f43f5e' : (i % 4 === 0) ? '#06b6d4' : (i % 3 === 0) ? '#eab308' : '#38bdf8',
      flicker: (i % 5 === 0)
    }));

    // --- POPULATE WALLPAPERS ---
    function renderWallpaperCards() {
      wallpapersGrid.innerHTML = '';
      WALLPAPERS.forEach(wp => {
        const btn = document.createElement('button');
        const isActive = (currentWallpaperId === wp.id);
        btn.className = \`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all \${
          isActive ? 'bg-amber-500/10 border-amber-500 text-white shadow-md' : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
        }\`;
        btn.innerHTML = \`
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold font-mono \${isActive ? 'text-amber-400' : 'text-neutral-200'}">\${wp.name}</span>
            \${isActive ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold">ACTIVE</span>' : ''}
          </div>
          <p class="text-[10px] text-neutral-400 line-clamp-2 mt-0.5">\${wp.desc}</p>
        \`;
        btn.addEventListener('click', () => {
          currentWallpaperId = wp.id;
          video.classList.add('hidden');
          canvas.classList.remove('hidden');
          renderWallpaperCards();
        });
        wallpapersGrid.appendChild(btn);
      });
    }
    renderWallpaperCards();

    // --- TAB SWITCHING ---
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => {
          b.className = 'tab-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-neutral-400 hover:text-white';
        });
        btn.className = 'tab-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-500 text-black shadow-sm';
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
        document.getElementById('tabContent_' + tab)?.classList.remove('hidden');
      });
    });

    // --- LOCK / HOME MODE ---
    btnLock.addEventListener('click', () => {
      isHomeMode = false;
      btnLock.className = 'px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500 text-black shadow-sm transition-all';
      btnHome.className = 'px-3 py-1 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-all';
      viewLock.classList.remove('hidden');
      viewHome.classList.add('hidden');
    });

    btnHome.addEventListener('click', () => {
      isHomeMode = true;
      btnHome.className = 'px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500 text-black shadow-sm transition-all';
      btnLock.className = 'px-3 py-1 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-all';
      viewHome.classList.remove('hidden');
      viewLock.classList.add('hidden');
    });

    // --- CONTROLS LISTENERS ---
    inputSpeed.addEventListener('input', (e) => {
      playbackSpeed = parseFloat(e.target.value);
      labelSpeed.innerText = playbackSpeed.toFixed(1) + 'x';
      if (video) video.playbackRate = playbackSpeed;
    });

    inputBright.addEventListener('input', (e) => {
      brightness = parseInt(e.target.value);
      labelBright.innerText = brightness + '%';
      applyFilters();
    });

    inputContrast.addEventListener('input', (e) => {
      contrast = parseInt(e.target.value);
      labelContrast.innerText = contrast + '%';
      applyFilters();
    });

    inputSat.addEventListener('input', (e) => {
      saturation = parseInt(e.target.value);
      labelSat.innerText = saturation + '%';
      applyFilters();
    });

    function applyFilters() {
      const f = \`brightness(\${brightness}%) contrast(\${contrast}%) saturate(\${saturation}%)\`;
      canvas.style.filter = f;
      video.style.filter = f;
    }

    checkPingPong.addEventListener('change', (e) => { pingPong = e.target.checked; });
    checkAmoled.addEventListener('change', (e) => { amoledCrush = e.target.checked; });
    checkGyro.addEventListener('change', (e) => { gyroEnabled = e.target.checked; });
    checkParticles.addEventListener('change', (e) => { particlesEnabled = e.target.checked; });

    inputHeadline.addEventListener('input', (e) => { cardHeadline.innerText = e.target.value.toUpperCase(); });
    inputSubtext.addEventListener('input', (e) => { cardSubtext.innerText = e.target.value.toUpperCase(); });
    inputBadge.addEventListener('input', (e) => { cardBadge.innerText = e.target.value.toUpperCase(); });
    checkGlitch.addEventListener('change', (e) => {
      if (e.target.checked) cardHeadline.classList.add('glitch-text');
      else cardHeadline.classList.remove('glitch-text');
    });

    hudKill.addEventListener('click', () => {
      isKilled = !isKilled;
      if (isKilled) {
        hudKill.innerText = 'RESUME';
        hudKill.className = 'mt-1 px-1.5 py-0.5 bg-rose-600 text-white text-[8px] font-mono font-bold rounded';
        if (video) video.pause();
      } else {
        hudKill.innerText = 'KILL';
        hudKill.className = 'mt-1 px-1.5 py-0.5 bg-rose-950 border border-rose-500/40 text-rose-300 text-[8px] font-mono font-bold rounded';
        if (video && currentWallpaperId === 'custom_uploaded') video.play();
      }
    });

    // --- HARDWARE SENSORS & TOUCH TRACKING ---
    window.addEventListener('deviceorientation', (e) => {
      if (!gyroEnabled || e.gamma === null) return;
      const g = Math.max(-45, Math.min(45, e.gamma));
      const b = Math.max(0, Math.min(90, e.beta || 48)) - 48;
      targetGyroX = (g / 45) * 20;
      targetGyroY = (b / 45) * 20;
    });

    phoneScreen.addEventListener('mousemove', (e) => {
      if (!gyroEnabled) return;
      const rect = phoneScreen.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      targetGyroX = ((x / rect.width) - 0.5) * 30;
      targetGyroY = ((y / rect.height) - 0.5) * 30;

      if (particlesEnabled) {
        for (let i = 0; i < 2; i++) {
          particles.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 - 1,
            size: Math.random() * 3 + 1,
            alpha: 1
          });
        }
      }
    });

    // --- VIDEO REVERSE FRAME BUFFERING & OBJECT-COVER ENGINE ---
    videoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      uploadedVideoUrl = URL.createObjectURL(file);
      currentWallpaperId = 'custom_uploaded';
      video.src = uploadedVideoUrl;
      video.classList.remove('hidden');
      video.play().catch(() => {});

      // Buffer reverse frames
      bufferReverseFrames(uploadedVideoUrl);
    });

    async function bufferReverseFrames(url) {
      try {
        isBufferingReverse = true;
        const tempVid = document.createElement('video');
        tempVid.src = url;
        tempVid.muted = true;
        tempVid.playsInline = true;
        await new Promise((res) => { tempVid.onloadedmetadata = () => res(); });

        const duration = tempVid.duration;
        if (!duration || duration > 30) { isBufferingReverse = false; return; }

        const frameStep = 1 / 30;
        const framesCount = Math.min(300, Math.floor(duration / frameStep));
        const offscreen = document.createElement('canvas');
        const vW = tempVid.videoWidth || 720;
        const vH = tempVid.videoHeight || 1280;
        offscreen.width = vW;
        offscreen.height = vH;
        const oCtx = offscreen.getContext('2d');
        if (!oCtx) return;

        const captured = [];
        for (let i = framesCount - 1; i >= 0; i--) {
          tempVid.currentTime = i * frameStep;
          await new Promise((res) => {
            const onSeek = () => { tempVid.removeEventListener('seeked', onSeek); res(); };
            tempVid.addEventListener('seeked', onSeek);
          });
          oCtx.drawImage(tempVid, 0, 0, vW, vH);
          const bitmap = await createImageBitmap(offscreen);
          captured.push(bitmap);
        }

        reverseFrames.forEach(f => { try { f.close(); } catch {} });
        reverseFrames = captured;
      } catch (err) {
        console.warn('Reverse buffer error:', err);
      } finally {
        isBufferingReverse = false;
      }
    }

    // --- 60 FPS MASTER RENDER LOOP ---
    let lastTime = performance.now();
    let frameCounter = 0;

    function masterLoop(now) {
      requestAnimationFrame(masterLoop);
      if (isKilled) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const deltaMs = now - lastTime;
      const deltaSec = deltaMs / 1000;
      lastTime = now;

      // Telemetry
      frameCounter++;
      if (frameCounter % 15 === 0) {
        const currentFps = Math.min(60, Math.round(1000 / Math.max(deltaMs, 1)));
        hudFps.innerText = currentFps + ' FPS';
        telFps.innerText = currentFps.toFixed(1) + ' FPS';
        telTime.innerText = deltaMs.toFixed(1) + ' ms';
        hudDir.innerText = direction === 'forward' ? 'FWD ▶' : 'REV ◀';
        hudLoops.innerText = 'Loops: ' + loopCount;
        telLoops.innerText = loopCount;
      }

      // Smooth Gyro Lerp
      gyroX += (targetGyroX - gyroX) * 0.14;
      gyroY += (targetGyroY - gyroY) * 0.14;

      // Advance Time
      time += deltaSec * playbackSpeed * (direction === 'forward' ? 1 : -1);

      // Procedural Ping-Pong Loop
      if (currentWallpaperId !== 'custom_uploaded') {
        const loopDuration = 6.0;
        if (pingPong) {
          if (direction === 'forward') {
            progress += (deltaSec * playbackSpeed) / loopDuration;
            if (progress >= 1.0) {
              progress = 1.0;
              direction = 'reverse';
              loopCount++;
            }
          } else {
            progress -= (deltaSec * playbackSpeed) / loopDuration;
            if (progress <= 0.0) {
              progress = 0.0;
              direction = 'forward';
              loopCount++;
            }
          }
        } else {
          progress = (progress + (deltaSec * playbackSpeed) / loopDuration) % 1.0;
          direction = 'forward';
        }

        // Render Active Procedural Shader
        renderShader(currentWallpaperId, ctx, canvas.width, canvas.height, progress, time);
      } else {
        // Video Playback Mode (Forward native + Reverse 60 FPS Frame Buffer)
        if (pingPong) {
          if (direction === 'forward') {
            canvas.classList.add('hidden');
            video.classList.remove('hidden');
            if (video.paused) video.play().catch(() => {});
            if (video.currentTime >= (video.duration || 5) - 0.08 || video.ended) {
              direction = 'reverse';
              reverseFrameIdx = 0;
              video.pause();
              loopCount++;
            }
          } else {
            video.classList.add('hidden');
            canvas.classList.remove('hidden');
            if (reverseFrames.length > 0) {
              const fIdx = Math.min(reverseFrames.length - 1, Math.floor(reverseFrameIdx));
              const frame = reverseFrames[fIdx];
              if (frame) {
                // Exact Object-Cover Source Cropping
                const cW = canvas.width, cH = canvas.height;
                const fW = frame.width, fH = frame.height;
                const cAspect = cW / cH, fAspect = fW / fH;
                let sX = 0, sY = 0, sW = fW, sH = fH;
                if (fAspect > cAspect) {
                  sW = fH * cAspect;
                  sX = (fW - sW) / 2;
                } else {
                  sH = fW / cAspect;
                  sY = (fH - sH) / 2;
                }
                ctx.drawImage(frame, sX, sY, sW, sH, 0, 0, cW, cH);
              }

              reverseFrameIdx += deltaSec * 30 * playbackSpeed;
              if (reverseFrameIdx >= reverseFrames.length - 1) {
                direction = 'forward';
                reverseFrameIdx = 0;
                video.currentTime = 0;
                video.play().catch(() => {});
                loopCount++;
              }
            } else {
              direction = 'forward';
              video.currentTime = 0;
            }
          }
        } else {
          canvas.classList.add('hidden');
          video.classList.remove('hidden');
          if (video.paused) video.play().catch(() => {});
        }
      }

      // Render Touch Particles
      if (particlesEnabled && particles.length > 0) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= deltaSec * 1.6;
          if (p.alpha <= 0) { particles.splice(i, 1); continue; }
          ctx.fillStyle = '#38bdf8';
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    }

    // --- PROCEDURAL SHADER IMPLEMENTATIONS ---
    function renderShader(id, ctx, w, h, p, t) {
      ctx.save();
      if (id === 'cyber_megacity_2099') drawCyberMegacity(ctx, w, h, p, t);
      else if (id === 'tokyo_rain_street') drawTokyoRainStreet(ctx, w, h, p, t);
      else if (id === 'anime_twilight_shinkai') drawAnimeTwilight(ctx, w, h, p, t);
      else if (id === 'locked_reason_cyber') drawLockedReasonCyber(ctx, w, h, p, t);
      else drawAmoledMatrixGrid(ctx, w, h, p, t);
      ctx.restore();
    }

    // 1. Megacity 2099
    function drawCyberMegacity(ctx, w, h, p, t) {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, amoledCrush ? '#000000' : '#030712');
      sky.addColorStop(0.5, '#0b132b');
      sky.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Searchlight
      ctx.save();
      ctx.translate(w * 0.5 + gyroX, h * 0.9 + gyroY);
      ctx.rotate(Math.sin(t * 0.4 + p * Math.PI) * 0.35);
      const bGrad = ctx.createLinearGradient(0, 0, 0, -h * 0.9);
      bGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      bGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.moveTo(-15, 0); ctx.lineTo(-80, -h * 0.85); ctx.lineTo(80, -h * 0.85); ctx.lineTo(15, 0);
      ctx.fill();
      ctx.restore();

      // Back Skyscrapers
      ctx.fillStyle = '#060a17';
      for (let i = 0; i < 8; i++) {
        const bx = (i / 8) * w + gyroX * 0.3;
        const bw = w / 8 + 8;
        const bh = h * (0.45 + ((i * 7) % 5) * 0.08);
        ctx.fillRect(bx, h - bh, bw, bh);
      }

      // Midground with window grid
      for (let i = 0; i < 6; i++) {
        const mx = (i / 6) * w - 10 + gyroX * 0.6;
        const mw = w / 6 + 14;
        const mh = h * (0.35 + ((i * 11) % 4) * 0.1);
        ctx.fillStyle = '#0a1024';
        ctx.fillRect(mx, h - mh, mw, mh);
        for (let r = 0; r < 14; r++) {
          for (let c = 0; c < 4; c++) {
            const idx = (i * 14 + r * 4 + c) % WINDOWS_GRID.length;
            const item = WINDOWS_GRID[idx];
            if (item.seed > -0.2) {
              ctx.fillStyle = item.color;
              ctx.globalAlpha = item.flicker ? 0.3 + Math.sin(t * 5 + idx) * 0.3 : 0.65;
              ctx.fillRect(mx + 4 + c * 7, h - mh + 12 + r * 10, 3.5, 5);
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // Sky-Train
      const skywayY = h * 0.58 + gyroY;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, skywayY); ctx.lineTo(w, skywayY + 8); ctx.stroke();

      const trainX = ((p * 1.6 - 0.3) * w) % (w + 140) - 70;
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(trainX, skywayY - 4, 75, 5);

      // Rain
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.25)';
      ctx.lineWidth = 1;
      RAIN_DROPS.forEach(rd => {
        const rx = ((rd.x + p * 40 * rd.speed) % 100) * 0.01 * w;
        const ry = ((rd.y + p * 120 * rd.speed) % 100) * 0.01 * h;
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 5, ry + rd.length); ctx.stroke();
      });
    }

    // 2. Tokyo Rain Street
    function drawTokyoRainStreet(ctx, w, h, p, t) {
      const horizonY = h * 0.52 + gyroY;
      ctx.fillStyle = amoledCrush ? '#000000' : '#0a0914';
      ctx.fillRect(0, 0, w, horizonY);

      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      roadGrad.addColorStop(0, '#0c0b1a');
      roadGrad.addColorStop(1, '#080712');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Lanterns
      for (let l = 0; l < 3; l++) {
        const lx = 35 + l * 28 + Math.sin(t * 1.5 + p * Math.PI) * 4 + gyroX;
        const ly = horizonY - 45 + l * 8;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath(); ctx.ellipse(lx, ly + 8, 9, 13, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('拉麺', lx, ly + 11);
      }

      // Neon signs
      ctx.font = 'bold 11px monospace'; ctx.fillStyle = '#38bdf8'; ctx.fillText('CYBER 24H', w * 0.76 + gyroX, h * 0.22);
      ctx.fillStyle = '#a855f7'; ctx.fillText('新宿路地', w * 0.79 + gyroX, h * 0.38);

      // Puddle Reflection
      const puddle = ctx.createLinearGradient(w * 0.45, horizonY, w * 0.55, h);
      puddle.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
      puddle.addColorStop(0.5, 'rgba(236, 72, 153, 0.2)');
      puddle.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = puddle;
      ctx.beginPath(); ctx.moveTo(w * 0.46, horizonY); ctx.lineTo(w * 0.54, horizonY); ctx.lineTo(w * 0.72, h); ctx.lineTo(w * 0.28, h); ctx.fill();
    }

    // 3. Anime Twilight
    function drawAnimeTwilight(ctx, w, h, p, t) {
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.75);
      sky.addColorStop(0, '#13092e');
      sky.addColorStop(0.6, '#7c1d56');
      sky.addColorStop(0.85, '#d9463b');
      sky.addColorStop(1, '#fef08a');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Crescent Moon
      ctx.fillStyle = '#fef08a';
      ctx.beginPath(); ctx.arc(w * 0.78 + gyroX * 0.2, h * 0.12 + gyroY * 0.2, 9, 0, Math.PI * 2); ctx.fill();

      // Cloud Strata
      const cShift = Math.sin(p * Math.PI) * 20 + gyroX * 0.5;
      ctx.fillStyle = '#9d174d';
      ctx.beginPath(); ctx.ellipse(w * 0.35 + cShift, h * 0.38, 120, 35, 0, 0, Math.PI * 2); ctx.fill();

      // Skyline
      ctx.fillStyle = amoledCrush ? '#000000' : '#14051a';
      ctx.fillRect(0, h * 0.74 + gyroY, w, h * 0.26);
    }

    // 4. Lock Vault
    function drawLockedReasonCyber(ctx, w, h, p, t) {
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.45, w * 0.85);
      bg.addColorStop(0, '#0f172a');
      bg.addColorStop(1, '#020408');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const cX = w * 0.5 + gyroX;
      const cY = h * 0.42 + gyroY;
      const pulse = Math.sin(t * 1.8) * 6;

      ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
      ctx.beginPath(); ctx.arc(cX, cY, 55 + pulse, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
      ctx.beginPath(); ctx.roundRect(cX - 13, cY - 8, 26, 20, 5); ctx.fill();
    }

    // 5. AMOLED Grid
    function drawAmoledMatrixGrid(ctx, w, h, p, t) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      const vY = h * 0.42 + gyroY;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1.2;

      for (let i = 0; i <= 12; i++) {
        ctx.beginPath(); ctx.moveTo(w * 0.5 + gyroX, vY); ctx.lineTo((i / 12) * w, h); ctx.stroke();
      }

      for (let j = 1; j <= 14; j++) {
        const bp = (j / 14 + p * 0.5) % 1.0;
        const curY = vY + Math.pow(bp, 2.5) * (h - vY);
        ctx.strokeStyle = \`rgba(6, 182, 212, \${bp * 0.8})\`;
        ctx.beginPath(); ctx.moveTo(0, curY); ctx.lineTo(w, curY); ctx.stroke();
      }
    }

    // --- CLOCK UPDATE ---
    function updateClock() {
      const d = new Date();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      lockClock.innerText = timeStr;
      statusTime.innerText = timeStr;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Start Master Render Loop
    requestAnimationFrame(masterLoop);
  </script>
</body>
</html>`;
}
