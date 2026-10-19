# Quy chuẩn Lập trình Fullstack (Java Spring Boot + React TypeScript)

Quy tắc nền tảng áp dụng chung cho mọi dự án sử dụng hệ sinh thái Java Spring Boot và React TypeScript.

---

## 1. Backend (Java 17+ / Spring Boot 3.x/4.x / JPA)
- **Truy vấn tìm kiếm động**: Luôn sử dụng `JpaSpecificationExecutor<T>` kết hợp `Specification<T>` để xây dựng câu truy vấn linh hoạt. Tránh dùng JPQL nối chuỗi hoặc mệnh đề `(:param IS NULL OR ...)` gây lỗi kiểu dữ liệu (`bytea`) trong PostgreSQL.
- **Bảo mật & DTO**:
  - Tách biệt rõ ràng `RequestDTO` (có validation) và `ResponseDTO`.
  - Tuyệt đối không trả về `password`, mã băm, hoặc các trường nhạy cảm trong Response DTO.
  - Sử dụng Spring Security Stateless với JWT, xác thực qua `@PreAuthorize`.
- **Giao dịch**: Mọi phương thức Service có ghi/sửa/xóa dữ liệu bắt buộc có `@Transactional`. Các hàm chỉ đọc dùng `@Transactional(readOnly = true)`.
- **Kiểm tra biên dịch**: Luôn kiểm tra tính toàn vẹn cú pháp trước khi bàn giao: `./mvnw clean test-compile -q`.

---

## 2. Frontend (React 18/19 + TypeScript + Tailwind CSS)
- **Quy tắc Fast Refresh**: Mỗi file component `.tsx` chỉ được phép export React Component. Các hàm tiện ích (utils) hoặc hằng số phải chuyển ra file `.ts` riêng biệt để bảo toàn cơ chế Hot Module Replacement.
- **Quản lý trạng thái (4 UI States)**: Mọi trang/component có gọi API bất đồng bộ bắt buộc phải triển khai:
  1. *Loading State*: Skeleton / Spinner.
  2. *Data State*: Hiển thị dữ liệu.
  3. *Empty State*: Giao diện thông báo thân thiện khi không có dữ liệu.
  4. *Error State*: Báo lỗi rõ ràng và có nút thử lại.
- **TypeScript Strict**: Không sử dụng kiểu `any`. Luôn định nghĩa `interface` tường minh cho Props và dữ liệu API.
- **Kiểm tra Type & Bundle**: Luôn chạy `npm run build` để đảm bảo 0 lỗi TypeScript trước khi kết thúc tác vụ.

---

## 3. DevOps & Containerization (Docker Compose)
- Áp dụng mô hình **Multi-stage Build** cho cả Backend (Maven -> Alpine JRE) và Frontend (Node -> Nginx Alpine).
- Cấu hình **Nginx Reverse Proxy** (`/api/`) và **SPA Fallback** (`try_files $uri $uri/ /index.html`) để bảo đảm định tuyến client-side không bao giờ bị lỗi 404 khi người dùng tải lại trang.
- Luôn thiết lập `healthcheck` cho Database và dùng `condition: service_healthy` cho Backend để đảm bảo thứ tự khởi động chính xác.
