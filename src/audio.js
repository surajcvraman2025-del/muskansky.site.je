/**
 * muskan-sky - Audio Player & Web Audio API Engine
 * Manages audio playback, Web Audio frequency analysis, and Ghibli procedural ambient soundscapes.
 */

export class AudioManager {
  constructor() {
    this.audioElement = document.getElementById('core-audio-element');
    this.audioCtx = null;
    this.analyser = null;
    this.sourceNode = null;
    this.gainNode = null;
    
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.8;
    this.isShuffle = false;
    this.repeatMode = 'all'; // 'all', 'one', 'none'
    
    this.currentIndex = 0;
    this.playlist = [];
    this.currentTrack = null;
    
    // Generative Ghibli Synth state
    this.isGenerativeActive = false;
    this.synthTimer = null;
    this.synthGain = null;
    
    // Frequency analyser buffers
    this.freqData = null;
    this.timeData = null;
    
    // Event listeners
    this.callbacks = {
      onTrackChange: null,
      onPlayStateChange: null,
      onTimeUpdate: null,
      onDurationChange: null,
      onError: null
    };

    this.initNativeAudioEvents();
  }

  /**
   * Initializes Web Audio context on first user interaction
   */
  initWebAudio() {
    if (this.audioCtx) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.82;
      
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = this.volume;

      // Connect native audio element
      try {
        this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
        this.sourceNode.connect(this.gainNode);
      } catch (err) {
        console.warn('MediaElementSource already connected or CORS issue:', err);
      }

      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      const bufferLength = this.analyser.frequencyBinCount;
      this.freqData = new Uint8Array(bufferLength);
      this.timeData = new Uint8Array(bufferLength);

      // Setup generative synth sub-bus
      this.synthGain = this.audioCtx.createGain();
      this.synthGain.gain.value = 0.45;
      this.synthGain.connect(this.gainNode);
    } catch (e) {
      console.error('Failed to initialize Web Audio API:', e);
    }
  }

  initNativeAudioEvents() {
    this.audioElement.addEventListener('timeupdate', () => {
      if (this.callbacks.onTimeUpdate) {
        this.callbacks.onTimeUpdate(this.audioElement.currentTime, this.audioElement.duration || 0);
      }
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.callbacks.onDurationChange) {
        this.callbacks.onDurationChange(this.audioElement.duration || 0);
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn('Audio playback encountered an error, falling back to ambient synth:', e);
      if (this.currentTrack && this.currentTrack.isGenerative) {
        // Continue generative synth
      } else if (this.callbacks.onError) {
        this.callbacks.onError(e);
      }
    });
  }

  /**
   * Set playlist and load initial track
   * @param {Array} tracks 
   */
  setPlaylist(tracks, startIndex = 0) {
    this.playlist = tracks;
    this.currentIndex = Math.max(0, Math.min(startIndex, tracks.length - 1));
    if (this.playlist.length > 0) {
      this.loadTrack(this.currentIndex, false);
    }
  }

  /**
   * Load track by index
   */
  loadTrack(index, autoPlay = true) {
    if (index < 0 || index >= this.playlist.length) return;

    this.currentIndex = index;
    const track = this.playlist[index];
    this.currentTrack = track;

    // Stop generative synth if it was running
    this.stopGenerativeSynth();

    if (track.isGenerative) {
      this.isGenerativeActive = true;
      this.audioElement.pause();
      this.audioElement.src = '';
      if (autoPlay) {
        this.startGenerativeSynth(track.mood || 'starlight');
        this.isPlaying = true;
      }
    } else {
      this.isGenerativeActive = false;
      let srcUrl = track.url;

      if (track.blob) {
        srcUrl = URL.createObjectURL(track.blob);
      }

      this.audioElement.src = srcUrl;
      this.audioElement.load();

      if (autoPlay) {
        this.play();
      }
    }

    if (this.callbacks.onTrackChange) {
      this.callbacks.onTrackChange(track, index);
    }
  }

  async play() {
    this.initWebAudio();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (this.currentTrack && this.currentTrack.isGenerative) {
      this.startGenerativeSynth(this.currentTrack.mood || 'starlight');
      this.isPlaying = true;
      if (this.callbacks.onPlayStateChange) this.callbacks.onPlayStateChange(true);
      return;
    }

    try {
      await this.audioElement.play();
      this.isPlaying = true;
      if (this.callbacks.onPlayStateChange) this.callbacks.onPlayStateChange(true);
    } catch (err) {
      console.warn('Audio play request interrupted or requires user gesture:', err);
    }
  }

  pause() {
    if (this.isGenerativeActive) {
      this.stopGenerativeSynth();
    } else {
      this.audioElement.pause();
    }
    this.isPlaying = false;
    if (this.callbacks.onPlayStateChange) this.callbacks.onPlayStateChange(false);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  next() {
    if (this.playlist.length === 0) return;
    
    let nextIndex;
    if (this.isShuffle) {
      nextIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      nextIndex = (this.currentIndex + 1) % this.playlist.length;
    }
    this.loadTrack(nextIndex, true);
  }

  prev() {
    if (this.playlist.length === 0) return;

    // If more than 3 seconds in, restart track
    if (!this.isGenerativeActive && this.audioElement.currentTime > 3) {
      this.audioElement.currentTime = 0;
      return;
    }

    let prevIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadTrack(prevIndex, true);
  }

  seek(fraction) {
    if (this.isGenerativeActive) return;
    if (this.audioElement.duration) {
      this.audioElement.currentTime = fraction * this.audioElement.duration;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.audioElement.volume = this.volume;
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audioElement.muted = this.isMuted;
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
    }
    return this.isMuted;
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    return this.isShuffle;
  }

  toggleRepeat() {
    if (this.repeatMode === 'all') this.repeatMode = 'one';
    else if (this.repeatMode === 'one') this.repeatMode = 'none';
    else this.repeatMode = 'all';
    return this.repeatMode;
  }

  handleTrackEnded() {
    if (this.repeatMode === 'one') {
      this.audioElement.currentTime = 0;
      this.play();
    } else if (this.repeatMode === 'all' || this.currentIndex < this.playlist.length - 1) {
      this.next();
    } else {
      this.isPlaying = false;
      if (this.callbacks.onPlayStateChange) this.callbacks.onPlayStateChange(false);
    }
  }

  /**
   * Real-time audio metrics for 3D visual reactivity
   * Returns normalized frequency levels [0.0 - 1.0]
   */
  getAudioMetrics() {
    if (!this.analyser || !this.isPlaying) {
      return { bass: 0.1, mid: 0.1, treble: 0.1, energy: 0.08 };
    }

    this.analyser.getByteFrequencyData(this.freqData);

    const length = this.freqData.length;
    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;

    const bassEnd = Math.floor(length * 0.2);
    const midEnd = Math.floor(length * 0.6);

    for (let i = 0; i < bassEnd; i++) bassSum += this.freqData[i];
    for (let i = 0; i < length; i++) {
      if (i >= bassEnd && i < midEnd) midSum += this.freqData[i];
      if (i >= midEnd) trebleSum += this.freqData[i];
    }

    const bass = bassSum / (bassEnd * 255);
    const mid = midSum / ((midEnd - bassEnd) * 255);
    const treble = trebleSum / ((length - midEnd) * 255);
    const energy = (bass * 0.5 + mid * 0.3 + treble * 0.2);

    return { bass, mid, treble, energy };
  }

  /* =========================================================================
     GHIBLI PROCEDURAL AMBIENT SOUND GENERATOR
     Creates evocative, dreamy piano and music box melodies in pentatonic tuning.
     ========================================================================= */

  startGenerativeSynth(mood = 'starlight') {
    if (!this.audioCtx) this.initWebAudio();
    this.stopGenerativeSynth();
    this.isGenerativeActive = true;

    // Joe Hisaishi / Ghibli inspired scale notes (Hz)
    let notes;
    if (mood === 'spirit') {
      // Joe Hisaishi Princess Mononoke / Ashitaka & San sacred theme scale (F Minor / Dorian)
      notes = [
        174.61, // F3
        207.65, // Ab3
        233.08, // Bb3
        261.63, // C4
        311.13, // Eb4
        349.23, // F4
        415.30, // Ab4
        466.16, // Bb4
        523.25  // C5
      ];
    } else if (mood === 'meadow') {
      // C Major / Ghibli daytime joyful Summer/Totoro scale
      notes = [
        261.63, // C4
        293.66, // D4
        329.63, // E4
        392.00, // G4
        440.00, // A4
        523.25, // C5
        587.33, // D5
        659.25, // E5
        783.99  // G5
      ];
    } else {
      // F# Major / Eb Minor peaceful ethereal night scale
      notes = [
        185.00, // F#3
        220.00, // A3
        246.94, // B3
        277.18, // C#4
        329.63, // E4
        369.99, // F#4
        440.00, // A4
        493.88, // B4
        554.37, // C#5
        659.25, // E5
        739.99  // F#5
      ];
    }

    // Background warm celestial/meadow pad drone
    this.playAmbientDrone(mood === 'spirit' ? 87.31 : (mood === 'meadow' ? 130.81 : 92.5));

    let step = 0;
    const playNextNote = () => {
      if (!this.isGenerativeActive || !this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      // Arpeggiate or pick peaceful chord tones
      const noteFreq = notes[Math.floor(Math.random() * notes.length)];
      this.triggerBellNote(noteFreq, now);

      // Occasionally add lower acoustic bass root
      if (step % 4 === 0) {
        const root = notes[0] / 2; // F#2
        this.triggerBellNote(root, now, 0.4, 2.5);
      }

      step++;
      // Natural humanized rhythmic interval
      const delay = 600 + Math.random() * 800;
      this.synthTimer = setTimeout(playNextNote, delay);
    };

    playNextNote();
  }

  stopGenerativeSynth() {
    this.isGenerativeActive = false;
    if (this.synthTimer) {
      clearTimeout(this.synthTimer);
      this.synthTimer = null;
    }
  }

  playAmbientDrone(freq = 92.5) {
    if (!this.audioCtx || !this.synthGain) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now); // Low drone frequency

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGain);

    osc.start(now);
    // Stop after 20 seconds or sustain
    osc.stop(now + 20);
  }

  triggerBellNote(freq, time, volume = 0.28, duration = 1.6) {
    if (!this.audioCtx || !this.synthGain) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Warm envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.synthGain);

    osc.start(time);
    osc.stop(time + duration);
  }
}

export const audioManager = new AudioManager();
