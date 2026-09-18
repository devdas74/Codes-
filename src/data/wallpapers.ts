import { WallpaperItem } from '../types';

export const BUILTIN_WALLPAPERS: WallpaperItem[] = [
  {
    id: 'cyber_megacity_2099',
    name: 'Neo-Kowloon Megacity 2099',
    category: 'cyberpunk_city',
    description: 'Ultra-dense vertical cyberpunk metropolis with multi-level sky-trains, holographic ads, and atmospheric rain.',
    tags: ['Futuristic', 'Dense Skyline', 'Neon', 'Rain'],
    aspectRatio: '9:20',
    previewColor: '#090d16',
    fallbackType: 'canvas_procedural',
  },
  {
    id: 'tokyo_rain_street',
    name: 'Shinjuku Neon Rain Alley',
    category: 'tokyo_street',
    description: 'High-detail narrow Tokyo backstreet with glowing ramen lanterns, steaming AC units, and wet asphalt reflections.',
    tags: ['Street', 'Tokyo', 'Rainy Night', 'Vending Machines'],
    aspectRatio: '9:20',
    previewColor: '#120817',
    fallbackType: 'canvas_procedural',
  },
  {
    id: 'anime_twilight_shinkai',
    name: 'Twilight Crossing (Anime Scenery)',
    category: 'anime_scenery',
    description: 'Makoto Shinkai-inspired sunset sky with drifting cloud strata, train crossing lights, and glowing city below (pure scenery).',
    tags: ['Anime Scenery', 'Sunset Sky', 'Clouds', 'No Characters'],
    aspectRatio: '9:20',
    previewColor: '#2b1029',
    fallbackType: 'canvas_procedural',
  },
  {
    id: 'locked_reason_cyber',
    name: 'Classified Biometric Lock Vault',
    category: 'lock_screen',
    description: 'High-security biometric HUD with "It\'s Locked For A Reason" warning, iris scanner ring, and minimal perimeter.',
    tags: ['Lock Screen', 'Security HUD', 'Classified', 'Biometrics'],
    aspectRatio: '9:20',
    previewColor: '#0b0c10',
    fallbackType: 'canvas_procedural',
  },
  {
    id: 'cyber_grid_matrix',
    name: 'AMOLED Zero-Black Data Grid',
    category: 'cyberpunk_city',
    description: 'Deep black AMOLED futuristic grid with traveling optical pulses, optimized for zero battery consumption.',
    tags: ['AMOLED 100% Black', 'Data Grid', 'Energy Saver', '60 FPS'],
    aspectRatio: '9:20',
    previewColor: '#000000',
    fallbackType: 'canvas_procedural',
  }
];

export const POCO_DEVICE_INFO = {
  model: 'POCO Pro 5G (MIUI / HyperOS)',
  screenSize: '6.67" AMOLED DotDisplay',
  refreshRate: '120Hz (60 FPS Engine Mode)',
  batteryCapacity: '5,000 mAh Li-Po',
  osName: 'Android 14 (HyperOS / MIUI 14)',
  gpu: 'ARM Mali-G68 / Adreno 619 (Direct Surface Vulkan)',
};
