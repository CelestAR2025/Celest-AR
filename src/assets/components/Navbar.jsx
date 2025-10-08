import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };
  
  return (
    <nav className="navbar navbar-expand-lg space-navbar">
      <div className="container">
        <Link className="navbar-brand celestar-brand" to="/">
          <span className="brand-icon">🌟</span>
          <span className="brand-text">CELESTAR</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav space-nav-container">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
              >
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Home</span>
                {location.pathname === '/' && <span className="active-indicator"></span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/planets' ? 'active' : ''}`} 
                to="/planets"
              >
                <span className="nav-icon">🪐</span>
                <span className="nav-text">Planets</span>
                {location.pathname === '/planets' && <span className="active-indicator"></span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/stars' ? 'active' : ''}`} 
                to="/stars"
              >
                <span className="nav-icon">⭐</span>
                <span className="nav-text">Stars</span>
                {location.pathname === '/stars' && <span className="active-indicator"></span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/games' ? 'active' : ''}`} 
                to="/games"
              >
                <span className="nav-icon">🎮</span>
                <span className="nav-text">Games</span>
                {location.pathname === '/games' && <span className="active-indicator"></span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`} 
                to="/explore"
              >
                <span className="nav-icon">🚀</span>
                <span className="nav-text">Explore</span>
                {location.pathname === '/explore' && <span className="active-indicator"></span>}
              </Link>
            </li>
            
            {/* Authentication Links */}
            {currentUser ? (
              <>
                {(userProfile?.role === 'admin' || userProfile?.role === 'teacher') && (
                  <li className="nav-item">
                    <Link 
                      className={`nav-link admin-link ${location.pathname === '/admin' ? 'active' : ''}`} 
                      to="/admin"
                    >
                      <span className="nav-icon">⚙️</span>
                      <span className="nav-text">Admin</span>
                      {location.pathname === '/admin' && <span className="active-indicator admin-indicator"></span>}
                    </Link>
                  </li>
                )}
                <li className="nav-item dropdown">
                  <button 
                    className="nav-link dropdown-toggle user-dropdown" 
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span className="user-avatar">
                      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                    {userProfile?.name || 'User'}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end user-menu">
                    <li>
                      <span className="dropdown-item-text">
                        <strong>{userProfile?.name || 'User'}</strong><br />
                        <small>{userProfile?.role || 'Student'}</small>
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        🚪 Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link 
                  className={`nav-link teacher-login ${location.pathname === '/login' ? 'active' : ''}`} 
                  to="/login"
                >
                  <span className="nav-icon">🎓</span>
                  <span className="nav-text">Teacher Login</span>
                  {location.pathname === '/login' && <span className="active-indicator teacher-indicator"></span>}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;