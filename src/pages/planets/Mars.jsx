import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Mars = () => {
  const sceneContainerRef = useRef(null);
  const navigate = useNavigate();
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch (e) {
        return false;
      }
    };

    if (!checkWebGLSupport()) {
      setError('WebGL not supported');
      return;
    }

    // Load scripts
    const loadScripts = async () => {
      try {
        // Check if already loaded
        if (window.AFRAME) {
          console.log('A-Frame already loaded');
          setScriptsLoaded(true);
          initializeAFrame();
          return;
        }

        // Load A-Frame
        await new Promise((resolve, reject) => {
          const aframeScript = document.createElement('script');
          aframeScript.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
          aframeScript.async = false;
          aframeScript.onload = resolve;
          aframeScript.onerror = () => reject(new Error('Failed to load A-Frame'));
          document.head.appendChild(aframeScript);
        });

        console.log('A-Frame loaded');

        // Load AR.js
        await new Promise((resolve, reject) => {
          const arScript = document.createElement('script');
          arScript.src = 'https://cdn.rawgit.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js';
          arScript.onload = resolve;
          arScript.onerror = () => {
            console.warn('AR.js failed to load, continuing without AR support');
            resolve(); // Continue even if AR.js fails
          };
          document.head.appendChild(arScript);
        });

        console.log('AR.js loaded');

        // Wait a bit for A-Frame to fully initialize
        await new Promise(resolve => setTimeout(resolve, 500));

        setScriptsLoaded(true);
        initializeAFrame();
      } catch (err) {
        console.error('Error loading scripts:', err);
        setError(err.message);
      }
    };

    const initializeAFrame = () => {
      if (!window.AFRAME) {
        console.error('AFRAME not available');
        return;
      }

      const AFRAME = window.AFRAME;

      // Register planet interaction component
      if (!AFRAME.components['mars-interaction']) {
        AFRAME.registerComponent('mars-interaction', {
          init: function () {
            const el = this.el;
            const container = el.parentEl;
            let currentScale = 1.5;
            const minScale = 0.5;
            const maxScale = 3.0;

            el.addEventListener('click', function (evt) {
              console.log('Mars clicked');
              const text = "Mars: Mars is called the red planet. It looks red because of the presence of iron on its surface. Mars has an equatorial diameter of 6,788 km. Its average distance from the Sun is 227 million km. Mars has a very thin atmosphere which consists largely of carbon dioxide and a small percentage of other gases. It has an average surface temperature of –63°C. It is also known for its volcanoes. It has one of the largest volcanoes in the solar system, the Olympus Mons. Mars takes 687 Earth days to complete its revolution. Like Earth, it takes 24 days to complete its rotation. Mars has two moons.";
              showPlanetInfo('Mars', text);
              speak(text);
            });


            // Add wheel event for zooming
            document.addEventListener('wheel', function(event) {
              event.preventDefault();
              const delta = event.deltaY > 0 ? -0.1 : 0.1;
              currentScale = Math.max(minScale, Math.min(maxScale, currentScale + delta));
              container.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
            });

            // Add drag to rotate (rotation only, position stays on marker)
            let isDragging = false;
            let previousMouseX = 0;
            let previousMouseY = 0;

            el.addEventListener('mousedown', function(event) {
              isDragging = true;
              previousMouseX = event.clientX;
              previousMouseY = event.clientY;
              event.preventDefault();
            });

            document.addEventListener('mousemove', function(event) {
              if (isDragging) {
                event.preventDefault();
                const deltaX = event.clientX - previousMouseX;
                const deltaY = event.clientY - previousMouseY;
                
                const currentRotation = el.getAttribute('rotation');
                el.setAttribute('rotation', {
                  x: currentRotation.x - deltaY * 0.3,
                  y: currentRotation.y + deltaX * 0.3,
                  z: currentRotation.z
                });
                
                previousMouseX = event.clientX;
                previousMouseY = event.clientY;
              }
            });

            document.addEventListener('mouseup', function() {
              isDragging = false;
            });

            // Add touch rotation for mobile
            let isTouchRotating = false;
            let previousTouchX = 0;
            let previousTouchY = 0;

            el.addEventListener('touchstart', function(event) {
              if (event.touches.length === 1) {
                isTouchRotating = true;
                previousTouchX = event.touches[0].clientX;
                previousTouchY = event.touches[0].clientY;
                event.preventDefault();
              }
            });

            document.addEventListener('touchmove', function(event) {
              if (isTouchRotating && event.touches.length === 1) {
                event.preventDefault();
                const deltaX = event.touches[0].clientX - previousTouchX;
                const deltaY = event.touches[0].clientY - previousTouchY;
                
                const currentRotation = el.getAttribute('rotation');
                el.setAttribute('rotation', {
                  x: currentRotation.x - deltaY * 0.3,
                  y: currentRotation.y + deltaX * 0.3,
                  z: currentRotation.z
                });
                
                previousTouchX = event.touches[0].clientX;
                previousTouchY = event.touches[0].clientY;
              }
            });

            document.addEventListener('touchend', function() {
              isTouchRotating = false;
            });

            // Add touch events for mobile zoom
            let initialDistance = 0;
            document.addEventListener('touchstart', function(event) {
              if (event.touches.length === 2) {
                initialDistance = Math.hypot(
                  event.touches[0].clientX - event.touches[1].clientX,
                  event.touches[0].clientY - event.touches[1].clientY
                );
              }
            });

            document.addEventListener('touchmove', function(event) {
              if (event.touches.length === 2) {
                event.preventDefault();
                const currentDistance = Math.hypot(
                  event.touches[0].clientX - event.touches[1].clientX,
                  event.touches[0].clientY - event.touches[1].clientY
                );
                const scaleChange = (currentDistance - initialDistance) * 0.01;
                currentScale = Math.max(minScale, Math.min(maxScale, currentScale + scaleChange));
                container.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
                initialDistance = currentDistance;
              }
            });
          }
        });
      }

      console.log('A-Frame components registered');
    };

    const speak = (text) => {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        utter.rate = 0.9;
        speechSynthesis.speak(utter);
      }
    };

    const showPlanetInfo = (planetName, text) => {
      const planetNameEl = document.getElementById('planetName');
      const planetInfoEl = document.getElementById('planetInfo');

      if (planetNameEl) planetNameEl.textContent = planetName;
      if (planetInfoEl) planetInfoEl.textContent = text;

      const infoBox = document.getElementById('infoBox');
      if (infoBox) {
        infoBox.style.display = 'block';
        infoBox.style.opacity = '0';
        infoBox.style.transform = 'translateX(-50%) translateY(50px)';

        setTimeout(() => {
          infoBox.style.opacity = '1';
          infoBox.style.transform = 'translateX(-50%) translateY(0)';
          infoBox.style.transition = 'all 0.5s ease-out';
        }, 100);
      }
    };

    loadScripts();

    // Cleanup
    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      
      // Stop all active video streams
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        if (video.srcObject) {
          video.srcObject.getTracks().forEach(track => {
            track.stop();
            console.log('Stopped camera track:', track.label);
          });
          video.srcObject = null;
        }
      });
      
      // Remove A-Frame scene
      const aframeScene = document.querySelector('a-scene');
      if (aframeScene) {
        aframeScene.remove();
      }
    };
  }, []);

  // Create the A-Frame scene HTML string
  useEffect(() => {
    if (!scriptsLoaded || !sceneContainerRef.current) return;

    const sceneHTML = `
      <a-scene 
        embedded 
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono; trackingMethod: best;"
        vr-mode-ui="enabled: false"
        loading-screen="enabled: false"
        renderer="antialias: true; colorManagement: true; physicallyCorrectLights: true;"
        shadow="type: pcfsoft">
        
        <a-entity light="type: ambient; color: #ffffff; intensity: 0.6"></a-entity>
        <a-entity light="type: directional; color: #ffffff; intensity: 0.8" position="0 5 5"></a-entity>

        <a-marker preset="hiro">
          <a-entity id="marsContainer" position="0 0 0" scale="1.5 1.5 1.5">
            <a-sphere 
              id="mars" 
              class="clickable"
              radius="0.3"
              segments-width="32"
              segments-height="32"
              material="src: url(/texture/mars.jpg); roughness: 0.8; metalness: 0.1"
              animation="property: rotation; to: 0 360 0; loop: true; dur: 24500"
              mars-interaction
              data-base-scale="1 1 1">
            </a-sphere>
          </a-entity>
        </a-marker>

        <a-entity camera look-controls="enabled: true">
          <a-cursor
            id="cursor"
            raycaster="objects: .clickable"
            geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
            material="color: white; shader: flat"
            animation__click="property: scale; startEvents: click; to: 0.1 0.1 0.1; dur: 150"
            animation__clickreset="property: scale; startEvents: animationcomplete__click; to: 1 1 1; dur: 150"
            animation__fusing="property: scale; startEvents: fusing; to: 0.1 0.1 0.1; dur: 1500; easing: easeInCubic"
            animation__mouseleave="property: scale; startEvents: mouseleave; to: 1 1 1; dur: 150"
            position="0 0 -1">
          </a-cursor>
        </a-entity>
      </a-scene>
    `;

    // Insert the scene HTML directly
    sceneContainerRef.current.innerHTML = sceneHTML;

    console.log('A-Frame scene injected');
  }, [scriptsLoaded]);

  // Enhanced AR session cleanup function
  const cleanupARSession = () => {
    console.log('Mars AR: Cleaning up AR session...');
    
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
          console.log('Stopped camera track:', track.label);
        });
        video.srcObject = null;
      }
      video.pause();
      video.src = '';
      video.load();
    });
    
    // Remove A-Frame scene
    const aframeScene = document.querySelector('a-scene');
    if (aframeScene && aframeScene.systems) {
      if (aframeScene.systems.arjs) {
        console.log('Stopping AR.js system');
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
    
    console.log('Mars AR: Session cleanup complete');
  };

  const handleBack = () => {
    console.log('Mars AR: Back button clicked - ending AR session and redirecting...');
    cleanupARSession();
    
    console.log('Mars AR: Cleanup complete, reloading page and redirecting to planets...');
    
    // Force page reload to completely end AR session, then redirect to planets
    window.location.href = '/planets';
  };

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #2a0f0a, #4a1f1a)',
        color: 'white',
        fontFamily: 'Segoe UI, sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h2>⚠️ Error Loading AR Scene</h2>
          <p>{error}</p>
          <p>Please try refreshing the page or use a different browser.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { overflow: hidden; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: transparent; }
        .cosmic-panel { background: linear-gradient(135deg, rgba(42, 15, 10, 0.92), rgba(74, 31, 26, 0.92)); border: 1px solid rgba(229, 89, 52, 0.35); border-radius: 15px; color: #f7f3ff; box-shadow: 0 8px 32px rgba(0,0,0,0.35); }
        #controls { position: absolute; top: 80px; right: 20px; padding: 20px; width: 280px; z-index: 1000; }
        #controls h3 { font-size: 16px; text-align: center; margin-bottom: 12px; color: #E55934; }
        .control-item { display: flex; align-items: center; gap: 10px; margin: 8px 0; padding: 8px; background: rgba(255,255,255,0.06); border-radius: 10px; }
        .control-icon { background: linear-gradient(135deg, #E55934, #c74428); color: #fff; padding: 4px 8px; border-radius: 6px; font-weight: 600; min-width: 50px; text-align: center; font-size: 12px; }
        .control-text { font-size: 13px; color: #f7f3ff; }
        #infoBox { position: absolute; left: 50%; transform: translateX(-50%); padding: 30px; bottom: 20px; display: none; max-width: 800px; width: 90%; z-index: 1000; background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 240, 240, 0.95)); border: 3px solid #CD5C5C; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.4); }
        #infoBox h2 { margin: 0 0 15px; font-size: 28px; color: #E55934; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
        #infoBox p { margin: 0; font-size: 18px; color: #2c3e50; line-height: 1.6; text-align: justify; }
        .loading-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #2a0f0a, #4a1f1a); display: flex; justify-content: center; align-items: center; z-index: 9999; color: white; font-family: 'Segoe UI', sans-serif; }
        .loading-spinner { border: 4px solid rgba(255, 255, 255, 0.3); border-top: 4px solid #E55934; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .back-button { position: absolute; top: 20px; left: 20px; z-index: 1000; display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: rgba(229, 89, 52, 0.2); border: 2px solid #E55934; border-radius: 12px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px); }
        .back-button:hover { background: rgba(229, 89, 52, 0.4); transform: translateX(-5px); }
        .back-icon { width: 20px; height: 20px; }
        .title { position: absolute; top: 20px; right: 20px; z-index: 1000; font-size: 24px; font-weight: 700; color: #E55934; text-shadow: 0 0 20px rgba(229, 89, 52, 0.5); }
      `}</style>

      {!scriptsLoaded && (
        <div className="loading-screen">
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <h2>Loading Mars AR...</h2>
            <p>Initializing A-Frame and AR.js</p>
          </div>
        </div>
      )}

      {/* Header */}
      <button className="back-button" onClick={handleBack} aria-label="Go back">
        <img src="/images/back-arrow.svg" alt="Back" className="back-icon" />
        <span>Back to Planets</span>
      </button>
      <h1 className="title">♂️ Mars AR Experience</h1>

      {/* Mission Control Panel */}
      <div id="controls" className="cosmic-panel">
        <h3>🚀 Mission Control</h3>
        <div className="control-item">
          <span className="control-icon">📱</span>
          <span className="control-text">Point camera at Hiro marker</span>
        </div>
        <div className="control-item">
          <span className="control-icon">👆</span>
          <span className="control-text">Click Mars for info</span>
        </div>
        <div className="control-item">
          <span className="control-icon">🔍</span>
          <span className="control-text">Scroll wheel to zoom</span>
        </div>
        <div className="control-item">
          <span className="control-icon">📱</span>
          <span className="control-text">Pinch to zoom (mobile)</span>
        </div>
        <div className="control-item">
          <span className="control-icon">🔊</span>
          <span className="control-text">Audio narration enabled</span>
        </div>
      </div>

      {/* Info Box */}
      <div id="infoBox" className="cosmic-panel">
        <h2 id="planetName">Mars</h2>
        <p id="planetInfo">Mars is called the red planet. It looks red because of the presence of iron on its surface. Mars has an equatorial diameter of 6,788 km. Its average distance from the Sun is 227 million km. Mars has a very thin atmosphere which consists largely of carbon dioxide and a small percentage of other gases. It has an average surface temperature of –63°C. It is also known for its volcanoes. It has one of the largest volcanoes in the solar system, the Olympus Mons. Mars takes 687 Earth days to complete its revolution. Like Earth, it takes 24 days to complete its rotation. Mars has two moons.</p>
      </div>

      {/* A-Frame Scene Container */}
      <div ref={sceneContainerRef} style={{ 
        width: '100%', 
        height: '100vh',
        paddingTop: '70px',
        boxSizing: 'border-box'
      }}></div>
    </>
  );
};

export default Mars;