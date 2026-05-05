# 📊 Trang Thống Kê Kinh Doanh - Statistics Page

## 📋 Tổng Quan

Trang **Thống Kê Kinh Doanh** là một trang chuyên nghiệp, chi tiết để xem, phân tích và theo dõi các chỉ số kinh doanh quan trọng của cửa hàng. Trang này tích hợp các biểu đồ, bảng dữ liệu chi tiết, thẻ tóm tắt và các công cụ lọc dữ liệu hiện đại.

## 🎯 Tính Năng Chính

### 1. **Bộ Lọc Ngày Tháng**

- Chọn khoảng thời gian từ ngày bắt đầu đến ngày kết thúc
- Điều chỉnh số lượng top N (mặc định: 10)
- Nút đặt lại để quay về mặc định (90 ngày gần nhất)
- Tự động cập nhật dữ liệu khi thay đổi bộ lọc (debounce 1500ms)

### 2. **Thẻ Tóm Tắt (Summary Cards)**

Hiển thị 6 chỉ số chính trong các thẻ có màu sắc riêng biệt:

- 💚 **Tổng Doanh Thu**: Tổng tiền bán hàng trong khoảng thời gian
- 🔵 **Tổng Hóa Đơn**: Số lượng hóa đơn/đơn đặt hàng
- 🔴 **Tổng Khách Hàng**: Số lượng khách hàng trong khoảng thời gian
- 🟡 **Sản Phẩm Bán**: Tổng số sản phẩm bán ra
- 🟣 **Mã Giảm Giá**: Số lượng voucher được sử dụng
- 🟠 **Đánh Giá Trung Bình**: Điểm đánh giá trung bình

### 3. **Biểu Đồ Doanh Thu (Revenue Chart)**

- Hiển thị biểu đồ đường thể hiện doanh thu hàng ngày
- Tooltip thông minh với định dạng tiền tệ Việt Nam
- Responsive design phù hợp với mọi kích thước màn hình

### 4. **Bảng Sản Phẩm Bán Chạy**

Hiển thị top sản phẩm có doanh số cao nhất với thông tin:

- Tên sản phẩm
- Số lượng bán
- Giá bán và giá vốn
- Lợi nhuận và tỷ suất lợi nhuận (%)
- Đánh giá trung bình

### 5. **Bảng Bác Sĩ/Nhân Viên Xuất Sắc**

Chi tiết hiệu suất của nhân viên:

- Họ tên, chuyên khoa, email
- Số lượng lịch hẹn
- Doanh thu từ dịch vụ
- Hoa hồng và thưởng
- Điểm KPI
- Đánh giá và số lượng lượt đánh giá

### 6. **Bảng Mã Giảm Giá Được Sử Dụng**

Theo dõi hiệu quả của các mã giảm giá:

- Mã giảm giá (code)
- Lần sử dụng
- Giá trị giảm (%)
- Tổng giảm giá
- Giảm giá trung bình

## 📡 API Endpoints

Trang này sử dụng các API endpoints sau (base URL: `http://localhost:5122/api/Statistics`):

1. **getmonthlystatistics** - Lấy thống kê tổng hợp theo tháng
2. **gettopvouchersused** - Lấy top mã giảm giá được sử dụng
3. **gettopdoctorsbykpi** - Lấy top bác sĩ/nhân viên theo KPI
4. **gettopsellingproducts** - Lấy top sản phẩm bán chạy
5. **getstatisticssummary** - Lấy tóm tắt thống kê

## 📁 Cấu Trúc Thư Mục

```
src/pages/Statistics/
├── index.js                 # Component chính
├── Statistics.module.scss   # Styling chính
├── README.md               # File này
└── components/
    ├── SummaryCards.js                 # Thẻ tóm tắt
    ├── SummaryCards.module.scss
    ├── TopProductsTable.js             # Bảng sản phẩm
    ├── TopProductsTable.module.scss
    ├── TopDoctorsTable.js              # Bảng bác sĩ/nhân viên
    ├── TopDoctorsTable.module.scss
    ├── TopVouchersTable.js             # Bảng voucher
    ├── TopVouchersTable.module.scss
    ├── RevenueChart.js                 # Biểu đồ doanh thu
    └── RevenueChart.module.scss
```

## 🎨 Đặc Điểm Thiết Kế

- **Professional & Elegant**: Thiết kế đơn giản, sạch sẽ, tập trung vào dữ liệu
- **Responsive**: Tối ưu hóa cho tất cả kích thước màn hình (desktop, tablet, mobile)
- **Color Coding**: Sử dụng màu sắc để phân biệt các phần tử
- **Better Readability**: Font size, spacing, và contrast được tối ưu hóa
- **Accessibility**: Tuân thủ chuẩn WCAG

## 🔧 Cách Sử Dụng

1. Truy cập `/statistics` trong ứng dụng
2. Chọn khoảng thời gian bằng date picker
3. Điều chỉnh số lượng top N nếu cần
4. Dữ liệu sẽ tự động cập nhật
5. Xem các thẻ tóm tắt, biểu đồ và bảng dữ liệu

## 💾 Thông Tin Lưu Trữ

Dữ liệu được lấy từ localStorage:

- `token` - JWT token cho xác thực
- `deviceName` - Tên thiết bị
- `refreshToken` - Token làm mới
- `userID` - ID người dùng
- 🏥 **Dịch Vụ Cung Cấp**: Tổng số dịch vụ được cung cấp

### 3. **Biểu Đồ (Charts)**

#### Top Sản Phẩm Bán Chạy Nhất

- Biểu đồ cột (Bar Chart) hiển thị doanh thu của các sản phẩm hàng đầu
- Dữ liệu từ API: `gettopdoctorsbykpi`

#### Top Bác Sĩ Theo KPI

- Biểu đồ cột (Bar Chart) so sánh điểm KPI và số lượng lịch hẹn
- Dữ liệu từ API: `gettopdoctorsbykpi`

#### Top Voucher Được Sử Dụng

- Biểu đồ tròn (Pie Chart) hiển thị tỷ lệ sử dụng voucher
- Dữ liệu từ API: `gettopvouchersused`

### 4. **Bảng Dữ Liệu Chi Tiết (Data Tables)**

#### 📊 Chi Tiết Sản Phẩm Bán Chạy

| Cột             | Mô Tả                     |
| --------------- | ------------------------- |
| Tên Sản Phẩm    | Tên sản phẩm              |
| Số Lượng Bán    | Tổng số lượng bán         |
| Doanh Thu       | Tổng tiền thu được        |
| Giá Bán         | Giá bán từng sản phẩm     |
| Giá Vốn         | Giá vốn từng sản phẩm     |
| Lợi Nhuận       | Tiền lãi từ sản phẩm      |
| Tỷ Lệ Lợi Nhuận | Phần trăm lợi nhuận       |
| Đánh Giá        | Điểm và số lượng đánh giá |

#### 👨‍⚕️ Chi Tiết Bác Sĩ Theo KPI

| Cột               | Mô Tả                     |
| ----------------- | ------------------------- |
| Tên Bác Sĩ        | Tên đầy đủ bác sĩ         |
| Chuyên Khoa       | Chuyên khoa của bác sĩ    |
| Lịch Hẹn          | Số lượng lịch hẹn         |
| Điểm KPI          | Điểm đánh giá hiệu suất   |
| Hoa Hồng          | Tổng tiền hoa hồng        |
| Thưởng            | Tổng tiền thưởng          |
| Doanh Thu Dịch Vụ | Tổng tiền từ dịch vụ      |
| Đánh Giá          | Điểm và số lượng đánh giá |

#### 🏷️ Chi Tiết Voucher Được Sử Dụng

| Cột                   | Mô Tả                 |
| --------------------- | --------------------- |
| Mã Voucher            | Mã code voucher       |
| Số Lần Sử Dụng        | Tổng số lần sử dụng   |
| Giá Trị Voucher       | Giá trị chiết khấu    |
| Tổng Chiết Khấu       | Tổng tiền chiết khấu  |
| Chiết Khấu Trung Bình | Chiết khấu trung bình |

## 🔌 API Endpoints

### 1. Thống Kê Toàn Diện Hàng Tháng

```
POST http://localhost:5122/api/Statistics/getmonthlystatistics
```

**Request:**

```json
{
    "startDate": "2026-05-02T14:21:06.951Z",
    "endDate": "2026-05-02T14:21:06.951Z",
    "topCount": 10
}
```

### 2. Top Vouchers Được Sử Dụng

```
POST http://localhost:5122/api/Statistics/gettopvouchersused
```

### 3. Top Bác Sĩ Theo KPI

```
POST http://localhost:5122/api/Statistics/gettopdoctorsbykpi
```

### 4. Top Sản Phẩm Bán Chạy

```
POST http://localhost:5122/api/Statistics/gettopsellingproducts
```

### 5. Thống Kê Tóm Tắt

```
POST http://localhost:5122/api/Statistics/getstatisticssummary
```

## 🎨 Thiết Kế & Responsive

- ✅ **Responsive Design**: Thích ứng tốt trên mobile, tablet, và desktop
- ✅ **Modern UI**: Sử dụng gradient, shadow, và hover effects
- ✅ **Color Scheme**: Teal/Turquoise theme (#4bc0c0) kết hợp với white background
- ✅ **Typography**: Sử dụng font Roboto cho giao diện chuyên nghiệp

## 💻 Công Nghệ Sử Dụng

- **React 19.1.0**: Framework chính
- **Axios**: HTTP client để gọi API
- **Chart.js & react-chartjs-2**: Thư viện biểu đồ
- **Material-UI**: Component date picker
- **SCSS Modules**: Styling

## 📝 Hướng Dẫn Sử Dụng

### 1. Truy Cập Trang

```
http://localhost:3000/statistics
```

### 2. Sử Dụng Bộ Lọc

1. Chọn **Từ Ngày** - ngày bắt đầu thống kê
2. Chọn **Đến Ngày** - ngày kết thúc thống kê
3. Nhập **Top N** - số lượng items hàng đầu (1-100)
4. Dữ liệu sẽ tự động cập nhật

### 3. Xem Dữ Liệu

- Xem các thẻ tóm tắt (Summary Cards) ở phía trên
- Xem biểu đồ ở giữa trang
- Cuộn xuống để xem bảng dữ liệu chi tiết

## 🔧 Cấu Hình

### Thay Đổi API Base URL

Mở file `src/pages/Statistics/index.js` và thay đổi:

```javascript
const API_BASE_URL = 'http://localhost:5122/api/Statistics';
```

### Tùy Chỉnh Số Lượng Columns

Sửa biến `topCount` trong bộ lọc (mặc định: 10)

### Thay Đổi Màu Sắc

Mở file `src/pages/Statistics/Statistics.module.scss` và thay đổi:

- `#4bc0c0`: Màu chính (Teal)
- `#2a9d8f`: Màu phụ (Dark Teal)
- `#333`: Màu text chính

## 🚀 Tính Năng Nâng Cao

### Formatting Numbers

```javascript
// Định dạng tiền tệ
formatCurrency(value); // 1,000,000₫

// Định dạng số
formatNumber(value); // 1,000,000
```

### Error Handling

- Trang hiển thị lỗi nếu API không thể truy cập
- Toast notification hoặc error message hiển thị rõ ràng

### Loading State

- Hiển thị "Đang tải dữ liệu..." khi gọi API
- Prevent duplicate requests bằng debounce

## 🐛 Troubleshooting

### Dữ liệu không cập nhật

- Kiểm tra kết nối mạng
- Kiểm tra token xác thực
- Xem console logs (F12) để debug

### Biểu đồ không hiển thị

- Kiểm tra dữ liệu có rỗng không
- Xác nhận dataset có dữ liệu

### API 401 Unauthorized

- Đảm bảo token được lưu trong localStorage
- Kiểm tra header authorization

## 📱 Responsive Breakpoints

| Device              | Grid        | Font |
| ------------------- | ----------- | ---- |
| Desktop (>1200px)   | 2-3 columns | 100% |
| Tablet (768-1200px) | 1-2 columns | 95%  |
| Mobile (<768px)     | 1 column    | 85%  |

## ✨ Cải Tiến Tương Lai

- [ ] Export thống kê ra PDF/Excel
- [ ] Scheduler để gửi report định kỳ
- [ ] So sánh doanh số theo khoảng thời gian
- [ ] Drill-down chi tiết cho từng sản phẩm/bác sĩ
- [ ] Real-time dashboard updates
- [ ] Custom report builder

---

**Tác Giả**: AI Assistant  
**Ngày Tạo**: 2026-05-02  
**Phiên Bản**: 1.0.0
