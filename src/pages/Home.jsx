import React, { useState } from "react";
import "../styles/App.css";
import childAstronomerImg from "../assets/astro-boy.png";

const Home = () => {
  const [activeSection, setActiveSection] = useState('vision');

  const scrollToExplore = () => {
    const exploreSection = document.getElementById('explore-section');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section with Starfield Background */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">SPACE ADVENTURE!</h1>
          <p className="hero-subtitle">Let's explore the space together!</p>
          <button className="start-button" onClick={scrollToExplore}>BLAST OFF!</button>
        </div>
      </section> 

      {/* Explore Section with Solar System 3D Model */}
      <section id="explore-section" className="explore-section">
        <div className="explore-content">
          <div className="solar-system-model-container">
            <model-viewer
              src="/models/solar_system_animation.glb"
              alt="3D Solar System Model"
              auto-rotate
              camera-controls
              ar
              ar-modes="webxr scene-viewer quick-look"
              environment-image="neutral"
              shadow-intensity="1"
              camera-orbit="45deg 55deg 2.5m"
              exposure="0.5"
              style={{ width: '100%', height: '400px' }}
            ></model-viewer>
           
          </div>
          
          <div className="explore-text">
            <h2 className="explore-title">DISCOVER THE UNIVERSE WITH CELESTAR!</h2>
            <div className="explore-description">
              <p>
                Jump into an amazing space adventure with CelestAR! 
                This cool app brings the wonders of space right into your 
                classroom using magical technology called Augmented Reality.
              </p>
              <p>
                You can see colorful 3D planets and space objects that pop
                right out of your screen! No more boring black-and-white pictures in books.
                With CelestAR, learning about space becomes a super fun journey!
              </p>
              <div className="button-container">
                <button className="read-more-button">Explore More!</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section - Interactive Layout */}
      <section className="vision-mission-section">
        <div className="vision-mission-container">
          <div className="vision-mission-title">
            <h2>OUR SPACE MISSION</h2>
          </div>

          <div className="mission-toggle-buttons">
            <button 
              className={`mission-toggle ${activeSection === 'vision' ? 'active' : ''}`}
              onClick={() => setActiveSection('vision')}
            >
              Our Dream
            </button>
            <button 
              className={`mission-toggle ${activeSection === 'mission' ? 'active' : ''}`}
              onClick={() => setActiveSection('mission')}
            >
              Our Goal
            </button>
          </div>

          <div className="vision-mission-content">
            {/* Astronomer Image */}
            <div className="astronomer-image-container">
              <img src={childAstronomerImg} alt="Child with telescope" className="astronomer-image" />
              <div className="speech-bubble">
                {activeSection === 'vision' 
                  ? "Let's dream big!" 
                  : "Space is awesome!"}
              </div>
            </div>

            {/* Dynamic Content Section */}
            <div className="dynamic-content-section">
              {activeSection === 'vision' ? (
                <div className="vision-content">
                  <div className="content-card">
                    <h3>Our Dream</h3>
                    <p>
                      We want to make learning about space super fun for kids like you! 
                      CelestAR helps you explore planets and stars through amazing 3D adventures. 
                      One day, we hope every student will discover space this way, and maybe you'll 
                      become the next great astronaut or scientist!
                    </p>
                    <div className="planet-icon">🚀</div>
                  </div>
                </div>
              ) : (
                <div className="mission-content">
                  <div className="content-card">
                    <h3>Our Goal</h3>
                    <p>
                      We're on a mission to make science class awesome by replacing boring 
                      black-and-white pictures with colorful 3D planets that you can play with! 
                      CelestAR brings space to life so you can see how cool the universe really is. 
                      Get ready for a cosmic adventure!
                    </p>
                    <div className="planet-icon">🌍</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Planets Decoration - Moved outside of content to fix positioning */}
          
        </div>
      </section>
    </div>
  );
};

export default Home;