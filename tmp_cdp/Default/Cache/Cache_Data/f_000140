/**
 * muskan-sky - UI Controller & Event Binder
 * Connects the 3D scene, Audio engine, and IndexedDB local library with the Ghibli user interface.
 */

import { musicLibrary } from './library.js';

export class UIController {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audio = audioManager;
    
    this.currentTab = 'all';
    this.searchQuery = '';
    
    // Built-in Ghibli playlist entries
    this.builtInTracks = [
      {
        id: 'ghibli-gazer',
        title: 'Cosmic Gazer (Beneath the Ancient Tree)',
        artist: 'muskan-sky original',
        url: 'assets/gazer_theme.mp3',
        isGenerative: false,
        mood: 'cosmic',
        duration: 8,
        source: 'ghibli'
      },
      {
        id: 'ghibli-0',
        title: 'The Forest Spirit (Princess Mononoke Theme)',
        artist: 'muskan-sky sanctuary',
        isGenerative: true,
        mood: 'spirit',
        duration: 240,
        source: 'ghibli'
      },
      {
        id: 'ghibli-1',
        title: 'Sanctuary of the Nightwalker',
        artist: 'muskan-sky sanctuary',
        isGenerative: true,
        mood: 'starlight',
        duration: 210,
        source: 'ghibli'
      },
      {
        id: 'ghibli-2',
        title: 'Breeze of the Ancient Wood',
        artist: 'muskan-sky sanctuary',
        isGenerative: true,
        mood: 'valley',
        duration: 245,
        source: 'ghibli'
      },
      {
        id: 'ghibli-3',
        title: 'Midnight Journey (Celestial)',
        artist: 'muskan-sky sanctuary',
        isGenerative: true,
        mood: 'midnight',
        duration: 195,
        source: 'ghibli'
      }
    ];

    this.localTracks = [];
    this.combinedPlaylist = [];

    this.initDOM();
    this.bindEvents();
    this.loadLibraryData();
  }

  initDOM() {
    // Top Bar
    this.btnOpenLibrary = document.getElementById('btn-open-library');
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.camButtons = document.querySelectorAll('.cam-btn');
    this.todButtons = document.querySelectorAll('.tod-btn');

    // Player HUD Elements
    this.vinylDisc = document.getElementById('vinyl-disc')?.querySelector('.vinyl-disc');
    this.trackTitle = document.getElementById('track-title');
    this.trackArtist = document.getElementById('track-artist');
    this.trackSource = document.getElementById('track-source');

    this.btnPlay = document.getElementById('btn-play');
    this.iconPlay = document.getElementById('icon-play');
    this.iconPause = document.getElementById('icon-pause');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.btnShuffle = document.getElementById('btn-shuffle');
    this.btnRepeat = document.getElementById('btn-repeat');

    this.progressContainer = document.getElementById('progress-container');
    this.progressBar = document.getElementById('progress-bar');
    this.timeCurrent = document.getElementById('time-current');
    this.timeDuration = document.getElementById('time-duration');

    this.miniVisualizer = document.getElementById('mini-visualizer');
    this.btnMute = document.getElementById('btn-mute');
    this.iconVolHigh = document.getElementById('icon-vol-high');
    this.iconVolMute = document.getElementById('icon-vol-mute');
    this.volumeSlider = document.getElementById('volume-slider');
    this.btnQuickImport = document.getElementById('btn-quick-import');

    // Modal Elements
    this.libraryModal = document.getElementById('library-modal');
    this.btnCloseModal = document.getElementById('btn-close-modal');
    this.dropzone = document.getElementById('dropzone');
    this.localFileInput = document.getElementById('local-file-input');
    this.btnBrowseFiles = document.getElementById('btn-browse-files');
    this.btnBrowseFolder = document.getElementById('btn-browse-folder');
    this.btnClearLocal = document.getElementById('btn-clear-local');
    this.tracklist = document.getElementById('tracklist');
    this.tabButtons = document.querySelectorAll('.tab-btn');
    this.librarySearch = document.getElementById('library-search');

    this.badgeAllCount = document.getElementById('badge-all-count');
    this.badgeLocalCount = document.getElementById('badge-local-count');
    this.toastContainer = document.getElementById('toast-container');
    this.sceneHint = document.getElementById('scene-hint');

    // Fade out initial scene hint
    setTimeout(() => {
      if (this.sceneHint) this.sceneHint.style.opacity = '0';
    }, 5500);
  }

  async loadLibraryData() {
    try {
      this.localTracks = await musicLibrary.getAllSongs();
    } catch (e) {
      console.warn('Could not read from IndexedDB, using defaults:', e);
      this.localTracks = [];
    }

    this.updatePlaylistCombined();
  }

  updatePlaylistCombined() {
    this.combinedPlaylist = [...this.builtInTracks, ...this.localTracks];
    this.audio.setPlaylist(this.combinedPlaylist, 0);
    this.updateCounts();
    this.renderTracklist();
  }

  updateCounts() {
    if (this.badgeAllCount) this.badgeAllCount.textContent = this.combinedPlaylist.length;
    if (this.badgeLocalCount) this.badgeLocalCount.textContent = this.localTracks.length;
  }

  bindEvents() {
    // 1. Play / Pause
    this.btnPlay.addEventListener('click', () => {
      this.audio.togglePlay();
    });

    this.btnNext.addEventListener('click', () => this.audio.next());
    this.btnPrev.addEventListener('click', () => this.audio.prev());

    // 2. Shuffle & Repeat
    this.btnShuffle.addEventListener('click', () => {
      const isShuffle = this.audio.toggleShuffle();
      this.btnShuffle.classList.toggle('active', isShuffle);
      this.showToast(isShuffle ? 'Shuffle enabled' : 'Shuffle disabled');
    });

    this.btnRepeat.addEventListener('click', () => {
      const mode = this.audio.toggleRepeat();
      this.btnRepeat.classList.toggle('active', mode !== 'none');
      this.showToast(`Repeat mode: ${mode}`);
    });

    // 3. Audio Callbacks from AudioManager
    this.audio.callbacks.onPlayStateChange = (isPlaying) => {
      this.iconPlay.style.display = isPlaying ? 'none' : 'block';
      this.iconPause.style.display = isPlaying ? 'block' : 'none';
      if (this.vinylDisc) {
        if (isPlaying) this.vinylDisc.classList.add('spinning');
        else this.vinylDisc.classList.remove('spinning');
      }
      if (this.miniVisualizer) {
        if (isPlaying) this.miniVisualizer.classList.add('active');
        else this.miniVisualizer.classList.remove('active');
      }
    };

    this.audio.callbacks.onTrackChange = (track, index) => {
      this.trackTitle.textContent = track.title;
      this.trackArtist.textContent = track.artist || 'Unknown';
      
      if (track.isLocal) {
        this.trackSource.textContent = 'Local Device';
        this.trackSource.classList.add('local');
      } else {
        this.trackSource.textContent = 'Ghibli Ambient';
        this.trackSource.classList.remove('local');
      }

      this.timeDuration.textContent = this.formatTime(track.duration || 0);
      this.highlightActiveTrack(index);
    };

    this.audio.callbacks.onTimeUpdate = (currentTime, duration) => {
      this.timeCurrent.textContent = this.formatTime(currentTime);
      if (duration > 0) {
        const percent = (currentTime / duration) * 100;
        this.progressBar.style.width = `${percent}%`;
        this.timeDuration.textContent = this.formatTime(duration);
      }
    };

    // Simulated progress for generative synth
    setInterval(() => {
      if (this.audio.isPlaying && this.audio.isGenerativeActive) {
        const dur = this.audio.currentTrack?.duration || 210;
        const currentSimTime = (Date.now() / 1000) % dur;
        this.timeCurrent.textContent = this.formatTime(currentSimTime);
        this.timeDuration.textContent = this.formatTime(dur);
        this.progressBar.style.width = `${(currentSimTime / dur) * 100}%`;
      }
    }, 500);

    // 4. Progress Scrubber Click
    this.progressContainer.addEventListener('click', (e) => {
      const rect = this.progressContainer.getBoundingClientRect();
      const fraction = (e.clientX - rect.left) / rect.width;
      this.audio.seek(Math.max(0, Math.min(1, fraction)));
    });

    // 5. Volume & Mute
    this.volumeSlider.addEventListener('input', (e) => {
      this.audio.setVolume(parseFloat(e.target.value));
      if (this.audio.isMuted) {
        this.audio.toggleMute();
        this.updateMuteIcons(false);
      }
    });

    this.btnMute.addEventListener('click', () => {
      const isMuted = this.audio.toggleMute();
      this.updateMuteIcons(isMuted);
    });

    // 6. Camera View Mode Selection
    this.camButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.camButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.cam;
        if (this.scene) this.scene.setCameraMode(mode);
      });
    });

    // 6b. Atmosphere Preset Selection (Midnight Grove, Spirit Aurora, Twilight)
    this.todButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.todButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tod = btn.dataset.tod;
        if (this.scene) this.scene.setTimeOfDay(tod);

        const titles = {
          midnight: '🌙 Moonlit Midnight Grove',
          aurora: '✨ Ethereal Spirit Aurora',
          twilight: '🌅 Golden Twilight Dusk'
        };
        this.showToast(titles[tod] || tod);
      });
    });

    // 7. Fullscreen Toggle
    this.btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // 8. Library Modal Open & Close
    this.btnOpenLibrary.addEventListener('click', () => this.openLibraryModal());
    this.btnQuickImport.addEventListener('click', () => {
      this.openLibraryModal();
      this.localFileInput.click();
    });
    this.btnCloseModal.addEventListener('click', () => this.closeLibraryModal());
    this.libraryModal.addEventListener('click', (e) => {
      if (e.target === this.libraryModal) this.closeLibraryModal();
    });

    // 9. Local File Upload Handling
    this.btnBrowseFiles.addEventListener('click', () => this.localFileInput.click());
    
    this.btnBrowseFolder.addEventListener('click', () => {
      this.localFileInput.webkitdirectory = true;
      this.localFileInput.click();
    });

    this.localFileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
      this.localFileInput.webkitdirectory = false; // reset
    });

    // Drag & Drop
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => e.preventDefault());

    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('drag-over');
    });

    this.dropzone.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('drag-over');
    });

    this.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleFiles(e.dataTransfer.files);
      }
    });

    // 10. Clear Local Songs
    this.btnClearLocal.addEventListener('click', async () => {
      if (confirm('Are you sure you want to remove all local songs from this browser sanctuary?')) {
        await musicLibrary.clearAll();
        this.localTracks = [];
        this.updatePlaylistCombined();
        this.showToast('All local songs removed');
      }
    });

    // 11. Tabs
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        this.renderTracklist();
      });
    });

    // 12. Search
    this.librarySearch.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderTracklist();
    });

    // 13. Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.audio.togglePlay();
          break;
        case 'KeyK':
        case 'ArrowRight':
          e.preventDefault();
          this.audio.next();
          break;
        case 'KeyJ':
        case 'ArrowLeft':
          e.preventDefault();
          this.audio.prev();
          break;
        case 'KeyM':
          e.preventDefault();
          const isMuted = this.audio.toggleMute();
          this.updateMuteIcons(isMuted);
          break;
        case 'KeyS':
          e.preventDefault();
          const isShuffle = this.audio.toggleShuffle();
          this.btnShuffle.classList.toggle('active', isShuffle);
          this.showToast(isShuffle ? 'Shuffle enabled' : 'Shuffle disabled');
          break;
        case 'KeyL':
          e.preventDefault();
          if (this.libraryModal.classList.contains('open')) this.closeLibraryModal();
          else this.openLibraryModal();
          break;
        case 'KeyF':
          e.preventDefault();
          this.btnFullscreen.click();
          break;
      }
    });
  }

  async handleFiles(files) {
    const audioFiles = Array.from(files).filter(f => f.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac)$/i.test(f.name));
    
    if (audioFiles.length === 0) {
      this.showToast('No audio files detected in selection');
      return;
    }

    this.showToast(`Importing ${audioFiles.length} song${audioFiles.length > 1 ? 's' : ''} to local library...`);

    let addedCount = 0;
    for (const file of audioFiles) {
      try {
        const saved = await musicLibrary.addSong(file);
        this.localTracks.unshift(saved);
        addedCount++;
      } catch (err) {
        console.error('Error saving song:', file.name, err);
      }
    }

    this.updatePlaylistCombined();
    this.showToast(`✨ Successfully connected ${addedCount} local track${addedCount > 1 ? 's' : ''}!`);

    // Switch to local tab
    this.tabButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.tab === 'local');
    });
    this.currentTab = 'local';
    this.renderTracklist();
  }

  renderTracklist() {
    this.tracklist.innerHTML = '';

    let tracks = [];
    if (this.currentTab === 'all') {
      tracks = this.combinedPlaylist;
    } else if (this.currentTab === 'local') {
      tracks = this.localTracks;
    } else if (this.currentTab === 'ghibli') {
      tracks = this.builtInTracks;
    }

    // Filter by search
    if (this.searchQuery) {
      tracks = tracks.filter(t => 
        t.title.toLowerCase().includes(this.searchQuery) ||
        (t.artist && t.artist.toLowerCase().includes(this.searchQuery))
      );
    }

    if (tracks.length === 0) {
      this.tracklist.innerHTML = `
        <div style="text-align: center; padding: 32px; color: var(--text-dim); font-size: 0.85rem;">
          No songs found. Drag audio files into the box above to add to your local library!
        </div>
      `;
      return;
    }

    tracks.forEach((track, displayIdx) => {
      const realIndex = this.combinedPlaylist.indexOf(track);
      const row = document.createElement('div');
      row.className = 'track-row';
      if (realIndex === this.audio.currentIndex) {
        row.classList.add('active');
      }

      row.innerHTML = `
        <div class="track-row-left">
          <span class="track-number">${displayIdx + 1}</span>
          <div>
            <div class="track-item-title">${this.escapeHtml(track.title)}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">${this.escapeHtml(track.artist || 'Local')}</div>
          </div>
        </div>
        <div class="track-row-right">
          <span class="badge-source ${track.isLocal ? 'local' : ''}">${track.isLocal ? 'Local' : 'Ghibli'}</span>
          <span class="track-item-duration">${this.formatTime(track.duration || 0)}</span>
          ${track.isLocal ? `
            <button class="track-delete-btn" title="Delete from local library" data-id="${track.id}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          ` : ''}
        </div>
      `;

      // Play on row click
      row.addEventListener('click', (e) => {
        if (e.target.closest('.track-delete-btn')) return;
        this.audio.loadTrack(realIndex, true);
        this.highlightActiveTrack(realIndex);
      });

      // Delete button
      const delBtn = row.querySelector('.track-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = parseInt(delBtn.dataset.id);
          await musicLibrary.deleteSong(id);
          this.localTracks = this.localTracks.filter(t => t.id !== id);
          this.updatePlaylistCombined();
          this.showToast('Song deleted from local library');
        });
      }

      this.tracklist.appendChild(row);
    });
  }

  highlightActiveTrack(index) {
    const rows = this.tracklist.querySelectorAll('.track-row');
    rows.forEach(r => r.classList.remove('active'));
    // Re-render or highlight if visible
  }

  updateMuteIcons(isMuted) {
    this.iconVolHigh.style.display = isMuted ? 'none' : 'block';
    this.iconVolMute.style.display = isMuted ? 'block' : 'none';
  }

  openLibraryModal() {
    this.libraryModal.classList.add('open');
  }

  closeLibraryModal() {
    this.libraryModal.classList.remove('open');
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
