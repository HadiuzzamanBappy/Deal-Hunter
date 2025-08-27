import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfileDropdown = ({ onAuthOpen }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleDateString();
  };

  if (!user) {
    return (
      <button
        className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-6 rounded-xl shadow-lg border border-white/30 transition-colors duration-200"
        onClick={onAuthOpen}
      >
        Login / Register
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-xl shadow-lg border border-white/30 transition-colors duration-200"
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt="Profile" 
            className="w-8 h-8 rounded-full border-2 border-white/50"
          />
        ) : (
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {getInitials(user.displayName || user.email)}
          </div>
        )}
        <span className="hidden sm:block truncate max-w-24">
          {user.displayName || user.email?.split('@')[0] || 'User'}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-fadeIn z-[9999]"
             style={{ zIndex: 9999 }}>
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {getInitials(user.displayName || user.email)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {user.displayName || 'Deal Hunter User'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {user.email}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  user.emailVerified 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {user.emailVerified ? '✓ Verified' : '⚠ Unverified'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Account Information</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Account Created:</span>
                <span className="text-gray-900 dark:text-white">{formatDate(user.metadata?.creationTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Sign In:</span>
                <span className="text-gray-900 dark:text-white">{formatDate(user.metadata?.lastSignInTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Provider:</span>
                <span className="text-gray-900 dark:text-white capitalize">
                  {user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                <span className="text-gray-900 dark:text-white font-mono text-xs">{user.uid.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* Privileges */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Your Privileges</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <span>✓</span> Save favorite deals
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <span>✓</span> Access featured items
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <span>✓</span> Personalized recommendations
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <span>✓</span> Price alerts & notifications
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
