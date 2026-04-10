import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './StaffShift.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function StaffShift() {
    // State quản lý danh sách ca làm việc
    const [staffShifts, setStaffShifts] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý Staff dropdown
    const [staffs, setStaffs] = useState([]);

    // State quản lý form
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State quản lý form input
    const [formData, setFormData] = useState({
        date: '',
        startDate: '',
        endDate: '',
    });

    // State tìm kiếm
    const [searchData, setSearchData] = useState({
        date: '',
    });

    // State quản lý checkbox selection
    const [selectedShifts, setSelectedShifts] = useState(new Set());

    // Lấy danh sách Staff
    const fetchStaffs = useCallback(async () => {
        try {
            const response = await axios.post(`${API_BASE}/Staff/get-list`, {});
            if (response.data && response.data.baseDatas) {
                setStaffs(response.data.baseDatas);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách nhân viên:', error);
        }
    }, []);

    // Lấy danh sách ca làm việc
    const fetchStaffShifts = useCallback(
        async (page = 1, searchParams = {}) => {
            try {
                setIsLoading(true);
                const staffIdFromStorage = localStorage.getItem('staffId');
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                    staffId: parseInt(staffIdFromStorage) || 0,
                    date: searchParams.date ? new Date(searchParams.date).toISOString() : null,
                };

                const response = await axios.post(`${API_BASE}/StaffShift/getstaffshiftlist`, payload);
                if (response.data && response.data.baseDatas) {
                    setStaffShifts(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách ca làm việc:', error);
                setSuccessMessage('Lỗi lấy danh sách ca làm việc');
                setShowSuccessMessage(true);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize],
    );

    // Khởi tạo dữ liệu
    useEffect(() => {
        fetchStaffs();
        fetchStaffShifts(1);
    }, [fetchStaffs, fetchStaffShifts]);

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
        setPageIndex(1);
        fetchStaffShifts(1, debouncedSearchData);
    }, [debouncedSearchData, fetchStaffShifts]);

    // Xử lý thay đổi input form
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Xử lý thay đổi input tìm kiếm
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Mở form thêm ca làm việc
    const handleAddShift = () => {
        setFormData({
            date: '',
            startDate: '',
            endDate: '',
        });
        setIsFormVisible(true);
    };

    // Gửi form (Thêm ca làm việc)
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            if (!formData.date) {
                setSuccessMessage('Vui lòng chọn ngày');
                setShowSuccessMessage(true);
                return;
            }

            if (!formData.startDate) {
                setSuccessMessage('Vui lòng chọn giờ bắt đầu');
                setShowSuccessMessage(true);
                return;
            }

            if (!formData.endDate) {
                setSuccessMessage('Vui lòng chọn giờ kết thúc');
                setShowSuccessMessage(true);
                return;
            }

            const staffIdFromStorage = localStorage.getItem('staffId');
            if (!staffIdFromStorage) {
                setSuccessMessage('Không tìm thấy ID nhân viên trong hệ thống');
                setShowSuccessMessage(true);
                return;
            }

            const payload = {
                staffId: parseInt(staffIdFromStorage),
                date: new Date(formData.date).toISOString(),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            };

            const response = await axios.post(`${API_BASE}/StaffShift/createstaffshift`, payload);
            if (response.data) {
                setSuccessMessage('Thêm ca làm việc thành công!');
                setShowSuccessMessage(true);
                setIsFormVisible(false);
                fetchStaffShifts(1, searchData);
            }
        } catch (error) {
            console.error('Lỗi xử lý form:', error);
            setSuccessMessage(error.response?.data?.message || 'Có lỗi xảy ra');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Select/Deselect checkbox
    const handleSelectShift = (shiftId) => {
        const newSelected = new Set(selectedShifts);
        if (newSelected.has(shiftId)) {
            newSelected.delete(shiftId);
        } else {
            newSelected.add(shiftId);
        }
        setSelectedShifts(newSelected);
    };

    // Select all checkbox
    const handleSelectAll = () => {
        if (selectedShifts.size === staffShifts.length) {
            setSelectedShifts(new Set());
        } else {
            setSelectedShifts(new Set(staffShifts.map((shift) => shift.id)));
        }
    };

    // Delete multiple shifts
    const handleDeleteMultiple = async () => {
        if (selectedShifts.size === 0) {
            setSuccessMessage('Vui lòng chọn ít nhất một ca để xóa');
            setShowSuccessMessage(true);
            return;
        }

        if (selectedShifts.size > 1) {
            setSuccessMessage('Chỉ có thể xóa 1 ca tại một lần');
            setShowSuccessMessage(true);
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn xóa ca làm việc đã chọn?')) {
            return;
        }

        try {
            setIsLoading(true);
            const deletePromises = Array.from(selectedShifts).map((id) =>
                axios.post(`${API_BASE}/StaffShift/deletestaffshift`, { id }),
            );
            await Promise.all(deletePromises);
            setSuccessMessage('Xóa ca làm việc thành công!');
            setShowSuccessMessage(true);
            setSelectedShifts(new Set());
            fetchStaffShifts(pageIndex, searchData);
        } catch (error) {
            console.error('Lỗi xóa ca làm việc:', error);
            setSuccessMessage('Lỗi xóa ca làm việc');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusName = (status) => {
        if (status === 2) return 'Nghỉ';
        return 'Đã phân công';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatTime = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const totalPages = Math.ceil(totalRecordCount / pageSize);

    if (!isLoading && staffShifts.length === 0 && totalRecordCount === 0) {
        return (
            <div className={cx('wrapper')}>
                <SuccessMessage message={successMessage} isVisible={showSuccessMessage} />
                <div className={cx('header')}>
                    <h1>Quản Lý Ca Làm Việc</h1>
                    <div className={cx('header-actions')}>
                        <button className={cx('btn-primary')} onClick={handleAddShift}>
                            <FontAwesomeIcon icon={faPlus} />
                            Thêm Ca Làm Việc
                        </button>
                    </div>
                </div>

                <div className={cx('table-container')}>
                    <div className={cx('empty-state')}>Không có dữ liệu</div>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <SuccessMessage message={successMessage} isVisible={showSuccessMessage} />

            {/* Header */}
            <div className={cx('header')}>
                <h1>Quản Lý Ca Làm Việc</h1>
                <div className={cx('header-actions')}>
                    {selectedShifts.size === 1 && (
                        <button
                            className={cx('btn-delete-multiple')}
                            onClick={handleDeleteMultiple}
                            title="Xóa ca làm việc được chọn"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            Xóa
                        </button>
                    )}
                    <button className={cx('btn-primary')} onClick={handleAddShift}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm Ca Làm Việc
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className={cx('search-section')}>
                <input
                    type="date"
                    name="date"
                    value={searchData.date}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
            </div>

            {/* Table */}
            {isLoading ? (
                <div className={cx('table-container')}>
                    <div className={cx('loading')}>Đang tải...</div>
                </div>
            ) : (
                <div className={cx('table-container')}>
                    <table className={cx('shifts-table')}>
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={selectedShifts.size === staffShifts.length && staffShifts.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>ID</th>
                                <th>Ngày</th>
                                <th>Giờ Bắt Đầu</th>
                                <th>Giờ Kết Thúc</th>
                                <th>Trạng Thái</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffShifts.map((shift) => (
                                <tr key={shift.id} className={selectedShifts.has(shift.id) ? cx('selected') : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedShifts.has(shift.id)}
                                            onChange={() => handleSelectShift(shift.id)}
                                        />
                                    </td>
                                    <td>{shift.id}</td>
                                    <td>{formatDate(shift.date)}</td>
                                    <td>{formatTime(shift.startDate)}</td>
                                    <td>{formatTime(shift.endDate)}</td>
                                    <td>{getStatusName(shift.status)}</td>
                                    <td className={cx('action-buttons')}>
                                        <button
                                            onClick={() => {
                                                setSelectedShifts(new Set([shift.id]));
                                                handleDeleteMultiple();
                                            }}
                                            title="Xóa"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button disabled={pageIndex === 1} onClick={() => fetchStaffShifts(pageIndex - 1, searchData)}>
                        Trang Trước
                    </button>
                    <span>
                        Trang {pageIndex} / {totalPages}
                    </span>
                    <button
                        disabled={pageIndex === totalPages}
                        onClick={() => fetchStaffShifts(pageIndex + 1, searchData)}
                    >
                        Trang Sau
                    </button>
                </div>
            )}

            {/* Form Modal */}
            {isFormVisible && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal-content')}>
                        <div className={cx('modal-header')}>
                            <h2>Thêm Ca Làm Việc</h2>
                            <button className={cx('btn-close')} onClick={() => setIsFormVisible(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form className={cx('form')} onSubmit={handleSubmitForm}>
                            <div className={cx('form-group')}>
                                <label>Ngày Làm Việc *</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label>Giờ Bắt Đầu *</label>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label>Giờ Kết Thúc *</label>
                                <input
                                    type="datetime-local"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className={cx('form-actions')}>
                                <button
                                    type="button"
                                    className={cx('btn-cancel')}
                                    onClick={() => setIsFormVisible(false)}
                                >
                                    Hủy
                                </button>
                                <button type="submit" className={cx('btn-submit')} disabled={isLoading}>
                                    {isLoading ? 'Đang xử lý...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StaffShift;
