# OSP Search AI AdminUI: Architectural Design & Engineering Retrospective

Tài liệu này ghi lại các quyết định thiết kế, các bài học kinh nghiệm và lộ trình tiến hóa kỹ thuật của dự án `osp-search-ai-adminui`. Mục tiêu là cung cấp cái nhìn của một **Technical Lead** về cách xây dựng một hệ thống API Gateway chuyên dụng cho môi trường Multi-tenant.

---

## 1. Triết lý Thiết kế & Tầm nhìn (Design Philosophy & Evolution)

Hệ thống được xây dựng để giải quyết bài toán **Centralized Governance** (Quản trị tập trung). Thay vì để mỗi Microservice tự xử lý Auth, Rate Limit và Tenant Validation, chúng tôi đưa các logic này lên lớp Gateway để:
*   **Giảm thiểu Security Drift**: Đảm bảo mọi request đều tuân thủ cùng một tiêu chuẩn an ninh thống nhất.
*   **Operational Economics**: Hợp nhất các tác vụ cross-cutting giúp giảm thiểu **Cognitive Load** cho các team phát triển backend và tiết kiệm chi phí hạ tầng.

### Non-Goals (Những gì chúng tôi KHÔNG làm)
*   **Không thực hiện Query Optimization**: Logic này thuộc về Search API hoặc OpenSearch.
*   **Không lưu trữ Business State**: Gateway hoàn toàn stateless.
*   **Không thay thế Service Mesh**: Gateway tập trung vào North-South traffic.

---

## 2. Architecture Decision Records (ADR)

### ADR-001: Lựa chọn Gateway Engine (YARP vs. Nginx/Ocelot)
*   **Trạng thái**: Accepted.
*   **Quyết định**: Chọn **YARP (Yet Another Reverse Proxy)**.
*   **Lý do**: Tích hợp trực tiếp vào ASP.NET pipeline cho phép sử dụng chung DI và Middleware. Điều này cực kỳ quan trọng cho logic **Reactive Refresh** — thứ mà Nginx hay Ocelot khó thực hiện linh hoạt.

### ADR-002: Chiến lược Caching (In-Memory vs. Distributed)
*   **Trạng thái**: Accepted (Short-term strategy).
*   **Quyết định**: Sử dụng **In-Memory Cache (15s)** cục bộ.
*   **Lý do**: Ưu tiên **Low-Latency** (p99 < 1ms cho cache hit).
*   **Trade-off**: Chấp nhận **Node-local cache** để đổi lấy sự đơn giản trong vận hành và tiết kiệm chi phí hạ tầng ở giai đoạn early scale.

---

## 3. Engineering Challenges & Scar Tissue (Những bài học "xương máu")

### 3.1. Incident: Race Condition trong Shared HttpClient
*   **Vấn đề**: Việc thay đổi Header trực tiếp trên instance `HttpClient` dùng chung dẫn đến rủi ro rò rỉ Token giữa các người dùng.
*   **Giải pháp**: Chuyển đổi sang mô hình **Immutable Request Messages** (`HttpRequestMessage`).
*   **Kết quả**: Loại bỏ hoàn toàn rủi ro race condition liên quan đến việc nhầm lẫn token.

### 3.2. Đảm bảo cách ly dữ liệu Cache (Multi-tenant Isolation)
*   **Nguy cơ**: User A nhận được kết quả Search của User B nếu Key cache chỉ dựa trên URL.
*   **Giải pháp**: Xây dựng **Identity-Aware Cache Key** bằng SHA256 băm từ `URL + Payload + Identity Headers`.
*   **Kết quả**: Cung cấp **Strong Isolation Guarantee**, triệt tiêu rủi ro rò rỉ dữ liệu chéo giữa các Tenant.

---

## 4. Distributed Systems & Resilience

*   **Reactive Retry**: Hiện tại, hệ thống hỗ trợ retry cho cả các request POST/PUT bằng cách sử dụng **Request Buffering**. 
    *   *Note*: Lộ trình tương lai sẽ giới hạn chỉ retry cho các phương thức **Idempotent** để tối ưu hóa an toàn dữ liệu.
*   **Overload Shedding**: Sử dụng Rate Limiting làm lớp bảo vệ đầu tiên để ngăn chặn hiệu ứng dây chuyền (Cascading failures).
*   **Backpressure**: Chấp nhận lỗi sớm (Fail-fast) với chuẩn **RFC 7807** khi hệ thống quá tải.
*   **Scar Tissue**: Cơ chế **Circuit Breaker** hiện đang ở mức Roadmap do downstream services chưa cung cấp các tín hiệu sức khỏe đủ ổn định.

---

## 5. Mô hình Tin cậy (Security Trust Model)

*   **Edge-layer Tenant Validation**: Hệ thống thực hiện kiểm tra chéo (Cross-check) giữa header `X-Active-Tenant` và danh tính người dùng ngay tại Gateway. Nếu phát hiện sai lệch, request bị chặn ngay lập tức (Forbidden).
*   **Anti-spoofing**: Không tin tưởng mù quáng vào header đầu vào. Tenant context luôn được resolve lại từ chữ ký JWT của Keycloak.
*   **Trusted Proxy (Roadmap)**: Hiện tại `UseForwardedHeaders` đang được sử dụng, lộ trình sẽ bổ sung cấu hình IP Whitelisting chặt chẽ cho các Load Balancer tin cậy.

---

## 6. Design Targets & Performance SLOs (Thiết kế mục tiêu)

*   **Gateway Overhead**: p95 latency target < 100ms.
*   **Availability Target**: Thiết kế hướng tới 99.9% uptime.
*   **Error Consistency**: Đảm bảo 100% phản hồi lỗi tuân thủ **RFC 7807** kèm theo `traceId` để phục vụ tracing.

---

## 7. Nền tảng & Nhật ký Vận hành (Platform & Operations)

*   **Stateless Scaling**: Gateway hỗ trợ Autoscaling trên Kubernetes/Azure.
*   **Cloud-Native Config**: Sử dụng Steeltoe để cập nhật cấu hình động mà không cần restart.
*   **Health Probes (Roadmap)**: Hỗ trợ tích hợp Readiness/Liveness probes cho Kubernetes.
*   **Incident Flow**: Sử dụng `traceId` để ánh xạ giữa lỗi client và log server tập trung.

---
**Author**: Technical Lead / Architect Notes - 2026-05-13
