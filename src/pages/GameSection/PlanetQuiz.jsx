import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse'; // Import papaparse for CSV export
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import "../../styles/planetQuiz.css"; // Updated to use the new CSS file

// PlanetQuiz component
const PlanetQuiz = () => {
  const [currentView, setCurrentView] = useState('tutorial');
  const [difficulty, setDifficulty] = useState('normal');

  // Render the appropriate view based on state
  const renderView = () => {
    switch (currentView) {
      case 'tutorial':
        return renderTutorial();
      case 'game':
        return <PlanetQuizGame 
          difficulty={difficulty} 
          onBack={() => setCurrentView('tutorial')} 
        />;
      default:
        return renderTutorial();
    }
  };

  // Render the tutorial view
  const renderTutorial = () => {
    return (
      <div className="tutorial-container">
        <div className="tutorial-content">
        <div className="tutorial-image">
  <video
    className="tutorial-img planet-quiz-img"
    src="/videos/planet-quiz.mp4"
    autoPlay
    loop
    muted
    playsInline
  />
</div>

          <div className="tutorial-info">
            <h2>Planet Quiz</h2>
            <h3>Objective:</h3>
            <p>Be the first to answer the teacher's questions correctly and earn points! The Planet Quiz transforms learning about the solar system into a fun and competitive recitation game.</p>

            <h3>👨‍🏫 How to Play:</h3>
            <ol>
              <li>Start the Quiz: The system will display random questions about planets, moons, and celestial phenomena.</li>
              <li>Listen Carefully: Understand the question quickly.</li>
              <li>Raise Your Hand: Be the first to respond.</li>
              <li>Answer the Question: Earn a point for each correct answer.</li>
              <li>Winning: The student with the most points wins and might receive a special prize!</li>
            </ol>

            <h3>Select Difficulty:</h3>
            <div className="difficulty-selector">
              <button 
                className={`difficulty-btn ${difficulty === 'easy' ? 'selected' : ''}`} 
                onClick={() => setDifficulty('easy')}
              >
                Easy
              </button>
              <button 
                className={`difficulty-btn ${difficulty === 'normal' ? 'selected' : ''}`} 
                onClick={() => setDifficulty('normal')}
              >
                Normal
              </button>
              <button 
                className={`difficulty-btn ${difficulty === 'hard' ? 'selected' : ''}`} 
                onClick={() => setDifficulty('hard')}
              >
                Hard
              </button>
            </div>

            <div className="tutorial-buttons">
              <Link to="/games">
                <button className="back-btn">Back</button>
              </Link>
              <button className="start-btn" onClick={() => setCurrentView('game')}>
                <span>Start</span>
                <span className="play-icon">▶</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="celestial-container">
      {/* Background stars */}
      <div className="stars-background"></div>
      <div className="star-overlay"></div>

      {/* Main content */}
      {renderView()}
    </div>
  );
};

// Planet Quiz Game Component
const PlanetQuizGame = ({ onBack, difficulty }) => {
  const { currentUser, userProfile } = useAuth();
  const [question, setQuestion] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestionIds, setUsedQuestionIds] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);

  // Student leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [showStudentInput, setShowStudentInput] = useState(false);

  // Game limits based on difficulty (adjusted for 8 planets)
  const questionLimits = {
    easy: 9,  // All planets once
    normal: 10, // All planets once
    hard: 11   // All planets once
  };

  // Planet data from Planets.jsx
  const planetsData = [
    {
      id: "mercury",
      name: "Mercury",
      model: "/models/mercury.glb",
      description: "Mercury is the nearest planet to the Sun with an average distance of 58 million km. It takes 88 Earth days to complete its revolution and 59 Earth days to complete its rotation. Mercury has a surface temperature of up to 430°C during daytime and –180°C during nighttime.",
      facts: ["Has no moon or ring", "Surface full of craters", "Smallest planet", "Closest to the Sun"],
      subtitle: "The Swift Planet - Terrestrial",
      color: "#8B4513",
      type: "terrestrial"
    },
    {
      id: "venus",
      name: "Venus",
      model: "/models/venus.glb",
      description: "Venus has almost the same size and density as Earth. It has an average distance of 108 million km from the Sun. Venus rotates from east to west once every 243 Earth days and revolves around the Sun for 225 Earth days. Its atmosphere is mostly carbon dioxide with a surface temperature over 470°C.",
      facts: ["Called Evening Star or Morning Star", "Rotates backwards", "Hottest planet", "No moon or ring"],
      subtitle: "The Evening Star - Terrestrial",
      color: "#228B22",
      type: "terrestrial"
    },
    {
      id: "earth",
      name: "Earth",
      model: "/models/earth.glb",
      description: "Earth is the only planet that can sustain life. It has an average distance of 149 million km from the Sun. Earth's atmosphere is 77% nitrogen and 21% oxygen. It takes 365¼ days to complete its revolution and 24 hours to complete its rotation.",
      facts: ["Only planet with life", "1/3 land, 2/3 water", "One moon", "Blue planet"],
      subtitle: "The Blue Planet - Terrestrial",
      color: "#32CD32",
      type: "terrestrial"
    },
    {
      id: "mars",
      name: "Mars",
      model: "/models/mars.glb",
      description: "Mars is called the red planet due to iron on its surface. Its average distance from the Sun is 227 million km. Mars takes 687 Earth days to complete its revolution and 24 hours to complete its rotation. It has the largest volcano in the solar system, Olympus Mons.",
      facts: ["Has two moons", "Red from iron oxide", "Olympus Mons volcano", "Average temperature –63°C"],
      subtitle: "The Red Planet - Terrestrial",
      color: "#A0522D",
      type: "terrestrial"
    },
    {
      id: "jupiter",
      name: "Jupiter",
      model: "/models/jupiter.glb",
      description: "Jupiter is the biggest planet in the solar system with a diameter of 142,984 km. Its average distance from the Sun is 774 million km. Jupiter takes 12 Earth years to complete one revolution and 10 hours to complete its rotation. It has a Great Red Spot storm.",
      facts: ["Largest planet", "50+ moons", "Gas giant", "Great Red Spot"],
      subtitle: "The Gas Giant - Jovian",
      color: "#1E90FF",
      type: "jovian"
    },
    {
      id: "saturn",
      name: "Saturn",
      model: "/models/saturn.glb",
      description: "Saturn is the sixth planet from the Sun at 1.4 billion km distance. It takes 10.7 Earth hours for rotation and 29 Earth years for revolution. Saturn is a gas giant composed mostly of hydrogen and helium. It has 53 known moons with Titan being the largest.",
      facts: ["Famous rings", "53 moons", "Would float in water", "Temperature –176°C"],
      subtitle: "The Ringed Planet - Jovian",
      color: "#4169E1",
      type: "jovian"
    },
    {
      id: "uranus",
      name: "Uranus",
      model: "/models/uranus.glb",
      description: "Uranus is 2.9 billion km from the Sun. It's an ice giant that rotates on its side. It takes 17 hours to complete its rotation and 84 Earth years to complete its revolution. Uranus has 11 dark rings and 27 moons, with Titania being the largest.",
      facts: ["Rotates sideways", "27 moons", "11 rings", "Temperature –215°C"],
      subtitle: "The Ice Giant - Jovian",
      color: "#0000CD",
      type: "jovian"
    },
    {
      id: "neptune",
      name: "Neptune",
      model: "/models/neptune.glb",
      description: "Neptune is 4.5 billion km from the Sun. It takes 16 Earth hours for rotation and 165 Earth years for revolution. Neptune has the strongest winds in the solar system. It has 6 dark rings and 13 moons, with Triton being the largest.",
      facts: ["Farthest planet", "Strongest winds", "13 moons", "Temperature –214°C"],
      subtitle: "The Windswept World - Jovian",
      color: "#191970",
      type: "jovian"
    }
  ];

  // Generate questions from planet data based on difficulty
  const generateQuestions = (difficulty) => {
    return planetsData.map((planet, index) => {
      let question = "";
      
      // Remove planet name from description for cleaner questions
      const cleanDescription = planet.description.replace(new RegExp(planet.name, 'gi'), 'I');
      
      if (difficulty === 'easy') {
        // Simple questions using key characteristics
        const easyQuestions = [
          `I am the ${planet.subtitle.toLowerCase()}. ${cleanDescription.split('.')[0]}. What am I?`,
          `I am known as the "${planet.subtitle}". ${cleanDescription.split('.')[0]}. What am I?`,
          `I am ${cleanDescription.split('.')[0].toLowerCase()}. What am I?`
        ];
        question = easyQuestions[index % easyQuestions.length];
      } else if (difficulty === 'normal') {
        // Medium complexity questions
        const normalQuestions = [
          `I am ${cleanDescription.split('.')[0].toLowerCase()}. I am known as ${planet.subtitle.toLowerCase()}. What am I?`,
          `I am ${cleanDescription.split('.')[0].toLowerCase()}. ${cleanDescription.split('.')[1]}. What am I?`,
          `I am known as ${planet.subtitle.toLowerCase()}. ${cleanDescription.split('.')[0]}. What am I?`
        ];
        question = normalQuestions[index % normalQuestions.length];
      } else {
        // Hard questions with more detailed descriptions
        const hardQuestions = [
          `I am ${cleanDescription.split('.')[0].toLowerCase()}. ${cleanDescription.split('.')[1]}. I am known as ${planet.subtitle.toLowerCase()}. What am I?`,
          `I am known as ${planet.subtitle.toLowerCase()}. ${cleanDescription.split('.')[0]}. ${cleanDescription.split('.')[1]}. What am I?`,
          `I am ${cleanDescription.split('.')[0].toLowerCase()}. ${cleanDescription.split('.')[1]}. ${cleanDescription.split('.')[2]}. What am I?`
        ];
        question = hardQuestions[index % hardQuestions.length];
      }

      return {
        id: `${difficulty}-${planet.id}`,
        question: question,
        answer: planet.name.toUpperCase(),
        model: planet.model
      };
    });
  };

  // Questions database organized by difficulty
  const allQuestions = {
    easy: generateQuestions('easy'),
    normal: generateQuestions('normal'),
    hard: generateQuestions('hard')
  };

  // Get a random question from the current difficulty level
  const getRandomQuestion = () => {
    const questions = allQuestions[difficulty];
    
    // Filter out questions that have already been used
    const availableQuestions = questions.filter(q => !usedQuestionIds.includes(q.id));
    
    // If all questions have been used, reset the used questions array
    if (availableQuestions.length === 0) {
      setUsedQuestionIds([]);
      return questions[Math.floor(Math.random() * questions.length)];
    }
    
    // Select a random question from the available ones
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    // Add the selected question's ID to the used questions array
    setUsedQuestionIds(prev => [...prev, selectedQuestion.id]);
    
    return selectedQuestion;
  };

  // Initialize game
  useEffect(() => {
    setQuestion(getRandomQuestion());
    setGameStartTime(new Date());
  }, [difficulty]);

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
        totalQuestions: questionLimits[difficulty],
        questionsAnswered: questionsAnswered,
        leaderboard: [...leaderboard]
          .sort((a, b) => b.points - a.points) // Sort by points (highest first)
          .map((student, index) => ({
            rank: index + 1,
            name: student.name,
            points: student.points,
            percentage: ((student.points / questionsAnswered) * 100).toFixed(1)
          })),
        gameStartTime: gameStartTime,
        gameEndTime: new Date(),
        timestamp: serverTimestamp(),
        gameType: 'Planet Quiz'
      };

      const docRef = await addDoc(collection(db, 'quizResults'), gameData);
      console.log('Game results saved successfully with ID:', docRef.id);
      console.log('Saved game data:', gameData);
    } catch (error) {
      console.error('Error saving game results:', error);
    }
  };

  // Handle answer submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (userAnswer.trim() === '') return;

    const normalizedUserAnswer = userAnswer.trim().toUpperCase();
    const normalizedCorrectAnswer = question.answer.toUpperCase();

    const correct = normalizedUserAnswer === normalizedCorrectAnswer;

    setIsCorrect(correct);
    setAnswerSubmitted(true);

    if (correct) {
      setScore(prevScore => prevScore + 1);
      setShowStudentInput(true);
    }

    const newQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(newQuestionsAnswered);

    // Check if game should end
    if (newQuestionsAnswered >= questionLimits[difficulty]) {
      setGameCompleted(true);
      // Save results after a short delay to ensure state updates
      setTimeout(() => {
        saveGameResults();
      }, 1000);
    }
  };

  // Go to next question
  const handleNextQuestion = () => {
    if (questionsAnswered >= questionLimits[difficulty]) {
      setGameCompleted(true);
      saveGameResults();
      return;
    }

    setUserAnswer('');
    setAnswerSubmitted(false);
    setShowStudentInput(false);
    setStudentName('');
    setQuestion(getRandomQuestion());
  };

  // Handle student name submission
  const handleStudentSubmit = (e) => {
    e.preventDefault();

    if (studentName.trim() === '') return;

    // Check if student already exists in leaderboard
    const existingStudentIndex = leaderboard.findIndex(
      student => student.name.toLowerCase() === studentName.trim().toLowerCase()
    );

    if (existingStudentIndex !== -1) {
      // Update existing student's points
      const updatedLeaderboard = [...leaderboard];
      updatedLeaderboard[existingStudentIndex].points += 1;
      setLeaderboard(updatedLeaderboard);
    } else {
      // Add new student
      setLeaderboard([
        ...leaderboard,
        { name: studentName.trim(), points: 1 }
      ]);
    }

    setStudentName('');
    setShowStudentInput(false);
  };

  // Add or remove points for a student
  const updateStudentPoints = (index, amount) => {
    const updatedLeaderboard = [...leaderboard];
    updatedLeaderboard[index].points += amount;

    // Remove student if points are 0 or negative
    if (updatedLeaderboard[index].points <= 0) {
      updatedLeaderboard.splice(index, 1);
    }

    setLeaderboard(updatedLeaderboard);
  };

  // Remove a student from the leaderboard
  const removeStudent = (index) => {
    const updatedLeaderboard = [...leaderboard];
    updatedLeaderboard.splice(index, 1);
    setLeaderboard(updatedLeaderboard);
  };

  // Function to export leaderboard data to CSV
  const exportLeaderboardToCSV = () => {
    const date = new Date().toLocaleDateString();
    const data = leaderboard.map((student, index) => ({
      Rank: index + 1,
      Name: student.name,
      Points: student.points,
      Date: date,
      Difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1) // Capitalize first letter
    }));

    const csv = Papa.unparse(data, {
      header: true,
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `planet_quiz_leaderboard_${difficulty}_${date.replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render the answer input or result
  const renderAnswerSection = () => {
    if (!answerSubmitted) {
      return (
        <form onSubmit={handleSubmit} className="answer-form">
          <div className="answer-input-container">
            <label>Answer:</label>
            <input
    type="text"
    value={userAnswer}
    onChange={(e) => setUserAnswer(e.target.value)}
    placeholder="Type your answer..."
    className="answer-input"
    autoFocus
    style={{ color: 'white' }} // sets input text color, not placeholder
  />
            <button type="submit" className="submit-btn">Submit</button>
          </div>
        </form>
      );
    } else {
      const resultClass = isCorrect ? "answer-result correct" : "answer-result incorrect";
      return (
        <div className="result-container">
          <div className={resultClass}>
            <p>Answer: {question.answer}</p>
            {isCorrect ?
              <p className="feedback-text">Correct! Great job! 🎉</p> :
              <p className="feedback-text">Incorrect. Try the next one!</p>
            }
          </div>

          {showStudentInput && (
            <form onSubmit={handleStudentSubmit} className="student-form">
              <div className="student-input-container">
                <label>Student's Name:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student's name"
                  className="student-input"
                  autoFocus
                />
                <button type="submit" className="student-submit-btn">Add Point</button>
              </div>
            </form>
          )}

          <button onClick={handleNextQuestion} className="next-btn">Next Question</button>
        </div>
      );
    }
  };

  // Render the 3D model or question mark
  const renderModel = () => {
    if (answerSubmitted) {
      return (
        <model-viewer
          src={question.model}
          alt={question.answer}
          auto-rotate
          camera-controls
          ar
          shadow-intensity="1"
          environment-image="neutral"
          exposure="0.5"
          style={{ width: '100%', height: '100%' }}
        ></model-viewer>
      );
    } else {
      return <div className="question-mark">?</div>;
    }
  };

  // Render student leaderboard
  const renderLeaderboard = () => {
    // Sort leaderboard by points (highest first)
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);

    return (
      <div className="leaderboard-container">
        <h3>Student Leaderboard</h3>
        <div className="difficulty-display">
          Current Difficulty: <span className={`difficulty-label ${difficulty}`}>{difficulty.toUpperCase()}</span>
        </div>

        {sortedLeaderboard.length === 0 ? (
          <p className="no-students">No students yet!</p>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeaderboard.map((student, index) => (
                <tr key={index} className={index === 0 ? 'top-rank' : ''}>
                  <td>{index + 1}</td>
                  <td>{student.name}</td>
                  <td>{student.points}</td>
                  <td className="action-buttons">
                    <button
                      onClick={() => updateStudentPoints(
                        leaderboard.findIndex(s => s.name === student.name),
                        1
                      )}
                      className="point-btn add-btn"
                    >
                      +
                    </button>
                    <button
                      onClick={() => updateStudentPoints(
                        leaderboard.findIndex(s => s.name === student.name),
                        -1
                      )}
                      className="point-btn subtract-btn"
                    >
                      -
                    </button>
                    <button
                      onClick={() => removeStudent(
                        leaderboard.findIndex(s => s.name === student.name)
                      )}
                      className="remove-btn"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Export button */}
        <button onClick={exportLeaderboardToCSV} className="export-btn">
          SAVE DATA
        </button>

        {/* Manual student add form */}
        <form onSubmit={(e) => {
          e.preventDefault();
          if (studentName.trim() === '') return;

          // Check if student already exists
          const existingStudentIndex = leaderboard.findIndex(
            student => student.name.toLowerCase() === studentName.trim().toLowerCase()
          );

          if (existingStudentIndex !== -1) {
            // Update existing student's points
            const updatedLeaderboard = [...leaderboard];
            updatedLeaderboard[existingStudentIndex].points += 1;
            setLeaderboard(updatedLeaderboard);
          } else {
            // Add new student
            setLeaderboard([
              ...leaderboard,
              { name: studentName.trim(), points: 1 }
            ]);
          }

          setStudentName('');
        }} className="add-student-form">
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Add student manually"
            className="add-student-input"
          />
          <button type="submit" className="add-student-btn">Add</button>
        </form>
      </div>
    );
  };

  // Render game completion screen
  const renderGameCompletion = () => {
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
    const totalQuestions = questionLimits[difficulty];
    
    return (
      <div className="game-completion">
        <div className="completion-header">
          <h2>🎉 Game Completed!</h2>
          <p>Total Questions: {totalQuestions}</p>
          <p>Questions Answered: {questionsAnswered}</p>
        </div>

        <div className="final-leaderboard">
          <h3>Final Results</h3>
          {sortedLeaderboard.length === 0 ? (
            <p className="no-participants">No students participated in this game.</p>
          ) : (
            <div className="results-table">
              <table className="final-results-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student Name</th>
                    <th>Points</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeaderboard.map((student, index) => (
                    <tr key={index} className={index === 0 ? 'winner' : ''}>
                      <td>{index + 1}</td>
                      <td>{student.name}</td>
                      <td>{student.points}</td>
                      <td>{((student.points / questionsAnswered) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="completion-actions">
            <button onClick={exportLeaderboardToCSV} className="export-final-btn">
              📊 Download Results
            </button>
            <Link to="/games">
              <button className="return-menu-btn">Return to Games</button>
            </Link>
            <button 
              onClick={() => {
                // Reset game state
                setGameCompleted(false);
                setScore(0);
                setQuestionsAnswered(0);
                setUsedQuestionIds([]);
                setLeaderboard([]);
                setUserAnswer('');
                setAnswerSubmitted(false);
                setShowStudentInput(false);
                setStudentName('');
                setGameStartTime(new Date());
                setQuestion(getRandomQuestion());
              }} 
              className="play-again-btn"
            >
              🔄 Play Again
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (gameCompleted) {
    return (
      <div className="quiz-container">
        {renderGameCompletion()}
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>Planet Quiz - {difficulty.toUpperCase()}</h2>
        <div className="quiz-stats">
          <p>Score: {score}/{questionsAnswered}</p>
          <p>Progress: {questionsAnswered}/{questionLimits[difficulty]}</p>
          <Link to="/games">
            <button className="menu-btn">Main Menu</button>
          </Link>
        </div>
      </div>

      <div className="quiz-content">
        <div className="model-container">
          {renderModel()}
        </div>

        <div className="question-section">
          <div className="question-container">
            <div className="question-box">
              <p>{question.question}</p>
            </div>

            {renderAnswerSection()}
          </div>

          {renderLeaderboard()}
        </div>
      </div>
    </div>
  );
};

export default PlanetQuiz;