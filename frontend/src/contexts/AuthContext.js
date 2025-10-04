import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import config from '../config';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  // Hàm lưu token và refreshToken
  const login = React.useCallback((token, refreshToken) => {
    localStorage.setItem('token', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    setIsLoggedIn(true);
    try {
      const decoded = jwtDecode(token);
      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      });
    } catch (e) {
      setUser(null);
    }
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  // Hàm tự động refresh token
  const refreshAccessToken = React.useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return logout();
    try {
      const response = await axios.post(`${config.backendUrl}/auth/refresh`, { refreshToken });
      if (response.data.token) {
        login(response.data.token, response.data.refreshToken || refreshToken);
      } else {
        logout();
      }
    } catch (e) {
      logout();
    }
  }, [login, logout]);

  // Kiểm tra token hết hạn mỗi khi mount hoặc khi đăng nhập
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            refreshAccessToken();
          }
          setUser({
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role
          });
        } catch (e) {
          setUser(null);
          logout();
        }
      } else {
        setUser(null);
      }
    };
    checkToken();
    const interval = setInterval(checkToken, 60 * 1000); // kiểm tra mỗi phút
    return () => clearInterval(interval);
  }, [refreshAccessToken, logout]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);