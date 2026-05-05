import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import styles from './Statistics.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFilter,
    faDownload,
    faCalendarAlt,
    faBox,
    faStethoscope,
    faTicketAlt,
} from '@fortawesome/free-solid-svg-icons';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SummaryCards from './components/SummaryCards';
import TopProductsTable from './components/TopProductsTable';
import TopDoctorsTable from './components/TopDoctorsTable';
import TopVouchersTable from './components/TopVouchersTable';
import RevenueChart from './components/RevenueChart';
import SectionFilter from './components/SectionFilter';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api/Statistics';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    DeviceName: localStorage.getItem('deviceName') || '',
    RefreshToken: localStorage.getItem('refreshToken') || '',
    Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
    UserID: localStorage.getItem('userID') || '',
});

function Statistics() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [topCount, setTopCount] = useState(10);

    // Loading states - riêng cho từng section
    const [mainLoading, setMainLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(false);
    const [doctorsLoading, setDoctorsLoading] = useState(false);
    const [vouchersLoading, setVouchersLoading] = useState(false);

    // Data states
    const [monthlyStats, setMonthlyStats] = useState(null);
    const [topVouchers, setTopVouchers] = useState([]);
    const [topDoctors, setTopDoctors] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [summary, setSummary] = useState(null);

    // Use ref to track debounce timeout
    const debounceTimeoutRef = useRef(null);

    // Fetch all statistics data (filter chung)
    const fetchAllStatistics = useCallback(async (start, end, top) => {
        const headers = getHeaders();
        const payload = {
            startDate: start?.toISOString() || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: end?.toISOString() || new Date().toISOString(),
            topCount: top || 10,
        };

        try {
            setMainLoading(true);

            const [monthlyRes, vouchersRes, doctorsRes, productsRes, summaryRes] = await Promise.all([
                axios.post(`${API_BASE}/getmonthlystatistics`, payload, { headers }),
                axios.post(`${API_BASE}/gettopvouchersused`, payload, { headers }),
                axios.post(`${API_BASE}/gettopdoctorsbykpi`, payload, { headers }),
                axios.post(`${API_BASE}/gettopsellingproducts`, payload, { headers }),
                axios.post(`${API_BASE}/getstatisticssummary`, payload, { headers }),
            ]);

            if (monthlyRes.data?.success) setMonthlyStats(monthlyRes.data.data);
            if (vouchersRes.data?.success) setTopVouchers(vouchersRes.data.data || []);
            if (doctorsRes.data?.success) setTopDoctors(doctorsRes.data.data || []);
            if (productsRes.data?.success) setTopProducts(productsRes.data.data || []);
            if (summaryRes.data?.success) setSummary(summaryRes.data.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setMainLoading(false);
        }
    }, []);

    // Fetch riêng cho Products
    const fetchProducts = useCallback(async (start, end, top) => {
        const headers = getHeaders();
        const payload = {
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
            topCount: top,
        };

        try {
            setProductsLoading(true);
            const response = await axios.post(`${API_BASE}/gettopsellingproducts`, payload, { headers });
            if (response.data?.success) {
                setTopProducts(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setProductsLoading(false);
        }
    }, []);

    // Fetch riêng cho Doctors
    const fetchDoctors = useCallback(async (start, end, top) => {
        const headers = getHeaders();
        const payload = {
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
            topCount: top,
        };

        try {
            setDoctorsLoading(true);
            const response = await axios.post(`${API_BASE}/gettopdoctorsbykpi`, payload, { headers });
            if (response.data?.success) {
                setTopDoctors(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setDoctorsLoading(false);
        }
    }, []);

    // Fetch riêng cho Vouchers
    const fetchVouchers = useCallback(async (start, end, top) => {
        const headers = getHeaders();
        const payload = {
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
            topCount: top,
        };

        try {
            setVouchersLoading(true);
            const response = await axios.post(`${API_BASE}/gettopvouchersused`, payload, { headers });
            if (response.data?.success) {
                setTopVouchers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        } finally {
            setVouchersLoading(false);
        }
    }, []);

    // Initialize with default date range
    useEffect(() => {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        setEndDate(endDate);
        setStartDate(startDate);
    }, []);

    // Fetch data when global filter changes with debounce
    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (startDate && endDate) {
            debounceTimeoutRef.current = setTimeout(() => {
                fetchAllStatistics(startDate, endDate, topCount);
            }, 1500);
        }

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [startDate, endDate, topCount, fetchAllStatistics]);

    const handleExport = () => {
        console.log('Export data');
    };

    const handleResetFilter = () => {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        setStartDate(startDate);
        setEndDate(endDate);
        setTopCount(10);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <div className={cx('title-section')}>
                    <h1 className={cx('title')}>Thống Kê Tổng Hợp</h1>
                    <p className={cx('subtitle')}>Phân tích chi tiết về kinh doanh, sản phẩm và dịch vụ</p>
                </div>

                {/* <div className={cx('actions')}>
                    <button className={cx('btn-action')} onClick={handleExport}>
                        <FontAwesomeIcon icon={faDownload} />
                        <span>Xuất Báo Cáo</span>
                    </button>
                </div> */}
            </div>

            {/* Global Filter Section */}
            <div className={cx('filter-section')}>
                <h3 className={cx('filter-title')}>📊 Bộ Lọc Chung</h3>
                <div className={cx('filter-group')}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <div className={cx('filter-item')}>
                            <label className={cx('filter-label')}>
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                Từ Ngày
                            </label>
                            <DatePicker
                                value={startDate}
                                onChange={setStartDate}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        className: cx('date-input'),
                                    },
                                }}
                            />
                        </div>

                        <div className={cx('filter-item')}>
                            <label className={cx('filter-label')}>
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                Đến Ngày
                            </label>
                            <DatePicker
                                value={endDate}
                                onChange={setEndDate}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        className: cx('date-input'),
                                    },
                                }}
                            />
                        </div>
                    </LocalizationProvider>

                    <div className={cx('filter-item')}>
                        <label className={cx('filter-label')}>
                            <FontAwesomeIcon icon={faFilter} />
                            Số Lượng
                        </label>
                        <input
                            type="number"
                            className={cx('number-input')}
                            value={topCount}
                            onChange={(e) => setTopCount(parseInt(e.target.value) || 10)}
                            min="1"
                            max="100"
                        />
                    </div>

                    <button className={cx('btn-reset')} onClick={handleResetFilter}>
                        Đặt Lại
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && <SummaryCards data={summary} />}

            {/* Charts and Tables */}
            <div className={cx('content')}>
                {/* Revenue Chart */}
                <RevenueChart />

                {/* Top Products Section */}
                <div className={cx('section')}>
                    <div className={cx('section-header')}>
                        <h2 className={cx('section-title')}>
                            <FontAwesomeIcon icon={faBox} />
                            Sản Phẩm Bán Chạy
                        </h2>
                        <span className={cx('count')}>{topProducts.length} sản phẩm</span>
                    </div>
                    <SectionFilter
                        onFilter={({ startDate: start, endDate: end, topCount: count }) =>
                            fetchProducts(start, end, count)
                        }
                        isLoading={productsLoading}
                        defaultValues={{ startDate, endDate, topCount }}
                    />
                    <TopProductsTable data={topProducts} isLoading={productsLoading} />
                </div>

                {/* Top Doctors Section */}
                <div className={cx('section')}>
                    <div className={cx('section-header')}>
                        <h2 className={cx('section-title')}>
                            <FontAwesomeIcon icon={faStethoscope} />
                            Bác Sĩ - Nhân Viên Xuất Sắc
                        </h2>
                        <span className={cx('count')}>{topDoctors.length} nhân viên</span>
                    </div>
                    <SectionFilter
                        onFilter={({ startDate: start, endDate: end, topCount: count }) =>
                            fetchDoctors(start, end, count)
                        }
                        isLoading={doctorsLoading}
                        defaultValues={{ startDate, endDate, topCount }}
                    />
                    <TopDoctorsTable data={topDoctors} isLoading={doctorsLoading} />
                </div>

                {/* Top Vouchers Section */}
                <div className={cx('section')}>
                    <div className={cx('section-header')}>
                        <h2 className={cx('section-title')}>
                            <FontAwesomeIcon icon={faTicketAlt} />
                            Mã Giảm Giá Được Sử Dụng
                        </h2>
                        <span className={cx('count')}>{topVouchers.length} mã</span>
                    </div>
                    <SectionFilter
                        onFilter={({ startDate: start, endDate: end, topCount: count }) =>
                            fetchVouchers(start, end, count)
                        }
                        isLoading={vouchersLoading}
                        defaultValues={{ startDate, endDate, topCount }}
                    />
                    <TopVouchersTable data={topVouchers} isLoading={vouchersLoading} />
                </div>
            </div>
        </div>
    );
}

export default Statistics;
