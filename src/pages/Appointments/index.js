import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Appointments.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import ItemAppointment from './ItemAppointment';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Appointments() {
    // State quản lý danh sách đặt lịch
    const [appointments, setAppointments] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý loading và message
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State tìm kiếm
    const [searchData, setSearchData] = useState({
        customerId: '',
        staffId: '',
        status: '',
        startDate: '',
        endDate: '',
    });

    // Lấy danh sách đặt lịch
    const fetchAppointments = useCallback(
        async (page = 1, filters = {}) => {
            try {
                setIsLoading(true);
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                    customerId: filters.customerId ? parseInt(filters.customerId) : null,
                    staffId: filters.staffId ? parseInt(filters.staffId) : null,
                    status: filters.status || '',
                    startDate: filters.startDate || null,
                    endDate: filters.endDate || null,
                };

                const response = await axios.post(`${API_BASE}/Appointment/getappointmentlist`, payload);
                if (response.data && response.data.baseDatas) {
                    setAppointments(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách đặt lịch:', error);
                setSuccessMessage('Lỗi lấy danh sách đặt lịch');
                setShowSuccessMessage(true);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize],
    );

    // Khởi tạo dữ liệu
    useEffect(() => {
        fetchAppointments(1);
    }, [fetchAppointments]);

    // Auto-hide success message after 3 seconds
    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    // Debounce search data with 3 second delay
    const debouncedSearchData = useDebounce(searchData, 3000);

    // Call API when debounced search data changes
    useEffect(() => {
        fetchAppointments(1, debouncedSearchData);
    }, [debouncedSearchData, fetchAppointments]);

    // Xử lý thay đổi tìm kiếm
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Xử lý xóa appointment
    const handleDeleteAppointment = (appointmentId) => {
        setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
        fetchAppointments(1, searchData);
    };

    // Xử lý cập nhật status appointment
    const handleStatusUpdate = () => {
        fetchAppointments(pageIndex, searchData);
    };

    // Xử lý pagination
    const handlePageChange = (newPage) => {
        fetchAppointments(newPage, searchData);
    };

    return (
        <div className={cx('wrapper')}>
            {showSuccessMessage && <SuccessMessage message={successMessage} />}

            {/* Header */}
            <div className={cx('header')}>
                <h1>Quản Lý Đặt Lịch</h1>
            </div>

            {/* Filter Section */}
            <div className={cx('filter-section')}>
                <div className={cx('filter-group')}>
                    <label>Trạng Thái</label>
                    <select
                        name="status"
                        value={searchData.status}
                        onChange={handleSearchChange}
                        className={cx('filter-input')}
                    >
                        <option value="">Tất cả</option>
                        <option value="Booked">Đã Đặt</option>
                        <option value="InProgress">Đang Thực Hiện</option>
                        <option value="Completed">Hoàn Thành</option>
                        <option value="Cancelled">Hủy</option>
                    </select>
                </div>

                <div className={cx('filter-group')}>
                    <label>Ngày Bắt Đầu</label>
                    <input
                        type="date"
                        name="startDate"
                        value={searchData.startDate}
                        onChange={handleSearchChange}
                        className={cx('filter-input')}
                    />
                </div>

                <div className={cx('filter-group')}>
                    <label>Ngày Kết Thúc</label>
                    <input
                        type="date"
                        name="endDate"
                        value={searchData.endDate}
                        onChange={handleSearchChange}
                        className={cx('filter-input')}
                    />
                </div>
            </div>

            {/* Danh sách đặt lịch */}
            <div className={cx('table-container')}>
                {isLoading ? (
                    <div className={cx('loading')}>Đang tải dữ liệu...</div>
                ) : appointments.length > 0 ? (
                    <>
                        <ItemAppointment
                            appointments={appointments}
                            onDeleteSuccess={handleDeleteAppointment}
                            onStatusUpdate={handleStatusUpdate}
                        />
                        {/* Pagination */}
                        <div className={cx('pagination')}>
                            {pageIndex > 1 && (
                                <button
                                    className={cx('btn-pagination')}
                                    onClick={() => handlePageChange(pageIndex - 1)}
                                >
                                    Trang Trước
                                </button>
                            )}
                            <span className={cx('page-info')}>
                                Trang {pageIndex} / {Math.ceil(totalRecordCount / pageSize)}
                            </span>
                            {pageIndex < Math.ceil(totalRecordCount / pageSize) && (
                                <button
                                    className={cx('btn-pagination')}
                                    onClick={() => handlePageChange(pageIndex + 1)}
                                >
                                    Trang Sau
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className={cx('no-data')}>Không có dữ liệu đặt lịch</div>
                )}
            </div>
        </div>
    );
}

export default Appointments;
