import React, { useState, useEffect, useRef } from "react";
import { FaStar, FaVolumeUp, FaVolumeMute, FaRocket, FaSlidersH, FaHome, FaPlay, FaPause, FaInfo, FaBook, FaGamepad, FaCamera, FaExpand, FaCompress, FaEye, FaEyeSlash, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { MdZoomIn, MdZoomOut, MdSpeed, MdSchool, MdAutoMode, MdSettings } from "react-icons/md";
import { IoPlanetOutline, IoStarOutline, IoRocketOutline } from "react-icons/io5";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import TWEEN from "@tweenjs/tween.js";
import "../../styles/SolarSystemAR.css";

const SolarSystemSandbox = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [followMode, setFollowMode] = useState(false);
  const [viewMode, setViewMode] = useState("overview"); // overview, topDown, planetView
  const [isPaused, setIsPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOrbitLines, setShowOrbitLines] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [currentPlanetIndex, setCurrentPlanetIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const audioRef = useRef(null);
  const touchStartRef = useRef(null);
  const lastTouchDistanceRef = useRef(null);
  const speechSynthRef = useRef(null);
  
  // Three.js references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const planetsRef = useRef({});
  const labelsRef = useRef({});
  const orbitLinesRef = useRef([]);
  const animationFrameId = useRef(null);
  const rocketRef = useRef(null);
  const rocketPathRef = useRef(null);
  
  // Planet order for navigation
  const planetOrder = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  
  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to the Solar System!",
      content: "Click on any planet to explore it up close. Use the controls on the right to navigate and customize your view.",
      position: { top: "20%", left: "50%", transform: "translateX(-50%)" }
    },
    {
      title: "View Controls",
      content: "Use the Overview, Top Down, and Reset View buttons to change your perspective. Try clicking on different planets!",
      position: { top: "30%", right: "20%" }
    },
    {
      title: "Simulation Controls",
      content: "Adjust the simulation speed to see planets move faster or slower. Pause the simulation to study planets in detail.",
      position: { top: "50%", right: "20%" }
    },
    {
      title: "Planet Information",
      content: "When you click a planet, you can view detailed information. Switch between Scientific and Kid-Friendly descriptions.",
      position: { top: "60%", left: "50%", transform: "translateX(-50%)" }
    },
    {
      title: "Rocket Controls",
      content: "Use the rocket controls at the bottom right to fly around the solar system. Have fun exploring!",
      position: { bottom: "20%", right: "20%" }
    }
  ];
  
  // Planet data with balanced sizes and proper orbital mechanics
  // Sizes optimized for visibility and educational value
  const planetData = {
    "sun": {
      texturePath: "/texture/sun.jpg",
      scale: 2.5, // Balanced size for visibility
      position: [0, 0, 0],
      rotationSpeed: 0.001, // Visible rotation
      orbitRadius: 0,
      orbitSpeed: 0,
      orbitTilt: 0,
      emissive: true,
      glowIntensity: 1.5,
      description: "The Sun is the star at the center of our Solar System, around which all planets, dwarf planets, asteroids, and comets orbit. It contains 99.8% of the Solar System's mass and exerts gravitational control over the entire system. The Sun's energy is produced by nuclear fusion reactions in its core and is essential for life on Earth, powering our weather systems, ocean currents, and enabling photosynthesis. Changes in the Sun's activity directly affect Earth's climate and can disrupt satellite communications.",
      kidFriendlyDesc: "The Sun is like the boss of our Solar System! It sits in the middle while all the planets orbit around it like a giant merry-go-round. The Sun is SUPER big - more than a million Earths could fit inside it! All its gravity helps keep every planet in their proper orbit. The Sun gives light and heat to all the planets, but each planet gets different amounts depending on how far away they are. Without the Sun, Earth would be dark, frozen, and we couldn't live here!"
    },
    "mercury": {
      texturePath: "/texture/mercury.jpg",
      scale: 0.3, // Smallest planet
      position: [5, 0, 0],
      rotationSpeed: 0.004, // Slow rotation
      orbitRadius: 5,
      orbitSpeed: 0.02, // Fastest orbit
      orbitTilt: 0.03,
      description: "Mercury is the closest planet to the Sun, orbiting at an average distance of just 36 million miles. This proximity means Mercury experiences extreme temperature variations, from 800°F (430°C) during the day to -290°F (-180°C) at night. Despite being the smallest planet in our Solar System, Mercury has a relatively large iron core that generates a magnetic field about 1% as strong as Earth's. Mercury's cratered surface resembles our Moon because both lack an atmosphere substantial enough to erode impact features over time.",
      kidFriendlyDesc: "Mercury is the speediest planet in our Solar System - it zooms around the Sun in just 88 Earth days! Being closest to the Sun makes Mercury super hot during the day, but because it has almost no air to trap heat, it gets freezing cold at night. Mercury is covered with craters just like our Moon because both don't have enough air to protect them from space rocks. Even though Mercury is the smallest planet (smaller than Earth's Moon!), it's made mostly of heavy metal like iron, which is different from the other small planets."
    },
    "venus": {
      texturePath: "/texture/venus.jpg",
      scale: 0.45, // Similar to Earth size
      position: [7, 0, 0],
      rotationSpeed: -0.002, // Retrograde rotation (visible)
      orbitRadius: 7,
      orbitSpeed: 0.015,
      orbitTilt: 0.06,
      description: "Venus is often called Earth's sister planet due to their similar size and composition, but Venus evolved very differently. Its thick atmosphere traps heat in a runaway greenhouse effect, making Venus the hottest planet in our Solar System at 900°F (475°C) - hot enough to melt lead. This extreme climate shows what can happen when greenhouse gases accumulate unchecked. Venus rotates backward compared to other planets and so slowly that its day is longer than its year. The planet's hostile conditions make it a cautionary example when studying climate change on Earth.",
      kidFriendlyDesc: "Venus is Earth's neighbor in space and almost the same size as our planet - that's why scientists call them sister planets! But Venus turned out VERY different from Earth. It's covered in super thick clouds made of acid, and it's the hottest planet even though it's not closest to the Sun. This is because its clouds trap heat like a giant blanket. Venus also spins backwards compared to most planets! Scientists study Venus to understand how planets can change over time, which helps us take better care of Earth."
    },
    "earth": {
      texturePath: "/texture/earth.jpg",
      scale: 0.5, // Reference size
      position: [9, 0, 0],
      rotationSpeed: 0.01, // Standard rotation
      orbitRadius: 9,
      orbitSpeed: 0.01,
      orbitTilt: 0.01,
      description: "Earth is the third planet from the Sun and the only known celestial body to harbor life, making it unique in our Solar System. Its perfect distance from the Sun creates the 'Goldilocks zone' where water exists as a liquid, a crucial factor for life. Earth's protective magnetic field shields us from harmful solar radiation, while its atmosphere maintains temperatures suitable for life and provides the air we breathe. Earth's Moon stabilizes our planet's rotation, which helps maintain a stable climate and creates ocean tides that have influenced the evolution of coastal life.",
      kidFriendlyDesc: "Earth is our special home in the Solar System and the only planet where we know living things exist! Earth sits at just the right distance from the Sun - not too hot, not too cold - which lets us have liquid water in our oceans, lakes, and rivers. Our planet has a special magnetic shield that protects us from the Sun's harmful rays and a blanket of air that we breathe. Earth's Moon helps keep our seasons stable and creates the ocean tides. Our beautiful blue planet has thousands of different animals, plants, and amazing landscapes that aren't found anywhere else in space!"
    },
    "moon": {
      texturePath: "/texture/moon.jpg",
      scale: 0.15, // Small moon
      position: [9.8, 0, 0],
      rotationSpeed: 0.001, // Tidally locked
      orbitRadius: 1.2,
      orbitSpeed: 0.05, // Fast orbit around Earth
      orbitTilt: 0.08,
      orbitCenter: "earth",
      description: "The Moon is Earth's only natural satellite and the fifth largest satellite in the Solar System. Its gravitational influence produces Earth's tides and gradually slows our planet's rotation. The Moon is in 'synchronous rotation' with Earth, meaning the same side always faces us, leading to the concepts of 'near side' and 'far side.' The Moon's periodic eclipses of the Sun have helped scientists make important discoveries about our star. Our nearest celestial neighbor, the Moon has been visited by humans during the Apollo missions and continues to be a focus for future space exploration and potential colonization.",
      kidFriendlyDesc: "The Moon is Earth's only natural satellite and our closest neighbor in space! It orbits around Earth while we both orbit the Sun together. The Moon causes our ocean tides and always shows us the same face - that's why we see the 'Man in the Moon'! When astronauts visited the Moon, they left footprints that will stay there for millions of years because the Moon has no wind or rain to wash them away. Looking at the Moon from Earth, you can see dark patches (called 'seas' even though they're dry!) and bright, cratered highlands. Scientists want to build bases on the Moon someday as a first step to exploring deeper into our Solar System."
    },
    "mars": {
      texturePath: "/texture/mars.jpg",
      scale: 0.35, // Half of Earth size
      position: [12, 0, 0],
      rotationSpeed: 0.009, // Similar to Earth
      orbitRadius: 12,
      orbitSpeed: 0.008,
      orbitTilt: 0.03,
      description: "Mars is the fourth planet from the Sun and a prime target for exploring the possibility of past or present life beyond Earth. Often called the Red Planet due to iron oxide (rust) in its soil, Mars has similar features to Earth including polar ice caps, seasons, canyons, and dormant volcanoes. Evidence suggests Mars once had flowing water and a thicker atmosphere, making it potentially habitable in the past. Mars has two small moons, Phobos and Deimos, which may be captured asteroids. The planet serves as a natural laboratory for understanding how terrestrial planets evolve and as a potential site for future human colonization.",
      kidFriendlyDesc: "Mars is the red planet that comes after Earth in our Solar System! Its red color comes from rusty iron in the soil. Mars is an exciting planet because it's the most similar to Earth - it has seasons, ice caps at the north and south poles, and even has the tallest mountain in our Solar System called Olympus Mons! Scientists have sent rovers like Curiosity and Perseverance to drive around on Mars looking for signs that water or tiny life forms might have existed there long ago. Mars has two tiny moons that look like potatoes! Some people think humans might live on Mars someday, making it our second home in the Solar System."
    },
    "jupiter": {
      texturePath: "/texture/jupiter.jpg",
      scale: 1.5, // Largest planet
      position: [16, 0, 0],
      rotationSpeed: 0.025, // Fast rotation
      orbitRadius: 18,
      orbitSpeed: 0.004,
      orbitTilt: 0.01,
      description: "Jupiter is the largest planet in our Solar System and the first of the gas giants. With a mass greater than all other planets combined, Jupiter's immense gravitational influence has shaped the Solar System's architecture by affecting the orbits of asteroids and comets. Jupiter's Great Red Spot is a storm larger than Earth that has persisted for at least 400 years. The planet has at least 79 moons, including the four large Galilean moons: Io (volcanically active), Europa (possible subsurface ocean), Ganymede (largest moon in the Solar System), and Callisto. Jupiter serves as a protective barrier for Earth, as its strong gravity can capture or deflect comets and asteroids that might otherwise impact inner planets.",
      kidFriendlyDesc: "Jupiter is the biggest planet in our Solar System - it's like the Solar System's vacuum cleaner! Its super strong gravity helps protect Earth by pulling in asteroids and comets that might hit us. Jupiter is SO massive that more than 1,300 Earths could fit inside it! The giant planet has at least 79 moons - that's like having 79 mini-planets orbiting around you! Jupiter's most famous feature is the Great Red Spot, which is a huge storm that's been swirling for hundreds of years and is bigger than Earth! Jupiter doesn't have a solid surface - if you tried to land there, you'd just sink into the gas clouds!"
    },
    "saturn": {
      texturePath: "/texture/saturn_map.jpg",
      scale: 1.2, // Second largest
      position: [20, 0, 0],
      rotationSpeed: 0.022, // Fast rotation
      orbitRadius: 24,
      orbitSpeed: 0.003,
      orbitTilt: 0.05,
      hasRings: true,
      description: "Saturn is the sixth planet from the Sun and the second-largest in our Solar System. Its most distinctive feature is its spectacular ring system, which consists of ice particles, rocky debris, and dust spanning thousands of miles yet only about 66 feet thick. Saturn has at least 83 moons, with Titan being the largest and the only moon in the Solar System with a substantial atmosphere. The planet's low density means it would float in water if there were an ocean large enough. Saturn's unique ring system and diverse moons make it a natural laboratory for studying the processes that formed the early Solar System. Cassini-Huygens, a spacecraft that studied Saturn from 2004 to 2017, revealed complex weather patterns in its atmosphere and lakes of liquid methane on Titan.",
      kidFriendlyDesc: "Saturn is the planet with the beautiful rings that everyone loves! These rings are made of billions of pieces of ice and rock, from tiny dust specks to chunks as big as houses. Even though Saturn is huge (the second-largest planet after Jupiter), it's so light it would actually float in water if there was a bathtub big enough! Saturn has at least 83 moons, and the biggest one, Titan, is super special because it has rivers and lakes - but they're filled with liquid methane (like natural gas) instead of water! Scientists sent a spacecraft called Cassini that took amazing pictures of Saturn's rings and discovered that some of its moons might have oceans hiding under their icy surfaces."
    },
    "uranus": {
      texturePath: "/texture/uranus.jpg",
      scale: 0.7, // Ice giant size
      position: [24, 0, 0],
      rotationSpeed: 0.015, // Sideways rotation
      orbitRadius: 30,
      orbitSpeed: 0.002,
      orbitTilt: 0.98, // Extreme tilt
      description: "Uranus is the seventh planet from the Sun and the first planet discovered with a telescope. This ice giant is unique in the Solar System because it rotates on its side, likely due to a massive collision in its distant past. This extreme tilt causes radical seasonal changes, with each pole experiencing 42 years of continuous sunlight followed by 42 years of darkness. Uranus appears blue-green due to methane in its atmosphere absorbing red light. The planet has 27 known moons, all named after literary characters from works by Shakespeare and Pope, and a complex system of rings. Uranus marks the boundary between the inner and outer Solar System and represents a distinct class of planets (ice giants) that may be common throughout our galaxy.",
      kidFriendlyDesc: "Uranus is the sideways planet! While other planets spin like tops, Uranus rolls like a ball because it was knocked over by a huge crash long ago. This weird tilt gives Uranus the strangest seasons in the Solar System - each pole gets 42 years of sunlight followed by 42 years of darkness! Uranus looks blue-green because its atmosphere is full of a gas called methane that absorbs red light and reflects blue light. It has 27 moons all named after characters from Shakespeare's stories. Uranus is SUPER cold - it's actually the coldest planet even though Neptune is farther from the Sun! Scientists have only visited Uranus once with a spacecraft called Voyager 2 back in 1986."
    },
    "neptune": {
      texturePath: "/texture/neptune.jpg",
      scale: 0.65, // Ice giant size
      position: [28, 0, 0],
      rotationSpeed: 0.016, // Fast rotation
      orbitRadius: 36,
      orbitSpeed: 0.0015,
      orbitTilt: 0.05,
      description: "Neptune is the eighth and farthest known planet from the Sun in our Solar System. This ice giant was the first planet located through mathematical predictions rather than direct observation. Neptune has the strongest winds in the Solar System, reaching speeds of 1,200 mph (2,100 km/h), and is home to the Great Dark Spot, a storm system similar to Jupiter's Great Red Spot. Despite being 30 times farther from the Sun than Earth, Neptune radiates more heat than it receives, suggesting powerful internal heat sources. The planet's largest moon, Triton, orbits in the opposite direction of Neptune's rotation, suggesting it was captured rather than formed alongside the planet. Neptune's discovery represented a triumph of science, as it was predicted mathematically before it was ever observed telescopically.",
      kidFriendlyDesc: "Neptune is the blue giant and the farthest planet from the Sun! It's so far away that it takes 165 Earth years to make just one trip around the Sun. Neptune is the windiest planet in our Solar System with super hurricanes that blow more than 1,200 miles per hour - that's five times faster than the strongest hurricanes on Earth! It appears deep blue because, like Uranus, it has methane gas in its atmosphere. Neptune has 14 moons, and its largest one, Triton, is super strange because it orbits backward compared to the other moons! Scientists found Neptune in a really cool way - they used math to predict where it would be before anyone actually saw it with a telescope! Only one spacecraft, Voyager 2, has ever visited Neptune, and that was way back in 1989."
    },
    "pluto": {
      texturePath: null, // No texture available, will use fallback color
      scale: 0.2, // Dwarf planet size
      position: [32, 0, 0],
      rotationSpeed: 0.003, // Slow rotation
      orbitRadius: 42,
      orbitSpeed: 0.001,
      orbitTilt: 0.3, // Highly tilted orbit
      description: "Pluto, once considered the ninth planet, was reclassified as a dwarf planet in 2006, illustrating how our understanding of the Solar System continues to evolve. Located in the Kuiper Belt, a ring of icy bodies beyond Neptune, Pluto is just one of many similar objects in the outer Solar System. The New Horizons mission's 2015 flyby revealed surprising complexity: a heart-shaped glacier (Tombaugh Regio), mountains of water ice, potential cryovolcanoes, and a tenuous atmosphere that expands and contracts as Pluto's distance from the Sun changes. Pluto and its largest moon, Charon, are so close in size that they orbit a common center of gravity located outside of Pluto itself, essentially forming a binary system. Pluto's distance and orbit demonstrate the vast scale of our Solar System, as it takes 248 Earth years to complete one orbit around the Sun.",
      kidFriendlyDesc: "Pluto used to be called the ninth planet, but now astronomers call it a dwarf planet. Think of it like this: Pluto didn't get kicked out of the Solar System family - our family just got A LOT bigger when we discovered many more objects like Pluto in the outer Solar System! Pluto is so far from the Sun that it takes 248 Earth years to go around once. It's a tiny, icy world with a giant heart-shaped glacier on its surface that scientists spotted when the New Horizons spacecraft flew past in 2015. Pluto has five moons, and the biggest one, Charon, is so large compared to Pluto that they dance around each other like ballroom partners! Pluto is incredibly cold at about -375°F, so cold that substances we know as gases on Earth (like nitrogen and methane) are frozen solid on Pluto's surface."
    }
  };

  // Balanced scale and spacing for visibility
  const SCALE_MULTIPLIER = 1.0;
  const ORBIT_MULTIPLIER = 1.0;

  // Initialize scene on component mount
  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    
    initScene();
    
    // Initialize background music
    const audio = new Audio('/sounds/space-ambient.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    window.addEventListener('resize', checkMobile);
    
    // Handle fullscreen change
    window.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Add touch event listeners
    if (canvasRef.current) {
      canvasRef.current.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvasRef.current.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvasRef.current.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
    
    // Show tutorial for new users (skip on mobile)
    const hasSeenTutorial = localStorage.getItem('solarSystemTutorialSeen');
    if (!hasSeenTutorial && !isMobile) {
      setShowTutorial(true);
    }
    
    return () => {
      // Cleanup
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('touchstart', handleTouchStart);
        canvasRef.current.removeEventListener('touchmove', handleTouchMove);
        canvasRef.current.removeEventListener('touchend', handleTouchEnd);
      }
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      // Stop audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Dispose Three.js resources
      disposeScene();
    };
  }, []);

  // Update scene when showLabels changes
  useEffect(() => {
    updateLabelsVisibility();
  }, [showLabels]);

  // Update orbit lines visibility
  useEffect(() => {
    updateOrbitLinesVisibility();
  }, [showOrbitLines]);

  // Update auto-rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 2.0;
    }
  }, [autoRotate]);

  // Update audio when audioPlaying changes
  useEffect(() => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.play().catch(e => {
          console.log("Audio autoplay was prevented:", e);
          setAudioPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [audioPlaying]);

  // Handle resize to maintain aspect ratio
  const handleResize = () => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    
    rendererRef.current.setSize(width, height);
  };

  // Handle fullscreen change
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Navigate to next/previous planet
  const navigatePlanet = (direction) => {
    const currentIndex = planetOrder.indexOf(selectedPlanet || 'sun');
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % planetOrder.length;
    } else {
      newIndex = (currentIndex - 1 + planetOrder.length) % planetOrder.length;
    }
    
    const newPlanet = planetOrder[newIndex];
    setCurrentPlanetIndex(newIndex);
    zoomToPlanet(newPlanet);
  };

  // Quick planet selection
  const selectPlanet = (planetName) => {
    zoomToPlanet(planetName);
    setCurrentPlanetIndex(planetOrder.indexOf(planetName));
  };

  // Pause/Resume simulation
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Tutorial functions
  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      localStorage.setItem('solarSystemTutorialSeen', 'true');
    }
  };

  const prevTutorialStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('solarSystemTutorialSeen', 'true');
  };

  // Update orbit lines visibility
  const updateOrbitLinesVisibility = () => {
    orbitLinesRef.current.forEach(line => {
      if (line) line.visible = showOrbitLines;
    });
  };

  // Add orbit controls with proper configuration
  const setupOrbitControls = () => {
    if (!cameraRef.current || !rendererRef.current) return;
    
    // Remove any existing controls
    if (controlsRef.current) {
      controlsRef.current.dispose();
    }
    
    // Create new controls
    const controls = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    
    // Configure controls
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.7;
    controls.panSpeed = 0.5;
    controls.minDistance = 0.5;
    controls.maxDistance = 100;
    
    // Set initial target
    controls.target.set(0, 0, 0);
    
    // Enable controls
    controls.enabled = true;
    controls.update();
    
    // Store reference
    controlsRef.current = controls;
  };

  // Initialize Three.js scene
  const initScene = () => {
    if (!containerRef.current || !canvasRef.current) return;
    
    // Get container dimensions
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.set(0, 20, 45);
    cameraRef.current = camera;
    
    // Create renderer with proper settings to avoid FLIP_Y warnings
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    // Disable texture flipping which causes the INVALID_OPERATION warnings
    renderer.outputEncoding = THREE.sRGBEncoding;
    THREE.ImageUtils.getDataURL = () => '';
    
    // Initialize renderer
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio to avoid performance issues
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    
    // Add orbit controls
    setupOrbitControls();
    
    // Add lighting
    addLighting();
    
    // Add stars background
    addStars();
    
    // Create orbit lines
    createOrbitLines();
    
    // Load planet models
    loadPlanets();
    
    // Add rocket ship
    addRocket();
    
    // Start animation loop
    animate();
  };
  
  // Enhanced lighting system for better planet visibility
  const addLighting = () => {
    const scene = sceneRef.current;
    
    // Ambient light for base visibility - increased for better planet viewing
    const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambientLight);
    
    // Sun as main light source with enhanced properties
    const sunLight = new THREE.PointLight(0xffd700, 4, 150);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);
    
    // Enhanced sun glow effect
    const sunGlow = new THREE.PointLight(0xffaa00, 3, 80);
    sunGlow.position.set(0, 0, 0);
    scene.add(sunGlow);
    
    // Hemisphere light for natural space lighting
    const hemiLight = new THREE.HemisphereLight(0x8080ff, 0x202040, 0.6);
    scene.add(hemiLight);
    
    // Multiple directional lights for better planet illumination
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight1.position.set(10, 15, 10);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    dirLight1.shadow.camera.near = 0.5;
    dirLight1.shadow.camera.far = 100;
    scene.add(dirLight1);
    
    // Secondary directional light from opposite side
    const dirLight2 = new THREE.DirectionalLight(0xaaccff, 0.3);
    dirLight2.position.set(-10, 10, -10);
    scene.add(dirLight2);
    
    // Rim lighting for planet edges
    const rimLight1 = new THREE.DirectionalLight(0x4080ff, 0.3);
    rimLight1.position.set(-15, 5, -15);
    scene.add(rimLight1);
    
    // Additional rim light from another angle
    const rimLight2 = new THREE.DirectionalLight(0xff8040, 0.2);
    rimLight2.position.set(15, -5, 15);
    scene.add(rimLight2);
    
    // Soft fill light to reduce harsh shadows
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
    fillLight.position.set(0, -10, 0);
    scene.add(fillLight);
  };
  
  // Add starfield background
  const addStars = () => {
    const scene = sceneRef.current;
    
    // Set a simple color background instead of using problematic cube textures
    scene.background = new THREE.Color(0x000814);
    
    // Create stars as particles
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.1,
      sizeAttenuation: true
    });
    
    const starsVertices = [];
    // Create more stars (5000) for a better starfield effect
    for (let i = 0; i < 5000; i++) {
      const x = THREE.MathUtils.randFloatSpread(200);
      const y = THREE.MathUtils.randFloatSpread(200);
      const z = THREE.MathUtils.randFloatSpread(200);
      
      // Keep stars away from center
      if (Math.sqrt(x*x + y*y + z*z) < 40) continue;
      
      starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // Add a few larger stars for visual interest
    const largeStarsGeometry = new THREE.BufferGeometry();
    const largeStarsMaterial = new THREE.PointsMaterial({
      color: 0xFFFFCC,
      size: 0.2,
      sizeAttenuation: true
    });
    
    const largeStarsVertices = [];
    for (let i = 0; i < 200; i++) {
      const x = THREE.MathUtils.randFloatSpread(180);
      const y = THREE.MathUtils.randFloatSpread(180);
      const z = THREE.MathUtils.randFloatSpread(180);
      
      // Keep large stars away from center too
      if (Math.sqrt(x*x + y*y + z*z) < 50) continue;
      
      largeStarsVertices.push(x, y, z);
    }
    
    largeStarsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(largeStarsVertices, 3));
    const largeStars = new THREE.Points(largeStarsGeometry, largeStarsMaterial);
    scene.add(largeStars);
  };
  
  // Create orbit lines for planets
  const createOrbitLines = () => {
    const scene = sceneRef.current;
    
    Object.entries(planetData).forEach(([name, data]) => {
      // Skip the sun and the moon (which orbits Earth)
      if (name === 'sun' || name === 'moon') return;
      
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0x4488ff, 
        transparent: true, 
        opacity: 0.4 
      });
      
      const orbitPoints = [];
      const segments = 128;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * (data.orbitRadius * ORBIT_MULTIPLIER);
        const z = Math.sin(angle) * (data.orbitRadius * ORBIT_MULTIPLIER);
        
        orbitPoints.push(new THREE.Vector3(x, 0, z));
      }
      
      orbitGeometry.setFromPoints(orbitPoints);
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      
      // Apply orbit tilt
      orbitLine.rotation.x = data.orbitTilt * Math.PI;
      
      scene.add(orbitLine);
      orbitLinesRef.current.push(orbitLine);
    });
  };
  
  // Create interactive rocket
  const addRocket = () => {
    const scene = sceneRef.current;
    
    // Create a simple rocket with geometry
    const rocketGroup = new THREE.Group();
    
    // Rocket body
    const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xCCCCCC });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    rocketGroup.add(body);
    
    // Rocket nose
    const noseGeometry = new THREE.ConeGeometry(0.2, 0.5, 16);
    const noseMaterial = new THREE.MeshPhongMaterial({ color: 0xFF4444 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0, -0.75);
    nose.rotation.x = Math.PI / 2;
    rocketGroup.add(nose);
    
    // Rocket fins
    const finGeometry = new THREE.ConeGeometry(0.2, 0.4, 4);
    const finMaterial = new THREE.MeshPhongMaterial({ color: 0x4444FF });
    
    for (let i = 0; i < 4; i++) {
      const fin = new THREE.Mesh(finGeometry, finMaterial);
      fin.position.set(Math.sin(i * Math.PI/2) * 0.2, Math.cos(i * Math.PI/2) * 0.2, 0.5);
      fin.rotation.set(0, 0, i * Math.PI/2);
      rocketGroup.add(fin);
    }
    
    // Add exhaust light
    const exhaustLight = new THREE.PointLight(0xFF8844, 1, 3);
    exhaustLight.position.set(0, 0, 0.8);
    rocketGroup.add(exhaustLight);
    
    // Position rocket
    rocketGroup.position.set(10, 0, 0); // Start at Earth's position
    
    // Create rocket path (initially follows Earth's orbit)
    rocketPathRef.current = {
      orbit: "earth",
      orbitRadius: planetData["earth"].orbitRadius,
      orbitSpeed: planetData["earth"].orbitSpeed * 2,
      orbitAngle: 0,
      orbitHeight: 0
    };
    
    scene.add(rocketGroup);
    rocketRef.current = rocketGroup;
  };
  
  // Load planets as textured spheres with optimized performance
  const loadPlanets = () => {
    const scene = sceneRef.current;
    const textureLoader = new THREE.TextureLoader();
    
    // Ring textures
    const saturnRingTexturePath = '/texture/saturn_ring.png';
    const uranusRingTexturePath = '/texture/uranus_ringcolour.jpg';
    
    let loadedCount = 0;
    const totalPlanets = Object.keys(planetData).length;
    
    Object.entries(planetData).forEach(([name, data]) => {
      const pivotGroup = new THREE.Group();
      pivotGroup.name = `${name}Pivot`;
      // Apply orbital plane tilt to pivot so mesh orbits on tilted plane
      if (typeof data.orbitTilt === 'number') {
        pivotGroup.rotation.x = data.orbitTilt * Math.PI;
      }
      
      if (!data.orbitCenter) {
        scene.add(pivotGroup);
      }
      
      const geometry = new THREE.SphereGeometry(1, 64, 64);
      
      const createMeshWithMaterial = (material) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const effectiveScale = data.scale * SCALE_MULTIPLIER;
        mesh.scale.set(effectiveScale, effectiveScale, effectiveScale);
        // Place the planet on its orbit radius along +X so pivot rotation makes it orbit
        mesh.position.set(
          data.orbitRadius * ORBIT_MULTIPLIER,
          data.position[1],
          0
        );
        
        // Uranus sideways rotation
        if (name === 'uranus') {
          mesh.rotation.z = Math.PI / 2;
        }
        
        // Enhanced Saturn rings with better visuals
        if (name === 'saturn') {
          textureLoader.load(
            saturnRingTexturePath,
            (ringTexture) => {
              ringTexture.wrapS = THREE.ClampToEdgeWrapping;
              ringTexture.wrapT = THREE.ClampToEdgeWrapping;
              const ringGeometry = new THREE.RingGeometry(1.5, 3.0, 256);
              const ringMaterial = new THREE.MeshBasicMaterial({ 
                map: ringTexture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
              });
              const ring = new THREE.Mesh(ringGeometry, ringMaterial);
              ring.rotation.x = Math.PI / 2.2;
              ring.castShadow = true;
              ring.receiveShadow = true;
              mesh.add(ring);
              
              // Add inner ring
              const innerRingGeometry = new THREE.RingGeometry(1.2, 1.4, 128);
              const innerRingMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x887766,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.6
              });
              const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
              innerRing.rotation.x = Math.PI / 2.2;
              mesh.add(innerRing);
            },
            undefined,
            () => {
              // Fallback rings
              const ringGeometry = new THREE.RingGeometry(1.5, 3.0, 128);
              const ringMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xDDCCAA,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
              });
              const ring = new THREE.Mesh(ringGeometry, ringMaterial);
              ring.rotation.x = Math.PI / 2.2;
              mesh.add(ring);
            }
          );
        }
        
        // Add Uranus rings
        if (name === 'uranus') {
          textureLoader.load(
            uranusRingTexturePath,
            (ringTexture) => {
              ringTexture.wrapS = THREE.ClampToEdgeWrapping;
              ringTexture.wrapT = THREE.ClampToEdgeWrapping;
              const ringGeometry = new THREE.RingGeometry(1.3, 2.0, 128);
              const ringMaterial = new THREE.MeshBasicMaterial({ 
                map: ringTexture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
              });
              const ring = new THREE.Mesh(ringGeometry, ringMaterial);
              ring.rotation.x = Math.PI / 2;
              ring.rotation.z = Math.PI / 2; // Uranus rings are vertical
              mesh.add(ring);
            },
            undefined,
            () => {
              // Fallback Uranus rings
              const ringGeometry = new THREE.RingGeometry(1.3, 2.0, 64);
              const ringMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x4488aa,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.5
              });
              const ring = new THREE.Mesh(ringGeometry, ringMaterial);
              ring.rotation.x = Math.PI / 2;
              ring.rotation.z = Math.PI / 2;
              mesh.add(ring);
            }
          );
        }
        
        // Add atmosphere glow for Earth
        if (name === 'earth') {
          const atmosphereGeometry = new THREE.SphereGeometry(1.15, 32, 32);
          const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
          });
          const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
          mesh.add(atmosphere);
          
          // Add subtle cloud layer
          const cloudGeometry = new THREE.SphereGeometry(1.02, 32, 32);
          const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1
          });
          const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
          mesh.add(clouds);
          mesh.userData.clouds = clouds;
        }
        
        // Add glow effects for gas giants with planet-specific colors
        if (name === 'jupiter') {
          const glowGeometry = new THREE.SphereGeometry(1.08, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa66,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          mesh.add(glow);
        } else if (name === 'saturn') {
          const glowGeometry = new THREE.SphereGeometry(1.06, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffdd88,
            transparent: true,
            opacity: 0.06,
            side: THREE.BackSide
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          mesh.add(glow);
        } else if (name === 'uranus') {
          const glowGeometry = new THREE.SphereGeometry(1.05, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4488aa,
            transparent: true,
            opacity: 0.07,
            side: THREE.BackSide
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          mesh.add(glow);
        } else if (name === 'neptune') {
          const glowGeometry = new THREE.SphereGeometry(1.05, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x2266bb,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          mesh.add(glow);
        }
        
        // Add subtle glow for Mars (red planet effect)
        if (name === 'mars') {
          const glowGeometry = new THREE.SphereGeometry(1.03, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4422,
            transparent: true,
            opacity: 0.04,
            side: THREE.BackSide
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          mesh.add(glow);
        }

        // Add sun corona effect
        if (name === 'sun') {
          const coronaGeometry = new THREE.SphereGeometry(1.3, 32, 32);
          const coronaMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
          });
          const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
          mesh.add(corona);
          
          // Animated sun flares
          const flareGeometry = new THREE.SphereGeometry(1.5, 16, 16);
          const flareMaterial = new THREE.MeshBasicMaterial({
            color: 0xffdd00,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
          });
          const flare = new THREE.Mesh(flareGeometry, flareMaterial);
          mesh.add(flare);
          mesh.userData.flare = flare;
        }
        
        pivotGroup.add(mesh);
        
        planetsRef.current[name] = {
          model: mesh,
          pivot: pivotGroup,
          orbitAngle: 0,
          data
        };
        
        mesh.userData = { planetName: name };
        addPlanetLabel(name, mesh);
        
        loadedCount++;
        if (loadedCount === totalPlanets) {
          // Set up moon to orbit Earth while Earth orbits the sun
          if (planetsRef.current['moon'] && planetsRef.current['earth']) {
            const moonData = planetData['moon'];
            const moonPivot = planetsRef.current['moon'].pivot;
            const earthModel = planetsRef.current['earth'].model;
            
            // Remove moon from scene and add it to Earth's model
            scene.remove(moonPivot);
            earthModel.add(moonPivot);
            
            // Position moon at correct distance from Earth
            moonPivot.position.set(moonData.orbitRadius * ORBIT_MULTIPLIER, 0, 0);
            moonPivot.rotation.set(0, 0, 0);
          }
        }
      };
      
      const texturePath = data.texturePath;
      if (texturePath) {
        textureLoader.load(
          texturePath,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            // Enhanced materials with better lighting response
          let material;
          if (name === 'sun') {
            material = new THREE.MeshStandardMaterial({ 
              map: texture, 
              emissive: 0xFFAA00, 
              emissiveIntensity: 1.2,
              emissiveMap: texture,
              roughness: 0.1, 
              metalness: 0.0 
            });
          } else if (name === 'earth') {
            material = new THREE.MeshPhongMaterial({ 
              map: texture,
              specular: 0x444444,
              shininess: 15,
              bumpScale: 0.1
            });
          } else if (name === 'moon') {
            material = new THREE.MeshPhongMaterial({ 
              map: texture,
              specular: 0x222222,
              shininess: 5
            });
          } else if (name === 'mars') {
            material = new THREE.MeshPhongMaterial({ 
              map: texture,
              specular: 0x331111,
              shininess: 8
            });
          } else if (name === 'jupiter' || name === 'saturn') {
            material = new THREE.MeshPhongMaterial({ 
              map: texture,
              specular: 0x333333,
              shininess: 10
            });
          } else if (name === 'uranus' || name === 'neptune') {
            material = new THREE.MeshPhongMaterial({ 
              map: texture,
              specular: 0x224488,
              shininess: 12
            });
          } else {
            material = new THREE.MeshPhongMaterial({ 
              map: texture,
              specular: 0x222222,
              shininess: 15
            });
          }
            createMeshWithMaterial(material);
          },
          undefined,
          () => {
            const fallbackMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
            createMeshWithMaterial(fallbackMaterial);
          }
        );
      } else {
        let color = 0xFFFFFF;
        if (name === 'pluto') color = 0xBBAA99;
        const fallbackMaterial = new THREE.MeshPhongMaterial({ color });
        createMeshWithMaterial(fallbackMaterial);
      }
    });
  };
  
  // Add text label above each planet
  const addPlanetLabel = (name, planetModel) => {
    // Create canvas for the label
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    // Draw text on canvas
    context.fillStyle = '#FFFFFF';
    context.font = 'Bold 24px Arial';
    context.textAlign = 'center';
    context.fillText(name.toUpperCase(), 128, 32);
    
    // Convert canvas to texture
    const texture = new THREE.CanvasTexture(canvas);
    
    // Create sprite material with the texture
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      opacity: 0.8
    });
    
    // Create sprite and position it above the planet
    const sprite = new THREE.Sprite(spriteMaterial);
    const scaleFactor = planetData[name].scale * SCALE_MULTIPLIER;
    const labelScale = Math.max(1.5, 0.8 + scaleFactor * 0.6);
    sprite.scale.set(labelScale * 2, labelScale * 0.6, 1);
    sprite.position.set(0, 1.8 * scaleFactor, 0);
    
    // Add sprite to the planet model
    planetModel.add(sprite);
    
    // Store reference to label
    labelsRef.current[name] = sprite;
  };
  
  // Update label visibility
  const updateLabelsVisibility = () => {
    Object.values(labelsRef.current).forEach(label => {
      if (label) label.visible = showLabels;
    });
  };
  
  // Animation loop
  const animate = (time) => {
    animationFrameId.current = requestAnimationFrame(animate);
    
    // Update TWEEN animations
    TWEEN.update(time);
    
    // Update controls if enabled
    if (controlsRef.current && !followMode) {
      controlsRef.current.update();
    }
    
    // Skip planet animations if paused
    if (!isPaused) {
      // Update planet rotations and orbits with speed factor
      Object.entries(planetsRef.current).forEach(([name, planet]) => {
        if (planet.model && planet.data) {
          // Apply realistic rotation based on planet characteristics
          if (name === 'sun') {
            // Sun rotates on its axis with pulsing effect
            planet.model.rotation.y += planet.data.rotationSpeed * simulationSpeed;
            // Animate sun flare
            if (planet.model.userData.flare) {
              const scale = 1 + Math.sin(time * 0.001) * 0.1;
              planet.model.userData.flare.scale.set(scale, scale, scale);
              planet.model.userData.flare.material.opacity = 0.1 + Math.sin(time * 0.002) * 0.05;
            }
          } else if (name === 'earth') {
            // Earth rotates normally
            planet.model.rotation.y += planet.data.rotationSpeed * simulationSpeed;
            // Animate Earth's clouds
            if (planet.model.userData.clouds) {
              planet.model.userData.clouds.rotation.y += planet.data.rotationSpeed * simulationSpeed * 0.8;
            }
          } else if (name === 'uranus') {
            // Uranus rotates on its side (98 degree tilt)
            planet.model.rotation.z += planet.data.rotationSpeed * simulationSpeed;
          } else if (name === 'venus') {
            // Venus rotates backward (retrograde)
            planet.model.rotation.y -= Math.abs(planet.data.rotationSpeed) * simulationSpeed;
          } else {
            // Normal rotation for other planets
            planet.model.rotation.y += planet.data.rotationSpeed * simulationSpeed;
          }
          
          // Update orbit position - all planets revolve around the sun
          if (name !== 'sun') {
            planet.orbitAngle += planet.data.orbitSpeed * simulationSpeed;
            
            if (name === 'moon') {
              // Moon orbits Earth with wobble (Earth is already orbiting the sun)
              const wobble = Math.sin(planet.orbitAngle * 4) * 0.1;
              planet.pivot.rotation.y = planet.orbitAngle + wobble;
              planet.pivot.rotation.x = Math.sin(planet.orbitAngle * 2) * 0.05;
            } else {
              // All other planets orbit the sun directly
              planet.pivot.rotation.y = planet.orbitAngle;
            }
          }
        }
      });
      
      // Update rocket position
      if (rocketRef.current && rocketPathRef.current) {
        const rocket = rocketRef.current;
        const path = rocketPathRef.current;
        
        // Update orbit angle
        path.orbitAngle += path.orbitSpeed * simulationSpeed;
        
        // Calculate new position
        const x = Math.cos(path.orbitAngle) * path.orbitRadius;
        const z = Math.sin(path.orbitAngle) * path.orbitRadius;
        const y = path.orbitHeight;
        
        // Set position
        rocket.position.set(x, y, z);
        
        // Make rocket face direction of travel
        rocket.lookAt(
          Math.cos(path.orbitAngle + 0.1) * path.orbitRadius,
          y,
          Math.sin(path.orbitAngle + 0.1) * path.orbitRadius
        );
      }
    }
    
    // If in follow mode, update camera to follow selected planet
    if (followMode && selectedPlanet && cameraRef.current && planetsRef.current[selectedPlanet]) {
      const planet = planetsRef.current[selectedPlanet];
      const planetWorldPosition = new THREE.Vector3();
      
      // Get world position of planet
      planet.model.getWorldPosition(planetWorldPosition);
      
      // Update camera position
      const cameraOffset = new THREE.Vector3(0, 2, 5);
      cameraOffset.applyQuaternion(cameraRef.current.quaternion);
      
      cameraRef.current.position.copy(planetWorldPosition).add(cameraOffset);
      cameraRef.current.lookAt(planetWorldPosition);
    }
    
    // Render scene
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };
  
  // Enhanced zoom function with speech synthesis
  const zoomToPlanet = (planetName) => {
    if (!planetsRef.current[planetName] || !cameraRef.current) return;
    
    // Always turn off follow mode first to prevent camera lock
    setFollowMode(false);
    
    // Set selected planet
    setSelectedPlanet(planetName);
    setShowInfo(true);
    
    // Speak planet information
    const planetInfo = planetData[planetName];
    if (planetInfo && speechEnabled) {
      const introText = `${planetName.charAt(0).toUpperCase() + planetName.slice(1)}. ${planetInfo.kidFriendlyDesc}`;
      speakText(introText);
    }
    
    // Get planet world position
    const planet = planetsRef.current[planetName];
    const planetWorldPosition = new THREE.Vector3();
    planet.model.getWorldPosition(planetWorldPosition);
    
    // Calculate zoom distance based on planet size and realistic scaling
    const planetSize = planetData[planetName].scale * SCALE_MULTIPLIER;
    const zoomDistance = Math.max(planetSize * 6 + 2, 1.5); // Increased multiplier for better viewing
    
    // Reset controls to ensure they're working properly
    setupOrbitControls();
    
    // Set control target to planet
    if (controlsRef.current) {
      controlsRef.current.target.copy(planetWorldPosition);
      controlsRef.current.update();
    }
    
    // Create camera position animation
    const startPosition = cameraRef.current.position.clone();
    
    // Get normalized direction vector
    const direction = new THREE.Vector3();
    direction.subVectors(startPosition, planetWorldPosition).normalize();
    
    // Create target position: planet position + offset in direction
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(planetWorldPosition).add(
      direction.multiplyScalar(zoomDistance)
    );
    
    // Add slight vertical offset for better view
    targetPosition.y += planetSize * 0.7;
    
    // Animate camera move
    const duration = 1200;
    
    new TWEEN.Tween(startPosition)
      .to(targetPosition, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        // Update camera position during animation
        cameraRef.current.position.copy(startPosition);
        // Ensure controls are updated
        if (controlsRef.current) controlsRef.current.update();
      })
      .onComplete(() => {
        // Make sure controls are enabled and updated at the end
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
          controlsRef.current.update();
        }
      })
      .start();
    
    // Update rocket path
    if (rocketPathRef.current && planetName !== 'sun') {
      rocketPathRef.current.orbit = planetName;
      rocketPathRef.current.orbitRadius = planetData[planetName].orbitRadius;
      rocketPathRef.current.orbitSpeed = planetData[planetName].orbitSpeed * 2;
    }
  };
  
  // Reset camera with improved reliability
  const resetCamera = () => {
    // Turn off follow mode
    setFollowMode(false);
    setShowInfo(false);
    
    // Reset orbit controls
    setupOrbitControls();
    
    // Animate camera back to original position
    const startPosition = cameraRef.current.position.clone();
    const targetPosition = new THREE.Vector3(0, 20, 45);
    const duration = 1200;
    
    new TWEEN.Tween(startPosition)
      .to(targetPosition, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        cameraRef.current.position.copy(startPosition);
        cameraRef.current.lookAt(0, 0, 0);
        if (controlsRef.current) controlsRef.current.update();
      })
      .onComplete(() => {
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }
        setViewMode("overview");
      })
      .start();
  };
  
  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    } else if (e.touches.length === 2) {
      // Pinch zoom start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };
  
  const handleTouchMove = (e) => {
    e.preventDefault();
    
    if (e.touches.length === 2 && lastTouchDistanceRef.current && cameraRef.current) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const delta = distance - lastTouchDistanceRef.current;
      
      // Zoom camera
      const zoomSpeed = 0.01;
      const newDistance = cameraRef.current.position.length() * (1 - delta * zoomSpeed);
      const clampedDistance = Math.max(5, Math.min(80, newDistance));
      
      cameraRef.current.position.normalize().multiplyScalar(clampedDistance);
      if (controlsRef.current) controlsRef.current.update();
      
      lastTouchDistanceRef.current = distance;
    }
  };
  
  const handleTouchEnd = (e) => {
    if (touchStartRef.current && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;
      
      // Check if it's a tap (not a swipe)
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 300) {
        // Handle as planet click
        handlePlanetClick(touch);
      }
    }
    
    touchStartRef.current = null;
    lastTouchDistanceRef.current = null;
  };
  
  // Handle planet click (works for both mouse and touch)
  const handlePlanetClick = (e) => {
    e.preventDefault?.();
    
    if (!cameraRef.current || !sceneRef.current || !rendererRef.current) return;
    
    // Always disable follow mode when clicking
    setFollowMode(false);
    
    // Get position (handle both mouse and touch events)
    const rect = canvasRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    
    if (e.clientX !== undefined) {
      // Mouse event
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    } else if (e.pageX !== undefined) {
      // Touch event
      mouse.x = ((e.pageX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.pageY - rect.top) / rect.height) * 2 + 1;
    }
    
    // Raycasting
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    // Find planets by checking the entire scene
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    
    if (intersects.length > 0) {
      // Find the clicked planet by traversing up through parent objects
      let planetName = null;
      let currentObject = intersects[0].object;
      
      // Loop up through parents to find an object with planetName
      while (currentObject && !planetName) {
        if (currentObject.userData && currentObject.userData.planetName) {
          planetName = currentObject.userData.planetName;
        }
        currentObject = currentObject.parent;
      }
      
      // If we found a planet, zoom to it
      if (planetName) {
        console.log(`Clicked on planet: ${planetName}`);
        zoomToPlanet(planetName);
      }
    }
  };
  
  // Change view mode
  const changeViewMode = (mode) => {
    setViewMode(mode);
    
    if (!cameraRef.current) return;
    
    switch(mode) {
      case "overview":
        // Reset to overview position
        cameraRef.current.position.set(0, 15, 30);
        cameraRef.current.lookAt(0, 0, 0);
        setFollowMode(false);
        break;
      case "topDown":
        // Top-down view
        cameraRef.current.position.set(0, 40, 0);
        cameraRef.current.lookAt(0, 0, 0);
        setFollowMode(false);
        break;
      case "planetView":
        // Go to selected planet view
        if (selectedPlanet && planetsRef.current[selectedPlanet]) {
          const planet = planetsRef.current[selectedPlanet];
          const planetWorldPosition = new THREE.Vector3();
          planet.model.getWorldPosition(planetWorldPosition);
          
          // Position camera near planet
          cameraRef.current.position.set(
            planetWorldPosition.x,
            planetWorldPosition.y + 2,
            planetWorldPosition.z + 5
          );
          cameraRef.current.lookAt(planetWorldPosition);
          setFollowMode(true);
        }
        break;
    }
  };
  
  // Toggle follow mode with safety checks
  const toggleFollowMode = () => {
    // Only enable follow mode if a planet is selected
    if (!followMode && selectedPlanet && planetsRef.current[selectedPlanet]) {
      setFollowMode(true);
      
      // Set control target to the planet
      const planet = planetsRef.current[selectedPlanet];
      const planetWorldPosition = new THREE.Vector3();
      planet.model.getWorldPosition(planetWorldPosition);
      
      if (controlsRef.current) {
        controlsRef.current.target.copy(planetWorldPosition);
      }
    } else {
      // When disabling follow mode, keep current camera position
      setFollowMode(false);
    }
  };
  
  // Toggle audio
  const toggleAudio = () => {
    setAudioPlaying(!audioPlaying);
  };

  // Speech synthesis function
  const speakText = (text) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Try to use a more natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Natural') || 
      voice.name.includes('Enhanced') ||
      voice.lang.startsWith('en-')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Toggle speech synthesis
  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled);
    if (speechEnabled) {
      window.speechSynthesis.cancel();
    }
  };
  
  // Clean up Three.js resources
  const disposeScene = () => {
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
    
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
  };
  
  // Planet info component
  const PlanetInfo = ({ planet }) => {
    if (!planet || !planetData[planet]) return null;
    
    const data = planetData[planet];
    const [infoTab, setInfoTab] = useState('description'); // 'description' or 'kid-friendly'
    
    return (
      <div className="planet-info absolute top-1/2 right-4 transform -translate-y-1/2 p-6 rounded-lg max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="planet-title text-xl font-bold">{planet.charAt(0).toUpperCase() + planet.slice(1)}</h2>
          <button 
            className="close-button text-gray-500 hover:text-gray-700"
            onClick={() => setShowInfo(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <button 
            className={`space-button px-3 py-1 rounded text-sm ${infoTab === 'description' ? 'blue-button' : 'purple-button'}`}
            onClick={() => setInfoTab('description')}
          >
            <FaBook className="button-icon" /> Scientific
          </button>
          <button 
            className={`space-button px-3 py-1 rounded text-sm ${infoTab === 'kid-friendly' ? 'blue-button' : 'purple-button'}`}
            onClick={() => setInfoTab('kid-friendly')}
          >
            <MdSchool className="button-icon" /> Kid-Friendly
          </button>
          <button 
            className="space-button blue-button px-3 py-1 rounded text-sm"
            onClick={() => {
              const text = infoTab === 'description' ? data.description : data.kidFriendlyDesc;
              speakText(text);
            }}
          >
            <FaVolumeUp className="button-icon" /> Speak
          </button>
        </div>
        
        <div className="planet-description mb-4 max-h-48 overflow-y-auto">
          {infoTab === 'description' ? (
            <p className="text-sm leading-relaxed">{data.description}</p>
          ) : (
            <p className="text-sm leading-relaxed">{data.kidFriendlyDesc}</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button 
            className="space-button blue-button control-text-sm flex-1"
            onClick={() => setShowInfo(false)}
          >
            <FaEyeSlash className="button-icon" /> Hide Info
          </button>
          <button 
            className="space-button purple-button control-text-sm flex-1"
            onClick={resetCamera}
          >
            <FaHome className="button-icon" /> Reset View
          </button>
        </div>
        
        {/* Navigation arrows */}
        <div className="flex justify-between mt-3">
          <button 
            className="nav-button space-button purple-button"
            onClick={() => navigatePlanet('prev')}
          >
            ← Previous
          </button>
          <button 
            className="nav-button space-button purple-button"
            onClick={() => navigatePlanet('next')}
          >
            Next →
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="solar-system-container relative w-full h-screen" ref={containerRef}>
      {/* Canvas for Three.js */}
      <canvas 
        ref={canvasRef} 
        className="canvas-full" 
        onClick={handlePlanetClick}
        style={{ touchAction: 'none' }}
      />
      
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          className="mobile-menu-toggle fixed top-4 right-4 z-50 space-button blue-button p-3"
          onClick={() => setShowMobileControls(!showMobileControls)}
        >
          <FaSlidersH className="text-xl" />
        </button>
      )}
      
      {/* Header with main controls */}
      <div className={`header-controls absolute top-4 left-4 right-4 flex justify-between items-center z-10 ${isMobile ? 'hidden' : ''}`}>
        <div className="flex items-center space-x-4">
          <button 
            className="space-button blue-button px-4 py-2"
            onClick={() => setShowTutorial(true)}
          >
            <FaInfo className="button-icon" /> {!isMobile && 'Tutorial'}
          </button>
          <button 
            className="space-button purple-button px-4 py-2"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <FaCompress className="button-icon" /> : <FaExpand className="button-icon" />}
            {!isMobile && (isFullscreen ? 'Exit Fullscreen' : 'Fullscreen')}
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className={`space-button ${isPaused ? 'blue-button' : 'purple-button'} px-4 py-2`}
            onClick={togglePause}
          >
            {isPaused ? <FaPlay className="button-icon" /> : <FaPause className="button-icon" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <button 
            className={`space-button ${audioPlaying ? 'blue-button' : 'purple-button'} px-4 py-2`}
            onClick={toggleAudio}
          >
            {audioPlaying ? <FaVolumeMute className="button-icon" /> : <FaVolumeUp className="button-icon" />}
            {audioPlaying ? 'Mute' : 'Music'}
          </button>
          
          <button 
            className={`space-button ${speechEnabled ? 'blue-button' : 'purple-button'} px-4 py-2`}
            onClick={toggleSpeech}
          >
            {speechEnabled ? <FaVolumeUp className="button-icon" /> : <FaVolumeMute className="button-icon" />}
            {speechEnabled ? 'Speech On' : 'Speech Off'}
          </button>
        </div>
      </div>
      
      {/* Quick Planet Navigation - Mobile Optimized */}
      {(!isMobile || showMobileControls) && (
        <div className={`planet-nav absolute ${isMobile ? 'top-16' : 'top-20'} left-4 z-10 ${isMobile && showMobileControls ? 'mobile-panel' : ''}`}>
          <div className="control-panel-title mb-2">Quick Navigation</div>
          <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
            {planetOrder.slice(0, 6).map(planet => (
              <button
                key={planet}
                className={`space-button text-xs px-2 py-1 ${selectedPlanet === planet ? 'blue-button' : 'purple-button'}`}
                onClick={() => selectPlanet(planet)}
              >
                {planet.charAt(0).toUpperCase() + planet.slice(1)}
              </button>
            ))}
          </div>
          {planetOrder.length > 6 && (
            <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mt-2`}>
              {planetOrder.slice(6).map(planet => (
                <button
                  key={planet}
                  className={`space-button text-xs px-2 py-1 ${selectedPlanet === planet ? 'blue-button' : 'purple-button'}`}
                  onClick={() => selectPlanet(planet)}
                >
                  {planet.charAt(0).toUpperCase() + planet.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Main Controls Panel - Hidden on mobile unless menu is open */}
      {(!isMobile || showMobileControls) && (
      <div className={`control-panel ${isMobile ? 'mobile-control-panel' : ''}`}>
        <div className="control-panel-title">🚀 Solar System Controls</div>
        
        {/* View modes */}
        <div className="control-flex-col">
          <div className="control-panel-title text-sm">Views</div>
          <button 
            className={`space-button ${viewMode === 'overview' ? 'blue-button' : 'purple-button'}`}
            onClick={() => changeViewMode('overview')}
          >
            <FaStar className="button-icon" /> Overview
          </button>
          <button 
            className={`space-button ${viewMode === 'topDown' ? 'blue-button' : 'purple-button'}`}
            onClick={() => changeViewMode('topDown')}
          >
            <MdZoomOut className="button-icon" /> Top Down
          </button>
          <button 
            className="space-button blue-button"
            onClick={resetCamera}
          >
            <FaHome className="button-icon" /> Reset View
          </button>
        </div>
        
        {/* Simulation controls */}
        <div className="control-flex-col">
          <div className="control-items-center control-panel-title text-sm">
            <MdSpeed className="button-icon" /> Speed: {simulationSpeed.toFixed(1)}x
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1" 
            value={simulationSpeed} 
            onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
            className="control-range"
          />
        </div>
        
        {/* Display options */}
        <div className="control-flex-col">
          <div className="control-panel-title text-sm">Display</div>
          <button 
            className={`space-button ${showLabels ? 'blue-button' : 'purple-button'}`}
            onClick={() => setShowLabels(!showLabels)}
          >
            <FaEye className="button-icon" /> {showLabels ? 'Hide Labels' : 'Show Labels'}
          </button>
          
          <button 
            className={`space-button ${showOrbitLines ? 'blue-button' : 'purple-button'}`}
            onClick={() => setShowOrbitLines(!showOrbitLines)}
          >
            <IoPlanetOutline className="button-icon" /> {showOrbitLines ? 'Hide Orbits' : 'Show Orbits'}
          </button>
          
          <button 
            className={`space-button ${autoRotate ? 'blue-button' : 'purple-button'}`}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            <MdAutoMode className="button-icon" /> {autoRotate ? 'Stop Auto-Rotate' : 'Auto-Rotate'}
          </button>
        </div>
        
        {/* Planet controls */}
        <div className="control-flex-col">
          <div className="control-panel-title text-sm">Planet Controls</div>
          <button 
            className={`space-button ${followMode ? 'blue-button' : 'purple-button'}`}
            onClick={toggleFollowMode}
            disabled={!selectedPlanet}
          >
            <FaRocket className="button-icon" /> {followMode ? 'Stop Following' : 'Follow Planet'}
          </button>
          
          <button 
            className={`space-button ${showInfo ? 'blue-button' : 'purple-button'} ${!selectedPlanet ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => selectedPlanet && setShowInfo(!showInfo)}
            disabled={!selectedPlanet}
          >
            <FaInfo className="button-icon" /> {showInfo ? 'Hide Info' : 'Show Info'}
          </button>
        </div>
      </div>
      )}
      
      {/* Selected planet info panel */}
      {showInfo && selectedPlanet && (
        <PlanetInfo planet={selectedPlanet} />
      )}
      
      {/* Enhanced Rocket controls - Mobile optimized */}
      {(!isMobile || showMobileControls) && (
      <div className={`rocket-controls absolute ${isMobile ? 'bottom-20' : 'bottom-4'} right-4 p-4 rounded-lg`}>
        <div className="control-panel-title mb-3">🚀 Rocket Controls</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button 
            className="space-button blue-button px-3 py-2 text-sm"
            onClick={() => {
              if (rocketPathRef.current) {
                rocketPathRef.current.orbitHeight += 0.5;
              }
            }}
          >
            ↑ Ascend
          </button>
          <button 
            className="space-button purple-button px-3 py-2 text-sm"
            onClick={() => {
              if (rocketPathRef.current) {
                rocketPathRef.current.orbitHeight -= 0.5;
              }
            }}
          >
            ↓ Descend
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button 
            className="space-button blue-button px-3 py-2 text-sm"
            onClick={() => {
              if (rocketPathRef.current) {
                rocketPathRef.current.orbitSpeed *= 1.2;
              }
            }}
          >
            ⚡ Speed Up
          </button>
          <button 
            className="space-button purple-button px-3 py-2 text-sm"
            onClick={() => {
              if (rocketPathRef.current) {
                rocketPathRef.current.orbitSpeed *= 0.8;
              }
            }}
          >
            🐌 Slow Down
          </button>
        </div>
      </div>
      )}
      
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="tutorial-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="tutorial-modal bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {tutorialSteps[tutorialStep].title}
              </h3>
              <button 
                className="close-button text-gray-500 hover:text-gray-700"
                onClick={skipTutorial}
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              {tutorialSteps[tutorialStep].content}
            </p>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button 
                  className="space-button purple-button px-3 py-1"
                  onClick={prevTutorialStep}
                  disabled={tutorialStep === 0}
                >
                  ← Previous
                </button>
                <button 
                  className="space-button blue-button px-3 py-1"
                  onClick={nextTutorialStep}
                >
                  {tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next →'}
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                {tutorialStep + 1} of {tutorialSteps.length}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Status Bar */}
      <div className="status-bar absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
        {selectedPlanet ? (
          <span>📍 Viewing: <strong>{selectedPlanet.charAt(0).toUpperCase() + selectedPlanet.slice(1)}</strong></span>
        ) : (
          <span>🌟 Solar System Overview</span>
        )}
        {isPaused && <span className="ml-4">⏸️ Paused</span>}
        {followMode && <span className="ml-4">🔄 Following Planet</span>}
      </div>
    </div>
  );
};

// Export as default to prevent duplicate imports
export default SolarSystemSandbox;