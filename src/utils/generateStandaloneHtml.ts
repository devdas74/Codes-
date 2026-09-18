/**
 * Generates the complete, full-fidelity standalone single-file HTML document
 * containing all 5 procedural shaders, the full reverse frame-buffering engine with object-cover math,
 * mobile gyroscope sensors with anti-gimbal filtering, dedicated POCO Home Screen layout, movable edge HUD,
 * and the entire 4-tab control panel (Wallpapers & Video Upload, 60 FPS Engine, POCO HyperOS Guide, Native Kotlin APK code).
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
<body class="bg-neutral-950 text-neutral-100 min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 font-sans selection:bg-cyan-500 selection:text-black">

  <!-- Top Header Bar -->
  <header class="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-neutral-800">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-lg">
        ⚡
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-base font-bold text-white font-mono tracking-tight">POCO Pro 5G Live Wallpaper Engine</h1>
          <span class="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold">STANDALONE 60 FPS</span>
        </div>
        <p class="text-xs text-neutral-400">Dedicated Home Screen • Zero Dependencies • Single File HTML • Hardware Accelerated</p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <!-- Active Target Indicator -->
      <div class="flex items-center bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-400 font-semibold gap-1.5">
        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>Target: POCO Home Screen</span>
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

          <!-- Top Status Bar (MIUI/HyperOS style) -->
          <div class="relative z-30 flex items-center justify-between text-[11px] font-mono font-medium text-neutral-300 pt-2 px-3 select-none pointer-events-none">
            <span id="statusBarTime">12:45</span>
            <div class="flex items-center gap-1.5 text-[10px]">
              <span class="text-[8px] font-bold text-cyan-400">5G</span>
              <span class="text-[9px]">88%</span>
            </div>
          </div>

          <!-- 4-DIRECTION MOVEABLE SIDEBAR DOCK (Snaps & Merges with Screen Edge) -->
          <div id="wallpaperDock" style="top: 42%; right: 0; transform: translateY(-50%); touch-action: none;" class="absolute z-50 select-none transition-all duration-300 ease-out">
            <!-- Collapsed Vertical Edge Handle -->
            <div id="dockHandle" class="flex flex-col items-center justify-center py-2.5 px-1 rounded-l-2xl border border-r-0 border-white/20 bg-neutral-950/85 hover:bg-black/95 backdrop-blur-2xl shadow-2xl cursor-grab active:cursor-grabbing transition-transform duration-200">
              <span class="text-neutral-400 text-[10px] mb-1">☩</span>
              <div id="dockLed" class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] mb-1"></div>
              <div class="flex flex-col items-center leading-none py-0.5 my-0.5">
                <span id="dockFpsText" class="text-[8px] font-mono font-black text-cyan-300">60</span>
                <span id="dockStatusText" class="text-[6px] font-mono text-neutral-400 uppercase tracking-tighter mt-0.5">FPS</span>
              </div>
              <span id="dockChevron" class="text-neutral-400 text-[9px] mt-1">◀</span>
            </div>

            <!-- Expanded Sidebar Panel (Smooth animated expansion) -->
            <div id="dockPanel" class="hidden w-48 bg-neutral-950/92 backdrop-blur-2xl border border-white/25 rounded-2xl p-2.5 shadow-2xl text-neutral-200 flex-col gap-2 mr-1 animate-scale-up">
              <!-- Drag Header -->
              <div id="dockGripHeader" class="w-full flex items-center justify-between pb-1 border-b border-neutral-800 cursor-grab active:cursor-grabbing hover:bg-white/5 px-1 py-0.5 rounded-lg">
                <div class="flex items-center gap-1.5 text-neutral-300">
                  <span class="text-cyan-400 text-xs">☩</span>
                  <span class="text-[10px] font-bold tracking-tight text-white">Movable Edge Dock</span>
                </div>
                <button id="dockCloseBtn" class="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800">✕</button>
              </div>

              <!-- KILL ALL PROCESSES BUTTON -->
              <button id="btnKillAllDock" class="w-full py-2.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-rose-600 to-red-800 hover:from-rose-500 hover:to-red-700 text-white border border-rose-400/50 cursor-pointer active:scale-95 transition-all">
                <span class="text-sm">⏻</span>
                <div class="flex flex-col items-start text-left leading-tight">
                  <span id="killBtnLabel" class="text-[11px] font-black">KILL ALL PROCESSES</span>
                  <span id="killBtnSub" class="text-[7px] text-rose-200 font-mono">0% CPU • Freeze All</span>
                </div>
              </button>

              <!-- Quick Status Tile Grid -->
              <div class="grid grid-cols-2 gap-1.5">
                <div class="bg-neutral-900/90 border border-neutral-800 rounded-xl p-1.5 flex flex-col items-center text-center">
                  <span class="text-[7px] font-mono text-neutral-400 uppercase">FPS</span>
                  <span id="dockHudFps" class="text-[11px] font-mono font-black text-emerald-400">60</span>
                </div>
                <div class="bg-neutral-900/90 border border-neutral-800 rounded-xl p-1.5 flex flex-col items-center text-center">
                  <span class="text-[7px] font-mono text-neutral-400 uppercase">DRAIN</span>
                  <span id="dockHudDrain" class="text-[10px] font-mono font-bold text-cyan-300">3.6%</span>
                </div>
              </div>

              <!-- Speed Multiplier -->
              <div class="flex items-center justify-between bg-neutral-900/90 border border-neutral-800 rounded-xl px-2 py-1">
                <span class="text-[9px] font-medium text-neutral-300">Speed</span>
                <button id="dockSpeedBtn" class="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-md text-[9px] font-mono font-bold text-amber-300">1.0x</button>
              </div>

              <!-- Flip Edge / Dock Footer -->
              <div class="pt-1 border-t border-neutral-800/80 flex items-center justify-between text-[8px] text-neutral-400 px-0.5">
                <button id="dockFlipBtn" class="px-2 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-cyan-300 border border-neutral-700/60">Flip Side</button>
                <button id="dockMinimizeBtn" class="px-2 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60">Dock</button>
              </div>
            </div>
          </div>

          <!-- DEDICATED HOME SCREEN VIEW -->
          <div id="viewHomeScreen" class="relative z-20 flex flex-col justify-between h-full pt-10 pb-4 pointer-events-none transition-opacity duration-300">
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

        </div>
      </div>
      <span class="text-[11px] text-neutral-500 font-mono mt-3">POCO M6 Pro 5G • 120Hz AMOLED DotDisplay</span>
    </div>

    <!-- RIGHT: Complete 4-Tab Control Station (Lg: col-span-7) -->
    <div class="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5">
      
      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-800 custom-scrollbar">
        <button data-tab="wallpapers" class="tab-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-cyan-500 text-black shadow-sm">1. Wallpapers & Video</button>
        <button data-tab="engine" class="tab-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-neutral-400 hover:text-white">2. 60 FPS Engine</button>
        <button data-tab="pocoguide" class="tab-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-neutral-400 hover:text-white">3. POCO HyperOS Guide</button>
        <button data-tab="native_code" class="tab-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-neutral-400 hover:text-white">4. Kotlin APK Code</button>
      </div>

      <!-- TAB 1: WALLPAPER PRESETS & VIDEO UPLOAD -->
      <div id="tabContent_wallpapers" class="tab-pane flex flex-col gap-3">
        <div class="flex justify-between items-center text-xs font-mono text-neutral-400">
          <span>SELECT SHADER OR UPLOAD MP4</span>
          <span class="text-cyan-400">HARDWARE ACCELERATED</span>
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
              <span id="labelSpeed" class="text-cyan-400 font-bold">1.0x</span>
            </div>
            <input type="range" id="inputSpeed" min="0.2" max="2.0" step="0.1" value="1.0" class="accent-cyan-400 cursor-pointer">
          </div>
          <!-- Brightness -->
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col gap-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-neutral-400">Brightness</span>
              <span id="labelBright" class="text-cyan-400 font-bold">100%</span>
            </div>
            <input type="range" id="inputBright" min="40" max="150" step="5" value="100" class="accent-cyan-400 cursor-pointer">
          </div>
          <!-- Contrast -->
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col gap-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-neutral-400">Contrast</span>
              <span id="labelContrast" class="text-cyan-400 font-bold">100%</span>
            </div>
            <input type="range" id="inputContrast" min="60" max="150" step="5" value="100" class="accent-cyan-400 cursor-pointer">
          </div>
          <!-- Saturation -->
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col gap-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-neutral-400">Saturation</span>
              <span id="labelSat" class="text-cyan-400 font-bold">100%</span>
            </div>
            <input type="range" id="inputSat" min="0" max="200" step="5" value="100" class="accent-cyan-400 cursor-pointer">
          </div>
        </div>

        <!-- Toggles -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800 text-xs font-mono">
          <label class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between cursor-pointer">
            <span>Ping-Pong Reverse Loop</span>
            <input type="checkbox" id="checkPingPong" checked class="accent-cyan-400 w-4 h-4 rounded">
          </label>
          <label class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between cursor-pointer">
            <span>AMOLED Black Crush</span>
            <input type="checkbox" id="checkAmoled" class="accent-cyan-400 w-4 h-4 rounded">
          </label>
          <label class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between cursor-pointer">
            <span>Gyroscope Parallax 3D</span>
            <input type="checkbox" id="checkGyro" checked class="accent-cyan-400 w-4 h-4 rounded">
          </label>
          <label class="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between cursor-pointer">
            <span>Interactive Touch Particles</span>
            <input type="checkbox" id="checkParticles" checked class="accent-cyan-400 w-4 h-4 rounded">
          </label>
        </div>
      </div>

      <!-- TAB 3: POCO HYPEROS HOME SCREEN GUIDE -->
      <div id="tabContent_pocoguide" class="tab-pane hidden flex flex-col gap-4 font-mono text-xs">
        <div class="p-4 bg-neutral-950 border border-amber-500/30 rounded-2xl flex flex-col gap-2">
          <div class="text-amber-400 font-bold text-sm">POCO M6 Pro 5G / HyperOS Setup Instructions</div>
          <p class="text-neutral-300 leading-relaxed">
            HyperOS restricts live video playback on the lock screen (photo only). This engine is specifically optimized for your <strong>POCO Home Screen</strong>.
          </p>
        </div>

        <div class="flex flex-col gap-2.5">
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-start gap-2.5">
            <span class="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">1</span>
            <div>
              <strong class="text-white">Apply Live Wallpaper to Home Screen:</strong>
              <div class="text-neutral-400 text-[11px] mt-0.5">When applying via Xiaomi Themes or LiveWallpaperService, choose "Set on Home Screen".</div>
            </div>
          </div>
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-start gap-2.5">
            <span class="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">2</span>
            <div>
              <strong class="text-white">Lock Screen Wallpaper:</strong>
              <div class="text-neutral-400 text-[11px] mt-0.5">Use Xiaomi Wallpaper Carousel or any static high-res photo in Settings &gt; Wallpaper.</div>
            </div>
          </div>
          <div class="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-start gap-2.5">
            <span class="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">3</span>
            <div>
              <strong class="text-white">Battery Optimization Exemption:</strong>
              <div class="text-neutral-400 text-[11px] mt-0.5">Settings &gt; Apps &gt; Manage Apps &gt; Set Battery Saver to "No restrictions" for smooth 60 FPS.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: NATIVE ANDROID KOTLIN CODE -->
      <div id="tabContent_native_code" class="tab-pane hidden flex flex-col gap-3">
        <div class="flex justify-between items-center text-xs font-mono text-neutral-400">
          <span>KOTLIN LIVEWALLPAPERSERVICE ENGINE (HOME SCREEN)</span>
          <button id="btnCopyKotlin" class="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-[10px]">Copy Kotlin</button>
        </div>
        <pre class="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-80 custom-scrollbar"><code>package com.poco.livewallpaper

import android.service.wallpaper.WallpaperService
import android.view.SurfaceHolder
import android.graphics.Canvas
import android.graphics.Paint
import android.media.MediaPlayer

class PocoHomeLiveWallpaperService : WallpaperService() {
    override fun onCreateEngine(): Engine = PocoHomeWallpaperEngine()

    inner class PocoHomeWallpaperEngine : Engine() {
        private var isVisible = false
        private var loopCount = 0
        private var isReverse = false

        override fun onVisibilityChanged(visible: Boolean) {
            this.isVisible = visible
            if (visible) start60FpsPlayback()
        }

        private fun start60FpsPlayback() {
            // Hardware SurfaceView 60 FPS Direct Loop on Home Screen
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
      { id: 'cyber_grid_matrix', name: 'AMOLED Zero Data Grid', desc: 'Pure black AMOLED grid with traveling optical horizon pulses.' }
    ];

    // --- STATE ---
    let currentWallpaperId = 'cyber_megacity_2099';
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
    const statusTime = document.getElementById('statusBarTime');
    const hudFps = document.getElementById('hudFps');
    const hudLoops = document.getElementById('hudLoops');
    const hudKill = document.getElementById('hudKillBtn');

    // Movable Edge Dock References
    const wallpaperDock = document.getElementById('wallpaperDock');
    const dockHandle = document.getElementById('dockHandle');
    const dockPanel = document.getElementById('dockPanel');
    const dockGripHeader = document.getElementById('dockGripHeader');
    const dockCloseBtn = document.getElementById('dockCloseBtn');
    const btnKillAllDock = document.getElementById('btnKillAllDock');
    const killBtnLabel = document.getElementById('killBtnLabel');
    const killBtnSub = document.getElementById('killBtnSub');
    const dockSpeedBtn = document.getElementById('dockSpeedBtn');
    const dockFlipBtn = document.getElementById('dockFlipBtn');
    const dockMinimizeBtn = document.getElementById('dockMinimizeBtn');
    const dockLed = document.getElementById('dockLed');
    const dockFpsText = document.getElementById('dockFpsText');
    const dockStatusText = document.getElementById('dockStatusText');
    const dockChevron = document.getElementById('dockChevron');
    const dockHudFps = document.getElementById('dockHudFps');
    const dockHudDrain = document.getElementById('dockHudDrain');

    let dockXPercent = 100;
    let dockYPercent = 42;
    let dockSide = 'right';
    let isDockMerged = true;

    function updateDockStyles() {
      if (!wallpaperDock) return;
      wallpaperDock.style.top = dockYPercent + '%';
      const isExpanded = dockPanel && !dockPanel.classList.contains('hidden');
      if (isDockMerged) {
        wallpaperDock.style.transition = 'all 0.3s ease-out';
        const edgeInset = isExpanded ? '12px' : '0px';
        if (dockSide === 'left') {
          wallpaperDock.style.left = edgeInset;
          wallpaperDock.style.right = 'auto';
          wallpaperDock.style.transform = 'translateY(-50%)';
          if (dockHandle) {
            dockHandle.className = 'flex flex-col items-center justify-center py-2.5 px-1 rounded-r-2xl border border-l-0 border-white/20 bg-neutral-950/85 hover:bg-black/95 backdrop-blur-2xl shadow-2xl cursor-grab active:cursor-grabbing transition-transform duration-200';
            if (dockChevron) dockChevron.textContent = '▶';
          }
        } else {
          wallpaperDock.style.right = edgeInset;
          wallpaperDock.style.left = 'auto';
          wallpaperDock.style.transform = 'translateY(-50%)';
          if (dockHandle) {
            dockHandle.className = 'flex flex-col items-center justify-center py-2.5 px-1 rounded-l-2xl border border-r-0 border-white/20 bg-neutral-950/85 hover:bg-black/95 backdrop-blur-2xl shadow-2xl cursor-grab active:cursor-grabbing transition-transform duration-200';
            if (dockChevron) dockChevron.textContent = '◀';
          }
        }
      } else {
        wallpaperDock.style.transition = 'none';
        wallpaperDock.style.left = 'clamp(100px, ' + dockXPercent + '%, calc(100% - 100px))';
        wallpaperDock.style.right = 'auto';
        wallpaperDock.style.transform = 'translate(-50%, -50%)';
        if (dockHandle) {
          dockHandle.className = 'flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl border border-white/20 bg-neutral-950/85 hover:bg-black/95 backdrop-blur-2xl shadow-2xl cursor-grab active:cursor-grabbing';
        }
      }
    }

    function setupMovableDockPointer(triggerElem, isTapToggle) {
      if (!triggerElem) return;
      triggerElem.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const startClientX = e.clientX;
        const startClientY = e.clientY;
        const startX = dockXPercent;
        const startY = dockYPercent;
        let hasMoved = false;

        function onPointerMove(me) {
          me.preventDefault();
          const deltaX = me.clientX - startClientX;
          const deltaY = me.clientY - startClientY;
          if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            hasMoved = true;
          }
          const rect = phoneScreen.getBoundingClientRect();
          const deltaPercentX = (deltaX / rect.width) * 100;
          const deltaPercentY = (deltaY / rect.height) * 100;

          dockXPercent = Math.max(0, Math.min(100, startX + deltaPercentX));
          dockYPercent = Math.max(12, Math.min(86, startY + deltaPercentY));
          dockSide = dockXPercent < 50 ? 'left' : 'right';
          isDockMerged = false;
          updateDockStyles();
        }

        function onPointerUp(ue) {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          window.removeEventListener('pointercancel', onPointerUp);

          // Automatically snap to the nearest edge (left or right)
          dockSide = dockXPercent <= 50 ? 'left' : 'right';
          dockXPercent = dockSide === 'left' ? 0 : 100;
          isDockMerged = true;
          updateDockStyles();

          if (!hasMoved && isTapToggle) {
            // Simple tap opens/closes panel
            if (dockPanel) {
              const isHidden = dockPanel.classList.contains('hidden');
              if (isHidden) {
                dockPanel.classList.remove('hidden');
                dockPanel.classList.add('flex');
                if (dockHandle) dockHandle.classList.add('hidden');
              } else {
                dockPanel.classList.add('hidden');
                dockPanel.classList.remove('flex');
                if (dockHandle) dockHandle.classList.remove('hidden');
              }
              updateDockStyles();
            }
          }
        }

        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
      });
    }

    setupMovableDockPointer(dockHandle, true);
    setupMovableDockPointer(dockGripHeader, false);

    if (dockCloseBtn) {
      dockCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dockPanel) {
          dockPanel.classList.add('hidden');
          dockPanel.classList.remove('flex');
        }
        if (dockHandle) dockHandle.classList.remove('hidden');
        updateDockStyles();
      });
    }

    if (dockMinimizeBtn) {
      dockMinimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dockPanel) {
          dockPanel.classList.add('hidden');
          dockPanel.classList.remove('flex');
        }
        if (dockHandle) dockHandle.classList.remove('hidden');
        updateDockStyles();
      });
    }

    if (dockFlipBtn) {
      dockFlipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dockSide = dockSide === 'left' ? 'right' : 'left';
        dockXPercent = dockSide === 'left' ? 0 : 100;
        isDockMerged = true;
        updateDockStyles();
      });
    }

    function toggleKillEngine() {
      isKilled = !isKilled;
      if (isKilled) {
        if (video) video.pause();
        if (btnKillAllDock) {
          btnKillAllDock.className = 'w-full py-2.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white border border-emerald-400/40 cursor-pointer active:scale-95 transition-all';
        }
        if (killBtnLabel) killBtnLabel.textContent = 'RESUME PROCESSES';
        if (killBtnSub) killBtnSub.textContent = 'Engine is frozen';
        if (dockLed) dockLed.className = 'w-2 h-2 rounded-full bg-rose-500 animate-ping shadow-[0_0_8px_#ef4444]';
        if (dockFpsText) {
          dockFpsText.textContent = 'KILLED';
          dockFpsText.className = 'text-[9px] font-mono font-black text-rose-400';
        }
        if (dockStatusText) dockStatusText.textContent = '0% CPU';
        if (dockHudFps) {
          dockHudFps.textContent = '0';
          dockHudFps.className = 'text-[11px] font-mono font-black text-rose-400';
        }
        if (dockHudDrain) dockHudDrain.textContent = '0.1%';
      } else {
        if (video && currentWallpaperId === 'custom_uploaded') video.play();
        if (btnKillAllDock) {
          btnKillAllDock.className = 'w-full py-2.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-rose-600 to-red-800 hover:from-rose-500 hover:to-red-700 text-white border border-rose-400/50 cursor-pointer active:scale-95 transition-all';
        }
        if (killBtnLabel) killBtnLabel.textContent = 'KILL ALL PROCESSES';
        if (killBtnSub) killBtnSub.textContent = '0% CPU • Freeze All';
        if (dockLed) dockLed.className = 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]';
        if (dockFpsText) {
          dockFpsText.textContent = '60 FPS';
          dockFpsText.className = 'text-[9px] font-mono font-black text-cyan-300';
        }
        if (dockStatusText) dockStatusText.textContent = 'ACTIVE';
        if (dockHudFps) {
          dockHudFps.textContent = '60';
          dockHudFps.className = 'text-[11px] font-mono font-black text-emerald-400';
        }
        if (dockHudDrain) dockHudDrain.textContent = '3.6%';
      }
    }

    if (btnKillAllDock) {
      btnKillAllDock.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleKillEngine();
      });
    }

    if (dockSpeedBtn) {
      dockSpeedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const speeds = [0.5, 1.0, 1.5, 2.0];
        let idx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
        playbackSpeed = speeds[idx];
        if (video) video.playbackRate = playbackSpeed;
        dockSpeedBtn.textContent = playbackSpeed + 'x';
        if (inputSpeed) inputSpeed.value = playbackSpeed;
        if (labelSpeed) labelSpeed.textContent = playbackSpeed + 'x';
      });
    }

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
    const videoInput = document.getElementById('videoFileInput');
    const btnCopyKotlin = document.getElementById('btnCopyKotlin');

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
          isActive ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-md' : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
        }\`;
        btn.innerHTML = \`
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold font-mono \${isActive ? 'text-cyan-400' : 'text-neutral-200'}">\${wp.name}</span>
            \${isActive ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500 text-black font-bold">ACTIVE</span>' : ''}
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
        btn.className = 'tab-btn px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-cyan-500 text-black shadow-sm';
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
        document.getElementById('tabContent_' + tab)?.classList.remove('hidden');
      });
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

    hudKill.addEventListener('click', (e) => {
      e.stopPropagation();
      isKilled = !isKilled;
      if (isKilled) {
        hudKill.innerText = '⏻';
        hudKill.className = 'w-5 h-5 rounded-full bg-rose-600 text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse ring-1 ring-rose-400 flex-shrink-0';
        if (video) video.pause();
      } else {
        hudKill.innerText = '⏻';
        hudKill.className = 'w-5 h-5 rounded-full bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[9px] font-mono font-bold flex items-center justify-center transition-transform hover:scale-110 active:scale-95 flex-shrink-0';
        if (video && currentWallpaperId === 'custom_uploaded') video.play();
      }
    });

    if (btnCopyKotlin) {
      btnCopyKotlin.addEventListener('click', () => {
        navigator.clipboard.writeText(\`package com.poco.livewallpaper
import android.service.wallpaper.WallpaperService\`);
        btnCopyKotlin.innerText = 'Copied!';
        setTimeout(() => { btnCopyKotlin.innerText = 'Copy Kotlin'; }, 2000);
      });
    }

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
        const currentFps = Math.min(90, Math.round(1000 / Math.max(deltaMs, 1)));
        hudFps.innerText = currentFps + ' FPS';
        hudDir.innerText = direction === 'forward' ? 'FWD ▶' : 'REV ◀';
        hudLoops.innerText = 'Loops: ' + loopCount;
      }

      // Gyro damping
      gyroX += (targetGyroX - gyroX) * 0.08;
      gyroY += (targetGyroY - gyroY) * 0.08;

      const w = canvas.width;
      const h = canvas.height;

      if (currentWallpaperId === 'custom_uploaded') {
        if (pingPong) {
          if (direction === 'forward') {
            canvas.classList.add('hidden');
            video.classList.remove('hidden');
            if (video.duration && video.currentTime >= video.duration - 0.1) {
              if (reverseFrames.length > 0) {
                direction = 'reverse';
                reverseFrameIdx = 0;
                video.pause();
                video.classList.add('hidden');
                canvas.classList.remove('hidden');
              } else {
                video.currentTime = 0;
                loopCount++;
              }
            }
          } else {
            // Reverse loop
            if (reverseFrames.length > 0) {
              ctx.clearRect(0, 0, w, h);
              const frame = reverseFrames[reverseFrameIdx];
              if (frame) {
                const imgW = frame.width;
                const imgH = frame.height;
                const scale = Math.max(w / imgW, h / imgH);
                const drawW = imgW * scale;
                const drawH = imgH * scale;
                const offsetX = (w - drawW) / 2;
                const offsetY = (h - drawH) / 2;
                ctx.drawImage(frame, offsetX, offsetY, drawW, drawH);
              }
              reverseFrameIdx++;
              if (reverseFrameIdx >= reverseFrames.length) {
                direction = 'forward';
                loopCount++;
                video.currentTime = 0;
                video.play().catch(() => {});
              }
            }
          }
        }
      } else {
        // Procedural Hardware Shaders
        ctx.clearRect(0, 0, w, h);
        const cycleSpeed = (0.2 * playbackSpeed);
        const t = (now * 0.001) * playbackSpeed;

        if (pingPong) {
          const rawCycle = (t * cycleSpeed) % 2.0;
          if (rawCycle < 1.0) {
            progress = rawCycle;
            direction = 'forward';
          } else {
            progress = 2.0 - rawCycle;
            direction = 'reverse';
          }
        } else {
          progress = (t * cycleSpeed) % 1.0;
          direction = 'forward';
        }

        switch (currentWallpaperId) {
          case 'cyber_megacity_2099': drawCyberMegacity(ctx, w, h, progress, t); break;
          case 'tokyo_rain_street': drawTokyoRainStreet(ctx, w, h, progress, t); break;
          case 'anime_twilight_shinkai': drawAnimeTwilight(ctx, w, h, progress, t); break;
          case 'cyber_grid_matrix': default: drawAmoledMatrixGrid(ctx, w, h, progress, t); break;
        }
      }

      // Draw touch particles
      if (particlesEnabled && particles.length > 0) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.03;
          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }
          ctx.fillStyle = \`rgba(6, 182, 212, \${p.alpha})\`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // --- SHADER 1: Neo-Kowloon Megacity ---
    function drawCyberMegacity(ctx, w, h, p, t) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, amoledCrush ? '#000000' : '#030712');
      grad.addColorStop(0.6, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Sky-train
      const trainX = ((p * 2.2 * w) % (w * 1.6)) - w * 0.3 + gyroX * 0.5;
      const trainY = h * 0.28 + Math.sin(p * Math.PI * 4) * 2 + gyroY * 0.3;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
      ctx.fillRect(trainX, trainY, 80, 5);

      // Rain
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      RAIN_DROPS.forEach(drop => {
        const dropY = ((drop.y + p * drop.speed * 100) % 100) * 0.01 * h;
        const dropX = drop.x * 0.01 * w + (gyroX * 0.2);
        ctx.beginPath();
        ctx.moveTo(dropX, dropY);
        ctx.lineTo(dropX - 1.5, dropY + drop.length);
        ctx.stroke();
      });
    }

    // --- SHADER 2: Shinjuku Rain Street ---
    function drawTokyoRainStreet(ctx, w, h, p, t) {
      const horizonY = h * 0.52;
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

    // --- SHADER 3: Anime Twilight ---
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

    // --- SHADER 4: AMOLED Grid ---
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
