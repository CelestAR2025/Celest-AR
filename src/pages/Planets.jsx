import React, { useState, useRef, useEffect } from "react";
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

const Planets = () => {
  const navigate = useNavigate();

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
    
    console.log('Planets page: Body styles reset for proper scrolling');
  }, []);

  const planetsData = [
  {
    id: "mercury",
    name: "Mercury",
    model: "/models/mercury.glb",
    description: "Mercury is the nearest planet to the Sun. It has an average distance of 58 million km from the Sun and an equatorial diameter of 4,880 km. It takes 88 Earth days for Mercury to complete its revolution and 59 Earth days to complete its rotation. Mercury has a very thin atmosphere and has a surface temperature of up to 430°C during daytime and –180°C during nighttime. Its surface is full of craters, much like the Earth's moon. Mercury has no moon or ring around it.",
    subtitle: "The Swift Planet - Terrestrial",
    color: "#8B4513" // Brown for terrestrial planet
  },
  {
    id: "venus",
    name: "Venus",
    model: "/models/venus.glb",
    description: "Venus has almost the same size and density as the Earth. It is the second closest planet to the Sun and has an average distance of 108 million km from it. Venus is a rocky planet and has an equatorial diameter of 12,104 km. It has mountains, craters, and volcanoes on its surface. Its atmosphere is made up mostly of carbon dioxide which has a surface temperature that arises to more than 470°C. The thick layer of clouds in Venus' atmosphere reflects sunlight very well, making Venus the brightest object in the sky next to the Moon, as seen from Earth. It is often called the Evening Star or Morning Star. Venus rotates from east to west once every 243 Earth days and revolves around the Sun for 225 Earth days. Like Mercury, it has no moon and no ring around it.",
    subtitle: "The Evening Star - Terrestrial",
    color: "#228B22" // Green for terrestrial planet
  },
  {
    id: "earth",
    name: "Earth",
    model: "/models/earth.glb",
    description: "Earth is the only planet in the Solar System that can sustain life. It is known as the blue planet because it looks blue as seen from outer space. Earth has an average distance of 149 million km from the Sun. Earth's atmosphere is made up mostly of 77% nitrogen gas and 21% oxygen with traces of argon, carbon dioxide, and water. Its average surface temperature is 15°C. About 1/3 of the Earth's surface is land while 2/3 is water. The land part is divided into continents with various landforms like mountains and hills. The water part consists of various bodies of water like oceans and rivers. It takes 365 ¼ days for the Earth to complete its revolution and 24 hours to complete its rotation. The Earth has only one moon that revolves around it every 27.3 days.",
    subtitle: "The Blue Planet - Terrestrial",
    color: "#32CD32" // Green for terrestrial planet
  },
  {
    id: "mars",
    name: "Mars",
    model: "/models/mars.glb",
    description: "Mars is called the red planet. It looks red because of the presence of iron on its surface. Mars has an equatorial diameter of 6,788 km. Its average distance from the Sun is 227 million km. Mars has a very thin atmosphere which consists largely of carbon dioxide and a small percentage of other gases. It has an average surface temperature of –63°C. It is also known for its volcanoes. It has one of the largest volcanoes in the solar system, the Olympus Mons. Mars takes 687 Earth days to complete its revolution. Like Earth, it takes 24 days to complete its rotation. Mars has two moons.",
    subtitle: "The Red Planet - Terrestrial",
    color: "#A0522D" // Brown for terrestrial planet
  },
  {
    id: "jupiter",
    name: "Jupiter",
    model: "/models/jupiter.glb",
    description: "Jupiter is the biggest planet in the solar system. It is bigger and heavier than all other planets combined. It has an equatorial diameter of 142,984 km. Its average distance from the Sun is 774 million km. Jupiter is covered with thick clouds. There is no solid ground on Jupiter. It is called a gas giant planet which is made up mostly of hydrogen and helium rather than rocks and metals as Earth. The average surface temperature at the top of its clouds can reach about –149°C. Jupiter takes 12 Earth years to complete one revolution and 10 hours to complete its rotation. It has a huge storm in its atmosphere called a great red spot. Jupiter has 50 moons (with an additional 17 moons recently discovered and currently being confirmed). One of its moons, Ganymede, is the largest in the solar system.",
    subtitle: "The Gas Giant - Jovian",
    color: "#1E90FF" // Blue for Jovian planet
  },
  {
    id: "saturn",
    name: "Saturn",
    model: "/models/saturn.glb",
    description: "Saturn is the sixth planet from the Sun, which has an average distance of 1.4 billion km from it and is the farthest planet visible to the naked eye. Saturn has an equatorial diameter of 120,536 km. It takes 10.7 Earth hours for Saturn to complete a rotation and 29 Earth years to complete a revolution. Saturn is a cold planet. The temperature at the top of Saturn's clouds can reach about –176°C. Like Jupiter, Saturn is also a gas giant without a solid surface. It is composed mostly of hydrogen and helium. There are 53 known moons surrounding Saturn. Its largest moon is Titan. It is the second largest moon in the solar system.",
    subtitle: "The Ringed Planet - Jovian",
    color: "#4169E1" // Blue for Jovian planet
  },
  {
    id: "uranus",
    name: "Uranus",
    model: "/models/uranus.glb",
    description: "Uranus is the seventh planet of the solar system and is the first planet discovered by means of a telescope. Its average distance from the Sun is 2.9 billion km. This planet is considered an ice giant because it is mostly made up of frozen water, methane, and ammonia. Its atmosphere is mostly hydrogen and helium. Its average surface temperature can reach –215°C. Uranus is the only planet that rotates on its side. It takes 17 hours to complete its rotation and 84 Earth years to complete its revolution. Its equatorial diameter is 51,118 km. Uranus has rings, too. There are 11 rings around it. The rings are dark, narrow, and widely spaced. The planet also has 27 moons, the largest of which is called Titania.",
    subtitle: "The Ice Giant - Jovian",
    color: "#0000CD" // Blue for Jovian planet (ice giant)
  },
  {
    id: "neptune",
    name: "Neptune",
    model: "/models/neptune.glb",
    description: "Neptune is the eighth planet from the Sun and is the first planet to be discovered using mathematical calculations before being confirmed by a telescope. Its average distance from the Sun is 4.5 billion km. Neptune's rotation lasts about 16 Earth hours. It completes one revolution around the Sun every 165 Earth years. This planet also has no solid surface and is a gas giant. Its surface temperature is –214°C, mostly the same as Uranus. Its equatorial diameter is 49,532 km. Neptune and Uranus are called twin planets because they have about the same size and mass. They also both look blue-green because of methane gas in their atmosphere. Neptune has six dark rings made up of very fine particles. It has 13 moons, the largest of which is called Triton.",
    subtitle: "The Windswept World - Jovian",
    color: "#191970" // Blue for Jovian planet (ice giant)
  }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const modelViewerRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handlePlanetClick = (planet) => {
    synth.cancel();
    setIsSpeaking(false);
    setSelectedPlanet(planet);
  };

  const handleBack = () => {
    synth.cancel();
    setIsSpeaking(false);
    setSelectedPlanet(null);
  };

  const handleSpeech = () => {
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(selectedPlanet.description);
      
      currentUtterance.onend = () => {
        setIsSpeaking(false);
      };
    }
  };

  // Navigate to AR Scene
  const handleARView = () => {
    // Navigate to the respective planet page for AR experience
    const planetRoutes = {
      'mercury': '/planets/mercury',
      'venus': '/planets/venus',
      'earth': '/planets/earth',
      'mars': '/planets/mars',
      'jupiter': '/planets/jupiter',
      'saturn': '/planets/saturn',
      'uranus': '/planets/uranus',
      'neptune': '/planets/neptune',
      'sun': '/planets/sun'
    };
    
    const route = planetRoutes[selectedPlanet.id];
    if (route) {
      navigate(route);
    } else {
      // Fallback to ARScene for any unmapped planets
      navigate('/ar-scene', { state: { planet: selectedPlanet } });
    }
  };



  if (selectedPlanet) {
    return (
      <div className="planet-detail-container-xx" style={{backgroundColor: `${selectedPlanet.color}22`}}>
        <button className="back-button-xx" onClick={handleBack} aria-label="Go back">
          <img src="/images/back-arrow.svg" alt="Back" className="back-icon-xx" />
          <span>Back to planets</span>
        </button>

        <div className="planet-detail-content-xx">
          <div className="planet-detail-model-xx">
            <model-viewer
              ref={modelViewerRef}
              src={selectedPlanet.model}
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="auto"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              environment-image="neutral"
              exposure="0.8"
              camera-orbit="0deg 75deg auto"
              min-camera-orbit="auto auto auto"
              max-camera-orbit="auto auto auto"
              loading="eager"
              alt={`3D model of ${selectedPlanet.name} planet`}
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

          <div className="planet-detail-info-xx" style={{borderColor: selectedPlanet.color}}>
            <div className="planet-detail-header-xx" >
              <h1 className="planet-detail-title-xx">{selectedPlanet.name}</h1>
              <p className="planet-detail-subtitle-xx">{selectedPlanet.subtitle}</p>
            </div>
            
            <div className="planet-detail-body-xx">
              <p className="planet-detail-description-xx">{selectedPlanet.description}</p>

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
        <img src="/images/rocket.svg" alt="Rocket" className="rocket-icon-xx" />
        <h1 className="planets-title-xx">EXPLORE PLANETS!</h1>
        <img src="/images/astronaut.svg" alt="Astronaut" className="astronaut-icon-xx" />
      </div>

      {/* Search Bar */}
      <div className="search-container-xx">
        <div className="search-bar-xx">
          <input
            type="text"
            placeholder="Find a planet..."
            aria-label="Search planets"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button aria-label="Search">
            <img src="/images/search-icon.svg" alt="Search" className="search-icon-xx" />
          </button>
        </div>
      </div>

      {/* Planet Grid */}
      <div className="planets-grid-xx">
        {planetsData
          .filter((planet) => planet.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((planet) => (
            <div 
              key={planet.id} 
              className="planet-card-xx" 
              onClick={() => handlePlanetClick(planet)}
              style={{borderColor: planet.color}}
            >
              <div className="planet-model-container-xx">
                <model-viewer
                  src={planet.model}
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
                  alt={`3D model of ${planet.name} planet`}
                ></model-viewer>
              </div>
              <div className="planet-name-banner-xx">
                <p className="planet-name-xx">{planet.name}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Planets;