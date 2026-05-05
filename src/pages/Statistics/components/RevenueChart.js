import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './RevenueChart.module.scss';
import classNames from 'classnames/bind';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import useDebounce from '../../../hooks/useDebounce';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function RevenueChart() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [revenueData, setRevenueData] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounce month and year with 3 second delay
    const debouncedMonth = useDebounce(month, 3000);
    const debouncedYear = useDebounce(year, 3000);

    const getHeaders = () => ({
        'Content-Type': 'application/json',
        DeviceName: localStorage.getItem('deviceName') || '',
        RefreshToken: localStorage.getItem('refreshToken') || '',
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
        UserID: localStorage.getItem('userID') || '',
    });

    // Fetch daily revenue data
    useEffect(() => {
        const fetchDailyRevenue = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.post(
                    `${API_BASE}/Statistics/daily-revenue`,
                    {
                        month: debouncedMonth,
                        year: debouncedYear,
                    },
                    {
                        headers: getHeaders(),
                    },
                );

                if (response.data?.success && response.data?.data) {
                    const apiData = response.data.data;
                    const dailyStats = apiData.dailyStatistics || [];

                    // Store full API data for summary stats
                    setRevenueData(apiData);

                    // Extract labels and data from API response
                    const labels = dailyStats.map((stat) => stat.formattedDate);
                    const paidData = dailyStats.map((stat) => stat.paidRevenue);
                    const unpaidData = dailyStats.map((stat) => stat.unpaidRevenue);

                    setChartData({
                        labels: labels,
                        datasets: [
                            {
                                label: 'Doanh Thu Đã Thanh Toán',
                                data: paidData,
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                borderWidth: 3,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 4,
                                pointBackgroundColor: '#10b981',
                                pointBorderColor: '#ffffff',
                                pointBorderWidth: 2,
                                pointHoverRadius: 6,
                            },
                            {
                                label: 'Doanh Thu Chưa Thanh Toán',
                                data: unpaidData,
                                borderColor: '#f59e0b',
                                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                borderWidth: 3,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 4,
                                pointBackgroundColor: '#f59e0b',
                                pointBorderColor: '#ffffff',
                                pointBorderWidth: 2,
                                pointHoverRadius: 6,
                            },
                        ],
                    });
                } else {
                    setError('Không thể tải dữ liệu từ API');
                }
            } catch (err) {
                console.error('Error fetching revenue data:', err);
                setError('Lỗi khi tải dữ liệu: ' + (err.message || 'Không xác định'));
            } finally {
                setLoading(false);
            }
        };

        fetchDailyRevenue();
    }, [debouncedMonth, debouncedYear]);

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: {
                        size: 12,
                        weight: '600',
                    },
                    color: '#333',
                    padding: 16,
                    usePointStyle: true,
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 13,
                    weight: 'bold',
                },
                bodyFont: {
                    size: 12,
                },
                borderColor: 'rgba(0, 0, 0, 0.2)',
                borderWidth: 1,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        const value = context.parsed.y;
                        label += new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            minimumFractionDigits: 0,
                        }).format(value);
                        return label;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 12,
                    },
                    color: '#999',
                    callback: function (value) {
                        return new Intl.NumberFormat('vi-VN', {
                            notation: 'compact',
                            compactDisplay: 'short',
                        }).format(value);
                    },
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                },
            },
            x: {
                ticks: {
                    font: {
                        size: 11,
                    },
                    color: '#999',
                    maxRotation: 45,
                    minRotation: 0,
                },
                grid: {
                    display: false,
                    drawBorder: false,
                },
            },
        },
    };

    if (loading) {
        return (
            <div className={cx('chart-container')}>
                <div className={cx('section-header')}>
                    <h2 className={cx('section-title')}>📊 Biểu Đồ Doanh Thu</h2>
                </div>
                <div className={cx('loading')}>
                    <FontAwesomeIcon icon={faSpinner} className={cx('spinner')} />
                    <span>Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cx('chart-container')}>
                <div className={cx('section-header')}>
                    <h2 className={cx('section-title')}>📊 Biểu Đồ Doanh Thu</h2>
                </div>
                <div className={cx('error')}>{error}</div>
            </div>
        );
    }

    if (!chartData) {
        return <div className={cx('empty')}>Không có dữ liệu biểu đồ</div>;
    }

    // Format currency in Vietnamese format (without symbol for display)
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    return (
        <div className={cx('chart-container')}>
            <div className={cx('section-header')}>
                <h2 className={cx('section-title')}>📊 Biểu Đồ Doanh Thu</h2>
                {revenueData && <span className={cx('month-year')}>{revenueData.monthYearString}</span>}
            </div>

            {/* Filter Section */}
            <div className={cx('filter-section')}>
                <div className={cx('filter-group')}>
                    <label htmlFor="month-select" className={cx('filter-label')}>
                        Tháng
                    </label>
                    <select
                        id="month-select"
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        className={cx('filter-select')}
                    >
                        <option value={1}>Tháng 1</option>
                        <option value={2}>Tháng 2</option>
                        <option value={3}>Tháng 3</option>
                        <option value={4}>Tháng 4</option>
                        <option value={5}>Tháng 5</option>
                        <option value={6}>Tháng 6</option>
                        <option value={7}>Tháng 7</option>
                        <option value={8}>Tháng 8</option>
                        <option value={9}>Tháng 9</option>
                        <option value={10}>Tháng 10</option>
                        <option value={11}>Tháng 11</option>
                        <option value={12}>Tháng 12</option>
                    </select>
                </div>

                <div className={cx('filter-group')}>
                    <label htmlFor="year-select" className={cx('filter-label')}>
                        Năm
                    </label>
                    <select
                        id="year-select"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className={cx('filter-select')}
                    >
                        {[...Array(11)].map((_, i) => {
                            const yr = currentYear - 5 + i;
                            return (
                                <option key={yr} value={yr}>
                                    {yr}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <button
                    onClick={() => {
                        setMonth(currentMonth);
                        setYear(currentYear);
                    }}
                    className={cx('filter-button', 'reset')}
                >
                    Đặt Lại
                </button>
            </div>

            {/* Chart Section */}
            <div className={cx('chart-wrapper')}>
                <Line data={chartData} options={options} height={300} />
            </div>

            {/* Summary Statistics */}
            {revenueData && (
                <div className={cx('summary-section')}>
                    <div className={cx('summary-grid')}>
                        <div className={cx('stat-card', 'paid')}>
                            <div className={cx('stat-label')}>Doanh Thu Đã Thanh Toán</div>
                            <div className={cx('stat-value')}>₫ {formatCurrency(revenueData.totalPaidRevenue)}</div>
                            <div className={cx('stat-detail')}>
                                Số hóa đơn: <span className={cx('stat-count')}>{revenueData.totalPaidInvoices}</span>
                            </div>
                        </div>

                        <div className={cx('stat-card', 'unpaid')}>
                            <div className={cx('stat-label')}>Doanh Thu Chưa Thanh Toán</div>
                            <div className={cx('stat-value')}>₫ {formatCurrency(revenueData.totalUnpaidRevenue)}</div>
                            <div className={cx('stat-detail')}>
                                Số hóa đơn: <span className={cx('stat-count')}>{revenueData.totalUnpaidInvoices}</span>
                            </div>
                        </div>

                        <div className={cx('stat-card', 'total')}>
                            <div className={cx('stat-label')}>Tổng Doanh Thu Tháng</div>
                            <div className={cx('stat-value')}>₫ {formatCurrency(revenueData.totalMonthlyRevenue)}</div>
                            <div className={cx('stat-detail')}>
                                Tổng hóa đơn: <span className={cx('stat-count')}>{revenueData.totalInvoices}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RevenueChart;
