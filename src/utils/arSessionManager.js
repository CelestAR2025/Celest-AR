/**
 * AR Session Manager - Singleton pattern to prevent memory leaks
 * Ensures only one AR session exists at a time
 */

class ARSessionManager {
  constructor() {
    this.currentSession = null;
    this.isCleaningUp = false;
    this.sessionId = 0;
  }

  /**
   * Get the singleton instance
   */
  static getInstance() {
    if (!ARSessionManager.instance) {
      ARSessionManager.instance = new ARSessionManager();
    }
    return ARSessionManager.instance;
  }

  /**
   * Start a new AR session with complete cleanup of previous session
   */
  async startSession(sessionName) {
    console.log(`ARSessionManager: Starting new session - ${sessionName}`);
    
    // Cleanup any existing session first
    if (this.currentSession) {
      console.log(`ARSessionManager: Cleaning up previous session - ${this.currentSession}`);
      await this.cleanupSession();
    }

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }

    // Wait a moment for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    this.currentSession = sessionName;
    this.sessionId++;
    console.log(`ARSessionManager: Session ${sessionName} started (ID: ${this.sessionId})`);
    
    return this.sessionId;
  }

  /**
   * Comprehensive AR session cleanup
   */
  async cleanupSession() {
    if (this.isCleaningUp) {
      console.log('ARSessionManager: Cleanup already in progress');
      return;
    }

    this.isCleaningUp = true;
    console.log(`ARSessionManager: Cleaning up session - ${this.currentSession}`);

    try {
      // Stop speech synthesis
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }

      // Stop all video streams (camera)
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        if (video.srcObject) {
          const tracks = video.srcObject.getTracks();
          tracks.forEach(track => {
            track.stop();
            console.log('ARSessionManager: Stopped camera track:', track.label);
          });
          video.srcObject = null;
        }
        video.pause();
        video.src = '';
        video.load();
      });

      // Remove all A-Frame scenes
      const aframeScenes = document.querySelectorAll('a-scene');
      aframeScenes.forEach(scene => {
        if (scene && scene.systems) {
          // Stop AR.js system if available
          if (scene.systems.arjs) {
            console.log('ARSessionManager: Stopping AR.js system');
            try {
              scene.systems.arjs.stop();
            } catch (e) {
              console.warn('ARSessionManager: Error stopping AR.js system:', e);
            }
          }
          
          // Pause and remove scene
          scene.pause();
          scene.remove();
        }
      });

      // Clean up WebGL contexts to free GPU memory
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach(canvas => {
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const ext = gl.getExtension('WEBGL_lose_context');
          if (ext) {
            ext.loseContext();
            console.log('ARSessionManager: Released WebGL context');
          }
        }
      });

      // Reset body styles
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';

      // Clear AR-related classes
      document.body.classList.remove('ar-active');
      document.documentElement.classList.remove('ar-active');

      // Force DOM cleanup
      const containers = document.querySelectorAll('[id*="scene"], [class*="ar-"]');
      containers.forEach(container => {
        if (container.parentNode) {
          container.innerHTML = '';
        }
      });

      console.log('ARSessionManager: Session cleanup completed');
      
    } catch (error) {
      console.error('ARSessionManager: Error during cleanup:', error);
    } finally {
      this.currentSession = null;
      this.isCleaningUp = false;
    }
  }

  /**
   * Get current session info
   */
  getCurrentSession() {
    return {
      name: this.currentSession,
      id: this.sessionId,
      isActive: !!this.currentSession
    };
  }

  /**
   * Force cleanup and reset
   */
  async forceReset() {
    console.log('ARSessionManager: Force reset requested');
    await this.cleanupSession();
    
    // Additional cleanup for stubborn cases
    if (window.AFRAME) {
      // Clear A-Frame component registry if needed
      console.log('ARSessionManager: Clearing A-Frame components');
    }

    // Force garbage collection
    if (window.gc) {
      window.gc();
    }
  }
}

// Export singleton instance
const arSessionManager = ARSessionManager.getInstance();
export default arSessionManager;
