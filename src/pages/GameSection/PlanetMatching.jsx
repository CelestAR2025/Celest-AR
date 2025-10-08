import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import "../../styles/PlanetMatching.css";

// Difficulty levels configuration
const DIFFICULTY_CONFIG = {
  easy: { pairs: 4, maxTime: 300 },  // 5 minutes max time
  normal: { pairs: 6, maxTime: 300 },
  hard: { pairs: 8, maxTime: 300 }
};

// Planet data with 3D model paths
const planets = [
  { id: 1, name: 'Mercury', modelUrl: '/models/mercury.glb' },
  { id: 2, name: 'Venus', modelUrl: '/models/venus.glb' },
  { id: 3, name: 'Earth', modelUrl: '/models/earth.glb' },
  { id: 4, name: 'Mars', modelUrl: '/models/mars.glb' },
  { id: 5, name: 'Jupiter', modelUrl: '/models/jupiter.glb' },
  { id: 6, name: 'Saturn', modelUrl: '/models/saturn.glb' },
  { id: 7, name: 'Uranus', modelUrl: '/models/uranus.glb' },
  { id: 8, name: 'Neptune', modelUrl: '/models/neptune.glb' },
];

// Memory Card Component with 3D Model
const PlanetCard = ({ card, onClick, isRevealed, isMatched }) => {
  return (
    <div 
      className={`planet-card-match-yy ${isRevealed ? 'revealed-yy' : ''} ${isMatched ? 'matched-yy' : ''}`}
      onClick={onClick}
    >
      {isRevealed ? (
        <div className="planet-model-container-yy">
          <model-viewer
            src={card.planet.modelUrl}
            alt={card.planet.name}
            auto-rotate
            camera-controls={false}
            disable-zoom
            ar={false}
            shadow-intensity="1"
            environment-image="neutral"
            exposure="0.5"
            style={{ width: '100%', height: '100%' }}
          ></model-viewer>
          <div className="planet-name-match-yy">{card.planet.name}</div>
        </div>
      ) : (
        <div className="card-back-yy">
          <div className="stars-yy"></div>
          <div className="planet-icon-yy">🪐</div>
        </div>
      )}
    </div>
  );
};

// Leaderboard component with export functionality
const Leaderboard = ({ scores, onClose, onExport }) => {
  return (
    <div className="leaderboard-yy">
      <div className="leaderboard-content-yy">
        <h2 style={{ color: 'white' }} >🏆 Team Rankings 🏆</h2>
        <table>
          <thead>
            <tr>
              <th style={{ color: 'white' }}>Rank</th>
              <th style={{ color: 'white' }}>Team</th>
              <th style={{ color: 'white' }}>Completion Time</th>
              <th style={{ color: 'white' }}>Difficulty</th>
              <th style={{ color: 'white' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => (
              <tr key={index} className={index < 3 ? 'top-score-yy' : ''}>
                <td style={{ color: 'white' }}>{index + 1}</td>
                <td style={{ color: 'white' }}>{score.name}</td>
                <td style={{ color: 'white' }}>{Math.floor(score.time / 60)}:{(score.time % 60).toString().padStart(2, '0')}</td>
                <td style={{ color: 'white' }}>{score.difficulty}</td>
                <td style={{ color: 'white' }}>{score.date}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="leaderboard-buttons-yy">
          <button className="save-data-button-yy" onClick={onExport}>
            SAVE DATA TO CSV
          </button>
          <button className="close-button-yy" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Teacher Setup Component
const TeacherSetup = ({ onSetupComplete }) => {
  const [numberOfTeams, setNumberOfTeams] = useState(2);
  const [difficulty, setDifficulty] = useState('normal');
  const [teamNames, setTeamNames] = useState(Array(2).fill(''));

  const handleTeamNameChange = (index, name) => {
    const newTeamNames = [...teamNames];
    newTeamNames[index] = name;
    setTeamNames(newTeamNames);
  };

  const handleNumberOfTeamsChange = (e) => {
    const num = parseInt(e.target.value);
    setNumberOfTeams(num);
    setTeamNames(Array(num).fill('').map((_, i) => teamNames[i] || ''));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Make sure all teams have names
    if (teamNames.some(name => name.trim() === '')) {
      alert('Please enter names for all teams');
      return;
    }
    
    onSetupComplete(difficulty, teamNames);
  };

  return (
    <div className="teacher-setup-yy">
      <div className="setup-header-yy">
        <div className="title-container-yy">
          <div className="galaxy-image-yy"></div>
          <h1 style={{ color: 'white' }}>Planet Memory Match - Teacher Setup</h1>

          </div>
      </div>
      
      <form onSubmit={handleSubmit} className="setup-form-yy">
        <div className="setup-section-yy">
          <h2 style={{ color: 'white' }}>Competition Settings</h2>
          
          <div className="form-group-yy">
            <label style={{ color: 'white' }} >Number of Teams:</label>
            <select 
              value={numberOfTeams} 
              onChange={handleNumberOfTeamsChange}
              className="team-number-select-yy"
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group-yy">
            <label style={{ color: 'white' }} >Difficulty Level:</label>
            <div className="difficulty-buttons-yy">
              <button 
                type="button"
                className={`difficulty-button-yy easy-yy ${difficulty === 'easy' ? 'selected-yy' : ''}`}
                onClick={() => setDifficulty('easy')}
              >
                <span className="difficulty-icon-yy">🌎</span>
                <span className="difficulty-name-yy" style={{ color: 'white' }} >Easy</span>
                <span className="difficulty-desc-yy"style={{ color: 'white' }} >4 pairs</span>
              </button>
              <button 
                type="button"
                className={`difficulty-button-yy normal-yy ${difficulty === 'normal' ? 'selected-yy' : ''}`}
                onClick={() => setDifficulty('normal')}
              >
                <span className="difficulty-icon-yy">🪐</span>
                <span className="difficulty-name-yy" style={{ color: 'white' }}>Normal</span>
                <span className="difficulty-desc-yy"style={{ color: 'white' }} >6 pairs</span>
              </button>
              <button 
                type="button"
                className={`difficulty-button-yy hard-yy ${difficulty === 'hard' ? 'selected-yy' : ''}`}
                onClick={() => setDifficulty('hard')}
              >
                <span className="difficulty-icon-yy">🌌</span>
                <span className="difficulty-name-yy" style={{ color: 'white' }}>Hard</span>
                <span className="difficulty-desc-yy"style={{ color: 'white' }} >8 pairs</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="setup-section-yy">
          <h2 style={{ color: 'white' }} >Team Names</h2>
          <div className="team-names-container-yy">
            {Array.from({ length: numberOfTeams }).map((_, index) => (
              <div key={index} className="form-group-yy">
                <label style={{ color: 'white' }} >Team {index + 1}:</label>
                <input
                  type="text"
                  value={teamNames[index]}
                  onChange={(e) => handleTeamNameChange(index, e.target.value)}
                  placeholder={`Team ${index + 1}`}
                  maxLength={15}
                  className="team-name-input-yy"
                />
              </div>
            ))}
          </div>
        </div>
        
        <button type="submit" className="setup-submit-button-yy">
          Start Competition
        </button>
      </form>
    </div>
  );
};

// Tutorial Component
const Tutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="tutorial-overlay-yy">
      <div className="tutorial-content-yy">
        <div className="tutorial-progress-yy">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index} 
              className={`progress-dot-yy ${index + 1 <= currentStep ? 'active-yy' : ''}`}
              onClick={() => setCurrentStep(index + 1)}
            ></div>
          ))}
        </div>

        <div className="tutorial-step-container-yy">
          {currentStep === 1 && (
            <div className="tutorial-step-yy">
              <h2 style={{ color: 'white' }}>Welcome to Planet Memory Match!</h2>
              <div className="tutorial-image-yy step1-image-yy">
                <div className="planet-memory-demo">
                  <div className="demo-cards-grid">
                    <div className="demo-card demo-card-back">
                      <div className="stars-demo"></div>
                      <div className="planet-icon-demo">🪐</div>
                    </div>
                    <div className="demo-card demo-card-revealed">
                      <div className="planet-model-demo">🌍</div>
                      <div className="planet-name-demo">Earth</div>
                    </div>
                    <div className="demo-card demo-card-back">
                      <div className="stars-demo"></div>
                      <div className="planet-icon-demo">🪐</div>
                    </div>
                    <div className="demo-card demo-card-revealed">
                      <div className="planet-model-demo">🌍</div>
                      <div className="planet-name-demo">Earth</div>
                    </div>
                    <div className="demo-card demo-card-back">
                      <div className="stars-demo"></div>
                      <div className="planet-icon-demo">🪐</div>
                    </div>
                    <div className="demo-card demo-card-revealed">
                      <div className="planet-model-demo">🌕</div>
                      <div className="planet-name-demo">Moon</div>
                    </div>
                    <div className="demo-card demo-card-back">
                      <div className="stars-demo"></div>
                      <div className="planet-icon-demo">🪐</div>
                    </div>
                    <div className="demo-card demo-card-revealed">
                      <div className="planet-model-demo">🌕</div>
                      <div className="planet-name-demo">Moon</div>
                    </div>
                  </div>
                  <div className="demo-title">Match the Planet Pairs!</div>
                </div>
              </div>
              <p style={{ color: 'white' }} >In this game, teams compete to match planet pairs as quickly as possible. The fastest team to correctly match all pairs wins!</p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="tutorial-step-yy">
              <h2 style={{ color: 'white' }}>How to Play</h2>
              <div className="tutorial-image-yy step2-image-yy">
                <div className="how-to-play-demo">
                  <div className="demo-instructions">
                    <div className="instruction-item">
                      <div className="instruction-icon">👥</div>
                      <div className="instruction-text">Teams take turns</div>
                    </div>
                    <div className="instruction-arrow">↓</div>
                    <div className="instruction-item">
                      <div className="instruction-icon">🖱️</div>
                      <div className="instruction-text">Click cards to reveal</div>
                    </div>
                    <div className="instruction-arrow">↓</div>
                    <div className="instruction-item">
                      <div className="instruction-icon">🔍</div>
                      <div className="instruction-text">Find matching pairs</div>
                    </div>
                    <div className="instruction-arrow">↓</div>
                    <div className="instruction-item">
                      <div className="instruction-icon">🏆</div>
                      <div className="instruction-text">Win by speed!</div>
                    </div>
                  </div>
                  <div className="demo-gameplay">
                    <div className="demo-team">Team Alpha 👨‍🚀</div>
                    <div className="demo-timer">⏱️ 1:23</div>
                  </div>
                </div>
              </div>
              <p style={{ color: 'white' }}>1. Each team takes turns playing the memory game</p>
              <p style={{ color: 'white' }} >2. Click on cards to reveal 3D planet models</p>
              <p style={{ color: 'white' }}>3. Try to find matching pairs of planets</p>
              <p style={{ color: 'white' }}>4. Match all planet pairs as quickly as possible</p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="tutorial-step-yy">
              <h2 style={{ color: 'white' }}>Scoring System</h2>
              <div className="tutorial-image-yy step3-image-yy">
                <div className="scoring-demo">
                  <div className="demo-leaderboard">
                    <div className="leaderboard-header">🏆 Team Rankings</div>
                    <div className="leaderboard-entry winner">
                      <div className="rank">1st</div>
                      <div className="team-name">Team Alpha</div>
                      <div className="time">⏱️ 1:23</div>
                    </div>
                    <div className="leaderboard-entry">
                      <div className="rank">2nd</div>
                      <div className="team-name">Team Beta</div>
                      <div className="time">⏱️ 1:45</div>
                    </div>
                    <div className="leaderboard-entry">
                      <div className="rank">3rd</div>
                      <div className="team-name">Team Gamma</div>
                      <div className="time">⏱️ 2:12</div>
                    </div>
                  </div>
                  <div className="difficulty-info">
                    <div className="difficulty-item">
                      <div className="diff-icon">🌎</div>
                      <div className="diff-text">Easy: 4 pairs</div>
                    </div>
                    <div className="difficulty-item">
                      <div className="diff-icon">🪐</div>
                      <div className="diff-text">Normal: 6 pairs</div>
                    </div>
                    <div className="difficulty-item">
                      <div className="diff-icon">🌌</div>
                      <div className="diff-text">Hard: 8 pairs</div>
                    </div>
                  </div>
                </div>
              </div>
              <p style={{ color: 'white' }}>• Teams are ranked by completion time</p>
              <p style={{ color: 'white' }} >• Faster time = better ranking</p>
              <p style={{ color: 'white' }}>• The game tracks how long each team takes to match all pairs</p>
              <p style={{ color: 'white' }}>• Each difficulty level has a different number of pairs to match</p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="tutorial-step-yy">
              <h2 style={{ color: 'white' }}>Ready to Play?</h2>
              <div className="tutorial-image-yy step4-image-yy">
                <div className="ready-to-play-demo">
                  <div className="launch-sequence">
                    <div className="rocket">🚀</div>
                    <div className="launch-text">Mission Launch!</div>
                  </div>
                  <div className="team-ready">
                    <div className="team-avatar">👨‍🚀</div>
                    <div className="team-status">Team Ready!</div>
                  </div>
                  <div className="game-elements">
                    <div className="element">🪐</div>
                    <div className="element">🌍</div>
                    <div className="element">🌕</div>
                    <div className="element">🪐</div>
                  </div>
                  <div className="begin-button-demo">
                    <div className="button-glow"></div>
                    <div className="button-text">BEGIN MISSION</div>
                  </div>
                </div>
              </div>
              <p style={{ color: 'white' }}>When it's your team's turn, click the "Begin" button to start your mission. Work together to find all matching planets as quickly as possible!</p>
              <p style={{ color: 'white' }}>Good luck, Space Explorers!</p>
            </div>
          )}
        </div>

        <div className="tutorial-navigation-yy">
          {currentStep > 1 && (
            <button className="tutorial-nav-button-yy prev-yy" onClick={handlePrevStep}>
              Previous
            </button>
          )}
          <button className="tutorial-nav-button-yy next-yy" onClick={handleNextStep}>
            {currentStep < totalSteps ? 'Next' : 'Begin'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Team Selection Component
const TeamSelection = ({ teams, onTeamSelect }) => {
  return (
    <div className="team-selection-yy">
      <div className="team-selection-header-yy">
        <div className="title-container-yy">
          <div className="galaxy-image-yy"></div>
          <h1 style={{ color: 'white' }}>Planet Memory Match</h1>
        </div>
        <h2 style={{ color: 'white' }}>Select Your Team</h2>
      </div>
      
      <div className="teams-grid-yy">
        {teams.map((team, index) => (
          <button 
            key={index} 
            className="team-selection-button-yy"
            onClick={() => onTeamSelect(team)}
          >
            <span className="team-icon-yy">👨‍🚀</span>
            <span className="team-name-yy" style={{ color: 'white' }} >{team}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const PlanetMatching = () => {
  const { currentUser, userProfile } = useAuth();
  const [gameState, setGameState] = useState('teacher-setup'); // 'teacher-setup', 'team-selection', 'tutorial', 'playing', 'game-over'
  const [difficulty, setDifficulty] = useState('normal');
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState('');
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardScores, setLeaderboardScores] = useState([]);
  const [remainingTeams, setRemainingTeams] = useState([]);
  const [gameStartTime, setGameStartTime] = useState(null);

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  // Save game results to Firebase
  const saveGameResults = async () => {
    if (!currentUser || !userProfile || userProfile.role !== 'teacher') {
      console.log('Only teachers can save game results');
      return;
    }

    try {
      const gameData = {
        teacherId: currentUser.uid,
        teacherName: userProfile.name || userProfile.email,
        difficulty: difficulty,
        totalTeams: teams.length,
        totalPairs: DIFFICULTY_CONFIG[difficulty].pairs,
        leaderboard: [...leaderboardScores]
          .sort((a, b) => a.time - b.time) // Sort by time (lowest first)
          .map((team, index) => ({
            rank: index + 1,
            teamName: team.name,
            completionTime: team.time,
            timeFormatted: `${Math.floor(team.time / 60)}:${(team.time % 60).toString().padStart(2, '0')}`,
            difficulty: team.difficulty,
            date: team.date
          })),
        gameStartTime: gameStartTime,
        gameEndTime: new Date(),
        timestamp: serverTimestamp(),
        gameType: 'Planet Memory Match'
      };

      const docRef = await addDoc(collection(db, 'planetMatchingScores'), gameData);
      console.log('Game results saved successfully with ID:', docRef.id);
      console.log('Saved game data:', gameData);
    } catch (error) {
      console.error('Error saving game results:', error);
    }
  };

  // Handle teacher setup completion
  const handleSetupComplete = (selectedDifficulty, teamNames) => {
    setDifficulty(selectedDifficulty);
    setTeams(teamNames);
    setRemainingTeams([...teamNames]);
    setGameStartTime(new Date()); // Set competition start time
    setGameState('team-selection');
  };

  // Handle team selection
  const handleTeamSelect = (team) => {
    setCurrentTeam(team);
    setGameState('tutorial');
  };

  // Handle tutorial completion
  const handleTutorialComplete = () => {
    initializeGame();
    setGameState('playing');
  };

  // Initialize the game
  const initializeGame = () => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const numPairs = config.pairs;
    
    // Select a subset of planets based on difficulty
    const selectedPlanets = [...planets]
      .sort(() => 0.5 - Math.random())
      .slice(0, numPairs);
    
    // Create two cards for each planet (matching pairs)
    let gameCards = [];
    selectedPlanets.forEach(planet => {
      // Create two cards for each planet (a matching pair)
      gameCards.push({ id: gameCards.length, planet, revealed: false, matched: false });
      gameCards.push({ id: gameCards.length, planet, revealed: false, matched: false });
    });
    
    // Shuffle cards
    gameCards = gameCards.sort(() => 0.5 - Math.random());
    
    setCards(gameCards);
    setMatchedPairs(0);
    setFlippedCards([]);
    setTimeElapsed(0);
    setGameStarted(true);
    setGameOver(false);
  };

  // Handle card click
  const handleCardClick = (cardId) => {
    if (!gameStarted || gameOver) return;
    
    // Find the clicked card
    const clickedCard = cards.find(card => card.id === cardId);
    
    // If card already revealed or matched, do nothing
    if (clickedCard.revealed || clickedCard.matched) return;
    
    // If already two cards flipped, do nothing (player must wait for check)
    if (flippedCards.length === 2) return;
    
    // Flip the card
    const newCards = [...cards];
    const cardIndex = newCards.findIndex(card => card.id === cardId);
    newCards[cardIndex] = { ...clickedCard, revealed: true };
    setCards(newCards);
    
    // Add to flipped cards
    const newFlippedCards = [...flippedCards, clickedCard];
    setFlippedCards(newFlippedCards);
    
    // If this is the second card flipped, check for a match
    if (newFlippedCards.length === 2) {
      checkForMatch(newFlippedCards, newCards);
    }
  };

  // Check if two flipped cards match
  const checkForMatch = (flippedPair, currentCards) => {
    setTimeout(() => {
      if (flippedPair[0].planet.id === flippedPair[1].planet.id) {
        // Match found
        const matchedCards = currentCards.map(card => 
          card.planet.id === flippedPair[0].planet.id 
            ? { ...card, matched: true, revealed: true } 
            : card
        );
        
        setMessage('MATCH FOUND!');
        setCards(matchedCards);
        setMatchedPairs(prev => prev + 1);
        
        // Check if all pairs are matched
        const totalPairs = DIFFICULTY_CONFIG[difficulty].pairs;
        if (matchedPairs + 1 === totalPairs) {
          // All pairs matched, end game
          endGame();
        }
      } else {
        // No match, flip cards back
        const resetCards = currentCards.map(card => 
          (card.id === flippedPair[0].id || card.id === flippedPair[1].id) && !card.matched
            ? { ...card, revealed: false }
            : card
        );
        
        setMessage('Try again!');
        setCards(resetCards);
      }
      
      // Clear message after a delay
      setTimeout(() => {
        setMessage('');
      }, 500);
      
      // Reset flipped cards
      setFlippedCards([]);
    }, 1000); // Delay to allow player to see the cards
  };

  // End game and update leaderboard
  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
    
    // Add to leaderboard
    const date = new Date().toLocaleDateString();
    
    // Add new team score
    const newLeaderboardScores = [
      ...leaderboardScores,
      { name: currentTeam, time: timeElapsed, difficulty, date }
    ].sort((a, b) => a.time - b.time); // Sort by time (lowest first)
    
    setLeaderboardScores(newLeaderboardScores);
    
    // Remove team from remaining teams
    const newRemainingTeams = remainingTeams.filter(team => team !== currentTeam);
    setRemainingTeams(newRemainingTeams);
    
    setMessage(`Completed in ${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`);
  };

  // Export leaderboard to CSV
  const exportLeaderboardToCSV = () => {
    const date = new Date().toLocaleDateString();
    const data = leaderboardScores.map((team, index) => ({
      Rank: index + 1,
      TeamName: team.name,
      CompletionTime: `${Math.floor(team.time / 60)}:${(team.time % 60).toString().padStart(2, '0')}`,
      Difficulty: team.difficulty,
      Date: team.date
    }));

    const csv = Papa.unparse(data, {
      header: true,
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `planet_matching_results_${date.replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle next team
  const handleNextTeam = () => {
    if (remainingTeams.length > 0) {
      setGameState('team-selection');
    } else {
      // All teams have played - save results to Firebase
      saveGameResults();
      setShowLeaderboard(true);
    }
  };

  // Reset game for a new competition
  const resetGame = () => {
    setGameState('teacher-setup');
    setTeams([]);
    setCurrentTeam('');
    setCards([]);
    setFlippedCards([]);
    setMatchedPairs(0);
    setGameStarted(false);
    setGameOver(false);
    setTimeElapsed(0);
    setShowLeaderboard(false);
    setGameStartTime(null);
  };

  // Render teacher setup
  if (gameState === 'teacher-setup') {
    return <TeacherSetup onSetupComplete={handleSetupComplete} />;
  }

  // Render team selection
  if (gameState === 'team-selection') {
    return <TeamSelection teams={remainingTeams} onTeamSelect={handleTeamSelect} />;
  }

  // Render tutorial
  if (gameState === 'tutorial') {
    return (
      <div className="planet-matching-yy">
        <Tutorial onComplete={handleTutorialComplete} />
      </div>
    );
  }

  // Game view
  return (
    <div className="planet-matching-yy">
      <div className="game-header-yy">
        <div className="game-info-yy">
          <div className="timer-yy">
            ⏱️ {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
          </div>
          <div className="explorer-name-yy">👨‍🚀 Team {currentTeam}</div>
          <div className="difficulty-display-yy">
            Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </div>
        </div>
      </div>
      
      <div className="memory-game-board-yy">
        {cards.map((card) => (
          <PlanetCard 
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card.id)}
            isRevealed={card.revealed}
            isMatched={card.matched}
          />
        ))}
      </div>
      
      <div className="game-footer-yy">
        {message && <div className={`message-yy ${message.includes('MATCH') ? 'correct-match-yy' : ''}`}>{message}</div>}
        
        {gameOver && (
          <div className="game-over-container-yy">
            <h2 style={{ color: 'white' }}>Mission Complete!</h2>
            <p>Team {currentTeam} completed in: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</p>
            <div className="game-over-buttons-yy">
              <button onClick={handleNextTeam} className="next-team-button-yy">
                {remainingTeams.length > 0 ? 'Next Team' : 'View Final Results'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {showLeaderboard && (
        <div className="competition-results-yy">
          <h2>🏆 Competition Results 🏆</h2>
          <div className="results-container-yy">
            <div className="winner-display-yy">
              {leaderboardScores.length > 0 && (
                <>
                  <h3>🥇 Winner: Team {leaderboardScores[0].name}</h3>
                  <p>Completion Time: {Math.floor(leaderboardScores[0].time / 60)}:{(leaderboardScores[0].time % 60).toString().padStart(2, '0')}</p>
                </>
              )}
            </div>
            
            <Leaderboard 
              scores={leaderboardScores} 
              onClose={() => setShowLeaderboard(false)} 
              onExport={exportLeaderboardToCSV}
            />
            
            <button onClick={resetGame} className="new-competition-button-yy">
              Start New Competition
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanetMatching;