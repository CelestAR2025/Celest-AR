import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import "../../styles/planetQuiz.css";

// ConstellationQuizChallenge main component
const ConstellationQuizChallenge = () => {
  const [currentView, setCurrentView] = useState('tutorial');
  const [difficulty, setDifficulty] = useState('normal');

  const renderView = () => {
    switch (currentView) {
      case 'tutorial':
        return renderTutorial();
      case 'game':
        return <ConstellationQuizGame 
          difficulty={difficulty} 
          onBack={() => setCurrentView('tutorial')} 
        />;
      default:
        return renderTutorial();
    }
  };

  const renderTutorial = () => {
    return (
      <div className="tutorial-container">
        <div className="tutorial-content">
          <div className="tutorial-image">
            <div className="constellation-preview">
              <div className="star-demo">⭐</div>
              <div className="star-demo">⭐</div>
              <div className="star-demo">⭐</div>
              <div className="star-demo">⭐</div>
              <div className="star-demo">⭐</div>
            </div>
          </div>

          <div className="tutorial-info">
            <h2>🌟 Constellation Quiz 🌟</h2>
            <h3>Objective:</h3>
            <p>Be the first to answer the teacher's constellation questions correctly and earn points! The Constellation Quiz transforms learning about stars and constellations into a fun and competitive recitation game.</p>

            <h3>👨‍🏫 How to Play:</h3>
            <ol>
              <li>Start the Quiz: The system will display random questions about constellations, stars, and celestial phenomena.</li>
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
      <div className="stars-background"></div>
      <div className="star-overlay"></div>
      {renderView()}
    </div>
  );
};

// Constellation Quiz Game Component
const ConstellationQuizGame = ({ onBack, difficulty }) => {
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

  const [leaderboard, setLeaderboard] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [showStudentInput, setShowStudentInput] = useState(false);

  // Game limits based on difficulty (adjusted for 8 constellations)
  const questionLimits = {
    easy: 8,  // All constellations once
    normal: 8, // All constellations once
    hard: 8   // All constellations once
  };

  // Constellation data from Stars.jsx with 2D images
  const starsData = [
    {
      id: "big-dipper",
      name: "Big Dipper",
      image: "/models/2D/bigdipper-with-name.png",
      description: 'The Big Dipper is a prominent star pattern in the night sky, known for its distinctive ladle shape. It is part of the Ursa Major constellation and serves as a helpful guide for stargazers, as its "pointer" stars lead directly to the North Star, Polaris. The Big Dipper is not a constellation itself but an asterism—a recognizable pattern formed by stars that are part of a larger constellation.',
      subtitle: "North Star, Polaris.",
      color: "#3498db"
    },
    {
      id: "small-dipper",
      name: "Small Dipper",
      image: "/models/2D/littledipper-with-name.png",
      description: "The Small Dipper, also known as the Little Dipper, is an asterism in the constellation Ursa Minor. Its handle is formed by stars leading to Polaris, the North Star, which is the end of its handle. Unlike the Big Dipper, the stars of the Small Dipper are fainter and can be more difficult to see in light-polluted areas.",
      subtitle: "Contains Polaris, the North Star.",
      color: "#2980b9"
    },
    { 
      id: "orion", 
      name: "Orion", 
      image: "/models/2D/orion-with-name.png",
      description: "Orion is one of the most recognizable constellations in the night sky, named after a hunter in Greek mythology. Its distinctive pattern includes bright stars forming the figure of a man with a belt and sword. Orion contains two of the ten brightest stars in the sky: Rigel and Betelgeuse, as well as the famous Orion Nebula.",
      subtitle: "The Hunter.",
      color: "#e74c3c" 
    },
    { 
      id: "cancer", 
      name: "Cancer", 
      image: "/models/2D/cancer-with-name.png",
      description: "Cancer is one of the twelve zodiac constellations. It represents a crab in Greek mythology, sent by the goddess Hera to distract Heracles during his fight with the Hydra. Cancer is relatively faint compared to other zodiac constellations, with its brightest star being Al Tarf (Beta Cancri).",
      subtitle: "The Crab.",
      color: "#9b59b6" 
    },
    { 
      id: "leo", 
      name: "Leo", 
      image: "/models/2D/leo-with-name.png",
      description: "Leo is one of the zodiac constellations, representing a lion. It contains many bright stars, including Regulus, one of the brightest stars in the night sky. The constellation forms a distinctive pattern that resembles a crouching lion.",
      subtitle: "The Lion.",
      color: "#f39c12" 
    },
    { 
      id: "taurus", 
      name: "Taurus", 
      image: "/models/2D/taurus-with-name.png",
      description: "Taurus is one of the zodiac constellations, representing the bull in Greek mythology. Its brightest star is Aldebaran, which forms the 'eye' of the bull. The constellation is also home to the Pleiades and Hyades star clusters, which are prominent features in the night sky.",
      subtitle: "The Bull.",
      color: "#e67e22" 
    },
    { 
      id: "libra", 
      name: "Libra", 
      image: "/models/2D/libra-with-name.png",
      description: "Libra is a zodiac constellation representing the scales of justice. It is one of the faintest constellations in the sky and is often associated with balance and harmony. Its brightest stars are Zubeneschamali and Zubenelgenubi.",
      subtitle: "The Scales.",
      color: "#9b59b6" 
    },
    { 
      id: "virgo", 
      name: "Virgo", 
      image: "/models/2D/virgo-with-name.png",
      description: "Virgo is the largest zodiac constellation and represents the maiden in Greek mythology. Its brightest star is Spica, which is one of the brightest stars in the night sky. Virgo is also home to the Virgo Cluster, a large group of galaxies.",
      subtitle: "The Maiden.",
      color: "#2ecc71" 
    }
  ];

  // Generate questions from constellation data based on difficulty
  const generateQuestions = (difficulty) => {
    return starsData.map((constellation, index) => {
      let question = "";
      
      // Remove constellation name from description for cleaner questions
      const cleanDescription = constellation.description.replace(new RegExp(constellation.name, 'gi'), 'I');
      
      if (difficulty === 'easy') {
        // Simple questions using key characteristics
        const easyQuestions = [
          `I am ${constellation.subtitle.toLowerCase()}. ${cleanDescription.split('.')[0]}. What am I?`,
          `I am known as ${constellation.subtitle.toLowerCase()}. ${cleanDescription.split('.')[0]}. What am I?`,
          `I am ${cleanDescription.split('.')[0].toLowerCase()}. What am I?`
        ];
        question = easyQuestions[index % easyQuestions.length];
      } else if (difficulty === 'normal') {
        // Medium complexity questions
        const normalQuestions = [
          `I am ${cleanDescription.split('.')[0].toLowerCase()}. I am known as ${constellation.subtitle.toLowerCase()}. What am I?`,
          `I am ${cleanDescription.split('.')[0].toLowerCase()}. ${cleanDescription.split('.')[1]}. What am I?`,
          `I am known as ${constellation.subtitle.toLowerCase()}. ${cleanDescription.split('.')[0]}. What am I?`
        ];
        question = normalQuestions[index % normalQuestions.length];
      } else {
        // Hard questions with more detailed descriptions
        const hardQuestions = [
          `I am ${cleanDescription.split('.')[0].toLowerCase()}. ${cleanDescription.split('.')[1]}. I am known as ${constellation.subtitle.toLowerCase()}. What am I?`,
          `I am known as ${constellation.subtitle.toLowerCase()}. ${cleanDescription.split('.')[0]}. ${cleanDescription.split('.')[1]}. What am I?`,
          `I am ${cleanDescription.split('.')[0].toLowerCase()}. ${cleanDescription.split('.')[1]}. ${cleanDescription.split('.')[2]}. What am I?`
        ];
        question = hardQuestions[index % hardQuestions.length];
      }

      return {
        id: `${difficulty}-${constellation.id}`,
        question: question,
        answer: constellation.name.toUpperCase(),
        image: constellation.image
      };
    });
  };

  // Questions database organized by difficulty
  const allQuestions = {
    easy: generateQuestions('easy'),
    normal: generateQuestions('normal'),
    hard: generateQuestions('hard')
  };

  const getRandomQuestion = () => {
    const questions = allQuestions[difficulty];
    const availableQuestions = questions.filter(q => !usedQuestionIds.includes(q.id));
    
    if (availableQuestions.length === 0) {
      setUsedQuestionIds([]);
      return questions[Math.floor(Math.random() * questions.length)];
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    setUsedQuestionIds(prev => [...prev, selectedQuestion.id]);
    return selectedQuestion;
  };

  useEffect(() => {
    setQuestion(getRandomQuestion());
    setGameStartTime(new Date());
  }, [difficulty]);

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
          .sort((a, b) => b.points - a.points)
          .map((student, index) => ({
            rank: index + 1,
            name: student.name,
            points: student.points,
            percentage: ((student.points / questionsAnswered) * 100).toFixed(1)
          })),
        gameStartTime: gameStartTime,
        gameEndTime: new Date(),
        timestamp: serverTimestamp(),
        gameType: 'Constellation Quiz'
      };

      const docRef = await addDoc(collection(db, 'constellationQuizResults'), gameData);
      console.log('Constellation Quiz results saved successfully with ID:', docRef.id);
      console.log('Saved game data:', gameData);
    } catch (error) {
      console.error('Error saving game results:', error);
    }
  };

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

    if (newQuestionsAnswered >= questionLimits[difficulty]) {
      setGameCompleted(true);
      setTimeout(() => saveGameResults(), 1000);
    }
  };

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

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (studentName.trim() === '') return;

    const existingStudentIndex = leaderboard.findIndex(
      student => student.name.toLowerCase() === studentName.trim().toLowerCase()
    );

    if (existingStudentIndex !== -1) {
      const updatedLeaderboard = [...leaderboard];
      updatedLeaderboard[existingStudentIndex].points += 1;
      setLeaderboard(updatedLeaderboard);
    } else {
      setLeaderboard([...leaderboard, { name: studentName.trim(), points: 1 }]);
    }

    setStudentName('');
    setShowStudentInput(false);
  };

  const updateStudentPoints = (index, amount) => {
    const updatedLeaderboard = [...leaderboard];
    updatedLeaderboard[index].points += amount;
    if (updatedLeaderboard[index].points <= 0) {
      updatedLeaderboard.splice(index, 1);
    }
    setLeaderboard(updatedLeaderboard);
  };

  const removeStudent = (index) => {
    const updatedLeaderboard = [...leaderboard];
    updatedLeaderboard.splice(index, 1);
    setLeaderboard(updatedLeaderboard);
  };

  const exportLeaderboardToCSV = () => {
    const date = new Date().toLocaleDateString();
    const data = leaderboard.map((student, index) => ({
      Rank: index + 1,
      Name: student.name,
      Points: student.points,
      Date: date,
      Difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    }));

    const csv = Papa.unparse(data, { header: true });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `constellation_quiz_leaderboard_${difficulty}_${date.replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              style={{ color: 'white' }}
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

  const renderModel = () => {
    if (answerSubmitted) {
      return (
        <div className="constellation-image-container">
          <img
            src={question.image}
          alt={question.answer}
            className="constellation-image"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              borderRadius: '10px'
            }}
            onError={(e) => {
              console.error('Image failed to load:', question.image);
              e.target.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', question.image);
            }}
          />
        </div>
      );
    } else {
      return <div className="question-mark">?</div>;
    }
  };

  const renderLeaderboard = () => {
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
                    <button onClick={() => updateStudentPoints(leaderboard.findIndex(s => s.name === student.name), 1)} className="point-btn add-btn">+</button>
                    <button onClick={() => updateStudentPoints(leaderboard.findIndex(s => s.name === student.name), -1)} className="point-btn subtract-btn">-</button>
                    <button onClick={() => removeStudent(leaderboard.findIndex(s => s.name === student.name))} className="remove-btn">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button onClick={exportLeaderboardToCSV} className="export-btn">SAVE DATA</button>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (studentName.trim() === '') return;
          const existingStudentIndex = leaderboard.findIndex(student => student.name.toLowerCase() === studentName.trim().toLowerCase());
          if (existingStudentIndex !== -1) {
            const updatedLeaderboard = [...leaderboard];
            updatedLeaderboard[existingStudentIndex].points += 1;
            setLeaderboard(updatedLeaderboard);
          } else {
            setLeaderboard([...leaderboard, { name: studentName.trim(), points: 1 }]);
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
            <button onClick={exportLeaderboardToCSV} className="export-final-btn">📊 Download Results</button>
            <Link to="/games"><button className="return-menu-btn">Return to Games</button></Link>
            <button onClick={() => {
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
            }} className="play-again-btn">🔄 Play Again</button>
          </div>
        </div>
      </div>
    );
  };

  if (gameCompleted) {
    return <div className="quiz-container">{renderGameCompletion()}</div>;
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>Constellation Quiz - {difficulty.toUpperCase()}</h2>
        <div className="quiz-stats">
          <p>Score: {score}/{questionsAnswered}</p>
          <p>Progress: {questionsAnswered}/{questionLimits[difficulty]}</p>
          <Link to="/games"><button className="menu-btn">Main Menu</button></Link>
        </div>
      </div>

      <div className="quiz-content">
        <div className="model-container">{renderModel()}</div>
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

export default ConstellationQuizChallenge;
