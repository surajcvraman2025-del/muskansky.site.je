/**
 * muskan-sky - The Cosmic Gazer Sanctuary
 * True 3D Animated Experience powered by Lorenzo Dolfi / Google Veo Master Animation
 * ("Person sitting beneath tree gazing at cosmic shooting stars")
 * 
 * Architecture:
 * - Ultra-crisp 1080p WebGL VideoTexture with seamless looping on curved 3D panoramic screen
 * - Real-time 3D camera orbit, pan, zoom, and mouse parallax navigation
 * - Layered 3D bioluminescent fireflies and stardust particles swirling in true depth
 * - Real-time 3D shooting stars (meteors) streaking across the sky on musical peaks
 * - Dynamic audio-reactive lighting pulsing to the playing soundtrack
 * - Smooth atmospheric presets (Midnight Grove, Spirit Aurora, Twilight)
 * - Zero white blowout, ultra-responsive 60 FPS performance
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export class GhibliScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // 1. Core Three.js Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020614);
    // Add some fog for depth
    this.scene.fog = new THREE.FogExp2(0x020614, 0.035);

    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Camera Views - Wide framed to include full scene
    this.camPositions = {
      spirit: { pos: new THREE.Vector3(0.0, 0.5, 3.5), target: new THREE.Vector3(0.0, 0.0, 0.0) },
      panoramic: { pos: new THREE.Vector3(-1.0, 0.8, 4.0), target: new THREE.Vector3(0.0, 0.0, 0.0) },
      gazer: { pos: new THREE.Vector3(1.2, 0.6, 3.0), target: new THREE.Vector3(-0.2, 0.0, 0.0) }
    };
    this.currentCamMode = 'spirit';
    this.targetCamPos = this.camPositions.spirit.pos.clone();
    this.targetCamLookAt = this.camPositions.spirit.target.clone();
    this.currentLookAt = this.camPositions.spirit.target.clone();

    // Mouse Parallax & Orbit
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.orbitAngles = { yaw: 0, pitch: 0 };
    this.orbitDistance = 3.5;

    // Elements
    this.model = null;
    this.mixer = null;
    this.fireflies = null;
    this.fireflyData = [];
    this.shootingStars = [];
    this.lastShootingStarTime = 0;

    // Lights
    this.ambientLight = null;
    this.dirLight = null;
    this.rimLight = null;

    // Audio & Clock
    this.clock = new THREE.Clock();
    this.audioMetrics = { bass: 0.1, mid: 0.1, treble: 0.1, energy: 0.1 };

    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupLighting();
    this.loadGLTFModel();
    this.createLayered3DFireflies();
    this.createShootingStarsSystem();

    this.setupEventListeners();
    this.animate();
  }

  setupRenderer() {
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x020614, 1.0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.5; // Boost exposure for brighter colors
    this.container.appendChild(this.renderer.domElement);

    // Post-processing for cinematic glow / bloom
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.35, // strength
      0.6, // radius
      0.85 // threshold (only bright pixels glow)
    );
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);

    this.camera.position.copy(this.targetCamPos);
    this.camera.lookAt(this.currentLookAt);
  }

  setupLighting() {
    // 1. Lower Ambient Light to preserve shadow contrast
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(this.ambientLight);

    // 2. Hemisphere Light for subtle sky/ground balance
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // 3. Punchy Directional Light (Moonlight) for high contrast and shadows
    this.dirLight = new THREE.DirectionalLight(0xa5c4f3, 6.0);
    this.dirLight.position.set(10, 15, -10);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 50;
    this.dirLight.shadow.camera.left = -15;
    this.dirLight.shadow.camera.right = 15;
    this.dirLight.shadow.camera.top = 15;
    this.dirLight.shadow.camera.bottom = -15;
    this.dirLight.shadow.bias = -0.001;
    this.scene.add(this.dirLight);

    // 4. Warm rim light to make the character pop from the background
    this.rimLight = new THREE.DirectionalLight(0xffb775, 4.0);
    this.rimLight.position.set(-10, 5, 10);
    this.scene.add(this.rimLight);
    
    // 5. Point light at the bench center for a magical glow and extra color pop
    const centerGlow = new THREE.PointLight(0xfff5e6, 5.0, 10);
    centerGlow.position.set(0, 1.0, 0);
    this.scene.add(centerGlow);
  }

  /* =========================================================================
     1. LOAD NATIVE 3D MODEL (.GLB)
     ========================================================================= */

  loadGLTFModel() {
    const loader = new GLTFLoader();
    const url = 'new_3d/mr.hutumowl_lowpoly__animatedrain__handpainted.glb';
    
    loader.load(url, (gltf) => {
      this.model = gltf.scene;
      
      // Auto-center and scale the model
      const scale = 0.2; // Keep it large
      this.model.scale.setScalar(scale);
      
      // Place the model exactly at origin, where the artist likely placed the focal point
      this.model.position.set(0, -1.2, 0);

      // Enable shadows on all meshes and find owl
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.envMapIntensity = 1.0;
            if (child.name === 'Stand_Moon_0') {
              // Let the moon remain its original painted blue color instead of a glowing white bulb
              // child.material.emissive = new THREE.Color(0xa5c4f3);
              // child.material.emissiveIntensity = 0.2; 
            }
            child.material.needsUpdate = true;
          }
        }
      });

      this.scene.add(this.model);

      // Setup Animation
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.model);
        gltf.animations.forEach((clip) => {
          this.mixer.clipAction(clip).play();
        });
      }

      console.log('✨ 3D Model loaded successfully:', url);
    }, 
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, 
    (error) => {
      console.error('An error happened loading the GLTF model', error);
    });
  }

  /* =========================================================================
     2. LAYERED 3D BIOLUMINESCENT FIREFLIES & STARDUST PARTICLES
     ========================================================================= */

  createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.25, 'rgba(255, 240, 180, 0.9)');
    grad.addColorStop(0.6, 'rgba(100, 210, 255, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = false;
    return tex;
  }

  createLayered3DFireflies() {
    const count = 140;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.fireflyData = [];

    const tex = this.createStarTexture();

    for (let i = 0; i < count; i++) {
      // Swirling in 3D depth in front of the video plane (z between 0.4 and 3.2, safely away from camera)
      const x = (Math.random() - 0.5) * 8.4;
      const y = -2.2 + Math.random() * 4.6;
      const z = 0.5 + Math.random() * 2.8;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const isGold = Math.random() > 0.4;
      colors[i * 3] = isGold ? 1.0 : 0.38;
      colors[i * 3 + 1] = isGold ? 0.88 : 0.95;
      colors[i * 3 + 2] = isGold ? 0.42 : 0.82;

      this.fireflyData.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        phase: Math.random() * Math.PI * 2,
        speedY: 0.12 + Math.random() * 0.22,
        orbitSpeed: 0.4 + Math.random() * 0.6,
        orbitRadius: 0.18 + Math.random() * 0.45
      });
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.fireflyMat = new THREE.PointsMaterial({
      size: 0.14,
      map: tex,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fireflies = new THREE.Points(geom, this.fireflyMat);
    this.scene.add(this.fireflies);
  }

  updateFireflies(time) {
    if (!this.fireflies) return;
    const pos = this.fireflies.geometry.attributes.position;
    const energy = this.audioMetrics.energy;

    for (let i = 0; i < this.fireflyData.length; i++) {
      const f = this.fireflyData[i];
      const angle = time * f.orbitSpeed + f.phase;

      // Gentle vertical float with wrap-around
      let y = f.baseY + ((time * f.speedY) % 4.6);
      if (y > 2.4) y -= 4.6;

      const x = f.baseX + Math.sin(angle) * f.orbitRadius;
      const z = f.baseZ + Math.cos(angle) * f.orbitRadius;

      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
    this.fireflyMat.size = 0.14 + energy * 0.08;
  }

  /* =========================================================================
     3. 3D SHOOTING STARS SYSTEM (AUDIO REACTIVE)
     ========================================================================= */

  createShootingStarsSystem() {}

  createShootingStar() {
    const star = {
      pos: new THREE.Vector3(2.5 + Math.random() * 2.0, 1.8 + Math.random() * 0.8, -0.5 + Math.random() * 1.5),
      dir: new THREE.Vector3(-1.6, -0.45, 0.1).normalize(),
      speed: 12.0,
      length: 1.8,
      life: 1.0
    };

    const geom = new THREE.BufferGeometry().setFromPoints([star.pos.clone(), star.pos.clone()]);
    const mat = new THREE.LineBasicMaterial({
      color: 0xffd54f,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });
    star.mesh = new THREE.Line(geom, mat);
    this.scene.add(star.mesh);
    this.shootingStars.push(star);
  }

  /* =========================================================================
     4. ATMOSPHERE TRANSITIONS
     ========================================================================= */

  setTimeOfDay(preset) {
    // Stubbed out since we have a custom 3D model with baked lighting
    console.log('Atmosphere preset changed:', preset);
  }

  /* =========================================================================
     5. CAMERA PARALLAX & CONTROLS
     ========================================================================= */

  setCameraMode(mode) {
    if (this.camPositions[mode]) {
      this.currentCamMode = mode;
      this.targetCamPos.copy(this.camPositions[mode].pos);
      this.targetCamLookAt.copy(this.camPositions[mode].target);
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    const dom = this.renderer.domElement;
    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / this.width) * 2 - 1;
      const normY = -(e.clientY / this.height) * 2 + 1;
      this.mouse.targetX = normX * 0.45;
      this.mouse.targetY = normY * 0.25;

      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        // Full 360 orbital range to find the character
        this.orbitAngles.yaw -= deltaX * 0.005;
        this.orbitAngles.pitch = Math.max(-0.5, Math.min(0.8, this.orbitAngles.pitch + deltaY * 0.005));
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    // Mouse wheel zoom
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.orbitDistance = Math.max(2.5, Math.min(6.0, this.orbitDistance + e.deltaY * 0.005));
      this.camPositions.spirit.pos.z = this.orbitDistance;
      this.targetCamPos.z = this.orbitDistance;
    }, { passive: false });

    // Touch events for mobile
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

        this.orbitAngles.yaw -= deltaX * 0.005;
        this.orbitAngles.pitch = Math.max(-0.5, Math.min(0.8, this.orbitAngles.pitch + deltaY * 0.005));
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    if (this.composer) {
      this.composer.setSize(this.width, this.height);
    }
  }

  updateAudioMetrics(metrics) {
    this.audioMetrics = metrics;

    // Trigger dynamic shooting star on heavy musical beats
    if (metrics.energy > 0.65 && this.clock.getElapsedTime() - this.lastShootingStarTime > 2.0) {
      this.createShootingStar();
      this.lastShootingStarTime = this.clock.getElapsedTime();
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // 1. Update Animations
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // 2. Camera Orbit & Parallax
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    const basePos = this.targetCamPos.clone();
    const cosY = Math.cos(this.orbitAngles.yaw);
    const sinY = Math.sin(this.orbitAngles.yaw);
    const rx = basePos.x * cosY - basePos.z * sinY;
    const rz = basePos.x * sinY + basePos.z * cosY;

    this.camera.position.x += ((rx + this.mouse.x * 0.8) - this.camera.position.x) * 0.08;
    this.camera.position.y += ((basePos.y + this.mouse.y * 0.4 + this.orbitAngles.pitch * 1.5) - this.camera.position.y) * 0.08;
    this.camera.position.z += (rz - this.camera.position.z) * 0.08;

    this.currentLookAt.lerp(this.targetCamLookAt, 0.08);
    this.camera.lookAt(this.currentLookAt);

    // 3. Audio-Reactive Lights Pulse
    const energy = this.audioMetrics.energy;
    if (this.dirLight) {
      this.dirLight.intensity = 2.5 + energy * 1.0;
    }
    if (this.rimLight) {
      this.rimLight.intensity = 1.0 + energy * 0.5 + Math.cos(time * 1.5) * 0.2;
    }

    // 4. Update 3D Fireflies
    this.updateFireflies(time);

    // 5. Update Shooting Stars
    if (time - this.lastShootingStarTime > (5.0 + Math.random() * 4.0)) {
      this.createShootingStar();
      this.lastShootingStarTime = time;
    }
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.life -= delta * 1.2;
      if (s.life <= 0) {
        this.scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        this.shootingStars.splice(i, 1);
        continue;
      }
      s.pos.add(s.dir.clone().multiplyScalar(s.speed * delta));
      const posAttr = s.mesh.geometry.attributes.position;
      const tail = s.pos.clone().sub(s.dir.clone().multiplyScalar(s.length));
      posAttr.setXYZ(0, s.pos.x, s.pos.y, s.pos.z);
      posAttr.setXYZ(1, tail.x, tail.y, tail.z);
      posAttr.needsUpdate = true;
      s.mesh.material.opacity = s.life;
    }

    this.composer.render();
  }
}
