import React from 'react';
import { FaTimes, FaVolumeUp } from 'react-icons/fa';
import '../styles/PlanetModal.css';

const PlanetModal = ({ isOpen, onClose, planet }) => {
  if (!isOpen || !planet) return null;

  const handleAudioPlay = () => {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(
        `${planet.name}. ${planet.description}`
      );
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || voice.name.includes('Microsoft')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="planet-modal-overlay">
      {/* Dark overlay */}
      <div 
        className="planet-modal-backdrop"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="planet-modal-container">
        {/* Header with planet color */}
        <div 
          className="planet-modal-header"
          style={{ backgroundColor: planet.color }}
        >
          {/* Background pattern */}
          <div className="planet-modal-bg-pattern">
            <div className="planet-modal-circle-1"></div>
            <div className="planet-modal-circle-2"></div>
          </div>
          
          <div className="planet-modal-header-content">
            <div className="planet-modal-header-top">
              <div>
                <h2 className="planet-modal-title">{planet.name}</h2>
                <span className="planet-modal-type">
                  {planet.name === 'Sun' ? 'Star' : 'Planet'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="planet-modal-close-btn"
              >
                <FaTimes className="planet-modal-close-icon" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Body */}
        <div className="planet-modal-body">
          <div className="planet-modal-about">
            <h3 className="planet-modal-about-title">
              <span className="planet-modal-about-icon"></span>
              About {planet.name}
            </h3>
            <p className="planet-modal-description">
              {planet.description}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="planet-modal-actions">
            <button
              onClick={handleAudioPlay}
              className="planet-modal-btn planet-modal-btn-primary"
            >
              <FaVolumeUp />
              Listen
            </button>
            <button
              onClick={onClose}
              className="planet-modal-btn planet-modal-btn-secondary"
            >
              Keep Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetModal;
