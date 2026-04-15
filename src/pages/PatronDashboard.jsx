import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, CreditCard, Banknote, ShoppingBag, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PatronDashboard = () => {
  const { salons, getStats, transactions, downloadCSV } = useAppContext();
  const [selectedSalon, setSelectedSalon] = useState('all');
  const [timeframe, setTimeframe] = useState('day');
  const [customRange, setCustomRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const stats = useMemo(() => 
    getStats(timeframe, selectedSalon, timeframe === 'custom' ? customRange : null), 
    [timeframe, selectedSalon, customRange, transactions]
  );

  const chartData = useMemo(() => {
    return Object.keys(stats.byService).map(name => ({
      name,
      value: stats.byService[name]
    }));
  }, [stats]);

  const handleExport = () => {
    downloadCSV(stats.filtered);
  };

  const COLORS = ['#fbbf24', '#22d3ee', '#8b5cf6', '#fb7185'];

  return (
    <div className="patron-dashboard animate-in">
      {/* Top Header with Export */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem' }}>Analytique</h2>
        <button 
          className="glass" 
          onClick={handleExport}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', 
            borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-gold)',
            border: '1px solid rgba(251, 191, 36, 0.2)'
          }}
        >
          <ShoppingBag size={18} /> Export Excel
        </button>
      </div>

      {/* Salon Filter */}
      <div style={{ marginBottom: '1.5rem', overflowX: 'auto', display: 'flex', gap: '8px', paddingBottom: '4px' }}>
        <button 
          className={`btn-secondary ${selectedSalon === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedSalon('all')}
          style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
        >Tous les salons</button>
        {salons.map(salon => (
          <button 
            key={salon.id}
            className={`btn-secondary ${selectedSalon === salon.id ? 'active' : ''}`}
            onClick={() => setSelectedSalon(salon.id)}
            style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
          >{salon.name}</button>
        ))}
      </div>

      {/* Timeframe Filter */}
      <div className="glass" style={{ marginBottom: '1rem', padding: '4px', borderRadius: '12px', display: 'flex' }}>
        {['day', 'week', 'month', 'custom'].map(t => (
          <button 
            key={t}
            onClick={() => setTimeframe(t)}
            style={{ 
              flex: 1, padding: '8px', border: 'none', background: timeframe === t ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: timeframe === t ? 'white' : 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: timeframe === t ? '600' : '400', textTransform: 'capitalize'
            }}
          >
            {t === 'day' ? 'Jour' : t === 'week' ? 'Semaine' : t === 'month' ? 'Mois' : 'Perso'}
          </button>
        ))}
      </div>

      {/* Custom Range Inputs */}
      <AnimatePresence>
        {timeframe === 'custom' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
          >
            <div className="glass-card" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>DÉBUT</label>
                <input 
                  type="date" 
                  className="glass"
                  value={customRange.start}
                  onChange={e => setCustomRange({...customRange, start: e.target.value})}
                  style={{ width: '100%', padding: '8px', color: 'white', border: 'none', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>FIN</label>
                <input 
                  type="date" 
                  className="glass"
                  value={customRange.end}
                  onChange={e => setCustomRange({...customRange, end: e.target.value})}
                  style={{ width: '100%', padding: '8px', color: 'white', border: 'none', outline: 'none' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CA Total</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats.totalRevenue.toFixed(2)}€</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={18} color="var(--accent-purple)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prestations</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats.count}</div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Répartition Paiements</h3>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>
              <CreditCard size={14} /> CB
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{(stats.byMethod['CB'] || 0).toFixed(2)}€</div>
          </div>
          <div style={{ width: '1px', background: 'var(--surface-border)' }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>
              <Banknote size={14} /> Liquide
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{(stats.byMethod['Liquide'] || 0).toFixed(2)}€</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', height: '240px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Secteurs d'activité</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" hide />
            <Tooltip 
              contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: '8px', color: 'white' }}
              itemStyle={{ color: 'white' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Dernières Activités</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stats.filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>Aucune transaction trouvée</p>
          ) : (
            stats.filtered.slice(0, 5).map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.serviceName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {t.coiffeurName} • {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{t.amount.toFixed(2)}€</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t.paymentMethod}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PatronDashboard;
