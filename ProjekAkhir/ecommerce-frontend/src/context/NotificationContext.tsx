import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode, 
  useCallback 
} from 'react';
import { useSocket } from './SocketContext'; // Asumsi Anda punya SocketContext
import { useAuth } from './AuthContext';
import apiClient from '../config/api';

// --- Tipe Notifikasi dari API ---
interface ApiNotification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  linkTo: string | null;
}

// --- Tipe yang Disediakan oleh Context ---
interface NotificationContextType {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>; // Untuk mengambil hitungan saat login
  markAsRead: () => Promise<void>; // Untuk membersihkan hitungan saat tab dibuka
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { isLoggedIn } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Mengambil jumlah notifikasi yang belum dibaca dari server.
   * Kita perlu endpoint baru di backend: GET /api/notifications/unread-count
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }
    try {
      // Anda perlu menambahkan endpoint ini di index.js
      const response = await apiClient.get('/notifications/unread-count');
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error("Failed to fetch unread notification count:", error);
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  // Ambil hitungan awal saat status login berubah
  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0); // Reset saat logout
    }
  }, [isLoggedIn, fetchUnreadCount]);

  // Dengarkan event socket
  useEffect(() => {
    if (socket && isLoggedIn) {
      
      // Dengarkan event 'new_notification' yang kita kirim dari backend
      socket.on('new_notification', (notification: ApiNotification) => {
        console.log("🔔 Notifikasi realtime diterima!", notification);
        // Tambah hitungan badge
        setUnreadCount(prevCount => prevCount + 1);
        
        // Di sini Anda juga bisa memicu notifikasi push lokal
        // (menggunakan library seperti notifee)
      });

      // Bersihkan listener saat komponen unmount atau socket berubah
      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket, isLoggedIn]);

  /**
   * Dipanggil saat pengguna membuka NotificationScreen.
   * Mengatur ulang hitungan di frontend dan memberi tahu backend.
   */
  const markAsRead = useCallback(async () => {
    if (!isLoggedIn || unreadCount === 0) return;
    
    // 1. Update UI secara optimis (langsung)
    setUnreadCount(0);
    
    // 2. Beri tahu server di latar belakang
    try {
      // Kita perlu endpoint baru: PUT /api/notifications/mark-all-read
      await apiClient.put('/notifications/mark-all-read');
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
      // Jika gagal, kita bisa ambil ulang hitungan yang benar
      fetchUnreadCount();
    }
  }, [isLoggedIn, unreadCount, fetchUnreadCount]);

  // Nilai yang akan diberikan ke provider
  const value = {
    unreadCount,
    fetchUnreadCount,
    markAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook kustom untuk memudahkan penggunaan context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};