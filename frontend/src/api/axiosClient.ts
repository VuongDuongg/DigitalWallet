import axios from 'axios';

const axiosClient = axios.create({
  // Tự động nhận diện URL: khi chạy local dev dùng proxy /api/v1 hoặc localhost:8080/api/v1
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
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

