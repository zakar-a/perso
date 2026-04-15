import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserPlus, Shield, Scissors, MapPin, Check, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSettings = () => {
  const { users, salons, services, addUser, updateServicePrice } = useAppContext();
  const [activeSubTab, setActiveSubTab] = useState('employees');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    username: '',
    password: '',
    role: 'coiffeur',
    assignedSalons: []
  });

  const handleToggleSalon = (salonId) => {
    setNewEmployee(prev => ({
      ...prev,
      assignedSalons: prev.assignedSalons.includes(salonId)
        ? prev.assignedSalons.filter(id => id !== salonId)
        : [...prev.assignedSalons, salonId]
    }));
  };

  const handleSubmitEmployee = (e) => {
    e.preventDefault();
    if (newEmployee.assignedSalons.length === 0) {
      alert("Veuillez assigner au moins un salon.");
      return;
    }
    addUser(newEmployee);
    setShowAddModal(false);
    setNewEmployee({ name: '', username: '', password: '', role: 'coiffeur', assignedSalons: [] });
  };

  return (
    <div className="admin-settings animate-in">
      {/* Sub-Tabs */}
      <div className="glass" style={{ marginBottom: '1.5rem', padding: '4px', borderRadius: '12px', display: 'flex' }}>
        <button 
          onClick={() => setActiveSubTab('employees')}
          style={{ 
            flex: 1, padding: '10px', border: 'none', 
            background: activeSubTab === 'employees' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: activeSubTab === 'employees' ? 'white' : 'var(--text-secondary)',
            borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600
          }}
        >Équipe</button>
        <button 
          onClick={() => setActiveSubTab('services')}
          style={{ 
            flex: 1, padding: '10px', border: 'none', 
            background: activeSubTab === 'services' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: activeSubTab === 'services' ? 'white' : 'var(--text-secondary)',
            borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600
          }}
        >Services & Tarifs</button>
      </div>

      {activeSubTab === 'employees' ? (
        <>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem' }}>Gestion de l'Équipe</h2>
            <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              <UserPlus size={18} /> Ajouter
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.map(user => (
              <div key={user.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    background: user.role === 'patron' ? 'var(--accent-gold)' : 'var(--accent-purple)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Shield size={20} color={user.role === 'patron' ? 'black' : 'white'} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      @{user.username} • {user.role === 'patron' ? 'Patron' : 'Coiffeur'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Accès Salons</div>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    {user.assignedSalons.map(sid => (
                      <span key={sid} style={{ 
                        background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' 
                      }}>#{sid}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="animate-in">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Configuration des Tarifs</h2>
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--surface-border)' }}>Prestation</th>
                  {salons.map(s => (
                    <th key={s.id} style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--surface-border)' }}>
                      #{s.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{service.name}</div>
                    </td>
                    {salons.map(salon => (
                      <td key={salon.id} style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <input 
                            type="number"
                            className="glass"
                            style={{ 
                              width: '60px', padding: '6px', textAlign: 'center', border: 'none', color: 'var(--accent-cyan)',
                              fontWeight: 700, borderRadius: '8px', outline: 'none'
                             }}
                            value={service.prices[salon.id] || 0}
                            onChange={(e) => updateServicePrice(service.id, salon.id, e.target.value)}
                          />
                          <span style={{ marginLeft: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>€</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Les modifications sont enregistrées automatiquement.
          </p>
        </div>
      )}

      {/* Add Employee Modal Overlay */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card" 
              style={{ width: '100%', maxWidth: '450px', position: 'relative' }}
            >
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>

              <h3 style={{ marginBottom: '1.5rem' }}>Nouvel Employé</h3>

              <form onSubmit={handleSubmitEmployee}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nom Complet</label>
                  <input 
                    className="glass"
                    style={{ width: '100%', padding: '12px', color: 'white', border: '1px solid var(--surface-border)', outline: 'none' }}
                    value={newEmployee.name}
                    onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                    required
                  />
                </div>

                <div className="grid-2" style={{ marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Identifiant</label>
                    <input 
                      className="glass"
                      style={{ width: '100%', padding: '12px', color: 'white', outline: 'none' }}
                      value={newEmployee.username}
                      onChange={e => setNewEmployee({...newEmployee, username: e.target.value.toLowerCase()})}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Mot de passe</label>
                    <input 
                      type="password"
                      className="glass"
                      style={{ width: '100%', padding: '12px', color: 'white', outline: 'none' }}
                      value={newEmployee.password}
                      onChange={e => setNewEmployee({...newEmployee, password: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Assignation Salons</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                    {salons.map(salon => (
                      <div 
                        key={salon.id}
                        onClick={() => handleToggleSalon(salon.id)}
                        className="glass"
                        style={{ 
                          padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          border: newEmployee.assignedSalons.includes(salon.id) ? '1px solid var(--accent-cyan)' : '1px solid transparent'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{salon.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{salon.location}</div>
                        </div>
                        {newEmployee.assignedSalons.includes(salon.id) && <Check size={18} color="var(--accent-cyan)" />}
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  Enregistrer l'employé
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSettings;
