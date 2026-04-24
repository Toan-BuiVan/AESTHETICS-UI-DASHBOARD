import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Equipment.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import ItemEquipment from './ItemEquipment';
import useDebounce from '~/hooks/useDebounce';
import { nlNL } from '@mui/x-date-pickers/locales';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Equipment() {
    // State quản lý danh sách thiết bị
    const [equipments, setEquipments] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý danh sách phòng khám
    const [clinics, setClinics] = useState([]);

    // State quản lý form
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingEquipmentId, setEditingEquipmentId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State quản lý form input
    const [formData, setFormData] = useState({
        equipmentName: '',
        clinicId: '',
        status: 'Active',
    });

    // State tìm kiếm
    const [searchData, setSearchData] = useState({
        equipmentName: '',
        clinicId: '',
    });

    // Lấy danh sách phòng khám
    const fetchClinics = useCallback(async () => {
        try {
            const response = await axios.post(`${API_BASE}/Clinic/getclinielist`, {
                pageNo: 1,
                pageSize: 1000,
            });
            if (response.data && response.data.baseDatas) {
                setClinics(response.data.baseDatas);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách phòng khám:', error);
        }
    }, []);

    // Lấy danh sách thiết bị
    const fetchEquipments = useCallback(
        async (page = 1, searchParams = {}) => {
            try {
                setIsLoading(true);
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                    equipmentName: searchParams.equipmentName || null,
                    clinicId: searchParams.clinicId ? parseInt(searchParams.clinicId) : null,
                };

                const response = await axios.post(`${API_BASE}/Equipment/getequipmentlist`, payload);
                if (response.data && response.data.baseDatas) {
                    setEquipments(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách thiết bị:', error);
                setSuccessMessage('Lỗi lấy danh sách thiết bị');
                setShowSuccessMessage(true);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize],
    );

    // Khởi tạo dữ liệu
    useEffect(() => {
        fetchClinics();
        fetchEquipments(1);
    }, [fetchClinics, fetchEquipments]);

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
        fetchEquipments(1, debouncedSearchData);
    }, [debouncedSearchData, fetchEquipments]);

    // Xử lý thay đổi form input
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Xử lý thay đổi tìm kiếm
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            let response;
            if (isEditMode) {
                // Cập nhật thiết bị
                const payload = {
                    id: editingEquipmentId,
                    equipmentName: formData.equipmentName,
                    clinicId: parseInt(formData.clinicId),
                    status: formData.status,
                };

                response = await axios.post(`${API_BASE}/Equipment/updateequipment`, payload);
            } else {
                // Tạo thiết bị mới
                const payload = {
                    equipmentName: formData.equipmentName,
                    clinicId: parseInt(formData.clinicId),
                };

                response = await axios.post(`${API_BASE}/Equipment/createequipment`, payload);
            }

            if (response.data && response.data.success) {
                setSuccessMessage(isEditMode ? 'Cập nhật thiết bị thành công' : 'Tạo thiết bị thành công');
                setShowSuccessMessage(true);
                setIsFormVisible(false);
                setFormData({
                    equipmentName: '',
                    clinicId: '',
                    status: 'Active',
                });
                setIsEditMode(false);
                setEditingEquipmentId(null);
                fetchEquipments(1, searchData);
            } else {
                setSuccessMessage(
                    response.data?.message || (isEditMode ? 'Lỗi khi cập nhật thiết bị' : 'Lỗi khi tạo thiết bị'),
                );
                setShowSuccessMessage(true);
            }
        } catch (error) {
            console.error('Lỗi:', error);
            setSuccessMessage(isEditMode ? 'Lỗi khi cập nhật thiết bị' : 'Lỗi khi tạo thiết bị');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý mở form thêm
    const handleOpenForm = () => {
        setIsEditMode(false);
        setEditingEquipmentId(null);
        setFormData({
            equipmentName: '',
            clinicId: '',
            status: 'Active',
        });
        setIsFormVisible(true);
    };

    // Xử lý mở form chỉnh sửa
    const handleEditEquipment = (equipment) => {
        setIsEditMode(true);
        setEditingEquipmentId(equipment.id);
        setFormData({
            equipmentName: equipment.equipmentName,
            clinicId: equipment.clinicId,
            status: equipment.status,
        });
        setIsFormVisible(true);
    };

    // Xử lý đóng form
    const handleCloseForm = () => {
        setIsFormVisible(false);
        setIsEditMode(false);
        setEditingEquipmentId(null);
    };

    // Xử lý xóa equipment
    const handleDeleteEquipment = (equipmentId) => {
        setEquipments((prev) => prev.filter((eq) => eq.id !== equipmentId));
        fetchEquipments(1, searchData);
    };

    // Xử lý pagination
    const handlePageChange = (newPage) => {
        fetchEquipments(newPage, searchData);
    };

    return (
        <div className={cx('wrapper')}>
            {showSuccessMessage && <SuccessMessage message={successMessage} />}

            {/* Header */}
            <div className={cx('header')}>
                <h1>Quản Lý Thiết Bị Phòng Khám</h1>
                <div className={cx('header-actions')}>
                    <button className={cx('btn-add')} onClick={handleOpenForm}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm Thiết Bị
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className={cx('filter-section')}>
                <div className={cx('filter-group')}>
                    <label>Tên Thiết Bị</label>
                    <input
                        type="text"
                        name="equipmentName"
                        value={searchData.equipmentName}
                        onChange={handleSearchChange}
                        placeholder="Tìm kiếm tên thiết bị..."
                        className={cx('filter-input')}
                    />
                </div>

                <div className={cx('filter-group')}>
                    <label>Phòng Khám</label>
                    <select
                        name="clinicId"
                        value={searchData.clinicId}
                        onChange={handleSearchChange}
                        className={cx('filter-input')}
                    >
                        <option value="">Tất cả</option>
                        {clinics.map((clinic) => (
                            <option key={clinic.id} value={clinic.id}>
                                {clinic.clinicName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Form thêm/chỉnh sửa thiết bị */}
            {isFormVisible && (
                <div className={cx('form-overlay')}>
                    <div className={cx('form-container')}>
                        <div className={cx('form-header')}>
                            <h2>{isEditMode ? 'Chỉnh Sửa Thiết Bị' : 'Thêm Thiết Bị Mới'}</h2>
                            <button className={cx('btn-close')} onClick={handleCloseForm}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={cx('form-content')}>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label htmlFor="equipmentName">
                                        Tên Thiết Bị <span className={cx('required')}>*</span>
                                    </label>
                                    <input
                                        id="equipmentName"
                                        type="text"
                                        name="equipmentName"
                                        value={formData.equipmentName}
                                        onChange={handleFormChange}
                                        required
                                        className={cx('form-input')}
                                        placeholder="Nhập tên thiết bị"
                                    />
                                </div>
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label htmlFor="clinicId">
                                        Phòng Khám <span className={cx('required')}>*</span>
                                    </label>
                                    <select
                                        id="clinicId"
                                        name="clinicId"
                                        value={formData.clinicId}
                                        onChange={handleFormChange}
                                        required
                                        className={cx('form-input')}
                                    >
                                        <option value="">Chọn phòng khám</option>
                                        {clinics.map((clinic) => (
                                            <option key={clinic.id} value={clinic.id}>
                                                {clinic.clinicName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {isEditMode && (
                                    <div className={cx('form-group')}>
                                        <label htmlFor="status">Trạng Thái</label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleFormChange}
                                            className={cx('form-input')}
                                        >
                                            <option value="Active">Hoạt Động</option>
                                            <option value="Inactive">Không Hoạt Động</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className={cx('form-actions')}>
                                <button type="button" className={cx('btn-cancel')} onClick={handleCloseForm}>
                                    Hủy
                                </button>
                                <button type="submit" className={cx('btn-submit')} disabled={isLoading}>
                                    {isLoading ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Danh sách thiết bị */}
            <div className={cx('table-container')}>
                {isLoading ? (
                    <div className={cx('loading')}>Đang tải dữ liệu...</div>
                ) : equipments.length > 0 ? (
                    <>
                        <ItemEquipment
                            equipments={equipments}
                            clinics={clinics}
                            onEdit={handleEditEquipment}
                            onDeleteSuccess={handleDeleteEquipment}
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
                    <div className={cx('no-data')}>Không có dữ liệu thiết bị</div>
                )}
            </div>
        </div>
    );
}

export default Equipment;
