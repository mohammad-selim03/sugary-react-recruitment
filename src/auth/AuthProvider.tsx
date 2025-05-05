import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from '../api/axios'; 
import { jwtDecode } from 'jwt-decode';

interface User {
  Username: string;
  FullName: string;
  Email: string;
  Avatar: string;
  Role: { Id: number; Title: string };
  GiftingCountry: { Id: string; Name: string };
  Currency: { Id: string; Symbol: string };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const decoded: any = jwtDecode(token);
      setUser(decoded?.User || null); // Token may or may not have full user info
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await axios.post('/AdminAccount/Login', { UserName: username, Password: password });
    if (res.data.Success) {
      setToken(res.data.Token);
      setUser(res.data.User);
      localStorage.setItem('token', res.data.Token);
      localStorage.setItem('refreshToken', res.data.RefreshToken);
      navigate('/dashboard');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.clear();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
