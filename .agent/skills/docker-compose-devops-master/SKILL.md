---
name: docker-compose-devops-master
description: Chuyên gia đóng gói và triển khai môi trường Docker, Multi-stage Dockerfile, Nginx Reverse Proxy và Docker Compose cho các ứng dụng Web 3 tầng (Database, Spring Boot Backend, React Frontend). Sử dụng khi container hóa ứng dụng, viết file docker-compose.yml hoặc xử lý sự cố mạng/cổng/volume.
---

# 3-Tier Enterprise Docker & DevOps Architecture Standard

Tiêu chuẩn đóng gói và điều phối container hóa tái sử dụng (Reusable DevOps Standard) cho mọi ứng dụng Web gồm **Cơ sở dữ liệu (PostgreSQL/MySQL) + Backend Spring Boot + Frontend React Nginx**.

---

## 1. Kiến trúc Docker Compose 3 tầng chuẩn

```
[ Người dùng / Client ] ──► Cổng Host 80 hoặc 3000
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │       Container Frontend (Nginx Alpine)          │
             │   - Nén Gzip, phục vụ file tĩnh SPA React        │
             │   - Cấu hình SPA routing fallback index.html     │
             └────────────────────────┬─────────────────────────┘
                                      │  Reverse Proxy (/api/*)
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │      Container Backend (Spring Boot / JRE)       │
             │   - Chạy trên Alpine JRE siêu nhẹ (< 150MB)      │
             │   - Chỉ bật khi Database đã sẵn sàng             │
             └────────────────────────┬─────────────────────────┘
                                      │  Mạng nội bộ Bridge (Port DB)
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │      Container Database (Postgres / MySQL)       │
             │   - Cấu hình Healthcheck (pg_isready)            │
             │   - Gắn Persistent Volume bảo toàn dữ liệu       │
             └──────────────────────────────────────────────────┘
```

---

## 2. Tiêu chuẩn Multi-stage Dockerfile

### A. Backend Dockerfile (Spring Boot)
Tách riêng môi trường Build (Maven JDK) và môi trường Chạy (Alpine JRE) để giảm dung lượng từ 800MB xuống còn ~150MB:

```dockerfile
# Stage 1: Build với Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime với JRE siêu nhẹ
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN mkdir -p /app/uploads
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### B. Frontend Dockerfile (React + Nginx)
Tách riêng môi trường Build (Node Alpine) và môi trường Phục vụ (Nginx Alpine):

```dockerfile
# Stage 1: Build bundle production
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Nginx Web Server
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 3. Tiêu chuẩn Nginx Reverse Proxy & SPA Fallback (`nginx.conf`)

Mọi ứng dụng React Router chạy với Nginx bắt buộc phải có cấu hình này để không bị lỗi 404 khi người dùng tải lại trang:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;

    # 1. Reverse Proxy các request /api/ sang container backend
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 25M;
    }

    # 2. Cache file tĩnh
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|svg)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 3. SPA Fallback (Bắt buộc cho React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 4. Tiêu chuẩn Điều phối `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: app-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: app_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5433:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d app_db"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: app-backend
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/app_db
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: password
      APP_UPLOAD_DIR: /app/uploads
    ports:
      - "8080:8080"
    volumes:
      - ./uploads:/app/uploads
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: app-frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "3000:80"
      - "80:80"
    networks:
      - app-network

volumes:
  db_data:

networks:
  app-network:
    driver: bridge
```

---

## 5. Cẩm nang vận hành (Cheat Sheet)

```bash
# 1. Khởi động sạch toàn bộ hệ thống
docker compose up -d --build

# 2. Kiểm tra trạng thái sức khỏe
docker compose ps

# 3. Theo dõi nhật ký
docker compose logs -f

# 4. Tắt hệ thống (giữ dữ liệu)
docker compose down

# 5. Tắt và xóa sạch volume để làm mới dữ liệu
docker compose down -v
```
