import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

const SESSION_KEY = 'mab_auth';
const CORRECT_PASSWORD = 'MAbeautyplus64!';

interface PasswordGateProps {
  children: React.ReactNode;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ children }) => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setUnlocked(true);
    } else {
      setError(true);
      setShaking(true);
      setInput('');
      setTimeout(() => setShaking(false), 500);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img
            src="https://i.ibb.co/9wZ2zds/logo.png"
            alt="MAbeautyplus"
            className="h-28 mix-blend-multiply"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-pink-50 rounded-xl mx-auto mb-4">
            <Lock className="h-5 w-5 text-pink-500" />
          </div>

          <h1 className="text-center text-lg font-semibold text-gray-800 mb-1">
            Accès sécurisé
          </h1>
          <p className="text-center text-sm text-gray-400 mb-6">
            Veuillez entrer le mot de passe pour continuer
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''}>
              <input
                type="password"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(false); }}
                placeholder="Mot de passe"
                autoFocus
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                  error
                    ? 'border-red-300 bg-red-50 text-red-700 placeholder-red-300'
                    : 'border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:border-pink-300 focus:bg-white'
                }`}
              />
              {error && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  Mot de passe incorrect
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Accéder
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};

export default PasswordGate;
