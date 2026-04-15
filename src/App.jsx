import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import PatronDashboard from './pages/PatronDashboard';
import CoiffeurDashboard from './pages/CoiffeurDashboard';
import AdminSettings from './pages/AdminSettings';
import { Users, LayoutDashboard, Scissors, LogOut, Settings } from 'lucide-react';

const AppContent = () => {
  const { currentUser, logout, loading, error } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Handle automatic role-based tab selection on login
  useEffect(() => {
    if (currentUser) {
      setActiveTab(currentUser.role === 'patron' ? 'dashboard' : 'prestation');
    }
  }, [currentUser]);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px', padding: '2rem', textAlign: 'center' }}>
        <X size={48} color="#ff4d4d" />
        <h2 style={{ color: 'white' }}>Erreur de Configuration</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <div className="glass-card" style={{ fontSize: '0.8rem', textAlign: 'left', marginTop: '1rem' }}>
          Astuce : Vérifiez que les variables <b>VITE_SUPABASE_URL</b> et <b>VITE_SUPABASE_ANON_KEY</b> sont bien configurées sur Netlify.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
        <img src="/mazagan-logo.png" alt="Mazagan" style={{ height: '60px', animation: 'pulse 2s infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', letterSpacing: '2px' }}>CHARGEMENT DES DONNÉES...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="flex-between" style={{ marginBottom: '2rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/mazagan-logo.png" alt="Mazagan" style={{ height: '40px' }} />
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '1px' }}>
              {activeTab === 'dashboard' ? 'Tableau de Bord' : 
               activeTab === 'prestation' ? 'Espace Prestation' : 'Administration'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              {currentUser.name} • {currentUser.role === 'patron' ? 'Administrateur' : 'Coiffeur'}
            </p>
          </div>
        </div>
        <button 
          onClick={logout}
          style={{ 
            background: 'var(--surface-color)', 
            border: '1px solid var(--surface-border)',
            color: 'var(--text-secondary)',
            padding: '8px', 
            borderRadius: '12px', 
            cursor: 'pointer' 
          }}
          title="Déconnexion"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Content */}
      <main className="animate-in">
        {activeTab === 'dashboard' && currentUser.role === 'patron' && <PatronDashboard />}
        {activeTab === 'prestation' && <CoiffeurDashboard />}
        {activeTab === 'admin' && currentUser.role === 'patron' && <AdminSettings />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {currentUser.role === 'patron' && (
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={24} />
            <span>Synthèse</span>
          </a>
        )}
        <a 
          href="#" 
          className={`nav-item ${activeTab === 'prestation' ? 'active' : ''}`} 
          onClick={() => setActiveTab('prestation')}
        >
          <Scissors size={24} />
          <span>Ventes</span>
        </a>
        {currentUser.role === 'patron' && (
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} 
            onClick={() => setActiveTab('admin')}
          >
            <Settings size={24} />
            <span>Équipe</span>
          </a>
        )}
      </nav>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
