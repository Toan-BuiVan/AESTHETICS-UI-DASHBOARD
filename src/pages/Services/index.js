import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Services.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faSearch, faEdit, faTrash, faDownload, faImage } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Services() {
    // State quản lý danh sách dịch vụ
    const [services, setServices] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý form
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State quản lý dropdown
    const [serviceTypes, setServiceTypes] = useState([]);

    // State quản lý form input
    const [formData, setFormData] = useState({
        serviceTypeId: '',
        serviceName: '',
        description: '',
        price: '',
        duration: '',
        sessionInterval: '',
        isCourse: false,
        serviceImage: '',
    });

    // State quản lý hình ảnh upload
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // State tìm kiếm
    const [searchData, setSearchData] = useState({
        serviceName: '',
        serviceTypeId: '',
        isCourse: '',
    });

    // State quản lý checkbox selection
    const [selectedServices, setSelectedServices] = useState(new Set());

    // State quản lý Treatment Plan
    const [showTreatmentPlanForm, setShowTreatmentPlanForm] = useState(false);
    const [createdServiceId, setCreatedServiceId] = useState(null);
    const [createdServicePrice, setCreatedServicePrice] = useState(0);
    const [products, setProducts] = useState([]);
    const [treatmentPlanData, setTreatmentPlanData] = useState({
        planName: '',
        totalSessions: '',
    });
    const [sessionForms, setSessionForms] = useState([]);

    // Lấy danh sách loại dịch vụ
    const fetchServiceTypes = useCallback(async (serviceCategory = 0) => {
        try {
            const response = await axios.post(`${API_BASE}/ServiceType/getservicetypelist`, {
                serviceCategory,
            });
            if (response.data && response.data.baseDatas) {
                setServiceTypes(response.data.baseDatas);
            }
        } catch (error) {
            console.error('Lỗi lấy loại dịch vụ:', error);
        }
    }, []);

    // Lấy danh sách sản phẩm
    const fetchProducts = useCallback(async () => {
        try {
            const response = await axios.post(`${API_BASE}/Product/getproductlist`, {});
            if (response.data && response.data.baseDatas) {
                setProducts(response.data.baseDatas);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách sản phẩm:', error);
        }
    }, []);

    // Lấy danh sách dịch vụ
    const fetchServices = useCallback(
        async (page = 1, searchParams = {}) => {
            try {
                setIsLoading(true);
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                    serviceName: searchParams.serviceName || '',
                    serviceTypeId: searchParams.serviceTypeId ? parseInt(searchParams.serviceTypeId) : null,
                    isCourse:
                        searchParams.isCourse === ''
                            ? null
                            : searchParams.isCourse === 'true'
                              ? true
                              : searchParams.isCourse === 'false'
                                ? false
                                : null,
                };

                const response = await axios.post(`${API_BASE}/Service/getservicelist`, payload);
                if (response.data && response.data.baseDatas) {
                    setServices(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách dịch vụ:', error);
                setSuccessMessage('Lỗi lấy danh sách dịch vụ');
                setShowSuccessMessage(true);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize],
    );

    // Khởi tạo dữ liệu
    useEffect(() => {
        fetchServiceTypes();
        fetchServices(1);
    }, [fetchServiceTypes, fetchServices]);

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
        fetchServices(1, debouncedSearchData);
    }, [debouncedSearchData, fetchServices]);

    // Xử lý thay đổi input form
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Xử lý tải hình ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Tạo preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                // Lưu base64 vào formData (chỉ lấy phần base64, bỏ prefix)
                let base64String = reader.result;
                if (base64String.includes(',')) {
                    base64String = base64String.split(',')[1];
                }
                setFormData((prev) => ({
                    ...prev,
                    serviceImage: base64String || '',
                }));
            };
            reader.readAsDataURL(file);
        }
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
        fetchServices(1, searchData);
    };

    // Mở form thêm dịch vụ
    const handleAddService = () => {
        setIsEditMode(false);
        setEditingServiceId(null);
        setFormData({
            serviceTypeId: '',
            serviceName: '',
            description: '',
            price: '',
            duration: '',
            sessionInterval: '',
            isCourse: false,
            serviceImage: '',
        });
        setImageFile(null);
        setImagePreview('');
        setIsFormVisible(true);
    };

    // Mở form sửa dịch vụ
    const handleEditService = (service) => {
        setIsEditMode(true);
        setEditingServiceId(service.id);
        setFormData({
            serviceTypeId: service.serviceTypeId || '',
            serviceName: service.serviceName || '',
            description: service.description || '',
            price: service.price || '',
            duration: service.duration || '',
            sessionInterval: service.sessionInterval || '',
            isCourse: service.isCourse || false,
            serviceImage: service.serviceImage || '',
        });
        setImageFile(null);
        setImagePreview(service.serviceImage ? `${API_BASE.replace('/api', '')}/Images/${service.serviceImage}` : '');
        setIsFormVisible(true);
    };

    // Gửi form (Thêm hoặc Sửa)
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        if (!formData.serviceName || !formData.serviceTypeId || !formData.price) {
            setSuccessMessage('Vui lòng nhập đủ thông tin bắt buộc');
            setShowSuccessMessage(true);
            return;
        }

        try {
            setIsLoading(true);
            let payload = { ...formData };

            // Chuyển đổi kiểu dữ liệu
            payload.serviceTypeId = parseInt(payload.serviceTypeId) || 0;
            payload.price = parseFloat(payload.price) || 0;
            payload.duration = parseInt(payload.duration) || 0;
            payload.sessionInterval = parseInt(payload.sessionInterval) || 0;

            // Nếu không có image, gửi empty string thay vì undefined
            if (!payload.serviceImage) {
                payload.serviceImage = '';
            }

            let response;
            if (isEditMode) {
                payload.id = editingServiceId;
                response = await axios.post(`${API_BASE}/Service/updateservice`, payload);
            } else {
                response = await axios.post(`${API_BASE}/Service/createservice`, payload);
            }

            // Kiểm tra response structure
            const responseData = response.data?.success || response.data;

            // Kiểm tra xem service có được tạo thành công không
            if (!responseData?.success && !isEditMode) {
                setSuccessMessage(responseData?.message || 'Lỗi tạo dịch vụ');
                setShowSuccessMessage(true);
                return;
            }

            // Nếu là liệu trình và mode thêm mới, chuyển sang form tạo treatment plan
            if (formData.isCourse && !isEditMode) {
                const serviceId = responseData?.serviceId || response.data?.id || response.data?.data?.id;
                if (!serviceId) {
                    setSuccessMessage('Không lấy được ID dịch vụ, vui lòng thử lại');
                    setShowSuccessMessage(true);
                    return;
                }
                setCreatedServiceId(serviceId);
                setCreatedServicePrice(payload.price);
                setShowTreatmentPlanForm(true);
                setTreatmentPlanData({ planName: '', totalSessions: '' });
                setSessionForms([]);
                await fetchProducts();
            } else {
                setSuccessMessage(isEditMode ? 'Cập nhật dịch vụ thành công!' : 'Thêm dịch vụ thành công!');
                setShowSuccessMessage(true);
                setIsFormVisible(false);
                fetchServices(pageIndex, searchData);
            }
        } catch (error) {
            console.error('Lỗi:', error);
            const errorMessage =
                error.response?.data?.success?.message || error.response?.data?.message || 'Có lỗi xảy ra';
            setSuccessMessage(errorMessage);
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý thay đổi treatment plan data
    const handleTreatmentPlanChange = (e) => {
        const { name, value } = e.target;
        setTreatmentPlanData((prev) => ({
            ...prev,
            [name]: name === 'totalSessions' ? parseInt(value) || 0 : value,
        }));

        // Tạo session forms khi totalSessions thay đổi
        if (name === 'totalSessions') {
            const sessions = parseInt(value) || 0;
            const newSessionForms = Array.from({ length: sessions }).map((_, index) => ({
                sessionNumber: index + 1,
                products: [],
            }));
            setSessionForms(newSessionForms);
        }
    };

    // Xử lý thêm sản phẩm vào session
    const handleAddProductToSession = (sessionIndex) => {
        const newSessionForms = [...sessionForms];
        newSessionForms[sessionIndex].products.push({
            productId: '',
            quantityUsed: '',
        });
        setSessionForms(newSessionForms);
    };

    // Xử lý xóa sản phẩm khỏi session
    const handleRemoveProductFromSession = (sessionIndex, productIndex) => {
        const newSessionForms = [...sessionForms];
        newSessionForms[sessionIndex].products.splice(productIndex, 1);
        setSessionForms(newSessionForms);
    };

    // Xử lý thay đổi dữ liệu sản phẩm trong session
    const handleSessionProductChange = (sessionIndex, productIndex, field, value) => {
        const newSessionForms = [...sessionForms];
        newSessionForms[sessionIndex].products[productIndex][field] =
            field === 'productId' ? parseInt(value) || 0 : parseInt(value) || 0;
        setSessionForms(newSessionForms);
    };

    // Gửi treatment plan
    const handleSubmitTreatmentPlan = async (e) => {
        e.preventDefault();

        if (!treatmentPlanData.planName || !treatmentPlanData.totalSessions) {
            setSuccessMessage('Vui lòng nhập đủ thông tin treatment plan');
            setShowSuccessMessage(true);
            return;
        }

        try {
            setIsLoading(true);

            const payload = {
                serviceId: createdServiceId,
                planName: treatmentPlanData.planName,
                totalSessions: treatmentPlanData.totalSessions,
                sessionInterval: formData.sessionInterval ? parseInt(formData.sessionInterval) : 0,
                description: formData.description || '',
                sessionProducts: sessionForms,
            };

            await axios.post(`${API_BASE}/TreatmentPlan/createtreatmentplan`, payload);

            setSuccessMessage('Thêm liệu trình thành công!');
            setShowSuccessMessage(true);
            setShowTreatmentPlanForm(false);
            setIsFormVisible(false);
            fetchServices(pageIndex, searchData);
        } catch (error) {
            console.error('Lỗi tạo treatment plan:', error);
            setSuccessMessage(error.response?.data?.message || 'Có lỗi xảy ra');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSelectService = (serviceId) => {
        const newSelected = new Set(selectedServices);
        if (newSelected.has(serviceId)) {
            newSelected.delete(serviceId);
        } else {
            newSelected.add(serviceId);
        }
        setSelectedServices(newSelected);
    };

    // Select all checkbox
    const handleSelectAll = () => {
        if (selectedServices.size === services.length) {
            setSelectedServices(new Set());
        } else {
            setSelectedServices(new Set(services.map((s) => s.id)));
        }
    };

    // Xóa dịch vụ (single hoặc multiple)
    const handleDeleteService = async (serviceIds = null) => {
        const idsToDelete = serviceIds || Array.from(selectedServices);

        if (idsToDelete.length === 0) {
            setSuccessMessage('Vui lòng chọn dịch vụ để xóa');
            setShowSuccessMessage(true);
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${idsToDelete.length} dịch vụ?`)) {
            return;
        }

        try {
            setIsLoading(true);

            // Xóa từng dịch vụ
            for (const id of idsToDelete) {
                await axios.post(`${API_BASE}/Service/deleteservice`, { id });
            }

            setSuccessMessage(`Đã xóa ${idsToDelete.length} dịch vụ thành công!`);
            setShowSuccessMessage(true);
            setSelectedServices(new Set());
            fetchServices(pageIndex, searchData);
        } catch (error) {
            console.error('Lỗi xóa dịch vụ:', error);
            setSuccessMessage('Lỗi xóa dịch vụ');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Xuất Excel
    const handleExportExcel = async () => {
        if (selectedServices.size === 0) {
            setSuccessMessage('Vui lòng chọn ít nhất một dịch vụ để xuất');
            setShowSuccessMessage(true);
            return;
        }

        try {
            setIsLoading(true);
            // Chỉ xuất những dịch vụ được chọn
            const serviceIds = Array.from(selectedServices);
            const response = await axios.post(
                `${API_BASE}/Service/exportservicetoexcel`,
                { serviceIds },
                { responseType: 'blob' },
            );

            // Download file từ response
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'services.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentElement.removeChild(link);

            setSuccessMessage('Xuất Excel thành công!');
            setShowSuccessMessage(true);
        } catch (error) {
            console.error('Lỗi xuất Excel:', error);
            setSuccessMessage('Lỗi xuất Excel');
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
                <h1>Quản Lý Dịch Vụ</h1>
                <div className={cx('header-actions')}>
                    <button className={cx('btn-primary')} onClick={handleAddService}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm Dịch Vụ
                    </button>
                    {selectedServices.size > 0 && (
                        <button
                            className={cx('btn-delete-multiple', {
                                disabled: selectedServices.size > 1,
                            })}
                            onClick={() => handleDeleteService()}
                            disabled={selectedServices.size > 1}
                            title={
                                selectedServices.size > 1
                                    ? 'Chỉ có thể xóa 1 dịch vụ tại một lần'
                                    : 'Xóa dịch vụ được chọn'
                            }
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            Xóa ({selectedServices.size})
                        </button>
                    )}
                    <button 
                        className={cx('btn-export')} 
                        onClick={handleExportExcel}
                        disabled={selectedServices.size === 0}
                        title={selectedServices.size === 0 ? 'Vui lòng chọn dịch vụ trước' : 'Xuất các dịch vụ được chọn'}
                    >
                        <FontAwesomeIcon icon={faDownload} />
                        Xuất Excel ({selectedServices.size})
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className={cx('search-section')}>
                <input
                    type="text"
                    name="serviceName"
                    placeholder="Tìm kiếm tên dịch vụ..."
                    value={searchData.serviceName}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
                <select
                    name="serviceTypeId"
                    value={searchData.serviceTypeId}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                >
                    <option value="">-- Tất cả loại dịch vụ --</option>
                    {serviceTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.serviceTypeName}
                        </option>
                    ))}
                </select>
                <select
                    name="isCourse"
                    value={searchData.isCourse}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                >
                    <option value="">-- Tất cả --</option>
                    <option value="true">Là Liệu trình</option>
                    <option value="false">Dịch vụ lẻ</option>
                </select>
                <button className={cx('btn-search')} onClick={handleSearch}>
                    <FontAwesomeIcon icon={faSearch} />
                    Tìm Kiếm
                </button>
            </div>

            {/* Services Table */}
            <div className={cx('table-container')}>
                {isLoading ? (
                    <div className={cx('loading')}>Đang tải...</div>
                ) : services.length > 0 ? (
                    <table className={cx('services-table')}>
                        <thead>
                            <tr>
                                <th className={cx('checkbox-cell')}>
                                    <input
                                        type="checkbox"
                                        checked={selectedServices.size === services.length && services.length > 0}
                                        onChange={handleSelectAll}
                                        title="Chọn tất cả"
                                    />
                                </th>
                                <th>ID</th>
                                <th>Hình Ảnh</th>
                                <th>Tên Dịch Vụ</th>
                                <th>Loại Dịch Vụ</th>
                                <th>Giá</th>
                                <th>Thời Lượng (phút)</th>
                                <th>Loại</th>
                                <th>Sửa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.id} className={cx({ selected: selectedServices.has(service.id) })}>
                                    <td className={cx('checkbox-cell')}>
                                        <input
                                            type="checkbox"
                                            checked={selectedServices.has(service.id)}
                                            onChange={() => handleSelectService(service.id)}
                                        />
                                    </td>
                                    <td>{service.id}</td>
                                    <td className={cx('image-cell')}>
                                        {service.serviceImage ? (
                                            <img
                                                src={`http://localhost:5122/Images/${service.serviceImage}`}
                                                alt={service.serviceName}
                                                className={cx('service-image')}
                                            />
                                        ) : (
                                            <span className={cx('no-image')}>
                                                <FontAwesomeIcon icon={faImage} />
                                            </span>
                                        )}
                                    </td>
                                    <td>{service.serviceName}</td>
                                    <td>{service.serviceTypeName}</td>
                                    <td>{Number(service.price).toLocaleString('vi-VN')} ₫</td>
                                    <td>{service.duration}</td>
                                    <td>
                                        <span className={cx('badge', service.isCourse ? 'course' : 'single')}>
                                            {service.isCourse ? 'Liệu trình' : 'Dịch vụ lẻ'}
                                        </span>
                                    </td>
                                    <td className={cx('action-buttons')}>
                                        <button
                                            className={cx('btn-icon-edit')}
                                            onClick={() => handleEditService(service)}
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
                    <div className={cx('empty-state')}>Không có dịch vụ nào</div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button disabled={pageIndex === 1} onClick={() => fetchServices(pageIndex - 1, searchData)}>
                        Trang Trước
                    </button>
                    <span>
                        Trang {pageIndex} / {totalPages}
                    </span>
                    <button
                        disabled={pageIndex === totalPages}
                        onClick={() => fetchServices(pageIndex + 1, searchData)}
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
                            <h2>{isEditMode ? 'Cập Nhật Dịch Vụ' : 'Thêm Dịch Vụ'}</h2>
                            <button className={cx('btn-close')} onClick={() => setIsFormVisible(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form className={cx('form')} onSubmit={handleSubmitForm}>
                            <div className={cx('form-group')}>
                                <label>Tên Dịch Vụ *</label>
                                <input
                                    type="text"
                                    name="serviceName"
                                    value={formData.serviceName}
                                    onChange={handleFormChange}
                                    placeholder="Nhập tên dịch vụ"
                                    required
                                />
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Loại Dịch Vụ *</label>
                                    <select
                                        name="serviceTypeId"
                                        value={formData.serviceTypeId}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">-- Chọn Loại Dịch Vụ --</option>
                                        {serviceTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.serviceTypeName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Giá (₫) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={cx('form-group')}>
                                <label>Mô Tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Nhập mô tả dịch vụ"
                                    rows="3"
                                />
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Thời Lượng (phút)</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Khoảng Giữa Buổi (ngày)</label>
                                    <input
                                        type="number"
                                        name="sessionInterval"
                                        value={formData.sessionInterval}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className={cx('form-group-checkbox')}>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isCourse"
                                        checked={formData.isCourse}
                                        onChange={handleFormChange}
                                    />
                                    Đây là Liệu trình
                                </label>
                            </div>

                            {/* Hiển thị thông tin Treatment Plan khi chỉnh sửa */}
                            <div className={cx('form-group')}>
                                <label>Hình Ảnh Dịch Vụ</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className={cx('file-input')}
                                />
                                {imagePreview && (
                                    <div className={cx('image-preview')}>
                                        <img src={imagePreview} alt="Xem trước hình ảnh" />
                                    </div>
                                )}
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

            {/* Modal Treatment Plan Form */}
            {showTreatmentPlanForm && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal-content', 'treatment-plan-modal')}>
                        <div className={cx('modal-header')}>
                            <h2>Tạo Liệu Trình</h2>
                            <button
                                className={cx('btn-close')}
                                onClick={() => {
                                    setShowTreatmentPlanForm(false);
                                    setIsFormVisible(false);
                                }}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form className={cx('form')} onSubmit={handleSubmitTreatmentPlan}>
                            <div className={cx('form-group')}>
                                <label>Tên Liệu Trình *</label>
                                <input
                                    type="text"
                                    name="planName"
                                    value={treatmentPlanData.planName}
                                    onChange={handleTreatmentPlanChange}
                                    placeholder="Ví dụ: Liệu trình làm sáng da 3 buổi"
                                    required
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label>Số Buổi *</label>
                                <input
                                    type="number"
                                    name="totalSessions"
                                    value={treatmentPlanData.totalSessions}
                                    onChange={handleTreatmentPlanChange}
                                    placeholder="3"
                                    min="1"
                                    required
                                />
                            </div>

                            {/* Session Forms */}
                            {treatmentPlanData.totalSessions > 0 ? (
                                <div className={cx('sessions-container')}>
                                    <h3>📋 Cấu Hình {treatmentPlanData.totalSessions} Buổi Liệu Trình</h3>
                                    <p className={cx('sessions-hint')}>
                                        Chọn sản phẩm sử dụng cho mỗi buổi. Có thể sử dụng cùng sản phẩm cho nhiều buổi.
                                    </p>
                                    {sessionForms.map((session, sessionIndex) => (
                                        <div key={sessionIndex} className={cx('session-form')}>
                                            <div className={cx('session-header')}>
                                                <h4>Buổi {session.sessionNumber}</h4>
                                                <span className={cx('session-badge')}>
                                                    {session.products.length} sản phẩm
                                                </span>
                                            </div>

                                            <div className={cx('products-list')}>
                                                {session.products.length === 0 ? (
                                                    <p className={cx('no-products')}>
                                                        Chưa có sản phẩm nào. Hãy bấm "Thêm Sản Phẩm" để thêm.
                                                    </p>
                                                ) : (
                                                    session.products.map((product, productIndex) => (
                                                        <div key={productIndex} className={cx('product-item')}>
                                                            <div className={cx('form-row')}>
                                                                <div className={cx('form-group', 'flex-1')}>
                                                                    <label>Sản Phẩm</label>
                                                                    <select
                                                                        value={product.productId}
                                                                        onChange={(e) =>
                                                                            handleSessionProductChange(
                                                                                sessionIndex,
                                                                                productIndex,
                                                                                'productId',
                                                                                e.target.value,
                                                                            )
                                                                        }
                                                                        required
                                                                    >
                                                                        <option value="">-- Chọn Sản Phẩm --</option>
                                                                        {products.map((prod) => (
                                                                            <option key={prod.id} value={prod.id}>
                                                                                {prod.productName}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <div className={cx('form-group', 'flex-1')}>
                                                                    <label>Số Lượng</label>
                                                                    <input
                                                                        type="number"
                                                                        value={product.quantityUsed}
                                                                        onChange={(e) =>
                                                                            handleSessionProductChange(
                                                                                sessionIndex,
                                                                                productIndex,
                                                                                'quantityUsed',
                                                                                e.target.value,
                                                                            )
                                                                        }
                                                                        placeholder="0"
                                                                        min="1"
                                                                        required
                                                                    />
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    className={cx('btn-remove-product')}
                                                                    onClick={() =>
                                                                        handleRemoveProductFromSession(
                                                                            sessionIndex,
                                                                            productIndex,
                                                                        )
                                                                    }
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                className={cx('btn-add-product')}
                                                onClick={() => handleAddProductToSession(sessionIndex)}
                                            >
                                                + Thêm Sản Phẩm
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={cx('no-sessions-hint')}>
                                    <p>👆 Vui lòng nhập "Số Buổi" ở trên để bắt đầu cấu hình</p>
                                </div>
                            )}

                            <div className={cx('form-actions')}>
                                <button
                                    type="button"
                                    className={cx('btn-cancel')}
                                    onClick={() => {
                                        setShowTreatmentPlanForm(false);
                                        setIsFormVisible(false);
                                    }}
                                >
                                    Hủy
                                </button>
                                <button type="submit" className={cx('btn-submit')} disabled={isLoading}>
                                    {isLoading ? 'Đang xử lý...' : 'Tạo Liệu Trình'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Services;
