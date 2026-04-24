import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Supplier.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Supplier() {
    // State quản lý danh sách nhà cung cấp
    const [suppliers, setSuppliers] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý form
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSupplierId, setEditingSupplierId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State quản lý form input
    const [formData, setFormData] = useState({
        supplierName: '',
        address: '',
        phone: '',
    });

    // State tìm kiếm
    const [searchData, setSearchData] = useState({
        id: '',
        supplierName: '',
    });

    // State quản lý checkbox selection
    const [selectedSuppliers, setSelectedSuppliers] = useState(new Set());

    // Lấy danh sách nhà cung cấp
    const fetchSuppliers = useCallback(
        async (page = 1, searchParams = {}) => {
            try {
                setIsLoading(true);
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                    id: searchParams.id ? parseInt(searchParams.id) : null,
                    supplierName: searchParams.supplierName || null,
                };

                const response = await axios.post(`${API_BASE}/Supplier/paging`, payload);
                if (response.data && response.data.baseDatas) {
                    setSuppliers(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách nhà cung cấp:', error);
                setSuccessMessage('Lỗi lấy danh sách nhà cung cấp');
                setShowSuccessMessage(true);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize],
    );

    // Khởi tạo dữ liệu
    useEffect(() => {
        fetchSuppliers(1);
    }, [fetchSuppliers]);

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
        fetchSuppliers(1, debouncedSearchData);
    }, [debouncedSearchData, fetchSuppliers]);

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

    // Mở form thêm nhà cung cấp
    const handleAddSupplier = () => {
        setIsEditMode(false);
        setEditingSupplierId(null);
        setFormData({
            supplierName: '',
            address: '',
            phone: '',
        });
        setIsFormVisible(true);
    };

    // Mở form sửa nhà cung cấp
    const handleEditSupplier = (supplier) => {
        setIsEditMode(true);
        setEditingSupplierId(supplier.id);
        setFormData({
            supplierName: supplier.supplierName,
            address: supplier.address || '',
            phone: supplier.phone || '',
        });
        setIsFormVisible(true);
    };

    // Gửi form (Thêm hoặc Sửa)
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            if (!formData.supplierName) {
                setSuccessMessage('Vui lòng nhập tên nhà cung cấp');
                setShowSuccessMessage(true);
                return;
            }

            if (!formData.address) {
                setSuccessMessage('Vui lòng nhập địa chỉ');
                setShowSuccessMessage(true);
                return;
            }

            if (!formData.phone) {
                setSuccessMessage('Vui lòng nhập số điện thoại');
                setShowSuccessMessage(true);
                return;
            }

            if (isEditMode) {
                // Update supplier
                const payload = {
                    id: editingSupplierId,
                    supplierName: formData.supplierName,
                    address: formData.address,
                    phone: formData.phone,
                };

                const response = await axios.post(`${API_BASE}/Supplier/update`, payload);
                if (response.data === true) {
                    setSuccessMessage('Cập nhật nhà cung cấp thành công!');
                    setShowSuccessMessage(true);
                    setIsFormVisible(false);
                    fetchSuppliers(pageIndex, searchData);
                } else {
                    setSuccessMessage('Cập nhật nhà cung cấp thất bại');
                    setShowSuccessMessage(true);
                }
            } else {
                // Create supplier
                const payload = {
                    supplierName: formData.supplierName,
                    address: formData.address,
                    phone: formData.phone,
                };

                const response = await axios.post(`${API_BASE}/Supplier/create`, payload);
                if (response.data === true) {
                    setSuccessMessage('Thêm nhà cung cấp thành công!');
                    setShowSuccessMessage(true);
                    setIsFormVisible(false);
                    fetchSuppliers(1);
                } else {
                    setSuccessMessage('Thêm nhà cung cấp thất bại');
                    setShowSuccessMessage(true);
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
    const handleSelectSupplier = (supplierId) => {
        const newSelected = new Set(selectedSuppliers);
        if (newSelected.has(supplierId)) {
            newSelected.delete(supplierId);
        } else {
            newSelected.add(supplierId);
        }
        setSelectedSuppliers(newSelected);
    };

    // Select all checkbox
    const handleSelectAll = () => {
        if (selectedSuppliers.size === suppliers.length) {
            setSelectedSuppliers(new Set());
        } else {
            setSelectedSuppliers(new Set(suppliers.map((s) => s.id)));
        }
    };

    // Delete multiple suppliers
    const handleDeleteMultiple = async () => {
        if (selectedSuppliers.size === 0) {
            setSuccessMessage('Vui lòng chọn ít nhất một nhà cung cấp để xóa');
            setShowSuccessMessage(true);
            return;
        }

        if (selectedSuppliers.size > 1) {
            setSuccessMessage('Chỉ có thể xóa 1 nhà cung cấp tại một lần');
            setShowSuccessMessage(true);
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp đã chọn?')) {
            return;
        }

        try {
            setIsLoading(true);
            const deletePromises = Array.from(selectedSuppliers).map((id) =>
                axios.post(`${API_BASE}/Supplier/delete`, { id }),
            );
            const results = await Promise.all(deletePromises);

            if (results.some((r) => r.data === true)) {
                setSuccessMessage('Xóa nhà cung cấp thành công!');
                setShowSuccessMessage(true);
                setSelectedSuppliers(new Set());
                fetchSuppliers(1);
            } else {
                setSuccessMessage('Xóa nhà cung cấp thất bại');
                setShowSuccessMessage(true);
            }
        } catch (error) {
            console.error('Lỗi xóa nhà cung cấp:', error);
            setSuccessMessage('Lỗi xóa nhà cung cấp');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(totalRecordCount / pageSize);

    if (!isLoading && suppliers.length === 0 && totalRecordCount === 0) {
        return (
            <div className={cx('wrapper')}>
                <SuccessMessage message={successMessage} isVisible={showSuccessMessage} />
                <div className={cx('header')}>
                    <h1>Quản Lý Nhà Cung Cấp</h1>
                    <div className={cx('header-actions')}>
                        <button className={cx('btn-primary')} onClick={handleAddSupplier}>
                            <FontAwesomeIcon icon={faPlus} />
                            Thêm Nhà Cung Cấp
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
                <h1>Quản Lý Nhà Cung Cấp</h1>
                <div className={cx('header-actions')}>
                    {selectedSuppliers.size === 1 && (
                        <>
                            <button
                                className={cx('btn-edit')}
                                onClick={() => {
                                    const selectedId = Array.from(selectedSuppliers)[0];
                                    const supplier = suppliers.find((s) => s.id === selectedId);
                                    if (supplier) handleEditSupplier(supplier);
                                }}
                                title="Sửa nhà cung cấp được chọn"
                            >
                                <FontAwesomeIcon icon={faEdit} />
                                Sửa
                            </button>
                            <button
                                className={cx('btn-delete-multiple')}
                                onClick={handleDeleteMultiple}
                                title="Xóa nhà cung cấp được chọn"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                Xóa
                            </button>
                        </>
                    )}
                    <button className={cx('btn-primary')} onClick={handleAddSupplier}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm Nhà Cung Cấp
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
                    name="supplierName"
                    placeholder="Tìm kiếm theo tên nhà cung cấp..."
                    value={searchData.supplierName}
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
                    <table className={cx('suppliers-table')}>
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={selectedSuppliers.size === suppliers.length && suppliers.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>ID</th>
                                <th>Tên Nhà Cung Cấp</th>
                                <th>Địa Chỉ</th>
                                <th>Điện Thoại</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((supplier) => (
                                <tr
                                    key={supplier.id}
                                    className={selectedSuppliers.has(supplier.id) ? cx('selected') : ''}
                                >
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedSuppliers.has(supplier.id)}
                                            onChange={() => handleSelectSupplier(supplier.id)}
                                        />
                                    </td>
                                    <td>{supplier.id}</td>
                                    <td>{supplier.supplierName}</td>
                                    <td>{supplier.address || '-'}</td>
                                    <td>{supplier.phone || '-'}</td>
                                    <td>{supplier.email || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button disabled={pageIndex === 1} onClick={() => fetchSuppliers(pageIndex - 1, searchData)}>
                        Trang Trước
                    </button>
                    <span>
                        Trang {pageIndex} / {totalPages}
                    </span>
                    <button
                        disabled={pageIndex === totalPages}
                        onClick={() => fetchSuppliers(pageIndex + 1, searchData)}
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
                            <h2>{isEditMode ? 'Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp'}</h2>
                            <button className={cx('btn-close')} onClick={() => setIsFormVisible(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form className={cx('form')} onSubmit={handleSubmitForm}>
                            <div className={cx('form-group')}>
                                <label>Tên Nhà Cung Cấp *</label>
                                <input
                                    type="text"
                                    name="supplierName"
                                    value={formData.supplierName}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label>Địa Chỉ *</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label>Điện Thoại *</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
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

export default Supplier;
