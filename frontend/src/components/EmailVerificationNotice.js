import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

const EmailVerificationNotice = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!user || user.emailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    setLoading(true);
    setMessage('');
    try {
      await sendEmailVerification(user);
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setMessage('Error sending verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Email Verification Required
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Please verify your email address to access all features.
          </p>
          {message && (
            <p className="text-sm text-green-700 dark:text-green-300 mt-2 font-medium">
              {message}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleResendVerification}
            disabled={loading}
            className="bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-700 text-yellow-800 dark:text-yellow-200 text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Resend Email'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationNotice;
