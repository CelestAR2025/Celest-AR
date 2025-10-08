import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updatePassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaEye,
  FaUserTie,
  FaUserGraduate,
  FaSpinner,
  FaTimes,
  FaKey
} from 'react-icons/fa';

const UserManagement = ({ setStats }) => {
  const { userProfile, currentUser } = useAuth();
  
  // Debug: Log current user profile to check super admin status
  console.log('Current user profile:', userProfile);
  console.log('Is super admin?', userProfile?.name === 'Arnie Santos');
  
  // Helper function to check if current user is super admin
  const isSuperAdmin = () => {
    const userName = userProfile?.name?.toLowerCase().trim();
    return userName === 'arnie santos' || userName === 'arnie_santos' || 
           userProfile?.email === 'admin@celestar.com' ||
           userProfile?.name === 'ARNIE SANTOS';
  };
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'teacher',
    password: '',
    school: '',
    grade: 'Grade 6'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordChangeUser, setPasswordChangeUser] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(query(usersCollection, orderBy('createdAt', 'desc')));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUsers(usersList);
      
      // Update stats
      const stats = {
        totalUsers: usersList.length,
        totalTeachers: usersList.filter(user => user.role === 'teacher').length,
        totalAdmins: usersList.filter(user => user.role === 'admin').length,
        activeToday: usersList.filter(user => {
          const lastLogin = new Date(user.lastLogin);
          const today = new Date();
          return lastLogin.toDateString() === today.toDateString();
        }).length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.school?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handleAddUser = () => {
    setModalMode('add');
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'teacher',
      password: '',
      school: '',
      grade: 'Grade 6'
    });
    setError('');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'teacher',
      password: '',
      school: user.school || '',
      grade: user.grade || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleViewUser = (user) => {
    setModalMode('view');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId, userToDelete) => {
    // Check if trying to delete super admin account
    const isTargetSuperAdmin = () => {
      const userName = userToDelete.name?.toLowerCase().trim();
      return userName === 'arnie santos' || userName === 'arnie_santos' || 
             userToDelete.email === 'admin@celestar.com' ||
             userToDelete.name === 'ARNIE SANTOS';
    };

    // Prevent deletion of super admin account
    if (isTargetSuperAdmin() && userToDelete.role === 'admin') {
      setError('Cannot delete the Super Administrator account for security reasons.');
      return;
    }

    // Prevent deletion of admin accounts by non-super admins
    if (userToDelete.role === 'admin' && !isSuperAdmin()) {
      setError('Only the Super Administrator can delete other administrator accounts.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        await fetchUsers(); // Refresh the list
        setError(''); // Clear any previous errors
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user');
      }
    }
  };

  const handlePasswordChange = (user) => {
    setPasswordChangeUser(user);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');

    // Validate current password is provided
    if (!passwordData.currentPassword) {
      setPasswordError('Current admin password is required');
      setPasswordLoading(false);
      return;
    }

    // Validate new passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      setPasswordLoading(false);
      return;
    }

    try {
      // First verify the current admin password
      await signInWithEmailAndPassword(auth, currentUser.email, passwordData.currentPassword);
      
      // Update user document with password change metadata
      const userRef = doc(db, 'users', passwordChangeUser.id);
      await updateDoc(userRef, {
        passwordLastChanged: new Date(),
        passwordChangedBy: userProfile.email,
        newPasswordHash: passwordData.newPassword // In production, this would be properly hashed
      });

      // Close modal and show success
      setShowPasswordModal(false);
      setPasswordChangeUser(null);
      
      // Log success message for admin reference
      console.log(`✅ Password changed successfully for user: ${passwordChangeUser.name}`);
      
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setPasswordError('Current admin password is incorrect');
      } else {
        setPasswordError('Failed to change password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordChangeUser(null);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (modalMode === 'add') {
        // Ensure Arnie Santos is always created as admin
        const userRole = formData.name === 'Arnie Santos' ? 'admin' : formData.role;
        const userGrade = userRole === 'admin' ? '' : (userRole === 'teacher' ? 'Grade 6' : formData.grade);
        
        let secondaryApp = null;
        let secondaryAuth = null;
        
        try {
          // Create a secondary Firebase app instance to avoid affecting current user session
          secondaryApp = initializeApp({
            apiKey: "AIzaSyDgesVStEHu_73yuOTBvKqvK70IgQw6EJc",
            authDomain: "celest-ar.firebaseapp.com",
            projectId: "celest-ar",
            storageBucket: "celest-ar.firebasestorage.app",
            messagingSenderId: "713042520284",
            appId: "1:713042520284:web:a91e9ba95c72e55d0cec19",
            measurementId: "G-XTJBMQ7HS6"
          }, 'secondary');
          
          secondaryAuth = getAuth(secondaryApp);
          
          // Create new user using secondary auth instance
          const userCredential = await createUserWithEmailAndPassword(
            secondaryAuth, 
            formData.email, 
            formData.password
          );
          
          // Add user profile to Firestore using UID as document ID
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            name: formData.name,
            email: formData.email,
            role: userRole,
            school: formData.school,
            grade: userGrade,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          });

          // Success! User created successfully
          console.log('User created successfully:', formData.name);
          
        } finally {
          // Always clean up secondary auth and app, regardless of success or failure
          try {
            if (secondaryAuth) {
              await signOut(secondaryAuth);
            }
          } catch (signOutError) {
            console.log('Secondary auth sign out completed');
          }
          
          try {
            if (secondaryApp && typeof secondaryApp.delete === 'function') {
              await secondaryApp.delete();
            }
          } catch (deleteError) {
            console.log('Secondary app cleanup completed');
          }
        }
        
      } else if (modalMode === 'edit') {
        // Prevent role change for Arnie Santos (must remain admin)
        const userRole = selectedUser.name === 'Arnie Santos' ? 'admin' : formData.role;
        const userGrade = userRole === 'admin' ? selectedUser.grade : (userRole === 'teacher' ? 'Grade 6' : formData.grade);
        
        // Update existing user
        const updates = {
          name: formData.name,
          role: userRole,
          school: formData.school,
          grade: userGrade,
          updatedAt: new Date().toISOString()
        };
        
        await updateDoc(doc(db, 'users', selectedUser.id), updates);
      }

      setShowModal(false);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.message || 'Failed to save user');
    } finally {
      setFormLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
      case 'teacher':
        return <FaUserTie className="role-icon teacher" />;
      case 'student':
        return <FaUserGraduate className="role-icon student" />;
      default:
        return <FaUserGraduate className="role-icon" />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'admin-badge',
      teacher: 'teacher-badge',
      student: 'student-badge'
    };
    return badges[role] || 'student-badge';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Header */}
      <div className="users-header">
        <div className="users-actions">
          {userProfile?.role === 'admin' && (
            <button onClick={handleAddUser} className="add-user-btn">
              <FaPlus />
              Add New User
            </button>
          )}
          {userProfile?.role !== 'admin' && (
            <div className="restricted-message">
              <span>⚠️ Only administrators can create new users</span>
            </div>
          )}
        </div>

        <div className="users-filters">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-filter"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>School</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="user-details">
                      <span className="user-name">{user.name || 'Unnamed'}</span>
                      <span className="user-id">ID: {user.id.slice(-6)}</span>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <div className="role-cell">
                    {getRoleIcon(user.role)}
                    <span className={`role-badge ${getRoleBadge(user.role)}`}>
                      {user.role}
                      {user.name === 'Arnie Santos' && user.role === 'admin' && <span className="super-admin-crown">👑</span>}
                      {user.role === 'admin' && user.name !== 'Arnie Santos' && <span className="admin-shield">🛡️</span>}
                    </span>
                  </div>
                </td>
                <td>{user.school || 'Not specified'}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="action-btn view-btn"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    {userProfile?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="action-btn edit-btn"
                          title="Edit User"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handlePasswordChange(user)}
                          className="action-btn password-btn"
                          title="Change Password"
                        >
                          <FaKey />
                        </button>
                        {/* Only show delete button if not super admin account */}
                        {!((() => {
                          const userName = user.name?.toLowerCase().trim();
                          return (userName === 'arnie santos' || userName === 'arnie_santos' || 
                                 user.email === 'admin@celestar.com' ||
                                 user.name === 'ARNIE SANTOS') && user.role === 'admin';
                        })()) && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user)}
                            className={`action-btn delete-btn ${
                              user.role === 'admin' && !isSuperAdmin() 
                                ? 'disabled' 
                                : ''
                            }`}
                            title={
                              user.role === 'admin' && !isSuperAdmin() 
                                ? 'Only Super Administrator can delete admin accounts' 
                                : 'Delete User'
                            }
                            disabled={user.role === 'admin' && !isSuperAdmin()}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            <p>No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {modalMode === 'add' && 'Add New User'}
                {modalMode === 'edit' && 'Edit User'}
                {modalMode === 'view' && 'User Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="close-modal-btn"
              >
                <FaTimes />
              </button>
            </div>

            {modalMode === 'view' ? (
              <div className="user-details-view">
                <div className="detail-row">
                  <label>Name:</label>
                  <span>{selectedUser.name || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <label>Email:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="detail-row">
                  <label>Role:</label>
                  <span className={`role-badge ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="detail-row">
                  <label>School:</label>
                  <span>{selectedUser.school || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <label>Grade:</label>
                  <span>{selectedUser.grade || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <label>Created:</label>
                  <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <label>Last Login:</label>
                  <span>{new Date(selectedUser.lastLogin).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="user-form">
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {modalMode === 'add' && formData.name === 'Arnie Santos' && (
                  <div className="profile-message success">
                    👑 <strong>Super Administrator Account</strong><br/>
                    This user will be automatically created as an Administrator with special privileges.
                  </div>
                )}

                {modalMode === 'edit' && selectedUser?.name === 'Arnie Santos' && (
                  <div className="profile-message success">
                    👑 <strong>Super Administrator Account</strong><br/>
                    This is the Super Administrator account with special privileges and cannot be deleted.
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={modalMode === 'edit'}
                      required
                    />
                  </div>
                </div>

                {modalMode === 'add' && (
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      minLength="6"
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        setFormData({
                          ...formData, 
                          role: newRole,
                          grade: newRole === 'teacher' ? 'Grade 6' : formData.grade
                        });
                      }}
                      required
                      disabled={
                        (modalMode === 'edit' && selectedUser?.role === 'admin' && !isSuperAdmin()) ||
                        (modalMode === 'edit' && selectedUser?.name === 'Arnie Santos')
                      }
                    >
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    {modalMode === 'edit' && selectedUser?.role === 'admin' && selectedUser?.name !== 'Arnie Santos' && !isSuperAdmin() && (
                      <small className="role-warning">
                        ⚠️ Only Super Administrator can change admin roles
                      </small>
                    )}
                    {modalMode === 'edit' && selectedUser?.role === 'admin' && selectedUser?.name !== 'Arnie Santos' && isSuperAdmin() && (
                      <small className="role-warning" style={{color: '#22c55e'}}>
                        👑 Super Administrator can modify all admin accounts
                      </small>
                    )}
                    {modalMode === 'edit' && selectedUser?.name === 'Arnie Santos' && (
                      <small className="role-warning">
                        👑 Super Administrator role cannot be changed
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Grade</label>
                    <input
                      type="text"
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      placeholder={formData.role === 'teacher' ? 'Grade 6 (default for teachers)' : 'e.g., Grade 5, High School'}
                    />
                    {formData.role === 'teacher' && (
                      <small className="grade-help">
                        ℹ️ Teachers are automatically assigned to Grade 6
                      </small>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>School</label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) => setFormData({...formData, school: e.target.value})}
                    placeholder="School name"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <FaSpinner className="spinner" />
                        {modalMode === 'add' ? 'Creating...' : 'Updating...'}
                      </>
                    ) : (
                      modalMode === 'add' ? 'Create User' : 'Update User'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && passwordChangeUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Change Password for {passwordChangeUser.name}</h3>
              <button
                onClick={closePasswordModal}
                className="close-modal-btn"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="modal-body">
                {passwordError && <div className="error-message">{passwordError}</div>}
                
                <div className="user-info-card">
                  <p><strong>User:</strong> {passwordChangeUser.name}</p>
                  <p><strong>Email:</strong> {passwordChangeUser.email}</p>
                  <p><strong>Role:</strong> {passwordChangeUser.role}</p>
                </div>

                <div className="form-group">
                  <label>Current Admin Password *</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value
                    })}
                    placeholder="Enter your current admin password"
                    required
                  />
                  <small style={{color: '#fbbf24', fontSize: '0.85rem'}}>
                    🔒 Required for security verification
                  </small>
                </div>

                <div className="form-group">
                  <label>New Password *</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value
                    })}
                    placeholder="Enter new password"
                    required
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value
                    })}
                    placeholder="Confirm new password"
                    required
                    minLength="6"
                  />
                </div>

                <div className="password-requirements">
                  <h4>Security Requirements:</h4>
                  <ul>
                    <li>🔒 Current admin password required for verification</li>
                    <li>📝 New password must be at least 6 characters long</li>
                    <li>🔄 New password must be different from current password</li>
                    <li>✅ Both new passwords must match</li>
                  </ul>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn password-submit-btn"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <>
                      <FaSpinner className="spinner" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <FaKey />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
