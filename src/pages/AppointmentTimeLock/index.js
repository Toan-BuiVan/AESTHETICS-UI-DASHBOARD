import React, { useState, useEffect, useCallback } from 'react';
import styles from './AppointmentTimeLock.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faSearch, faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import { useDebounce } from '~/hooks/index';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function AppointmentTimeLock() {
    const [locks, setLocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingLock, setEditingLock] = useState(null);
    const [selectedClinic, setSelectedClinic] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isOverloaded, setIsOverloaded] = useState('');
    const pageSize = 10;

    // Form states
    const [formData, setFormData] = useState({
        clinicId: '',
        startTime: '',
        endTime: '',
        isOverloaded: false,
    });

    const fetchLocks = useCallback(async (pageNo = 1, clinicId = '', startTime = '', endTime = '', overloaded = '') => {
        try {
            setLoading(true);
            const deviceName = localStorage.getItem('deviceName') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';
            const token = localStorage.getItem('token') || '';
            const userID = localStorage.getItem('userID') || '';

            const headers = {
                'Content-Type': 'application/json',
                DeviceName: deviceName,
                RefreshToken: refreshToken,
                UserID: userID,
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const payload = {
                pageNo: pageNo,
                pageSize: pageSize,
                clinicId: clinicId ? parseInt(clinicId, 10) : 0,
                startTime: startTime ? new Date(startTime).toISOString() : null,
                endTime: endTime ? new Date(endTime).toISOString() : null,
                isOverloaded: overloaded === '' ? true : overloaded === 'true',
            };

            const response = await fetch(`${API_BASE}/AppointmentTimeLock/getappointmenttimelockList`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Lỗi khi lấy danh sách khóa thời gian');

            const data = await response.json();
            setLocks(data.baseDatas || []);
            setTotalRecords(data.totalRecordCount || 0);
            setTotalPages(data.pageCount || 1);
            setCurrentPage(pageNo);
            setError(null);
        } catch (err) {
            setError(err.message);
            setLocks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocks(1, selectedClinic, startDate, endDate, isOverloaded);
    }, []);

    const handleSearch = () => {
        fetchLocks(1, selectedClinic, startDate, endDate, isOverloaded);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.clinicId || !formData.startTime || !formData.endTime) {
            setSuccessMessage('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        const deviceName = localStorage.getItem('deviceName') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';
        const token = localStorage.getItem('token') || '';
        const userID = localStorage.getItem('userID') || '';

        const headers = {
            'Content-Type': 'application/json',
            DeviceName: deviceName,
            RefreshToken: refreshToken,
            UserID: userID,
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const payload = {
                staffId: parseInt(formData.clinicId, 10),
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
                isOverloaded: formData.isOverloaded,
            };

            if (editingLock) {
                payload.id = editingLock.id;
                const response = await fetch(`${API_BASE}/AppointmentTimeLock/updateappointmenttimelock`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error('Lỗi khi cập nhật khóa thời gian');
                const result = await response.json();
                if (result.success) {
                    setSuccessMessage('Cập nhật khóa thời gian thành công!');
                } else {
                    setSuccessMessage('Cập nhật khóa thời gian thất bại!');
                }
            } else {
                const response = await fetch(`${API_BASE}/AppointmentTimeLock/createappointmenttimelock`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error('Lỗi khi thêm khóa thời gian');
                const result = await response.json();
                if (result.success) {
                    setSuccessMessage('Thêm khóa thời gian thành công!');
                } else {
                    setSuccessMessage('Thêm khóa thời gian thất bại!');
                }
            }

            setFormData({
                clinicId: '',
                startTime: '',
                endTime: '',
                isOverloaded: false,
            });
            setEditingLock(null);
            setIsFormVisible(false);

            setTimeout(() => {
                setSuccessMessage('');
                fetchLocks(currentPage, selectedClinic, startDate, endDate, isOverloaded);
            }, 1500);
        } catch (err) {
            setSuccessMessage('Có lỗi xảy ra: ' + err.message);
        }
    };

    const handleEdit = (lock) => {
        setEditingLock(lock);
        setFormData({
            clinicId: lock.clinicId,
            startTime: lock.startTime.replace('Z', ''),
            endTime: lock.endTime.replace('Z', ''),
            isOverloaded: lock.isOverloaded,
        });
        setIsFormVisible(true);
    };

    const handleDelete = async (lockId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khóa thời gian này?')) return;

        const deviceName = localStorage.getItem('deviceName') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';
        const token = localStorage.getItem('token') || '';
        const userID = localStorage.getItem('userID') || '';

        const headers = {
            'Content-Type': 'application/json',
            DeviceName: deviceName,
            RefreshToken: refreshToken,
            UserID: userID,
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(`${API_BASE}/AppointmentTimeLock/deleteappointmenttimelock`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ id: lockId }),
            });

            if (!response.ok) throw new Error('Lỗi khi xóa khóa thời gian');
            const result = await response.json();
            if (result.success) {
                setSuccessMessage('Xóa khóa thời gian thành công!');
                setTimeout(() => {
                    setSuccessMessage('');
                    fetchLocks(currentPage, selectedClinic, startDate, endDate, isOverloaded);
                }, 1500);
            } else {
                setSuccessMessage('Xóa khóa thời gian thất bại!');
            }
        } catch (err) {
            setSuccessMessage('Có lỗi xảy ra: ' + err.message);
        }
    };

    const toggleFormVisibility = () => {
        if (isFormVisible) {
            setFormData({
                clinicId: '',
                startTime: '',
                endTime: '',
                isOverloaded: false,
            });
            setEditingLock(null);
        }
        setIsFormVisible(!isFormVisible);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            fetchLocks(currentPage + 1, selectedClinic, startDate, endDate, isOverloaded);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchLocks(currentPage - 1, selectedClinic, startDate, endDate, isOverloaded);
        }
    };

    return (
        <div className={cx('wrapper')}>
            {successMessage && <SuccessMessage message={successMessage} />}

            <div className={cx('header')}>
                <h1>Quản Lý Khóa Thời Gian</h1>
                {!isFormVisible && (
                    <div className={cx('open-form-icon')} onClick={toggleFormVisibility}>
                        <FontAwesomeIcon icon={faPlus} />
                    </div>
                )}
            </div>

            <div className={cx('search-section')}>
                <input
                    type="text"
                    placeholder="Nhập Clinic ID..."
                    value={selectedClinic}
                    onChange={(e) => setSelectedClinic(e.target.value)}
                    className={cx('search-input')}
                />
                <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={cx('date-input')}
                />
                <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={cx('date-input')}
                />
                <select
                    value={isOverloaded}
                    onChange={(e) => setIsOverloaded(e.target.value)}
                    className={cx('select-input')}
                >
                    <option value="">-- Tất Cả --</option>
                    <option value="true">Quá Tải</option>
                    <option value="false">Không Quá Tải</option>
                </select>
                <button onClick={handleSearch} className={cx('search-button')}>
                    <FontAwesomeIcon icon={faSearch} />
                </button>
            </div>

            {isFormVisible && (
                <div className={cx('form-overlay')}>
                    <form className={cx('form-content')} onSubmit={handleFormSubmit}>
                        <div className={cx('form-header')}>
                            <h2>{editingLock ? 'Chỉnh Sửa Khóa Thời Gian' : 'Thêm Khóa Thời Gian'}</h2>
                            <FontAwesomeIcon
                                icon={faTimes}
                                className={cx('close-icon')}
                                onClick={toggleFormVisibility}
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Clinic ID *</label>
                            <input
                                type="number"
                                value={formData.clinicId}
                                onChange={(e) => setFormData({ ...formData, clinicId: e.target.value })}
                                required
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Thời Gian Bắt Đầu *</label>
                            <input
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Thời Gian Kết Thúc *</label>
                            <input
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                        </div>

                        <div className={cx('form-group', 'checkbox-group')}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.isOverloaded}
                                    onChange={(e) => setFormData({ ...formData, isOverloaded: e.target.checked })}
                                />
                                Quá Tải
                            </label>
                        </div>

                        <div className={cx('form-actions')}>
                            <button type="button" className={cx('btn-cancel')} onClick={toggleFormVisibility}>
                                Hủy
                            </button>
                            <button type="submit" className={cx('btn-submit')}>
                                {editingLock ? 'Cập Nhật' : 'Thêm'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className={cx('table-container')}>
                {loading ? (
                    <div className={cx('loading')}>Đang tải dữ liệu...</div>
                ) : error ? (
                    <div className={cx('error')}>Lỗi: {error}</div>
                ) : locks.length === 0 ? (
                    <div className={cx('empty-state')}>Không có khóa thời gian nào</div>
                ) : (
                    <table className={cx('locks-table')}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Clinic ID</th>
                                <th>Thời Gian Bắt Đầu</th>
                                <th>Thời Gian Kết Thúc</th>
                                <th>Quá Tải</th>
                                <th>Tạo Bởi</th>
                                <th>Ngày Tạo</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locks.map((lock) => (
                                <tr key={lock.id}>
                                    <td>{lock.id}</td>
                                    <td>{lock.clinicId}</td>
                                    <td>{new Date(lock.startTime).toLocaleString('vi-VN')}</td>
                                    <td>{new Date(lock.endTime).toLocaleString('vi-VN')}</td>
                                    <td>
                                        <span className={cx('status', lock.isOverloaded ? 'overloaded' : 'normal')}>
                                            {lock.isOverloaded ? 'Có' : 'Không'}
                                        </span>
                                    </td>
                                    <td>{lock.createdBy}</td>
                                    <td>{new Date(lock.creationDate).toLocaleString('vi-VN')}</td>
                                    <td>
                                        <div className={cx('action-buttons')}>
                                            <button
                                                className={cx('btn-icon-edit')}
                                                onClick={() => handleEdit(lock)}
                                                title="Chỉnh sửa"
                                            >
                                                <FontAwesomeIcon icon={faPen} />
                                            </button>
                                            <button
                                                className={cx('btn-icon-delete')}
                                                onClick={() => handleDelete(lock.id)}
                                                title="Xóa"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {locks.length > 0 && (
                <div className={cx('pagination')}>
                    <button onClick={handlePrevPage} disabled={currentPage === 1}>
                        Trang Trước
                    </button>
                    <span>
                        Trang {currentPage} / {totalPages} (Tổng: {totalRecords})
                    </span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                        Trang Sau
                    </button>
                </div>
            )}
        </div>
    );
}

export default AppointmentTimeLock;
