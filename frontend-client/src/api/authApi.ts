import axiosClient from './axiosClient';

export interface OtpResponse {
  success: boolean;
  message: string;
  expiresInSeconds?: number;
  phoneNumber?: string;
}

export const authApi = {
  /**
   * Yêu cầu Backend sinh mã OTP 6 số lưu Redis (120s) và in ra Console Spring Boot
   */
  sendOtp: async (phoneNumber: string): Promise<OtpResponse> => {
    return (await axiosClient.post('/auth/otp/send', { phoneNumber })) as unknown as OtpResponse;
  },

  /**
   * Xác thực mã OTP người dùng nhập với giá trị lưu trong Redis
   */
  verifyOtp: async (phoneNumber: string, otp: string): Promise<OtpResponse> => {
    return (await axiosClient.post('/auth/otp/verify', { phoneNumber, otp })) as unknown as OtpResponse;
  },
};
