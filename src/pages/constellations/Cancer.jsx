import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Cancer = () => {
  const sceneContainerRef = useRef(null);
  const navigate = useNavigate();
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('basic');
  const [showInfoBox, setShowInfoBox] = useState(false);

  useEffect(() => {
    const loadScripts = async () => {
      try {
        if (window.AFRAME) {
          setScriptsLoaded(true);
          return;
        }
        await new Promise((resolve, reject) => {
          const aframeScript = document.createElement('script');
          aframeScript.src = 'https://aframe.io/releases/1.2.0/aframe.min.js';
          aframeScript.onload = resolve;
          aframeScript.onerror = reject;
          document.head.appendChild(aframeScript);
        });
        await new Promise((resolve, reject) => {
          const arScript = document.createElement('script');
          arScript.src = 'https://cdn.rawgit.com/jeromeetienne/AR.js/2.2.1/aframe/build/aframe-ar.js';
          arScript.onload = () => {
            console.log('AR.js loaded successfully');
            resolve();
          };
          arScript.onerror = (error) => {
            console.error('AR.js failed to load:', error);
            reject(error);
          };
          document.head.appendChild(arScript);
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        setScriptsLoaded(true);
      } catch (err) {
        console.error('Error loading scripts:', err);
        setError(err.message);
      }
    };

    loadScripts();

    // Handle browser back/forward button
    const handlePopState = () => {
      console.log('Cancer AR: Browser back button detected - cleaning up AR session');
      cleanupARSession();
      window.location.reload();
    };

    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
      cleanupARSession();
    };
  }, []);

  useEffect(() => {
    if (!scriptsLoaded || !sceneContainerRef.current) return;

    // Clear the container first
    sceneContainerRef.current.innerHTML = '';

    let imageSrc = '/models/2D/cancer.png';
    if (currentView === 'withNames') imageSrc = '/models/2D/cancer-with-name.png';
    else if (currentView === 'withSign') imageSrc = '/models/2D/cancer-with-sign.png';

    console.log('Cancer - Current view:', currentView);
    console.log('Cancer - Image source:', imageSrc);

    const sceneHTML = `
      <a-scene 
        embedded 
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono; trackingMethod: best;"
        vr-mode-ui="enabled: false"
        loading-screen="enabled: false"
        renderer="antialias: true; colorManagement: true;">
        
        <a-entity light="type: ambient; color: #ffffff; intensity: 1.2"></a-entity>
        <a-entity light="type: directional; color: #ffffff; intensity: 1.5" position="2 3 2"></a-entity>
        
        <a-marker preset="hiro" 
          emitevents="true" 
          size="1" 
          type="pattern"
          raycaster="objects: .clickable"
          cursor="rayOrigin: mouse">
          <a-entity id="constellationContainer" position="0 0 0" scale="1.5 1.5 1.5" rotation="0 0 0">
            <a-plane 
              src="${imageSrc}" 
              transparent="true" 
              width="2" 
              height="2" 
              rotation="-90 0 0"
              class="clickable"
              onerror="console.error('Image failed to load:', '${imageSrc}')"
              onload="console.log('Image loaded successfully:', '${imageSrc}')">
            </a-plane>
          </a-entity>
        </a-marker>
        
        <a-entity camera look-controls="enabled: true">
          <a-cursor
            raycaster="objects: .clickable"
            geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
            material="color: white; shader: flat"
            position="0 0 -1">
          </a-cursor>
        </a-entity>
      </a-scene>
    `;
    
    // Add a small delay to ensure proper rendering
    setTimeout(() => {
      sceneContainerRef.current.innerHTML = sceneHTML;
    }, 100);

    // Add zoom and rotate functionality
    setTimeout(() => {
      const container = document.getElementById('constellationContainer');
      if (container) {
        console.log('Container found, setting up interactions');
        let currentScale = 1.5;
        const minScale = 0.3;
        const maxScale = 4.0;

        // Mouse wheel zoom
        document.addEventListener('wheel', (e) => {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          currentScale = Math.max(minScale, Math.min(maxScale, currentScale + delta));
          container.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
        }, { passive: false });

        // Mouse drag to rotate
        let isDragging = false;
        let previousX = 0, previousY = 0;
        document.addEventListener('mousedown', (e) => {
          isDragging = true;
          previousX = e.clientX;
          previousY = e.clientY;
        });
        document.addEventListener('mousemove', (e) => {
          if (isDragging) {
            const deltaX = e.clientX - previousX;
            const deltaY = e.clientY - previousY;
            const rotation = container.getAttribute('rotation');
            container.setAttribute('rotation', {
              x: rotation.x - deltaY * 0.5,
              y: rotation.y + deltaX * 0.5,
              z: rotation.z
            });
            previousX = e.clientX;
            previousY = e.clientY;
          }
        });
        document.addEventListener('mouseup', () => { isDragging = false; });

        // Touch pinch zoom
        let initialDistance = 0;
        document.addEventListener('touchstart', (e) => {
          if (e.touches.length === 2) {
            initialDistance = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
          }
        });
        document.addEventListener('touchmove', (e) => {
          if (e.touches.length === 2) {
            e.preventDefault();
            const distance = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            const scaleChange = (distance - initialDistance) * 0.01;
            currentScale = Math.max(minScale, Math.min(maxScale, currentScale + scaleChange));
            container.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
            initialDistance = distance;
          }
        }, { passive: false });
      } else {
        console.error('Container not found!');
      }
    }, 1200);
  }, [scriptsLoaded, currentView]);

  // Add speech synthesis function
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 0.9;
      speechSynthesis.speak(utter);
    }
  };

  // Handle view button clicks without automatic speech
  const handleViewChange = (newView) => {
    setCurrentView(newView);
    setShowInfoBox(true);
  };

  const updateInfoBox = (info) => {
    const nameEl = document.getElementById('constellationName');
    const infoEl = document.getElementById('constellationInfo');
    if (nameEl) nameEl.textContent = info.title;
    if (infoEl) infoEl.textContent = info.text;
  };

  useEffect(() => {
    if (!scriptsLoaded) return;
    const checkMarkerDetection = () => {
      const marker = document.querySelector('a-marker');
      if (marker) {
        marker.addEventListener('markerFound', () => {
          console.log('Cancer marker detected - showing info box');
          setShowInfoBox(true);
        });
        marker.addEventListener('markerLost', () => {
          console.log('Cancer marker lost - hiding info box');
          if ('speechSynthesis' in window) speechSynthesis.cancel();
          setShowInfoBox(false);
        });
      }
    };
    setTimeout(checkMarkerDetection, 2000);
  }, [scriptsLoaded, currentView]);

  const getInfoContent = () => {
    if (currentView === 'withNames') {
      return { title: '✨ Cancer with Star Names', text: 'This view shows Cancer the Crab with labeled stars including Acubens (Alpha Cancri), Al Tarf (Beta Cancri), Asellus Borealis and Asellus Australis (the northern and southern donkeys), and Tegmine. The famous Beehive Cluster (M44 or Praesepe) is also visible as a fuzzy patch of stars!' };
    } else if (currentView === 'withSign') {
      return { title: '♋ Cancer the Crab', text: 'Cancer the Crab represents the fourth astrological sign of the zodiac. In astrology, Cancer is associated with emotion, intuition, home, and family. The constellation represents the crab that pinched Hercules during his battle with the Hydra. Cancers are known for their nurturing, protective, and empathetic nature.' };
    }
    return { title: '🌌 Cancer Constellation', text: 'Cancer is a faint zodiac constellation located between Gemini and Leo. Though dim, it contains the beautiful Beehive Cluster, one of the nearest open star clusters to Earth. The constellation represents a crab in mythology. You can scroll to zoom and drag to rotate the view!' };
  };

  // Enhanced AR session cleanup function
  const cleanupARSession = () => {
    console.log('Cancer AR: Cleaning up AR session...');
    
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
    });
    
    // Pause and remove video elements
    videoElements.forEach(video => {
      video.pause();
      video.src = '';
      video.load();
    });
    
    // Remove A-Frame scene
    const aframeScene = document.querySelector('a-scene');
    if (aframeScene && aframeScene.systems) {
      // Properly destroy AR.js
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
    
    console.log('Cancer AR: Session cleanup complete');
  };

  const handleBack = () => {
    console.log('Cancer AR: Back button clicked - cleaning up and returning to stars');
    cleanupARSession();
    
    // Use window.location for full reload to ensure complete cleanup
    window.location.href = '/stars';
  };

  if (error) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a1a', color: 'white' }}><h2>Error: {error}</h2></div>;

  const info = getInfoContent();

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow: hidden; font-family: 'Segoe UI', sans-serif; }
        .back-button { position: absolute; top: 20px; left: 20px; z-index: 1000; display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: rgba(155, 89, 182, 0.2); border: 2px solid #9b59b6; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .back-button:hover { background: rgba(155, 89, 182, 0.4); }
        .button-group { position: absolute; top: 20px; right: 20px; z-index: 1000; display: flex; gap: 10px; }
        .view-button { padding: 10px 16px; background: rgba(155, 89, 182, 0.2); border: 2px solid #9b59b6; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: all 0.3s; font-size: 14px; }
        .view-button:hover { background: rgba(155, 89, 182, 0.4); }
        .view-button.active { background: rgba(155, 89, 182, 0.6); border-color: #fff; }
        .title { position: absolute; top: 80px; left: 50%; transform: translateX(-50%); z-index: 1000; font-size: 24px; font-weight: 700; color: #9b59b6; text-shadow: 0 0 10px rgba(155, 89, 182, 0.5); }
        .info-box { 
          position: absolute; 
          bottom: 20px; 
          left: 50%; 
          transform: translateX(-50%); 
          max-width: 600px; 
          width: 90%; 
          padding: 25px; 
          background: rgba(255, 255, 255, 0.98); 
          border: 3px solid #9b59b6; 
          border-radius: 20px; 
          z-index: 1000; 
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
          backdrop-filter: blur(10px);
        }
        .info-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          margin-bottom: 15px; 
        }
        .info-box h2 { 
          margin: 0; 
          font-size: 22px; 
          color: #2c3e50; 
          font-weight: bold; 
          flex: 1;
          line-height: 1.3;
        }
        .close-btn { 
          background: #9b59b6; 
          color: white; 
          border: none; 
          border-radius: 50%; 
          width: 30px; 
          height: 30px; 
          cursor: pointer; 
          font-size: 16px; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          margin-left: 15px;
          transition: all 0.3s ease;
        }
        .close-btn:hover { 
          background: #8e44ad; 
          transform: scale(1.1); 
        }
        .info-box p { 
          margin: 0 0 20px 0; 
          font-size: 16px; 
          color: #2c3e50; 
          line-height: 1.7; 
          text-align: justify;
        }
        .info-actions { 
          display: flex; 
          justify-content: center; 
          gap: 15px; 
        }
        .speak-btn { 
          background: linear-gradient(135deg, #9b59b6, #8e44ad); 
          color: white; 
          border: none; 
          padding: 12px 20px; 
          border-radius: 25px; 
          cursor: pointer; 
          font-size: 14px; 
          font-weight: 600; 
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .speak-btn:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 5px 15px rgba(155, 89, 182, 0.4); 
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @media (max-width: 768px) {
          .info-box { 
            max-width: 95%; 
            padding: 20px; 
            bottom: 10px; 
          }
          .info-box h2 { 
            font-size: 18px; 
          }
          .info-box p { 
            font-size: 14px; 
          }
        }
      `}</style>

      {!scriptsLoaded && <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}><h2>Loading Cancer AR...</h2></div>}

      <button className="back-button" onClick={handleBack}>
        <img src="/images/back-arrow.svg" alt="Back" style={{ width: '20px' }} />
        <span>Back</span>
      </button>
      
      <div className="button-group">
        <button className={`view-button ${currentView === 'basic' ? 'active' : ''}`} onClick={() => setCurrentView('basic')}>
          🌌 Basic
        </button>
        <button className={`view-button ${currentView === 'withNames' ? 'active' : ''}`} onClick={() => setCurrentView('withNames')}>
          ✨ Star Names
        </button>
        <button className={`view-button ${currentView === 'withSign' ? 'active' : ''}`} onClick={() => setCurrentView('withSign')}>
          ♋ Show Sign
        </button>
      </div>

      <h1 className="title">♋ Cancer AR</h1>

      {showInfoBox && (
        <div id="infoBox" className="info-box" style={{ 
          display: 'block',
          animation: 'slideUp 0.5s ease-out'
        }}>
          <div className="info-header">
            <h2 id="constellationName">{getInfoContent().title}</h2>
            <button className="close-btn" onClick={() => setShowInfoBox(false)}>✕</button>
          </div>
          <p id="constellationInfo">{getInfoContent().text}</p>
          <div className="info-actions">
            <button className="speak-btn" onClick={() => speak(getInfoContent().text)}>▶️ Play Audio</button>
          </div>
        </div>
      )}

      <div ref={sceneContainerRef} style={{ width: '100%', height: '100vh' }}></div>
    </>
  );
};

export default Cancer;
