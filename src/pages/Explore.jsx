import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Explore.css";

const Explore = () => {
  // Render the main explore menu
  const renderExploreMenu = () => {
    return (
      <div className="content-container">
        <h1 className="title">EXPLORE SPACE</h1>
        <h2 className="subtitle">Begin your journey through the cosmos!</h2>
        
        <div className="cards-container">
          {/* AR Planets Card */}
          <Link to="/ar-scene" className="game-card-link">
            <div 
              className="game-card"
              style={{ boxShadow: '0 4px 20px rgba(249, 115, 22, 0.7)' }}
            >
              <div className="card-image-container planet-quiz-bg">
                <div className="planet-quiz-gradient"></div>
                <div className="inner-image-container">
                  <div className="inner-image">
                    <img 
                      src="/images/ar-planets.svg" 
                      alt="Colorful planets in AR" 
                      className="planet-image w-full h-full object-contain p-2"
                    />
                  </div>
                </div>
                <div className="difficulty-badge beginner">Interactive</div>
              </div>
              <div className="card-title-container">
                <h3 className="card-title">AR PLANETS</h3>
                <p className="card-description">Point your device at space and watch cool planets appear!</p>
              </div>
            </div>
          </Link>
          
          {/* Solar System Card */}
          <Link to="/SolarSystemAR" className="game-card-link">
            <div 
              className="game-card"
              style={{ boxShadow: '0 4px 20px rgba(126, 34, 206, 0.7)' }}
            >
              <div className="card-image-container connect-stars-bg">
                <div className="connect-stars-gradient"></div>
                <div className="inner-image-container">
                  <div className="inner-image">
                    <img 
                      src="/images/solar-system.svg" 
                      alt="Solar system with planets" 
                      className="planet-image w-full h-full object-contain p-2"
                    />
                  </div>
                </div>
                <div className="difficulty-badge intermediate">3D Experience</div>
              </div>
              <div className="card-title-container">
                <h3 className="card-title">Solar System Explorer</h3>
                <p className="card-description">Zoom through space and visit all the amazing planets!</p>
              </div>
            </div>
          </Link>
          
          {/* Sun and Moon Card */}
          <Link to="/sun-moon" className="game-card-link">
            <div 
              className="game-card"
              style={{ boxShadow: '0 4px 20px rgba(255, 193, 7, 0.7)' }}
            >
              <div className="card-image-container sun-moon-bg">
                <div className="sun-moon-gradient"></div>
                <div className="inner-image-container">
                  <div className="inner-image">
                    <div className="sun-moon-icons">
                      <div className="sun-icon">☀️</div>
                      <div className="moon-icon">🌙</div>
                    </div>
                  </div>
                </div>
                <div className="difficulty-badge beginner">Interactive</div>
              </div>
              <div className="card-title-container">
                <h3 className="card-title">Sun & Moon</h3>
                <p className="card-description">Discover our bright Sun and mysterious Moon up close!</p>
              </div>
            </div>
          </Link>

          {/* AR Constellation Card */}
          
        </div>

        <div className="rocket-animation">
          <div className="rocket"></div>
          <div className="rocket-trail"></div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="celestial-container">
      {/* Background stars */}
      <div className="stars-background"></div>
      <div className="star-overlay"></div>
      
      {/* Animated planets */}
      <div className="floating-planet planet1"></div>
      <div className="floating-planet planet2"></div>
      <div className="floating-planet planet3"></div>
      
      {/* Shooting stars */}
      <div className="shooting-star star1"></div>
      <div className="shooting-star star2"></div>
      
      {/* Main content */}
      {renderExploreMenu()}
    </div>
  );
};

export default Explore;