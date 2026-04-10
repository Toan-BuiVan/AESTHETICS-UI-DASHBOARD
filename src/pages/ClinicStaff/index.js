import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './ClinicStaff.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function ClinicStaff() {
    // State quản lý danh sách nhân viên phòng khám
    const [clinicStaffs, setClinicStaffs] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý Clinic và Staff dropdown
    const [clinics, setClinics] = useState([]);
    const [staffs, setStaffs] = useState([]);

    // State quản lý form
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingClinicStaffId, setEditingClinicStaffId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State quản lý form input
    const [formData, setFormData] = useState({
        clinicId: '',
        staffId: '',
    });

    // State tìm kiếm
    const [searchData, setSearchData] = useState({
        id: '',
        clinicId: '',
    });

    // State quản lý checkbox selection
    const [selectedClinicStaffs, setSelectedClinicStaffs] = useState(new Set());

    // Lấy danh sách Clinic
    const fetchClinics = useCallback(async () => {
        try {
            const response = await axios.post(`${API_BASE}/Clinic/getclinielist`, {
                pageNo: 1,
                pageSize: 100,
            });
            if (response.data && response.data.baseDatas) {
                setClinics(response.data.baseDatas);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách phòng khám:', error);
        }
    }, []);

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

    // Lấy danh sách nhân viên phòng khám
    const fetchClinicStaffs = useCallback(
        async (page = 1, searchParams = {}) => {
            try {
                setIsLoading(true);
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                    id: parseInt(searchParams.id) || null,
                    clinicId: parseInt(searchParams.clinicId) || null,
                };

                const response = await axios.post(`${API_BASE}/ClinicStaff/getclinicstafflist`, payload);
                if (response.data && response.data.baseDatas) {
                    setClinicStaffs(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách nhân viên phòng khám:', error);
                setSuccessMessage('Lỗi lấy danh sách nhân viên phòng khám');
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
        fetchStaffs();
        fetchClinicStaffs(1);
    }, [fetchClinics, fetchStaffs, fetchClinicStaffs]);

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
        fetchClinicStaffs(1, debouncedSearchData);
    }, [debouncedSearchData, fetchClinicStaffs]);

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

    // Mở form thêm nhân viên phòng khám
    const handleAddClinicStaff = () => {
        setIsEditMode(false);
        setEditingClinicStaffId(null);
        setFormData({
            clinicId: '',
            staffId: '',
        });
        setIsFormVisible(true);
    };

    // Mở form sửa nhân viên phòng khám
    const handleEditClinicStaff = (clinicStaff) => {
        setIsEditMode(true);
        setEditingClinicStaffId(clinicStaff.id);
        setFormData({
            clinicId: clinicStaff.clinicId.toString(),
            staffId: clinicStaff.staffId.toString(),
        });
        setIsFormVisible(true);
    };

    // Gửi form (Thêm hoặc Sửa)
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            if (isEditMode) {
                // Update clinic staff
                if (!formData.clinicId || !formData.staffId) {
                    setSuccessMessage('Vui lòng chọn phòng khám và nhân viên');
                    setShowSuccessMessage(true);
                    return;
                }

                const payload = {
                    id: editingClinicStaffId,
                    clinicId: parseInt(formData.clinicId),
                    staffId: parseInt(formData.staffId),
                };

                const response = await axios.post(`${API_BASE}/ClinicStaff/updateclinicstaff`, payload);
                if (response.data) {
                    setSuccessMessage('Cập nhật nhân viên phòng khám thành công!');
                    setShowSuccessMessage(true);
                    setIsFormVisible(false);
                    fetchClinicStaffs(pageIndex, searchData);
                }
            } else {
                // Create clinic staff
                if (!formData.clinicId || !formData.staffId) {
                    setSuccessMessage('Vui lòng chọn phòng khám và nhân viên');
                    setShowSuccessMessage(true);
                    return;
                }

                const payload = {
                    clinicId: parseInt(formData.clinicId),
                    staffId: parseInt(formData.staffId),
                };

                const response = await axios.post(`${API_BASE}/ClinicStaff/createclinicstaff`, payload);
                if (response.data) {
                    setSuccessMessage('Thêm nhân viên phòng khám thành công!');
                    setShowSuccessMessage(true);
                    setIsFormVisible(false);
                    fetchClinicStaffs(1);
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
    const handleSelectClinicStaff = (clinicStaffId) => {
        const newSelected = new Set(selectedClinicStaffs);
        if (newSelected.has(clinicStaffId)) {
            newSelected.delete(clinicStaffId);
        } else {
            newSelected.add(clinicStaffId);
        }
        setSelectedClinicStaffs(newSelected);
    };

    // Select all checkbox
    const handleSelectAll = () => {
        if (selectedClinicStaffs.size === clinicStaffs.length) {
            setSelectedClinicStaffs(new Set());
        } else {
            setSelectedClinicStaffs(new Set(clinicStaffs.map((cs) => cs.id)));
        }
    };

    // Delete multiple clinic staffs
    const handleDeleteMultiple = async () => {
        if (selectedClinicStaffs.size === 0) {
            setSuccessMessage('Vui lòng chọn ít nhất một nhân viên để xóa');
            setShowSuccessMessage(true);
            return;
        }

        if (selectedClinicStaffs.size > 1) {
            setSuccessMessage('Chỉ có thể xóa 1 nhân viên tại một lần');
            setShowSuccessMessage(true);
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên phòng khám đã chọn?')) {
            return;
        }

        try {
            setIsLoading(true);
            const deletePromises = Array.from(selectedClinicStaffs).map((id) =>
                axios.post(`${API_BASE}/ClinicStaff/deleteclinicstaff`, { id }),
            );
            await Promise.all(deletePromises);
            setSuccessMessage('Xóa nhân viên phòng khám thành công!');
            setShowSuccessMessage(true);
            setSelectedClinicStaffs(new Set());
            fetchClinicStaffs(pageIndex, searchData);
        } catch (error) {
            console.error('Lỗi xóa nhân viên phòng khám:', error);
            setSuccessMessage('Lỗi xóa nhân viên phòng khám');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    const getClinicName = (clinicId) => {
        const clinic = clinics.find((c) => c.id === clinicId);
        return clinic ? clinic.clinicName : 'N/A';
    };

    const getStaffName = (staffId) => {
        const staff = staffs.find((s) => s.id === staffId);
        return staff ? staff.staffName : 'N/A';
    };

    const totalPages = Math.ceil(totalRecordCount / pageSize);

    return (
        <div className={cx('wrapper')}>
            {showSuccessMessage && <SuccessMessage message={successMessage} />}

            {/* Header */}
            <div className={cx('header')}>
                <h1>Quản Lý Nhân Viên Phòng Khám</h1>
                <div className={cx('header-actions')}>
                    {selectedClinicStaffs.size === 1 && (
                        <button
                            className={cx('btn-delete-multiple')}
                            onClick={handleDeleteMultiple}
                            title="Xóa nhân viên phòng khám được chọn"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            Xóa
                        </button>
                    )}
                    <button className={cx('btn-primary')} onClick={handleAddClinicStaff}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm Nhân Viên
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
                <select
                    name="clinicId"
                    value={searchData.clinicId}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                >
                    <option value="">-- Tất cả phòng khám --</option>
                    {clinics.map((clinic) => (
                        <option key={clinic.id} value={clinic.id}>
                            {clinic.clinicName}
                        </option>
                    ))}
                </select>
            </div>

            {/* ClinicStaffs Table */}
            <div className={cx('table-container')}>
                {isLoading ? (
                    <div className={cx('loading')}>Đang tải...</div>
                ) : clinicStaffs.length > 0 ? (
                    <table className={cx('clinic-staffs-table')}>
                        <thead>
                            <tr>
                                <th className={cx('checkbox-cell')}>
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedClinicStaffs.size === clinicStaffs.length && clinicStaffs.length > 0
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>ID</th>
                                <th>Phòng Khám</th>
                                <th>Mã Nhân Viên</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clinicStaffs.map((clinicStaff) => (
                                <tr
                                    key={clinicStaff.id}
                                    className={cx({ selected: selectedClinicStaffs.has(clinicStaff.id) })}
                                >
                                    <td className={cx('checkbox-cell')}>
                                        <input
                                            type="checkbox"
                                            checked={selectedClinicStaffs.has(clinicStaff.id)}
                                            onChange={() => handleSelectClinicStaff(clinicStaff.id)}
                                        />
                                    </td>
                                    <td>{clinicStaff.id}</td>
                                    <td>{getClinicName(clinicStaff.clinicId)}</td>
                                    <td>{clinicStaff.staffId}</td>
                                    <td className={cx('action-buttons')}>
                                        <button
                                            className={cx('btn-icon-edit')}
                                            onClick={() => handleEditClinicStaff(clinicStaff)}
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
                    <div className={cx('empty-state')}>Không có nhân viên phòng khám nào</div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button disabled={pageIndex === 1} onClick={() => fetchClinicStaffs(pageIndex - 1, searchData)}>
                        Trang Trước
                    </button>
                    <span>
                        Trang {pageIndex} / {totalPages}
                    </span>
                    <button
                        disabled={pageIndex === totalPages}
                        onClick={() => fetchClinicStaffs(pageIndex + 1, searchData)}
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
                            <h2>{isEditMode ? 'Sửa Nhân Viên Phòng Khám' : 'Thêm Nhân Viên Phòng Khám'}</h2>
                            <button className={cx('btn-close')} onClick={() => setIsFormVisible(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form className={cx('form')} onSubmit={handleSubmitForm}>
                            <div className={cx('form-group')}>
                                <label>Phòng Khám *</label>
                                <select name="clinicId" value={formData.clinicId} onChange={handleFormChange} required>
                                    <option value="">-- Chọn Phòng Khám --</option>
                                    {clinics.map((clinic) => (
                                        <option key={clinic.id} value={clinic.id}>
                                            {clinic.clinicName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={cx('form-group')}>
                                <label>Nhân Viên *</label>
                                <select name="staffId" value={formData.staffId} onChange={handleFormChange} required>
                                    <option value="">-- Chọn Nhân Viên --</option>
                                    {staffs.map((staff) => (
                                        <option key={staff.id} value={staff.id}>
                                            {staff.staffName}
                                        </option>
                                    ))}
                                </select>
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

export default ClinicStaff;
