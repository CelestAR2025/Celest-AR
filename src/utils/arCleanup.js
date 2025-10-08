/**
 * Utility functions for AR session cleanup and management
 */

/**
 * Enhanced AR session cleanup function
 * Properly stops camera streams, removes A-Frame scenes, and resets styles
 */
export const cleanupARSession = (componentName = 'AR') => {
  console.log(`${componentName}: Cleaning up AR session...`);
  
  // Stop speech synthesis
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  
  // Stop all active video streams (camera)
  const videoElements = document.querySelectorAll('video');
  videoElements.forEach(video => {
    if (video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(track => {
        track.stop();
        console.log(`${componentName}: Stopped camera track:`, track.label);
      });
      video.srcObject = null;
    }
  });
  
  // Pause and remove video elements
  videoElements.forEach(video => {
    video.pause();
    video.src = '';
    video.load();
  });
  
  // Remove A-Frame scene
  const aframeScene = document.querySelector('a-scene');
  if (aframeScene) {
    // Properly destroy AR.js if available
    if (aframeScene.systems && aframeScene.systems.arjs) {
      console.log(`${componentName}: Stopping AR.js system`);
    }
    aframeScene.pause();
    aframeScene.remove();
  }
  
  // Reset body styles
  document.body.style.overflow = 'auto';
  document.body.style.height = 'auto';
  document.documentElement.style.overflow = 'auto';
  document.documentElement.style.height = 'auto';
  
  // Clear any AR-related classes
  document.body.classList.remove('ar-active');
  document.documentElement.classList.remove('ar-active');
  
  console.log(`${componentName}: Session cleanup complete`);
};

/**
 * Handle back button click with full page reload
 * Ensures complete AR session cleanup
 */
export const handleBackToMenu = (componentName = 'AR') => {
  console.log(`${componentName}: Back button clicked - cleaning up and returning to main menu`);
  cleanupARSession(componentName);
  
  // Use window.location for full reload to ensure complete cleanup
  window.location.href = '/';
};

/**
 * Handle browser back/forward button events
 * Automatically cleans up AR session and reloads page
 */
export const setupPopStateHandler = (componentName = 'AR') => {
  const handlePopState = () => {
    console.log(`${componentName}: Browser back button detected - cleaning up AR session`);
    cleanupARSession(componentName);
    window.location.reload();
  };

  window.addEventListener('popstate', handlePopState);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
};

/**
 * Complete AR session setup with cleanup handlers
 * Use this in useEffect cleanup
 */
export const setupARSessionCleanup = (componentName = 'AR') => {
  const removePopStateHandler = setupPopStateHandler(componentName);
  
  // Return cleanup function for useEffect
  return () => {
    removePopStateHandler();
    cleanupARSession(componentName);
  };
};

/**
 * Get optimized AR.js configuration to fix stretching issues
 */
export const getOptimizedARConfig = () => {
  return 'sourceType: webcam; debugUIEnabled: false; detectionMode: mono; trackingMethod: best; sourceWidth: 1280; sourceHeight: 960; displayWidth: 1280; displayHeight: 960;';
};

/**
 * Get optimized renderer configuration
 */
export const getOptimizedRenderer = () => {
  return 'antialias: true; colorManagement: true; physicallyCorrectLights: true; precision: mediump;';
};

/**
 * Get optimized camera configuration to fix aspect ratio
 */
export const getOptimizedCamera = () => {
  return 'fov: 80; aspect: 1.33; near: 0.1; far: 1000';
};

/**
 * Enhanced responsive styles for AR components
 */
export const getResponsiveARStyles = () => `
  /* Back Button Styles */
  .back-button { 
    position: absolute; 
    top: 20px; 
    left: 20px; 
    z-index: 1000; 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    padding: 12px 20px; 
    background: rgba(255, 213, 79, 0.2); 
    border: 2px solid #ffd54f; 
    border-radius: 12px; 
    color: white; 
    font-size: 16px; 
    font-weight: 600; 
    cursor: pointer; 
    transition: all 0.3s ease; 
    backdrop-filter: blur(10px); 
    border: none;
  }
  .back-button:hover { 
    background: rgba(255, 213, 79, 0.4); 
    transform: translateX(-5px); 
    box-shadow: 0 4px 15px rgba(255, 213, 79, 0.3); 
  }
  .back-button:active { 
    transform: translateX(-3px) scale(0.98); 
  }
  .back-icon { 
    font-size: 20px; 
  }
  
  /* AR Status Indicator */
  .ar-status { 
    position: absolute; 
    bottom: 20px; 
    left: 20px; 
    z-index: 1000; 
    padding: 10px 15px; 
    background: rgba(76, 175, 80, 0.2); 
    border: 2px solid #4caf50; 
    border-radius: 10px; 
    color: #4caf50; 
    font-size: 14px; 
    font-weight: 600; 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    backdrop-filter: blur(10px); 
  }
  .ar-status-dot { 
    width: 10px; 
    height: 10px; 
    background: #4caf50; 
    border-radius: 50%; 
    animation: pulse 2s infinite; 
  }
  @keyframes pulse { 
    0%, 100% { opacity: 1; } 
    50% { opacity: 0.5; } 
  }
  
  /* Mobile Responsive Styles */
  @media (max-width: 768px) {
    .back-button { 
      padding: 10px 15px; 
      font-size: 14px; 
      top: 10px; 
      left: 10px; 
    }
    .back-button span:not(.back-icon) { 
      display: none; 
    }
    .back-icon { 
      font-size: 18px; 
    }
    .ar-status { 
      bottom: 10px; 
      left: 10px; 
      font-size: 12px; 
      padding: 8px 12px; 
    }
  }
`;
