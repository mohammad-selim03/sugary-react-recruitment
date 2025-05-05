import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from '../api/axios'; 
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const decoded: any = jwtDecode(token);
      setUser(decoded);
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await axios.post('/AdminAccount/Login', { UserName: username, Password: password });
    if (res.data.Success) {
      setToken(res.data.Token);
      localStorage.setItem('token', res.data.Token);
      localStorage.setItem('refreshToken', res.data.RefreshToken);
      navigate('/dashboard');
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.clear();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
