import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner, FaTools } from 'react-icons/fa';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fixLoading, setFixLoading] = useState(false);
  const [fixMessage, setFixMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Check if user is admin/teacher
      if (result.profile.role === 'admin' || result.profile.role === 'teacher') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
    
    setLoading(false);
  };

  const fixUserData = async () => {
    setFixLoading(true);
    setFixMessage('');
    
    try {
      console.log('🔧 Starting user data fix...');
      
      // Get all user documents
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      let fixedCount = 0;
      
      for (const docSnapshot of usersSnapshot.docs) {
        const userData = docSnapshot.data();
        const currentDocId = docSnapshot.id;
        const correctDocId = userData.uid;
        
        // If the document ID doesn't match the UID, we need to migrate
        if (currentDocId !== correctDocId) {
          console.log(`Fixing user: ${userData.email}`);
          
          // Create new document with correct ID
          await setDoc(doc(db, 'users', correctDocId), userData);
          
          // Delete old document
          await deleteDoc(doc(db, 'users', currentDocId));
          
          fixedCount++;
          console.log(`✅ Fixed ${userData.email}`);
        }
      }
      
      if (fixedCount > 0) {
        setFixMessage(`✅ Fixed ${fixedCount} user account(s)! You can now login.`);
      } else {
        setFixMessage('ℹ️ All user accounts are already properly configured.');
      }
      
    } catch (error) {
      console.error('Error fixing user data:', error);
      setFixMessage(`❌ Error: ${error.message}`);
    } finally {
      setFixLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="stars"></div>
        <div className="planets"></div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              
              <h1>CELESTAR</h1>
            </div>
            <h2>Login</h2>
          
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <span>⚠️</span>
                {error}
                {error.includes('User profile not found') && (
                  <div className="fix-suggestion">
                    <p>This might be a database issue. Try clicking the fix button below:</p>
                  </div>
                )}
              </div>
            )}

            {fixMessage && (
              <div className={`fix-message ${fixMessage.includes('✅') ? 'success' : fixMessage.includes('❌') ? 'error' : 'info'}`}>
                {fixMessage}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading || fixLoading}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" />
                  Signing In...
                </>
              ) : (
                <>
                  🚀 Sign In
                </>
              )}
            </button>

            {/* Fix Database Button - Only show if there's a login error */}
            {error && error.includes('User profile not found') && (
              <button 
                type="button" 
                className="fix-button"
                onClick={fixUserData}
                disabled={loading || fixLoading}
              >
                {fixLoading ? (
                  <>
                    <FaSpinner className="spinner" />
                    Fixing Database...
                  </>
                ) : (
                  <>
                    <FaTools />
                    Fix Login Issues
                  </>
                )}
              </button>
            )}
          </form>

          <div className="login-footer">
            <p>
              Don't have an account? 
             
                Contact Administrator
              
            </p>
            <Link to="/" className="back-home">
              ← Back to Home
            </Link>
          </div>
        </div>

    
       
      </div>
    </div>
  );
};

export default Login;
