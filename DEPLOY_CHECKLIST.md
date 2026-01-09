# 🚀 AI HRM Chat Widget - Deployment Checklist

## 📋 Trước khi bắt đầu

- [ ] Đã tạo GitHub repository `chat_widget` (Public)
- [ ] Đã cài đặt Git trên máy
- [ ] Đã config git user.name và user.email

## Bước 1: Tạo Repository trên GitHub

1. Truy cập: **https://github.com/new**
2. Repository name: **`chat_widget`**
3. Description: **`Embeddable AI HRM Chat Widget`**
4. ✅ Chọn **Public**
5. ✅ KHÔNG chọn "Add a README file" (sẽ tạo từ local)
6. Click **Create repository**

## Bước 2: Chạy Deploy Script

```bash
cd /home/vaiwcern/Documents/chat_widget
./deploy.sh
```

Hoặc chạy thủ công:

```bash
cd /home/vaiwcern/Documents/chat_widget
git init
git add .
git commit -m "Initial commit - AI HRM Chat Widget"
git remote add origin https://github.com/Vaiwcern/chat_widget.git
git branch -M main
git push -u origin main
```

## Bước 3: Bật GitHub Pages

1. Truy cập: **https://github.com/Vaiwcern/chat_widget/settings/pages**
2. Under **Source**:
   - Branch: **`main`**
   - Folder: **`/(root)`**
3. Click **Save**
4. Đợi **1-2 phút** để deploy

## Bước 4: Verify Deployment

Sau khi GitHub Pages active, truy cập:
```
https://vaiwcern.github.io/chat_widget/build/
```

Nên thấy demo page với widget hoạt động.

## 📦 Cách nhúng vào website khác

### Cách 1: Đơn giản nhất
```html
<script src="https://vaiwcern.github.io/chat_widget/build/embed.js"></script>
<div id="ai-hrm-widget"></div>
```

### Cách 2: Với tùy chỉnh
```html
<script>
window.AIHRMWidget.init({
    apiBaseUrl: 'https://your-api.com',
    title: 'Trợ lý AI',
    placeholder: 'Hỏi đáp...'
});
</script>
<script src="https://vaiwcern.github.io/chat_widget/build/embed.js"></script>
<div id="ai-hrm-widget"></div>
```

## 🔧 Cập nhật sau này

Sau khi chỉnh sửa code:

```bash
cd /home/vaiwcern/Documents/chat_widget
git add .
git commit -m "Mô tả thay đổi"
git push
```

GitHub Pages sẽ tự động cập nhật sau 1-2 phút.

## 📞 Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| 404 Error trên Pages | Kiểm tra Settings > Pages đã bật chưa |
| Widget không hiện | Đợi 2-5 phút sau khi push |
| Lỗi git | Chạy `git config user.name "Your Name"` |
| Không push được | Kiểm tra quyền truy cập repository |

## ✅ Kết quả mong đợi

- Repository: `https://github.com/Vaiwcern/chat_widget`
- Pages URL: `https://vaiwcern.github.io/chat_widget/build/`
- Embed URL: `https://vaiwcern.github.io/chat_widget/build/embed.js`

