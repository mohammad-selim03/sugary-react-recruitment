import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "../api/axios";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

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
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const decoded: any = jwtDecode(token);
      setUser(decoded?.User || null); // Token may or may not have full user info
    }
  }, [token]);

  // src/auth/AuthProvider.tsx (inside AuthProvider)
  const login = async (username: string, password: string) => {
    try {
      const res = await axios.post("/AdminAccount/Login", {
        UserName: username,
        Password: password,
      });

      if (res.data?.Success && res.data.Token) {
        setToken(res.data.Token);
        setUser(res.data.User || jwtDecode(res.data.Token).User || null);

        localStorage.setItem("token", res.data.Token);
        localStorage.setItem("refreshToken", res.data.RefreshToken);

        navigate("/dashboard");
      } else {
        throw new Error(res.data.Message || "Login failed");
      }
    } catch (err: any) {
      const message =
      err.response?.data?.Message ||
      err.response?.statusText ||
        "Unexpected error during login";
      console.log("err", err);
      toast.error(message || "Something went wrong.")
      throw new Error(message);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.clear();
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
