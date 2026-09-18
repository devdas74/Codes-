/**
 * High-Density Procedural 60 FPS Wallpaper Visual Engine
 * Supports continuous seamless 60 FPS hardware loop.
 */

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  progress: number; // 0.0 to 1.0
  direction?: 'forward';
  time: number;
  amoledBlackCrush: boolean;
  lockText?: string;
  lockSubText?: string;
  lockBadge?: string;
}

// Pre-seeded rain drops for deterministic continuous motion
const RAIN_DROPS = Array.from({ length: 90 }, (_, i) => ({
  x: (i * 37) % 100,
  y: (i * 53) % 100,
  speed: 0.8 + ((i * 13) % 10) * 0.1,
  length: 15 + ((i * 7) % 20),
  opacity: 0.15 + ((i * 11) % 10) * 0.05,
}));

// Pre-seeded city window grid
const WINDOWS_GRID = Array.from({ length: 140 }, (_, i) => ({
  seed: Math.sin(i * 997),
  color: (i % 7 === 0) ? '#f43f5e' : (i % 4 === 0) ? '#06b6d4' : (i % 3 === 0) ? '#eab308' : '#38bdf8',
  flicker: (i % 5 === 0),
}));

export function renderWallpaperFrame(
  wallpaperId: string,
  rc: RenderContext
) {
  const { ctx, width, height, progress, time, amoledBlackCrush } = rc;

  ctx.save();

  switch (wallpaperId) {
    case 'cyber_megacity_2099':
      drawCyberMegacity(ctx, width, height, progress, time, amoledBlackCrush);
      break;

    case 'tokyo_rain_street':
      drawTokyoRainStreet(ctx, width, height, progress, time, amoledBlackCrush);
      break;

    case 'anime_twilight_shinkai':
      drawAnimeTwilight(ctx, width, height, progress, time, amoledBlackCrush);
      break;

    case 'locked_reason_cyber':
      drawLockedReasonCyber(ctx, width, height, progress, time, rc);
      break;

    case 'cyber_grid_matrix':
    default:
      drawAmoledMatrixGrid(ctx, width, height, progress, time);
      break;
  }

  ctx.restore();
}

/**
 * 1. Dense Cyberpunk Megacity 2099
 */
function drawCyberMegacity(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number,
  t: number,
  amoled: boolean
) {
  // Deep night sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  if (amoled) {
    skyGrad.addColorStop(0, '#000000');
    skyGrad.addColorStop(0.5, '#020617');
    skyGrad.addColorStop(1, '#090d16');
  } else {
    skyGrad.addColorStop(0, '#030712');
    skyGrad.addColorStop(0.4, '#0b132b');
    skyGrad.addColorStop(0.8, '#1c2541');
    skyGrad.addColorStop(1, '#1e1b4b');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Volumetric searchlights sweeping across skyscrapers
  const beamAngle = Math.sin(t * 0.4 + p * Math.PI) * 0.35;
  ctx.save();
  ctx.translate(w * 0.5, h * 0.9);
  ctx.rotate(beamAngle);
  const beamGrad = ctx.createLinearGradient(0, 0, 0, -h * 0.9);
  beamGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
  beamGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.05)');
  beamGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.lineTo(-80, -h * 0.85);
  ctx.lineTo(80, -h * 0.85);
  ctx.lineTo(15, 0);
  ctx.fill();
  ctx.restore();

  // Distant skyscraper cluster (Back layer)
  ctx.fillStyle = '#060a17';
  const numBack = 8;
  for (let i = 0; i < numBack; i++) {
    const bx = (i / numBack) * w;
    const bw = w / numBack + 8;
    const bh = h * (0.45 + ((i * 7) % 5) * 0.08);
    ctx.fillRect(bx, h - bh, bw, bh);

    // Blinking red beacons on spire
    const beaconOn = Math.sin(t * 2 + i) > 0.3;
    if (beaconOn) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(bx + bw * 0.5, h - bh - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#060a17';
    }
  }

  // Mid-ground Skyscrapers with dense lit windows
  const numMid = 6;
  for (let i = 0; i < numMid; i++) {
    const mx = (i / numMid) * w - 10;
    const mw = w / numMid + 14;
    const mh = h * (0.35 + ((i * 11) % 4) * 0.1);
    ctx.fillStyle = '#0a1024';
    ctx.fillRect(mx, h - mh, mw, mh);

    // Draw dense micro-windows
    const rows = 18;
    const cols = 4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = (i * 20 + r * 4 + c) % WINDOWS_GRID.length;
        const item = WINDOWS_GRID[idx];
        const isLit = (item.seed > -0.2);
        if (isLit) {
          ctx.fillStyle = item.color;
          ctx.globalAlpha = item.flicker ? 0.3 + Math.sin(t * 5 + idx) * 0.3 : 0.65;
          ctx.fillRect(mx + 4 + c * 7, h - mh + 12 + r * 10, 3.5, 5);
        }
      }
    }
    ctx.globalAlpha = 1.0;
  }

  // Floating Sky-Train (Elevated transit tube)
  const skywayY = h * 0.58;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, skywayY);
  ctx.lineTo(w, skywayY + 8);
  ctx.stroke();

  // Sky-train traveling smoothly forward/reverse based on ping-pong progress
  const trainX = ((p * 1.6 - 0.3) * w) % (w + 140) - 70;
  const trainGrad = ctx.createLinearGradient(trainX, skywayY, trainX + 80, skywayY);
  trainGrad.addColorStop(0, '#38bdf8');
  trainGrad.addColorStop(0.5, '#ec4899');
  trainGrad.addColorStop(1, '#818cf8');
  ctx.fillStyle = trainGrad;
  ctx.fillRect(trainX, skywayY - 4, 75, 5);

  // Train headlight beam
  ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.beginPath();
  ctx.moveTo(trainX + 75, skywayY - 2);
  ctx.lineTo(trainX + 130, skywayY - 10);
  ctx.lineTo(trainX + 130, skywayY + 6);
  ctx.fill();

  // Huge Holographic Kanji Ad: "未来" (Future)
  ctx.save();
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  const holoGlow = 0.5 + Math.sin(t * 1.8 + p * 2) * 0.25;
  ctx.fillStyle = `rgba(236, 72, 153, ${holoGlow * 0.8})`;
  ctx.shadowColor = '#ec4899';
  ctx.shadowBlur = 6;
  ctx.fillText('NEO 2099', w * 0.72, h * 0.28);
  ctx.font = '11px sans-serif';
  ctx.fillStyle = `rgba(6, 182, 212, ${holoGlow})`;
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 3;
  ctx.fillText('CYBERNETIC HIGH DENSITY // 90 FPS', w * 0.72, h * 0.31);
  ctx.restore();

  // Dense diagonal rain particles (Batched into a single draw call for 90 FPS throughput)
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  RAIN_DROPS.forEach(rd => {
    const rx = ((rd.x + p * 40 * rd.speed) % 100) * 0.01 * w;
    const ry = ((rd.y + p * 120 * rd.speed) % 100) * 0.01 * h;
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 5, ry + rd.length);
  });
  ctx.stroke();
}

/**
 * 2. Detailed Shinjuku Tokyo Neon Rain Street
 */
function drawTokyoRainStreet(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number,
  t: number,
  amoled: boolean
) {
  // Narrow street perspective with wet asphalt
  const horizonY = h * 0.52;

  // Upper buildings & night sky
  ctx.fillStyle = amoled ? '#000000' : '#0a0914';
  ctx.fillRect(0, 0, w, horizonY);

  // Wet Asphalt ground with reflective neon puddle highlights
  const roadGrad = ctx.createLinearGradient(0, horizonY, 0, h);
  roadGrad.addColorStop(0, '#0c0b1a');
  roadGrad.addColorStop(0.4, '#131129');
  roadGrad.addColorStop(1, '#080712');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(0, horizonY, w, h - horizonY);

  // Left Building Façade (Overhanging neon signs)
  ctx.fillStyle = '#100e21';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w * 0.38, 0);
  ctx.lineTo(w * 0.28, horizonY);
  ctx.lineTo(0, horizonY);
  ctx.fill();

  // Right Building Façade
  ctx.fillStyle = '#0e0d1d';
  ctx.beginPath();
  ctx.moveTo(w, 0);
  ctx.lineTo(w * 0.62, 0);
  ctx.lineTo(w * 0.72, horizonY);
  ctx.lineTo(w, horizonY);
  ctx.fill();

  // Ramen Shop Red Chochin Lanterns (Left side)
  const lanternY = horizonY - 45;
  const lanternSwing = Math.sin(t * 1.5 + p * Math.PI) * 4;
  for (let l = 0; l < 3; l++) {
    const lx = 35 + l * 28 + lanternSwing;
    const ly = lanternY + l * 8;
    // Glowing cord
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(lx, ly - 15);
    ctx.lineTo(lx, ly);
    ctx.stroke();

    // Red Lantern Body
    const lGrad = ctx.createRadialGradient(lx, ly + 8, 2, lx, ly + 8, 14);
    lGrad.addColorStop(0, '#fecdd3');
    lGrad.addColorStop(0.4, '#f43f5e');
    lGrad.addColorStop(1, '#881337');
    ctx.fillStyle = lGrad;
    ctx.beginPath();
    ctx.ellipse(lx, ly + 8, 9, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Japanese kanji character on lantern
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('拉麺', lx, ly + 11);

    // Wet road reflection of red lantern
    const refY = horizonY + (horizonY - ly) * 0.85;
    ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
    ctx.beginPath();
    ctx.ellipse(lx + 8, refY, 14 + Math.sin(t * 3 + l) * 2, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing Japanese Neon Signs (Vertical & horizontal bars)
  drawNeonSign(ctx, w * 0.76, h * 0.22, 'CYBER 24H', '#38bdf8', 11, true);
  drawNeonSign(ctx, w * 0.79, h * 0.38, '新宿路地', '#a855f7', 12, true);
  drawNeonSign(ctx, w * 0.18, h * 0.26, '居酒屋', '#fbbf24', 13, true);

  // Wet Asphalt Center reflection puddles
  ctx.save();
  const puddleGlow = ctx.createLinearGradient(w * 0.45, horizonY, w * 0.55, h);
  puddleGlow.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
  puddleGlow.addColorStop(0.3, 'rgba(236, 72, 153, 0.22)');
  puddleGlow.addColorStop(0.6, 'rgba(168, 85, 247, 0.18)');
  puddleGlow.addColorStop(1, 'rgba(56, 189, 248, 0.04)');
  ctx.fillStyle = puddleGlow;
  ctx.beginPath();
  ctx.moveTo(w * 0.46, horizonY);
  ctx.lineTo(w * 0.54, horizonY);
  ctx.lineTo(w * 0.72, h);
  ctx.lineTo(w * 0.28, h);
  ctx.fill();
  ctx.restore();

  // Tangled Overhead Cables (Batched stroke)
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let c = 0; c < 5; c++) {
    const sag = 20 + c * 8;
    ctx.moveTo(0, 30 + c * 25);
    ctx.quadraticCurveTo(w * 0.5, 30 + c * 25 + sag, w, 40 + c * 22);
  }
  ctx.stroke();

  // Vending Machine glowing softly on sidewalk
  const vmX = w * 0.24;
  const vmY = horizonY - 32;
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(vmX, vmY, 22, 38);
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(vmX + 3, vmY + 4, 16, 16);
  // Warm beverage glow
  ctx.fillStyle = 'rgba(2, 132, 199, 0.25)';
  ctx.beginPath();
  ctx.arc(vmX + 11, vmY + 38, 20, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Helper to draw glowing vertical or horizontal neon billboard
 */
function drawNeonSign(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color: string,
  fontSize: number,
  vertical = false
) {
  ctx.save();
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  ctx.textAlign = 'center';

  if (!vertical) {
    ctx.fillText(text, x, y);
  } else {
    const chars = text.split('');
    chars.forEach((ch, idx) => {
      ctx.fillText(ch, x, y + idx * (fontSize + 3));
    });
  }
  ctx.restore();
}

/**
 * 3. Makoto Shinkai-inspired Twilight Anime Skyline (Scenery Only)
 */
function drawAnimeTwilight(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number,
  t: number,
  amoled: boolean
) {
  // Majestic Twilight Sky: Deep Indigo -> Magenta -> Vibrant Sunset Amber
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.75);
  sky.addColorStop(0, '#13092e');
  sky.addColorStop(0.3, '#3b124d');
  sky.addColorStop(0.6, '#7c1d56');
  sky.addColorStop(0.82, '#d9463b');
  sky.addColorStop(0.95, '#f59e0b');
  sky.addColorStop(1, '#fef08a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Crescent moon in upper twilight
  ctx.save();
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#fef08a';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(w * 0.78, h * 0.12, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e113f';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(w * 0.75, h * 0.11, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Dramatic Shinkai Volumetric Cloud Strata (Ping-pong drifting)
  const cloudShift = Math.sin(p * Math.PI) * 20;
  drawAnimeCloud(ctx, w * 0.25 + cloudShift, h * 0.34, 110, 36, '#9d174d', '#f43f5e', '#fbbf24');
  drawAnimeCloud(ctx, w * 0.78 - cloudShift * 0.8, h * 0.42, 130, 42, '#701a75', '#be185d', '#f59e0b');
  drawAnimeCloud(ctx, w * 0.45 + cloudShift * 0.5, h * 0.50, 160, 48, '#4a044e', '#9d174d', '#fde047');

  // Distant Shinjuku / Tokyo Communications Tower
  const towerX = w * 0.65;
  const towerBaseY = h * 0.74;
  const towerHeight = h * 0.32;
  ctx.strokeStyle = '#270829';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(towerX, towerBaseY - towerHeight);
  ctx.lineTo(towerX - 12, towerBaseY);
  ctx.moveTo(towerX, towerBaseY - towerHeight);
  ctx.lineTo(towerX + 12, towerBaseY);
  // Struts
  for (let s = 1; s < 5; s++) {
    const sy = towerBaseY - (towerHeight / 5) * s;
    ctx.moveTo(towerX - 9, sy);
    ctx.lineTo(towerX + 9, sy);
  }
  ctx.stroke();

  // Blinking red aviation hazard beacon at tower tip
  const beaconPulse = Math.sin(t * 3.2) > 0.1;
  if (beaconPulse) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(towerX, towerBaseY - towerHeight - 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sprawling Silhouette of Dense Urban Cityscape below
  ctx.fillStyle = amoled ? '#050208' : '#14051a';
  ctx.beginPath();
  ctx.moveTo(0, towerBaseY);
  const citySteps = 24;
  for (let b = 0; b <= citySteps; b++) {
    const cx = (b / citySteps) * w;
    const ch = towerBaseY - 10 - ((b * 19) % 7) * 9;
    ctx.lineTo(cx, ch);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Railroad Catenary Electrical Lines & Crossing Signal (Iconic anime landscape trope)
  ctx.strokeStyle = '#0a020d';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.82);
  ctx.lineTo(w, h * 0.80);
  ctx.moveTo(0, h * 0.85);
  ctx.lineTo(w, h * 0.83);
  ctx.stroke();

  // Blinking Alternating Red Railroad Crossing Signal
  const blinkLeft = Math.floor(t * 2) % 2 === 0;
  const crossX = w * 0.28;
  const crossY = h * 0.78;
  ctx.fillStyle = '#0a020d';
  ctx.fillRect(crossX - 12, crossY - 3, 24, 6);
  // Left Lamp
  ctx.fillStyle = blinkLeft ? '#ef4444' : '#450a0a';
  ctx.beginPath();
  ctx.arc(crossX - 8, crossY, 4, 0, Math.PI * 2);
  ctx.fill();
  // Right Lamp
  ctx.fillStyle = !blinkLeft ? '#ef4444' : '#450a0a';
  ctx.beginPath();
  ctx.arc(crossX + 8, crossY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Warm glowing city windows below
  for (let cw = 0; cw < 45; cw++) {
    const wx = (cw * 29) % w;
    const wy = towerBaseY + 8 + ((cw * 17) % (h - towerBaseY - 20));
    ctx.fillStyle = (cw % 3 === 0) ? '#fef08a' : '#fed7aa';
    ctx.globalAlpha = 0.5 + Math.sin(t * 2 + cw) * 0.3;
    ctx.fillRect(wx, wy, 2.5, 3);
  }
  ctx.globalAlpha = 1.0;
}

/**
 * Draws tiered anime cloud with sunset rim-light
 */
function drawAnimeCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  baseColor: string,
  midColor: string,
  rimColor: string
) {
  ctx.save();
  // Base shadow
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.5, h * 0.45, 0, 0, Math.PI * 2);
  ctx.ellipse(x - w * 0.22, y - 4, w * 0.3, h * 0.38, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.25, y - 6, w * 0.32, h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mid highlight
  ctx.fillStyle = midColor;
  ctx.beginPath();
  ctx.ellipse(x, y - h * 0.15, w * 0.45, h * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Golden sunset top rim
  ctx.fillStyle = rimColor;
  ctx.beginPath();
  ctx.ellipse(x, y - h * 0.28, w * 0.4, h * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * 4. Dedicated Lock Screen: "It's Locked For A Reason" (Clean & Minimalist)
 */
function drawLockedReasonCyber(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number,
  t: number,
  rc: RenderContext
) {
  // Deep sleek AMOLED black / charcoal gradient
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.45, w * 0.85);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(0.5, '#090d16');
  bg.addColorStop(1, '#020408');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle ambient breathing glow ring in the center
  const centerX = w * 0.5;
  const centerY = h * 0.42;
  const pulse = Math.sin(t * 1.8) * 6;

  ctx.save();
  const aura = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 130 + pulse);
  aura.addColorStop(0, 'rgba(244, 63, 94, 0.12)');
  aura.addColorStop(0.6, 'rgba(225, 29, 72, 0.04)');
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 130 + pulse, 0, Math.PI * 2);
  ctx.fill();

  // Thin refined biometric ring
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 55 + pulse * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  // Subtle minimal lock glyph
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  // Shackle
  ctx.beginPath();
  ctx.arc(centerX, centerY - 8, 10, Math.PI, 0, false);
  ctx.stroke();
  // Body
  ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
  ctx.beginPath();
  ctx.roundRect(centerX - 13, centerY - 8, 26, 20, 5);
  ctx.fill();
  // Keyhole
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(centerX, centerY + 1, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(centerX - 1.5, centerY + 2, 3, 5);

  ctx.restore();
}

/**
 * 5. True Black AMOLED Wireframe Data Grid
 */
function drawAmoledMatrixGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number,
  t: number
) {
  // Pure 0% power draw black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // Perspective 3D Grid
  const vanishingY = h * 0.42;
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  ctx.lineWidth = 1.2;

  // Radiating vertical lines (Single batched stroke)
  const lines = 12;
  ctx.beginPath();
  for (let i = 0; i <= lines; i++) {
    const xBottom = (i / lines) * w;
    ctx.moveTo(w * 0.5, vanishingY);
    ctx.lineTo(xBottom, h);
  }
  ctx.stroke();

  // Horizontal travelling grid lines with ping-pong flow
  const numHoriz = 16;
  for (let j = 1; j <= numHoriz; j++) {
    const baseProgress = (j / numHoriz + p * 0.5) % 1.0;
    const curveY = vanishingY + Math.pow(baseProgress, 2.5) * (h - vanishingY);
    ctx.strokeStyle = `rgba(6, 182, 212, ${baseProgress * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(0, curveY);
    ctx.lineTo(w, curveY);
    ctx.stroke();
  }

  // Glowing Cyber Sun Horizon
  const sunGrad = ctx.createRadialGradient(w * 0.5, vanishingY, 2, w * 0.5, vanishingY, 65);
  sunGrad.addColorStop(0, 'rgba(236, 72, 153, 0.85)');
  sunGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
  sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(w * 0.5, vanishingY, 65, 0, Math.PI * 2);
  ctx.fill();
}
