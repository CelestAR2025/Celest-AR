import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/games.css";

// Main Games component
const Games = () => {
  // Render the main games menu
  const renderGamesMenu = () => {
    return (
      <div className="content-container">
        <h1 className="title">SPACE EXPLORER GAMES</h1>
        <h2 className="subtitle">Blast off on your astronomy adventure!</h2>
        
        <div className="cards-container">
          {/* Planet Quiz Card */}
          <Link to="/games/planet-quiz" className="game-card-link">
            <div 
              className="game-card"
              style={{ boxShadow: '0 4px 20px rgba(249, 115, 22, 0.7)' }}
            >
              <div className="card-image-container card-gradient-1">
                <div className="inner-image-container">
                  <div className="inner-image">
                    <div className="planet-icon">
                      <span className="icon-emoji">❓</span>
                    </div>
                  </div>
                </div>
                <div className="difficulty-badge beginner">Beginner</div>
              </div>
              <div className="card-title-container">
                <h3 className="card-title">Planet Discovery Quiz</h3>
                <p className="card-description">Test your knowledge about planets in our solar system!</p>
              </div>
            </div>
          </Link>
          
          {/* Connect the Stars Card */}
          <Link to="/games/connect-the-stars" className="game-card-link">
            <div 
              className="game-card"
              style={{ boxShadow: '0 4px 20px rgba(126, 34, 206, 0.7)' }}
            >
              <div className="card-image-container card-gradient-2">
                <div className="inner-image-container">
                  <div className="inner-image">
                    <div className="planet-icon">
                      <span className="icon-emoji">⭐</span>
                    </div>
                  </div>
                </div>
                <div className="difficulty-badge intermediate">Intermediate</div>
              </div>
              <div className="card-title-container">
                <h3 className="card-title">Constellation Creator</h3>
                <p className="card-description">Connect stars to create amazing constellations!</p>
              </div>
            </div>
          </Link>
          
          {/* Planet Matching Card */}
          <Link to="/games/planet-matching" className="game-card-link">
            <div 
              className="game-card"
              style={{ boxShadow: '0 4px 20px rgba(59, 130, 246, 0.7)' }}
            >
              <div className="card-image-container card-gradient-3">
                <div className="inner-image-container">
                  <div className="inner-image">
                    <div className="planet-icon">
                      <span className="icon-emoji">🪐</span>
                    </div>
                  </div>
                </div>
                <div className="difficulty-badge beginner">Beginner</div>
              </div>
              <div className="card-title-container">
                <h3 className="card-title">Planet Memory Match</h3>
                <p className="card-description">Find matching pairs of planets and space objects!</p>
              </div>
            </div>
          </Link>
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
      {renderGamesMenu()}
    </div>
  );
};

export default Games;