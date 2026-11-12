import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, apiRegister } from '../services/api';
import { MOCK_USERS } from '../services/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusbite_user');
    if (saved) {
      try {
        const savedUser = JSON.parse(saved);
        if (savedUser?.role === 'restaurant_owner' && !savedUser.restaurantName) {
          if (savedUser.email === 'owner@campusbite.com') {
            return { ...savedUser, restaurantName: 'Campus Spice Hub' };
          }
          return { ...savedUser, restaurantId: null };
        }
        return savedUser;
      } catch (e) {}
    }
    // Default to Aarav (Customer) for quick out-of-the-box preview
    return MOCK_USERS[0];
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || 'mock-initial-token';
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('campusbite_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('campusbite_user');
      localStorage.removeItem('token');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('token', res.token);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await apiRegister(userData);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('token', res.token);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('campusbite_user');
  };

  // Quick Switcher for Demo & Testing all 3 roles instantly
  const switchRoleDemo = (roleName) => {
    const matched = MOCK_USERS.find((u) => u.role === roleName);
    if (matched) {
      setUser(matched);
      const mockToken = `mock-token-${matched.role}-${matched.id}`;
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('campusbite_user', JSON.stringify(matched));
    }
  };

  const isCustomer = user?.role === 'customer';
  const isOwner = user?.role === 'restaurant_owner';
  const isDelivery = user?.role === 'delivery_partner';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchRoleDemo,
        isCustomer,
        isOwner,
        isDelivery,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
