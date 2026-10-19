---
name: react-ts-craftsman
description: Chuyên gia phát triển Frontend hiện đại với React (18/19), TypeScript, Vite, Tailwind CSS và Axios. Sử dụng khi thiết kế giao diện, quản lý state, gọi REST API, xử lý biểu mẫu, tối ưu UX/UI hoặc giải quyết các vấn đề TypeScript/ESLint.
---

# React + TypeScript Enterprise Frontend Standards

Bộ quy chuẩn phát triển ứng dụng Frontend tái sử dụng (Reusable Best Practices) cho hệ sinh thái **React, TypeScript, Vite và Tailwind CSS**.

---

## 1. Thiết kế Component & Phân chia trách nhiệm

1. **Nguyên tắc Đơn trách nhiệm (Single Responsibility Principle)**:
   - Mỗi file Component chỉ phục vụ một mục đích giao diện duy nhất.
   - Nếu file vượt quá 200 dòng, chủ động tách thành các sub-components hoặc custom hooks.
2. **Quy tắc Fast Refresh của Vite (`react-refresh/only-export-components`)**:
   - **BẮT BUỘC**: Một file component `.tsx` **chỉ được phép `export` các React Component**.
   - Các hàm tiện ích (utils, helpers), biến regex, hằng số (constants) phải để `const` nội bộ hoặc chuyển ra file `.ts` riêng biệt (ví dụ `utils/formatters.ts`).
3. **Quản lý đủ 4 trạng thái giao diện (The 4 UI States)**:
   Mọi component có tải dữ liệu bất đồng bộ từ API bắt buộc phải triển khai:
   - **Loading State**: Hiển thị Skeleton hoặc Spinner bo tròn tinh tế.
   - **Data State**: Hiển thị dữ liệu chính xác khi thành công.
   - **Empty State**: Giao diện thân thiện kèm icon và lời nhắn hướng dẫn khi không tìm thấy kết quả.
   - **Error State**: Thông báo lỗi rõ ràng kèm nút "Thử lại" (Retry).

---

## 2. Tiêu chuẩn TypeScript Strict Mode

1. **Tuyệt đối không dùng `any`**:
   - Dùng `unknown` khi chưa rõ kiểu, sau đó ép kiểu bằng type guard hoặc generic `<T>`.
2. **Props Typing**:
   - Định nghĩa `interface XxxProps` rõ ràng.
   - Sử dụng Discriminated Unions cho các trạng thái đối lập:
     ```typescript
     type ButtonProps = {
       children: React.ReactNode;
     } & (
       | { variant: 'primary' | 'secondary'; outline?: never }
       | { variant?: never; outline: boolean }
     );
     ```
3. **Loại bỏ tham số thừa gây cảnh báo ESLint**:
   - Không destructure các tham số không dùng tới trong callbacks hoặc component props (ví dụ `@typescript-eslint/no-unused-vars`).

---

## 3. Quản lý REST API Client (Axios)

Tạo một `axiosClient` duy nhất tái sử dụng cho toàn bộ dự án:

```typescript
import axios from 'axios';

const axiosClient = axios.create({
  // Tự động nhận diện URL: khi chạy local dev dùng localhost, khi build Docker Nginx dùng relative path /api
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor đính kèm JWT Token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor xử lý lỗi 401 tự động đăng xuất
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
```

---

## 4. UI/UX & Tailwind CSS Best Practices

1. **Mobile-First & Breakpoints**:
   - Thiết kế từ màn hình nhỏ đến màn hình lớn: `w-full sm:w-auto md:flex-row`.
2. **Micro-interactions & Đổi trạng thái mượt mà**:
   - Thêm hiệu ứng chuyển động cho nút bấm: `transition-all duration-200 active:scale-95`.
   - Nút xóa nhanh từ khóa (nút `X` trong ô tìm kiếm).
   - Debounce từ 300ms - 400ms cho các ô tìm kiếm để tránh gửi request dồn dập về server.
3. **Nội dung Rich Markdown & Syntax Highlighting**:
   - Nếu dự án có hiển thị bài viết kỹ thuật, luôn tích hợp trình render Markdown (như `react-markdown` + `prismjs`) với thanh copy code 1-click phong cách macOS.

---

## 5. Quy trình kiểm tra (Verification Checklist)

Chạy lệnh kiểm tra TypeScript và đóng gói Vite:
```powershell
npm run build
```
*(Bắt buộc phải đạt 0 lỗi TypeScript `tsc -b` và build Vite thành công dưới 1 giây).*
