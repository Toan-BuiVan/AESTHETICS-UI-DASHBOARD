import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Vouchers.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faSearch, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Vouchers() {
    // State quản lý danh sách vouchers
    const [vouchers, setVouchers] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý form
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingVoucherId, setEditingVoucherId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State quản lý form input
    const [formData, setFormData] = useState({
        description: '',
        discountValue: '',
        startDate: '',
        endDate: '',
        minimumOrderValue: '',
        maxValue: '',
        rankMember: '',
        ratingPoints: '',
        accumulatedPoints: '',
        usageLimit: '',
        isActive: true,
    });

    // State tìm kiếm
    const [searchData, setSearchData] = useState({
        code: '',
        rankMember: '',
        startDate: '',
        endDate: '',
    });

    // State checkbox selection
    const [selectedVouchers, setSelectedVouchers] = useState(new Set());

    // Lấy danh sách vouchers
    const fetchVouchers = useCallback(
        async (page = 1, searchParams = {}) => {
            try {
                setIsLoading(true);
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                    code: searchParams.code || null,
                    rankMember: searchParams.rankMember || null,
                    startDate: searchParams.startDate || null,
                    endDate: searchParams.endDate || null,
                };

                const response = await axios.post(`${API_BASE}/Voucher/getvoucherlist`, payload);
                if (response.data && response.data.baseDatas) {
                    setVouchers(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách vouchers:', error);
                setSuccessMessage('Lỗi lấy danh sách vouchers');
                setShowSuccessMessage(true);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize],
    );

    // Khởi tạo dữ liệu
    useEffect(() => {
        fetchVouchers(1);
    }, [fetchVouchers]);

    // Auto-hide success message after 3 seconds
    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    // Xử lý thay đổi input form
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
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

    // Tìm kiếm
    const handleSearch = () => {
        setPageIndex(1);
        fetchVouchers(1, searchData);
    };

    // Mở form thêm voucher
    const handleAddVoucher = () => {
        setIsEditMode(false);
        setEditingVoucherId(null);
        setFormData({
            description: '',
            discountValue: '',
            startDate: '',
            endDate: '',
            minimumOrderValue: '',
            maxValue: '',
            rankMember: '',
            ratingPoints: '',
            accumulatedPoints: '',
            usageLimit: '',
            isActive: true,
        });
        setIsFormVisible(true);
    };

    // Mở form sửa voucher
    const handleEditVoucher = (voucher) => {
        setIsEditMode(true);
        setEditingVoucherId(voucher.id);
        setFormData({
            description: voucher.description || '',
            discountValue: voucher.discountValue || '',
            startDate: voucher.startDate ? voucher.startDate.split('T')[0] : '',
            endDate: voucher.endDate ? voucher.endDate.split('T')[0] : '',
            minimumOrderValue: voucher.minimumOrderValue || '',
            maxValue: voucher.maxValue || '',
            rankMember: voucher.rankMember || '',
            ratingPoints: voucher.ratingPoints || '',
            accumulatedPoints: voucher.accumulatedPoints || '',
            usageLimit: voucher.usageLimit || '',
            isActive: voucher.isActive || true,
        });
        setIsFormVisible(true);
    };

    // Gửi form (Thêm hoặc Sửa)
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        if (!formData.description || !formData.discountValue) {
            setSuccessMessage('Vui lòng nhập đủ thông tin bắt buộc');
            setShowSuccessMessage(true);
            return;
        }

        try {
            setIsLoading(true);
            let payload = { ...formData };

            // Chuyển đổi kiểu dữ liệu
            payload.discountValue = parseFloat(payload.discountValue) || 0;
            payload.minimumOrderValue = parseFloat(payload.minimumOrderValue) || 0;
            payload.maxValue = parseFloat(payload.maxValue) || 0;
            payload.ratingPoints = parseInt(payload.ratingPoints) || 0;
            payload.accumulatedPoints = parseInt(payload.accumulatedPoints) || 0;
            payload.usageLimit = parseInt(payload.usageLimit) || 0;

            if (isEditMode) {
                payload.id = editingVoucherId;
                await axios.post(`${API_BASE}/Voucher/updatevoucher`, payload);
            } else {
                await axios.post(`${API_BASE}/Voucher/createvoucher`, payload);
            }

            setSuccessMessage(isEditMode ? 'Cập nhật voucher thành công!' : 'Thêm voucher thành công!');
            setShowSuccessMessage(true);
            setIsFormVisible(false);
            fetchVouchers(pageIndex, searchData);
        } catch (error) {
            console.error('Lỗi:', error);
            setSuccessMessage(error.response?.data?.message || 'Có lỗi xảy ra');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle select checkbox
    const handleSelectVoucher = (voucherId) => {
        const newSelected = new Set(selectedVouchers);
        if (newSelected.has(voucherId)) {
            newSelected.delete(voucherId);
        } else {
            newSelected.add(voucherId);
        }
        setSelectedVouchers(newSelected);
    };

    // Select all checkbox
    const handleSelectAll = () => {
        if (selectedVouchers.size === vouchers.length) {
            setSelectedVouchers(new Set());
        } else {
            setSelectedVouchers(new Set(vouchers.map((v) => v.id)));
        }
    };

    // Xóa nhiều voucher
    const handleDeleteMultiple = async () => {
        if (selectedVouchers.size === 0) {
            setSuccessMessage('Vui lòng chọn ít nhất một voucher để xóa');
            setShowSuccessMessage(true);
            return;
        }

        if (selectedVouchers.size > 1) {
            setSuccessMessage('Chỉ có thể xóa 1 voucher tại một lần');
            setShowSuccessMessage(true);
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedVouchers.size} voucher đã chọn?`)) {
            return;
        }

        try {
            setIsLoading(true);
            const deletePromises = Array.from(selectedVouchers).map((id) =>
                axios.post(`${API_BASE}/Voucher/deletevoucher`, { id }),
            );
            await Promise.all(deletePromises);
            setSuccessMessage(`Xóa ${selectedVouchers.size} voucher thành công!`);
            setShowSuccessMessage(true);
            setSelectedVouchers(new Set());
            fetchVouchers(pageIndex, searchData);
        } catch (error) {
            console.error('Lỗi xóa voucher:', error);
            setSuccessMessage('Lỗi xóa voucher');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Tính số trang
    const totalPages = Math.ceil(totalRecordCount / pageSize);

    return (
        <div className={cx('wrapper')}>
            {showSuccessMessage && <SuccessMessage message={successMessage} />}

            {/* Header */}
            <div className={cx('header')}>
                <h1>Quản Lý Vouchers</h1>
                <div className={cx('header-actions')}>
                    {selectedVouchers.size > 0 && (
                        <button
                            className={cx('btn-delete-multiple', { disabled: selectedVouchers.size > 1 })}
                            onClick={handleDeleteMultiple}
                            disabled={selectedVouchers.size > 1}
                            title={
                                selectedVouchers.size > 1
                                    ? 'Chỉ có thể xóa 1 voucher tại một lần'
                                    : 'Xóa voucher được chọn'
                            }
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            Xóa ({selectedVouchers.size})
                        </button>
                    )}
                    <button className={cx('btn-primary')} onClick={handleAddVoucher}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm Voucher
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className={cx('search-section')}>
                <input
                    type="text"
                    name="code"
                    placeholder="Tìm kiếm mã voucher..."
                    value={searchData.code}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
                <input
                    type="text"
                    name="rankMember"
                    placeholder="Hạng thành viên..."
                    value={searchData.rankMember}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
                <input
                    type="date"
                    name="startDate"
                    value={searchData.startDate}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
                <input
                    type="date"
                    name="endDate"
                    value={searchData.endDate}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
                <button className={cx('btn-search')} onClick={handleSearch}>
                    <FontAwesomeIcon icon={faSearch} />
                    Tìm Kiếm
                </button>
            </div>

            {/* Vouchers Table */}
            <div className={cx('table-container')}>
                {isLoading ? (
                    <div className={cx('loading')}>Đang tải...</div>
                ) : vouchers.length > 0 ? (
                    <table className={cx('vouchers-table')}>
                        <thead>
                            <tr>
                                <th className={cx('checkbox-cell')}>
                                    <input
                                        type="checkbox"
                                        checked={selectedVouchers.size === vouchers.length && vouchers.length > 0}
                                        onChange={handleSelectAll}
                                        title="Chọn tất cả"
                                    />
                                </th>
                                <th>Mã Voucher</th>
                                <th>Mô Tả</th>
                                <th>Giảm Giá (%)</th>
                                <th>Ngày Bắt Đầu</th>
                                <th>Ngày Kết Thúc</th>
                                <th>Hạng Thành Viên</th>
                                <th>Giới Hạn Dùng</th>
                                <th>Trạng Thái</th>
                                <th>Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.map((voucher) => (
                                <tr key={voucher.id} className={cx({ selected: selectedVouchers.has(voucher.id) })}>
                                    <td className={cx('checkbox-cell')}>
                                        <input
                                            type="checkbox"
                                            checked={selectedVouchers.has(voucher.id)}
                                            onChange={() => handleSelectVoucher(voucher.id)}
                                        />
                                    </td>
                                    <td className={cx('code')}>{voucher.code}</td>
                                    <td>{voucher.description}</td>
                                    <td>{voucher.discountValue}%</td>
                                    <td>{new Date(voucher.startDate).toLocaleDateString('vi-VN')}</td>
                                    <td>{new Date(voucher.endDate).toLocaleDateString('vi-VN')}</td>
                                    <td>{voucher.rankMember || 'N/A'}</td>
                                    <td>{voucher.usageLimit}</td>
                                    <td>
                                        <span className={cx('badge', voucher.isActive ? 'active' : 'inactive')}>
                                            {voucher.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                        </span>
                                    </td>
                                    <td className={cx('action-buttons')}>
                                        <button
                                            className={cx('btn-icon-edit')}
                                            onClick={() => handleEditVoucher(voucher)}
                                            title="Sửa"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={cx('empty-state')}>Không có voucher nào</div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button disabled={pageIndex === 1} onClick={() => fetchVouchers(pageIndex - 1, searchData)}>
                        Trang Trước
                    </button>
                    <span>
                        Trang {pageIndex} / {totalPages}
                    </span>
                    <button
                        disabled={pageIndex === totalPages}
                        onClick={() => fetchVouchers(pageIndex + 1, searchData)}
                    >
                        Trang Sau
                    </button>
                </div>
            )}

            {/* Modal Form */}
            {isFormVisible && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal-content')}>
                        <div className={cx('modal-header')}>
                            <h2>{isEditMode ? 'Cập Nhật Voucher' : 'Thêm Voucher'}</h2>
                            <button className={cx('btn-close')} onClick={() => setIsFormVisible(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form className={cx('form')} onSubmit={handleSubmitForm}>
                            <div className={cx('form-group')}>
                                <label>
                                    Mô Tả <span className={cx('required')}>*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Nhập mô tả voucher"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>
                                        Giảm Giá (%) <span className={cx('required')}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                        required
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Giá Trị Đơn Tối Thiểu (₫)</label>
                                    <input
                                        type="number"
                                        name="minimumOrderValue"
                                        value={formData.minimumOrderValue}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Giá Trị Giảm Tối Đa (₫)</label>
                                    <input
                                        type="number"
                                        name="maxValue"
                                        value={formData.maxValue}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Ngày Bắt Đầu</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Ngày Kết Thúc</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Hạng Thành Viên</label>
                                    <input
                                        type="text"
                                        name="rankMember"
                                        value={formData.rankMember}
                                        onChange={handleFormChange}
                                        placeholder="Bronze, Silver, Gold..."
                                    />
                                </div>
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Điểm Đánh Giá</label>
                                    <input
                                        type="number"
                                        name="ratingPoints"
                                        value={formData.ratingPoints}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Điểm Tích Luỹ</label>
                                    <input
                                        type="number"
                                        name="accumulatedPoints"
                                        value={formData.accumulatedPoints}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Giới Hạn Dùng</label>
                                    <input
                                        type="number"
                                        name="usageLimit"
                                        value={formData.usageLimit}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                    />
                                </div>
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

export default Vouchers;
