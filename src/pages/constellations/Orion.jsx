import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Orion = () => {
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
          aframeScript.async = false;
          aframeScript.onload = resolve;
          aframeScript.onerror = () => reject(new Error('Failed to load A-Frame'));
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
        setError(err.message);
      }
    };

    loadScripts();

    // Handle browser back/forward button
    const handlePopState = () => {
      console.log('Orion AR: Browser back button detected - cleaning up AR session');
      cleanupARSession();
      window.location.reload();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      cleanupARSession();
    };
  }, []);

  useEffect(() => {
    if (!scriptsLoaded || !sceneContainerRef.current) return;

    // Clear the container first
    sceneContainerRef.current.innerHTML = '';

    let imageSrc = '/models/2D/orion.png';
    if (currentView === 'withNames') imageSrc = '/models/2D/orion-with-name.png';
    else if (currentView === 'withSign') imageSrc = '/models/2D/orion-with-sign.png';

    console.log('Orion - Current view:', currentView);
    console.log('Orion - Image source:', imageSrc);

    const sceneHTML = `
      <a-scene 
        embedded 
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono; trackingMethod: best; sourceWidth: 1280; sourceHeight: 960; displayWidth: 1280; displayHeight: 960;"
        vr-mode-ui="enabled: false"
        loading-screen="enabled: false"
        renderer="antialias: true; colorManagement: true; precision: mediump;">
        
        <a-entity light="type: ambient; color: #ffffff; intensity: 1.2"></a-entity>
        <a-entity light="type: directional; color: #ffffff; intensity: 1.5" position="2 3 2"></a-entity>
        
        <a-marker preset="hiro" 
          emitevents="true" 
          id="orionMarker">
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
        
        <a-entity camera="fov: 80; aspect: 1.33; near: 0.1; far: 1000" look-controls="enabled: true" wasd-controls="enabled: false">
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

    setTimeout(() => {
      const container = document.getElementById('constellationContainer');
      if (container) {
        let currentScale = 1.5;
        const minScale = 0.3, maxScale = 4.0;
        
        document.addEventListener('wheel', (e) => {
          e.preventDefault();
          currentScale = Math.max(minScale, Math.min(maxScale, currentScale + (e.deltaY > 0 ? -0.1 : 0.1)));
          container.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
        }, { passive: false });

        let isDragging = false, previousX = 0, previousY = 0;
        document.addEventListener('mousedown', (e) => { isDragging = true; previousX = e.clientX; previousY = e.clientY; });
        document.addEventListener('mousemove', (e) => {
          if (isDragging) {
            const rotation = container.getAttribute('rotation');
            container.setAttribute('rotation', {
              x: rotation.x - (e.clientY - previousY) * 0.5,
              y: rotation.y + (e.clientX - previousX) * 0.5,
              z: rotation.z
            });
            previousX = e.clientX; previousY = e.clientY;
          }
        });
        document.addEventListener('mouseup', () => { isDragging = false; });

        let initialDistance = 0;
        document.addEventListener('touchstart', (e) => {
          if (e.touches.length === 2) {
            initialDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          }
        });
        document.addEventListener('touchmove', (e) => {
          if (e.touches.length === 2) {
            e.preventDefault();
            const distance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            currentScale = Math.max(minScale, Math.min(maxScale, currentScale + (distance - initialDistance) * 0.01));
            container.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
            initialDistance = distance;
          }
        }, { passive: false });
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

  // Handle view button clicks with speech
  const handleViewChange = (newView) => {
    setCurrentView(newView);
    
    // Get info for the new view
    const tempView = newView;
    let info;
    if (tempView === 'withNames') {
      info = { title: '✨ Orion with Star Names', text: 'This view shows Orion with labeled stars including Betelgeuse, the red supergiant shoulder star, Rigel, the brilliant blue supergiant foot star, Bellatrix, Saiph, and the famous three belt stars: Alnitak, Alnilam, and Mintaka. The Orion Nebula, also known as M42, is visible as a stellar nursery below the belt where new stars are born!' };
    } else if (tempView === 'withSign') {
      info = { title: '♈ Orion the Hunter', text: 'Orion the Hunter is one of the most prominent and recognizable constellations in the night sky. In Greek mythology, Orion was a great hunter who boasted he could kill any animal on Earth. This view shows the constellation with its mythological sign overlay representing the mighty hunter with his belt, sword, and shield.' };
    } else {
      info = { title: '🌌 Orion Constellation', text: 'Orion is one of the most recognizable constellations visible from both hemispheres. Its distinctive belt is formed by three bright stars in a row. The Orion Nebula is a stellar nursery visible below the belt where new stars are continuously being born. You can scroll to zoom and drag to rotate the view!' };
    }
    
    // Update info box and speak
    updateInfoBox(info);
    speak(info.text);
    setShowInfoBox(true);
  };

  // Function to update info box content
  const updateInfoBox = (info) => {
    const nameEl = document.getElementById('constellationName');
    const infoEl = document.getElementById('constellationInfo');
    
    if (nameEl) nameEl.textContent = info.title;
    if (infoEl) infoEl.textContent = info.text;
  };

  // Auto-speak when marker is detected
  useEffect(() => {
    if (!scriptsLoaded) return;

    const checkMarkerDetection = () => {
      const marker = document.querySelector('#orionMarker');
      if (marker) {
        marker.addEventListener('markerFound', () => {
          console.log('Orion marker detected - showing current view info');
          const info = getInfoContent();
          updateInfoBox(info);
          speak(info.text);
          setShowInfoBox(true);
        });

        marker.addEventListener('markerLost', () => {
          console.log('Orion marker lost - stopping speech');
          if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
          }
          setShowInfoBox(false);
        });
      }
    };

    // Wait for A-Frame scene to be ready
    setTimeout(checkMarkerDetection, 2000);
  }, [scriptsLoaded, currentView]);

  const getInfoContent = () => {
    if (currentView === 'withNames') {
      return { title: '✨ Orion with Star Names', text: 'This view shows Orion with labeled stars including Betelgeuse (red supergiant), Rigel (blue supergiant), Bellatrix, Saiph, and the three belt stars: Alnitak, Alnilam, and Mintaka. The Orion Nebula (M42) is also visible!' };
    } else if (currentView === 'withSign') {
      return { title: '♈ Orion with Sign Overlay', text: 'Orion the Hunter is one of the most prominent and recognizable constellations. This view shows the constellation with its mythological sign overlay representing the mighty hunter.' };
    }
    return { title: '🌌 Orion Constellation', text: 'Orion is one of the most recognizable constellations. Its distinctive belt is formed by three bright stars. The Orion Nebula is a stellar nursery visible below the belt. Scroll to zoom, drag to rotate!' };
  };

  // Enhanced AR session cleanup function
  const cleanupARSession = () => {
    console.log('Orion AR: Cleaning up AR session...');
    
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
    
    console.log('Orion AR: Session cleanup complete');
  };

  const handleBack = () => {
    console.log('Orion AR: Back button clicked - cleaning up and returning to stars');
    cleanupARSession();
    
    // Use window.location for full reload to ensure complete cleanup
    window.location.href = '/stars';
  };


  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a1a', color: 'white', textAlign: 'center', padding: '20px' }}>
        <div><h2>⚠️ Error</h2><p>{error}</p></div>
      </div>
    );
  }

  const info = getInfoContent();

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow: hidden; font-family: 'Segoe UI', sans-serif; }
        .back-button { position: absolute; top: 20px; left: 20px; z-index: 1000; display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: rgba(231, 76, 60, 0.2); border: 2px solid #e74c3c; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .back-button:hover { background: rgba(231, 76, 60, 0.4); }
        .button-group { position: absolute; top: 20px; right: 20px; z-index: 1000; display: flex; gap: 10px; }
        .view-button { padding: 10px 16px; background: rgba(231, 76, 60, 0.2); border: 2px solid #e74c3c; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: all 0.3s; font-size: 14px; }
        .view-button:hover { background: rgba(231, 76, 60, 0.4); }
        .view-button.active { background: rgba(231, 76, 60, 0.6); border-color: #fff; }
        .title { position: absolute; top: 80px; left: 50%; transform: translateX(-50%); z-index: 1000; font-size: 24px; font-weight: 700; color: #e74c3c; text-shadow: 0 0 10px rgba(231, 76, 60, 0.5); }
        .info-box { 
          position: absolute; 
          bottom: 20px; 
          left: 50%; 
          transform: translateX(-50%); 
          max-width: 600px; 
          width: 90%; 
          padding: 25px; 
          background: rgba(255, 255, 255, 0.98); 
          border: 3px solid #e74c3c; 
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
          background: #e74c3c; 
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
          background: #c0392b; 
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
          background: linear-gradient(135deg, #e74c3c, #c0392b); 
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
          box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4); 
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

      {!scriptsLoaded && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
          <div style={{ textAlign: 'center' }}><h2>Loading Orion AR...</h2></div>
        </div>
      )}

      <button className="back-button" onClick={handleBack}>
        <img src="/images/back-arrow.svg" alt="Back" style={{ width: '20px', height: '20px' }} />
        <span>Back</span>
      </button>
      
      <div className="button-group">
        <button className={`view-button ${currentView === 'basic' ? 'active' : ''}`} onClick={() => handleViewChange('basic')}>🌌 Basic</button>
        <button className={`view-button ${currentView === 'withNames' ? 'active' : ''}`} onClick={() => handleViewChange('withNames')}>✨ Star Names</button>
        <button className={`view-button ${currentView === 'withSign' ? 'active' : ''}`} onClick={() => handleViewChange('withSign')}>♈ Show Sign</button>
      </div>

      <h1 className="title">🌟 Orion AR</h1>

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

export default Orion;
