# OSP Search AI API: Search Infrastructure & Retrieval Orchestration

Tài liệu này ghi lại kiến trúc hệ thống tìm kiếm, tập trung vào các bài toán thực tế về hiệu năng, độ chính xác (relevance) và các giới hạn vận hành trong môi trường production.

---

## 1. Triết lý Thiết kế: Search Platform Capability

Chúng tôi không xây dựng một ứng dụng CRUD đơn thuần, mà phát triển một **Search Orchestrator** đa tầng, tập trung vào:
*   **Decoupled Orchestration**: Tách biệt logic xử lý truy vấn (Transformer) khỏi hạ tầng lưu trữ (OpenSearch/ES).
*   **Operational Resilience**: Bảo vệ cluster khỏi các truy vấn "hủy diệt" thông qua các lớp Governance và Backpressure.
*   **Search Platform Economics**: Cân bằng giữa việc cách ly dữ liệu triệt để và tối ưu hóa tài nguyên phần cứng (JVM Heap/Network/I/O).

---

## 2. Retrieval & Relevance Strategy (Chiến lược Truy hồi)

Hệ thống áp dụng mô hình **Multi-stage Retrieval** để đảm bảo độ chính xác tối ưu:

### 2.1. Stage 1: Retrieval (DSL Generation)
*   **Lexical & Hybrid**: Kết hợp `query_string` và Neural Search (kNN). Thuật toán ANN (Approximate Nearest Neighbor) được cấu hình với `k` và `size` giới hạn để duy trì **Latency ngân sách**.
*   **Pagination Economics**: Để tránh lỗi `index.max_result_window` (thường là 10,000) và áp lực RAM khi phân trang sâu, hệ thống giới hạn `from + size` hoặc ưu tiên chuyển sang pattern `search_after` cho các tập dữ liệu lớn.

### 2.2. Stage 2: Post-processing (Re-ranking)
*   **Boost & Bury**: Điều chỉnh xếp hạng dựa trên `Query Rules` được cấu hình từ AdminUI.
*   **Telemetry Feedback Loop**: Mọi click/search event được thu thập để phân tích Relevance. Hệ thống thực hiện **Sanitize Query** (PII removal) trước khi log.

---

## 3. Operational Realities & Resource Governance (Quản trị tài nguyên)

### 3.1. Metadata Economics (Tối ưu hóa băng thông)
Hệ thống thực hiện **Massive Source Exclusion**. Ngoài các vector embedding nặng, chúng tôi loại bỏ hàng loạt trường metadata kỹ thuật để giảm Payload Size, bảo vệ bộ nhớ RAM của API và băng thông mạng.

### 3.2. Query Lifecycle & Backpressure
Mọi truy vấn đều đính kèm **`CancellationToken`**. Khi người dùng hủy request hoặc client ngắt kết nối, tín hiệu này được lan truyền xuống OpenSearch để **hủy thực thi câu lệnh trên cluster**, giải phóng tài nguyên CPU/Heap đắt đỏ ngay lập tức thay vì để truy vấn chạy ngầm lãng phí.

### 3.3. Cluster Survival (Bảo vệ JVM Heap)
Việc faceting trên các trường có độ đa dạng (cardinality) cao có thể gây bùng nổ `fielddata` trong JVM Heap. Hệ thống áp dụng các giới hạn aggregation và tận dụng `keyword` fields để tránh tình trạng OpenSearch Circuit Breaker bị kích hoạt.

---

## 4. Platform Security & Economics (Vận hành & Kinh tế học)

*   **Strong Isolation Guarantees (Defense-in-depth)**: Ép buộc đính kèm `Tenant.keyword` vào mọi DSL query. Đây là tầng bảo vệ cuối cùng chống rò rỉ dữ liệu chéo tenant.
*   **Shard & Index Lifecycle**:
    *   **Shard Sizing**: Target 20GB - 40GB mỗi shard để tối ưu hóa hiệu suất merge segment và I/O.
    *   **Hot/Warm Storage**: Tối ưu hóa chi phí bằng cách di chuyển dữ liệu ít truy cập sang các node lưu trữ rẻ hơn.
*   **Graceful Degradation**: Trả về **`IsPartial = true`** khi search provider quá tải thay vì lỗi 500, đảm bảo tính liên tục của trải nghiệm người dùng.

---

## 5. Performance SLOs & Design Targets

*   **p95 Orchestration Latency**: < 50ms (không bao gồm thời gian thực thi của Search Engine).
*   **Cache Hit Ratio (Index Mapping)**: > 98%.
*   **Availability-first Strategy**: Tự động ngắt mạch (Circuit Breaking) và fallback khi downstream service gặp sự cố.

---
**Author**: Principal Search Architect - 2026-05-13
