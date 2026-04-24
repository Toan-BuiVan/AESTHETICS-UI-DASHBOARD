import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Profile.module.scss';
import classNames from 'classnames/bind';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [imagePreview, setImagePreview] = useState('');
    const [newImageFile, setNewImageFile] = useState(null);

    const accountId = localStorage.getItem('userID');

    useEffect(() => {
        if (accountId) {
            fetchProfile();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountId]);

    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${API_BASE}/Account/getprofileaccount?accountId=${accountId}`);
            if (response.data) {
                setProfileData(response.data);
            }
        } catch (error) {
            console.error('Lỗi lấy hồ sơ:', error);
            setSuccessMessage('Lỗi lấy hồ sơ');
            setMessageType('error');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = () => {
        setEditFormData({ ...profileData });
        if (profileData.staffImage) {
            setImagePreview(`http://localhost:5122/Images/${profileData.staffImage}`);
        }
        setNewImageFile(null);
        setShowEditModal(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                // Lưu base64 vào editFormData để gửi lên API
                setEditFormData({
                    ...editFormData,
                    staffImage: reader.result,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field, value) => {
        setEditFormData({
            ...editFormData,
            [field]: value,
        });
    };

    const handleSaveProfile = async () => {
        try {
            setIsSubmitting(true);
            const requestData = {
                accountId: editFormData.accountId,
                fullName: editFormData.fullName || '',
                dateBirth: editFormData.dateBirth,
                email: editFormData.email || '',
                sex: editFormData.sex || '',
                phone: editFormData.phone || '',
                address: editFormData.address || '',
                idCard: editFormData.idCard || '',
                staffImage: editFormData.staffImage || '',
                isDoctor: editFormData.isDoctor || false,
                doctorLevel: editFormData.doctorLevel || 0,
                degree: editFormData.degree || '',
                specialization: editFormData.specialization || '',
                licenseNumber: editFormData.licenseNumber || '',
                experienceYears: editFormData.experienceYears || 0,
                biography: editFormData.biography || '',
                employmentStatus: editFormData.employmentStatus || 0,
            };

            const response = await axios.post(`${API_BASE}/Staff/updatestaff`, requestData);

            if (response.data === true || response.data.success === true) {
                setSuccessMessage('Cập nhật hồ sơ thành công!');
                setMessageType('success');
                setShowSuccessMessage(true);
                setShowEditModal(false);
                fetchProfile();
            } else {
                setSuccessMessage('Cập nhật hồ sơ thất bại!');
                setMessageType('error');
                setShowSuccessMessage(true);
            }
        } catch (error) {
            console.error('Lỗi cập nhật hồ sơ:', error);
            setSuccessMessage('Lỗi cập nhật hồ sơ: ' + error.message);
            setMessageType('error');
            setShowSuccessMessage(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    if (!accountId) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('error-state')}>Vui lòng đăng nhập để xem hồ sơ</div>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            {showSuccessMessage && <SuccessMessage message={successMessage} type={messageType} />}

            <div className={cx('container')}>
                <div className={cx('header')}>
                    <div className={cx('header-content')}>
                        <h1>Hồ Sơ Người Dùng</h1>
                        {profileData && <p className={cx('subtitle')}>Tài khoản: {profileData.userName}</p>}
                    </div>
                    {profileData && (
                        <button className={cx('btn-edit')} onClick={handleEditClick}>
                            <FontAwesomeIcon icon={faEdit} /> Chỉnh Sửa
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className={cx('loading')}>Đang tải hồ sơ...</div>
                ) : profileData ? (
                    <div className={cx('cv-container')}>
                        {/* CV Main Layout */}
                        <div className={cx('cv-wrapper')}>
                            {/* Left Sidebar - Photo */}
                            <div className={cx('cv-sidebar')}>
                                <div className={cx('photo-box')}>
                                    {profileData.staffImage ? (
                                        <img
                                            src={`http://localhost:5122/Images/${profileData.staffImage}`}
                                            alt="Profile"
                                            className={cx('profile-photo')}
                                        />
                                    ) : (
                                        <div className={cx('photo-placeholder')}>
                                            <span>Không có ảnh</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Content - CV Info */}
                            <div className={cx('cv-content')}>
                                {/* Header Section */}
                                <div className={cx('cv-header')}>
                                    <h1>{profileData.fullName || profileData.userName}</h1>
                                    {profileData.isDoctor && profileData.degree && (
                                        <p className={cx('cv-title')}>
                                            {profileData.degree} - {profileData.specialization}
                                        </p>
                                    )}
                                </div>

                                {/* Contact Information */}
                                <div className={cx('cv-section')}>
                                    <h3 className={cx('section-title')}>THÔNG TIN LIÊN HỆ</h3>
                                    <div className={cx('contact-info')}>
                                        <p>
                                            <strong>Email:</strong> {profileData.email || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Điện thoại:</strong> {profileData.phone || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Địa chỉ:</strong> {profileData.address || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div className={cx('cv-section')}>
                                    <h3 className={cx('section-title')}>THÔNG TIN CÁ NHÂN</h3>
                                    <div className={cx('info-grid')}>
                                        <p>
                                            <strong>Giới tính:</strong> {profileData.sex || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Ngày sinh:</strong> {formatDate(profileData.dateBirth)}
                                        </p>
                                        <p>
                                            <strong>CCCD/CMND:</strong> {profileData.idCard || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Username:</strong> {profileData.userName}
                                        </p>
                                    </div>
                                </div>

                                {/* Professional Information (if doctor/staff) */}
                                {profileData.isDoctor && (
                                    <div className={cx('cv-section')}>
                                        <h3 className={cx('section-title')}>THÔNG TIN CHUYÊN MÔN</h3>
                                        <div className={cx('info-grid')}>
                                            <p>
                                                <strong>Bằng cấp:</strong> {profileData.degree || 'N/A'}
                                            </p>
                                            <p>
                                                <strong>Chuyên ngành:</strong> {profileData.specialization || 'N/A'}
                                            </p>
                                            <p>
                                                <strong>Số chứng chỉ:</strong> {profileData.licenseNumber || 'N/A'}
                                            </p>
                                            <p>
                                                <strong>Kinh nghiệm:</strong> {profileData.experienceYears || 0} năm
                                            </p>
                                            <p>
                                                <strong>Trình độ:</strong> Level {profileData.doctorLevel || 0}
                                            </p>
                                            <p>
                                                <strong>Trạng thái:</strong>{' '}
                                                {profileData.employmentStatus === 0
                                                    ? 'Đang làm'
                                                    : profileData.employmentStatus === 1
                                                      ? 'Nghỉ'
                                                      : 'Khác'}
                                            </p>
                                        </div>
                                        {profileData.biography && (
                                            <div className={cx('biography-section')}>
                                                <strong>Tiểu sử:</strong>
                                                <p>{profileData.biography}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Account Information */}
                                <div className={cx('cv-section')}>
                                    <h3 className={cx('section-title')}>THÔNG TIN TÀI KHOẢN</h3>
                                    <div className={cx('info-grid')}>
                                        <p>
                                            <strong>ID Tài khoản:</strong> {profileData.accountId}
                                        </p>
                                        <p>
                                            <strong>Ngày tạo:</strong> {formatDate(profileData.creationDate)}
                                        </p>
                                        <p>
                                            <strong>Trạng thái:</strong>{' '}
                                            <span className={cx('status-badge', { active: !profileData.isDeleted })}>
                                                {profileData.isDeleted ? 'Đã xóa' : 'Hoạt động'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Points Information */}
                                <div className={cx('cv-section')}>
                                    <h3 className={cx('section-title')}>ĐIỂM VÀ HẠNG THÀNH VIÊN</h3>
                                    <div className={cx('info-grid')}>
                                        <p>
                                            <strong>Điểm tích lũy:</strong> {profileData.accumulatedPoints || 0}
                                        </p>
                                        <p>
                                            <strong>Điểm đánh giá:</strong> {profileData.ratingPoints || 0}
                                        </p>
                                        <p>
                                            <strong>Điểm bán hàng:</strong> {profileData.salesPoints || 0}
                                        </p>
                                        <p>
                                            <strong>Hạng thành viên:</strong> {profileData.rankMember || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={cx('empty-state')}>Không thể tải hồ sơ. Vui lòng thử lại.</div>
                )}
            </div>

            {/* Modal Chỉnh Sửa */}
            {showEditModal && (
                <div className={cx('modal-overlay')} onClick={handleCloseModal}>
                    <div className={cx('modal')} onClick={(e) => e.stopPropagation()}>
                        <div className={cx('modal-header')}>
                            <h2>Chỉnh Sửa Hồ Sơ</h2>
                            <button className={cx('modal-close')} onClick={handleCloseModal}>
                                ×
                            </button>
                        </div>
                        <div className={cx('modal-body')}>
                            <div className={cx('form-grid')}>
                                {/* Hình Ảnh */}
                                <div className={cx('form-group', 'col-full')}>
                                    <label>Hình Ảnh Nhân Viên</label>
                                    {imagePreview && (
                                        <div className={cx('image-preview-container')}>
                                            <img src={imagePreview} alt="Preview" className={cx('image-preview')} />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={cx('file-input')}
                                    />
                                </div>

                                {/* Họ Tên */}
                                <div className={cx('form-group')}>
                                    <label>Họ Tên *</label>
                                    <input
                                        type="text"
                                        value={editFormData.fullName || ''}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        placeholder="Nhập họ tên"
                                    />
                                </div>

                                {/* Email */}
                                <div className={cx('form-group')}>
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={editFormData.email || ''}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="Nhập email"
                                    />
                                </div>

                                {/* Số Điện Thoại */}
                                <div className={cx('form-group')}>
                                    <label>Số Điện Thoại *</label>
                                    <input
                                        type="tel"
                                        value={editFormData.phone || ''}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                {/* Giới Tính */}
                                <div className={cx('form-group')}>
                                    <label>Giới Tính *</label>
                                    <select
                                        value={editFormData.sex || ''}
                                        onChange={(e) => handleInputChange('sex', e.target.value)}
                                    >
                                        <option value="">-- Chọn --</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>

                                {/* Ngày Sinh */}
                                <div className={cx('form-group')}>
                                    <label>Ngày Sinh *</label>
                                    <input
                                        type="date"
                                        value={editFormData.dateBirth ? editFormData.dateBirth.split('T')[0] : ''}
                                        onChange={(e) => handleInputChange('dateBirth', e.target.value)}
                                    />
                                </div>

                                {/* Địa Chỉ */}
                                <div className={cx('form-group', 'col-full')}>
                                    <label>Địa Chỉ *</label>
                                    <input
                                        type="text"
                                        value={editFormData.address || ''}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder="Nhập địa chỉ"
                                    />
                                </div>

                                {/* CCCD */}
                                <div className={cx('form-group')}>
                                    <label>CCCD/CMND *</label>
                                    <input
                                        type="text"
                                        value={editFormData.idCard || ''}
                                        onChange={(e) => handleInputChange('idCard', e.target.value)}
                                        placeholder="Nhập CCCD/CMND"
                                    />
                                </div>

                                {profileData.isDoctor && (
                                    <>
                                        {/* Trình Độ Bác Sĩ */}
                                        <div className={cx('form-group')}>
                                            <label>Trình Độ Bác Sĩ</label>
                                            <input
                                                type="number"
                                                value={editFormData.doctorLevel || 0}
                                                onChange={(e) =>
                                                    handleInputChange('doctorLevel', parseInt(e.target.value))
                                                }
                                            />
                                        </div>

                                        {/* Bằng Cấp */}
                                        <div className={cx('form-group')}>
                                            <label>Bằng Cấp</label>
                                            <input
                                                type="text"
                                                value={editFormData.degree || ''}
                                                onChange={(e) => handleInputChange('degree', e.target.value)}
                                                placeholder="Nhập bằng cấp"
                                            />
                                        </div>

                                        {/* Chuyên Ngành */}
                                        <div className={cx('form-group')}>
                                            <label>Chuyên Ngành</label>
                                            <input
                                                type="text"
                                                value={editFormData.specialization || ''}
                                                onChange={(e) => handleInputChange('specialization', e.target.value)}
                                                placeholder="Nhập chuyên ngành"
                                            />
                                        </div>

                                        {/* Số Chứng Chỉ */}
                                        <div className={cx('form-group')}>
                                            <label>Số Chứng Chỉ</label>
                                            <input
                                                type="text"
                                                value={editFormData.licenseNumber || ''}
                                                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                                                placeholder="Nhập số chứng chỉ"
                                            />
                                        </div>

                                        {/* Kinh Nghiệm */}
                                        <div className={cx('form-group')}>
                                            <label>Kinh Nghiệm (năm)</label>
                                            <input
                                                type="number"
                                                value={editFormData.experienceYears || 0}
                                                onChange={(e) =>
                                                    handleInputChange('experienceYears', parseInt(e.target.value))
                                                }
                                            />
                                        </div>

                                        {/* Tiểu Sử */}
                                        <div className={cx('form-group', 'col-full')}>
                                            <label>Tiểu Sử</label>
                                            <textarea
                                                value={editFormData.biography || ''}
                                                onChange={(e) => handleInputChange('biography', e.target.value)}
                                                placeholder="Nhập tiểu sử"
                                                rows="4"
                                            ></textarea>
                                        </div>

                                        {/* Trạng Thái Việc Làm */}
                                        <div className={cx('form-group')}>
                                            <label>Trạng Thái Việc Làm</label>
                                            <select
                                                value={editFormData.employmentStatus || 0}
                                                onChange={(e) =>
                                                    handleInputChange('employmentStatus', parseInt(e.target.value))
                                                }
                                            >
                                                <option value={0}>Đang làm</option>
                                                <option value={1}>Nghỉ</option>
                                                <option value={2}>Khác</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={cx('modal-footer')}>
                            <button className={cx('btn', 'btn-cancel')} onClick={handleCloseModal}>
                                Hủy
                            </button>
                            <button
                                className={cx('btn', 'btn-save')}
                                onClick={handleSaveProfile}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
