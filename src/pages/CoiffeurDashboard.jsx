import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Scissors, CreditCard, Banknote, CheckCircle2, ShoppingBag, Baby, UserCheck, MapPin, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CoiffeurDashboard = () => {
  const { salons, services, transactions, addTransaction, cancelTransaction, getStats, currentUser } = useAppContext();
  
  // Get only salons this user is assigned to (with safe string/number matching)
  const userSalons = useMemo(() => {
    const assigned = currentUser?.assignedSalons || [];
    const matched = salons.filter(s => assigned.some(sid => String(sid) === String(s.id)));
    return matched.length > 0 ? matched : salons;
  }, [salons, currentUser]);

  const [selectedSalonId, setSelectedSalonId] = useState(() => userSalons[0]?.id || 1);
  const [paymentMethod, setPaymentMethod] = useState('CB');
  const [feedback, setFeedback] = useState(null);

  const dailyStats = useMemo(() => getStats('day'), [transactions, currentUser]);

  const triggerFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 2200);
  };

  const handleAddService = async (service) => {
    const tx = await addTransaction(currentUser.id, service.id, paymentMethod, selectedSalonId);
    const name = tx?.serviceName || service.name;
    triggerFeedback(`${name} validé !`, 'success');
  };

  const handleCancelService = async (t) => {
    if (confirm(`Annuler cette prestation (${t.serviceName} - ${Number(t.amount).toFixed(2)}€) ? Le chiffre d'affaires sera recalculé.`)) {
      const res = await cancelTransaction(t);
      if (res) {
        triggerFeedback(`${t.serviceName} annulé • CA recalculé`, 'cancel');
      }
    }
  };

  const getIcon = (service) => {
    const name = (service.name || '').toLowerCase();
    if (name.includes('barbe')) return <UserCheck size={28} />;
    if (name.includes('adulte')) return <Scissors size={28} />;
    if (name.includes('enfant')) return <Baby size={28} />;
    if (name.includes('produit')) return <ShoppingBag size={28} />;
    return <Scissors size={28} />;
  };

  return (
    <div className="coiffeur-dashboard animate-in">
      {/* Salon Selection */}
      <div className="glass-card" style={{ marginBottom: '1rem', padding: '1rem 1.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent-gold)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <MapPin size={18} color="black" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              Salon Actuel
            </div>
            <select 
              value={selectedSalonId} 
              onChange={(e) => setSelectedSalonId(parseInt(e.target.value, 10))}
              style={{ 
                background: 'transparent', border: 'none', color: 'white', fontSize: '1.05rem', fontWeight: 700,
                width: '100%', outline: 'none', cursor: 'pointer'
              }}
            >
              {userSalons.map(s => (
                <option key={s.id} value={s.id} style={{ background: '#08090d', color: 'white' }}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="glass" style={{ marginBottom: '1rem', padding: '5px', borderRadius: '16px', display: 'flex', gap: '6px' }}>
        <button 
          type="button"
          onClick={() => setPaymentMethod('CB')}
          style={{ 
            flex: 1, padding: '12px', border: 'none', 
            background: paymentMethod === 'CB' ? 'rgba(34, 211, 238, 0.16)' : 'transparent',
            color: paymentMethod === 'CB' ? 'white' : 'var(--text-secondary)', 
            borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700, transition: 'all 0.2s'
          }}
        >
          <CreditCard size={18} color={paymentMethod === 'CB' ? 'var(--accent-cyan)' : 'inherit'} /> CB
        </button>
        <button 
          type="button"
          onClick={() => setPaymentMethod('Liquide')}
          style={{ 
            flex: 1, padding: '12px', border: 'none', 
            background: paymentMethod === 'Liquide' ? 'rgba(226, 176, 83, 0.18)' : 'transparent',
            color: paymentMethod === 'Liquide' ? 'white' : 'var(--text-secondary)', 
            borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700, transition: 'all 0.2s'
          }}
        >
          <Banknote size={18} color={paymentMethod === 'Liquide' ? 'var(--accent-gold)' : 'inherit'} /> Espèces
        </button>
      </div>

      {/* Quick Service Grid - Always 2 columns on mobile for fast thumb access */}
      <div className="grid-kpi" style={{ marginBottom: '1rem' }}>
        {services.map(service => {
          const price = (service.prices && (service.prices[String(selectedSalonId)] ?? service.prices[selectedSalonId])) || 0;
          return (
            <motion.button 
              type="button"
              whileTap={{ scale: 0.95 }}
              key={service.id}
              className={`service-btn ${service.color}`}
              onClick={() => handleAddService(service)}
              style={{ padding: '1.1rem 0.75rem' }}
            >
              {getIcon(service)}
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: '0.88rem', opacity: 0.95, lineHeight: 1.2, wordBreak: 'break-word' }}>
                  {service.name}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px' }}>
                  {price}€
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Personal Daily Stats */}
      <div className="glass-card" style={{ padding: '1.15rem', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Vos Stats — Aujourd'hui
        </h3>
        <div className="flex-between">
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1.1 }}>
              {dailyStats.totalRevenue.toFixed(2)}€
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Chiffre d'Affaires Net</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, lineHeight: 1.1 }}>
              {dailyStats.count}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Prestations Actives</div>
          </div>
        </div>
      </div>

      {/* Feedback Overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{ 
              position: 'fixed', bottom: '88px', left: '1rem', right: '1rem',
              display: 'flex', justifyContent: 'center', zIndex: 3000, pointerEvents: 'none'
            }}
          >
            <div className="glass" style={{ 
              background: feedback.type === 'cancel' ? 'rgba(251, 113, 133, 0.22)' : 'rgba(34, 197, 94, 0.22)', 
              backdropFilter: 'blur(20px)', 
              border: feedback.type === 'cancel' ? '1px solid rgba(251, 113, 133, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)',
              color: feedback.type === 'cancel' ? '#fda4af' : '#4ade80', 
              padding: '12px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>
              <CheckCircle2 size={20} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{feedback.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Activity */}
      <div className="glass-card" style={{ padding: '1.15rem', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Dernières Activités (Aujourd'hui)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dailyStats.filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '1rem 0' }}>
              Aucune activité aujourd'hui
            </p>
          ) : (
            dailyStats.filtered.slice(0, 8).map(t => {
              const isNegative = t.amount < 0;
              const isCancelled = Boolean(t.isCancelled);
              return (
                <div 
                  key={t.id} 
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
                    paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    opacity: isCancelled ? 0.6 : 1
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontWeight: 600, fontSize: '0.92rem', 
                        color: isNegative ? 'var(--accent-rose)' : 'white',
                        textDecoration: isCancelled ? 'line-through' : 'none'
                      }}>
                        {isNegative ? `Annulation • ${t.serviceName}` : t.serviceName}
                      </span>
                      {isCancelled && (
                        <span style={{ 
                          fontSize: '0.65rem', padding: '2px 6px', borderRadius: '6px', 
                          background: 'rgba(251, 113, 133, 0.15)', color: 'var(--accent-rose)', fontWeight: 700 
                        }}>
                          Annulée
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.paymentMethod}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <div style={{ 
                      fontWeight: 700, 
                      color: isNegative ? 'var(--accent-rose)' : isCancelled ? 'var(--text-secondary)' : 'var(--accent-gold)',
                      textDecoration: isCancelled ? 'line-through' : 'none'
                    }}>
                      {isNegative ? '' : '+'}{Number(t.amount).toFixed(2)}€
                    </div>
                    {t.amount > 0 && !isCancelled && (
                      <button 
                        type="button"
                        onClick={() => handleCancelService(t)}
                        title="Annuler cette prestation"
                        style={{ 
                          background: 'rgba(251, 113, 133, 0.12)', 
                          border: '1px solid rgba(251, 113, 133, 0.25)', 
                          color: 'var(--accent-rose)', 
                          width: '34px', height: '34px', borderRadius: '10px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="glass-card" style={{ textAlign: 'center', padding: '1rem', opacity: 0.75 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Mazagan Professional Station</p>
      </div>
    </div>
  );
};

export default CoiffeurDashboard;
