import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Konfigurasi Alamat Server ---
// TODO: Ganti IP ini jika alamat server Anda berubah
const IP_ADDRESS = '10.198.203.143'; 
const PORT = 3000;

export const BASE_URL = `http://${IP_ADDRESS}:${PORT}`;
export const API_URL = `${BASE_URL}/api`;

// --- Membuat Instance Axios Utama ---
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Menambahkan timeout 10 detik adalah praktik yang baik
});

// --- Interceptor Permintaan (Request) ---
// Ini adalah fungsi yang "mencegat" setiap permintaan SEBELUM dikirim
apiClient.interceptors.request.use(
  async (config) => {
    // 1. Mengambil token dari penyimpanan lokal
    const token = await AsyncStorage.getItem('userToken');
    
    // 2. Jika token ada, tambahkan ke header Authorization
    if (token) {
      // Ini akan mengautentikasi permintaan Anda di backend
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 3. Kembalikan config yang sudah dimodifikasi
    return config;
  },
  (error) => {
    // Lakukan sesuatu jika ada error saat konfigurasi permintaan
    return Promise.reject(error);
  }
);


// Ekspor instance yang sudah dikonfigurasi
export default apiClient;