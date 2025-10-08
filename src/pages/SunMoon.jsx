import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/planets-kids.css";

const synth = window.speechSynthesis;
let currentUtterance = null;

const speakText = (text) => {
  if (synth.speaking) {
    synth.cancel();
    return;
  }

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = "en-US";
  currentUtterance.rate = 0.9;
  currentUtterance.pitch = 1.1;

  synth.speak(currentUtterance);
};

const celestialBodies = [
  {
    id: "sun",
    name: "Sun",
    model: "/models/sun.glb",
    description: "The Sun is a giant ball of hot gas that gives us light and warmth! It's so big that more than 1 million Earths could fit inside it. The Sun is the center of our solar system, and all the planets orbit around it. Without the Sun, there would be no life on Earth!",
    subtitle: "Our Bright Star",
    color: "#FFD700",
    emoji: "☀️"
  },
  {
    id: "moon",
    name: "Moon",
    model: "/models/moon.glb",
    description: "The Moon is Earth's only natural satellite and our closest neighbor in space! It doesn't make its own light - it reflects light from the Sun. The Moon goes through phases as it orbits Earth, from new moon to full moon. It also causes the ocean tides on Earth!",
    subtitle: "Earth's Companion",
    color: "#C0C0C0",
    emoji: "🌙"
  }
];

const SunMoon = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBody, setSelectedBody] = useState(null);
  const modelViewerRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate();

  const handleBodyClick = (body) => {
    synth.cancel();
    setIsSpeaking(false);
    setSelectedBody(body);
  };

  const handleBack = () => {
    synth.cancel();
    setIsSpeaking(false);
    setSelectedBody(null);
  };

  const handleSpeech = () => {
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(selectedBody.description);
      
      currentUtterance.onend = () => {
        setIsSpeaking(false);
      };
    }
  };

  // Navigate to AR Scene
  const handleARView = () => {
    navigate('/ar-scene');
  };

  if (selectedBody) {
    return (
      <div className="planet-detail-container-xx" style={{backgroundColor: `${selectedBody.color}22`}}>
        <button className="back-button-xx" onClick={handleBack} aria-label="Go back">
          <img src="/images/back-arrow.svg" alt="Back" className="back-icon-xx" />
          <span>Back to Sun & Moon</span>
        </button>

        <div className="planet-detail-content-xx">
          <div className="planet-detail-model-xx">
            <model-viewer
              ref={modelViewerRef}
              src={selectedBody.model}
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="auto"
              camera-controls
              auto-rotate
              shadow-intensity={selectedBody.id === 'sun' ? '0' : '1'}
              environment-image={selectedBody.id === 'sun' ? 'legacy' : 'neutral'}
              exposure={selectedBody.id === 'sun' ? '1.5' : '0.8'}
              tone-mapping={selectedBody.id === 'sun' ? 'aces' : 'neutral'}
              camera-orbit="0deg 75deg auto"
              min-camera-orbit="auto auto auto"
              max-camera-orbit="auto auto auto"
              loading="eager"
              alt={`3D model of ${selectedBody.name}`}
            ></model-viewer>

            <button 
              className="ar-button-xx"
              aria-label="View in AR"
              onClick={handleARView}
            >
              <img src="/images/ar-icon.svg" alt="AR" />
              <span>AR MODE</span>
            </button>
          </div>

          <div className="planet-detail-info-xx" style={{borderColor: selectedBody.color}}>
            <div className="planet-detail-header-xx">
              <h1 className="planet-detail-title-xx">
                <span className="body-emoji">{selectedBody.emoji}</span>
                {selectedBody.name}
              </h1>
              <p className="planet-detail-subtitle-xx">{selectedBody.subtitle}</p>
            </div>
            
            <div className="planet-detail-body-xx">
              <p className="planet-detail-description-xx">{selectedBody.description}</p>

              <button 
                className={`play-button-xx ${isSpeaking ? 'speaking-xx' : ''}`}
                aria-label={isSpeaking ? "Stop speaking" : "Listen to facts"} 
                onClick={handleSpeech}
              >
                {isSpeaking ? (
                  <>
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <span>Listen!</span>
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
    <div className="planets-container-xx">
      <div className="planets-header-xx">
        <div className="sun-moon-header-icons">
          <span className="header-emoji sun-emoji">☀️</span>
          <img src="/images/rocket.svg" alt="Rocket" className="rocket-icon-xx" />
        </div>
        <h1 className="planets-title-xx">SUN & MOON!</h1>
        <div className="sun-moon-header-icons">
          <img src="/images/astronaut.svg" alt="Astronaut" className="astronaut-icon-xx" />
          <span className="header-emoji moon-emoji">🌙</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container-xx">
        <div className="search-bar-xx">
          <input
            type="text"
            placeholder="Search Sun or Moon..."
            aria-label="Search celestial bodies"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button aria-label="Search">
            <img src="/images/search-icon.svg" alt="Search" className="search-icon-xx" />
          </button>
        </div>
      </div>

      {/* Bodies Grid */}
      <div className="planets-grid-xx">
        {celestialBodies
          .filter((body) => body.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((body) => (
            <div 
              key={body.id} 
              className="planet-card-xx sun-moon-card" 
              onClick={() => handleBodyClick(body)}
              style={{borderColor: body.color}}
            >
              <div className="planet-model-container-xx">
                <model-viewer
                  src={body.model}
                  camera-controls
                  auto-rotate
                  rotation-per-second="30deg"
                  environment-image={body.id === 'sun' ? 'legacy' : 'neutral'}
                  exposure={body.id === 'sun' ? '1.5' : '0.8'}
                  tone-mapping={body.id === 'sun' ? 'aces' : 'neutral'}
                  shadow-intensity="0"
                  ar="false"
                  camera-orbit="0deg 75deg auto"
                  min-camera-orbit="auto auto auto"
                  max-camera-orbit="auto auto auto"
                  loading="lazy"
                  interaction-prompt="none"
                  alt={`3D model of ${body.name}`}
                ></model-viewer>
              </div>
              <div className="planet-name-banner-xx">
                <p className="planet-name-xx">
                  <span className="body-emoji-small">{body.emoji}</span>
                  {body.name}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SunMoon;
