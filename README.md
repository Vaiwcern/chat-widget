# AI HRM Chat Widget

Chat widget có thể nhúng (embed) được, xây dựng bằng JavaScript thuần.

## 🚀 Quick Start

### Cách đơn giản nhất (không cần config):

```html
<script src="https://yourusername.github.io/chat_widget/build/embed.js"></script>
<div id="ai-hrm-widget"></div>
```

### Với tùy chỉnh:

```html
<script>
window.AIHRMWidget.init({
    apiBaseUrl: 'https://your-api-endpoint.com',
    title: 'Trợ lý AI',
    placeholder: 'Nhập câu hỏi...'
});
</script>
<script src="https://yourusername.github.io/chat_widget/build/embed.js"></script>
<div id="ai-hrm-widget"></div>
```

## 📁 Files

```
chat_widget/
├── embed.js          # Script chính (IIFE pattern)
├── embed.css         # Styles tự động inject
├── build/            # Folder deploy
│   ├── embed.js      # Script sẵn sàng deploy
│   ├── embed.css     # CSS sẵn sàng deploy
│   └── index.html    # Demo page
└── README.md
```

## ⚙️ Configuration Options

| Tùy chọn | Mặc định | Mô tả |
|----------|----------|-------|
| `apiBaseUrl` | `https://aiagent-...` | API endpoint |
| `title` | `AI HRM` | Tiêu đề widget |
| `placeholder` | `Nhập tin nhắn...` | Placeholder input |

## 📦 Deploy lên GitHub Pages

### Bước 1: Tạo GitHub Repository

1. Vào [GitHub New Repository](https://github.com/new)
2. Đặt tên: `chat_widget`
3. Chọn **Public**
4. Click **Create repository**

### Bước 2: Push code

```bash
cd /path/to/chat_widget
git init
git add .
git commit -m "Initial commit - AI HRM Chat Widget"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/chat_widget.git
git push -u origin main
```

### Bước 3: Bật GitHub Pages

1. Vào repository trên GitHub
2. Click **Settings** tab
3. Click **Pages** ở sidebar trái
4. Under **Source**, chọn:
   - **Branch**: `main` (hoặc `master`)
   - **Folder**: `/(root)`
5. Click **Save**
6. Đợi 1-2 phút để deploy

### Bước 4: Lấy URL của bạn

Sau khi deploy, URL sẽ có dạng:
```
https://YOURUSERNAME.github.io/chat_widget/build/
```

## 🔧 Sử dụng nâng cao

### Khởi tạo thủ công:

```html
<script>
window.AIHRMWidget.init({
    apiBaseUrl: 'https://your-api.com',
    title: 'Hỗ trợ',
    placeholder: 'Hãy hỏi tôi...'
});
</script>
<script 
    src="https://yourusername.github.io/chat_widget/build/embed.js" 
    data-auto-init="false">
</script>
```

### Destroy widget:

```javascript
// Xóa widget khỏi DOM
const widget = document.getElementById('ai-hrm-widget');
if (widget) widget.remove();

// Xóa styles
const styles = document.getElementById('ai-hrm-styles');
if (styles) styles.remove();

// Reset global object
delete window.AIHRMWidget;
```

## 🎨 Customization

### Thay đổi màu sắc (CSS):

Thêm CSS sau vào website của bạn để override:

```css
.ai-hrm-header {
    background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%) !important;
}

.ai-hrm-user p {
    background: linear-gradient(135deg, #YOUR_USER_COLOR_1 0%, #YOUR_USER_COLOR_2 100%) !important;
}

.ai-hrm-send.ai-hrm-processing,
.ai-hrm-launcher {
    background: linear-gradient(135deg, #YOUR_SEND_COLOR_1 0%, #YOUR_SEND_COLOR_2 100%) !important;
}
```

## 📋 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📝 API Endpoints Required

Widget yêu cầu API server hỗ trợ:

1. **Create Session:**
   - `POST {apiBaseUrl}/create_session`
   - Body: `{ "user_id": "string" }`
   - Response: `{ "status": "success", "data": { "session_id": "string" } }`

2. **Chat Stream:**
   - `POST {apiBaseUrl}/chat/stream`
   - Body: `{ "user_id": "string", "session_id": "string", "message": "string" }`
   - Response: Stream với events:
     - `data: {"type": "agent_message", "content": "..."}`
     - `data: {"type": "final_response", "content": "{\"response\": \"...\", \"recommend_next_questions\": [...]}"}`

## 📄 License

MIT License

## 👨‍💻 Author

AlphaNDT Team

