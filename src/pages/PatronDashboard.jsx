import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { TrendingUp, CreditCard, Banknote, ShoppingBag, Clock, Trash2, ChevronDown, ChevronUp, Bell, BellOff, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PatronDashboard = () => {
  const { 
    salons, getStats, transactions, downloadCSV, cancelTransaction,
    notifPermission, notifEnabled, setNotifEnabled,
    requestNotificationPermission, sendDailyRecapNotification
  } = useAppContext();
  const [selectedSalon, setSelectedSalon] = useState('all');
  const [timeframe, setTimeframe] = useState('day');
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [customRange, setCustomRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const stats = useMemo(() => 
    getStats(timeframe, selectedSalon, timeframe === 'custom' ? customRange : null), 
    [timeframe, selectedSalon, customRange, transactions]
  );

  const chartData = useMemo(() => {
    return Object.keys(stats.byService)
      .map(name => ({
        name,
        shortName: name.length > 10 ? name.slice(0, 9) + '…' : name,
        value: parseFloat((stats.byService[name] || 0).toFixed(2))
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  const employeeChartData = useMemo(() => {
    const data = {};
    stats.filtered.forEach(t => {
      const name = t.coiffeurName || 'Inconnu';
      data[name] = (data[name] || 0) + (Number(t.amount) || 0);
    });
    return Object.keys(data)
      .map(name => ({
        name,
        shortName: name.length > 12 ? name.slice(0, 11) + '…' : name,
        value: parseFloat(data[name].toFixed(2))
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  const cbAmount = stats.byMethod['CB'] || 0;
  const cashAmount = stats.byMethod['Liquide'] || 0;
  const totalPositiveMethods = Math.max(0, cbAmount) + Math.max(0, cashAmount);
  const cbPercent = totalPositiveMethods > 0 ? Math.round((Math.max(0, cbAmount) / totalPositiveMethods) * 100) : 0;
  const cashPercent = totalPositiveMethods > 0 ? 100 - cbPercent : 0;

  const handleExport = () => {
    downloadCSV(stats.filtered);
  };

  const COLORS = ['#fbbf24', '#22d3ee', '#8b5cf6', '#fb7185', '#34d399'];
  const visibleActivities = showAllActivity ? stats.filtered.slice(0, 20) : stats.filtered.slice(0, 6);

  return (
    <div className="patron-dashboard animate-in">
      {/* Top Header with Export */}
      <div className="flex-between" style={{ marginBottom: '0.85rem' }}>
        <h2 style={{ fontSize: '1.15rem' }}>Synthèse & Activité</h2>
        <button 
          type="button"
          className="glass" 
          onClick={handleExport}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', 
            borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)',
            border: '1px solid rgba(251, 191, 36, 0.25)', cursor: 'pointer'
          }}
        >
          <ShoppingBag size={16} /> Export CSV
        </button>
      </div>

      {/* 20h Daily Push Notification Bar */}
      <div className="glass-card" style={{
        padding: '0.85rem 1rem',
        marginBottom: '0.9rem',
        border: notifEnabled && notifPermission === 'granted'
          ? '1px solid rgba(34, 211, 238, 0.28)'
          : '1px solid rgba(251, 191, 36, 0.28)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: notifEnabled ? 'rgba(251, 191, 36, 0.16)' : 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            {notifEnabled ? <BellRing size={18} color="var(--accent-gold)" /> : <BellOff size={18} color="var(--text-secondary)" />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'white' }}>
              Push Bilan 20h00 (CA / Salon)
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {notifPermission === 'granted'
                ? (notifEnabled ? 'Activé • Envoi auto chaque soir à 20h' : 'En pause')
                : notifPermission === 'denied'
                ? 'Autorisez les notifications dans le navigateur'
                : 'Activez pour recevoir le CA à 20h sur mobile'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {notifPermission !== 'granted' ? (
            <button
              type="button"
              onClick={requestNotificationPermission}
              style={{
                background: 'var(--accent-gold)', color: 'black', border: 'none',
                padding: '7px 12px', borderRadius: '10px', fontSize: '0.76rem', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
              }}
            >
              <Bell size={14} /> Activer
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setNotifEnabled(prev => !prev)}
              style={{
                background: notifEnabled ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255,255,255,0.08)',
                color: notifEnabled ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '7px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {notifEnabled ? 'Actif' : 'Off'}
            </button>
          )}
          <button
            type="button"
            onClick={() => sendDailyRecapNotification(true)}
            style={{
              background: 'rgba(251, 191, 36, 0.15)',
              color: 'var(--accent-gold)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              padding: '7px 11px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Envoyer un test de la notification maintenant"
          >
            Tester
          </button>
        </div>
      </div>

      {/* Salon Filter (Horizontal Touch Pills) */}
      <div className="salon-pills" style={{ marginBottom: '0.875rem' }}>
        <button 
          type="button"
          className={`btn-secondary ${selectedSalon === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedSalon('all')}
          style={{ padding: '8px 14px', fontSize: '0.82rem', borderRadius: '12px', whiteSpace: 'nowrap' }}
        >
          Tous les salons
        </button>
        {salons.map(salon => (
          <button 
            type="button"
            key={salon.id}
            className={`btn-secondary ${selectedSalon === salon.id ? 'active' : ''}`}
            onClick={() => setSelectedSalon(salon.id)}
            style={{ padding: '8px 14px', fontSize: '0.82rem', borderRadius: '12px', whiteSpace: 'nowrap' }}
          >
            {salon.name}
          </button>
        ))}
      </div>

      {/* Timeframe Filter */}
      <div className="glass" style={{ marginBottom: '1rem', padding: '4px', borderRadius: '14px', display: 'flex', gap: '4px' }}>
        {['day', 'week', 'month', 'custom'].map(t => (
          <button 
            type="button"
            key={t}
            onClick={() => setTimeframe(t)}
            style={{ 
              flex: 1, padding: '9px 6px', border: 'none',
              background: timeframe === t ? 'rgba(34, 211, 238, 0.16)' : 'transparent',
              color: timeframe === t ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderRadius: '10px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: timeframe === t ? '700' : '500',
              transition: 'all 0.2s'
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
            style={{ overflow: 'hidden', marginBottom: '1rem' }}
          >
            <div className="glass-card" style={{ padding: '0.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>DÉBUT</label>
                <input 
                  type="date" 
                  className="glass"
                  value={customRange.start}
                  onChange={e => setCustomRange({...customRange, start: e.target.value})}
                  style={{ width: '100%', padding: '8px', color: 'white', border: 'none', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>FIN</label>
                <input 
                  type="date" 
                  className="glass"
                  value={customRange.end}
                  onChange={e => setCustomRange({...customRange, end: e.target.value})}
                  style={{ width: '100%', padding: '8px', color: 'white', border: 'none', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards - Always 2 columns on mobile for quick glance */}
      <div className="grid-kpi" style={{ marginBottom: '1rem' }}>
        <div className="glass-card" style={{ padding: '1rem', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <TrendingUp size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>CA Net</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1.1 }}>
            {stats.totalRevenue.toFixed(2)}€
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Clock size={16} color="var(--accent-purple)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Prestations</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
            {stats.count}
          </div>
        </div>
      </div>

      {/* Payment Methods with Visual Bar */}
      <div className="glass-card" style={{ marginBottom: '1rem', padding: '1.1rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Répartition Paiements
        </h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: totalPositiveMethods > 0 ? '0.85rem' : 0 }}>
          <div style={{ flex: 1, background: 'rgba(34, 211, 238, 0.07)', padding: '0.75rem', borderRadius: '14px', border: '1px solid rgba(34, 211, 238, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 600 }}>
                <CreditCard size={15} /> CB
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{cbPercent}%</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{cbAmount.toFixed(2)}€</div>
          </div>

          <div style={{ flex: 1, background: 'rgba(226, 176, 83, 0.07)', padding: '0.75rem', borderRadius: '14px', border: '1px solid rgba(226, 176, 83, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 600 }}>
                <Banknote size={15} /> Liquide
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{cashPercent}%</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{cashAmount.toFixed(2)}€</div>
          </div>
        </div>

        {totalPositiveMethods > 0 && (
          <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${cbPercent}%`, background: 'var(--accent-cyan)', transition: 'width 0.3s ease' }} />
            <div style={{ width: `${cashPercent}%`, background: 'var(--accent-gold)', transition: 'width 0.3s ease' }} />
          </div>
        )}
      </div>

      {/* Charts Grid - Stacked full-width for maximum legibility on mobile */}
      <div className="grid-charts" style={{ marginBottom: '1rem' }}>
        {/* Service Chart */}
        <div className="glass-card" style={{ padding: '1.15rem' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
              CA par Prestation
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {chartData.length} {chartData.length > 1 ? 'services' : 'service'}
            </span>
          </div>

          {chartData.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Aucune prestation active sur cette période
            </div>
          ) : (
            <>
              <div style={{ width: '100%', height: '210px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 24, right: 12, left: -16, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                    <XAxis 
                      dataKey="shortName" 
                      axisLine={false} 
                      tickLine={false} 
                      interval={0}
                      tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 600 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(v) => `${v}€`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      contentStyle={{ background: '#131624', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontSize: '0.85rem' }}
                      itemStyle={{ color: 'white', fontWeight: 700 }}
                      formatter={(value) => [`${Number(value).toFixed(2)}€`, 'Chiffre d\'Affaires']}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <LabelList 
                        dataKey="value" 
                        position="top" 
                        formatter={(v) => `${v}€`} 
                        style={{ fill: '#ffffff', fontSize: '11px', fontWeight: 700 }} 
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Explicit Legend Pills for Mobile Clarity */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {chartData.map((item, index) => {
                  const pct = stats.totalRevenue > 0 ? Math.round((item.value / stats.totalRevenue) * 100) : 0;
                  return (
                    <div 
                      key={item.name} 
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px', 
                        background: 'rgba(255,255,255,0.04)', padding: '5px 10px', 
                        borderRadius: '10px', fontSize: '0.78rem' 
                      }}
                    >
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{item.name}</span>
                      <span style={{ color: COLORS[index % COLORS.length], fontWeight: 700 }}>{item.value.toFixed(2)}€</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Employee Chart */}
        <div className="glass-card" style={{ padding: '1.15rem' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
              Performance Salariés
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {employeeChartData.length} {employeeChartData.length > 1 ? 'actifs' : 'actif'}
            </span>
          </div>

          {employeeChartData.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Aucune activité salarié sur cette période
            </div>
          ) : (
            <>
              <div style={{ width: '100%', height: `${Math.max(160, employeeChartData.length * 48)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeeChartData} layout="vertical" margin={{ top: 6, right: 56, left: 4, bottom: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="shortName" 
                      type="category" 
                      width={92} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#f8fafc', fontSize: 12, fontWeight: 600 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      contentStyle={{ background: '#131624', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontSize: '0.85rem' }}
                      itemStyle={{ color: 'white', fontWeight: 700 }}
                      formatter={(value) => [`${Number(value).toFixed(2)}€`, 'CA Réalisé']}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={22}>
                      {employeeChartData.map((entry, index) => (
                        <Cell key={`cell-emp-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                      <LabelList 
                        dataKey="value" 
                        position="right" 
                        formatter={(v) => `${v}€`} 
                        style={{ fill: '#fbbf24', fontSize: '12px', fontWeight: 700 }} 
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Employee Breakdown List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {employeeChartData.map((emp, index) => {
                  const pct = stats.totalRevenue > 0 ? Math.round((emp.value / stats.totalRevenue) * 100) : 0;
                  return (
                    <div key={emp.name} className="flex-between" style={{ fontSize: '0.82rem', padding: '4px 6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[(index + 1) % COLORS.length] }} />
                        <span style={{ fontWeight: 600 }}>{emp.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{pct}%</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{emp.value.toFixed(2)}€</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity with Cancellation Support */}
      <div className="glass-card" style={{ padding: '1.15rem' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
            Dernières Activités
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {stats.filtered.length} opération{stats.filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {stats.filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem 0', fontSize: '0.85rem' }}>
              Aucune transaction trouvée
            </p>
          ) : (
            visibleActivities.map(t => {
              const isNegative = t.amount < 0;
              const isCancelled = Boolean(t.isCancelled);
              return (
                <div 
                  key={t.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    gap: '10px',
                    paddingBottom: '10px', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    opacity: isCancelled ? 0.6 : 1
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontWeight: 600, 
                        fontSize: '0.92rem', 
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
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {t.coiffeurName} • {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.paymentMethod}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontWeight: 700, 
                        fontSize: '0.95rem',
                        color: isNegative ? 'var(--accent-rose)' : isCancelled ? 'var(--text-secondary)' : 'var(--accent-gold)',
                        textDecoration: isCancelled ? 'line-through' : 'none'
                      }}>
                        {isNegative ? '' : '+'}{Number(t.amount).toFixed(2)}€
                      </div>
                    </div>

                    {t.amount > 0 && !isCancelled && (
                      <button 
                        type="button"
                        onClick={() => {
                          if (confirm(`Annuler cette prestation (${t.serviceName} - ${Number(t.amount).toFixed(2)}€) ? Le chiffre d'affaires sera recalculé automatiquement.`)) {
                            cancelTransaction(t);
                          }
                        }}
                        title="Annuler cette prestation"
                        style={{ 
                          background: 'rgba(251, 113, 133, 0.12)', 
                          border: '1px solid rgba(251, 113, 133, 0.25)', 
                          color: 'var(--accent-rose)', 
                          width: '34px', height: '34px', borderRadius: '10px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
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

        {stats.filtered.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAllActivity(prev => !prev)}
            style={{
              width: '100%',
              marginTop: '0.85rem',
              padding: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--surface-border)',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {showAllActivity ? (
              <>Voir moins <ChevronUp size={16} /></>
            ) : (
              <>Voir tout ({stats.filtered.length}) <ChevronDown size={16} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PatronDashboard;
