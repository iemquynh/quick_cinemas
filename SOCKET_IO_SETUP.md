# Socket.IO Setup cho QuickCinema

## Tổng quan
Hệ thống thông báo real-time sử dụng Socket.IO để gửi thông báo cho admin khi có vé đang chờ xác nhận.

## Cấu trúc hệ thống

### 1. Server-side (Socket.IO)
- **File**: `lib/socket.js`
- **Chức năng**: 
  - Khởi tạo Socket.IO server
  - Xác thực token JWT
  - Quản lý rooms cho từng theater chain
  - Gửi thông báo real-time

### 2. Client-side (Socket.IO Client)
- **File**: `hooks/useSocket.js`
- **Chức năng**:
  - Kết nối Socket.IO client
  - Lắng nghe thông báo
  - Quản lý trạng thái kết nối

### 3. Components
- **NotificationBell**: Hiển thị thông báo cho admin
- **Toast**: Hiển thị popup thông báo
- **AdminHeader**: Header cho admin dashboard

## Cách hoạt động

### 1. Khi user tạo booking
1. User thanh toán và tạo booking với status 'pending'
2. API `/api/bookings` tạo booking và gửi thông báo real-time
3. Socket.IO gửi thông báo đến theater admin của rạp đó
4. Super admin cũng nhận được thông báo

### 2. Khi admin xác nhận/từ chối booking
1. Admin click "Xác nhận" hoặc "Từ chối" trên trang `/admin/bookings`
2. API `/api/admin/bookings` cập nhật status booking
3. Gửi thông báo real-time cho theater admin và super admin
4. Tạo notification cho user

## Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install socket.io socket.io-client
```

### 2. Cấu hình environment variables
Tạo file `.env.local`:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Socket.IO
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Client URL
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

### 3. Chạy server
```bash
npm run dev
```

## Sử dụng

### 1. Cho Admin
- Đăng nhập với tài khoản theater_admin hoặc super_admin
- Truy cập `/admin/bookings` để xem và xác nhận bookings
- Thông báo sẽ xuất hiện real-time khi có booking mới

### 2. Cho User
- Đặt vé và thanh toán
- Booking sẽ có status 'pending'
- Admin sẽ nhận được thông báo real-time

## API Endpoints

### 1. Tạo booking
```
POST /api/bookings
Body: {
  showtime_id: string,
  seats: array,
  combos: object,
  payment_proof_url: string
}
```

### 2. Lấy danh sách bookings (Admin)
```
GET /api/admin/bookings?status=pending&theater_chain=CGV
```

### 3. Xác nhận/từ chối booking (Admin)
```
PATCH /api/admin/bookings
Body: {
  bookingId: string,
  action: 'confirm' | 'reject',
  adminId: string
}
```

## Socket.IO Events

### 1. Client -> Server
- `connect`: Kết nối Socket.IO
- `disconnect`: Ngắt kết nối

### 2. Server -> Client
- `booking_pending`: Thông báo có booking mới chờ xác nhận
- `booking_confirmed`: Thông báo booking đã được xác nhận
- `booking_rejected`: Thông báo booking đã bị từ chối

## Rooms
- `theater_CGV`: Theater admin của CGV
- `theater_Lotte Cinema`: Theater admin của Lotte Cinema
- `super_admin`: Super admin

## Troubleshooting

### 1. Socket không kết nối
- Kiểm tra JWT token có hợp lệ không
- Kiểm tra CORS configuration
- Kiểm tra environment variables

### 2. Thông báo không hiển thị
- Kiểm tra user role có đúng không
- Kiểm tra theater_chain có khớp không
- Kiểm tra console log để debug

### 3. Custom server không chạy
- Đảm bảo đã cài đặt `server.js`
- Kiểm tra port có bị conflict không
- Kiểm tra Next.js version compatibility

## Security
- JWT token được verify trước khi kết nối Socket
- Theater admin chỉ nhận thông báo của rạp mình
- Super admin nhận tất cả thông báo
- CORS được cấu hình đúng

## Performance
- Socket.IO sử dụng WebSocket với fallback
- Connection được reuse
- Rooms được sử dụng để filter thông báo
- Thông báo được lưu vào database để backup 