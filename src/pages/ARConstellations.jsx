import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ARConstellations = () => {
  const sceneContainerRef = useRef(null);
  const navigate = useNavigate();
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [error, setError] = useState(null);
  // All constellations are always visible in one marker
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [infoBoxContent, setInfoBoxContent] = useState({ title: '', text: '' });
  const [viewMode, setViewMode] = useState('basic'); // 'basic', 'withNames', 'withSigns'

  // Constellation data with positions and information - using 2D models
  // Positioned in a wider circular arrangement with larger models for better viewing
  const constellations = {
    orion: {
      name: 'Orion',
      position: '0 4 -5',
      rotation: '0 0 0',
      scale: '1.2 1.2 1.2',
      image: '/models/2D/orion.png',
      imageWithName: '/models/2D/orion-with-name.png',
      imageWithSign: '/models/2D/orion-with-sign.png',
      info: 'Orion the Hunter is one of the most recognizable constellations. Its distinctive belt is formed by three bright stars: Alnitak, Alnilam, and Mintaka.',
      color: '#ff6b35',
      animationDelay: '0s'
    },
    bigdipper: {
      name: 'Big Dipper',
      position: '-5 3 -4',
      rotation: '0 45 0',
      scale: '1.0 1.0 1.0',
      image: '/models/2D/bigdipper.png',
      imageWithName: '/models/2D/bigdipper-with-name.png',
      info: 'The Big Dipper is part of Ursa Major. Its seven bright stars form a distinctive ladle shape that has guided travelers for centuries.',
      color: '#4ecdc4',
      animationDelay: '0.5s'
    },
    littledipper: {
      name: 'Little Dipper',
      position: '5 3 -4',
      rotation: '0 -45 0',
      scale: '0.9 0.9 0.9',
      image: '/models/2D/littledipper.png',
      imageWithName: '/models/2D/littledipper-with-name.png',
      info: 'The Little Dipper, or Ursa Minor, contains Polaris, the North Star, at the end of its handle. It has been crucial for navigation.',
      color: '#45b7d1',
      animationDelay: '1s'
    },
    leo: {
      name: 'Leo',
      position: '-4 -2 -5',
      rotation: '0 30 0',
      scale: '1.1 1.1 1.1',
      image: '/models/2D/leo.png',
      imageWithName: '/models/2D/leo-with-name.png',
      imageWithSign: '/models/2D/leo-with-sign.png',
      info: 'Leo the Lion is a zodiac constellation. Its brightest star, Regulus, marks the heart of the lion in this majestic constellation.',
      color: '#f39c12',
      animationDelay: '1.5s'
    },
    cancer: {
      name: 'Cancer',
      position: '4 -2 -5',
      rotation: '0 -30 0',
      scale: '1.0 1.0 1.0',
      image: '/models/2D/cancer.png',
      imageWithName: '/models/2D/cancer-with-name.png',
      imageWithSign: '/models/2D/cancer-with-sign.png',
      info: 'Cancer the Crab is the faintest of the zodiac constellations. It contains the beautiful Beehive Cluster (M44).',
      color: '#e74c3c',
      animationDelay: '2s'
    },
    taurus: {
      name: 'Taurus',
      position: '-3 0 -6',
      rotation: '0 15 0',
      scale: '1.0 1.0 1.0',
      image: '/models/2D/taurus.png',
      imageWithName: '/models/2D/taurus-with-name.png',
      imageWithSign: '/models/2D/taurus-with-sign.png',
      info: 'Taurus the Bull features the bright star Aldebaran and the famous Pleiades star cluster, also known as the Seven Sisters.',
      color: '#8e44ad',
      animationDelay: '2.5s'
    },
    virgo: {
      name: 'Virgo',
      position: '3 0 -6',
      rotation: '0 -15 0',
      scale: '1.0 1.0 1.0',
      image: '/models/2D/virgo.png',
      imageWithName: '/models/2D/virgo-with-name.png',
      imageWithSign: '/models/2D/virgo-with-sign.png',
      info: 'Virgo the Maiden is the second largest constellation. Its brightest star, Spica, is actually a binary star system.',
      color: '#27ae60',
      animationDelay: '3s'
    },
    libra: {
      name: 'Libra',
      position: '0 -4 -5',
      rotation: '0 0 0',
      scale: '1.0 1.0 1.0',
      image: '/models/2D/libra.png',
      imageWithName: '/models/2D/libra-with-name.png',
      imageWithSign: '/models/2D/libra-with-sign.png',
      info: 'Libra the Scales represents balance and justice. It was once considered part of Scorpius before becoming its own constellation.',
      color: '#16a085',
      animationDelay: '3.5s'
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

    return () => {
      // Cleanup function
      const cleanup = async () => {
        try {
          // Stop camera stream
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
          }
        } catch (error) {
          console.log('Camera cleanup completed');
        }

        // Clean up A-Frame scene
        const scene = document.querySelector('a-scene');
        if (scene) {
          scene.pause();
          scene.remove();
        }

        // Reset body styles
        document.body.style.margin = '';
        document.body.style.padding = '';
        document.body.style.overflow = '';
      };

      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!scriptsLoaded) return;

    const generateConstellationElements = () => {
      // Display all constellations simultaneously in one marker
      return Object.entries(constellations).map(([key, constellation]) => {
        // Choose image based on view mode
        let imageSrc = constellation.image; // default basic
        if (viewMode === 'withNames' && constellation.imageWithName) {
          imageSrc = constellation.imageWithName;
        } else if (viewMode === 'withSigns' && constellation.imageWithSign) {
          imageSrc = constellation.imageWithSign;
        }
        
        console.log(`Loading constellation ${key} with image: ${imageSrc}`);
        
        return `
          <a-entity 
            id="${key}Container" 
            position="${constellation.position}" 
            scale="${constellation.scale}" 
            rotation="${constellation.rotation}"
            class="constellation-group clickable"
            data-constellation="${key}"
            animation__appear="property: scale; from: 0 0 0; to: ${constellation.scale}; dur: 1000; delay: ${constellation.animationDelay}; easing: easeOutElastic"
            animation__float="property: position; from: ${constellation.position}; to: ${constellation.position.split(' ').map((coord, i) => i === 1 ? (parseFloat(coord) + 0.3).toString() : coord).join(' ')}; dur: 3000; delay: ${constellation.animationDelay}; dir: alternate; loop: true; easing: easeInOutSine">
            <a-plane 
              src="${imageSrc}" 
              transparent="true" 
              width="2.5" 
              height="2.5"
              rotation="-90 0 0"
              class="clickable constellation-plane"
              data-constellation="${key}"
              material="transparent: true; alphaTest: 0.1; side: double; opacity: 0.9"
              geometry="primitive: plane"
              animation__glow="property: material.opacity; from: 0.9; to: 1; dur: 2000; dir: alternate; loop: true; easing: easeInOutQuad">
            </a-plane>
            <a-text 
              value="${constellation.name}"
              position="0 -1.5 0.1"
              align="center"
              color="${constellation.color}"
              scale="0.6 0.6 0.6"
              animation__textglow="property: material.color; from: ${constellation.color}; to: #ffffff; dur: 2500; dir: alternate; loop: true; easing: easeInOutSine">
            </a-text>
            <a-sphere
              radius="0.08"
              color="${constellation.color}"
              position="0 0 0.1"
              class="constellation-marker"
              opacity="0.8"
              animation__pulse="property: scale; from: 1 1 1; to: 1.3 1.3 1.3; dur: 1500; dir: alternate; loop: true; easing: easeInOutQuad"
              animation__colorshift="property: material.color; from: ${constellation.color}; to: #ffffff; dur: 2000; dir: alternate; loop: true; easing: easeInOutSine">
            </a-sphere>
            
            <!-- Particle effects around constellation -->
            <a-entity id="${key}Particles">
              ${Array.from({length: 5}, (_, i) => `
                <a-sphere
                  radius="0.02"
                  color="${constellation.color}"
                  position="${(Math.random() - 0.5) * 3} ${(Math.random() - 0.5) * 3} ${0.2 + Math.random() * 0.5}"
                  opacity="0.6"
                  animation__orbit="property: rotation; from: 0 0 0; to: 0 360 0; dur: ${8000 + i * 1000}; loop: true; easing: linear"
                  animation__twinkle="property: material.opacity; from: 0.3; to: 0.8; dur: ${1000 + i * 200}; dir: alternate; loop: true; easing: easeInOutSine">
                </a-sphere>
              `).join('')}
            </a-entity>
          </a-entity>
        `;
      }).join('');
    };

    // Preload all images first
    const preloadImages = () => {
      const imageUrls = [];
      Object.values(constellations).forEach(constellation => {
        imageUrls.push(constellation.image);
        if (constellation.imageWithName) imageUrls.push(constellation.imageWithName);
        if (constellation.imageWithSign) imageUrls.push(constellation.imageWithSign);
      });
      
      return imageUrls.map((url, index) => `
        <img id="img${index}" src="${url}" crossorigin="anonymous" />
      `).join('');
    };

    const sceneHTML = `
      <a-scene 
        embedded 
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;" 
        vr-mode-ui="enabled: false" 
        loading-screen="enabled: false"
        renderer="antialias: true; colorManagement: true; precision: mediump;">
        
        <a-assets>
          ${preloadImages()}
        </a-assets>
        
        <a-entity light="type: ambient; color: #ffffff; intensity: 1.5"></a-entity>
        <a-entity light="type: directional; color: #ffffff; intensity: 2.0" position="2 4 2"></a-entity>
        
        <a-marker preset="hiro" 
          emitevents="true" 
          id="constellationMarker"
          raycaster="objects: .clickable"
          cursor="rayOrigin: mouse">
          
          <a-entity id="constellationWorld" position="0 0 0" rotation="0 0 0">
            ${generateConstellationElements()}
            
            <!-- Enhanced Ambient Stars with Animation -->
            <a-entity id="starField">
              ${Array.from({length: 30}, (_, i) => {
                const x = (Math.random() - 0.5) * 15;
                const y = (Math.random() - 0.5) * 15;
                const z = -8 - Math.random() * 8;
                const radius = 0.01 + Math.random() * 0.03;
                const opacity = 0.4 + Math.random() * 0.6;
                return `
                  <a-sphere
                    radius="${radius}"
                    color="#ffffff"
                    position="${x} ${y} ${z}"
                    opacity="${opacity}"
                    animation__twinkle="property: material.opacity; from: ${opacity * 0.3}; to: ${opacity}; dur: ${2000 + Math.random() * 3000}; dir: alternate; loop: true; easing: easeInOutSine"
                    animation__drift="property: position; from: ${x} ${y} ${z}; to: ${x + (Math.random() - 0.5) * 2} ${y + (Math.random() - 0.5) * 2} ${z}; dur: ${8000 + Math.random() * 4000}; dir: alternate; loop: true; easing: easeInOutSine">
                  </a-sphere>
                `;
              }).join('')}
            </a-entity>
            
            <!-- Magical Constellation Ring Animation -->
            <a-entity id="magicRing" 
              position="0 0 -4"
              animation__rotate="property: rotation; from: 0 0 0; to: 0 360 0; dur: 20000; loop: true; easing: linear">
              ${Array.from({length: 12}, (_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const x = Math.cos(angle) * 8;
                const z = Math.sin(angle) * 8;
                return `
                  <a-sphere
                    radius="0.05"
                    color="#4facfe"
                    position="${x} 0 ${z}"
                    opacity="0.6"
                    animation__pulse="property: scale; from: 1 1 1; to: 1.5 1.5 1.5; dur: 2000; dir: alternate; loop: true; easing: easeInOutSine; delay: ${i * 200}"
                    animation__glow="property: material.color; from: #4facfe; to: #00f2fe; dur: 1500; dir: alternate; loop: true; easing: easeInOutSine; delay: ${i * 100}">
                  </a-sphere>
                `;
              }).join('')}
            </a-entity>
            
            <!-- Central Energy Core -->
            <a-entity id="energyCore" position="0 0 -4">
              <a-sphere
                radius="0.1"
                color="#ffffff"
                opacity="0.3"
                animation__coreGlow="property: scale; from: 1 1 1; to: 2 2 2; dur: 4000; dir: alternate; loop: true; easing: easeInOutSine"
                animation__coreColor="property: material.color; from: #ffffff; to: #4facfe; dur: 3000; dir: alternate; loop: true; easing: easeInOutSine">
              </a-sphere>
            </a-entity>
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

    setTimeout(() => {
      sceneContainerRef.current.innerHTML = sceneHTML;
    }, 100);

    // Add interaction handlers
    setTimeout(() => {
      const setupInteractions = () => {
        // Add marker detection debugging
        const marker = document.getElementById('constellationMarker');
        if (marker) {
          marker.addEventListener('markerFound', () => {
            console.log('Hiro marker detected!');
            updateInfoBox({
              title: '🎯 Marker Detected!',
              text: 'Hiro marker found! Constellations should now be visible.'
            });
            setShowInfoBox(true);
          });
          
          marker.addEventListener('markerLost', () => {
            console.log('Hiro marker lost!');
          });
        }
        
        // Click handlers for constellations
        document.querySelectorAll('.constellation-plane').forEach(plane => {
          plane.addEventListener('click', (e) => {
            const constellationKey = e.target.getAttribute('data-constellation');
            if (constellationKey) {
              const constellation = constellations[constellationKey];
              updateInfoBox({
                title: `✨ ${constellation.name}`,
                text: constellation.info
              });
              speak(constellation.info);
              setShowInfoBox(true);
            }
          });
        });

        // Mouse and touch controls for the constellation world
        const world = document.getElementById('constellationWorld');
        if (world) {
          let currentScale = 1;
          const minScale = 0.3, maxScale = 3.0;
          
          // Mouse wheel zoom
          document.addEventListener('wheel', (e) => {
            e.preventDefault();
            currentScale = Math.max(minScale, Math.min(maxScale, currentScale + (e.deltaY > 0 ? -0.1 : 0.1)));
            world.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
          }, { passive: false });

          // Mouse drag rotation
          let isDragging = false, previousX = 0, previousY = 0;
          document.addEventListener('mousedown', (e) => { 
            isDragging = true; 
            previousX = e.clientX; 
            previousY = e.clientY; 
          });
          document.addEventListener('mousemove', (e) => {
            if (isDragging) {
              const rotation = world.getAttribute('rotation');
              world.setAttribute('rotation', {
                x: rotation.x - (e.clientY - previousY) * 0.3,
                y: rotation.y + (e.clientX - previousX) * 0.3,
                z: rotation.z
              });
              previousX = e.clientX; 
              previousY = e.clientY;
            }
          });
          document.addEventListener('mouseup', () => { isDragging = false; });

          // Touch controls
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
              currentScale = Math.max(minScale, Math.min(maxScale, currentScale + (distance - initialDistance) * 0.005));
              world.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
              initialDistance = distance;
            }
          }, { passive: false });
        }
      };

      setupInteractions();
    }, 1500);

  }, [scriptsLoaded, viewMode]);

  // Speech synthesis function
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 0.9;
      speechSynthesis.speak(utter);
    }
  };

  // Update info box
  const updateInfoBox = (info) => {
    setInfoBoxContent(info);
    setShowInfoBox(true);
  };

  // Handle back navigation
  const handleBack = () => {
    // Clean up AR session
    const cleanup = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        }
      } catch (error) {
        console.log('Camera cleanup completed');
      }

      const scene = document.querySelector('a-scene');
      if (scene) {
        scene.pause();
        scene.remove();
      }

      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
    };

    cleanup().then(() => {
      window.location.href = '/explore';
    });
  };

  // Initialize welcome message
  const showWelcomeMessage = () => {
    updateInfoBox({
      title: '🌌 All Constellations',
      text: 'Welcome to the constellation explorer! All 8 constellations are visible in this AR marker. Click on any constellation to learn more about it. Use mouse wheel or pinch to zoom, and drag to rotate the view.'
    });
    speak('Welcome to the constellation explorer! All constellations are visible. Click on any constellation to learn more.');
    setShowInfoBox(true);
  };

  // Handle view mode changes
  const cycleViewMode = () => {
    const modes = ['basic', 'withNames', 'withSigns'];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    setViewMode(nextMode);
    
    const modeNames = {
      'basic': 'Basic View',
      'withNames': 'With Star Names', 
      'withSigns': 'With Zodiac Signs'
    };
    
    updateInfoBox({
      title: `🔄 ${modeNames[nextMode]}`,
      text: `Switched to ${modeNames[nextMode]} - showing constellations ${nextMode === 'basic' ? 'in their pure form' : nextMode === 'withNames' ? 'with star names labeled' : 'with zodiac symbols'}.`
    });
    speak(`Switched to ${modeNames[nextMode]}`);
    setShowInfoBox(true);
  };

  if (error) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#000', 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h2>AR Error</h2>
        <p>{error}</p>
        <button 
          onClick={handleBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Back to Explore
        </button>
      </div>
    );
  }

  if (!scriptsLoaded) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#000', 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>🌟 Loading AR Constellations...</h2>
          <p>Please allow camera access when prompted</p>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid #333', 
            borderTop: '3px solid #fff', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '20px auto'
          }}></div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* AR Scene Container */}
      <div ref={sceneContainerRef} style={{ width: '100%', height: '100%' }}></div>
      
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        right: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 1000,
        gap: '10px'
      }}>
        {/* Back Button */}
        <button
          onClick={handleBack}
          style={{
            padding: '14px 24px',
            backgroundColor: 'rgba(220, 53, 69, 0.95)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.6)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.4)';
          }}
        >
          <span style={{ fontSize: '18px' }}>←</span>
          Back
        </button>
        
        {/* Right Controls */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'flex-end'
        }}>
          {/* View Mode Button */}
          <button
            onClick={cycleViewMode}
            style={{
              padding: '12px 20px',
              backgroundColor: 'rgba(255, 193, 7, 0.95)',
              color: '#000',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 3px 12px rgba(255, 193, 7, 0.4)',
              transition: 'all 0.3s ease',
              minWidth: '120px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 5px 18px rgba(255, 193, 7, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 3px 12px rgba(255, 193, 7, 0.4)';
            }}
          >
            {viewMode === 'basic' ? '⭐ Basic' : viewMode === 'withNames' ? '🏷️ Names' : '♈ Signs'}
          </button>
          
          {/* Info Button */}
          <button
            onClick={showWelcomeMessage}
            style={{
              padding: '10px 18px',
              backgroundColor: 'rgba(23, 162, 184, 0.95)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              boxShadow: '0 3px 12px rgba(23, 162, 184, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 5px 18px rgba(23, 162, 184, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 3px 12px rgba(23, 162, 184, 0.4)';
            }}
          >
            ℹ️ Help
          </button>
        </div>
      </div>

      {/* Enhanced Info Box */}
      {showInfoBox && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(27, 38, 59, 0.95))',
          backdropFilter: 'blur(10px)',
          color: 'white',
          padding: '24px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          maxHeight: '250px',
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '20px', 
                fontWeight: '700',
                background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {infoBoxContent.title}
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '15px', 
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                {infoBoxContent.text}
              </p>
            </div>
            <button
              onClick={() => setShowInfoBox(false)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Instructions Banner */}
      <div style={{
        position: 'absolute',
        top: '90px',
        left: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.9), rgba(143, 130, 233, 0.9))',
        backdropFilter: 'blur(8px)',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '15px',
        fontSize: '14px',
        textAlign: 'center',
        zIndex: 999,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 20px rgba(74, 144, 226, 0.3)'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          🎯 AR Constellation Explorer
        </div>
        <div style={{ fontSize: '13px', opacity: '0.9' }}>
          Point camera at Hiro marker • Click constellations to learn • Use buttons to switch views
        </div>
      </div>

      {/* Enhanced AR Status Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '90px',
        right: '20px',
        background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.95), rgba(25, 135, 84, 0.95))',
        color: 'white',
        padding: '10px 16px',
        borderRadius: '25px',
        fontSize: '12px',
        fontWeight: '600',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 3px 15px rgba(40, 167, 69, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          animation: 'pulse 2s infinite'
        }}></div>
        AR Active
      </div>

      {/* Add CSS animations */}
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(0.8);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ARConstellations;
