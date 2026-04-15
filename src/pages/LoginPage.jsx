import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const { login } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Small delay to simulate network/processing for "WOW" effect
    setTimeout(() => {
      const result = login(username, password);
      if (!result.success) {
        setError(result.message);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at top right, #1e1b4b 0%, #08090d 60%)'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img 
            src="/mazagan-logo.png" 
            alt="Mazagan Logo" 
            style={{ width: '150px', marginBottom: '1rem', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }} 
          />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Gestion Mazagan
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Accédez à votre espace professionnel
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              IDENTIFIANT
            </label>
            <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
              <User size={18} color="var(--text-secondary)" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="Votre nom d'utilisateur"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: '1rem',
                  width: '100%',
                  outline: 'none',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              MOT DE PASSE
            </label>
            <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
              <Lock size={18} color="var(--text-secondary)" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: '1rem',
                  width: '100%',
                  outline: 'none',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ 
                background: 'rgba(239, 68, 68, 0.15)', 
                color: '#f87171', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', height: '56px', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <div className="loader"></div>
            ) : (
              <>
                <LogIn size={20} /> Se connecter
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            Mazagan Barbershop © 2026<br/>
            Contactez le patron pour obtenir vos accès
          </p>
        </div>
      </motion.div>

      <style>{`
        .loader {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
