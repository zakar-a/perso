import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Scissors, User, CreditCard, Banknote, CheckCircle2, ShoppingBag, Baby, UserCheck, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CoiffeurDashboard = () => {
  const { salons, services, addTransaction, getStats, currentUser } = useAppContext();
  
  // Get only salons this user is assigned to
  const userSalons = salons.filter(s => currentUser.assignedSalons.includes(s.id));
  const [selectedSalonId, setSelectedSalonId] = useState(userSalons[0]?.id || 1);
  const [paymentMethod, setPaymentMethod] = useState('CB');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  const handleAddService = (service) => {
    // Record the transaction for the currently selected salon
    const tx = addTransaction(currentUser.id, service.id, paymentMethod, selectedSalonId);
    setLastAdded(tx);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const getIcon = (service) => {
    const name = service.name.toLowerCase();
    if (name.includes('barbe')) return <UserCheck size={32} />;
    if (name.includes('adulte')) return <Scissors size={32} />;
    if (name.includes('enfant')) return <Baby size={32} />;
    if (name.includes('produit')) return <ShoppingBag size={32} />;
    return <Scissors size={32} />;
  };

  return (
    <div className="coiffeur-dashboard animate-in">
      {/* Salon Selection */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-gold)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <MapPin size={20} color="black" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Salon Actuel</div>
            <select 
              value={selectedSalonId} 
              onChange={(e) => setSelectedSalonId(parseInt(e.target.value))}
              style={{ 
                background: 'transparent', border: 'none', color: 'white', fontSize: '1.1rem', fontWeight: 600,
                width: '100%', outline: 'none', appearance: 'none'
              }}
            >
              {userSalons.map(s => <option key={s.id} value={s.id} style={{ background: '#08090d' }}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="glass" style={{ marginBottom: '1.5rem', padding: '6px', borderRadius: '18px', display: 'flex' }}>
        <button 
          onClick={() => setPaymentMethod('CB')}
          style={{ 
            flex: 1, padding: '14px', border: 'none', background: paymentMethod === 'CB' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: paymentMethod === 'CB' ? 'white' : 'var(--text-secondary)', borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 700, transition: 'all 0.2s'
          }}
        >
          <CreditCard size={18} color={paymentMethod === 'CB' ? 'var(--accent-cyan)' : 'inherit'} /> CB
        </button>
        <button 
          onClick={() => setPaymentMethod('Liquide')}
          style={{ 
            flex: 1, padding: '14px', border: 'none', background: paymentMethod === 'Liquide' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: paymentMethod === 'Liquide' ? 'white' : 'var(--text-secondary)', borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 700, transition: 'all 0.2s'
          }}
        >
          <Banknote size={18} color={paymentMethod === 'Liquide' ? 'var(--accent-gold)' : 'inherit'} /> Cash
        </button>
      </div>

      {/* Quick Service Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {services.map(service => (
          <motion.button 
            whileTap={{ scale: 0.95 }}
            key={service.id}
            className={`service-btn ${service.color}`}
            onClick={() => handleAddService(service)}
            style={{ padding: '1.5rem' }}
          >
            {getIcon(service)}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{service.name}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                {/* Dynamically show the price for the selected salon (handled as string key) */}
                {(service.prices && service.prices[String(selectedSalonId)]) || 0}€
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Personal Daily Stats */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Vos Stats - Aujourd'hui</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {getStats('day').totalRevenue.toFixed(2)}€
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Chiffre d'Affaires</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              {getStats('day').count}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Prestations</div>
          </div>
        </div>
      </div>

      {/* Feedback Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{ 
              position: 'fixed', bottom: '100px', left: '0', right: '0',
              display: 'flex', justifyContent: 'center', zIndex: 3000, pointerEvents: 'none'
            }}
          >
            <div className="glass" style={{ 
              background: 'rgba(34, 197, 94, 0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#4ade80', padding: '16px 32px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>
              <CheckCircle2 size={24} />
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{lastAdded?.serviceName} Validé !</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem', opacity: 0.8 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Mazagan Professional Station</p>
      </div>
    </div>
  );
};

export default CoiffeurDashboard;
