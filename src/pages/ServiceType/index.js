import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './ServiceType.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function ServiceType() {
    // State quản lý danh sách loại dịch vụ
    const [serviceTypes, setServiceTypes] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý form
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingServiceTypeId, setEditingServiceTypeId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State quản lý form input
    const [formData, setFormData] = useState({
        serviceTypeName: '',
        serviceCategory: '0',
        description: '',
    });

    // State tìm kiếm
    const [searchData, setSearchData] = useState({
        serviceTypeName: '',
        serviceCategory: '',
    });

    // State quản lý checkbox selection
    const [selectedServiceTypes, setSelectedServiceTypes] = useState(new Set());

    // Lấy danh sách loại dịch vụ
    const fetchServiceTypes = useCallback(
        async (page = 1, searchParams = {}) => {
            try {
                setIsLoading(true);
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                    serviceTypeName: searchParams.serviceTypeName || null,
                    serviceCategory:
                        searchParams.serviceCategory !== '' ? parseInt(searchParams.serviceCategory) : null,
                };

                const response = await axios.post(`${API_BASE}/ServiceType/getservicetypelist`, payload);
                if (response.data && response.data.baseDatas) {
                    setServiceTypes(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách loại dịch vụ:', error);
                setSuccessMessage('Lỗi lấy danh sách loại dịch vụ');
                setShowSuccessMessage(true);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize],
    );

    // Khởi tạo dữ liệu
    useEffect(() => {
        fetchServiceTypes(1);
    }, [fetchServiceTypes]);

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
        fetchServiceTypes(1, debouncedSearchData);
    }, [debouncedSearchData, fetchServiceTypes]);

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

    // Mở form thêm loại dịch vụ
    const handleAddServiceType = () => {
        setIsEditMode(false);
        setEditingServiceTypeId(null);
        setFormData({
            serviceTypeName: '',
            serviceCategory: '0',
            description: '',
        });
        setIsFormVisible(true);
    };

    // Mở form sửa loại dịch vụ
    const handleEditServiceType = (serviceType) => {
        setIsEditMode(true);
        setEditingServiceTypeId(serviceType.id);
        setFormData({
            serviceTypeName: serviceType.serviceTypeName,
            serviceCategory: serviceType.serviceCategory.toString(),
            description: serviceType.description || '',
        });
        setIsFormVisible(true);
    };

    // Gửi form (Thêm hoặc Sửa)
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            if (!formData.serviceTypeName) {
                setSuccessMessage('Vui lòng nhập tên loại dịch vụ');
                setShowSuccessMessage(true);
                return;
            }

            if (isEditMode) {
                // Update service type
                const payload = {
                    id: editingServiceTypeId,
                    serviceTypeName: formData.serviceTypeName,
                    serviceCategory: parseInt(formData.serviceCategory),
                    description: formData.description,
                };

                const response = await axios.post(`${API_BASE}/ServiceType/updateservicetype`, payload);
                if (response.data) {
                    setSuccessMessage('Cập nhật loại dịch vụ thành công!');
                    setShowSuccessMessage(true);
                    setIsFormVisible(false);
                    fetchServiceTypes(pageIndex, searchData);
                }
            } else {
                // Create service type
                const payload = {
                    serviceTypeName: formData.serviceTypeName,
                    serviceCategory: parseInt(formData.serviceCategory),
                    description: formData.description,
                };

                const response = await axios.post(`${API_BASE}/ServiceType/createservicetype`, payload);
                if (response.data) {
                    setSuccessMessage('Thêm loại dịch vụ thành công!');
                    setShowSuccessMessage(true);
                    setIsFormVisible(false);
                    fetchServiceTypes(1);
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
    const handleSelectServiceType = (serviceTypeId) => {
        const newSelected = new Set(selectedServiceTypes);
        if (newSelected.has(serviceTypeId)) {
            newSelected.delete(serviceTypeId);
        } else {
            newSelected.add(serviceTypeId);
        }
        setSelectedServiceTypes(newSelected);
    };

    // Select all checkbox
    const handleSelectAll = () => {
        if (selectedServiceTypes.size === serviceTypes.length) {
            setSelectedServiceTypes(new Set());
        } else {
            setSelectedServiceTypes(new Set(serviceTypes.map((st) => st.id)));
        }
    };

    // Delete multiple service types
    const handleDeleteMultiple = async () => {
        if (selectedServiceTypes.size === 0) {
            setSuccessMessage('Vui lòng chọn ít nhất một loại dịch vụ để xóa');
            setShowSuccessMessage(true);
            return;
        }

        if (selectedServiceTypes.size > 1) {
            setSuccessMessage('Chỉ có thể xóa 1 loại dịch vụ tại một lần');
            setShowSuccessMessage(true);
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn xóa loại dịch vụ đã chọn?')) {
            return;
        }

        try {
            setIsLoading(true);
            const deletePromises = Array.from(selectedServiceTypes).map((id) =>
                axios.post(`${API_BASE}/ServiceType/deleteservicetype`, { id }),
            );
            await Promise.all(deletePromises);
            setSuccessMessage('Xóa loại dịch vụ thành công!');
            setShowSuccessMessage(true);
            setSelectedServiceTypes(new Set());
            fetchServiceTypes(1);
        } catch (error) {
            console.error('Lỗi xóa loại dịch vụ:', error);
            setSuccessMessage('Lỗi xóa loại dịch vụ');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryName = (category) => {
        return category === 0 ? 'Liệu trình' : 'Đơn lẻ';
    };

    const totalPages = Math.ceil(totalRecordCount / pageSize);

    if (!isLoading && serviceTypes.length === 0 && totalRecordCount === 0) {
        return (
            <div className={cx('wrapper')}>
                <SuccessMessage message={successMessage} isVisible={showSuccessMessage} />
                <div className={cx('header')}>
                    <h1>Quản Lý Loại Dịch Vụ</h1>
                    <div className={cx('header-actions')}>
                        <button className={cx('btn-primary')} onClick={handleAddServiceType}>
                            <FontAwesomeIcon icon={faPlus} />
                            Thêm Loại Dịch Vụ
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
                <h1>Quản Lý Loại Dịch Vụ</h1>
                <div className={cx('header-actions')}>
                    {selectedServiceTypes.size === 1 && (
                        <>
                            <button
                                className={cx('btn-edit')}
                                onClick={() => {
                                    const selectedId = Array.from(selectedServiceTypes)[0];
                                    const serviceType = serviceTypes.find((st) => st.id === selectedId);
                                    if (serviceType) handleEditServiceType(serviceType);
                                }}
                                title="Sửa loại dịch vụ được chọn"
                            >
                                <FontAwesomeIcon icon={faEdit} />
                                Sửa
                            </button>
                            <button
                                className={cx('btn-delete-multiple')}
                                onClick={handleDeleteMultiple}
                                title="Xóa loại dịch vụ được chọn"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                Xóa
                            </button>
                        </>
                    )}
                    <button className={cx('btn-primary')} onClick={handleAddServiceType}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm Loại Dịch Vụ
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className={cx('search-section')}>
                <input
                    type="text"
                    name="serviceTypeName"
                    placeholder="Tìm kiếm theo tên..."
                    value={searchData.serviceTypeName}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
                <select
                    name="serviceCategory"
                    value={searchData.serviceCategory}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                >
                    <option value="">-- Tất cả danh mục --</option>
                    <option value="0">Liệu trình</option>
                    <option value="1">Đơn lẻ</option>
                </select>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className={cx('table-container')}>
                    <div className={cx('loading')}>Đang tải...</div>
                </div>
            ) : (
                <div className={cx('table-container')}>
                    <table className={cx('service-types-table')}>
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedServiceTypes.size === serviceTypes.length && serviceTypes.length > 0
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>ID</th>
                                <th>Tên Loại Dịch Vụ</th>
                                <th>Danh Mục</th>
                                <th>Mô Tả</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {serviceTypes.map((serviceType) => (
                                <tr
                                    key={serviceType.id}
                                    className={selectedServiceTypes.has(serviceType.id) ? cx('selected') : ''}
                                >
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedServiceTypes.has(serviceType.id)}
                                            onChange={() => handleSelectServiceType(serviceType.id)}
                                        />
                                    </td>
                                    <td>{serviceType.id}</td>
                                    <td>{serviceType.serviceTypeName}</td>
                                    <td>{getCategoryName(serviceType.serviceCategory)}</td>
                                    <td>{serviceType.description || '-'}</td>
                                    <td className={cx('action-buttons')}>
                                        <button onClick={() => handleEditServiceType(serviceType)} title="Sửa">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedServiceTypes(new Set([serviceType.id]));
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
                    <button disabled={pageIndex === 1} onClick={() => fetchServiceTypes(pageIndex - 1, searchData)}>
                        Trang Trước
                    </button>
                    <span>
                        Trang {pageIndex} / {totalPages}
                    </span>
                    <button
                        disabled={pageIndex === totalPages}
                        onClick={() => fetchServiceTypes(pageIndex + 1, searchData)}
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
                            <h2>{isEditMode ? 'Sửa Loại Dịch Vụ' : 'Thêm Loại Dịch Vụ'}</h2>
                            <button className={cx('btn-close')} onClick={() => setIsFormVisible(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form className={cx('form')} onSubmit={handleSubmitForm}>
                            <div className={cx('form-group')}>
                                <label>Tên Loại Dịch Vụ *</label>
                                <input
                                    type="text"
                                    name="serviceTypeName"
                                    value={formData.serviceTypeName}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label>Danh Mục *</label>
                                <select
                                    name="serviceCategory"
                                    value={formData.serviceCategory}
                                    onChange={handleFormChange}
                                    required
                                >
                                    <option value="0">Liệu trình</option>
                                    <option value="1">Đơn lẻ</option>
                                </select>
                            </div>

                            <div className={cx('form-group')}>
                                <label>Mô Tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    rows="4"
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

export default ServiceType;
