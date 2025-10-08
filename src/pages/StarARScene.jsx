import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/ar-scene.css";
import { FaInfoCircle, FaTimes, FaChild, FaBook, FaSpaceShuttle, FaStar } from "react-icons/fa";

// Constellation descriptions for both scientific and kid-friendly views
const constellationDescriptions = {
  'big-dipper': {
    scientific: "The Big Dipper, also known as Ursa Major (Great Bear), is one of the most recognizable asterisms in the northern sky. It consists of seven bright stars that form the shape of a ladle or dipper. The Big Dipper is not technically a constellation but a part of the larger Ursa Major constellation. Two stars in the bowl of the Big Dipper (Dubhe and Merak) are known as 'The Pointers' because they point toward Polaris, the North Star, making it an important navigational tool throughout human history.",
    kidFriendly: "The Big Dipper looks like a big spoon or ladle in the sky! It has seven bright stars that make it easy to find. People have used the Big Dipper for thousands of years to find their way at night. If you follow the two stars at the edge of the 'bowl' part, they point to the North Star, which helps travelers know which direction is north. The Big Dipper is actually part of a bigger constellation called Ursa Major, which means 'Great Bear'!"
  },
  'small-dipper': {
    scientific: "The Small Dipper, formally known as Ursa Minor or Little Bear, is a constellation in the northern sky. Its brightest star, Polaris (the North Star), is located at the end of the handle. Unlike its larger counterpart, Ursa Minor consists of seven main stars forming a smaller ladle shape. Polaris remains nearly stationary in the night sky due to its position close to the north celestial pole, making it crucial for celestial navigation throughout human history. The constellation was first cataloged by the Greek astronomer Ptolemy in the 2nd century.",
    kidFriendly: "The Small Dipper looks like a little spoon in the sky! It has the super important North Star (Polaris) at the end of its handle. The North Star is special because it barely moves in the sky, so sailors and explorers have used it for thousands of years to find their way! While other stars seem to move around the sky as the Earth spins, the North Star stays almost in the same spot all night long. The Small Dipper is also called Ursa Minor, which means 'Little Bear'!"
  },
  'orion': {
    scientific: "Orion is one of the most prominent and recognizable constellations in the night sky, visible throughout the world. Named after a hunter in Greek mythology, it contains bright stars including Betelgeuse (a red supergiant) and Rigel (a blue supergiant). The distinctive pattern includes Orion's Belt, three aligned stars that form the belt of the hunter. Orion also contains the Orion Nebula (M42), one of the brightest nebulae visible to the naked eye and an active region of star formation located approximately 1,344 light-years from Earth.",
    kidFriendly: "Orion looks like a giant hunter in the sky! You can easily spot it by finding the three stars in a row that make up Orion's Belt. Above the belt, you can see bright stars that form his shoulders, and one of them (called Betelgeuse) glows with a reddish color! Below the belt are stars forming his legs. Hanging from Orion's Belt is his sword, which contains a fuzzy-looking spot - that's actually a cloud where new stars are being born! Orion is one of the easiest constellations to find in winter skies."
  },
  'cancer': {
    scientific: "Cancer (the Crab) is one of the twelve constellations of the zodiac. Located between Gemini to the west and Leo to the east, Cancer is a faint constellation with no first magnitude stars, making it difficult to observe in urban areas. Its brightest star, Al Tarf (Beta Cancri), is only of magnitude 3.5. Cancer is home to the notable deep-sky object Messier 44, also known as the Beehive Cluster or Praesepe, an open cluster approximately 577 light-years from Earth that contains about 1,000 stars and is visible to the naked eye.",
    kidFriendly: "Cancer the Crab is a constellation that looks like a crab in the sky! It's a bit hard to see because its stars aren't very bright. The coolest thing about Cancer is that it has a special star cluster called the Beehive Cluster that looks like a fuzzy patch in the sky. If you look at it with binoculars, you'll see it's actually made up of lots of stars clustered together! Ancient people thought Cancer looked like a crab from the story of Hercules, where a crab tried to pinch Hercules' toes during one of his battles!"
  },
  'leo': {
    scientific: "Leo is one of the oldest recognized constellations in the night sky and one of the twelve zodiac constellations. Representing a lion, its main asterism resembles a crouching lion. Regulus (Alpha Leonis), the brightest star in Leo, is a multiple star system located about 79 light-years from Earth. Leo contains many bright galaxies, including the Leo Triplet, which consists of three interacting spiral galaxies (M65, M66, and NGC 3628) visible through amateur telescopes. The annual Leonid meteor shower occurs when Earth passes through the debris left by the comet Tempel-Tuttle.",
    kidFriendly: "Leo looks like a lion in the sky! It has stars that make up the lion's mane and body. The brightest star in Leo is called Regulus, which means 'little king' - perfect for the king of the jungle! Leo is easy to find because it has a pattern of stars that looks like a backward question mark (called the Sickle) which makes up the lion's head and mane. Every November, we can see shooting stars called the Leonid meteor shower that seem to come from the direction of Leo. Ancient Egyptians thought Leo was very special because the Sun was in Leo during the flooding of the Nile River."
  },
  'taurus': {
    scientific: "Taurus (the Bull) is a prominent constellation in the northern hemisphere's winter sky and one of the zodiac constellations. It contains two of the nearest open star clusters to Earth: the Pleiades (M45) and the Hyades. Aldebaran, the brightest star in Taurus, is an orange giant star that appears to be part of the Hyades but is actually much closer to Earth. Taurus also contains the supernova remnant Messier 1 (the Crab Nebula), which resulted from a stellar explosion recorded by Chinese astronomers in 1054 CE. The V-shaped pattern of the Hyades cluster forms the face of the bull in the constellation's depiction.",
    kidFriendly: "Taurus the Bull is a constellation that looks like a bull's face and horns in the sky! It has a super bright orange-colored star called Aldebaran that makes the bull's angry red eye. Taurus also has two amazing star clusters: the Pleiades (also called the Seven Sisters) which looks like a tiny dipper of stars, and the Hyades which makes a V-shape for the bull's face. If you look at the Pleiades with binoculars, you'll see even more stars than you can with just your eyes! People have been telling stories about Taurus for over 5,000 years!"
  },
  'libra': {
    scientific: "Libra (the Scales) is one of the twelve zodiac constellations, located between Virgo to the west and Scorpius to the east. It is the only zodiac constellation representing an inanimate object rather than an animal or mythological character. Libra's brightest stars are Zubeneschamali (Beta Librae) and Zubenelgenubi (Alpha Librae), whose names derive from Arabic meaning 'northern claw' and 'southern claw,' referring to when these stars were considered part of Scorpius. Historically, Libra represents the scales of justice held by Astraea, the goddess of justice associated with the neighboring Virgo constellation.",
    kidFriendly: "Libra looks like a set of balancing scales in the sky! It's the only constellation in the zodiac that isn't an animal or person. Libra has two bright stars with really cool names: Zubeneschamali and Zubenelgenubi (try saying those three times fast!). Long ago, these stars were actually thought to be part of the nearby Scorpius constellation and were called 'the claws' of the scorpion. Later, they became the scales of justice, which is why the symbol for fairness and balance is often scales. When you see Libra in the sky, think about balance and fairness!"
  },
  'virgo': {
    scientific: "Virgo is the second-largest constellation in the sky and the largest of the zodiac constellations. Its brightest star, Spica (Alpha Virginis), is a binary star system approximately 250 light-years from Earth. Virgo is notable for containing the Virgo Cluster, a massive collection of about 1,500 galaxies located about 54 million light-years away, which forms the heart of the larger Virgo Supercluster that includes our own Milky Way galaxy. The constellation also contains the 'Sombrero Galaxy' (M104), a spiral galaxy with a bright nucleus and a distinctive dust lane visible through amateur telescopes.",
    kidFriendly: "Virgo is one of the biggest constellations in the sky! It looks like a lady holding a stalk of wheat, represented by its brightest star called Spica. Virgo is home to something amazing - a huge group of galaxies called the Virgo Cluster, which has about 1,500 galaxies all grouped together! Our own Milky Way galaxy is part of an even bigger neighborhood that includes this cluster. Virgo is best seen in spring evenings. In ancient stories, Virgo represented goddesses like Persephone from Greek myths or the goddess of justice holding the scales (which is the nearby Libra constellation)!"
  }
};

// Constellation-specific guide star overlays for aesthetic enhancement
const constellationGuideOverlays = {
  'big-dipper': '/assets/guides/big-dipper-guide.png',
  'small-dipper': '/assets/guides/small-dipper-guide.png',
  'orion': '/assets/guides/orion-guide.png',
  'cancer': '/assets/guides/cancer-guide.png',
  'leo': '/assets/guides/leo-guide.png',
  'taurus': '/assets/guides/taurus-guide.png',
  'libra': '/assets/guides/libra-guide.png',
  'virgo': '/assets/guides/virgo-guide.png',
  'default': '/assets/guides/stars-background.png'
};

const StarARScene = () => {
  const modelViewerRef = useRef(null);
  const videoRef = useRef(null);
  const { starId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [star, setStar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isARSupported, setIsARSupported] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef(null);
  
  // Add description state
  const [showDescription, setShowDescription] = useState(false);
  const [descriptionTab, setDescriptionTab] = useState('scientific');
  
  // New state for interaction controls
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouchPosition, setLastTouchPosition] = useState({ x: 0, y: 0 });
  const [interactionMode, setInteractionMode] = useState('rotate'); // 'rotate', 'scale', 'position'

  // UI element refs
  const closeBtnRef = useRef(null);
  const labelRef = useRef(null);
  const helperTextRef = useRef(null);
  const controlsRef = useRef(null);
  const descriptionBtnRef = useRef(null);
  const descriptionBoxRef = useRef(null);

  // Add state for space background
  const [showSpaceBackground, setShowSpaceBackground] = useState(false);
  
  // Toggle space background
  const toggleSpaceBackground = () => {
    setShowSpaceBackground(prev => !prev);
  };

  // Toggle description visibility
  const toggleDescription = () => {
    setShowDescription(prev => !prev);
  };

  // Setup camera stream for non-AR mode
  useEffect(() => {
    const setupCamera = async () => {
      try {
        // Only request camera if we don't already have a stream
        if (!streamRef.current) {
          streamRef.current = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: "environment",
              width: { ideal: window.innerWidth },
              height: { ideal: window.innerHeight }
            }
          });
        }

        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(() => {
              setCameraActive(true);
              console.log("Camera activated successfully for fallback mode");
            }).catch(err => {
              console.error("Error playing video:", err);
            });
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access failed. Please check permissions.");
      }
    };

    setupCamera();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Check AR support
  useEffect(() => {
    // Check if AR is supported
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
          setIsARSupported(isSupported);
          console.log("AR supported:", isSupported);
        } catch (err) {
          console.error("Error checking AR support:", err);
          setIsARSupported(false);
        }
      } else {
        setIsARSupported(false);
        console.log("WebXR not available in this browser");
      }
    };

    checkARSupport();
  }, []);

  // Initialize star data
  useEffect(() => {
    // Try to get star data from location state first
    if (location.state && location.state.star) {
      setStar(location.state.star);
      setLoading(false);
    } else {
      // If not available in location state, fetch it based on ID
      // Fetch from API or use a static mapping
      const constellationMap = {
        'big-dipper': { 
          name: 'Big Dipper', 
          type: 'Asterism', 
          color: '#FFD700',
          model: '/models/stars/big-dipper.glb'
        },
        'small-dipper': { 
          name: 'Small Dipper', 
          type: 'Asterism', 
          color: '#FFD700',
          model: '/models/stars/small-dipper.glb'
        },
        'orion': { 
          name: 'Orion', 
          type: 'Constellation', 
          color: '#FFD700',
          model: '/models/stars/orion/scene.glb'
        },
        'cancer': { 
          name: 'Cancer', 
          type: 'Constellation', 
          color: '#FFD700',
          model: '/models/stars/cancer.glb'
        },
        'leo': { 
          name: 'Leo', 
          type: 'Constellation', 
          color: '#FFD700',
          model: '/models/stars/leo.glb'
        },
        'taurus': { 
          name: 'Taurus', 
          type: 'Constellation', 
          color: '#FFD700',
          model: '/models/stars/taurus.glb'
        },
        'libra': { 
          name: 'Libra', 
          type: 'Constellation', 
          color: '#FFD700',
          model: '/models/stars/libra.glb'
        },
        'virgo': { 
          name: 'Virgo', 
          type: 'Constellation', 
          color: '#FFD700',
          model: '/models/stars/virgo.glb'
        }
      };
      
      if (constellationMap[starId]) {
        setStar(constellationMap[starId]);
        setLoading(false);
      } else {
        // Try fetching from API as fallback
        fetch(`/api/stars/${starId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Star data not found');
            }
            return response.json();
          })
          .then(data => {
            setStar(data);
            setLoading(false);
          })
          .catch(err => {
            console.error('Error fetching star data:', err);
            setError('Could not load star data. Please try again.');
            setLoading(false);
          });
      }
    }
  }, [starId, location]);

  // Handle model interaction gestures
  useEffect(() => {
    if (!modelViewerRef.current || loading || !star) return;

    const modelViewer = modelViewerRef.current;
    
    // Apply current transformation
    const applyTransformation = () => {
      if (modelViewer && modelViewer.model) {
        // Update scale, rotation and position based on state
        modelViewer.scale = `${scale} ${scale} ${scale}`;
        modelViewer.orientation = `${rotation.x}deg ${rotation.y}deg ${rotation.z}deg`;
        
        // Only set position if in AR mode to avoid issues in preview mode
        if (modelViewer.isPresenting) {
          // Update position through the AR system
          modelViewer.updateHotspot({
            name: 'model-root',
            position: `${position.x}m ${position.y}m ${position.z}m`
          });
        }
      }
    };

    // Register gesture handlers for custom interactions
    const handleTouchStart = (event) => {
      if (event.touches.length === 1) {
        setIsDragging(true);
        setLastTouchPosition({
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        });
      }
    };

    const handleTouchMove = (event) => {
      if (!isDragging || !event.touches.length) return;
      
      const touch = event.touches[0];
      const deltaX = touch.clientX - lastTouchPosition.x;
      const deltaY = touch.clientY - lastTouchPosition.y;
      
      // Update based on interaction mode
      if (interactionMode === 'rotate') {
        setRotation(prev => ({
          ...prev,
          y: (prev.y + deltaX * 0.5) % 360,
          x: Math.max(-90, Math.min(90, prev.x + deltaY * 0.5))
        }));
      } else if (interactionMode === 'scale') {
        // Scale with vertical movement
        const scaleFactor = 1 + deltaY * 0.01;
        setScale(prev => Math.max(0.1, Math.min(3, prev * scaleFactor)));
      } else if (interactionMode === 'position') {
        // Position in AR mode
        setPosition(prev => ({
          x: prev.x + deltaX * 0.01,
          y: prev.y - deltaY * 0.01, // Invert Y for natural movement
          z: prev.z
        }));
      }
      
      setLastTouchPosition({
        x: touch.clientX,
        y: touch.clientY
      });
      
      // Apply the transformation
      applyTransformation();
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    // Handle zoom with pinch gesture
    const handleWheel = (event) => {
      event.preventDefault();
      const scaleFactor = 1 - (event.deltaY * 0.001);
      setScale(prev => Math.max(0.1, Math.min(3, prev * scaleFactor)));
      applyTransformation();
    };

    // Add event listeners to model-viewer
    modelViewer.addEventListener('touchstart', handleTouchStart);
    modelViewer.addEventListener('touchmove', handleTouchMove);
    modelViewer.addEventListener('touchend', handleTouchEnd);
    modelViewer.addEventListener('wheel', handleWheel);

    // Apply initial transformation
    applyTransformation();

    // Clean up event listeners
    return () => {
      modelViewer.removeEventListener('touchstart', handleTouchStart);
      modelViewer.removeEventListener('touchmove', handleTouchMove);
      modelViewer.removeEventListener('touchend', handleTouchEnd);
      modelViewer.removeEventListener('wheel', handleWheel);
    };
  }, [loading, star, scale, rotation, position, isDragging, lastTouchPosition, interactionMode]);

  // Set up UI elements after star data is loaded
  useEffect(() => {
    if (!star || loading) return;
    
    // Create close button
    let closeBtn = document.createElement('button');
    closeBtn.className = 'ar-close-button';
    closeBtn.innerHTML = '✕';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '20px';
    closeBtn.style.right = '20px';
    closeBtn.style.zIndex = '100';
    closeBtn.style.backgroundColor = '#ff5722';
    closeBtn.style.color = 'white';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.width = '50px';
    closeBtn.style.height = '50px';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.5)';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    
    closeBtn.addEventListener('click', () => {
      navigate(-1); // Go back to previous page
    });
    
    document.body.appendChild(closeBtn);
    closeBtnRef.current = closeBtn;
    
    // Star label
    let label = document.createElement('div');
    label.className = 'star-label';
    label.innerHTML = star.name;
    label.style.position = 'absolute';
    label.style.bottom = '90px';
    label.style.left = '50%';
    label.style.transform = 'translateX(-50%)';
    label.style.backgroundColor = 'rgba(0,0,0,0.7)';
    label.style.color = '#fff';
    label.style.padding = '10px 20px';
    label.style.borderRadius = '20px';
    label.style.fontSize = '24px';
    label.style.zIndex = '100';
    
    document.body.appendChild(label);
    labelRef.current = label;
    
    // Helper text for AR
    let helperText = document.createElement('div');
    helperText.className = 'ar-helper-text';
    helperText.innerHTML = isARSupported 
      ? 'Tap the AR button to view in augmented reality. Move your device to place the model.'
      : 'AR is not supported on your device. Using camera view instead.';
    helperText.style.position = 'absolute';
    helperText.style.top = '100px';
    helperText.style.left = '50%';
    helperText.style.transform = 'translateX(-50%)';
    helperText.style.backgroundColor = 'rgba(0,0,0,0.7)';
    helperText.style.color = '#fff';
    helperText.style.padding = '10px 20px';
    helperText.style.borderRadius = '20px';
    helperText.style.fontSize = '16px';
    helperText.style.zIndex = '100';
    helperText.style.textAlign = 'center';
    helperText.style.maxWidth = '80%';
    
    document.body.appendChild(helperText);
    helperTextRef.current = helperText;

    // Create interaction controls
    let controls = document.createElement('div');
    controls.className = 'ar-interaction-controls';
    controls.style.position = 'absolute';
    controls.style.bottom = '20px';
    controls.style.left = '50%';
    controls.style.transform = 'translateX(-50%)';
    controls.style.display = 'flex';
    controls.style.gap = '10px';
    controls.style.zIndex = '100';
    controls.style.backgroundColor = 'rgba(0,0,0,0.7)';
    controls.style.borderRadius = '30px';
    controls.style.padding = '10px 15px';
    
    // Create mode buttons
    const modes = [
      { id: 'rotate', icon: '🔄', label: 'Rotate' },
      { id: 'scale', icon: '↕️', label: 'Scale' },
      { id: 'position', icon: '↔️', label: 'Move' }
    ];
    
    modes.forEach(mode => {
      let btn = document.createElement('button');
      btn.dataset.mode = mode.id;
      btn.innerHTML = `${mode.icon} <span>${mode.label}</span>`;
      btn.style.backgroundColor = mode.id === 'rotate' ? '#FFD700' : 'transparent';
      btn.style.color = mode.id === 'rotate' ? '#000' : '#fff';
      btn.style.border = 'none';
      btn.style.borderRadius = '20px';
      btn.style.padding = '8px 15px';
      btn.style.fontSize = '16px';
      btn.style.cursor = 'pointer';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.gap = '5px';
      
      btn.addEventListener('click', () => {
        // Update interaction mode
        setInteractionMode(mode.id);
        
        // Update button styles
        controls.querySelectorAll('button').forEach(button => {
          button.style.backgroundColor = 'transparent';
          button.style.color = '#fff';
        });
        
        btn.style.backgroundColor = '#FFD700';
        btn.style.color = '#000';
      });
      
      controls.appendChild(btn);
    });
    
    // Add a reset button
    let resetBtn = document.createElement('button');
    resetBtn.innerHTML = '↺ Reset';
    resetBtn.style.backgroundColor = 'transparent';
    resetBtn.style.color = '#fff';
    resetBtn.style.border = '1px solid #fff';
    resetBtn.style.borderRadius = '20px';
    resetBtn.style.padding = '8px 15px';
    resetBtn.style.fontSize = '16px';
    resetBtn.style.cursor = 'pointer';
    resetBtn.style.marginLeft = '10px';
    
    resetBtn.addEventListener('click', () => {
      // Reset all transformations
      setScale(1);
      setRotation({ x: 0, y: 0, z: 0 });
      setPosition({ x: 0, y: 0, z: 0 });
      
      // Apply to model
      if (modelViewerRef.current) {
        modelViewerRef.current.scale = "1 1 1";
        modelViewerRef.current.orientation = "0deg 0deg 0deg";
      }
    });
    
    controls.appendChild(resetBtn);
    document.body.appendChild(controls);
    controlsRef.current = controls;

    // Configure model-viewer once it's loaded
    if (modelViewerRef.current) {
      const modelViewer = modelViewerRef.current;
      
      // Enable interaction
      modelViewer.interactionPrompt = "auto";
      
      // Handle model load event
      modelViewer.addEventListener('load', () => {
        console.log("Model loaded successfully");
        
        // Hide loading indicator if exists
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }

        // Add a hotspot to the model to control position in AR mode
        if (modelViewer.model) {
          modelViewer.innerHTML += `
            <button class="hotspot" slot="hotspot-0" data-position="0 0 0" data-normal="0 1 0" data-visibility-attribute="visible">
              <div class="hotspot-annotation">
                Drag to reposition
              </div>
            </button>
          `;
        }
      });
      
      // Handle AR mode changes
      modelViewer.addEventListener('ar-status', (event) => {
        if (event.detail.status === 'session-started') {
          console.log("AR session started");
          // Hide the star info card and helper text in AR mode
          const starInfoCard = document.querySelector('.star-info-card');
          if (starInfoCard) {
            starInfoCard.style.display = 'none';
          }
          
          // Show AR-specific controls
          if (controlsRef.current) {
            controlsRef.current.style.display = 'flex';
          }
        } else if (event.detail.status === 'not-presenting') {
          console.log("AR session ended");
          // Show the star info card again
          const starInfoCard = document.querySelector('.star-info-card');
          if (starInfoCard) {
            starInfoCard.style.display = 'block';
          }
        }
      });
      
      // Handle error events
      modelViewer.addEventListener('error', (event) => {
        console.error('Error loading model:', event);
        setError(`Error loading model: ${event.detail}`);
      });
    }

    // Cleanup on unmount
    return () => {
      // Remove DOM elements
      const elements = [
        closeBtnRef.current,
        labelRef.current,
        helperTextRef.current,
        controlsRef.current,
        descriptionBtnRef.current,
        descriptionBoxRef.current
      ];
      
      elements.forEach((element) => {
        if (element && document.body.contains(element)) {
          document.body.removeChild(element);
        }
      });
    };
  }, [star, loading, isARSupported, navigate, showDescription]);

  // Star info component
  const StarInfoCard = () => {
    if (!star) return null;
    
    return (
      <div className="star-info-card">
        <h2>{star.name}</h2>
        <p>Type: {star.type}</p>
        <div className="star-controls">
          <p>Available interaction modes:</p>
          <ul>
            <li>🔄 Rotate: Drag to rotate the model in 3D space</li>
            <li>↕️ Scale: Drag up/down to resize the model</li>
            <li>↔️ Move: Drag to reposition the model in AR</li>
          </ul>
          <p>You can also use these gestures:</p>
          <ul>
            <li>Pinch with two fingers to zoom in/out</li>
            <li>Rotate with two fingers to turn the model</li>
          </ul>
        </div>
      </div>
    );
  };
  
  // Loading screen component
  const LoadingScreen = () => (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading star data...</p>
    </div>
  );
  
  // Error screen component
  const ErrorScreen = () => (
    <div className="error-screen">
      <h2>Error</h2>
      <p>{error}</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
  
  // AR compatibility notice component
  const ARCompatibilityNotice = () => {
    if (isARSupported === null) return null;
    
    return isARSupported ? (
      <div className="ar-compatibility-notice ar-supported">
        <p>✓ AR supported on your device</p>
      </div>
    ) : (
      <div className="ar-compatibility-notice ar-not-supported">
        <p>⚠️ AR not supported on your device. Using camera fallback mode.</p>
      </div>
    );
  };
  
  // Main render function
  return (
    <div className="ar-scene-container">
      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <ErrorScreen />
      ) : (
        <>
          {/* Space Background Overlay */}
          {showSpaceBackground && (
            <>
              {/* Deep space background - using a gradient background instead of image */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 2,
                  background: 'linear-gradient(to bottom, #0d1a30 0%, #192952 50%, #0c164a 100%)',
                  opacity: 0.6,
                  pointerEvents: 'none'
                }}
              />
              
              {/* Add random stars to the background */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 3,
                  background: `radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 5px),
                              radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 3px),
                              radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 4px),
                              radial-gradient(rgba(255,255,255,.4), rgba(255,255,255,.1) 1px, transparent 2px)`,
                  backgroundSize: '550px 550px, 350px 350px, 250px 250px, 150px 150px', 
                  backgroundPosition: '0 0, 40px 60px, 130px 270px, 70px 100px',
                  opacity: 0.4,
                  pointerEvents: 'none',
                  mixBlendMode: 'screen'
                }}
              />
              
              {/* Constellation-specific guide stars overlay */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 4,
                  backgroundImage: `url("${constellationGuideOverlays[starId.toLowerCase()] || constellationGuideOverlays.default}")`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: 0.9,
                  pointerEvents: 'none',
                  mixBlendMode: 'screen'
                }}
              />
              
              {/* Info text about the guide overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  padding: '8px 15px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  zIndex: 3000,
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}
              >
                Guide stars shown for {star?.name || 'constellation'} visualization
              </div>
            </>
          )}

          {/* Description Button */}
          <button
            onClick={toggleDescription}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: '3000',
              backgroundColor: '#03a9f4',
              color: 'white',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '24px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto'
            }}
          >
            <FaInfoCircle />
          </button>

          {/* Close Button (X) */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: '3000',
              backgroundColor: '#ff5722',
              color: 'white',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '24px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto'
            }}
          >
            <FaTimes />
          </button>

          {/* Space Background Toggle Button */}
          <button
            onClick={toggleSpaceBackground}
            style={{
              position: 'absolute',
              top: '20px',
              left: '80px', // Position next to info button
              zIndex: '3000',
              backgroundColor: showSpaceBackground ? '#9c27b0' : '#673ab7',
              color: 'white',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '24px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto'
            }}
          >
            <FaStar />
          </button>

          {/* Video element for camera fallback when WebXR is not available */}
          <video 
            ref={videoRef}
            className={`camera-video ${cameraActive && !isARSupported ? 'active' : ''}`}
            playsInline 
            muted
          />
          
          {/* Model Viewer component with enhanced AR capabilities */}
          <model-viewer
            ref={modelViewerRef}
            src={star.model}
            alt={`3D model of ${star.name}`}
            ar={isARSupported}
            ar-modes="webxr scene-viewer quick-look"
            environment-image="neutral"
            camera-controls
            auto-rotate
            ar-scale="fixed"
            ar-placement="floor wall ceiling"
            touch-action="pan-y"
            interaction-prompt="auto"
            min-camera-orbit="auto auto auto"
            max-camera-orbit="auto auto auto"
            min-field-of-view="10deg"
            max-field-of-view="90deg"
            shadow-intensity="1"
            exposure="1"
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 10 }}
          >
            {/* Loading indicator for model-viewer */}
            <div className="loading-indicator" slot="poster">
              <div className="loading-spinner"></div>
              <p>Loading 3D model...</p>
            </div>
            
            {/* Interactive controls for AR mode */}
            <div className="slider" slot="ar-button">
              <div id="ar-prompt">
                <img src="/assets/ar-hand.png" alt="AR Hand Icon" />
              </div>
              <button className="ar-button">
                View in your space
              </button>
            </div>
            
            {/* Progress bar for model loading */}
            <div className="progress-bar" slot="progress-bar">
              <div className="update-bar"></div>
            </div>
          </model-viewer>
          
          {/* Description Box */}
          {showDescription && star && (
            <div 
              style={{
                position: 'absolute',
                bottom: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                color: 'white',
                padding: '20px',
                borderRadius: '15px',
                zIndex: '2000',
                maxWidth: '90%',
                maxHeight: '60%',
                overflow: 'auto',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h2 style={{ margin: '0', fontSize: '22px' }}>{star.name}</h2>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setDescriptionTab('scientific')}
                    style={{
                      backgroundColor: descriptionTab === 'scientific' ? '#3f51b5' : '#666',
                      color: 'white',
                      border: 'none',
                      borderRadius: '15px',
                      padding: '5px 10px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <FaBook /> Scientific
                  </button>
                  <button 
                    onClick={() => setDescriptionTab('kid-friendly')}
                    style={{
                      backgroundColor: descriptionTab === 'kid-friendly' ? '#3f51b5' : '#666',
                      color: 'white',
                      border: 'none',
                      borderRadius: '15px',
                      padding: '5px 10px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <FaChild /> Kid-Friendly
                  </button>
                </div>
              </div>
              
              <div style={{ marginTop: '15px', lineHeight: '1.5' }}>
                {(() => {
                  const constellationId = starId.toLowerCase();
                  if (constellationDescriptions[constellationId]) {
                    if (descriptionTab === 'scientific') {
                      return constellationDescriptions[constellationId].scientific;
                    } else {
                      return constellationDescriptions[constellationId].kidFriendly;
                    }
                  }
                  return "No description available for this constellation.";
                })()}
              </div>
              
              <button
                onClick={toggleDescription}
                style={{
                  backgroundColor: '#ff5722',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 15px',
                  marginTop: '15px',
                  cursor: 'pointer',
                  display: 'block',
                  margin: '15px auto 0'
                }}
              >
                Close
              </button>
            </div>
          )}
          
          {/* Star info card */}
          {!loading && star && <StarInfoCard />}
          
          {/* AR compatibility notice */}
          <ARCompatibilityNotice />
        </>
      )}
    </div>
  );
};

export default StarARScene;