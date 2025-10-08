import React, { useState, useEffect } from "react";
import "../styles/stars.css";
import { useNavigate } from "react-router-dom";

const Stars = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStar, setSelectedStar] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate();

  // Ensure we access speech synthesis safely
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  // Reset body styles when component mounts (when navigating back from AR scenes)
  useEffect(() => {
    // Reset body overflow and other styles that might be set by AR components
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    
    // Remove any AR-related classes that might interfere with scrolling
    document.body.classList.remove('ar-active');
    document.documentElement.classList.remove('ar-active');
    
    // Ensure the page can scroll properly
    window.scrollTo(0, 0);
    
    console.log('Stars page: Body styles reset for proper scrolling');
  }, []);

  const starsData = [
    {
      id: "big-dipper",
      name: "Big Dipper",
      model: "/models/Stars/big-dipper.glb",
      description:
        'The Big Dipper is a prominent star pattern in the night sky, known for its distinctive ladle shape. It is part of the Ursa Major constellation and serves as a helpful guide for stargazers, as its "pointer" stars lead directly to the North Star, Polaris. The Big Dipper is not a constellation itself but an asterism—a recognizable pattern formed by stars that are part of a larger constellation.',
      subtitle: "North Star, Polaris.",
      color: "#3498db"
    },
    {
      id: "small-dipper",
      name: "Small Dipper",
      model: "/models/Stars/small-dipper.glb",
      description:
        "The Small Dipper, also known as the Little Dipper, is an asterism in the constellation Ursa Minor. Its handle is formed by stars leading to Polaris, the North Star, which is the end of its handle. Unlike the Big Dipper, the stars of the Small Dipper are fainter and can be more difficult to see in light-polluted areas.",
      subtitle: "Contains Polaris, the North Star.",
      color: "#2980b9"
    },
    { 
      id: "orion", 
      name: "Orion", 
      model: "/models/Stars/orion.glb",
      description: "Orion is one of the most recognizable constellations in the night sky, named after a hunter in Greek mythology. Its distinctive pattern includes bright stars forming the figure of a man with a belt and sword. Orion contains two of the ten brightest stars in the sky: Rigel and Betelgeuse, as well as the famous Orion Nebula.",
      subtitle: "The Hunter.",
      color: "#e74c3c" 
    },
    { 
      id: "cancer", 
      name: "Cancer", 
      model: "/models/Stars/cancer.glb",
      description: "Cancer is one of the twelve zodiac constellations. It represents a crab in Greek mythology, sent by the goddess Hera to distract Heracles during his fight with the Hydra. Cancer is relatively faint compared to other zodiac constellations, with its brightest star being Al Tarf (Beta Cancri).",
      subtitle: "The Crab.",
      color: "#9b59b6" 
    },
    { 
      id: "leo", 
      name: "Leo", 
      model: "/models/Stars/leo.glb",
      description: "Leo is one of the zodiac constellations, representing a lion. It contains many bright stars, including Regulus, one of the brightest stars in the night sky. The constellation forms a distinctive pattern that resembles a crouching lion.",
      subtitle: "The Lion.",
      color: "#f39c12" 
    },
    { 
      id: "taurus", 
      name: "Taurus", 
      model: "/models/Stars/taurus.glb",
      description: "Taurus is one of the zodiac constellations, representing the bull in Greek mythology. Its brightest star is Aldebaran, which forms the 'eye' of the bull. The constellation is also home to the Pleiades and Hyades star clusters, which are prominent features in the night sky.",
      subtitle: "The Bull.",
      color: "#e67e22" 
    },
    { 
      id: "libra", 
      name: "Libra", 
      model: "/models/Stars/libra.glb",
      description: "Libra is a zodiac constellation representing the scales of justice. It is one of the faintest constellations in the sky and is often associated with balance and harmony. Its brightest stars are Zubeneschamali and Zubenelgenubi.",
      subtitle: "The Scales.",
      color: "#9b59b6" 
    },
    { 
      id: "virgo", 
      name: "Virgo", 
      model: "/models/Stars/virgo.glb",
      description: "Virgo is the largest zodiac constellation and represents the maiden in Greek mythology. Its brightest star is Spica, which is one of the brightest stars in the night sky. Virgo is also home to the Virgo Cluster, a large group of galaxies.",
      subtitle: "The Maiden.",
      color: "#2ecc71" 
    }
  ];

  // Function to handle text-to-speech
  const speakText = (text) => {
    if (!synth) return; // Safety check

    if (synth.speaking) {
      // Cancel current speech if speaking
      synth.cancel();
      setIsSpeaking(false);
    }

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1; // Speech speed
    utterance.pitch = 1.2; // Higher pitch for "happier" tone

    // Get available voices
    const voices = synth.getVoices();

    // Look for the "Microsoft Zira" voice
    const ziraVoice = voices.find((voice) => voice.name === "Microsoft Zira");

    if (ziraVoice) {
      utterance.voice = ziraVoice; // Set voice to "Microsoft Zira"
    } else {
      console.warn("Microsoft Zira voice not found. Using default voice.");
    }

    // Set onend event handler
    utterance.onend = () => {
      setIsSpeaking(false);
    };

    // Start speaking
    setIsSpeaking(true);
    synth.speak(utterance);
  };

  const handleStarClick = (star) => {
    if (synth && synth.speaking) {
      synth.cancel(); // Cancel current speech
      setIsSpeaking(false);
    }
    setSelectedStar(star);
  };

  const handleBack = () => {
    if (synth && synth.speaking) {
      synth.cancel(); // Cancel current speech
      setIsSpeaking(false);
    }
    setSelectedStar(null);
  };

  const handleSpeak = () => {
    if (selectedStar) {
      if (isSpeaking) {
        // If speaking, stop
        synth.cancel();
        setIsSpeaking(false);
      } else {
        // Start speaking
        speakText(selectedStar.description);
      }
    }
  };


  // Function to handle AR View button click - Navigate to specific constellation AR page
  const handleARView = () => {
    if (selectedStar) {
      // Map star IDs to constellation routes
      const constellationRoutes = {
        'big-dipper': '/constellations/big-dipper',
        'small-dipper': '/constellations/small-dipper',
        'orion': '/constellations/orion',
        'cancer': '/constellations/cancer',
        'leo': '/constellations/leo',
        'taurus': '/constellations/taurus',
        'libra': '/constellations/libra',
        'virgo': '/constellations/virgo'
      };
      
      const route = constellationRoutes[selectedStar.id];
      if (route) {
        navigate(route);
      } else {
        console.warn(`No AR route found for constellation: ${selectedStar.id}`);
      }
    }
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (synth && synth.speaking) {
        synth.cancel(); // Cancel speech when leaving component
      }
    };
  }, [synth]);

  if (selectedStar) {
    return (
      <div className="star-detail-container">
        <button className="back-button" onClick={handleBack} aria-label="Go back">
          <svg viewBox="0 0 24 24" width="20" height="20" className="back-icon">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor" />
          </svg>
          <span>Back</span>
        </button>

        <div className="star-detail-content">
          <div className="star-detail-model">
            <model-viewer
              src={selectedStar.model}
              camera-controls
              auto-rotate
              shadow-intensity="1"
              environment-image="neutral"
              exposure="0.8"
              camera-orbit="0deg 75deg auto"
              min-camera-orbit="auto auto auto"
              max-camera-orbit="auto auto auto"
              loading="eager"
              alt={`3D model of ${selectedStar.name} constellation`}
            ></model-viewer>
            <button className="ar-button" aria-label="View in AR" onClick={handleARView}>
              <span>AR View</span>
            </button>
          </div>

          <div className="star-detail-info" style={{ borderColor: selectedStar.color }}>
            <div className="star-detail-header" style={{ backgroundColor: selectedStar.color }}>
              <h1 className="star-detail-title">{selectedStar.name}</h1>
              <p className="star-detail-subtitle">{selectedStar.subtitle}</p>
            </div>
            <div className="star-detail-body">
              <p className="star-detail-description">{selectedStar.description}</p>

              <button 
                className={`play-button ${isSpeaking ? 'speaking' : ''}`}
                aria-label="Play text-to-speech" 
                onClick={handleSpeak}
              >
                {isSpeaking ? (
                  <>
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path d="M6 6h12v12H6z" fill="currentColor" />
                    </svg>
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                    <span>Listen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stars-container">
      <div className="stars-header">
        <svg viewBox="0 0 24 24" width="70" height="70" className="rocket-icon">
          <path d="M12 2C9 2 6.5 4 6.5 7L5 13l-2 2 3 1 1 3 2-2 6 .5c3 0 5-2.5 5-5.5C20 9 17 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" fill="#FFD700"/>
        </svg>
        <h1 className="stars-title">STARS</h1>
        <svg viewBox="0 0 24 24" width="70" height="70" className="astronaut-icon">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#FFD700"/>
        </svg>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for a constellation..."
            aria-label="Search stars"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button aria-label="Search">
            <svg viewBox="0 0 24 24" width="28" height="28" className="search-icon">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#333" />
            </svg>
          </button>
        </div>
      </div>

      {/* Star Constellations Grid */}
      <div className="stars-grid">
        {starsData
          .filter((star) => star.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((star) => (
            <div key={star.id} className="star-box" onClick={() => handleStarClick(star)}>
              <div className="star-model-container">
                <model-viewer
                  src={star.model}
                  camera-controls
                  auto-rotate
                  rotation-per-second="30deg"
                  environment-image="neutral"
                  exposure="0.8"
                  shadow-intensity="0"
                  ar="false"
                  camera-orbit="0deg 75deg auto"
                  min-camera-orbit="auto auto auto"
                  max-camera-orbit="auto auto auto"
                  loading="lazy"
                  interaction-prompt="none"
                  alt={`3D model of ${star.name} constellation`}
                ></model-viewer>
              </div>
              <p className="star-name">{star.name}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Stars;