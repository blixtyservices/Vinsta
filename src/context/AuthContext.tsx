import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_USER_PROFILE } from '../utils/mockData';

type User = {
  _id: string;
  name?: string;
  phone: string;
  email?: string;
  role: string;
  profileImage?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem('token');
        if (saved) {
          setToken(saved);
          const savedUser = await AsyncStorage.getItem('demoUser');
          setUser(
            savedUser
              ? JSON.parse(savedUser)
              : { ...MOCK_USER_PROFILE },
          );
        }
      } catch {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('demoUser');
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    await AsyncStorage.setItem('token', newToken);
    await AsyncStorage.setItem('demoUser', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('demoUser');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const savedUser = await AsyncStorage.getItem('demoUser');
    setUser(savedUser ? JSON.parse(savedUser) : { ...MOCK_USER_PROFILE });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
