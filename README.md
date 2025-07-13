# QICKCINEMA
## 1. Giới thiệu hệ thống 
   - Tên dự án: Xây dựng hệ thống đặt vé xem phim trực tuyến tích hợp quản lý rạp chiếu và trải nghiệm người dùng nâng cao.
   - Mục tiêu dự án: Mục tiêu của hệ thống là xây dựng một ứng dụng đặt vé phim tiện lợi, trực quan, hỗ trợ người dùng thực hiện toàn bộ quy trình đặt vé (xem phim, chọn suất   chiếu, chọn ghế, thanh toán) và cung cấp giao diện quản trị cho admin quản lý phim, rạp, suất chiếu, người dùng, vé. Ứng dụng được xây dựng theo mô hình Progressive Web App, hỗ trợ chạy mượt mà trên cả web và thiết bị di động. 
   - Đối tượng sử dụng: người dùng, người dùng đã đăng nhập, admin 
## 2. Chức năng 
| Mã | Tên chức năng | Mô tả ngắn | Đối tượng | 
|----|--------------|-------------|-----------|
| FUNC - 01 | Đăng ký / Đăng nhập | Tạo tài khoản (User), đăng nhập bằng mật khẩu | User / Admin |
| FUNC - 02 | Đề xuất phim thông minh |  ợi ý phim dựa trên lịch sử tìm kiếm, thể loại yêu thích người dùng được khai báo sau đăng kí, kết hợp với rating cao | User |
| FUNC - 03 | Tìm kiếm và lọc phim |  Tìm kiếm phim theo tên, thể loại, ngày chiếu, hoặc bộ lọc nâng cao khác | User |
| FUNC - 04 | Xem trailer phim | Người dùng xem trailer của các bộ phim, cung cấp hình ảnh và video minh họa trước khi đặt vé | User |
| FUNC - 05	| Rating phim và bình luận | Người dùng có thể đánh giá bình luận dưới mỗi trailer phim | User |
| FUNC - 06 | Chọn ghế bằng sơ đồ động | Người dùng chọn vị trí ghế ngồi theo sơ đồ ghế được cập nhật theo thời gian thực, tránh trùng lặp | User |
| FUNC - 07 | Đặt vé và thanh toán | Đặt vé trực tuyến, chọn suất chiếu, số lượng vé và thanh toán bằng cách xuất ra file (ảnh) thông tin vé và số tài khoản thanh toán | User |
| FUNC - 08 | Xem lịch sử đặt vé | Người dùng có thể xem lại các vé đã đặt và thông tin chi tiết về các lần đặt vé trước đó | User |
| FUNC - 09 | Chat trực tuyến | Hệ thống chat thời gian thực giữa người dùng và admin để hỗ trợ, giải đáp thắc mắc và xử lý yêu cầu | User / Admin |
| FUNC - 10 | Quản lý phim và suất chiếu | Thêm, sửa, xóa thông tin phim và lịch chiếu qua giao diện quản trị | Admin |
| FUNC - 11 | Quản lý người dùng | Quản lý danh sách người dùng, phân quyền và xử lý các vấn đề liên quan | Admin |
| FUNC - 12 | Hỗ trợ PWA | Trang web hỗ trợ tính năng Progressive Web App, cho phép sử dụng offline và trải nghiệm app trên di động |  |
| FUNC - 13 | Responsive Design | Giao diện thân thiện với mọi thiết bị, từ desktop, tablet đến điện thoại di động |   |




This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
