import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Libra = () => {
  const sceneContainerRef = useRef(null);
  const navigate = useNavigate();
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('basic');
  const [showInfoBox, setShowInfoBox] = useState(false);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 0.9;
      speechSynthesis.speak(utter);
    }
  };

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
        setError(err.message);
      }
    };

    loadScripts();
    const handlePopState = () => {
      console.log('Libra AR: Browser back button detected - cleaning up AR session');
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

    let imageSrc = '/models/2D/libra.png';
    if (currentView === 'withNames') imageSrc = '/models/2D/libra-with-name.png';
    else if (currentView === 'withSign') imageSrc = '/models/2D/libra-with-sign.png';

    console.log('Libra - Current view:', currentView);
    console.log('Libra - Image source:', imageSrc);

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

  const getInfoContent = () => {
    if (currentView === 'withNames') {
      return { title: '✨ Libra with Star Names', text: 'This view shows Libra the Scales with labeled stars including Zubeneschamali (Beta Librae, the brightest star meaning "northern claw"), Zubenelgenubi (Alpha Librae, meaning "southern claw"), and other notable stars. These stars were once considered part of Scorpius before Libra became its own constellation!' };
    } else if (currentView === 'withSign') {
      return { title: '♎ Libra the Scales', text: 'Libra the Scales represents the seventh astrological sign of the zodiac. In astrology, Libra is associated with balance, justice, harmony, partnership, and diplomacy. The constellation represents the scales of justice held by the goddess Themis. Libras are known for their fair-minded, cooperative, and peace-loving nature.' };
    }
    return { title: '🌌 Libra Constellation', text: 'Libra is a zodiac constellation representing the scales of justice, symbolizing balance and fairness. It was once considered part of Scorpius\'s claws before becoming its own constellation. You can scroll to zoom and drag to rotate the view!' };
  };

  const cleanupARSession = () => {
    console.log('Libra AR: Cleaning up AR session...');
    if ('speechSynthesis' in window) speechSynthesis.cancel();
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
    const aframeScene = document.querySelector('a-scene');
    if (aframeScene && aframeScene.systems) {
      if (aframeScene.systems.arjs) console.log('Stopping AR.js system');
      aframeScene.pause();
      aframeScene.remove();
    }
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    console.log('Libra AR: Session cleanup complete');
  };

  const handleBack = () => {
    console.log('Libra AR: Back button clicked - cleaning up and returning to stars');
    cleanupARSession();
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

      {!scriptsLoaded && <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}><h2>Loading Libra AR...</h2></div>}

      <button className="back-button" onClick={handleBack}>
        <img src="/images/back-arrow.svg" alt="Back" style={{ width: '20px' }} />
        <span>Back</span>
      </button>
      
      <div className="button-group">
        <button className={`view-button ${currentView === 'basic' ? 'active' : ''}`} onClick={() => { setCurrentView('basic'); setShowInfoBox(true); }}>🌌 Basic</button>
        <button className={`view-button ${currentView === 'withNames' ? 'active' : ''}`} onClick={() => { setCurrentView('withNames'); setShowInfoBox(true); }}>✨ Star Names</button>
        <button className={`view-button ${currentView === 'withSign' ? 'active' : ''}`} onClick={() => { setCurrentView('withSign'); setShowInfoBox(true); }}>♎ Show Sign</button>
      </div>

      <h1 className="title">♎ Libra AR</h1>

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

export default Libra;
