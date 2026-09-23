/**
 * muskan-sky - IndexedDB Local Music Library Manager
 * Provides 100% private, local-first persistent storage for audio files.
 */

const DB_NAME = 'MuskanSky_MusicDB';
const DB_VERSION = 1;
const STORE_NAME = 'local_songs';

class MusicLibrary {
  constructor() {
    this.db = null;
  }

  /**
   * Initializes the IndexedDB instance
   */
  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('addedAt', 'addedAt', { unique: false });
          store.createIndex('title', 'title', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB failed to open:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * Stores a local File or Blob into IndexedDB
   * @param {File} file 
   * @returns {Promise<Object>} The saved song record
   */
  async addSong(file) {
    await this.init();

    // Clean up filename into Title and Artist
    let rawName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
    let title = rawName;
    let artist = 'Local Artist';

    if (rawName.includes(' - ')) {
      const parts = rawName.split(' - ');
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    }

    // Try to get audio duration via a temporary element
    const duration = await this.getAudioDuration(file);

    const songRecord = {
      title: title || 'Untitled Track',
      artist: artist || 'Local Artist',
      fileName: file.name,
      fileType: file.type || 'audio/mp3',
      fileSize: file.size,
      duration: duration || 0,
      addedAt: Date.now(),
      blob: file, // Store actual File/Blob object
      isLocal: true
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(songRecord);

      request.onsuccess = (event) => {
        songRecord.id = event.target.result;
        resolve(songRecord);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  /**
   * Retrieve all saved local songs
   * @returns {Promise<Array>} List of songs
   */
  async getAllSongs() {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => {
        const songs = event.target.result || [];
        // Sort descending by addedAt
        songs.sort((a, b) => b.addedAt - a.addedAt);
        resolve(songs);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  /**
   * Remove a song by ID
   * @param {number} id 
   */
  async deleteSong(id) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  /**
   * Wipe all local songs
   */
  async clearAll() {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  /**
   * Helper to retrieve audio duration in seconds
   * @param {Blob} blob 
   */
  getAudioDuration(blob) {
    return new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(blob);
        const tempAudio = new Audio();
        tempAudio.preload = 'metadata';
        
        tempAudio.onloadedmetadata = () => {
          const dur = tempAudio.duration;
          URL.revokeObjectURL(url);
          resolve(dur && isFinite(dur) ? dur : 0);
        };

        tempAudio.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(0);
        };

        tempAudio.src = url;
      } catch (err) {
        resolve(0);
      }
    });
  }
}

export const musicLibrary = new MusicLibrary();
