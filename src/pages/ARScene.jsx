import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Earth from '../pages/planets/Earth';
import Venus from '../pages/planets/Venus';
import Saturn from '../pages/planets/Saturn';
import Jupiter from '../pages/planets/Jupiter';
import Uranus from '../pages/planets/Uranus';

const ARScene = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPlanet = location.state?.planet;
  const sceneContainerRef = useRef(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isARActive, setIsARActive] = useState(false);


  const planets = {
    sun: "Sun: The star at the center of our Solar System. Contains 99.8% of the Solar System's total mass.",
    mercury: "Mercury: The closest planet to the Sun. A year on Mercury is only 88 Earth days long.",
    venus: "Venus: The hottest planet in the Solar System with a runaway greenhouse effect.",
    earth: "Earth: The only known planet with life. About 71% of its surface is covered by water.",
    moon: "Moon: Earth's natural satellite. The same side always faces Earth due to tidal locking.",
    mars: "Mars: Known as the Red Planet. Home to Olympus Mons, the tallest volcano in the Solar System.",
    jupiter: "Jupiter: The largest planet. Its Great Red Spot is a storm that's raged for 300+ years. Has over 80 moons!",
    saturn: "Saturn: Famous for its spectacular icy rings made of ice and rock particles. Could float in water due to its low density!",
    uranus: "Uranus: A tilted blue-green ice giant with faint vertical rings. Its axis is tilted 98 degrees, making it roll like a ball!",
    neptune: "Neptune: The windiest planet with storms reaching up to 2,100 km/h. Has faint dark rings discovered in 1989.",
    // Add constellation entries
    orion: "Orion: The Hunter is one of the most recognizable constellations. Its distinctive belt is formed by three bright stars: Alnitak, Alnilam, and Mintaka.",
    bigdipper: "Big Dipper: Part of Ursa Major. Its seven bright stars form a distinctive ladle shape that has guided travelers for centuries.",
    littledipper: "Little Dipper: Or Ursa Minor, contains Polaris, the North Star, at the end of its handle. It has been crucial for navigation.",
    leo: "Leo: The Lion is a zodiac constellation. Its brightest star, Regulus, marks the heart of the lion in this majestic constellation.",
    cancer: "Cancer: The Crab is the faintest of the zodiac constellations. It contains the beautiful Beehive Cluster (M44).",
    taurus: "Taurus: The Bull features the bright star Aldebaran and the famous Pleiades star cluster, also known as the Seven Sisters.",
    virgo: "Virgo: The Maiden is the second largest constellation. Its brightest star, Spica, is actually a binary star system.",
    libra: "Libra: The Scales represents balance and justice. It was once considered part of Scorpius before becoming its own constellation."
  };

  const planetData = {
    sun: { temp: "5,778K", distance: "0 AU", speed: "0 km/h", gravity: "274 m/s²" },
    mercury: { temp: "427°C", distance: "0.39 AU", speed: "170,503 km/h", gravity: "3.7 m/s²" },
    venus: { temp: "462°C", distance: "0.72 AU", speed: "126,077 km/h", gravity: "8.87 m/s²" },
    earth: { temp: "15°C", distance: "1.0 AU", speed: "107,244 km/h", gravity: "9.81 m/s²" },
    moon: { temp: "-173°C", distance: "384,400 km", speed: "3,683 km/h", gravity: "1.62 m/s²" },
    mars: { temp: "-63°C", distance: "1.52 AU", speed: "86,677 km/h", gravity: "3.71 m/s²" },
    jupiter: { temp: "-108°C", distance: "5.20 AU", speed: "47,002 km/h", gravity: "24.79 m/s²" },
    saturn: { temp: "-139°C", distance: "9.58 AU", speed: "34,821 km/h", gravity: "10.44 m/s²" },
    uranus: { temp: "-197°C", distance: "19.22 AU", speed: "24,477 km/h", gravity: "8.69 m/s²" },
    neptune: { temp: "-201°C", distance: "30.05 AU", speed: "19,566 km/h", gravity: "11.15 m/s²" }
  };

  // Constellation data positioned in a circular formation around the solar system with upward tilt
  const constellations = {
    orion: {
      name: 'Orion',
      position: '0 8 -8',  // North position (12 o'clock)
      rotation: '-20 0 0',  // Tilted upward
      scale: '1.8 1.8 1.8',
      image: '/models/2D/orion.png',
      info: 'Orion the Hunter is one of the most recognizable constellations. Its distinctive belt is formed by three bright stars: Alnitak, Alnilam, and Mintaka.',
      color: '#ff6b35',
      animationDelay: '0s'
    },
    bigdipper: {
      name: 'Big Dipper',
      position: '6 7 -6',  // Northeast position (1:30)
      rotation: '-15 -45 0',  // Tilted upward and rotated
      scale: '1.6 1.6 1.6',
      image: '/models/2D/bigdipper.png',
      info: 'The Big Dipper is part of Ursa Major. Its seven bright stars form a distinctive ladle shape that has guided travelers for centuries.',
      color: '#4ecdc4',
      animationDelay: '0.5s'
    },
    littledipper: {
      name: 'Little Dipper',
      position: '8 6 0',  // East position (3 o'clock)
      rotation: '-15 -90 0',  // Tilted upward and facing inward
      scale: '1.5 1.5 1.5',
      image: '/models/2D/littledipper.png',
      info: 'The Little Dipper, or Ursa Minor, contains Polaris, the North Star, at the end of its handle. It has been crucial for navigation.',
      color: '#45b7d1',
      animationDelay: '1s'
    },
    leo: {
      name: 'Leo',
      position: '6 5 6',  // Southeast position (4:30)
      rotation: '-20 -135 0',  // Tilted upward and rotated
      scale: '1.6 1.6 1.6',
      image: '/models/2D/leo.png',
      info: 'Leo the Lion is a zodiac constellation. Its brightest star, Regulus, marks the heart of the lion in this majestic constellation.',
      color: '#f39c12',
      animationDelay: '1.5s'
    },
    cancer: {
      name: 'Cancer',
      position: '0 4 8',  // South position (6 o'clock)
      rotation: '-25 180 0',  // Tilted upward and facing north
      scale: '1.5 1.5 1.5',
      image: '/models/2D/cancer.png',
      info: 'Cancer the Crab is the faintest of the zodiac constellations. It contains the beautiful Beehive Cluster (M44).',
      color: '#e74c3c',
      animationDelay: '2s'
    },
    taurus: {
      name: 'Taurus',
      position: '-6 5 6',  // Southwest position (7:30)
      rotation: '-20 135 0',  // Tilted upward and rotated
      scale: '1.6 1.6 1.6',
      image: '/models/2D/taurus.png',
      info: 'Taurus the Bull features the bright star Aldebaran and the famous Pleiades star cluster, also known as the Seven Sisters.',
      color: '#8e44ad',
      animationDelay: '2.5s'
    },
    virgo: {
      name: 'Virgo',
      position: '-8 6 0',  // West position (9 o'clock)
      rotation: '-15 90 0',  // Tilted upward and facing inward
      scale: '1.6 1.6 1.6',
      image: '/models/2D/virgo.png',
      info: 'Virgo the Maiden is the second largest constellation. Its brightest star, Spica, is actually a binary star system.',
      color: '#27ae60',
      animationDelay: '3s'
    },
    libra: {
      name: 'Libra',
      position: '-6 7 -6',  // Northwest position (10:30)
      rotation: '-15 45 0',  // Tilted upward and rotated
      scale: '1.5 1.5 1.5',
      image: '/models/2D/libra.png',
      info: 'Libra the Scales represents balance and justice. It was once considered part of Scorpius before becoming its own constellation.',
      color: '#16a085',
      animationDelay: '3.5s'
    }
  };

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

      // Only register components if not already registered
      if (!AFRAME.components['planet-interaction']) {
        AFRAME.registerComponent('planet-interaction', {
          init: function () {
            const el = this.el;

            el.addEventListener('click', function (evt) {
              console.log('Planet clicked:', el.id);
              const text = planets[el.id];
              if (text) {
                showPlanetInfo(el.id, text);
                speak(text);
              }
            });

            // Removed hover animations for better performance
          }
        });
      }

      if (!AFRAME.components['constellation-interaction']) {
        AFRAME.registerComponent('constellation-interaction', {
          init: function () {
            const el = this.el;

            el.addEventListener('click', function (evt) {
              console.log('Constellation clicked:', el.id);
              const constellationKey = el.id.replace('Container', '');
              const constellation = constellations[constellationKey];
              const text = planets[constellationKey];
              
              if (constellation && text) {
                showPlanetInfo(constellationKey, text);
                speak(constellation.info);
              }
            });
          }
        });
      }

      if (!AFRAME.components['interaction-manager']) {
        AFRAME.registerComponent('interaction-manager', {
          init: function () {
            const sceneEl = this.el;
            const THREE = window.THREE;
            
            if (!THREE) {
              console.error('THREE.js not available');
              return;
            }

            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            const state = {
              active: null,
              lastX: 0,
              lastY: 0,
              startRot: { x: 0, y: 0, z: 0 },
              startScale: 1,
              currentScale: 1,
              isRotating: false,
              isZooming: false,
              initialTouchDistance: 0,
              minScale: 0.5,
              maxScale: 3.0,
              rotationSpeed: 0.5
            };

            const findClickableEl = (intersect) => {
              let obj = intersect.object;
              while (obj) {
                if (obj.el && obj.el.classList && obj.el.classList.contains('clickable')) return obj.el;
                obj = obj.parent;
              }
              return null;
            };

            const setup = () => {
              const canvas = sceneEl.canvas;
              if (!canvas || !sceneEl.camera) {
                setTimeout(setup, 100);
                return;
              }

              console.log('Setting up interaction manager');

              function getPointer(e) {
                return e.touches && e.touches.length ? e.touches[0] : e;
              }

              function computeMouse(ev) {
                const rect = canvas.getBoundingClientRect();
                mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
              }

              function pointerDown(e) {
                const p = getPointer(e);
                computeMouse(p);
                raycaster.setFromCamera(mouse, sceneEl.camera);
                const intersects = raycaster.intersectObjects(sceneEl.object3D.children, true);
                if (intersects.length === 0) return;

                const el = findClickableEl(intersects[0]);
                if (!el) return;

                state.active = el;
                state.lastX = p.clientX;
                state.lastY = p.clientY;

                const rot = el.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
                state.startRot = { x: rot.x || 0, y: rot.y || 0, z: rot.z || 0 };

                const scl = el.getAttribute('scale') || { x: 1, y: 1, z: 1 };
                state.startScale = scl.x || 1;
                state.currentScale = scl.x || 1;
                state.isRotating = true;

                if (e.touches && e.touches.length === 2) {
                  state.isZooming = true;
                  state.isRotating = false;
                  state.initialTouchDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                  );
                }
                e.preventDefault && e.preventDefault();
              }

              function pointerMove(e) {
                if (!state.active) return;
                e.preventDefault();
                const p = getPointer(e);

                if (e.touches && e.touches.length === 2 && state.isZooming) {
                  const currentDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                  );

                  const scaleFactor = currentDist / state.initialTouchDistance;
                  let newScale = state.startScale * scaleFactor;
                  newScale = Math.max(state.minScale, Math.min(state.maxScale, newScale));
                  state.currentScale = newScale;

                  state.active.setAttribute('scale', `${newScale} ${newScale} ${newScale}`);
                  return;
                }

                if (state.isRotating) {
                  const dx = (p.clientX - state.lastX) * state.rotationSpeed;
                  const dy = (p.clientY - state.lastY) * state.rotationSpeed;

                  const newRot = {
                    x: state.startRot.x - dy,
                    y: state.startRot.y + dx,
                    z: state.startRot.z
                  };

                  state.active.setAttribute('rotation', `${newRot.x} ${newRot.y} ${newRot.z}`);
                  state.lastX = p.clientX;
                  state.lastY = p.clientY;
                }
              }

              function pointerUp() {
                if (!state.active) return;
                state.isRotating = false;
                state.isZooming = false;
                state.active = null;
                state.initialTouchDistance = 0;
              }

              function wheel(e) {
                e.preventDefault();
                const target = state.active || document.getElementById('solarSystem');
                if (target) {
                  const scale = target.getAttribute('scale') || { x: 1 };
                  let newScale = scale.x || 1;

                  const zoomFactor = 0.05 * newScale;
                  newScale += e.deltaY < 0 ? zoomFactor : -zoomFactor;

                  newScale = Math.max(
                    target.id === 'solarSystem' ? 0.3 : state.minScale,
                    Math.min(target.id === 'solarSystem' ? 4.0 : state.maxScale, newScale)
                  );

                  target.setAttribute('scale', `${newScale} ${newScale} ${newScale}`);
                }
              }

              canvas.addEventListener('mousedown', pointerDown);
              canvas.addEventListener('touchstart', pointerDown, { passive: false });
              window.addEventListener('mousemove', pointerMove);
              window.addEventListener('touchmove', pointerMove, { passive: false });
              window.addEventListener('mouseup', pointerUp);
              window.addEventListener('touchend', pointerUp);
              canvas.addEventListener('wheel', wheel, { passive: false });
            };

            setup();
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

    const showPlanetInfo = (planetId, text) => {
      const parts = text.split(':');
      const name = parts[0] ? parts[0].trim() : planetId.charAt(0).toUpperCase() + planetId.slice(1);
      const info = parts[1] ? parts[1].trim() : text;

      const planetNameEl = document.getElementById('planetName');
      const planetInfoEl = document.getElementById('planetInfo');

      if (planetNameEl) planetNameEl.textContent = name;
      if (planetInfoEl) planetInfoEl.textContent = info;

      updateDataPanel(planetId);

      const soloInfoBox = document.getElementById('soloInfoBox');
      if (soloInfoBox) {
        soloInfoBox.style.display = 'block';
        soloInfoBox.style.opacity = '0';
        soloInfoBox.style.transform = 'translateX(-50%) translateY(50px)';

        setTimeout(() => {
          soloInfoBox.style.opacity = '1';
          soloInfoBox.style.transform = 'translateX(-50%) translateY(0)';
          soloInfoBox.style.transition = 'all 0.5s ease-out';
        }, 100);
      }
    };

    const updateDataPanel = (planetId) => {
      const data = planetData[planetId];
      if (data) {
        const tempValue = document.getElementById('tempValue');
        const distanceValue = document.getElementById('distanceValue');
        const speedValue = document.getElementById('speedValue');
        const gravityValue = document.getElementById('gravityValue');
        const dataPanel = document.getElementById('dataPanel');

        if (tempValue) tempValue.textContent = data.temp;
        if (distanceValue) distanceValue.textContent = data.distance;
        if (speedValue) speedValue.textContent = data.speed;
        if (gravityValue) gravityValue.textContent = data.gravity;
        if (dataPanel) dataPanel.style.display = 'block';
      }
    };

    loadScripts();

    // Handle browser back/forward button
    const handlePopState = () => {
      console.log('Browser back button detected - cleaning up AR session');
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

  // Enhanced AR session cleanup function
  const cleanupARSession = () => {
    console.log('Cleaning up AR session...');
    setIsARActive(false);
    
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
    
    console.log('AR session cleanup complete');
  };

  // Handle back button click with reload
  const handleBack = () => {
    console.log('Back button clicked - cleaning up and returning to home');
    cleanupARSession();
    
    // Use window.location for full reload to ensure complete cleanup
    window.location.href = '/';
  };

  // Generate constellation elements for the scene
  const generateConstellationElements = () => {
    return Object.entries(constellations).map(([key, constellation]) => {
      return `
        <a-entity 
          id="${key}Container" 
          position="${constellation.position}" 
          scale="${constellation.scale}" 
          rotation="${constellation.rotation}"
          class="constellation-group clickable"
          constellation-interaction
          animation__appear="property: scale; from: 0 0 0; to: ${constellation.scale}; dur: 1500; delay: ${constellation.animationDelay}; easing: easeOutElastic"
          animation__float="property: position; from: ${constellation.position}; to: ${constellation.position.split(' ').map((coord, i) => i === 1 ? (parseFloat(coord) + 0.2).toString() : coord).join(' ')}; dur: 4000; delay: ${constellation.animationDelay}; dir: alternate; loop: true; easing: easeInOutSine">
          
          <a-plane 
            src="${constellation.image}" 
            transparent="true" 
            width="3.0" 
            height="3.0"
            rotation="-90 0 0"
            class="clickable constellation-plane"
            material="transparent: true; alphaTest: 0.1; side: double; opacity: 1.0; emissive: ${constellation.color}; emissiveIntensity: 0.3"
            geometry="primitive: plane"
            animation__glow="property: material.opacity; from: 0.9; to: 1; dur: 2500; dir: alternate; loop: true; easing: easeInOutQuad"
            animation__emissive="property: material.emissiveIntensity; from: 0.3; to: 0.6; dur: 3000; dir: alternate; loop: true; easing: easeInOutSine">
          </a-plane>
          
          <a-text 
            value="${constellation.name}"
            position="0 -1.8 0.1"
            align="center"
            color="${constellation.color}"
            scale="0.8 0.8 0.8"
            material="emissive: ${constellation.color}; emissiveIntensity: 0.4"
            animation__textglow="property: material.color; from: ${constellation.color}; to: #ffffff; dur: 3000; dir: alternate; loop: true; easing: easeInOutSine"
            animation__textemissive="property: material.emissiveIntensity; from: 0.4; to: 0.8; dur: 2500; dir: alternate; loop: true; easing: easeInOutSine">
          </a-text>
          
          <a-sphere
            radius="0.12"
            color="${constellation.color}"
            position="0 0 0.1"
            class="constellation-marker"
            opacity="0.9"
            material="emissive: ${constellation.color}; emissiveIntensity: 0.5"
            animation__pulse="property: scale; from: 1 1 1; to: 1.4 1.4 1.4; dur: 2000; dir: alternate; loop: true; easing: easeInOutQuad"
            animation__colorshift="property: material.color; from: ${constellation.color}; to: #ffffff; dur: 2500; dir: alternate; loop: true; easing: easeInOutSine"
            animation__markeremissive="property: material.emissiveIntensity; from: 0.5; to: 1.0; dur: 2000; dir: alternate; loop: true; easing: easeInOutSine">
          </a-sphere>
          
          <!-- Enhanced twinkling stars around constellation -->
          ${Array.from({length: 5}, (_, i) => `
            <a-sphere
              radius="0.04"
              color="${constellation.color}"
              position="${(Math.random() - 0.5) * 4} ${(Math.random() - 0.5) * 4} ${0.2 + Math.random() * 0.5}"
              opacity="0.8"
              material="emissive: ${constellation.color}; emissiveIntensity: 0.6"
              animation__twinkle="property: material.opacity; from: 0.4; to: 1.0; dur: ${1200 + i * 200}; dir: alternate; loop: true; easing: easeInOutSine"
              animation__staremissive="property: material.emissiveIntensity; from: 0.6; to: 1.2; dur: ${1500 + i * 250}; dir: alternate; loop: true; easing: easeInOutSine">
            </a-sphere>
          `).join('')}
        </a-entity>
      `;
    }).join('');
  };

  // Create the A-Frame scene HTML string
  useEffect(() => {
    if (!scriptsLoaded || !sceneContainerRef.current) return;

    setIsARActive(true);

    const sceneHTML = `
      <a-scene 
        embedded 
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono; trackingMethod: best; sourceWidth: 1280; sourceHeight: 960; displayWidth: 1280; displayHeight: 960;"
        vr-mode-ui="enabled: false"
        loading-screen="enabled: false"
        renderer="antialias: true; colorManagement: true; physicallyCorrectLights: true; precision: mediump;"
        shadow="type: pcfsoft"
        interaction-manager>
        
        <a-entity light="type: ambient; color: #ffffff; intensity: 1.2"></a-entity>
        <a-entity light="type: directional; color: #ffffff; intensity: 1.0" position="0 5 5"></a-entity>
        <a-entity light="type: directional; color: #4facfe; intensity: 0.8" position="0 8 0"></a-entity>
        <a-entity light="type: point; color: #ffffff; intensity: 1.5" position="0 6 0"></a-entity>

        <a-assets>
          <audio id="space-ambient" src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiE0fPTgjMGHm7A7+OZURE="></audio>
          <!-- Constellation images -->
          ${Object.entries(constellations).map(([key, constellation], index) => `
            <img id="constellation-${key}" src="${constellation.image}" crossorigin="anonymous" />
          `).join('')}
        </a-assets>

        <a-marker preset="hiro">
          <a-entity id="solarSystem" position="0 0 0" scale="1.5 1.5 1.5" rotation="0 0 0">
            
            <!-- Sun -->
            <a-entity id="sunContainer" position="0 0.2 0">
              <a-sphere 
                id="sun" 
                class="clickable"
                radius="0.8"
                segments-width="64"
                segments-height="64"
                material="src: url(texture/sun.jpg); roughness: 0.7; metalness: 0.1"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 25000"
                planet-interaction
                data-base-scale="1 1 1">
              </a-sphere>
            </a-entity>

            <!-- Mercury Orbit -->
            <a-ring radius-inner="0.99" radius-outer="1.01" position="0 0.01 0" rotation="-90 0 0" color="#8888aa" opacity="0.35" material="side: double; transparent: true"></a-ring>
            <a-entity id="mercuryOrbit" animation="property: rotation; to: 0 360 0; loop: true; dur: 6000; easing: linear">
              <a-sphere 
                id="mercury" 
                class="clickable"
                position="1 0.2 0" 
                radius="0.15"
                segments-width="32"
                segments-height="32"
                material="src: url(texture/mercury.jpg); roughness: 0.8; metalness: 0.2"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 58000"
                planet-interaction
                data-base-scale="1 1 1">
              </a-sphere>
            </a-entity>

            <!-- Venus Orbit -->
            <a-ring radius-inner="1.49" radius-outer="1.51" position="0 0.01 0" rotation="-90 0 0" color="#8888aa" opacity="0.35" material="side: double; transparent: true"></a-ring>
            <a-entity id="venusOrbit" animation="property: rotation; to: 0 360 0; loop: true; dur: 14800; easing: linear">
              <a-sphere 
                id="venus" 
                class="clickable"
                position="1.5 0.2 0" 
                radius="0.18"
                segments-width="32"
                segments-height="32"
                material="src: url(texture/venus.jpg); roughness: 0.7; metalness: 0.1"
                animation="property: rotation; to: 0 -360 0; loop: true; dur: 243000"
                planet-interaction
                data-base-scale="1 1 1">
              </a-sphere>
            </a-entity>

            <!-- Earth Orbit -->
            <a-ring radius-inner="1.99" radius-outer="2.01" position="0 0.01 0" rotation="-90 0 0" color="#8888aa" opacity="0.35" material="side: double; transparent: true"></a-ring>
            <a-entity id="earthOrbit" animation="property: rotation; to: 0 360 0; loop: true; dur: 24000; easing: linear">
              <a-sphere 
                id="earth" 
                class="clickable"
                position="2 0.2 0" 
                radius="0.2"
                segments-width="32"
                segments-height="32"
                material="src: url(texture/earth.jpg); roughness: 0.5; metalness: 0.1"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 24000"
                planet-interaction
                data-base-scale="1 1 1">
              </a-sphere>
              <!-- Moon Orbit -->
              <a-ring radius-inner="0.39" radius-outer="0.41" position="2 0.05 0" rotation="-90 0 0" color="#ccccff" opacity="0.25" material="side: double; transparent: true"></a-ring>
              <a-entity id="moonOrbit" animation="property: rotation; to: 0 360 0; loop: true; dur: 5000; easing: linear">
                <a-sphere 
                  id="moon" 
                  class="clickable"
                  position="0.4 0 0" 
                  radius="0.06"
                  segments-width="32" 
                  segments-height="32"
                  material="src: url(texture/moon.jpg); roughness: 0.9"
                  planet-interaction
                  data-base-scale="1 1 1">
                </a-sphere>
              </a-entity>
            </a-entity>

            <!-- Mars Orbit -->
            <a-ring radius-inner="2.49" radius-outer="2.51" position="0 0.01 0" rotation="-90 0 0" color="#8888aa" opacity="0.35" material="side: double; transparent: true"></a-ring>
            <a-entity id="marsOrbit" animation="property: rotation; to: 0 360 0; loop: true; dur: 45200; easing: linear">
              <a-sphere 
                id="mars" 
                class="clickable"
                position="2.5 0.2 0" 
                radius="0.15"
                segments-width="32"
                segments-height="32"
                material="src: url(texture/mars.jpg); roughness: 0.8; metalness: 0.1"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 24500"
                planet-interaction
                data-base-scale="1 1 1">
              </a-sphere>
            </a-entity>

            <!-- Jupiter Orbit -->
            <a-ring radius-inner="3.49" radius-outer="3.51" position="0 0.01 0" rotation="-90 0 0" color="#8888aa" opacity="0.35" material="side: double; transparent: true"></a-ring>
            <a-entity id="jupiterOrbit" animation="property: rotation; to: 0 360 0; loop: true; dur: 28500; easing: linear">
              <a-sphere 
                id="jupiter" 
                class="clickable"
                position="3.5 0.3 0" 
                radius="0.45"
                segments-width="64"
                segments-height="64"
                material="src: url(texture/jupiter.jpg); roughness: 0.6; metalness: 0.05"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 10000"
                planet-interaction
                data-base-scale="1 1 1">
              </a-sphere>
            </a-entity>

            <!-- Saturn Orbit -->
            <a-ring radius-inner="4.49" radius-outer="4.51" position="0 0.01 0" rotation="-90 0 0" color="#8888aa" opacity="0.35" material="side: double; transparent: true"></a-ring>
            <a-entity id="saturnOrbit" animation="property: rotation; to: 0 360 0; loop: true; dur: 70700; easing: linear">
              <a-sphere 
                id="saturn" 
                class="clickable"
                position="4.5 0.32 0" 
                radius="0.4"
                segments-width="64"
                segments-height="64"
                material="src: url(texture/saturn_map.jpg); roughness: 0.6; metalness: 0.05"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 10500"
                planet-interaction
                data-base-scale="1 1 1">
              </a-sphere>
              <!-- Saturn Rings -->
              <a-ring 
                radius-inner="0.6" 
                radius-outer="1.0" 
                position="4.5 0.32 0" 
                rotation="-90 0 0" 
                material="color: #D4AF37; transparent: true; opacity: 0.4; side: double"
                segments-theta="64">
              </a-ring>
              <a-ring 
                radius-inner="0.65" 
                radius-outer="0.95" 
                position="4.5 0.32 0" 
                rotation="-90 0 0" 
                material="color: #F5DEB3; transparent: true; opacity: 0.3; side: double"
                segments-theta="64">
              </a-ring>
            </a-entity>

            <!-- Uranus Orbit -->
            <a-ring radius-inner="5.49" radius-outer="5.51" position="0 0.01 0" rotation="-90 0 0" color="#8888aa" opacity="0.35" material="side: double; transparent: true"></a-ring>
            <a-entity id="uranusOrbit" animation="property: rotation; to: 0 360 0; loop: true; dur: 201600; easing: linear">
              <a-sphere 
                id="uranus" 
                class="clickable"
                position="5.5 0.3 0" 
                radius="0.25"
                segments-width="32"
                segments-height="32"
                material="src: url(texture/uranus.jpg); roughness: 0.7; metalness: 0.1"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 17000"
                planet-interaction
                data-base-scale="1 1 1">
              </a-sphere>
              <!-- Uranus Rings (vertical due to tilted axis) -->
              <a-ring 
                radius-inner="0.35" 
                radius-outer="0.55" 
                position="5.5 0.3 0" 
                rotation="0 0 90" 
                material="color: #4FD0E7; transparent: true; opacity: 0.3; side: double"
                segments-theta="32">
              </a-ring>
              <a-ring 
                radius-inner="0.38" 
                radius-outer="0.52" 
                position="5.5 0.3 0" 
                rotation="0 0 90" 
                material="color: #87CEEB; transparent: true; opacity: 0.2; side: double"
                segments-theta="32">
              </a-ring>
            </a-entity>

            <!-- Neptune Orbit -->
            <a-ring radius-inner="6.49" radius-outer="6.51" position="0 0.01 0" rotation="-90 0 0" color="#8888aa" opacity="0.35" material="side: double; transparent: true"></a-ring>
            <a-entity id="neptuneOrbit" animation="property: rotation; to: 0 360 0; loop: true; dur: 395500; easing: linear">
              <a-sphere 
                id="neptune" 
                class="clickable"
                position="6.5 0.3 0" 
                radius="0.24"
                segments-width="32"
                segments-height="32"
                material="src: url(texture/neptune.jpg); roughness: 0.7; metalness: 0.1"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 16000"
                planet-interaction
                data-base-scale="1 1 1">
              </a-sphere>
            </a-entity>

            <!-- Constellations positioned above the solar system -->
            <a-entity id="constellationField" position="0 0 0" rotation="0 0 0">
              ${generateConstellationElements()}
              
              <!-- Enhanced starfield background for constellations -->
              ${Array.from({length: 30}, (_, i) => {
                const x = (Math.random() - 0.5) * 15;
                const y = 1 + Math.random() * 10;
                const z = -8 - Math.random() * 6;
                const radius = 0.02 + Math.random() * 0.04;
                const opacity = 0.6 + Math.random() * 0.4;
                const colors = ['#ffffff', '#4facfe', '#00f2fe', '#ffd54f', '#ff6b35'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                return `
                  <a-sphere
                    radius="${radius}"
                    color="${color}"
                    position="${x} ${y} ${z}"
                    opacity="${opacity}"
                    material="emissive: ${color}; emissiveIntensity: 0.4"
                    animation__twinkle="property: material.opacity; from: ${opacity * 0.4}; to: ${opacity}; dur: ${1500 + Math.random() * 2500}; dir: alternate; loop: true; easing: easeInOutSine"
                    animation__emissivetwinkle="property: material.emissiveIntensity; from: 0.4; to: 0.8; dur: ${2000 + Math.random() * 2000}; dir: alternate; loop: true; easing: easeInOutSine">
                  </a-sphere>
                `;
              }).join('')}
              
              <!-- Constellation area lighting -->
              <a-entity light="type: point; color: #4facfe; intensity: 0.8" position="0 5 -2" animation="property: position; from: 0 5 -2; to: 0 7 -2; dur: 4000; dir: alternate; loop: true; easing: easeInOutSine"></a-entity>
              <a-entity light="type: point; color: #ff6b35; intensity: 0.6" position="-3 4 -1" animation="property: position; from: -3 4 -1; to: -3 6 -1; dur: 5000; dir: alternate; loop: true; easing: easeInOutSine"></a-entity>
              <a-entity light="type: point; color: #27ae60; intensity: 0.6" position="3 4 -1" animation="property: position; from: 3 4 -1; to: 3 6 -1; dur: 4500; dir: alternate; loop: true; easing: easeInOutSine"></a-entity>
            </a-entity>

          </a-entity>
        </a-marker>

        <a-entity camera="fov: 80; aspect: 1.33; near: 0.1; far: 1000" look-controls="enabled: true" wasd-controls="enabled: false">
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

    // Insert the scene HTML directly - this is the key to making A-Frame work with React
    sceneContainerRef.current.innerHTML = sceneHTML;

    console.log('A-Frame scene injected');
  }, [scriptsLoaded]);

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1140, #3a1f85)',
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
        .cosmic-panel { background: linear-gradient(135deg, rgba(26, 17, 64, 0.92), rgba(58, 31, 133, 0.92)); border: 1px solid rgba(255, 213, 79, 0.35); border-radius: 15px; color: #f7f3ff; box-shadow: 0 8px 32px rgba(0,0,0,0.35); backdrop-filter: blur(10px); }
        
        /* Back Button Styles */
        .back-button { position: absolute; top: 20px; left: 20px; z-index: 1000; display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: rgba(255, 213, 79, 0.2); border: 2px solid #ffd54f; border-radius: 12px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px); }
        .back-button:hover { background: rgba(255, 213, 79, 0.4); transform: translateX(-5px); box-shadow: 0 4px 15px rgba(255, 213, 79, 0.3); }
        .back-button:active { transform: translateX(-3px) scale(0.98); }
        .back-icon { font-size: 20px; }
        
        /* Title Styles */
        .ar-title { position: absolute; top: 20px; right: 20px; z-index: 1000; font-size: 20px; font-weight: 700; color: #ffd54f; text-shadow: 0 0 20px rgba(255, 213, 79, 0.5); }
        
        /* Controls Panel - Responsive */
        #controls { position: absolute; top: 80px; right: 20px; padding: 15px; width: 280px; z-index: 1000; max-height: calc(100vh - 100px); overflow-y: auto; }
        #controls h3 { font-size: 16px; text-align: center; margin-bottom: 12px; color: #ffd54f; }
        .control-item { display: flex; align-items: center; gap: 10px; margin: 8px 0; padding: 8px; background: rgba(255,255,255,0.06); border-radius: 10px; }
        .control-icon { background: linear-gradient(135deg, #5b2bbd, #7a3fe0); color: #fff; padding: 4px 8px; border-radius: 6px; font-weight: 600; min-width: 50px; text-align: center; font-size: 12px; }
        .control-text { font-size: 13px; color: #f7f3ff; }
        
        /* Info Boxes - Responsive */
        #infoBox, #soloInfoBox { position: absolute; left: 50%; transform: translateX(-50%); padding: 20px; bottom: 20px; display: none; max-width: 90%; width: 600px; z-index: 1000; background: rgba(255, 255, 255, 0.95); border: 2px solid #ffd54f; }
        #soloInfoBox h2 { margin: 0 0 10px; font-size: 22px; color: #2c3e50; font-weight: bold; }
        #soloInfoBox p { margin: 0; font-size: 14px; color: #34495e; line-height: 1.6; }
        
        /* Data Panel - Responsive */
        .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .stat-row:last-child { border-bottom: none; }
        .stat-label { color: #b9aed7; font-size: 12px; text-transform: uppercase; }
        .stat-value { color: #ffd54f; font-size: 14px; font-weight: bold; }
        #dataPanel { position: absolute; top: 20px; left: 20px; width: 280px; display: none; z-index: 1000; max-height: calc(100vh - 40px); overflow-y: auto; }
        
        /* WebGL Fallback */
        #webglFallback { display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); color: white; padding: 30px; border-radius: 20px; text-align: center; z-index: 10000; max-width: 90%; }
        
        /* Loading Screen */
        .loading-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #1a1140, #3a1f85); display: flex; justify-content: center; align-items: center; z-index: 9999; color: white; font-family: 'Segoe UI', sans-serif; }
        .loading-spinner { border: 4px solid rgba(255, 255, 255, 0.3); border-top: 4px solid #ffd54f; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        /* AR Status Indicator */
        .ar-status { position: absolute; bottom: 20px; left: 20px; z-index: 1000; padding: 10px 15px; background: rgba(76, 175, 80, 0.2); border: 2px solid #4caf50; border-radius: 10px; color: #4caf50; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; backdrop-filter: blur(10px); }
        .ar-status-dot { width: 10px; height: 10px; background: #4caf50; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .back-button { padding: 10px 15px; font-size: 14px; top: 10px; left: 10px; }
          .back-button span { display: none; }
          .back-icon { font-size: 18px; }
          .ar-title { font-size: 16px; top: 10px; right: 10px; max-width: 150px; }
          #controls { top: 60px; right: 10px; width: 240px; padding: 12px; font-size: 12px; }
          #controls h3 { font-size: 14px; }
          .control-text { font-size: 11px; }
          .control-icon { font-size: 10px; min-width: 40px; }
          #dataPanel { top: 10px; left: 10px; width: 240px; font-size: 12px; }
          #soloInfoBox { padding: 15px; bottom: 10px; }
          #soloInfoBox h2 { font-size: 18px; }
          #soloInfoBox p { font-size: 12px; }
          .ar-status { bottom: 10px; left: 10px; font-size: 12px; padding: 8px 12px; }
        }
        
        /* Tablet Responsive Styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          #controls { width: 260px; }
          #dataPanel { width: 260px; }
          .ar-title { font-size: 18px; }
        }
        
        /* Large Screen Optimizations */
        @media (min-width: 1920px) {
          #controls { width: 320px; padding: 25px; }
          #dataPanel { width: 320px; }
          .control-text { font-size: 15px; }
          #soloInfoBox { max-width: 700px; }
        }
      `}</style>

      {!scriptsLoaded && (
        <div className="loading-screen">
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <h2>Loading AR Solar System...</h2>
            <p>Initializing A-Frame and AR.js</p>
            <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>Please allow camera access when prompted</p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button className="back-button" onClick={handleBack} aria-label="Go back to main menu">
        <span className="back-icon">←</span>
        <span>Back to Menu</span>
      </button>

      {/* Title */}
      <h1 className="ar-title">🌌 Solar System & Constellations</h1>

      {/* AR Status Indicator */}
      {isARActive && (
        <div className="ar-status">
          <div className="ar-status-dot"></div>
          <span>AR Session Active</span>
        </div>
      )}

      {/* Mission Control Panel */}
      <div id="controls" className="cosmic-panel">
        <h3>🚀 Mission Control</h3>
        <div className="control-item">
          <span className="control-icon">📱</span>
          <span className="control-text">Point at Hiro Marker</span>
        </div>
        <div className="control-item">
          <span className="control-icon">🖱️</span>
          <span className="control-text">Drag to Rotate</span>
        </div>
        <div className="control-item">
          <span className="control-icon">🔍</span>
          <span className="control-text">Scroll/Pinch to Zoom</span>
        </div>
        <div className="control-item">
          <span className="control-icon">👆</span>
          <span className="control-text">Click Planets & Constellations</span>
        </div>
        <div className="control-item">
          <span className="control-icon">🎯</span>
          <span className="control-text">Hover to Highlight</span>
        </div>
        <div className="control-item">
          <span className="control-icon">🔊</span>
          <span className="control-text">Audio Narration</span>
        </div>
      </div>

      {/* Data Visualization Panel */}
      <div id="dataPanel" className="cosmic-panel">
        <h3>📊 Planetary Data</h3>
        <div id="planetStats">
          <div className="stat-row">
            <span className="stat-label">Temperature:</span>
            <span className="stat-value" id="tempValue">--</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Distance:</span>
            <span className="stat-value" id="distanceValue">--</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Orbital Speed:</span>
            <span className="stat-value" id="speedValue">--</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Gravity:</span>
            <span className="stat-value" id="gravityValue">--</span>
          </div>
        </div>
      </div>

      <div id="infoBox" className="cosmic-panel"></div>
      <div id="soloInfoBox" className="cosmic-panel">
        <h2 id="planetName"></h2>
        <p id="planetInfo"></p>
      </div>

      {/* WebGL Fallback */}
      <div id="webglFallback">
        <h2>⚠️ WebGL Not Supported</h2>
        <p>Your browser doesn't support WebGL, which is required for this AR experience.</p>
        <p>Please try using a modern browser like Chrome, Firefox, or Safari.</p>
      </div>

      {/* A-Frame Scene Container */}
      <div ref={sceneContainerRef} style={{ 
        width: '100%', 
        height: '100vh',
        paddingTop: '70px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}></div>
    </>
  );
};

export default ARScene;