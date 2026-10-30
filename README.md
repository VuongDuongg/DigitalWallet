# 💳 Digital Wallet — Hệ Thống Ví Điện Tử Tài Chính Doanh Nghiệp (Fintech Platform)

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.1-green.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18.3-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Capacitor Android](https://img.shields.io/badge/Capacitor-Android_8.6-3dc2ff.svg?style=flat-square&logo=capacitor)](https://capacitorjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-dc382d.svg?style=flat-square&logo=redis)](https://redis.io/)
[![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-3-231f20.svg?style=flat-square&logo=apachekafka)](https://kafka.apache.org/)

Hệ thống **Ví Điện Tử (Digital Wallet)** chuẩn doanh nghiệp được xây dựng trên kiến trúc hướng sự kiện (Event-Driven Micro-Architecture). Dự án áp dụng đầy đủ các chuẩn mực công nghệ tài chính hiện đại: **Sổ cái kép bất biến (Double-Entry Bookkeeping)**, **Điều phối giao dịch phân tán Saga**, **Snapshot số dư tối ưu O(1)**, **Khoá phân tán Redis (Redisson Lock)**, và **Chống trùng lặp Idempotency Key**.

Giao diện người dùng được tách biệt hoàn toàn thành 2 dự án độc lập: **Cổng Khách hàng đa nền tảng (Web + Android Mobile App qua Capacitor)** với ngôn ngữ thiết kế MoMo (tone màu xanh nước nhạt & trắng) và **Cổng Quản trị viên (Admin Backoffice Portal)**.

---

## 🏛️ 1. Sơ đồ Kiến trúc Tổng thể (Architecture Overview)

```
                                  ┌───────────────────────────────────────────────┐
                                  │             MÁY KHÁCH & ỨNG DỤNG              │
                                  └───────┬───────────────────────────────┬───────┘
                                          │                               │
                ┌─────────────────────────┴─────────────┐                 │
                ▼                                       ▼                 ▼
  ┌───────────────────────────┐           ┌───────────────────────────┐ ┌───────────────────────────┐
  │   frontend-client (Web)   │           │ frontend-client (Android) │ │   frontend-admin (Web)    │
  │   React TS • Port 5173    │           │ Native App • Capacitor 8  │ │   React TS • Port 5174    │
  │   Giao diện MoMo Xanh/Trắng│          │ Live-Reload & Debug APK   │ │   KPIs, Ledger & Saga     │
  └─────────────┬─────────────┘           └─────────────┬─────────────┘ └─────────────┬─────────────┘
                │ http://localhost:8080                 │ LAN: 192.168.100.150:8080   │ http://localhost:8080
                │                                       │ hoặc adb reverse: 8080      │
                └───────────────────────┬───────────────┴─────────────────────────────┘
                                        │
                                        ▼
      ┌─────────────────────────────────────────────────────────────────────────────────┐
      │                      SPRING BOOT 4.1.1 BACKEND (Port 8080)                      │
      │  • /api/v1/auth/**            : Dịch vụ xác thực danh tính & Mock SMS OTP       │
      │  • /api/v1/wallets/**         : Nạp tiền, Chuyển tiền, Số dư, Tra cứu lịch sử   │
      │  • /api/v1/admin/wallets/**   : Kiểm toán Ledger, Audit Snapshot, Inspect Saga │
      │  • /api/v1/payment/webhook/** : Tiếp nhận Webhook HMAC Cổng thanh toán quốc tế  │
      └──────┬───────────────────────┬──────────────────────┬────────────────────┬──────┘
             │                       │                      │                    │
             ▼                       ▼                      ▼                    ▼
┌─────────────────────────┐ ┌─────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│       POSTGRESQL        │ │  REDIS / REDISSON │ │     APACHE KAFKA     │ │    GATEWAY MOCKS     │
│  • Sổ cái kép (Ledger)  │ │  • Distributed    │ │  • Saga Events       │ │  • MoMo • VietQR   │
│  • Bảng Transactions    │ │    Lock           │ │  • Outbox Pattern    │ │  • ZaloPay         │
│  • Balance Snapshots    │ │  • Idempotency    │ │  • Asynchronous      │ │  • VNPay           │
│  • Outbox Events        │ │  • OTP (TTL 120s) │ │    Processing        │ │  (HMAC-SHA256)     │
└─────────────────────────┘ └─────────────────┘ └──────────────────────┘ └──────────────────────┘
```

---

## 📂 2. Cấu trúc Dự án (Project Structure)

```
DigitalWallet/
├── backend/                                # Mã nguồn Spring Boot Backend (Java 21)
│   ├── src/main/java/com/example/digital_wallet/
│   │   ├── client/                         # Strategy Pattern Cổng thanh toán (MoMo, VietQR, ZaloPay, VNPay)
│   │   ├── config/                         # Redisson, Kafka, Swagger OpenAPI, Jackson
│   │   ├── controller/                     # REST API Controllers (Customer, Admin, Auth, Webhook)
│   │   ├── exception/                      # Global Exception Handler & Custom Business Exceptions
│   │   ├── model/                          # Entities, DTOs, Enums, Kafka Event Payloads
│   │   ├── repository/                     # Spring Data JPA Repositories
│   │   ├── service/                        # OtpService, WalletService, SagaOrchestrator, Idempotency...
│   │   └── worker/                         # Background Kafka Consumer Workers & Resilience4j
│   ├── src/main/resources/
│   │   ├── application.yaml                # Cấu hình Database, Kafka, Redis, Resilience4j, Gateway HMAC
│   │   └── schema.sql                      # DDL khởi tạo cấu trúc CSDL PostgreSQL
│   ├── docker-compose.yml                  # Khởi chạy PostgreSQL, Redis, Kafka, Zookeeper
│   └── pom.xml                             # Quản lý Maven Dependencies
│
├── frontend-client/                        # Ứng dụng Khách hàng (Web + Mobile Android App)
│   ├── android/                            # Project Native Android (Capacitor Bridge & Gradle Wrapper)
│   │   ├── app/src/main/AndroidManifest.xml# Cấu hình cleartext HTTP & Permissions
│   │   └── app/build/outputs/apk/debug/    # Thư mục xuất file cài đặt app-debug.apk
│   ├── src/
│   │   ├── api/                            # axiosClient (tự động đổi IP cho Web/Android), authApi, walletApi
│   │   ├── components/
│   │   │   ├── mobile/                     # Bộ UI Mobile chuẩn MoMo (Keypad, OTP, BankLinking, Hub...)
│   │   │   ├── home/                       # HeroBanner, ServiceCategories, WhyChooseUs, AppDownloadCTA
│   │   │   ├── wallet/                     # BalanceCard, TransferModal, DepositModal, QrPaymentModal
│   │   │   └── layout/                     # Header (kèm nút đổi 📱 App MoMo), Footer
│   │   └── types/                          # TypeScript Interfaces & Enums
│   ├── capacitor.config.ts                 # Cấu hình Capacitor App ID, WebDir, Server Live Reload
│   └── package.json                        # Scripts: dev, build, cap:sync, cap:live, cap:run
│
├── frontend-admin/                         # Cổng Quản trị viên (Backoffice Admin Portal - Port 5174)
│   ├── src/
│   │   ├── pages/                          # AdminPortal: KPI Dashboard, Ledger Audit, Saga Inspector
│   │   ├── components/layout/              # AdminSidebar, AdminTopbar
│   │   └── api/                            # adminApi (gọi nhóm endpoint /api/v1/admin/wallets)
│   └── package.json
│
└── README.md                               # Tài liệu hướng dẫn toàn diện dự án
```

---

## ⚡ 3. Các Tính năng Kỹ thuật Cốt lõi (Core FinTech Features)

### 1. Nguyên tắc Sổ Cái Kép Bất Biến (Double-Entry Ledger)
Mọi biến động số dư tiền tệ đều được ghi nhận qua cặp bút toán Nợ (Debit) và Có (Credit). Không bao giờ cập nhật số dư bằng câu lệnh `UPDATE balance = balance + ...` trực tiếp. Tổng nợ luôn luôn cân bằng tuyệt đối với tổng có:
$$\sum \text{Debit} \equiv \sum \text{Credit}$$

### 2. Tối ưu hóa Truy vấn Số Dư $O(1)$ qua Balance Snapshot
Thay vì quét (scan) toàn bộ lịch sử hàng triệu dòng của bảng Sổ cái (Ledger) để tính số dư, hệ thống triển khai cơ chế **Checkpoint Snapshot**:
$$\text{Số dư hiện tại} = \text{Snapshot Balance gần nhất} + \sum \text{Bút toán phát sinh sau Snapshot}$$
Giúp truy vấn số dư tức thì trong thời gian $O(1)$.

### 3. Điều phối Giao dịch Phân tán (Distributed Saga Pattern) & Outbox Pattern
Các giao dịch thanh toán chuyển tiền liên dịch vụ được điều phối theo mô hình **Saga Orchestrator** thông qua **Apache Kafka**. Khi xảy ra lỗi hoặc gián đoạn mạng từ phía đối tác, Saga tự động kích hoạt **Compensating Transactions (Giao dịch bù hoàn tiền)** để bảo vệ toàn vẹn tài sản người dùng.

### 4. Khóa Phân Tán (Redisson Lock) & Chống Trùng Lặp (Idempotency)
- Sử dụng **Redisson Distributed Lock** với cơ chế Watchdog tự động gia hạn thời gian khóa khi luồng nghiệp vụ đang xử lý, ngăn chặn hoàn toàn hiện tượng **Race Condition** khi người dùng nhấn chuyển tiền liên tục.
- Hệ thống băm mã SHA-256 nội dung request kết hợp với **Idempotency Key** lưu trong Redis. Nếu phát hiện request gửi lại có nội dung khác hoặc đang trong trạng thái xử lý, hệ thống lập tức từ chối giao dịch gian lận.

### 5. Dịch vụ Mock SMS OTP (Redis TTL 120 giây)
- **Sinh OTP 6 số**: Sinh ngẫu nhiên và lưu trữ trong Redis với thời hạn hết hạn chính xác **120 giây**.
- **Mock SMS qua Console**: Để không tốn chi phí thuê tổng đài viễn thông (SMS Brandname) trong quá trình phát triển, hệ thống tự động in nổi bật mã OTP ra Terminal máy tính:
  ```text
  =======================================================
  >>>> [TEST SMS] Ma OTP gui toi so 0968891234 la: 628194 <<<<
  =======================================================
  ```
- **Single-use OTP**: Mã OTP sau khi xác thực thành công sẽ tự động bị xóa khỏi Redis để triệt tiêu nguy cơ tấn công phát lại (Replay Attack).

### 6. Giao diện MoMo Mobile Native App (Tone Xanh Nước Nhạt & Trắng)
- **Quy trình Đăng ký 3 bước**: Nhập số điện thoại (kèm bàn phím ảo Numeric Keypad) ➔ Nhập mã OTP ➔ Tạo mã PIN bảo mật 6 số.
- **Quy trình Liên kết Ngân hàng 4 bước**: Tra cứu danh sách 16 ngân hàng Việt Nam (Vietcombank, TPBank, MBBank, BIDV...) ➔ Nhập thông tin thẻ ATM ➔ Xác thực OTP SMS ➔ Hoàn tất.
- **Cam kết bảo mật**: Chứng chỉ bảo mật chuẩn quốc tế **PCI-DSS Level 1**.
- **Cổng thanh toán QR**: Tích hợp luồng quét mã và tạo mã QR tương thích tiêu chuẩn **VietQR** và **MoMo**.

---

## 🚀 4. Hướng dẫn Khởi chạy Dự án (Getting Started)

### Yêu cầu Tiên quyết (Prerequisites)
- **JDK 21** trở lên ([Oracle OpenJDK 21+](https://jdk.java.net/21/))
- **Node.js 18+** & **npm**
- **Docker Desktop** (Dùng để chạy Postgres, Redis, Kafka)
- **Android SDK & Platform Tools** (Nếu muốn build hoặc chạy app Android)

---

### Bước 1: Khởi động Cơ sở Hạ tầng với Docker Compose
Mở Terminal tại thư mục `backend/`:
```powershell
cd D:\Project_Java\DigitalWallet\backend
docker compose up -d
```
*Các dịch vụ sẽ chạy nền:*
* PostgreSQL: `localhost:5433` (DB: `digital_wallet`, User: `wallet_user`)
* Redis: `localhost:6379`
* Apache Kafka: `localhost:9092`
* Zookeeper: `localhost:2181`

---

### Bước 2: Khởi động Backend Spring Boot
```powershell
cd D:\Project_Java\DigitalWallet\backend
.\mvnw.cmd spring-boot:run
```
* Backend lắng nghe tại: **`http://localhost:8080`**
* Tài liệu Swagger OpenAPI: **`http://localhost:8080/swagger-ui.html`**

---

### Bước 3: Khởi chạy Cổng Khách hàng (Frontend Client)

#### 🌐 Tùy chọn A — Chạy phiên bản Web:
```powershell
cd D:\Project_Java\DigitalWallet\frontend-client
npm run dev
```
👉 Truy cập trình duyệt: **`http://localhost:5173/`**
*(Trên thanh Header có nút **`📱 App MoMo`** để bạn chuyển sang xem mô phỏng giao diện điện thoại ngay trên trình duyệt)*

#### 📱 Tùy chọn B — Chạy trên Điện thoại thật / Máy ảo Android (Live Reload):
1. **Kết nối điện thoại qua cáp USB** (đã bật *USB Debugging* trong Tùy chọn nhà phát triển).
2. **Chuyển tiếp cổng qua cáp USB**:
   ```powershell
   & "C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:8080 tcp:8080
   ```
3. **Mở 2 terminal**:
   - Terminal 1: `cd frontend-client; npm run dev`
   - Terminal 2: `cd frontend-client; npm run cap:live`
   *(Ứng dụng sẽ tự động mở trên điện thoại của bạn; khi bạn sửa code ở máy tính, app sẽ tự cập nhật trong 0.1 giây!)*

#### 📦 Tùy chọn C — Cài đặt trực tiếp file APK đã đóng gói:
File APK đã được biên dịch sẵn tại:
`frontend-client/android/app/build/outputs/apk/debug/app-debug.apk`

Cài vào điện thoại bằng lệnh ADB:
```powershell
& "C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe" install -r D:\Project_Java\DigitalWallet\frontend-client\android\app\build\outputs\apk\debug\app-debug.apk
```

---

### Bước 4: Khởi chạy Cổng Quản trị viên (Frontend Admin)
Mở một cửa sổ Terminal riêng:
```powershell
cd D:\Project_Java\DigitalWallet\frontend-admin
npm run dev
```
👉 Truy cập trình duyệt: **`http://localhost:5174/`**
* Kiểm toán Sổ cái kép (Double-Entry Ledger Audit).
* Kiểm tra Balance Snapshots O(1).
* Giám sát Distributed Saga Orchestrator.

---

## 📡 5. Danh mục REST API Tiêu biểu (API Documentation)

| Phương thức | Endpoint | Mô tả nghiệp vụ |
| :--- | :--- | :--- |
| **POST** | `/api/v1/auth/otp/send` | Gửi mã OTP xác thực (Lưu Redis 120s, in ra Terminal) |
| **POST** | `/api/v1/auth/otp/verify` | Xác thực mã OTP người dùng nhập |
| **POST** | `/api/v1/wallets/accounts` | Mở tài khoản ví điện tử mới |
| **GET** | `/api/v1/wallets/accounts/{id}/balance` | Lấy số dư ví khả dụng hiện tại |
| **POST** | `/api/v1/wallets/accounts/deposit` | Nạp tiền vào ví điện tử |
| **POST** | `/api/v1/wallets/transfer` | Chuyển tiền qua Saga Orchestrator (Kèm Idempotency) |
| **POST** | `/api/v1/wallets/accounts/{id}/snapshots`| Chốt Balance Snapshot O(1) |
| **GET** | `/api/v1/admin/wallets/ledger/{id}` | [ADMIN] Kiểm toán bút toán Sổ cái Nợ/Có |
| **POST** | `/api/v1/payment/webhook/{gateway}` | Webhook xác thực chữ ký HMAC-SHA256 cổng thanh toán |

---

## 🛡️ 6. Tiêu chuẩn Mã nguồn & Bảo mật (Code Standards)
- **Kiến trúc phân tầng Backend**: Tuân thủ chuẩn Controller ➔ Service ➔ Repository ➔ Entity. Tuyệt đối không để lộ Entity JPA ra Controller.
- **Frontend Strict TypeScript**: 100% Type-Safe, zero `any`, tuân thủ quy tắc Fast Refresh của Vite (`react-refresh/only-export-components`).
- **Bảo mật giao dịch**: Không lưu trữ số thẻ ngân hàng dạng văn bản gốc; toàn bộ số thẻ được che mặt nạ (`9704 23xx xxxx 1890`) tuân thủ chuẩn PCI-DSS Level 1.
- **Git Flow**: Toàn bộ các thay đổi được chia tách thành các Atomic Commits rõ ràng theo chuẩn Conventional Commits.

---

## 👨‍💻 7. Đóng góp & Bản quyền (License)
Dự án được xây dựng phục vụ nghiên cứu, học tập và triển khai giải pháp công nghệ tài chính FinTech doanh nghiệp.
Phát hành theo giấy phép **MIT License**.

