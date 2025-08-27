import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../../firebase';

const ResetPassword = ({ onClose, onSwitch }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const auth = getAuth(app);
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('If your email is registered, you will receive a reset link.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form className="flex flex-col gap-5" onSubmit={handleReset}>
        <input
          type="email"
          className="rounded-xl px-4 py-3 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-lg bg-white/90 dark:bg-gray-800/80 transition-all"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}
        {success && <div className="text-green-500 text-sm text-center font-medium">{success}</div>}
        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-indigo-500 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-200" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <div className="flex justify-end mt-2">
          <button type="button" className="text-indigo-600 dark:text-purple-300 text-sm font-semibold hover:underline" onClick={() => onSwitch('signin')}>
            Back to Sign In
          </button>
        </div>
      </form>
      <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}>
        <span className="text-2xl">&times;</span>
      </button>
    </AuthLayout>
  );
};

export default ResetPassword;
