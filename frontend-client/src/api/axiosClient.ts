import axios from 'axios';
import { Capacitor } from '@capacitor/core';

/**
 * Tự động nhận diện môi trường:
 * - Khi chạy trên Android Native App (Capacitor): Gọi tới máy chủ Spring Boot
 *   (10.0.2.2 đối với Android Emulator hoặc IP LAN máy tính đối với điện thoại thật).
 * - Khi chạy trên Web Browser: Dùng relative path '/api/v1' qua Vite proxy.
 */
const getBaseURL = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (Capacitor.isNativePlatform()) {
    // 192.168.100.150 là IP mạng LAN của máy tính, dùng được cho cả điện thoại thật (cùng Wi-Fi) và máy ảo Android
    return 'http://192.168.100.150:8080/api/v1';
  }
  return '/api/v1';
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor xử lý response và bắt lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Lỗi kết nối tới máy chủ thanh toán';
    return Promise.reject(new Error(errorMsg));
  }
);

export default axiosClient;
