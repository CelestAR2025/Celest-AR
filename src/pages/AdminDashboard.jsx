import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaCog, 
  FaSignOutAlt, 
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
  FaUserGraduate,
  FaUserTie,
  FaTrophy,
  FaGamepad,
  FaDownload
} from 'react-icons/fa';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Papa from 'papaparse';
import { fixUserDocuments } from '../utils/fixUserData';
import UserManagement from '../components/UserManagement';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    activeToday: 0
  });

  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin or teacher
    if (userProfile && userProfile.role !== 'admin' && userProfile.role !== 'teacher') {
      navigate('/');
    }
    
    // Set default tab based on role
    if (userProfile?.role === 'teacher') {
      setActiveTab('quiz-results');
    } else if (userProfile?.role === 'admin') {
      setActiveTab('users');
    }
  }, [userProfile, navigate]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  // Different menu items based on user role
  const getMenuItems = () => {
    if (userProfile?.role === 'admin') {
      return [
        { id: 'users', label: 'User Management', icon: FaUsers },
        { id: 'quiz-results', label: 'Quiz Results', icon: FaTrophy },
        { id: 'settings', label: 'Settings', icon: FaCog },
      ];
    } else if (userProfile?.role === 'teacher') {
      return [
        { id: 'quiz-results', label: 'My Quiz Results', icon: FaTrophy },
        { id: 'settings', label: 'Profile Settings', icon: FaCog },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement setStats={setStats} />;
      case 'quiz-results':
        return <QuizResultsContent currentUser={currentUser} userProfile={userProfile} />;
      case 'settings':
        return <SettingsContent userProfile={userProfile} />;
      default:
        return <UserManagement setStats={setStats} />;
    }
  };

  if (!userProfile) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🌌</span>
            <h2>CELESTAR</h2>
          </div>
          <div className="admin-info">
            <div className="admin-avatar">
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="admin-details">
              <h3>{userProfile.name || 'Admin'}</h3>
              <p>{userProfile.role}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </h1>
          <div className="header-actions">
            <span className="welcome-text">
              Welcome back, {userProfile.name || userProfile.email}!
            </span>
          </div>
        </header>

        <div className="admin-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};


// Quiz Results Content Component
const QuizResultsContent = ({ currentUser, userProfile }) => {
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [editingResult, setEditingResult] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    fetchQuizResults();
  }, [currentUser, userProfile]);

  const fetchQuizResults = async () => {
    if (!currentUser || !userProfile) return;

    try {
      setLoading(true);
      console.log('Fetching quiz results for user:', currentUser.uid, 'with role:', userProfile.role);
      let quizQuery, starQuery, planetMatchQuery;
      
      if (userProfile.role === 'admin') {
        // Admin can see all results
        quizQuery = query(
          collection(db, 'quizResults'),
          orderBy('timestamp', 'desc')
        );
        starQuery = query(
          collection(db, 'constellationQuizResults'),
          orderBy('timestamp', 'desc')
        );
        planetMatchQuery = query(
          collection(db, 'planetMatchingScores'),
          orderBy('timestamp', 'desc')
        );
      } else {
        // Teachers can only see their own results
        console.log('Creating teacher queries for teacherId:', currentUser.uid);
        quizQuery = query(
          collection(db, 'quizResults'),
          where('teacherId', '==', currentUser.uid),
          orderBy('timestamp', 'desc')
        );
        starQuery = query(
          collection(db, 'constellationQuizResults'),
          where('teacherId', '==', currentUser.uid),
          orderBy('timestamp', 'desc')
        );
        planetMatchQuery = query(
          collection(db, 'planetMatchingScores'),
          where('teacherId', '==', currentUser.uid),
          orderBy('timestamp', 'desc')
        );
      }

      let quizSnapshot, starSnapshot, planetMatchSnapshot;
      const results = [];
      
      // Query quiz results with error handling
      try {
        console.log('Querying quizResults collection...');
        quizSnapshot = await getDocs(quizQuery);
        console.log('Quiz results query returned:', quizSnapshot.size, 'documents');
        quizSnapshot.forEach((doc) => {
          console.log('Quiz doc data:', doc.data());
        });
      } catch (error) {
        console.error('Error querying quizResults:', error);
        // Try without orderBy if timestamp orderBy fails
        try {
          console.log('Retrying quiz query without orderBy...');
          const simpleQuery = query(
            collection(db, 'quizResults'),
            where('teacherId', '==', currentUser.uid)
          );
          quizSnapshot = await getDocs(simpleQuery);
          console.log('Simple quiz query returned:', quizSnapshot.size, 'documents');
        } catch (simpleError) {
          console.error('Simple quiz query also failed:', simpleError);
          quizSnapshot = { docs: [] }; // fallback
        }
      }
      
      // Query constellation quiz results with error handling
      try {
        console.log('Querying constellationQuizResults collection...');
        starSnapshot = await getDocs(starQuery);
        console.log('Star results query returned:', starSnapshot.size, 'documents');
        starSnapshot.forEach((doc) => {
          console.log('Star doc data:', doc.data());
        });
      } catch (error) {
        console.error('Error querying constellationQuizResults:', error);
        // Try without orderBy if timestamp orderBy fails
        try {
          console.log('Retrying constellation quiz query without orderBy...');
          const simpleStarQuery = userProfile.role === 'admin' 
            ? query(collection(db, 'constellationQuizResults'))
            : query(collection(db, 'constellationQuizResults'), where('teacherId', '==', currentUser.uid));
          starSnapshot = await getDocs(simpleStarQuery);
          console.log('Simple constellation quiz query returned:', starSnapshot.size, 'documents');
        } catch (simpleError) {
          console.error('Simple constellation quiz query also failed:', simpleError);
          starSnapshot = { docs: [] }; // fallback
        }
      }
      
      // Query planet matching results with error handling
      try {
        console.log('Querying planetMatchingScores collection...');
        planetMatchSnapshot = await getDocs(planetMatchQuery);
        console.log('Planet matching results query returned:', planetMatchSnapshot.size, 'documents');
        planetMatchSnapshot.forEach((doc) => {
          console.log('Planet matching doc data:', doc.data());
        });
      } catch (error) {
        console.error('Error querying planetMatchingScores:', error);
        // Try without orderBy if timestamp orderBy fails
        try {
          console.log('Retrying planet matching query without orderBy...');
          const simplePlanetQuery = userProfile.role === 'admin' 
            ? query(collection(db, 'planetMatchingScores'))
            : query(collection(db, 'planetMatchingScores'), where('teacherId', '==', currentUser.uid));
          planetMatchSnapshot = await getDocs(simplePlanetQuery);
          console.log('Simple planet matching query returned:', planetMatchSnapshot.size, 'documents');
        } catch (simpleError) {
          console.error('Simple planet matching query also failed:', simpleError);
          planetMatchSnapshot = { docs: [] }; // fallback
        }
      }
      
      // Add quiz results
      quizSnapshot.forEach((doc) => {
        console.log('Quiz result found for teacher:', doc.data());
        results.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
          gameType: 'Planet Quiz'
        });
      });

      // Add constellation quiz results
      starSnapshot.forEach((doc) => {
        console.log('Constellation quiz result found for teacher:', doc.data());
        const data = doc.data();
        results.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          gameType: data.gameType || 'Constellation Quiz' // Use saved gameType or default
        });
      });

      // Add planet matching results
      planetMatchSnapshot.forEach((doc) => {
        console.log('Planet matching result found for teacher:', doc.data());
        results.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
          gameType: 'Planet Memory Match'
        });
      });

      // Sort all results by timestamp
      results.sort((a, b) => b.timestamp - a.timestamp);

      console.log('Total results found:', results.length);
      console.log('Results:', results);
      
      // Debug: Let's also try to fetch all documents without filters to see what exists
      if (results.length === 0) {
        console.log('No results found, checking all collections...');
        try {
          const allQuizDocs = await getDocs(collection(db, 'quizResults'));
          console.log('All quiz docs in collection:', allQuizDocs.size);
          allQuizDocs.forEach((doc) => {
            console.log('Quiz doc ID:', doc.id, 'Data:', doc.data());
          });
          
          const allStarDocs = await getDocs(collection(db, 'constellationQuizResults'));
          console.log('All constellation quiz docs in collection:', allStarDocs.size);
          
          const allPlanetDocs = await getDocs(collection(db, 'planetMatchingScores'));
          console.log('All planet matching docs in collection:', allPlanetDocs.size);
          allPlanetDocs.forEach((doc) => {
            console.log('Planet doc ID:', doc.id, 'Data:', doc.data());
          });
        } catch (debugError) {
          console.error('Debug query failed:', debugError);
        }
      }
      
      setQuizResults(results);
    } catch (error) {
      console.error('Error fetching game results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async (resultId) => {
    try {
      setOperationLoading(true);
      
      // Find the result to determine which collection to delete from
      const result = quizResults.find(r => r.id === resultId);
      let collection_name = 'quizResults'; // default
      
      if (result?.gameType === 'Constellation Quiz') {
        collection_name = 'constellationQuizResults';
      } else if (result?.gameType === 'Planet Memory Match') {
        collection_name = 'planetMatchingScores';
      } else if (result?.gameType === 'Planet Quiz') {
        collection_name = 'quizResults';
      }
      
      await deleteDoc(doc(db, collection_name, resultId));
      
      // Remove from local state
      setQuizResults(prev => prev.filter(result => result.id !== resultId));
      setDeleteConfirm(null);
      
      console.log('Game result deleted successfully');
    } catch (error) {
      console.error('Error deleting game result:', error);
      alert('Error deleting game result. Please try again.');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditResult = async (resultId, updatedData) => {
    try {
      setOperationLoading(true);
      
      // Find the result to determine which collection to update
      const result = quizResults.find(r => r.id === resultId);
      let collection_name = 'quizResults'; // default
      
      if (result?.gameType === 'Constellation Quiz') {
        collection_name = 'constellationQuizResults';
      } else if (result?.gameType === 'Planet Memory Match') {
        collection_name = 'planetMatchingScores';
      } else if (result?.gameType === 'Planet Quiz') {
        collection_name = 'quizResults';
      }
      
      const resultRef = doc(db, collection_name, resultId);
      
      // Update only the editable fields based on game type
      let updatePayload = {
        teacherName: updatedData.teacherName,
        difficulty: updatedData.difficulty
      };

      if (result?.gameType === 'Planet Quiz') {
        updatePayload.leaderboard = updatedData.leaderboard.map((student, index) => ({
          rank: index + 1,
          name: student.name,
          points: student.points,
          percentage: student.percentage
        }));
      } else if (result?.gameType === 'Constellation Quiz') {
        updatePayload.leaderboard = updatedData.leaderboard.map((student, index) => ({
          rank: index + 1,
          name: student.name,
          points: student.points,
          percentage: student.percentage
        }));
        if (updatedData.totalQuestions !== undefined) {
          updatePayload.totalQuestions = updatedData.totalQuestions;
        }
        if (updatedData.questionsAnswered !== undefined) {
          updatePayload.questionsAnswered = updatedData.questionsAnswered;
        }
      } else if (result?.gameType === 'Planet Memory Match') {
        updatePayload.leaderboard = updatedData.leaderboard.map((team, index) => ({
          rank: index + 1,
          teamName: team.teamName,
          completionTime: team.completionTime,
          timeFormatted: team.timeFormatted,
          difficulty: team.difficulty,
          date: team.date
        }));
        if (updatedData.totalTeams !== undefined) {
          updatePayload.totalTeams = updatedData.totalTeams;
        }
        if (updatedData.totalPairs !== undefined) {
          updatePayload.totalPairs = updatedData.totalPairs;
        }
      }
      
      await updateDoc(resultRef, updatePayload);
      
      // Update local state
      setQuizResults(prev => prev.map(result => 
        result.id === resultId 
          ? { ...result, ...updatePayload }
          : result
      ));
      
      setEditingResult(null);
      console.log('Game result updated successfully');
    } catch (error) {
      console.error('Error updating game result:', error);
      alert('Error updating game result. Please try again.');
    } finally {
      setOperationLoading(false);
    }
  };

  const exportAllResults = () => {
    const filteredResults = filterDifficulty === 'all' 
      ? quizResults 
      : quizResults.filter(result => result.difficulty === filterDifficulty);

    const exportData = [];
    
    filteredResults.forEach(result => {
      result.leaderboard.forEach(student => {
        exportData.push({
          Date: result.timestamp.toLocaleDateString(),
          Time: result.timestamp.toLocaleTimeString(),
          Teacher: result.teacherName,
          Difficulty: result.difficulty.toUpperCase(),
          'Total Questions': result.totalQuestions,
          'Questions Answered': result.questionsAnswered,
          'Student Name': student.name,
          Rank: student.rank,
          Points: student.points,
          Percentage: student.percentage + '%'
        });
      });
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `all_quiz_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSingleResult = (result) => {
    const exportData = result.leaderboard.map(student => ({
      Date: result.timestamp.toLocaleDateString(),
      Time: result.timestamp.toLocaleTimeString(),
      Teacher: result.teacherName,
      Difficulty: result.difficulty.toUpperCase(),
      'Total Questions': result.totalQuestions,
      'Questions Answered': result.questionsAnswered,
      'Student Name': student.name,
      Rank: student.rank,
      Points: student.points,
      Percentage: student.percentage + '%'
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `quiz_result_${result.difficulty}_${result.timestamp.toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = filterDifficulty === 'all' 
    ? quizResults 
    : quizResults.filter(result => result.difficulty === filterDifficulty);

  if (loading) {
    return (
      <div className="quiz-results-loading">
        <div className="loading-spinner"></div>
        <p>Loading quiz results...</p>
      </div>
    );
  }

  return (
    <div className="quiz-results-content">
      <div className="quiz-results-header">
        <h3>🎮 Game Results Dashboard</h3>
        <div className="quiz-results-controls">
          <select 
            value={filterDifficulty} 
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="difficulty-filter"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
          <button onClick={exportAllResults} className="export-all-btn">
            <FaDownload /> Export All Results
          </button>
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="no-results">
          <FaGamepad size={48} />
          <h4>No Quiz Results Found</h4>
          <p>No quiz games have been completed yet.</p>
        </div>
      ) : (
        <div className="quiz-results-grid">
          {filteredResults.map((result) => (
            <div key={result.id} className="quiz-result-card">
              <div className="result-header">
                <div className="result-info">
                  <h4>{result.gameType === 'Constellation Quiz' ? '🌟 Constellation Quiz' : result.gameType === 'Planet Memory Match' ? '🧩 Planet Memory Match' : '🪐 Planet Quiz'}</h4>
                  <p className="result-date">{result.timestamp.toLocaleDateString()} at {result.timestamp.toLocaleTimeString()}</p>
                  <p className="result-teacher">Teacher: {result.teacherName}</p>
                </div>
                <div className={`difficulty-badge ${result.difficulty}`}>
                  {result.difficulty.toUpperCase()}
                </div>
              </div>

              <div className="result-stats">
                {result.gameType === 'Constellation Quiz' ? (
                  <>
                    <div className="stat-item">
                      <span className="stat-label">Total Questions:</span>
                      <span className="stat-value">{result.totalQuestions || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Questions Answered:</span>
                      <span className="stat-value">{result.questionsAnswered || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Participants:</span>
                      <span className="stat-value">{result.leaderboard?.length || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Top Score:</span>
                      <span className="stat-value">{result.leaderboard?.[0]?.points || 0} pts</span>
                    </div>
                  </>
                ) : result.gameType === 'Planet Memory Match' ? (
                  <>
                    <div className="stat-item">
                      <span className="stat-label">Total Teams:</span>
                      <span className="stat-value">{result.totalTeams}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Pairs to Match:</span>
                      <span className="stat-value">{result.totalPairs}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Teams Completed:</span>
                      <span className="stat-value">{result.leaderboard?.length || 0}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="stat-item">
                      <span className="stat-label">Total Questions:</span>
                      <span className="stat-value">{result.totalQuestions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Questions Answered:</span>
                      <span className="stat-value">{result.questionsAnswered}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Participants:</span>
                      <span className="stat-value">{result.leaderboard?.length || 0}</span>
                    </div>
                  </>
                )}
              </div>

              {result.gameType === 'Planet Quiz' && result.leaderboard && (
                <div className="result-leaderboard">
                  <h5>Top Performers:</h5>
                  {result.leaderboard.slice(0, 3).map((student, index) => (
                    <div key={index} className="leaderboard-item">
                      <span className="student-rank">#{student.rank}</span>
                      <span className="student-name">{student.name}</span>
                      <span className="student-score">{student.points} pts ({student.percentage}%)</span>
                    </div>
                  ))}
                </div>
              )}

              {result.gameType === 'Planet Memory Match' && result.leaderboard && (
                <div className="result-leaderboard">
                  <h5>Team Rankings:</h5>
                  {result.leaderboard.slice(0, 3).map((team, index) => (
                    <div key={index} className="leaderboard-item">
                      <span className="student-rank">#{team.rank}</span>
                      <span className="student-name">{team.teamName}</span>
                      <span className="student-score">{team.timeFormatted}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.gameType === 'Connect The Stars' && result.constellationDetails && (
                <div className="result-leaderboard">
                  <h5>Constellations Found:</h5>
                  {result.constellationDetails.slice(0, 3).map((constellation, index) => (
                    <div key={index} className="leaderboard-item">
                      <span className="student-rank">🌟</span>
                      <span className="student-name">{constellation.name}</span>
                      <span className="student-score">{constellation.pointsEarned} pts</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="result-actions">
                <button 
                  onClick={() => setSelectedResult(result)} 
                  className="view-details-btn"
                >
                  <FaEye /> View Details
                </button>
                <button 
                  onClick={() => setEditingResult(result)} 
                  className="edit-result-btn"
                  disabled={operationLoading}
                >
                  <FaEdit /> Edit
                </button>
                <button 
                  onClick={() => setDeleteConfirm(result)} 
                  className="delete-result-btn"
                  disabled={operationLoading}
                >
                  <FaTrash /> Delete
                </button>
                <button 
                  onClick={() => exportSingleResult(result)} 
                  className="export-single-btn"
                >
                  <FaDownload /> Export
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Result Modal */}
      {selectedResult && (
        <div className="result-modal-overlay" onClick={() => setSelectedResult(null)}>
          <div className="result-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Quiz Result Details</h3>
              <button onClick={() => setSelectedResult(null)} className="close-modal-btn">×</button>
            </div>
            
            <div className="modal-content">
              <div className="modal-info">
                <p><strong>Date:</strong> {selectedResult.timestamp.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedResult.timestamp.toLocaleTimeString()}</p>
                <p><strong>Teacher:</strong> {selectedResult.teacherName}</p>
                <p><strong>Difficulty:</strong> {selectedResult.difficulty.toUpperCase()}</p>
                {selectedResult.gameType === 'Planet Memory Match' ? (
                  <>
                    <p><strong>Total Teams:</strong> {selectedResult.totalTeams}</p>
                    <p><strong>Pairs to Match:</strong> {selectedResult.totalPairs}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Total Questions:</strong> {selectedResult.totalQuestions}</p>
                    <p><strong>Questions Answered:</strong> {selectedResult.questionsAnswered}</p>
                  </>
                )}
              </div>

              <div className="modal-leaderboard">
                <h4>Complete {selectedResult.gameType === 'Planet Memory Match' ? 'Team Rankings' : 'Leaderboard'}</h4>
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>{selectedResult.gameType === 'Planet Memory Match' ? 'Team Name' : 'Student Name'}</th>
                      {selectedResult.gameType === 'Planet Memory Match' ? (
                        <>
                          <th>Completion Time</th>
                          <th>Difficulty</th>
                        </>
                      ) : (
                        <>
                          <th>Points</th>
                          <th>Percentage</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResult.leaderboard.map((item, index) => (
                      <tr key={index} className={index === 0 ? 'winner' : ''}>
                        <td>#{item.rank}</td>
                        <td>{selectedResult.gameType === 'Planet Memory Match' ? item.teamName : item.name}</td>
                        {selectedResult.gameType === 'Planet Memory Match' ? (
                          <>
                            <td>{item.timeFormatted}</td>
                            <td>{item.difficulty}</td>
                          </>
                        ) : (
                          <>
                            <td>{item.points}</td>
                            <td>{item.percentage}%</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => exportSingleResult(selectedResult)} 
                className="export-modal-btn"
              >
                <FaDownload /> Export This Result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Result Modal */}
      {editingResult && (
        <EditResultModal
          result={editingResult}
          onSave={handleEditResult}
          onCancel={() => setEditingResult(null)}
          loading={operationLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          result={deleteConfirm}
          onConfirm={() => handleDeleteResult(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
          loading={operationLoading}
        />
      )}
    </div>
  );
};

// Edit Result Modal Component
const EditResultModal = ({ result, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    teacherName: result.teacherName,
    difficulty: result.difficulty,
    leaderboard: [...result.leaderboard]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(result.id, formData);
  };

  const updateStudentData = (index, field, value) => {
    const updatedLeaderboard = [...formData.leaderboard];
    updatedLeaderboard[index] = {
      ...updatedLeaderboard[index],
      [field]: field === 'points' ? parseInt(value) || 0 : value
    };
    
    // Recalculate percentage if points changed
    if (field === 'points') {
      const percentage = ((updatedLeaderboard[index].points / result.questionsAnswered) * 100).toFixed(1);
      updatedLeaderboard[index].percentage = percentage;
    }
    
    // Sort by points and reassign ranks
    updatedLeaderboard.sort((a, b) => b.points - a.points);
    updatedLeaderboard.forEach((student, idx) => {
      student.rank = idx + 1;
    });
    
    setFormData({ ...formData, leaderboard: updatedLeaderboard });
  };

  const addStudent = () => {
    const newStudent = {
      rank: formData.leaderboard.length + 1,
      name: '',
      points: 0,
      percentage: '0.0'
    };
    setFormData({
      ...formData,
      leaderboard: [...formData.leaderboard, newStudent]
    });
  };

  const removeStudent = (index) => {
    const updatedLeaderboard = formData.leaderboard.filter((_, i) => i !== index);
    // Reassign ranks
    updatedLeaderboard.forEach((student, idx) => {
      student.rank = idx + 1;
    });
    setFormData({ ...formData, leaderboard: updatedLeaderboard });
  };

  return (
    <div className="result-modal-overlay" onClick={onCancel}>
      <div className="result-modal edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Quiz Result</h3>
          <button onClick={onCancel} className="close-modal-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Teacher Name:</label>
            <input
              type="text"
              value={formData.teacherName}
              onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Difficulty:</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              required
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Student Results:</label>
            <div className="students-list">
              {formData.leaderboard.map((student, index) => (
                <div key={index} className="student-edit-row">
                  <span className="student-rank">#{student.rank}</span>
                  <input
                    type="text"
                    placeholder="Student name"
                    value={student.name}
                    onChange={(e) => updateStudentData(index, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Points"
                    value={student.points}
                    onChange={(e) => updateStudentData(index, 'points', e.target.value)}
                    min="0"
                    max={result.questionsAnswered}
                    required
                  />
                  <span className="student-percentage">{student.percentage}%</span>
                  <button
                    type="button"
                    onClick={() => removeStudent(index)}
                    className="remove-student-btn"
                    disabled={formData.leaderboard.length <= 1}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addStudent} className="add-student-btn">
                <FaPlus /> Add Student
              </button>
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ result, onConfirm, onCancel, loading }) => {
  return (
    <div className="result-modal-overlay" onClick={onCancel}>
      <div className="result-modal delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Quiz Result</h3>
          <button onClick={onCancel} className="close-modal-btn">×</button>
        </div>
        
        <div className="modal-content">
          <div className="delete-warning">
            <FaTrash size={48} color="#e74c3c" />
            <h4>Are you sure you want to delete this quiz result?</h4>
            <p>This action cannot be undone.</p>
          </div>
          
          <div className="result-summary">
            <p><strong>Date:</strong> {result.timestamp.toLocaleDateString()}</p>
            <p><strong>Teacher:</strong> {result.teacherName}</p>
            <p><strong>Difficulty:</strong> {result.difficulty.toUpperCase()}</p>
            <p><strong>Participants:</strong> {result.leaderboard.length} students</p>
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
          <button onClick={onConfirm} className="delete-confirm-btn" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Result'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Settings Content Component
const SettingsContent = ({ userProfile }) => {
  const { updateProfile } = useAuth();
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileData, setProfileData] = useState({
    name: userProfile?.name || '',
    school: userProfile?.school || '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');
    
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setProfileMessage('✅ Profile updated successfully!');
      } else {
        setProfileMessage(`❌ Failed to update profile: ${result.error}`);
      }
    } catch (error) {
      setProfileMessage(`❌ Error: ${error.message}`);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUserDataMigration = async () => {
    setMigrationLoading(true);
    setMigrationMessage('');
    
    try {
      const result = await fixUserDocuments();
      if (result.success) {
        setMigrationMessage(`✅ Migration completed! Fixed ${result.migratedCount} user documents.`);
      } else {
        setMigrationMessage(`❌ Migration failed: ${result.error}`);
      }
    } catch (error) {
      setMigrationMessage(`❌ Migration failed: ${error.message}`);
    } finally {
      setMigrationLoading(false);
    }
  };

  return (
    <div className="settings-content">
      <div className="settings-card">
        <h3>Profile Settings</h3>
        {profileMessage && (
          <div className={`profile-message ${profileMessage.includes('✅') ? 'success' : 'error'}`}>
            {profileMessage}
          </div>
        )}
        <form onSubmit={handleProfileUpdate} className="settings-form">
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              value={profileData.name} 
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="form-group">
            <label>School</label>
            <input 
              type="text" 
              value={profileData.school} 
              onChange={(e) => setProfileData({...profileData, school: e.target.value})}
              placeholder="Enter your school"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={userProfile.email || ''} 
              disabled
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input 
              type="text" 
              value={userProfile.role || ''} 
              disabled
            />
          </div>
          <button 
            type="submit" 
            className="save-btn"
            disabled={profileLoading}
          >
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {userProfile?.role === 'admin' && (
        <>
          <div className="settings-card">
            <h3>System Settings</h3>
            <div className="settings-options">
              <div className="setting-option">
                <label>Enable Email Notifications</label>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="setting-option">
                <label>Auto-backup Data</label>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="setting-option">
                <label>Maintenance Mode</label>
                <input type="checkbox" />
              </div>
            </div>
          </div>

          <div className="settings-card">
            <h3>Database Maintenance</h3>
            <div className="maintenance-section">
              <p>If you're experiencing login issues with existing users, you may need to fix the user document structure.</p>
              <button 
                onClick={handleUserDataMigration}
                disabled={migrationLoading}
                className="migration-btn"
              >
                {migrationLoading ? 'Migrating...' : '🔧 Fix User Data Structure'}
              </button>
              {migrationMessage && (
                <div className="migration-message">
                  {migrationMessage}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
