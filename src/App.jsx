import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import PatronDashboard from './pages/PatronDashboard';
import CoiffeurDashboard from './pages/CoiffeurDashboard';
import AdminSettings from './pages/AdminSettings';
import { Users, LayoutDashboard, Scissors, LogOut, Settings, X, BellRing, Store } from 'lucide-react';

const AppContent = () => {
  const { currentUser, logout, loading, error, dailyRecapModal, setDailyRecapModal } = useAppContext();
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

      {/* 20h Daily Recap Notification Modal for Patron */}
      {dailyRecapModal && currentUser.role === 'patron' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)',
          zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-card animate-in" style={{
            width: '100%', maxWidth: '400px', padding: '1.5rem',
            border: '1px solid rgba(251, 191, 36, 0.35)', position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setDailyRecapModal(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
              }}
            >
              <X size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '14px',
                background: 'rgba(251, 191, 36, 0.16)', border: '1px solid rgba(251, 191, 36, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <BellRing size={22} color="var(--accent-gold)" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Notification Fin de Journée ({dailyRecapModal.time})
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Bilan CA par Salon</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.1rem' }}>
              {dailyRecapModal.salonBreakdown.map(salon => (
                <div key={salon.id} className="flex-between" style={{
                  background: 'rgba(255,255,255,0.04)', padding: '10px 12px',
                  borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Store size={16} color="var(--accent-cyan)" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{salon.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {salon.count} prestation{salon.count > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--accent-gold)' }}>
                    {salon.revenue.toFixed(2)}€
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-between" style={{
              padding: '12px 14px', borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.16), rgba(34, 211, 238, 0.1))',
              border: '1px solid rgba(251, 191, 36, 0.3)', marginBottom: '1.1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Journée
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {dailyRecapModal.totalCount} prestation{dailyRecapModal.totalCount > 1 ? 's' : ''} au total
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                {dailyRecapModal.totalRevenue.toFixed(2)}€
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setDailyRecapModal(null)}
              style={{ width: '100%', padding: '12px' }}
            >
              Fermer le bilan
            </button>
          </div>
        </div>
      )}

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
