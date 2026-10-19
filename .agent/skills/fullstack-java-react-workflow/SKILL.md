---
name: fullstack-java-react-workflow
description: Quy trình 5 giai đoạn triển khai tính năng Fullstack từ A-Z áp dụng cho mọi dự án Java Spring Boot kết hợp React TypeScript. Sử dụng khi bắt đầu phát triển tính năng mới, tạo CRUD, tích hợp API hoặc kết nối dữ liệu giữa Backend và Frontend.
---

# Java + React Fullstack Feature Delivery Lifecycle

Khung quy trình 5 giai đoạn chuẩn mực (5-Phase Delivery Framework) đảm bảo tính nhất quán, đồng bộ kiểu dữ liệu và chất lượng cao khi phát triển tính năng Fullstack.

---

## Giai đoạn 1: Thiết kế Dữ liệu & Backend API Contract

1. **Entity**:
   - Khai báo Entity với JPA annotations (`@Entity`, `@Table`, `@Column`, `@Id`).
   - Luôn sử dụng `FetchType.LAZY` cho quan hệ nhiều-một và `BigDecimal` cho số tiền.
2. **Repository**:
   - Kế thừa đồng thời `JpaRepository<Entity, Long>` và `JpaSpecificationExecutor<Entity>`.
3. **DTOs (Request & Response Contract)**:
   - `CreateXxxRequest`: Khai báo validation chặt chẽ (`@NotBlank`, `@NotNull`, `@Size`).
   - `XxxResponse`: Chỉ chứa các trường cần hiển thị ra client, ẩn trường nhạy cảm.
4. **Service**:
   - Viết logic nghiệp vụ, ném `ResourceNotFoundException` khi không tìm thấy bản ghi.
   - Sử dụng `@Transactional` cho ghi/sửa/xóa và `@Transactional(readOnly = true)` cho truy vấn.
   - Xây dựng `Specification` cho các hàm tìm kiếm động nhiều điều kiện.
5. **Controller**:
   - Viết REST endpoints chuẩn RESTful (`GET /api/items`, `GET /api/items/{id}`, `POST /api/items`, `PUT /api/items/{id}`, `DELETE /api/items/{id}`).
   - Phân quyền endpoint bằng `@PreAuthorize`.

---

## Giai đoạn 2: Đồng bộ Kiểu dữ liệu trên Frontend (TypeScript Parity)

Mở file định nghĩa types (ví dụ `frontend/src/types/index.ts`):
- Khai báo interface tương ứng 1-1 với `XxxResponse` của Backend:
  ```typescript
  export interface Item {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    // ...
  }
  ```
- Nếu API trả về phân trang Spring Data `Page<T>`, bọc trong kiểu chuẩn:
  ```typescript
  export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }
  ```

---

## Giai đoạn 3: Đóng gói API Client Wrapper

Mở file API Services (ví dụ `frontend/src/api/services.ts`):
- Tạo module API wrapper bọc các lệnh gọi `axiosClient`:
  ```typescript
  export const itemApi = {
    getAll: async (params?: ItemQueryParams): Promise<PageResponse<Item>> => {
      return (await axiosClient.get('/items', { params })) as unknown as PageResponse<Item>;
    },
    getById: async (id: number): Promise<Item> => {
      return (await axiosClient.get(`/items/${id}`)) as unknown as Item;
    },
    create: async (payload: ItemPayload): Promise<Item> => {
      return (await axiosClient.post('/items', payload)) as unknown as Item;
    },
    delete: async (id: number): Promise<void> => {
      await axiosClient.delete(`/items/${id}`);
    },
  };
  ```

---

## Giai đoạn 4: Xây dựng Giao diện & Trải nghiệm Người dùng

1. **Quản lý Vòng đời Dữ liệu (Component Lifecycle)**:
   - Dùng `useEffect` kết hợp biến cờ `let isMounted = true` để hủy gán state nếu component bị unmount trong khi đang fetch.
   - Thêm Debounce 300ms khi gõ tìm kiếm từ khóa.
   - Reset trang về `page = 1` mỗi khi người dùng thay đổi bộ lọc hoặc từ khóa.
2. **Xử lý 4 trạng thái giao diện**:
   - Đảm bảo hiển thị đầy đủ Loading $\rightarrow$ Data $\rightarrow$ Empty $\rightarrow$ Error.
3. **Quy tắc Fast Refresh**:
   - Tuyệt đối không export hàm tiện ích hay biến hằng số trong file `.tsx`.

---

## Giai đoạn 5: Kiểm định Toàn diện (Dual Verification)

Trước khi coi công việc là hoàn tất, BẮT BUỘC thực thi 2 lệnh kiểm tra:

1. **Kiểm tra Backend**:
   ```powershell
   ./mvnw clean test-compile -q
   ```
   *Yêu cầu: `BUILD SUCCESS` không có lỗi cú pháp hoặc cảnh báo deprecation nghiêm trọng.*

2. **Kiểm tra Frontend**:
   ```powershell
   npm run build
   ```
   *Yêu cầu: `tsc -b && vite build` hoàn thành với 0 lỗi.*
