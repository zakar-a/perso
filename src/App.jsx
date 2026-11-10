import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import PatronDashboard from './pages/PatronDashboard';
import CoiffeurDashboard from './pages/CoiffeurDashboard';
import AdminSettings from './pages/AdminSettings';
import { Users, LayoutDashboard, Scissors, LogOut, Settings, X } from 'lucide-react';

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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
        <img src="/barber-logo.png" alt="BarBer Manager" style={{ height: '80px', animation: 'pulse 2s infinite' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', background: 'linear-gradient(135deg, #d4a847, #fff8e7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>BarBer Manager</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '2px', margin: 0 }}>CHARGEMENT DES DONNÉES...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="flex-between" style={{ marginBottom: '1.1rem', marginTop: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <img src="/barber-logo.png" alt="BarberShop Manager" style={{ height: '38px', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeTab === 'dashboard' ? 'Tableau de Bord' : 
               activeTab === 'prestation' ? 'Espace Prestation' : 'Administration'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.name} • {currentUser.role === 'patron' ? 'Administrateur' : 'Coiffeur'}
            </p>
          </div>
        </div>
        <button 
          type="button"
          onClick={logout}
          style={{ 
            background: 'var(--surface-color)', 
            border: '1px solid var(--surface-border)',
            color: 'var(--text-secondary)',
            padding: '10px', 
            borderRadius: '12px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
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
          <button 
            type="button"
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={22} />
            <span>Synthèse</span>
          </button>
        )}
        <button 
          type="button"
          className={`nav-item ${activeTab === 'prestation' ? 'active' : ''}`} 
          onClick={() => setActiveTab('prestation')}
        >
          <Scissors size={22} />
          <span>Ventes</span>
        </button>
        {currentUser.role === 'patron' && (
          <button 
            type="button"
            className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} 
            onClick={() => setActiveTab('admin')}
          >
            <Settings size={22} />
            <span>Équipe</span>
          </button>
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
