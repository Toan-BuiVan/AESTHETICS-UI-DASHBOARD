import React, { useState, useEffect, useCallback } from 'react';
import styles from './CombinedClinicPage.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import ItemClinic from './ItemClinic';
import ItemClinicStaff from './ItemClinicStaff';

const cx = classNames.bind(styles);

function CombinedClinicPage() {
    // State declarations for Clinic
    const [clinicsList, setClinicsList] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [formType, setFormType] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingClinic, setEditingClinic] = useState(null);
    const [loadingClinics, setLoadingClinics] = useState(true);
    const [errorClinics, setErrorClinics] = useState(null);
    const [clinicName, setClinicName] = useState('');
    const [productsOfServicesID, setProductsOfServicesID] = useState('');
    const [productsOfServicesName, setProductsOfServicesName] = useState('');
    const [clinicID, setClinicID] = useState('');
    const [userID, setUserID] = useState('');

    // State declarations for ClinicStaff
    const [clinicStaffList, setClinicStaffList] = useState([]);
    const [selectedClinicID, setSelectedClinicID] = useState(null);
    const [isStaffModalVisible, setIsStaffModalVisible] = useState(false);
    const [editingClinicStaff, setEditingClinicStaff] = useState(null);

    const refreshTokenOnLoad = async () => {
        try {
            const accessToken = localStorage.getItem('token') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';

            const response = await fetch('https://buitoandev.somee.com/api/Authentication/Refresh_Token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken, refreshToken }),
            });

            if (!response.ok) throw new Error('Không thể làm mới token');

            const data = await response.json();
            if (data.responseCode === 1) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                console.log('Đã cập nhật token và refreshToken trong localStorage');
            } else {
                console.error('Làm mới token thất bại:', data.responseMessage);
            }
        } catch (error) {
            console.error('Lỗi khi làm mới token:', error);
        }
    };

    const fetchClinicsList = useCallback(async (searchParams) => {
        try {
            setLoadingClinics(true);
            const deviceName = localStorage.getItem('deviceName') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';
            const token = localStorage.getItem('token') || '';
            const userID = localStorage.getItem('userID') || '';

            const headers = {
                'Content-Type': 'application/json',
                DeviceName: deviceName,
                RefreshToken: refreshToken,
                UserID: userID,
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const defaultParams = {
                clinicID: null,
                clinicName: null,
                productsOfServicesID: null,
                productsOfServicesName: null,
            };
            const defaultResponse = await fetch('https://buitoandev.somee.com/api/Clinic/GetList_SearchClinic', {
                method: 'POST',
                headers,
                body: JSON.stringify(defaultParams),
            });
            if (!defaultResponse.ok) throw new Error('Lỗi khi gọi API lấy danh sách phòng khám mặc định');
            const data = await defaultResponse.json();
            let proOf = [];
            if (Array.isArray(data)) {
                proOf = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                proOf = data.data;
            }
            setClinicsList(proOf);

            if (searchParams && Object.values(searchParams).some((value) => value !== null && value !== 0)) {
                const response = await fetch('https://buitoandev.somee.com/api/Clinic/GetList_SearchClinic', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(searchParams),
                });
                if (!response.ok) throw new Error('Lỗi khi gọi API lấy danh sách phòng khám với tham số');
                const data = await response.json();
                let proOf = [];
                if (Array.isArray(data)) {
                    proOf = data;
                } else if (data && data.data && Array.isArray(data.data)) {
                    proOf = data.data;
                }
                setClinicsList(proOf);
            }
        } catch (error) {
            setErrorClinics(error.message);
            setClinicsList([]);
        } finally {
            setLoadingClinics(false);
        }
    }, []);

    const fetchClinicStaffList = useCallback(async (clinicID) => {
        try {
            const deviceName = localStorage.getItem('deviceName') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';
            const token = localStorage.getItem('token');
            const userID = localStorage.getItem('userID') || '';

            const headers = {
                'Content-Type': 'application/json',
                DeviceName: deviceName,
                RefreshToken: refreshToken,
                UserID: userID,
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const searchParams = {
                clinicStaffID: null,
                clinicID: clinicID,
                userID: null,
            };
            const response = await fetch('https://buitoandev.somee.com/api/Clinic_Staff/GetList_SearchClinicStaff', {
                method: 'POST',
                headers,
                body: JSON.stringify(searchParams),
            });
            if (!response.ok) throw new Error('Lỗi khi gọi API lấy danh sách nhân viên phòng khám');
            const data = await response.json();
            let proOf = [];
            if (Array.isArray(data)) {
                proOf = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                proOf = data.data;
            }
            setClinicStaffList(proOf);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách nhân viên:', error.message);
            setClinicStaffList([]);
        }
    }, []);

    useEffect(() => {
        const initialize = async () => {
            fetchClinicsList({
                clinicID: 0,
                clinicName: null,
                productsOfServicesID: 0,
                productsOfServicesName: null,
            });
        };
        initialize();
    }, [fetchClinicsList]);

    const handleSearch = () => {
        let searchParams = {
            clinicID: null,
            clinicName: null,
            productsOfServicesID: null,
            productsOfServicesName: null,
        };
        if (searchTerm) {
            if (!isNaN(searchTerm)) {
                const term = parseInt(searchTerm, 10);
                searchParams.clinicID = term;
            } else {
                searchParams.clinicName = searchTerm;
            }
        }
        fetchClinicsList(searchParams);
    };

    const handleEdit = (clinicID) => {
        const clinicToEdit = clinicsList.find((clinic) => clinic.clinicID === clinicID);
        if (clinicToEdit) {
            setEditingClinic(clinicToEdit);
            setClinicName(clinicToEdit.clinicName);
            setProductsOfServicesID(clinicToEdit.productsOfServicesID.toString());
            setProductsOfServicesName(clinicToEdit.productsOfServicesName);
            setFormType('clinic');
            setIsFormVisible(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const deviceName = localStorage.getItem('deviceName') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';
        const token = localStorage.getItem('token') || '';
        const userIDFromLocal = localStorage.getItem('userID') || '';

        const headers = {
            'Content-Type': 'application/json',
            DeviceName: deviceName,
            RefreshToken: refreshToken,
            Authorization: token ? `Bearer ${token}` : '',
            UserID: userIDFromLocal,
        };

        if (formType === 'clinic') {
            const formData = {
                clinicName,
                productsOfServicesID: parseInt(productsOfServicesID, 10),
                productsOfServicesName,
            };

            if (editingClinic) {
                formData.clinicID = editingClinic.clinicID;
            }

            try {
                const response = await fetch(
                    editingClinic
                        ? 'https://buitoandev.somee.com/api/Clinic/Update_Clinic'
                        : 'https://buitoandev.somee.com/api/Clinic/Insert_Clinic',
                    {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(formData),
                    },
                );

                const result = await response.json();
                const newAccessToken = response.headers.get('New-AccessToken');
                const newRefreshToken = response.headers.get('New-RefreshToken');
                if (newAccessToken) localStorage.setItem('token', newAccessToken);
                if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
                if (!response.ok) {
                    setSuccessMessage(result.resposeMessage || 'Thao tác thất bại!');
                } else {
                    setSuccessMessage(result.resposeMessage || 'Thao tác thành công!');

                    if (editingClinic) {
                        setClinicsList(
                            clinicsList.map((clinic) =>
                                clinic.clinicID === editingClinic.clinicID ? { ...clinic, ...formData } : clinic,
                            ),
                        );
                    } else {
                        fetchClinicsList({
                            clinicID: 0,
                            clinicName: null,
                            productsOfServicesID: 0,
                            productsOfServicesName: null,
                        });
                    }

                    setClinicName('');
                    setProductsOfServicesID('');
                    setProductsOfServicesName('');
                    setEditingClinic(null);
                    setTimeout(() => {
                        setIsFormVisible(false);
                        setSuccessMessage('');
                    }, 3500);
                }
            } catch (error) {
                setSuccessMessage('Có lỗi xảy ra: ' + error.message);
            }
        } else if (formType === 'staff') {
            const formData = {
                clinicID: parseInt(clinicID, 10),
                userID: parseInt(userID, 10),
            };

            if (editingClinicStaff) {
                formData.clinicStaffID = editingClinicStaff.clinicStaffID;
            }

            try {
                const response = await fetch(
                    editingClinicStaff
                        ? 'https://buitoandev.somee.com/api/Clinic_Staff/Update_ClinicStaff'
                        : 'https://buitoandev.somee.com/api/Clinic_Staff/Insert_ClinicStaff',
                    {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(formData),
                    },
                );

                const result = await response.json();
                if (!response.ok) {
                    setSuccessMessage(result.responseMessage || 'Thao tác thất bại!');
                } else {
                    setSuccessMessage(result.responseMessage || 'Thao tác thành công!');
                    const newAccessToken = response.headers.get('New-AccessToken');
                    const newRefreshToken = response.headers.get('New-RefreshToken');
                    if (newAccessToken) localStorage.setItem('token', newAccessToken);
                    if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

                    if (editingClinicStaff) {
                        setClinicStaffList(
                            clinicStaffList.map((staff) =>
                                staff.clinicStaffID === editingClinicStaff.clinicStaffID
                                    ? { ...staff, ...formData }
                                    : staff,
                            ),
                        );
                    } else {
                        fetchClinicStaffList(parseInt(clinicID, 10));
                    }

                    setClinicID('');
                    setUserID('');
                    setEditingClinicStaff(null);
                    setTimeout(() => {
                        setIsFormVisible(false);
                        setSuccessMessage('');
                    }, 3500);
                }
            } catch (error) {
                setSuccessMessage('Có lỗi xảy ra: ' + error.message);
            }
        }
    };

    const handleDeleteSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleDelete = (clinicID) => {
        setClinicsList(clinicsList.filter((clinic) => clinic.clinicID !== clinicID));
    };

    const toggleFormVisibility = (type) => {
        setFormType(type);
        setIsFormVisible(true);
    };

    const handleViewStaff = (clinicID) => {
        setSelectedClinicID(clinicID);
        fetchClinicStaffList(clinicID);
        setIsStaffModalVisible(true);
    };

    const closeStaffModal = () => {
        setIsStaffModalVisible(false);
        setClinicStaffList([]);
    };

    return (
        <div className={cx('wrapper')}>
            {successMessage && <SuccessMessage message={successMessage} />}
            <div className={cx('header')}>
                <h1>Phòng Khám & Nhân Viên</h1>
                <div className={cx('search-container')}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm phòng khám..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cx('search-input')}
                    />
                    <button onClick={handleSearch} className={cx('search-button')}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>
                <div className={cx('btn-Submit')}>
                    <button onClick={() => toggleFormVisibility('clinic')} className={cx('add-button')}>
                        Thêm Phòng Khám
                    </button>
                    <button onClick={() => toggleFormVisibility('staff')} className={cx('add-button')}>
                        Thêm Nhân Viên Vào Phòng
                    </button>
                </div>
            </div>
            {isFormVisible && (
                <form className={cx('form-content')} onSubmit={handleSubmit}>
                    <div className={cx('form-header')}>
                        <FontAwesomeIcon
                            icon={faTimes}
                            className={cx('close-icon')}
                            onClick={() => setIsFormVisible(false)}
                        />
                    </div>
                    {formType === 'clinic' ? (
                        <>
                            <div>
                                <label htmlFor="clinicName">Tên phòng khám:</label>
                                <input
                                    type="text"
                                    id="clinicName"
                                    value={clinicName}
                                    onChange={(e) => setClinicName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="productsOfServicesID">ID dịch vụ:</label>
                                <input
                                    type="text"
                                    id="productsOfServicesID"
                                    value={productsOfServicesID}
                                    onChange={(e) => setProductsOfServicesID(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="productsOfServicesName">Tên dịch vụ:</label>
                                <input
                                    type="text"
                                    id="productsOfServicesName"
                                    value={productsOfServicesName}
                                    onChange={(e) => setProductsOfServicesName(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label htmlFor="clinicID">Mã Phòng Khám:</label>
                                <input
                                    type="text"
                                    id="clinicID"
                                    value={clinicID}
                                    onChange={(e) => setClinicID(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="userID">Mã Người Dùng:</label>
                                <input
                                    type="text"
                                    id="userID"
                                    value={userID}
                                    onChange={(e) => setUserID(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}
                    <button className={cx('submit')} type="submit">
                        {editingClinic || editingClinicStaff ? 'Cập nhật' : 'Thêm'}
                    </button>
                </form>
            )}
            {loadingClinics ? (
                <div>Đang tải danh sách...</div>
            ) : errorClinics ? (
                <div>Lỗi: {errorClinics}</div>
            ) : (
                <ItemClinic
                    clinics={clinicsList}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDeleteSuccess={handleDeleteSuccess}
                    onViewStaff={handleViewStaff}
                />
            )}
            {isStaffModalVisible && (
                <div className={cx('staff-modal')}>
                    <div className={cx('staff-modal-content')}>
                        <div className={cx('staff-modal-header')}>
                            <h2>Nhân Viên Phòng Khám</h2>
                            <FontAwesomeIcon icon={faTimes} onClick={closeStaffModal} className={cx('close-icon')} />
                        </div>
                        <div className={cx('staff-modal-body')}>
                            {clinicStaffList.length > 0 ? (
                                <ItemClinicStaff
                                    clinicStaffs={clinicStaffList}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onDeleteSuccess={handleDeleteSuccess}
                                />
                            ) : (
                                <p>Không có nhân viên nào cho phòng khám này.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CombinedClinicPage;
