import React, { useState, useEffect } from 'react';
import styles from './DashBoard.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine,
    faDollarSign,
    faShoppingCart,
    faUser,
    faFilter,
    faBars,
    faDownload,
    faFileInvoice,
} from '@fortawesome/free-solid-svg-icons';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import { useDebounce } from '~/hooks';

const cx = classNames.bind(styles);

function DashBoard() {
    const [startDate, setStartDate] = useState(null);
    const [previousDate, setPreviousDate] = useState(null);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [monthlyImportStats, setMonthlyImportStats] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [topServices, setTopServices] = useState([]);
    const [weeklyBookings, setWeeklyBookings] = useState([]);
    const [customerSegments, setCustomerSegments] = useState({});
    const [financialMetrics, setFinancialMetrics] = useState({});
    const [orderStats, setOrderStats] = useState({});
    const [returningCustomerData, setReturningCustomerData] = useState({});
    const [bookingStats, setBookingStats] = useState({});
    const [monthlyBookings, setMonthlyBookings] = useState([]);
    const [topEmployees, setTopEmployees] = useState([]);
    const [topServiceEmployees, setTopServiceEmployees] = useState([]);
    const [topProductTypes, setTopProductTypes] = useState([]);
    const [topClinics, setTopClinics] = useState([]);
    const [voucherStats, setVoucherStats] = useState({});

    // Gọi API ban đầu với startDate và endDate là null khi component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Tạo đối tượng chứa cả hai ngày
    const dateRange = { startDate, previousDate };

    // Debounce đối tượng dateRange trong 2000ms
    const debouncedDateRange = useDebounce(dateRange, 2000);

    // Gọi API khi debouncedDateRange thay đổi
    useEffect(() => {
        fetchData();
    }, [debouncedDateRange]);

    const fetchData = async () => {
        const deviceName = localStorage.getItem('deviceName') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';
        const token = localStorage.getItem('token') || '';
        const userID = localStorage.getItem('userID') || '';

        const headers = {
            'Content-Type': 'application/json',
            DeviceName: deviceName,
            RefreshToken: refreshToken,
            Authorization: token ? `Bearer ${token}` : '',
            UserID: userID,
        };

        const body = {
            startDate: startDate ? startDate.toISOString() : null,
            endDate: previousDate ? previousDate.toISOString() : null,
        };

        try {
            const monthlyResponse = await fetch('https://buitoandev.somee.com/api/DashBoard/GetMonthlyStatistics', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            });
            const monthlyData = await monthlyResponse.json();
            if (monthlyData.responseCode === 1) {
                setMonthlyStats(monthlyData.listDashBoard);
            } else {
                console.error('Monthly stats API error:', monthlyData.resposeMessage);
            }

            const importStatsResponse = await fetch('https://buitoandev.somee.com/api/DashBoard/GetMonthlyImportStatistics', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            });
            const importStatsData = await importStatsResponse.json();
            if (importStatsData.responseCode === 1) {
                setMonthlyImportStats(importStatsData.listDashBoard);
            } else {
                console.error('Monthly import stats API error:', importStatsData.resposeMessage);
            }

            const productsResponse = await fetch('https://buitoandev.somee.com/api/DashBoard/GetTopProductsBySales', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            });
            const productsData = await productsResponse.json();
            if (productsData.responseCode === 1) {
                setTopProducts(productsData.listDashBoard);
            } else {
                console.error('Top products API error:', productsData.resposeMessage);
            }

            const servicesResponse = await fetch('https://buitoandev.somee.com/api/DashBoard/GetTopServicesBySales', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            });
            const servicesData = await servicesResponse.json();
            if (servicesData.responseCode === 1) {
                setTopServices(servicesData.listDashBoard.slice(0, 3));
            } else {
                console.error('Top services API error:', servicesData.resposeMessage);
            }

            const orderResponse = await fetch('https://buitoandev.somee.com/api/DashBoard/CountProcessedOrders', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            });
            const orderData = await orderResponse.json();
            if (orderData.responseCode === 1) {
                setOrderStats(orderData.listDashBoard[0]);
            } else {
                console.error('Order stats API error:', orderData.resposeMessage);
            }

            const returningCustomerResponse = await fetch(
                'https://buitoandev.somee.com/api/DashBoard/GetReturningCustomerRate',
                {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(body),
                },
            );
            const returningCustomerDataResult = await returningCustomerResponse.json();
            if (
                returningCustomerDataResult.responseCode === 1 &&
                returningCustomerDataResult.listDashBoard.length > 0
            ) {
                setReturningCustomerData(returningCustomerDataResult.listDashBoard[0]);
            } else {
                console.error('Returning customer API error:', returningCustomerDataResult.resposeMessage);
            }

            const bookingsResponse = await fetch('https://buitoandev.somee.com/api/DashBoard/GetTotalBookings', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            });
            const bookingsData = await bookingsResponse.json();
            if (bookingsData.responseCode === 1 && bookingsData.listDashBoard.length > 0) {
                setBookingStats(bookingsData.listDashBoard[0]);
            } else {
                console.error('Bookings API error:', bookingsData.resposeMessage);
            }

            const monthlyBookingsResponse = await fetch('https://buitoandev.somee.com/api/DashBoard/GetMonthlyBookingReport', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            });
            const monthlyBookingsData = await monthlyBookingsResponse.json();
            if (monthlyBookingsData.responseCode === 1) {
                setMonthlyBookings(monthlyBookingsData.listDashBoard);
            } else {
                console.error('Monthly bookings API error:', monthlyBookingsData.resposeMessage);
            }

            const topEmployeesResponse = await fetch(
                'https://buitoandev.somee.com/api/DashBoard/GetTopEmployeesByQuantityProduct',
                {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(body),
                },
            );
            const topEmployeesData = await topEmployeesResponse.json();
            if (topEmployeesData.responseCode === 1) {
                setTopEmployees(topEmployeesData.listDashBoard);
            } else {
                console.error('Top employees API error:', topEmployeesData.resposeMessage);
            }

            const topServiceEmployeesResponse = await fetch(
                'https://buitoandev.somee.com/api/DashBoard/GetTopEmployeesByQuantityServices',
                {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(body),
                },
            );
            const topServiceEmployeesData = await topServiceEmployeesResponse.json();
            if (topServiceEmployeesData.responseCode === 1) {
                setTopServiceEmployees(topServiceEmployeesData.listDashBoard);
            } else {
                console.error('Top service employees API error:', topServiceEmployeesData.resposeMessage);
            }

            const topProductTypesResponse = await fetch(
                'https://buitoandev.somee.com/api/DashBoard/GetTop3ProductTypesByRevenue',
                {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(body),
                },
            );
            const topProductTypesData = await topProductTypesResponse.json();
            if (topProductTypesData.responseCode === 1) {
                setTopProductTypes(topProductTypesData.listDashBoard);
            } else {
                console.error('Top product types API error:', topProductTypesData.resposeMessage);
            }

            const topClinicsResponse = await fetch('https://buitoandev.somee.com/api/DashBoard/GetTop3ClinicsByRevenue', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            });
            const topClinicsData = await topClinicsResponse.json();
            if (topClinicsData.responseCode === 1) {
                setTopClinics(topClinicsData.listDashBoard);
            } else {
                console.error('Top clinics API error:', topClinicsData.resposeMessage);
            }

            const voucherResponse = await fetch('https://buitoandev.somee.com/api/DashBoard/GetVoucherStatistics', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            });
            const voucherData = await voucherResponse.json();
            if (voucherData.responseCode === 1 && voucherData.listDashBoard.length > 0) {
                setVoucherStats(voucherData.listDashBoard[0]);
            } else {
                console.error('Voucher stats API error:', voucherData.resposeMessage);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    const totalRevenue = monthlyStats.reduce((sum, item) => sum + item.revenue, 0);

    const allMonths = Array.from(
        new Set([...monthlyStats.map((item) => item.month), ...monthlyImportStats.map((item) => item.month)]),
    ).sort((a, b) => a - b);

    const labels = allMonths.map((month) => `Tháng ${month}`);

    const revenueDataValues = allMonths.map((month) => {
        const stat = monthlyStats.find((item) => item.month === month);
        return stat ? stat.revenue : 0;
    });

    const importDataValues = allMonths.map((month) => {
        const stat = monthlyImportStats.find((item) => item.month === month);
        return stat ? stat.revenue : 0;
    });

    const revenueData = {
        labels: labels,
        datasets: [
            {
                label: 'Doanh thu',
                data: revenueDataValues,
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(138, 43, 226, 0.8)');
                    gradient.addColorStop(1, 'rgba(64, 224, 208, 0.2)');
                    return gradient;
                },
                borderColor: '#40E0D0',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#40E0D0',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#2a9d8f',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
            },
            {
                label: 'Nhập hàng',
                data: importDataValues,
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(255, 99, 132, 0.8)');
                    gradient.addColorStop(1, 'rgba(255, 99, 132, 0.2)');
                    return gradient;
                },
                borderColor: '#FF6384',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#FF6384',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#FF6384',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
            },
        ],
    };

    const monthlyBookingChartData = {
        labels: monthlyBookings.map((item) => `Tháng ${item.month}`),
        datasets: [
            {
                label: 'Booking đã hoàn thành',
                data: monthlyBookings.map((item) => item.completedBookings),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
            {
                label: 'Booking chưa hoàn thành',
                data: monthlyBookings.map((item) => item.incompleteBookings),
                fill: false,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
            },
        ],
    };

    const customerSegmentData = {
        labels: customerSegments.labels || ['Khách hàng mới', 'Khách hàng quay lại'],
        datasets: [
            {
                data: customerSegments.data || [300, 50],
                backgroundColor: ['#FF6384', '#36A2EB'],
            },
        ],
    };

    const top3Products = topProducts.slice(0, 3);
    const topProductsChartData = {
        labels: top3Products.map((item) => item.productName),
        datasets: [
            {
                label: 'Số lượng bán',
                data: top3Products.map((item) => item.totalSold),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    const topServicesChartData = {
        labels: topServices.map((item) => item.serviceName),
        datasets: [
            {
                label: 'Số lượng bán',
                data: topServices.map((item) => item.totalSold),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    const topProductTypesChartData = {
        labels: topProductTypes.map((item) => item.productsOfServicesName),
        datasets: [
            {
                label: 'Doanh thu',
                data: topProductTypes.map((item) => item.totalRevenue),
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(138, 43, 226, 0.8)');
                    gradient.addColorStop(1, 'rgba(64, 224, 208, 0.2)');
                    return gradient;
                },
                borderColor: '#40E0D0',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#40E0D0',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#2a9d8f',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
            },
        ],
    };

    const topClinicsChartData = {
        labels: topClinics.map((item) => item.clinicName),
        datasets: [
            {
                label: 'Doanh thu',
                data: topClinics.map((item) => item.totalRevenue),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                borderColor: '#40E0D0',
                borderWidth: 1,
            },
        ],
    };

    const voucherChartData = {
        labels: ['Phát hành', 'Sử dụng'],
        datasets: [
            {
                data: [voucherStats.totalVouchersIssued || 0, voucherStats.totalVouchersUsed || 0],
                backgroundColor: ['#FF6384', '#36A2EB'],
            },
        ],
    };

    const processedOrdersRatio = orderStats.totalCustomersTotalCustomers
        ? `${orderStats.processedInvoices} / ${orderStats.totalCustomersTotalCustomers}`
        : '0 / 0';

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className={cx('wrapper')}>
                <div className={cx('headers')}>
                    <div className={cx('date-pickers')}>
                        <div className={cx('date-picker-container')}>
                            <label>Từ ngày</label>
                            <DatePicker
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                format="dd/MM/yyyy"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        className={cx('date-picker')}
                                        inputProps={{ ...params.inputProps, placeholder: 'dd/MM/yyyy' }}
                                    />
                                )}
                            />
                        </div>
                        <div className={cx('date-picker-container')}>
                            <label>Đến ngày</label>
                            <DatePicker
                                value={previousDate}
                                onChange={(newValue) => setPreviousDate(newValue)}
                                format="dd/MM/yyyy"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        className={cx('date-picker')}
                                        inputProps={{ ...params.inputProps, placeholder: 'dd/MM/yyyy' }}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className={cx('cards-row')}>
                    <div className={cx('card')}>
                        <FontAwesomeIcon icon={faDollarSign} className={cx('icon')} />
                        <span>
                            Doanh thu: <strong>{totalRevenue.toLocaleString()} VND</strong>
                        </span>
                    </div>
                    <div className={cx('card')}>
                        <FontAwesomeIcon icon={faFileInvoice} className={cx('icon')} />
                        <span>
                            Hóa Đơn Xử Lý: <strong>{processedOrdersRatio}</strong>
                        </span>
                    </div>
                    <div className={cx('card')}>
                        <FontAwesomeIcon icon={faChartLine} className={cx('icon')} />
                        <span>
                            Lượt khám:{' '}
                            <strong>
                                {bookingStats.processedAssignments || 0} / {bookingStats.totalAssignments || 0}
                            </strong>
                        </span>
                    </div>
                    <div className={cx('card')}>
                        <FontAwesomeIcon icon={faUser} className={cx('icon')} />
                        <div className={cx('card-content')}>
                            <span>
                                Tổng Số Khách Hàng: <strong>{returningCustomerData.totalCustomers || '0'}</strong>
                            </span>
                            <span>
                                Khách Hàng Quay Lại: <strong>{returningCustomerData.repeatCustomers || '0'}</strong>
                            </span>
                            <span>
                                Phần Trăm Quay Lại:{' '}
                                <strong>{returningCustomerData.repeatCustomerPercentage || '0'}%</strong>
                            </span>
                        </div>
                    </div>
                </div>

                <div className={cx('row')}>
                    <div className={cx('chart')}>
                        <h3>Biểu đồ thu - chi theo tháng</h3>
                        <Line
                            data={revenueData}
                            options={{
                                plugins: {
                                    legend: {
                                        position: 'top',
                                        labels: {
                                            font: {
                                                size: 16,
                                                family: 'Roboto',
                                                weight: 'bold',
                                            },
                                            color: '#333',
                                            boxWidth: 20,
                                            padding: 15,
                                        },
                                    },
                                    tooltip: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        titleFont: { size: 14, family: 'Roboto', weight: 'bold' },
                                        bodyFont: { size: 8, family: 'Roboto' },
                                        borderColor: '#40E0D0',
                                        borderWidth: 1,
                                        cornerRadius: 6,
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                        callbacks: {
                                            label: (context) => {
                                                const label = context.label || '';
                                                const value = context.raw || 0;
                                                return `${label}: ${value.toLocaleString()} VND`;
                                            },
                                        },
                                    },
                                },
                                scales: {
                                    x: {
                                        ticks: {
                                            font: {
                                                size: 8,
                                                family: 'Roboto',
                                            },
                                            color: '#535252',
                                        },
                                        grid: {
                                            display: true,
                                            color: 'rgba(0, 0, 0, 0.1)',
                                            lineWidth: 1,
                                            borderDash: [5, 5],
                                        },
                                    },
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            font: {
                                                size: 8,
                                                family: 'Roboto',
                                            },
                                            color: '#535252',
                                            callback: (value) => {
                                                if (value >= 1000000) {
                                                    return `${value / 1000000}M VND`;
                                                }
                                                return `${value.toLocaleString()} VND`;
                                            },
                                            stepSize: 50000000,
                                        },
                                        grid: {
                                            display: true,
                                            color: (context) =>
                                                context.tick.major ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                                            lineWidth: (context) => (context.tick.major ? 2 : 1),
                                            borderDash: [5, 5],
                                        },
                                    },
                                },
                                animation: {
                                    duration: 1500,
                                    easing: 'easeOutBounce',
                                    delay: (context) => context.dataIndex * 200,
                                },
                            }}
                        />
                        <div className={cx('revenue-table')}>
                            <div className={cx('table-container')}>
                                <table>
                                    <tbody>
                                        {monthlyStats.slice(0, 3).map((item, index) => (
                                            <tr key={index}>
                                                <td>Tháng {item.month}</td>
                                                <td>{item.revenue.toLocaleString()} VND</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className={cx('table-container')}>
                                <table>
                                    <tbody>
                                        {monthlyStats.slice(3, 6).map((item, index) => (
                                            <tr key={index}>
                                                <td>Tháng {item.month}</td>
                                                <td>{item.revenue.toLocaleString()} VND</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className={cx('column')}>
                        <div className={cx('list')}>
                            <h3>Top 3 sản phẩm bán chạy</h3>
                            <Bar
                                data={topProductsChartData}
                                options={{
                                    scales: {
                                        x: {
                                            ticks: {
                                                callback: function (value, index) {
                                                    return `Cột ${index + 1}`;
                                                },
                                            },
                                        },
                                    },
                                }}
                            />
                            <div className={cx('legend-table')}>
                                <table>
                                    <tbody>
                                        {top3Products.map((item, index) => (
                                            <tr key={index}>
                                                <td>Cột {index + 1}</td>
                                                <td>{item.productName}</td>
                                                <td>{item.totalSold}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cx('row')}>
                    <div className={cx('chart')}>
                        <h3>Biểu đồ lượt đặt lịch khám</h3>
                        <Line data={monthlyBookingChartData} />
                    </div>
                    <div className={cx('column')}>
                        <div className={cx('list')}>
                            <h3>Top 3 dịch vụ bán chạy nhất</h3>
                            <div className={cx('chart')} data-title="top-services">
                                <Bar data={topServicesChartData} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cx('row')}>
                    <div className={cx('table')}>
                        <h3>Nhân Viên Sản Phẩm Xuất Sắc</h3>
                        <div className={cx('top-employees')}>
                            {topEmployees.slice(0, 3).map((employee, index) => (
                                <div key={employee.employeeID} className={cx('employee-item', `top-${index + 1}`)}>
                                    <span className={cx('cup-icon')}>
                                        {index === 0 && '🥇'}
                                        {index === 1 && '🥈'}
                                        {index === 2 && '🥉'}
                                    </span>
                                    <div className={cx('employee-info')}>
                                        <span className={cx('employee-name')}>
                                            Tên: <strong>{employee.employeeName}</strong>
                                        </span>
                                        <span className={cx('employee-sales')}>
                                            Số Lượng Bán: <strong>{employee.totalSold}</strong>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <hr />
                        <h3>Nhân Viên Dịch Vụ Xuất Sắc</h3>
                        <div className={cx('top-employees')}>
                            {topServiceEmployees.slice(0, 3).map((employee, index) => (
                                <div key={employee.employeeID} className={cx('employee-item', `top-${index + 1}`)}>
                                    <span className={cx('cup-icon')}>
                                        {index === 0 && '🥇'}
                                        {index === 1 && '🥈'}
                                        {index === 2 && '🥉'}
                                    </span>
                                    <div className={cx('employee-info')}>
                                        <span className={cx('employee-name')}>
                                            Tên: <strong>{employee.employeeName}</strong>
                                        </span>
                                        <span className={cx('employee-sales')}>
                                            Số Lượng Dịch Vụ: <strong>{employee.totalSold || 'N/A'}</strong>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={cx('chart')} data-title="top-product-types">
                        <h3>Top 3 Loại Sản Phẩm Doanh Thu</h3>
                        {topProductTypes.length > 0 ? (
                            <Line
                                data={topProductTypesChartData}
                                options={{
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                            labels: {
                                                font: {
                                                    size: 16,
                                                    family: 'Roboto',
                                                    weight: 'bold',
                                                },
                                                color: '#333',
                                                boxWidth: 20,
                                                padding: 15,
                                            },
                                        },
                                        tooltip: {
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            titleFont: { size: 14, family: 'Roboto', weight: 'bold' },
                                            bodyFont: { size: 8, family: 'Roboto' },
                                            borderColor: '#40E0D0',
                                            borderWidth: 1,
                                            cornerRadius: 6,
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                            callbacks: {
                                                label: (context) => {
                                                    const label = context.label || '';
                                                    const value = context.raw || 0;
                                                    return `${label}: ${value.toLocaleString()} VND`;
                                                },
                                            },
                                        },
                                    },
                                    scales: {
                                        x: {
                                            ticks: {
                                                font: {
                                                    size: 8,
                                                    family: 'Roboto',
                                                },
                                                color: '#535252',
                                            },
                                            grid: {
                                                display: true,
                                                color: (context) =>
                                                    context.tick.major ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                                                lineWidth: (context) => (context.tick.major ? 2 : 1),
                                                borderDash: [5, 5],
                                            },
                                        },
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                font: {
                                                    size: 8,
                                                    family: 'Roboto',
                                                },
                                                color: '#535252',
                                                callback: (value) => {
                                                    if (value >= 1000000) {
                                                        return `${value / 1000000}M VND`;
                                                    }
                                                    return `${value.toLocaleString()} VND`;
                                                },
                                                stepSize: 50000000,
                                            },
                                            grid: {
                                                display: true,
                                                color: (context) =>
                                                    context.tick.major ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                                                lineWidth: (context) => (context.tick.major ? 2 : 1),
                                                borderDash: [5, 5],
                                            },
                                        },
                                    },
                                    animation: {
                                        duration: 1500,
                                        easing: 'easeOutBounce',
                                        delay: (context) => context.dataIndex * 200,
                                    },
                                }}
                            />
                        ) : (
                            <p>Không có dữ liệu</p>
                        )}
                        <hr></hr>
                        <h3>Top 3 Phòng Khám Doanh Thu</h3>
                        {topClinics.length > 0 ? (
                            <>
                                <Bar
                                    data={topClinicsChartData}
                                    options={{
                                        plugins: {
                                            legend: {
                                                display: true,
                                            },
                                        },
                                        scales: {
                                            x: {
                                                ticks: {
                                                    font: {
                                                        size: 0,
                                                        family: 'Roboto',
                                                    },
                                                    color: '#535252',
                                                },
                                            },
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    callback: (value) => `${value.toLocaleString()} VND`,
                                                    font: {
                                                        size: 8,
                                                        family: 'Roboto',
                                                    },
                                                    color: '#535252',
                                                },
                                            },
                                        },
                                    }}
                                />
                                <div className={cx('legend-table')}>
                                    <table>
                                        <tbody>
                                            {topClinics.map((item, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <div
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'][
                                                                    index
                                                                ],
                                                                marginRight: '10px',
                                                            }}
                                                        ></div>
                                                    </td>
                                                    <td>{item.clinicName}</td>
                                                    <td>{item.totalRevenue.toLocaleString()} VND</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <p>Không có dữ liệu</p>
                        )}
                    </div>
                    <div className={cx('column')}>
                        <div className={cx('list')}>
                            <h3>Voucher: Phát hành vs Sử dụng</h3>
                            <Doughnut
                                data={voucherChartData}
                                width={50}
                                height={50}
                                options={{
                                    cutout: '50%',
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => {
                                                    const label = context.label || '';
                                                    const value = context.raw || 0;
                                                    return `${label}: ${value}`;
                                                },
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </LocalizationProvider>
    );
}

export default DashBoard;
