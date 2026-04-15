import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [salons, setSalons] = useState(() => {
    const saved = localStorage.getItem('salon_list');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Mazagan - Salon Princier', location: 'Paris 8e' },
      { id: 2, name: 'Mazagan - L\'Atelier', location: 'Paris 15e' },
      { id: 3, name: 'Mazagan - Vogue', location: 'Neuilly' }
    ];
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('salon_users');
    return saved ? JSON.parse(saved) : [
      { id: 'u1', username: 'patron', password: '123', name: 'Patron Mazagan', role: 'patron', assignedSalons: [1, 2, 3] },
      { id: 'c1', username: 'karim', password: '123', name: 'Karim', role: 'coiffeur', assignedSalons: [1, 2] },
      { id: 'c2', username: 'sarah', password: '123', name: 'Sarah', role: 'coiffeur', assignedSalons: [1] }
    ];
  });

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('salon_services');
    return saved ? JSON.parse(saved) : [
      { id: 'barbe', name: 'Taille Barbe', color: 'barbe', prices: { 1: 15, 2: 15, 3: 15 } },
      { id: 'adulte', name: 'Coupe Adulte', color: 'adulte', prices: { 1: 25, 2: 25, 3: 25 } },
      { id: 'enfant', name: 'Coupe Enfant', color: 'enfant', prices: { 1: 18, 2: 18, 3: 18 } },
      { id: 'produit', name: 'Vente Produit', color: 'produit', prices: { 1: 10, 2: 10, 3: 10 } }
    ];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('salon_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('salon_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('salon_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('salon_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('salon_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('salon_list', JSON.stringify(salons));
  }, [salons]);

  useEffect(() => {
    localStorage.setItem('salon_services', JSON.stringify(services));
  }, [services]);

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

  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: 'u' + Date.now(),
      password: userData.password || '123'
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateServicePrice = (serviceId, salonId, newPrice) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          prices: { ...s.prices, [salonId]: parseFloat(newPrice) }
        };
      }
      return s;
    }));
  };

  const addTransaction = (coiffeurId, serviceId, paymentMethod, salonId) => {
    const user = users.find(u => u.id === coiffeurId);
    const service = services.find(s => s.id === serviceId);
    
    // Resolve price based on the selected salon
    const prices = service?.prices || {};
    const price = prices[salonId] || prices[Object.keys(prices)[0]] || 0;
    
    const newTransaction = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      coiffeurId,
      coiffeurName: user?.name || 'Inconnu',
      salonId: parseInt(salonId),
      serviceId,
      serviceName: service?.name || 'Autre',
      paymentMethod,
      amount: price
    };

    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
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
      salons, 
      users,
      services, 
      transactions, 
      currentUser, 
      setCurrentUser, 
      login,
      logout,
      addUser,
      updateServicePrice,
      addTransaction, 
      getStats,
      downloadCSV
    }}>
      {children}
    </AppContext.Provider>
  );
};
