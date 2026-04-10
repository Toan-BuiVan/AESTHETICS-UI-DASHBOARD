import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Customer.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Customer() {
    // State quản lý danh sách khách hàng
    const [customers, setCustomers] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý form
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State quản lý form input
    const [formData, setFormData] = useState({
        accountId: '',
        fullName: '',
        email: '',
        phone: '',
        sex: '',
        address: '',
        idCard: '',
        dateBirth: '',
    });

    // State tìm kiếm
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebounce(searchText, 3000);

    // State quản lý checkbox selection
    const [selectedCustomers, setSelectedCustomers] = useState(new Set());

    // Lấy danh sách khách hàng
    const fetchCustomers = useCallback(
        async (page = 1) => {
            try {
                setIsLoading(true);
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                };

                const response = await axios.post(`${API_BASE}/Customer/getlistcustomer`, payload);
                if (response.data && response.data.baseDatas) {
                    setCustomers(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách khách hàng:', error);
                setSuccessMessage('Lỗi lấy danh sách khách hàng');
                setMessageType('error');
                setShowSuccessMessage(true);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize],
    );

    useEffect(() => {
        fetchCustomers(1);
    }, [debouncedSearchText, fetchCustomers]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
        setPageIndex(1);
    };

    // Handle edit customer
    const handleEditCustomer = (customer) => {
        setFormData({
            accountId: customer.accountId,
            fullName: customer.fullName || '',
            email: customer.email || '',
            phone: customer.phone || '',
            sex: customer.sex || '',
            address: customer.address || '',
            idCard: customer.idCard || '',
            dateBirth: customer.dateBirth ? customer.dateBirth.split('T')[0] : '',
        });
        setIsFormVisible(true);
    };

    // Handle form input change
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle submit form
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.email || !formData.phone) {
            setSuccessMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
            setMessageType('error');
            setShowSuccessMessage(true);
            return;
        }

        try {
            setIsSubmitting(true);
            const requestData = {
                accountId: formData.accountId,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                sex: formData.sex,
                address: formData.address,
                idCard: formData.idCard,
                dateBirth: formData.dateBirth,
            };

            const response = await axios.post(`${API_BASE}/Customer/updatecustomer`, requestData);

            if (response.data === true || response.data.success === true) {
                setSuccessMessage('Cập nhật khách hàng thành công!');
                setMessageType('success');
                setShowSuccessMessage(true);
                setIsFormVisible(false);
                fetchCustomers(pageIndex);
            } else {
                setSuccessMessage('Cập nhật khách hàng thất bại!');
                setMessageType('error');
                setShowSuccessMessage(true);
            }
        } catch (error) {
            console.error('Lỗi cập nhật khách hàng:', error);
            setSuccessMessage('Lỗi cập nhật khách hàng: ' + error.message);
            setMessageType('error');
            setShowSuccessMessage(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Select/Deselect checkbox
    const handleSelectCustomer = (customerId) => {
        const newSelected = new Set(selectedCustomers);
        if (newSelected.has(customerId)) {
            newSelected.delete(customerId);
        } else {
            newSelected.add(customerId);
        }
        setSelectedCustomers(newSelected);
    };

    // Select all checkbox
    const handleSelectAll = () => {
        if (selectedCustomers.size === customers.length) {
            setSelectedCustomers(new Set());
        } else {
            setSelectedCustomers(new Set(customers.map((c) => c.id)));
        }
    };

    // Delete customer
    const handleDeleteCustomer = async (customerId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post(`${API_BASE}/Customer/deletecustomer`, { id: customerId });
            if (response.data) {
                setSuccessMessage('Xóa khách hàng thành công!');
                setMessageType('success');
                setShowSuccessMessage(true);
                setSelectedCustomers(new Set());
                fetchCustomers(pageIndex);
            }
        } catch (error) {
            console.error('Lỗi xóa khách hàng:', error);
            setSuccessMessage('Lỗi xóa khách hàng');
            setMessageType('error');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete multiple customers
    const handleDeleteMultiple = async () => {
        if (selectedCustomers.size === 0) {
            setSuccessMessage('Vui lòng chọn ít nhất một khách hàng để xóa');
            setMessageType('error');
            setShowSuccessMessage(true);
            return;
        }

        if (selectedCustomers.size > 1) {
            setSuccessMessage('Chỉ có thể xóa 1 khách hàng tại một lần');
            setMessageType('error');
            setShowSuccessMessage(true);
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn xóa khách hàng đã chọn?')) {
            return;
        }

        try {
            setIsLoading(true);
            const deletePromises = Array.from(selectedCustomers).map((id) =>
                axios.post(`${API_BASE}/Customer/deletecustomer`, { id }),
            );
            await Promise.all(deletePromises);
            setSuccessMessage('Xóa khách hàng thành công!');
            setMessageType('success');
            setShowSuccessMessage(true);
            setSelectedCustomers(new Set());
            fetchCustomers(pageIndex);
        } catch (error) {
            console.error('Lỗi xóa khách hàng:', error);
            setSuccessMessage('Lỗi xóa khách hàng');
            setMessageType('error');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(totalRecordCount / pageSize);

    // Filter customers by search text
    const filteredCustomers = customers.filter(
        (customer) =>
            (customer.fullName && customer.fullName.toLowerCase().includes(searchText.toLowerCase())) ||
            (customer.email && customer.email.toLowerCase().includes(searchText.toLowerCase())) ||
            (customer.phone && customer.phone.toLowerCase().includes(searchText.toLowerCase())),
    );

    return (
        <div className={cx('wrapper')}>
            {showSuccessMessage && <SuccessMessage message={successMessage} type={messageType} />}

            {/* Header */}
            <div className={cx('header')}>
                <h1>Quản Lý Khách Hàng</h1>
                <div className={cx('header-actions')}>
                    {selectedCustomers.size === 1 && (
                        <button
                            className={cx('btn-delete-multiple')}
                            onClick={handleDeleteMultiple}
                            title="Xóa khách hàng được chọn"
                        >
                            <FontAwesomeIcon icon={faTrash} /> Xóa
                        </button>
                    )}
                    {selectedCustomers.size > 1 && (
                        <button
                            className={cx('btn-delete-multiple', 'disabled')}
                            disabled
                            title="Chỉ có thể xóa 1 khách hàng tại một lần"
                        >
                            <FontAwesomeIcon icon={faTrash} /> Xóa ({selectedCustomers.size})
                        </button>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className={cx('search-section')}>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                    value={searchText}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
            </div>

            {/* Customers Table */}
            <div className={cx('table-container')}>
                {isLoading ? (
                    <div className={cx('loading')}>Đang tải...</div>
                ) : filteredCustomers.length > 0 ? (
                    <table className={cx('customers-table')}>
                        <thead>
                            <tr>
                                <th className={cx('th-checkbox')}>
                                    <input
                                        type="checkbox"
                                        checked={selectedCustomers.size === customers.length && customers.length > 0}
                                        onChange={handleSelectAll}
                                        title="Chọn tất cả"
                                    />
                                </th>
                                <th>ID</th>
                                <th>Họ Tên</th>
                                <th>Email</th>
                                <th>SĐT</th>
                                <th>Giới Tính</th>
                                <th>Điểm Tích Lũy</th>
                                <th>Hạng Thành Viên</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id}>
                                    <td className={cx('td-checkbox')}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCustomers.has(customer.id)}
                                            onChange={() => handleSelectCustomer(customer.id)}
                                        />
                                    </td>
                                    <td>{customer.accountId}</td>
                                    <td>{customer.fullName}</td>
                                    <td>{customer.email || '—'}</td>
                                    <td>{customer.phone || '—'}</td>
                                    <td>{customer.sex || '—'}</td>
                                    <td>
                                        <span className={cx('points')}>{customer.accumulatedPoints || 0}</span>
                                    </td>
                                    <td>
                                        <span className={cx('rank', { [customer.rankMember?.toLowerCase()]: true })}>
                                            {customer.rankMember || '—'}
                                        </span>
                                    </td>
                                    <td className={cx('action-buttons')}>
                                        <button
                                            className={cx('btn-icon-edit')}
                                            onClick={() => handleEditCustomer(customer)}
                                            title="Chỉnh sửa"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={cx('empty-state')}>Không có khách hàng nào</div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button disabled={pageIndex === 1} onClick={() => fetchCustomers(pageIndex - 1)}>
                        Trang Trước
                    </button>
                    <span>
                        Trang {pageIndex} / {totalPages}
                    </span>
                    <button disabled={pageIndex === totalPages} onClick={() => fetchCustomers(pageIndex + 1)}>
                        Trang Sau
                    </button>
                </div>
            )}

            {/* Edit Form Modal */}
            {isFormVisible && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal-content')}>
                        <div className={cx('modal-header')}>
                            <h2>Chỉnh Sửa Khách Hàng</h2>
                            <button className={cx('btn-close')} onClick={() => setIsFormVisible(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form className={cx('form')} onSubmit={handleSubmitForm}>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Họ Tên *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleFormChange}
                                        placeholder="Nhập họ tên"
                                        required
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        placeholder="Nhập email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Số Điện Thoại *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleFormChange}
                                        placeholder="Nhập số điện thoại"
                                        required
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Giới Tính</label>
                                    <select name="sex" value={formData.sex} onChange={handleFormChange}>
                                        <option value="">-- Chọn --</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Ngày Sinh</label>
                                    <input
                                        type="date"
                                        name="dateBirth"
                                        value={formData.dateBirth}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>CCCD/CMND</label>
                                    <input
                                        type="text"
                                        name="idCard"
                                        value={formData.idCard}
                                        onChange={handleFormChange}
                                        placeholder="Nhập CCCD/CMND"
                                    />
                                </div>
                            </div>

                            <div className={cx('form-row', 'fullwidth')}>
                                <div className={cx('form-group', 'fullwidth')}>
                                    <label>Địa Chỉ</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleFormChange}
                                        placeholder="Nhập địa chỉ"
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
                                <button type="submit" className={cx('btn-submit')} disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang xử lý...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Customer;
