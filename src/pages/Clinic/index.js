import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Clinic.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Clinic() {
    // State quản lý danh sách phòng khám
    const [clinics, setClinics] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý ServiceType dropdown
    const [serviceTypes, setServiceTypes] = useState([]);

    // State quản lý form
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingClinicId, setEditingClinicId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State quản lý form input
    const [formData, setFormData] = useState({
        clinicName: '',
        serviceTypeId: '',
        clinicStatus: true,
    });

    // State tìm kiếm
    const [searchData, setSearchData] = useState({
        id: '',
        clinicName: '',
    });

    // State quản lý checkbox selection
    const [selectedClinics, setSelectedClinics] = useState(new Set());

    // Lấy danh sách ServiceType
    const fetchServiceTypes = useCallback(async () => {
        try {
            const response = await axios.post(`${API_BASE}/ServiceType/getservicetypelist`, {});
            if (response.data && response.data.baseDatas) {
                setServiceTypes(response.data.baseDatas);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách ServiceType:', error);
        }
    }, []);

    // Lấy danh sách phòng khám
    const fetchClinics = useCallback(
        async (page = 1, searchParams = {}) => {
            try {
                setIsLoading(true);
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                    id: parseInt(searchParams.id) || null,
                    clinicName: searchParams.clinicName || null,
                };

                const response = await axios.post(`${API_BASE}/Clinic/getclinielist`, payload);
                if (response.data && response.data.baseDatas) {
                    setClinics(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách phòng khám:', error);
                setSuccessMessage('Lỗi lấy danh sách phòng khám');
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
        fetchClinics(1);
    }, [fetchServiceTypes, fetchClinics]);

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
        fetchClinics(1, debouncedSearchData);
    }, [debouncedSearchData, fetchClinics]);

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

    // Mở form thêm phòng khám
    const handleAddClinic = () => {
        setIsEditMode(false);
        setEditingClinicId(null);
        setFormData({
            clinicName: '',
            serviceTypeId: '',
            clinicStatus: true,
        });
        setIsFormVisible(true);
    };

    // Mở form sửa phòng khám
    const handleEditClinic = (clinic) => {
        setIsEditMode(true);
        setEditingClinicId(clinic.id);
        setFormData({
            clinicName: clinic.clinicName,
            serviceTypeId: clinic.serviceTypeId.toString(),
            clinicStatus: clinic.clinicStatus,
        });
        setIsFormVisible(true);
    };

    // Gửi form (Thêm hoặc Sửa)
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            if (isEditMode) {
                // Update clinic
                if (!formData.clinicName) {
                    setSuccessMessage('Vui lòng nhập tên phòng khám');
                    setShowSuccessMessage(true);
                    return;
                }

                const payload = {
                    id: editingClinicId,
                    clinicName: formData.clinicName,
                    clinicStatus: formData.clinicStatus,
                };

                const response = await axios.post(`${API_BASE}/Clinic/updateclinic`, payload);
                if (response.data) {
                    setSuccessMessage('Cập nhật phòng khám thành công!');
                    setShowSuccessMessage(true);
                    setIsFormVisible(false);
                    fetchClinics(pageIndex, searchData);
                }
            } else {
                // Create clinic
                if (!formData.clinicName || !formData.serviceTypeId) {
                    setSuccessMessage('Vui lòng nhập đầy đủ thông tin');
                    setShowSuccessMessage(true);
                    return;
                }

                const payload = {
                    clinicName: formData.clinicName,
                    serviceTypeId: parseInt(formData.serviceTypeId),
                };

                const response = await axios.post(`${API_BASE}/Clinic/createclinic`, payload);
                if (response.data) {
                    setSuccessMessage('Thêm phòng khám thành công!');
                    setShowSuccessMessage(true);
                    setIsFormVisible(false);
                    fetchClinics(1);
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

    // Xóa phòng khám
    const handleDeleteClinic = async (clinicId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa phòng khám này?')) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post(`${API_BASE}/Clinic/deleteclinic`, { id: clinicId });
            if (response.data) {
                setSuccessMessage('Xóa phòng khám thành công!');
                setShowSuccessMessage(true);
                setSelectedClinics(new Set());
                fetchClinics(pageIndex, searchData);
            }
        } catch (error) {
            console.error('Lỗi xóa phòng khám:', error);
            setSuccessMessage('Lỗi xóa phòng khám');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Select/Deselect checkbox
    const handleSelectClinic = (clinicId) => {
        const newSelected = new Set(selectedClinics);
        if (newSelected.has(clinicId)) {
            newSelected.delete(clinicId);
        } else {
            newSelected.add(clinicId);
        }
        setSelectedClinics(newSelected);
    };

    // Select all checkbox
    const handleSelectAll = () => {
        if (selectedClinics.size === clinics.length) {
            setSelectedClinics(new Set());
        } else {
            setSelectedClinics(new Set(clinics.map((c) => c.id)));
        }
    };

    // Delete multiple clinics
    const handleDeleteMultiple = async () => {
        if (selectedClinics.size === 0) {
            setSuccessMessage('Vui lòng chọn ít nhất một phòng khám để xóa');
            setShowSuccessMessage(true);
            return;
        }

        if (selectedClinics.size > 1) {
            setSuccessMessage('Chỉ có thể xóa 1 phòng khám tại một lần');
            setShowSuccessMessage(true);
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn xóa phòng khám đã chọn?')) {
            return;
        }

        try {
            setIsLoading(true);
            const deletePromises = Array.from(selectedClinics).map((id) =>
                axios.post(`${API_BASE}/Clinic/deleteclinic`, { id }),
            );
            await Promise.all(deletePromises);
            setSuccessMessage('Xóa phòng khám thành công!');
            setShowSuccessMessage(true);
            setSelectedClinics(new Set());
            fetchClinics(pageIndex, searchData);
        } catch (error) {
            console.error('Lỗi xóa phòng khám:', error);
            setSuccessMessage('Lỗi xóa phòng khám');
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
                <h1>Quản Lý Phòng Khám</h1>
                <div className={cx('header-actions')}>
                    {selectedClinics.size === 1 && (
                        <button
                            className={cx('btn-delete-multiple')}
                            onClick={handleDeleteMultiple}
                            title="Xóa phòng khám được chọn"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            Xóa
                        </button>
                    )}
                    <button className={cx('btn-primary')} onClick={handleAddClinic}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm Phòng Khám
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
                    name="clinicName"
                    placeholder="Tìm kiếm theo tên phòng khám..."
                    value={searchData.clinicName}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
            </div>

            {/* Clinics Table */}
            <div className={cx('table-container')}>
                {isLoading ? (
                    <div className={cx('loading')}>Đang tải...</div>
                ) : clinics.length > 0 ? (
                    <table className={cx('clinics-table')}>
                        <thead>
                            <tr>
                                <th className={cx('checkbox-cell')}>
                                    <input
                                        type="checkbox"
                                        checked={selectedClinics.size === clinics.length && clinics.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>Tên Phòng Khám</th>
                                <th>Mã Loại Dịch Vụ</th>
                                <th>Trạng Thái</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clinics.map((clinic) => (
                                <tr key={clinic.id} className={cx({ selected: selectedClinics.has(clinic.id) })}>
                                    <td className={cx('checkbox-cell')}>
                                        <input
                                            type="checkbox"
                                            checked={selectedClinics.has(clinic.id)}
                                            onChange={() => handleSelectClinic(clinic.id)}
                                        />
                                    </td>
                                    <td>{clinic.clinicName}</td>
                                    <td>ID: {clinic.serviceTypeId}</td>
                                    <td>
                                        <span className={cx('status', { active: clinic.clinicStatus })}>
                                            {clinic.clinicStatus ? 'Hoạt động' : 'Không hoạt động'}
                                        </span>
                                    </td>
                                    <td className={cx('action-buttons')}>
                                        <button
                                            className={cx('btn-icon-edit')}
                                            onClick={() => handleEditClinic(clinic)}
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
                    <div className={cx('empty-state')}>Không có phòng khám nào</div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button disabled={pageIndex === 1} onClick={() => fetchClinics(pageIndex - 1, searchData)}>
                        Trang Trước
                    </button>
                    <span>
                        Trang {pageIndex} / {totalPages}
                    </span>
                    <button disabled={pageIndex === totalPages} onClick={() => fetchClinics(pageIndex + 1, searchData)}>
                        Trang Sau
                    </button>
                </div>
            )}

            {/* Form Modal */}
            {isFormVisible && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal-content')}>
                        <div className={cx('modal-header')}>
                            <h2>{isEditMode ? 'Sửa Phòng Khám' : 'Thêm Phòng Khám'}</h2>
                            <button className={cx('btn-close')} onClick={() => setIsFormVisible(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form className={cx('form')} onSubmit={handleSubmitForm}>
                            <div className={cx('form-group')}>
                                <label>Tên Phòng Khám *</label>
                                <input
                                    type="text"
                                    name="clinicName"
                                    value={formData.clinicName}
                                    onChange={handleFormChange}
                                    placeholder="Nhập tên phòng khám"
                                    required
                                />
                            </div>

                            {!isEditMode && (
                                <div className={cx('form-group')}>
                                    <label>Loại Dịch Vụ *</label>
                                    <select
                                        name="serviceTypeId"
                                        value={formData.serviceTypeId}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">-- Chọn Loại Dịch Vụ --</option>
                                        {serviceTypes.map((st) => (
                                            <option key={st.id} value={st.id}>
                                                {st.serviceTypeName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {isEditMode && (
                                <div className={cx('form-group-checkbox')}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="clinicStatus"
                                            checked={formData.clinicStatus}
                                            onChange={handleFormChange}
                                        />
                                        Phòng khám hoạt động
                                    </label>
                                </div>
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

export default Clinic;
