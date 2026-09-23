/**
 * muskan-sky - Main Application Entrypoint
 * Orchestrates the 3D Ghibli Scene, Web Audio Engine, Local Library, and UI Controller.
 */

import { GhibliScene } from './scene.js';
import { audioManager } from './audio.js';
import { UIController } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('🌌 Initializing muskan-sky Starry Sanctuary...');

  // 1. Initialize Three.js 3D Animated Scene
  const scene = new GhibliScene('webgl-container');

  // 2. Initialize UI Controller & Connect Audio
  const ui = new UIController(scene, audioManager);

  // 3. Hook Audio Reactivity into Scene Render Loop
  const syncAudioWithScene = () => {
    const metrics = audioManager.getAudioMetrics();
    scene.updateAudioMetrics(metrics);
    requestAnimationFrame(syncAudioWithScene);
  };
  requestAnimationFrame(syncAudioWithScene);

  console.log('✨ muskan-sky is ready! Ready to connect to local audio library.');
});
