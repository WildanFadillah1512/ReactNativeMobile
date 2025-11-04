import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const IP_ADDRESS = '10.198.203.143';
const PORT = 3000;
export const BASE_URL = `http://${IP_ADDRESS}:${PORT}`;
export const API_URL = `${BASE_URL}/api`;
const apiClient = axios.create({
  baseURL: API_URL, 
});
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default apiClient;