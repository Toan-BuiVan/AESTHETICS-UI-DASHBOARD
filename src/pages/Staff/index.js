import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Staff.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEdit } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Staff() {
    // State quản lý danh sách nhân viên
    const [staffs, setStaffs] = useState([]);
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
        staffImage: '',
        isDoctor: false,
        doctorLevel: 0,
        degree: '',
        specialization: '',
        licenseNumber: '',
        experienceYears: 0,
        biography: '',
        employmentStatus: 0,
    });

    // State tìm kiếm
    const [searchText, setSearchText] = useState('');
    const [filterDoctor, setFilterDoctor] = useState('');
    const debouncedSearchText = useDebounce(searchText, 3000);

    // Lấy danh sách nhân viên
    const fetchStaffs = useCallback(
        async (page = 1, searchParams = {}) => {
            try {
                setIsLoading(true);
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                    isDoctor: searchParams.isDoctor !== '' ? searchParams.isDoctor === 'true' : undefined,
                };

                const response = await axios.post(`${API_BASE}/Staff/get-list`, payload);
                if (response.data && response.data.baseDatas) {
                    setStaffs(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách nhân viên:', error);
                setSuccessMessage('Lỗi lấy danh sách nhân viên');
                setMessageType('error');
                setShowSuccessMessage(true);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize],
    );

    useEffect(() => {
        fetchStaffs(1, { isDoctor: filterDoctor });
    }, [debouncedSearchText, filterDoctor, fetchStaffs]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
        setPageIndex(1);
    };

    // Handle filter change
    const handleFilterChange = (e) => {
        setFilterDoctor(e.target.value);
        setPageIndex(1);
    };

    // Handle edit staff
    const handleEditStaff = (staff) => {
        setFormData({
            accountId: staff.accountId,
            fullName: staff.fullName || '',
            email: staff.email || '',
            phone: staff.phone || '',
            sex: staff.sex || '',
            address: staff.address || '',
            idCard: staff.idCard || '',
            dateBirth: staff.dateBirth ? staff.dateBirth.split('T')[0] : '',
            staffImage: staff.staffImage || '',
            isDoctor: staff.isDoctor || false,
            doctorLevel: staff.doctorLevel || 0,
            degree: staff.degree || '',
            specialization: staff.specialization || '',
            licenseNumber: staff.licenseNumber || '',
            experienceYears: staff.experienceYears || 0,
            biography: staff.biography || '',
            employmentStatus: staff.employmentStatus || 0,
        });
        setIsFormVisible(true);
    };

    // Handle form input change
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
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
                staffImage: formData.staffImage,
                isDoctor: formData.isDoctor,
                doctorLevel: formData.doctorLevel,
                degree: formData.degree,
                specialization: formData.specialization,
                licenseNumber: formData.licenseNumber,
                experienceYears: formData.experienceYears,
                biography: formData.biography,
                employmentStatus: formData.employmentStatus,
            };

            const response = await axios.post(`${API_BASE}/Staff/updatestaff`, requestData);

            if (response.data === true || response.data.success === true) {
                setSuccessMessage('Cập nhật nhân viên thành công!');
                setMessageType('success');
                setShowSuccessMessage(true);
                setIsFormVisible(false);
                fetchStaffs(pageIndex, { isDoctor: filterDoctor });
            } else {
                setSuccessMessage('Cập nhật nhân viên thất bại!');
                setMessageType('error');
                setShowSuccessMessage(true);
            }
        } catch (error) {
            console.error('Lỗi cập nhật nhân viên:', error);
            setSuccessMessage('Lỗi cập nhật nhân viên: ' + error.message);
            setMessageType('error');
            setShowSuccessMessage(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalPages = Math.ceil(totalRecordCount / pageSize);

    // Filter staffs by search text
    const filteredStaffs = staffs.filter(
        (staff) =>
            staff.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
            staff.accountName.toLowerCase().includes(searchText.toLowerCase()) ||
            (staff.phone && staff.phone.toLowerCase().includes(searchText.toLowerCase())),
    );

    return (
        <div className={cx('wrapper')}>
            {showSuccessMessage && <SuccessMessage message={successMessage} type={messageType} />}

            {/* Header */}
            <div className={cx('header')}>
                <h1>Quản Lý Nhân Viên</h1>
            </div>

            {/* Search & Filter */}
            <div className={cx('search-section')}>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc tài khoản..."
                    value={searchText}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
                <select value={filterDoctor} onChange={handleFilterChange} className={cx('search-input')}>
                    <option value="">-- Tất cả --</option>
                    <option value="true">Bác Sĩ</option>
                    <option value="false">Nhân Viên Thường</option>
                </select>
            </div>

            {/* Staffs Table */}
            <div className={cx('table-container')}>
                {isLoading ? (
                    <div className={cx('loading')}>Đang tải...</div>
                ) : filteredStaffs.length > 0 ? (
                    <table className={cx('staffs-table')}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tài Khoản</th>
                                <th>Họ Tên</th>
                                <th>Email</th>
                                <th>SĐT</th>
                                <th>Loại</th>
                                <th>Trạng Thái</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaffs.map((staff) => (
                                <tr key={staff.id}>
                                    <td>{staff.id}</td>
                                    <td>{staff.accountName}</td>
                                    <td>{staff.fullName}</td>
                                    <td>{staff.email || '—'}</td>
                                    <td>{staff.phone || '—'}</td>
                                    <td>
                                        <span className={cx('badge', { doctor: staff.isDoctor })}>
                                            {staff.isDoctor ? 'Bác Sĩ' : 'Nhân Viên'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={cx('status', { active: staff.employmentStatus === 0 })}>
                                            {staff.employmentStatus === 0
                                                ? 'Đang Làm'
                                                : staff.employmentStatus === 1
                                                  ? 'Nghỉ'
                                                  : 'Khác'}
                                        </span>
                                    </td>
                                    <td className={cx('action-buttons')}>
                                        <button
                                            className={cx('btn-icon-edit')}
                                            onClick={() => handleEditStaff(staff)}
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
                    <div className={cx('empty-state')}>Không có nhân viên nào</div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button
                        disabled={pageIndex === 1}
                        onClick={() => fetchStaffs(pageIndex - 1, { isDoctor: filterDoctor })}
                    >
                        Trang Trước
                    </button>
                    <span>
                        Trang {pageIndex} / {totalPages}
                    </span>
                    <button
                        disabled={pageIndex === totalPages}
                        onClick={() => fetchStaffs(pageIndex + 1, { isDoctor: filterDoctor })}
                    >
                        Trang Sau
                    </button>
                </div>
            )}

            {/* Edit Form Modal */}
            {isFormVisible && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal-content')}>
                        <div className={cx('modal-header')}>
                            <h2>Chỉnh Sửa Nhân Viên</h2>
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

                            {/* Doctor Section */}
                            <div className={cx('form-section')}>
                                <div className={cx('form-group', 'checkbox')}>
                                    <input
                                        type="checkbox"
                                        name="isDoctor"
                                        id="isDoctor"
                                        checked={formData.isDoctor}
                                        onChange={handleFormChange}
                                    />
                                    <label htmlFor="isDoctor">Là Bác Sĩ</label>
                                </div>
                            </div>

                            {formData.isDoctor && (
                                <div className={cx('doctor-section')}>
                                    <h3>Thông Tin Bác Sĩ</h3>
                                    <div className={cx('form-row')}>
                                        <div className={cx('form-group')}>
                                            <label>Bằng Cấp</label>
                                            <input
                                                type="text"
                                                name="degree"
                                                value={formData.degree}
                                                onChange={handleFormChange}
                                                placeholder="Nhập bằng cấp"
                                            />
                                        </div>
                                        <div className={cx('form-group')}>
                                            <label>Chuyên Ngành</label>
                                            <input
                                                type="text"
                                                name="specialization"
                                                value={formData.specialization}
                                                onChange={handleFormChange}
                                                placeholder="Nhập chuyên ngành"
                                            />
                                        </div>
                                    </div>

                                    <div className={cx('form-row')}>
                                        <div className={cx('form-group')}>
                                            <label>Số Chứng Chỉ</label>
                                            <input
                                                type="text"
                                                name="licenseNumber"
                                                value={formData.licenseNumber}
                                                onChange={handleFormChange}
                                                placeholder="Nhập số chứng chỉ"
                                            />
                                        </div>
                                        <div className={cx('form-group')}>
                                            <label>Kinh Nghiệm (năm)</label>
                                            <input
                                                type="number"
                                                name="experienceYears"
                                                value={formData.experienceYears}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                    </div>

                                    <div className={cx('form-row')}>
                                        <div className={cx('form-group')}>
                                            <label>Trình Độ Bác Sĩ</label>
                                            <input
                                                type="number"
                                                name="doctorLevel"
                                                value={formData.doctorLevel}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                        <div className={cx('form-group')}>
                                            <label>Trạng Thái Việc Làm</label>
                                            <select
                                                name="employmentStatus"
                                                value={formData.employmentStatus}
                                                onChange={handleFormChange}
                                            >
                                                <option value={0}>Đang Làm</option>
                                                <option value={1}>Nghỉ</option>
                                                <option value={2}>Khác</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className={cx('form-row', 'fullwidth')}>
                                        <div className={cx('form-group', 'fullwidth')}>
                                            <label>Tiểu Sử</label>
                                            <textarea
                                                name="biography"
                                                value={formData.biography}
                                                onChange={handleFormChange}
                                                placeholder="Nhập tiểu sử"
                                                rows="3"
                                            ></textarea>
                                        </div>
                                    </div>
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

export default Staff;
