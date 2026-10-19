---
name: spring-boot-jpa-craftsman
description: Chuyên gia kiến trúc Backend Java & Spring Boot (3.x/4.x), Spring Data JPA, Spring Security (JWT) và hệ quản trị CSDL quan hệ (PostgreSQL/MySQL). Sử dụng khi thiết kế, triển khai hoặc tái cấu trúc Entity, Repository, Service, Controller, DTO, Security hoặc xử lý lỗi Backend.
---

# Java Spring Boot & JPA Enterprise Architecture Standard

Bộ quy chuẩn và mẫu thiết kế tái sử dụng (Reusable Best Practices) dành cho mọi dự án Backend phát triển bằng **Java (17+)** và **Spring Boot (3.x / 4.x)**.

---

## 1. Kiến trúc phân lớp chuẩn (Layered Architecture)

Mọi luồng xử lý nghiệp vụ phải tuân thủ nghiêm ngặt 4 tầng độc lập:

```
[Client Request]
       │
       ▼
[1. Controller]  --> Tiếp nhận HTTP Request, kiểm tra tính hợp lệ dữ liệu (@Valid), điều hướng Service
       │             Tuyệt đối không viết logic nghiệp vụ (business logic) tại đây.
       ▼
[2. Service]     --> Thực thi nghiệp vụ, kiểm soát giao dịch (@Transactional), ánh xạ Entity <-> DTO.
       │             Chỉ giao tiếp với Repository, không trả trực tiếp JPA Entity ra Controller.
       ▼
[3. Repository]  --> Tương tác CSDL qua Spring Data JPA và JpaSpecificationExecutor.
       │
       ▼
[4. Entity / DB] --> Bảng cơ sở dữ liệu (PostgreSQL / MySQL).
```

---

## 2. Tiêu chuẩn Spring Data JPA & Cơ sở dữ liệu

### A. Truy vấn động nhiều điều kiện (Dynamic Search & Filter)
- **Quy tắc vàng**: BẮT BUỘC sử dụng `JpaSpecificationExecutor<T>` kết hợp `Specification<T>` thay vì viết câu lệnh JPQL tĩnh chứa mệnh đề `(:param IS NULL OR ...)`.
- **Lý do**: Trong Hibernate 6/7 và PostgreSQL, các tham số `null` không định kiểu sẽ bị suy diễn thành `bytea`, gây ra lỗi nghiêm trọng `ERROR: function lower(bytea) does not exist`.

```java
// ✅ MẪU SPECIFICATION CHUẨN DOANH NGHIỆP TÁI SỬ DỤNG
public Page<YourEntityResponse> searchEntities(String keyword, Long categoryId, Boolean status, Pageable pageable) {
    Specification<YourEntity> spec = (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();

        // 1. Tìm kiếm chuỗi ký tự theo nhiều cột (Case-insensitive)
        if (keyword != null && !keyword.trim().isEmpty()) {
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            predicates.add(cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("description")), pattern)
            ));
        }

        // 2. Lọc theo khóa ngoại (Foreign Key)
        if (categoryId != null) {
            predicates.add(cb.equal(root.get("category").get("id"), categoryId));
        }

        // 3. Lọc theo trạng thái hoặc cờ boolean
        if (status != null) {
            predicates.add(cb.equal(root.get("isActive"), status));
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    };

    return entityRepository.findAll(spec, pageable).map(this::mapToResponse);
}
```

### B. Thiết kế Entity
1. **Khóa chính**: Luôn sử dụng `@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;`.
2. **Quan hệ bảng**:
   - Mặc định dùng `fetch = FetchType.LAZY` cho tất cả `@ManyToOne` và `@OneToOne` để tránh bài toán N+1 Query.
   - Quan hệ 1-Nhiều dùng `cascade = CascadeType.ALL, orphanRemoval = true` khi bảng con phụ thuộc hoàn toàn vào bảng cha.
3. **Tiền tệ & Số học chính xác**: Luôn sử dụng `BigDecimal`, tuyệt đối không dùng `Double` hoặc `Float` vì sai số dấu phẩy động.
4. **Audit Fields**: Tự động gán thời gian tạo và cập nhật:
   ```java
   @CreationTimestamp
   private LocalDateTime createdAt;

   @UpdateTimestamp
   private LocalDateTime updatedAt;
   ```

---

## 3. Tiêu chuẩn DTO & Validation

- **Tách biệt Request và Response**:
  - `XxxRequest`: Chứa các trường Client gửi lên. Dùng các Bean Validation annotations (`@NotBlank`, `@NotNull`, `@Size`, `@Min`, `@Email`).
  - `XxxResponse`: Chỉ chứa thông tin cần hiển thị cho Client. **Tuyệt đối không đưa các trường nhạy cảm như `password` vào Response DTO**.
- **Xử lý lỗi tập trung (Global Exception Handling)**:
  - Định nghĩa `@RestControllerAdvice` để bắt các ngoại lệ phổ biến:
    - `MethodArgumentNotValidException` $\rightarrow$ Trả về mã lỗi `400 Bad Request` kèm danh sách trường bị lỗi.
    - `ResourceNotFoundException` $\rightarrow$ Trả về `404 Not Found`.
    - `BadCredentialsException` / `AccessDeniedException` $\rightarrow$ Trả về `401 Unauthorized` hoặc `403 Forbidden`.

---

## 4. Tiêu chuẩn Bảo mật Spring Security & JWT

1. **Kiến trúc Stateless**:
   - Vô hiệu hóa Session: `sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))`.
   - Vô hiệu hóa CSRF cho các REST API thuần: `csrf(AbstractHttpConfigurer::disable)`.
2. **JWT Authentication Filter**:
   - Trích xuất token từ Header `Authorization: Bearer <token>`.
   - Xác thực chữ ký bí mật (`SecretKey`), kiểm tra hạn dùng (`expiration`).
   - Thiết lập `UsernamePasswordAuthenticationToken` vào `SecurityContextHolder`.
3. **Phân quyền khai báo (Method Security)**:
   - Sử dụng `@EnableMethodSecurity`.
   - Phân quyền trực tiếp trên hàm xử lý: `@PreAuthorize("hasRole('ADMIN')")` hoặc `@PreAuthorize("isAuthenticated()")`.

---

## 5. Quy trình kiểm tra (Verification Checklist)

Trước khi xác nhận hoàn thành code Backend:
1. Chạy lệnh kiểm tra cú pháp và build:
   ```powershell
   ./mvnw clean test-compile -q
   ```
2. Nếu gặp lỗi `Port already in use` trên cổng `8080`, kiểm tra và giải phóng bằng lệnh:
   ```powershell
   Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
   ```
