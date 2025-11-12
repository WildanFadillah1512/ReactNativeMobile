import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useRef, 
  ReactNode 
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { BASE_URL } from '../config/api';

// Tipe untuk nilai yang disediakan oleh Context
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

// Buat Context
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Hook kustom untuk menggunakan context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Provider
export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isLoggedIn } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null); // gunakan ref agar tidak trigger re-render

  useEffect(() => {
    // Jika belum login atau token tidak ada → pastikan socket ditutup
    if (!isLoggedIn || !token) {
      if (socketRef.current) {
        console.log('🔌 Memutuskan koneksi socket lama...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    console.log('🔌 Membuat koneksi socket baru...');
    const newSocket = io(BASE_URL, {
      auth: { token },
      transports: ['websocket'], // lebih stabil di React Native
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('✅ Socket terhubung:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket terputus:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.log('⚠️ Gagal konek ke socket:', err.message);
    });

    // Cleanup ketika unmount atau user logout
    return () => {
      console.log('🧹 Membersihkan koneksi socket...');
      newSocket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isLoggedIn, token]); // <- dependency cukup ini, karena ref tidak ikut trigger rerender

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
