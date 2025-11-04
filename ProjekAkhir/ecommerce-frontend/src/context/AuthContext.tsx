import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../config/api'; 

// Tipe ApiUser (Sudah Benar)
type ApiUser = {
  id: number;
  email: string;
  name: string | null;
  role: 'PENYEWA' | 'ADMIN';
};

// Tipe Context (Sudah Benar)
interface AuthContextData {
  token: string | null;
  user: ApiUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect (loadAuthData)
  // (File api.ts Anda sudah menangani token secara otomatis via interceptor,
  // jadi kita tidak perlu set header apiClient di sini lagi)
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');

        if (storedToken && storedUser) {
          const parsedUser: ApiUser = JSON.parse(storedUser);
          // Interceptor di api.ts akan mengambil 'userToken' ini secara otomatis
          setToken(storedToken);
          setUser(parsedUser);
        }
      } catch (e) {
        console.error('Gagal memuat data auth', e);
        await AsyncStorage.multiRemove(['userToken', 'userData']);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  // Fungsi LOGIN
  const login = async (email: string, password: string) => {
    try {
      // --- PERBAIKAN: Hapus '/api' ---
      // DARI: '/api/auth/login' (atau ${API_URL}/login)
      // MENJADI:
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { token: newToken, user: newUser } = response.data;
      
      // Interceptor di api.ts akan otomatis menggunakan token baru
      // pada request berikutnya, tapi kita tetap simpan di storage
      await AsyncStorage.setItem('userToken', newToken);
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

    } catch (error: any) {
      let errorMessage = 'Login Gagal';
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Gagal terhubung ke server. Cek IP & koneksi.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      console.error('Login failed', errorMessage); // Ini yang muncul di screenshot
      throw new Error(errorMessage);
    }
  };

  // Fungsi REGISTER
  const register = async (email: string, password: string, name: string) => {
    try {
      // --- PERBAIKAN: Hapus '/api' ---
      // DARI: '/api/auth/register' (atau ${API_URL}/register)
      // MENJADI:
      await apiClient.post('/auth/register', {
        email,
        password,
        name,
      });
    } catch (error: any) {
      let errorMessage = 'Registrasi Gagal';
       if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Gagal terhubung ke server. Cek IP & koneksi.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      console.error('Registration failed', errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Fungsi LOGOUT
  const logout = async () => {
    // Interceptor di api.ts akan otomatis berhenti mengirim token
    // karena kita menghapusnya dari storage
    await AsyncStorage.multiRemove(['userToken', 'userData']);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoggedIn: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};