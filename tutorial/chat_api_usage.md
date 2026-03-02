# API Guide – AI HR Agent

Tài liệu này mô tả cách sử dụng các API chính của **AI HR Agent**.
Tất cả ví dụ đều sử dụng `curl` và dữ liệu JSON.

---

## 1. Create Session

### Endpoint
```
POST /create_session
```

### Mục đích
Tạo một session mới cho người dùng.  
Mỗi người dùng (`user_id`) có thể có nhiều session khác nhau.

### Request Body
```json
{
  "user_id": "uid_123"
}
```

### Response
```json
{
  "status": "success",
  "data": {
    "session_id": "3144553227660296192"
  },
  "message": null
}
```

### Ví dụ curl
```bash
curl -X POST https://aiagent-9816974896.asia-southeast1.run.app/create_session   -H "Content-Type: application/json"   -d '{
    "user_id": "uid_123"
  }'
```

---
## 2. Chat Stream

### Endpoint
```
POST /chat/stream
```

### Request Body
```json
{
  "user_id": "uid_123",
  "session_id": "3144553227660296192",
  "message": "Ai là người lớn tuổi nhất công ty?"
}
```

### Định dạng Response
Server-Sent Events (SSE) với `Content-Type: text/event-stream`

Mỗi event:
```json
{
  "type": "notification | display",
  "format": "text | html | file",
  "content": "string | null"
}
```

### Giải thích các field

| Field | Giá trị | Ý nghĩa |
|-------|--------|---------|
| `type` | `notification` \| `display` | `notification` = trạng thái xử lý của model; `display` = hiển thị nội dung này là kết quả |
| `format` | `text` \| `html` \| `file` | Định dạng nội dung: văn bản, HTML, hoặc dữ liệu file |
| `content` | string | Nội dung thực tế |

### Ví dụ response
```text
data: {"type": "notification", "format": "text", "content": "Đang xử lý câu hỏi..."}

data: {"type": "notification", "format": "text", "content": "Đang tìm kiếm thông tin..."}

data: {"type": "display", "format": "html", "content": "<table><tr><th>Employee ID</th><th>Tên</th></tr><tr><td>2002002</td><td>NGUYỄN HỮU THỜI</td></tr><tr><td>2002003</td><td>TRẦN QUỐC DŨNG</td></tr><tr><td>2002004</td><td>VŨ THỊ KIM THÚY</td></tr>...</table>"}

data: {"type": "notification", "format": "text", "content": "Đang tổng hợp kết quả..."}

data: {"type": "display", "format": "html", "content": "Trên đây là danh sách nhân viên công ty. Tổng cộng có 406 nhân viên."}
```

### Example curl
```bash
curl -N -X POST https://aiagent-9816974896.asia-southeast1.run.app/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"user_id":"uid_123","session_id":"3144553227660296192","message":"Ai là người lớn tuổi nhất công ty?"}'
```

---
