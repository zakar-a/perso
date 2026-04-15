import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safety check before initialization
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [salons, setSalons] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('salon_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data Fetching from Supabase
  useEffect(() => {
    if (!supabase) {
      setError("Configuration Supabase manquante (Variables d'environnement)");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          { data: sData, error: sErr }, 
          { data: uData, error: uErr }, 
          { data: svData, error: svErr }, 
          { data: tData, error: tErr }
        ] = await Promise.all([
          supabase.from('salons').select('*'),
          supabase.from('users').select('*'),
          supabase.from('services').select('*'),
          supabase.from('transactions').select('*').order('timestamp', { ascending: false })
        ]);

        if (sErr || uErr || svErr || tErr) {
          throw new Error("Erreur de connexion à la base de données");
        }
        if (sData) setSalons(sData);
        if (uData && sData) {
          const validSalonIds = sData.map(s => String(s.id));
          const cleanedUsers = uData.map(u => {
            const assigned = u.assigned_salons || [];
            const filtered = assigned.filter(sid => validSalonIds.includes(String(sid)));
            return { ...u, assignedSalons: filtered };
          });
          
          setUsers(cleanedUsers);
          
          // Sync current user if logged in
          if (currentUser) {
            const updatedMe = cleanedUsers.find(u => u.id === currentUser.id);
            if (updatedMe) setCurrentUser(updatedMe);
          }
        }
        if (svData) setServices(svData);
        if (tData) setTransactions(tData.map(t => ({
          ...t, coiffeurId: t.coiffeur_id, coiffeurName: t.coiffeur_name,
          salonId: t.salon_id, serviceId: t.service_id, serviceName: t.service_name, paymentMethod: t.payment_method
        })));
        setLoading(false);
      } catch (err) { 
        console.error("Fetch error:", err); 
        setError("Erreur de chargement des données");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('salon_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, message: 'Identifiants incorrects' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = async (userData) => {
    const id = 'u' + Date.now();
    const newUser = {
      id, username: userData.username, password: userData.password || '123',
      name: userData.name, role: userData.role, assigned_salons: userData.assignedSalons
    };
    const { error } = await supabase.from('users').insert([newUser]);
    if (!error) setUsers(prev => [...prev, { ...userData, id, assignedSalons: userData.assignedSalons }]);
  };

  const updateUser = async (userId, userData) => {
    const updateData = {
      name: userData.name, username: userData.username, password: userData.password,
      role: userData.role, assigned_salons: userData.assignedSalons
    };
    const { error } = await supabase.from('users').update(updateData).eq('id', userId);
    if (!error) setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...userData } : u));
  };

  const deleteUser = async (userId) => {
    if (confirm("Supprimer cet employé ?")) {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (!error) setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const addSalon = async (salonData) => {
    const { data, error } = await supabase.from('salons').insert([salonData]).select();
    if (!error && data) setSalons(prev => [...prev, data[0]]);
  };

  const updateSalon = async (salonId, salonData) => {
    const { error } = await supabase.from('salons').update(salonData).eq('id', salonId);
    if (!error) setSalons(prev => prev.map(s => s.id === salonId ? { ...s, ...salonData } : s));
  };

  const deleteSalon = async (salonId) => {
    if (confirm("Supprimer ce salon ? (Cela l'enlèvera aussi de l'accès des coiffeurs)")) {
      const { error } = await supabase.from('salons').delete().eq('id', salonId);
      if (!error) {
        setSalons(prev => prev.filter(s => s.id !== salonId));
        // Also cleanup in memory for users
        setUsers(prev => prev.map(u => ({
          ...u,
          assignedSalons: u.assignedSalons.filter(sid => sid !== salonId)
        })));
      }
    }
  };

  const addService = async (serviceData) => {
    const { data, error } = await supabase.from('services').insert([serviceData]).select();
    if (!error && data) setServices(prev => [...prev, data[0]]);
  };

  const updateService = async (serviceId, serviceData) => {
    const { error } = await supabase.from('services').update(serviceData).eq('id', serviceId);
    if (!error) setServices(prev => prev.map(s => s.id === serviceId ? { ...s, ...serviceData } : s));
  };

  const deleteService = async (serviceId) => {
    if (confirm("Supprimer cette prestation ?")) {
      const { error } = await supabase.from('services').delete().eq('id', serviceId);
      if (!error) setServices(prev => prev.filter(s => s.id !== serviceId));
    }
  };

  const updateServicePrice = async (serviceId, salonId, newPrice) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    const currentPrices = service.prices || {};
    const priceValue = newPrice === '' ? 0 : parseFloat(newPrice);
    const newPrices = { ...currentPrices, [salonId]: priceValue };
    const { error } = await supabase.from('services').update({ prices: newPrices }).eq('id', serviceId);
    if (!error) setServices(prev => prev.map(s => s.id === serviceId ? { ...s, prices: newPrices } : s));
  };

  const addTransaction = async (coiffeurId, serviceId, paymentMethod, salonId) => {
    const user = users.find(u => u.id === coiffeurId);
    const service = services.find(s => s.id === serviceId);
    const prices = service?.prices || {};
    const price = prices[salonId] || prices[Object.keys(prices)[0]] || 0;
    
    const newTransaction = {
      coiffeur_id: coiffeurId, coiffeur_name: user?.name, salon_id: parseInt(salonId),
      service_id: serviceId, service_name: service?.name, payment_method: paymentMethod, amount: price
    };

    const { data, error } = await supabase.from('transactions').insert([newTransaction]).select();
    if (!error && data) {
      const formatted = {
        ...data[0], coiffeurId: data[0].coiffeur_id, coiffeurName: data[0].coiffeur_name,
        salonId: data[0].salon_id, serviceId: data[0].service_id, serviceName: data[0].service_name,
        paymentMethod: data[0].payment_method
      };
      setTransactions(prev => [formatted, ...prev]);
      return formatted;
    }
    return null;
  };

  const getStats = (filter = 'day', salonId = null, customRange = null) => {
    const now = new Date();
    let filtered = transactions;

    // Filter by salon
    if (salonId && salonId !== 'all') {
      filtered = filtered.filter(t => t.salonId === parseInt(salonId));
    } else if (currentUser && currentUser.role === 'coiffeur' && !salonId) {
      filtered = filtered.filter(t => t.coiffeurId === currentUser.id);
    }

    // Filter by time
    if (filter === 'day') {
      filtered = filtered.filter(t => new Date(t.timestamp).toDateString() === now.toDateString());
    } else if (filter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.timestamp) >= oneWeekAgo);
    } else if (filter === 'month') {
      filtered = filtered.filter(t => new Date(t.timestamp).getMonth() === now.getMonth() && new Date(t.timestamp).getFullYear() === now.getFullYear());
    } else if (filter === 'custom' && customRange) {
      const start = new Date(customRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customRange.end);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => {
        const d = new Date(t.timestamp);
        return d >= start && d <= end;
      });
    }

    const totalRevenue = filtered.reduce((sum, t) => sum + t.amount, 0);
    const count = filtered.length;
    
    const byMethod = filtered.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount;
      return acc;
    }, {});

    const byService = filtered.reduce((acc, t) => {
      acc[t.serviceName] = (acc[t.serviceName] || 0) + t.amount;
      return acc;
    }, {});

    return { totalRevenue, count, byMethod, byService, filtered };
  };

  const downloadCSV = (data) => {
    if (!data || data.length === 0) return;

    // Headers
    const headers = ['Date', 'Heure', 'Salon', 'Employé', 'Service', 'Prix (€)', 'Méthode'];
    
    // Rows
    const rows = data.map(t => {
      const d = new Date(t.timestamp);
      const salon = salons.find(s => s.id === t.salonId)?.name || `Salon ${t.salonId}`;
      return [
        d.toLocaleDateString(),
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        salon,
        t.coiffeurName,
        t.serviceName,
        t.amount.toFixed(2),
        t.paymentMethod
      ].join(';'); // Semicolon is better for European Excel
    });

    const csvContent = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rapport_Mazagan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider value={{ 
      salons, users, services, transactions, 
      currentUser, setCurrentUser, loading, error,
      login, logout, addUser, updateUser, deleteUser,
      addSalon, updateSalon, deleteSalon,
      addService, updateService, deleteService,
      updateServicePrice, addTransaction, 
      getStats, downloadCSV
    }}>
      {children}
    </AppContext.Provider>
  );
};
