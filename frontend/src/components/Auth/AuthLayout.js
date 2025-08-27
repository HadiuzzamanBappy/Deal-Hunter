import React from 'react';


const AuthLayout = ({ children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-indigo-700/80 backdrop-blur-lg">
    <div className="relative bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/30 backdrop-blur-xl animate-fadeIn scale-105 transition-transform duration-300">
      <div className="flex flex-col items-center mb-8">
        <img src="/favicon/logo.PNG" alt="Deal Hunter AI" className="w-20 h-20 mb-3 drop-shadow-xl" />
        <h2 className="text-3xl font-extrabold text-indigo-700 dark:text-purple-300 tracking-tight mb-1">Deal Hunter AI</h2>
        <p className="text-gray-600 dark:text-gray-400 text-base text-center">Sign in or create an account to save deals and access exclusive features.</p>
      </div>
      {children}
    </div>
  </div>
);

export default AuthLayout;
