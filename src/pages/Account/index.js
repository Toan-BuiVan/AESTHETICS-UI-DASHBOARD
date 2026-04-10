import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Account.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Account() {
    // State quản lý danh sách tài khoản
    const [accounts, setAccounts] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý form
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAccountId, setEditingAccountId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State quản lý form input
    const [formData, setFormData] = useState({
        userName: '',
        passWord: '',
        referralCode: '',
        accountType: 0,
        isDoctor: false,
        originPassWord: '',
        newPassWord: '',
    });

    // State tìm kiếm
    const [searchData, setSearchData] = useState({
        id: '',
        userName: '',
    });

    // State quản lý checkbox selection
    const [selectedAccounts, setSelectedAccounts] = useState(new Set());

    // Lấy danh sách tài khoản
    const fetchAccounts = useCallback(
        async (page = 1, searchParams = {}) => {
            try {
                setIsLoading(true);
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                    id: parseInt(searchParams.id) || null,
                    userName: searchParams.userName || null,
                };

                const response = await axios.post(`${API_BASE}/Account/pagingaccount`, payload);
                if (response.data && response.data.baseDatas) {
                    setAccounts(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách tài khoản:', error);
                setSuccessMessage('Lỗi lấy danh sách tài khoản');
                setShowSuccessMessage(true);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize],
    );

    // Khởi tạo dữ liệu
    useEffect(() => {
        fetchAccounts(1);
    }, [fetchAccounts]);

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
        fetchAccounts(1, debouncedSearchData);
    }, [debouncedSearchData, fetchAccounts]);

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

    // Mở form thêm tài khoản
    const handleAddAccount = () => {
        setIsEditMode(false);
        setEditingAccountId(null);
        setFormData({
            userName: '',
            passWord: '',
            referralCode: '',
            accountType: 0,
            isDoctor: false,
            originPassWord: '',
            newPassWord: '',
        });
        setIsFormVisible(true);
    };

    // Gửi form (Thêm tài khoản)
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            if (isEditMode) {
                // Update password
                if (!formData.originPassWord || !formData.newPassWord) {
                    setSuccessMessage('Vui lòng nhập mật khẩu cũ và mật khẩu mới');
                    setShowSuccessMessage(true);
                    return;
                }

                const payload = {
                    id: editingAccountId,
                    originPassWord: formData.originPassWord,
                    newPassWord: formData.newPassWord,
                };

                const response = await axios.post(`${API_BASE}/Account/updateaccount`, payload);
                if (response.data) {
                    setSuccessMessage('Cập nhật mật khẩu tài khoản thành công!');
                    setShowSuccessMessage(true);
                    setIsFormVisible(false);
                    fetchAccounts(pageIndex, searchData);
                }
            } else {
                // Create account
                if (!formData.userName || !formData.passWord) {
                    setSuccessMessage('Vui lòng nhập username và password');
                    setShowSuccessMessage(true);
                    return;
                }

                const payload = {
                    userName: formData.userName,
                    passWord: formData.passWord,
                    referralCode: formData.referralCode,
                    accountType: parseInt(formData.accountType),
                    isDoctor: formData.isDoctor,
                };

                const response = await axios.post(`${API_BASE}/Account/createaccount`, payload);
                if (response.data) {
                    setSuccessMessage('Thêm tài khoản thành công!');
                    setShowSuccessMessage(true);
                    setIsFormVisible(false);
                    fetchAccounts(1);
                }
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
    const handleSelectAccount = (accountId) => {
        const newSelected = new Set(selectedAccounts);
        if (newSelected.has(accountId)) {
            newSelected.delete(accountId);
        } else {
            newSelected.add(accountId);
        }
        setSelectedAccounts(newSelected);
    };

    // Select all checkbox
    const handleSelectAll = () => {
        if (selectedAccounts.size === accounts.length) {
            setSelectedAccounts(new Set());
        } else {
            setSelectedAccounts(new Set(accounts.map((a) => a.id)));
        }
    };

    // Delete multiple accounts
    const handleDeleteMultiple = async () => {
        if (selectedAccounts.size === 0) {
            setSuccessMessage('Vui lòng chọn ít nhất một tài khoản để xóa');
            setShowSuccessMessage(true);
            return;
        }

        if (selectedAccounts.size > 1) {
            setSuccessMessage('Chỉ có thể xóa 1 tài khoản tại một lần');
            setShowSuccessMessage(true);
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản đã chọn?`)) {
            return;
        }

        try {
            setIsLoading(true);
            const deletePromises = Array.from(selectedAccounts).map((id) =>
                axios.post(`${API_BASE}/Account/deleteaccount`, { id }),
            );
            await Promise.all(deletePromises);
            setSuccessMessage(`Xóa tài khoản thành công!`);
            setShowSuccessMessage(true);
            setSelectedAccounts(new Set());
            fetchAccounts(pageIndex, searchData);
        } catch (error) {
            console.error('Lỗi xóa tài khoản:', error);
            setSuccessMessage('Lỗi xóa tài khoản');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(totalRecordCount / pageSize);

    return (
        <div className={cx('wrapper')}>
            {showSuccessMessage && <SuccessMessage message={successMessage} />}

            {/* Header */}
            <div className={cx('header')}>
                <h1>Quản Lý Tài Khoản</h1>
                <div className={cx('header-actions')}>
                    {selectedAccounts.size === 1 && (
                        <button
                            className={cx('btn-delete-multiple')}
                            onClick={handleDeleteMultiple}
                            title="Xóa tài khoản được chọn"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            Xóa
                        </button>
                    )}
                    <button className={cx('btn-primary')} onClick={handleAddAccount}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm Tài Khoản
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className={cx('search-section')}>
                <input
                    type="text"
                    name="id"
                    placeholder="Tìm kiếm theo ID..."
                    value={searchData.id}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
                <input
                    type="text"
                    name="userName"
                    placeholder="Tìm kiếm theo Username..."
                    value={searchData.userName}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
            </div>

            {/* Accounts Table */}
            <div className={cx('table-container')}>
                {isLoading ? (
                    <div className={cx('loading')}>Đang tải...</div>
                ) : accounts.length > 0 ? (
                    <table className={cx('accounts-table')}>
                        <thead>
                            <tr>
                                <th className={cx('checkbox-cell')}>
                                    <input
                                        type="checkbox"
                                        checked={selectedAccounts.size === accounts.length && accounts.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>Username</th>
                                <th>Vai Trò</th>
                                <th>Ngày Tạo</th>
                                <th>Hết Hạn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((account) => (
                                <tr key={account.id} className={cx({ selected: selectedAccounts.has(account.id) })}>
                                    <td className={cx('checkbox-cell')}>
                                        <input
                                            type="checkbox"
                                            checked={selectedAccounts.has(account.id)}
                                            onChange={() => handleSelectAccount(account.id)}
                                        />
                                    </td>
                                    <td>{account.userName}</td>
                                    <td>{account.role === 1 ? 'Admin' : account.role === 2 ? 'Nhân viên' : 'Khách'}</td>
                                    <td>{new Date(account.creation).toLocaleDateString('vi-VN')}</td>
                                    <td>{new Date(account.tokenExpired).toLocaleDateString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={cx('empty-state')}>Không có tài khoản nào</div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button disabled={pageIndex === 1} onClick={() => fetchAccounts(pageIndex - 1, searchData)}>
                        Trang Trước
                    </button>
                    <span>
                        Trang {pageIndex} / {totalPages}
                    </span>
                    <button
                        disabled={pageIndex === totalPages}
                        onClick={() => fetchAccounts(pageIndex + 1, searchData)}
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
                            <h2>{isEditMode ? 'Đổi Mật Khẩu' : 'Thêm Tài Khoản'}</h2>
                            <button className={cx('btn-close')} onClick={() => setIsFormVisible(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form className={cx('form')} onSubmit={handleSubmitForm}>
                            {isEditMode ? (
                                <>
                                    <div className={cx('form-group')}>
                                        <label>Username</label>
                                        <input type="text" value={formData.userName} disabled />
                                    </div>
                                    <div className={cx('form-group')}>
                                        <label>Mật Khẩu Cũ *</label>
                                        <input
                                            type="password"
                                            name="originPassWord"
                                            value={formData.originPassWord}
                                            onChange={handleFormChange}
                                            placeholder="Nhập mật khẩu cũ"
                                            required
                                        />
                                    </div>
                                    <div className={cx('form-group')}>
                                        <label>Mật Khẩu Mới *</label>
                                        <input
                                            type="password"
                                            name="newPassWord"
                                            value={formData.newPassWord}
                                            onChange={handleFormChange}
                                            placeholder="Nhập mật khẩu mới"
                                            required
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={cx('form-group')}>
                                        <label>Username *</label>
                                        <input
                                            type="text"
                                            name="userName"
                                            value={formData.userName}
                                            onChange={handleFormChange}
                                            placeholder="Nhập username"
                                            required
                                        />
                                    </div>
                                    <div className={cx('form-group')}>
                                        <label>Mật Khẩu *</label>
                                        <input
                                            type="password"
                                            name="passWord"
                                            value={formData.passWord}
                                            onChange={handleFormChange}
                                            placeholder="Nhập mật khẩu"
                                            required
                                        />
                                    </div>
                                    <div className={cx('form-group')}>
                                        <label>Mã Giới Thiệu</label>
                                        <input
                                            type="text"
                                            name="referralCode"
                                            value={formData.referralCode}
                                            onChange={handleFormChange}
                                            placeholder="Nhập mã giới thiệu"
                                        />
                                    </div>
                                    <div className={cx('form-row')}>
                                        <div className={cx('form-group')}>
                                            <label>Loại Tài Khoản</label>
                                            <select
                                                name="accountType"
                                                value={formData.accountType}
                                                onChange={handleFormChange}
                                            >
                                                <option value="0">Khách</option>
                                                <option value="1">Admin</option>
                                                <option value="2">Nhân Viên</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className={cx('form-group-checkbox')}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="isDoctor"
                                                checked={formData.isDoctor}
                                                onChange={handleFormChange}
                                            />
                                            Đây là bác sĩ
                                        </label>
                                    </div>
                                </>
                            )}

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

export default Account;
