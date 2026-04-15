import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserPlus, Shield, Scissors, MapPin, Check, Plus, X, Trash2, Edit2, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSettings = () => {
  const { 
    users, salons, services, 
    addUser, updateUser, deleteUser,
    addSalon, updateSalon, deleteSalon, 
    updateServicePrice 
  } = useAppContext();
  
  const [activeSubTab, setActiveSubTab] = useState('employees');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showSalonModal, setShowSalonModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [employeeFormData, setEmployeeFormData] = useState({
    name: '', username: '', password: '', role: 'coiffeur', assignedSalons: []
  });

  const [salonFormData, setSalonFormData] = useState({
    name: '', location: ''
  });

  const [serviceFormData, setServiceFormData] = useState({
    id: '', name: '', color: 'adulte', prices: {}
  });

  const handleEditService = (service) => {
    setEditingItem(service);
    setServiceFormData(service);
    setShowServiceModal(true);
  };

  const handleEditEmployee = (user) => {
    setEditingItem(user);
    setEmployeeFormData({
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role,
      assignedSalons: user.assignedSalons
    });
    setShowEmployeeModal(true);
  };

  const handleEditSalon = (salon) => {
    setEditingItem(salon);
    setSalonFormData({
      name: salon.name,
      location: salon.location
    });
    setShowSalonModal(true);
  };

  const handleToggleSalonAssignment = (salonId) => {
    setEmployeeFormData(prev => ({
      ...prev,
      assignedSalons: prev.assignedSalons.includes(salonId)
        ? prev.assignedSalons.filter(id => id !== salonId)
        : [...prev.assignedSalons, salonId]
    }));
  };

  const handleSubmitEmployee = (e) => {
    e.preventDefault();
    if (employeeFormData.assignedSalons.length === 0) {
      alert("Veuillez assigner au moins un salon.");
      return;
    }
    
    if (editingItem) {
      updateUser(editingItem.id, employeeFormData);
    } else {
      addUser(employeeFormData);
    }
    
    setShowEmployeeModal(false);
    setEditingItem(null);
    setEmployeeFormData({ name: '', username: '', password: '', role: 'coiffeur', assignedSalons: [] });
  };

  const handleSubmitSalon = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateSalon(editingItem.id, salonFormData);
    } else {
      addSalon(salonFormData);
    }
    setShowSalonModal(false);
    setEditingItem(null);
    setSalonFormData({ name: '', location: '' });
  };

  const handleSubmitService = (e) => {
    e.preventDefault();
    if (editingItem) {
      const { id, ...data } = serviceFormData;
      updateService(editingItem.id, data);
    } else {
      const id = serviceFormData.id || serviceFormData.name.toLowerCase().replace(/\s+/g, '-');
      const newService = { ...serviceFormData, id };
      addService(newService);
    }
    setShowServiceModal(false);
    setEditingItem(null);
    setServiceFormData({ id: '', name: '', color: 'adulte', prices: {} });
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
          onClick={() => setActiveSubTab('salons')}
          style={{ 
            flex: 1, padding: '10px', border: 'none', 
            background: activeSubTab === 'salons' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: activeSubTab === 'salons' ? 'white' : 'var(--text-secondary)',
            borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
          }}
        >Salons</button>
        <button 
          onClick={() => setActiveSubTab('presta')}
          style={{ 
            flex: 1, padding: '10px', border: 'none', 
            background: activeSubTab === 'presta' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: activeSubTab === 'presta' ? 'white' : 'var(--text-secondary)',
            borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
          }}
        >Services</button>
        <button 
          onClick={() => setActiveSubTab('services')}
          style={{ 
            flex: 1, padding: '10px', border: 'none', 
            background: activeSubTab === 'services' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: activeSubTab === 'services' ? 'white' : 'var(--text-secondary)',
            borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
          }}
        >Tarifs</button>
      </div>

      {activeSubTab === 'employees' && (
        <>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem' }}>Gestion de l'Équipe</h2>
            <button className="btn-primary" onClick={() => { setEditingItem(null); setEmployeeFormData({ name: '', username: '', password: '', role: 'coiffeur', assignedSalons: [] }); setShowEmployeeModal(true); }} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      @{user.username} • {user.role === 'patron' ? 'Patron' : 'Coiffeur'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right', marginRight: '10px' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      {user.assignedSalons.map(sid => (
                        <span key={sid} style={{ 
                          background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' 
                        }}>#{salons.find(s=>s.id === sid)?.id || sid}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => handleEditEmployee(user)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}>
                    <Edit2 size={18} />
                  </button>
                  {user.username !== 'patron' && (
                    <button onClick={() => deleteUser(user.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeSubTab === 'salons' && (
        <div className="animate-in">
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem' }}>Gestion des Salons</h2>
            <button className="btn-primary" onClick={() => { setEditingItem(null); setSalonFormData({ name: '', location: '' }); setShowSalonModal(true); }} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              <Plus size={18} /> Ajouter
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {salons.map(salon => (
              <div key={salon.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--surface-border)'
                  }}>
                    <Store size={20} color="var(--accent-cyan)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{salon.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {salon.location}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleEditSalon(salon)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteSalon(salon.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeSubTab === 'presta' && (
        <div className="animate-in">
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem' }}>Gestion des Prestations</h2>
            <button className="btn-primary" onClick={() => { setEditingItem(null); setServiceFormData({ id: '', name: '', color: 'adulte', prices: {} }); setShowServiceModal(true); }} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              <Plus size={18} /> Ajouter
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {services.map(service => (
              <div key={service.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={`service-btn ${service.color}`} style={{ width: '40px', height: '40px', borderRadius: '12px', padding: '0', flexShrink: 0 }}>
                    <Scissors size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{service.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {service.id}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleEditService(service)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteService(service.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'services' && (
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

      {/* Employee Modal Overlay */}
      <AnimatePresence>
        {showEmployeeModal && (
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
                onClick={() => setShowEmployeeModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>

              <h3 style={{ marginBottom: '1.5rem' }}>{editingItem ? 'Modifier' : 'Ajouter'} Employé</h3>

              <form onSubmit={handleSubmitEmployee}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nom Complet</label>
                  <input 
                    className="glass"
                    style={{ width: '100%', padding: '12px', color: 'white', border: '1px solid var(--surface-border)', outline: 'none' }}
                    value={employeeFormData.name}
                    onChange={e => setEmployeeFormData({...employeeFormData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="grid-2" style={{ marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Identifiant</label>
                    <input 
                      className="glass"
                      style={{ width: '100%', padding: '12px', color: 'white', outline: 'none' }}
                      value={employeeFormData.username}
                      onChange={e => setEmployeeFormData({...employeeFormData, username: e.target.value.toLowerCase()})}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Mot de passe</label>
                    <input 
                      type="password"
                      className="glass"
                      style={{ width: '100%', padding: '12px', color: 'white', outline: 'none' }}
                      placeholder={editingItem ? "Laisser vide pour ne pas changer" : "Mot de passe"}
                      value={employeeFormData.password}
                      onChange={e => setEmployeeFormData({...employeeFormData, password: e.target.value})}
                      required={!editingItem}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Assignation Salons</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                    {salons.map(salon => (
                      <div 
                        key={salon.id}
                        onClick={() => handleToggleSalonAssignment(salon.id)}
                        className="glass"
                        style={{ 
                          padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          border: employeeFormData.assignedSalons.includes(salon.id) ? '1px solid var(--accent-cyan)' : '1px solid transparent'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{salon.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{salon.location}</div>
                        </div>
                        {employeeFormData.assignedSalons.includes(salon.id) && <Check size={18} color="var(--accent-cyan)" />}
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  {editingItem ? 'Mettre à jour' : "Enregistrer l'employé"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Salon Modal Overlay */}
      <AnimatePresence>
        {showSalonModal && (
          <div style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card" 
              style={{ width: '100%', maxWidth: '400px', position: 'relative' }}
            >
              <button 
                onClick={() => setShowSalonModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>

              <h3 style={{ marginBottom: '1.5rem' }}>{editingItem ? 'Modifier' : 'Ajouter'} Salon</h3>

              <form onSubmit={handleSubmitSalon}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nom du Salon</label>
                  <input 
                    className="glass"
                    style={{ width: '100%', padding: '12px', color: 'white', border: '1px solid var(--surface-border)', outline: 'none' }}
                    value={salonFormData.name}
                    onChange={e => setSalonFormData({...salonFormData, name: e.target.value})}
                    placeholder="ex: Mazagan Royale"
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Emplacement</label>
                  <input 
                    className="glass"
                    style={{ width: '100%', padding: '12px', color: 'white', border: '1px solid var(--surface-border)', outline: 'none' }}
                    value={salonFormData.location}
                    onChange={e => setSalonFormData({...salonFormData, location: e.target.value})}
                    placeholder="ex: Paris 8e"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  {editingItem ? 'Mettre à jour' : "Créer le salon"}
                </button>
              </form>
            </motion.div>
          </div>
      {/* Service Modal Overlay */}
      <AnimatePresence>
        {showServiceModal && (
          <div style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card" 
              style={{ width: '100%', maxWidth: '400px', position: 'relative' }}
            >
              <button 
                onClick={() => setShowServiceModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>

              <h3 style={{ marginBottom: '1.5rem' }}>{editingItem ? 'Modifier' : 'Ajouter'} Prestation</h3>

              <form onSubmit={handleSubmitService}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nom de la prestation</label>
                  <input 
                    className="glass"
                    style={{ width: '100%', padding: '12px', color: 'white', border: '1px solid var(--surface-border)', outline: 'none' }}
                    value={serviceFormData.name}
                    onChange={e => setServiceFormData({...serviceFormData, name: e.target.value})}
                    placeholder="ex: Coupe VIP"
                    required
                  />
                </div>

                {!editingItem && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Identifiant unique (Optionnel)</label>
                    <input 
                      className="glass"
                      style={{ width: '100%', padding: '12px', color: 'white', border: '1px solid var(--surface-border)', outline: 'none' }}
                      value={serviceFormData.id}
                      onChange={e => setServiceFormData({...serviceFormData, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                      placeholder="ex: coupe-vip"
                    />
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>Style de couleur</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['adulte', 'barbe', 'enfant', 'produit'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setServiceFormData({...serviceFormData, color: c})}
                        className={`service-btn ${c}`}
                        style={{ 
                          padding: '10px', height: 'auto', fontSize: '0.8rem', borderRadius: '12px',
                          border: serviceFormData.color === c ? '2px solid white' : '2px solid transparent'
                        }}
                      >
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  {editingItem ? 'Mettre à jour' : "Créer la prestation"}
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
