import React, { useState, useEffect, useCallback } from 'react';
import styles from './BookingAssignment.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import ItemBookingAssignment from './ItemBookingAssignment';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function BookingAssignment() {
    const [bookingID, setBookingID] = useState('');
    const [serviceID, setServiceID] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [bookingAssignmentsList, setBookingAssignmentsList] = useState([]);
    const [loadingBookingAssignments, setLoadingBookingAssignments] = useState(true);
    const [errorBookingAssignments, setErrorBookingAssignments] = useState(null);
    const [assignedDate, setAssignedDate] = useState('');
    const navigate = useNavigate();

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
                setSuccessMessage('Mã hóa của bạn hết hạn. Vui lòng đăng nhập lại!');
                navigate('/');
            }
        } catch (error) {
            console.error('Lỗi khi làm mới token:', error);
        }
    };

    const fetchBookingAssignmentsList = useCallback(async (searchParams) => {
        try {
            setLoadingBookingAssignments(true);
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

            // Tham số mặc định với tất cả là null
            const defaultParams = {
                assignmentID: null,
                bookingID: null,
                clinicID: null,
                serviceName: null,
                assignedDate: null,
            };

            // Gọi API lần đầu với tham số mặc định
            const defaultResponse = await fetch(
                'https://buitoandev.somee.com/api/Bookings/GetList_SearchBooking_Assignment',
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(defaultParams),
                },
            );

            if (!defaultResponse.ok) throw new Error('Lỗi khi gọi API với tham số mặc định');

            const data = await defaultResponse.json();
            let proOf = [];
            if (Array.isArray(data)) {
                proOf = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                proOf = data.data;
            }
            setBookingAssignmentsList(proOf);

            if (searchParams && Object.values(searchParams).some((value) => value !== null && value !== 0)) {
                const response = await fetch(
                    'https://buitoandev.somee.com/api/Bookings/GetList_SearchBooking_Assignment',
                    {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(searchParams),
                    },
                );
                console.log(searchParams);

                if (!response.ok) throw new Error('Lỗi khi gọi API với tham số tìm kiếm');

                const data = await response.json();
                let proOf = [];
                if (Array.isArray(data)) {
                    proOf = data;
                } else if (data && data.data && Array.isArray(data.data)) {
                    proOf = data.data;
                }
                setBookingAssignmentsList(proOf);
            }
        } catch (error) {
            setErrorBookingAssignments(error.message);
            setBookingAssignmentsList([]);
        } finally {
            setLoadingBookingAssignments(false);
        }
    }, []);

    useEffect(() => {
        const initialize = async () => {
            // await refreshTokenOnLoad();
            fetchBookingAssignmentsList({
                assignmentID: 0,
                bookingID: 0,
                clinicID: 0,
                serviceName: null,
                assignedDate: null,
            });
        };
        initialize();
    }, [fetchBookingAssignmentsList]);

    const handleSearch = () => {
        let searchParams = {
            assignmentID: null,
            bookingID: null,
            clinicID: null,
            serviceName: null,
            assignedDate: null,
        };
        if (searchTerm) {
            if (!isNaN(searchTerm)) {
                searchParams.clinicID = parseInt(searchTerm, 10);
            } else {
                searchParams.serviceName = searchTerm;
            }
        }
        if (assignedDate) {
            searchParams.assignedDate = new Date(assignedDate).toISOString();
        }
        fetchBookingAssignmentsList(searchParams);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bookingID || !serviceID) {
            setSuccessMessage('Vui lòng nhập đầy đủ Booking ID và Service ID!');
            return;
        }

        const deviceName = localStorage.getItem('deviceName') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';
        const token = localStorage.getItem('token') || '';
        const userID = localStorage.getItem('userID') || '';

        const headers = {
            'Content-Type': 'application/json',
            DeviceName: deviceName,
            RefreshToken: refreshToken,
            Authorization: token ? `Bearer ${token}` : '',
            UserID: userID,
        };

        const insertData = {
            bookingID: parseInt(bookingID, 10),
            serviceID: parseInt(serviceID, 10),
        };

        try {
            const response = await fetch('https://buitoandev.somee.com/api/Bookings/Insert_BookingSer_Assi', {
                method: 'POST',
                headers,
                body: JSON.stringify(insertData),
            });

            const result = await response.json();
            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
            if (!response.ok) {
                setSuccessMessage(result.responseMessage || 'Thao tác thất bại!');
            } else {
                setSuccessMessage(result.responseMessage || 'Thao tác thành công!');

                fetchBookingAssignmentsList({
                    assignmentID: 0,
                    bookingID: 0,
                    clinicID: 0,
                    serviceName: null,
                    assignedDate: null,
                });

                setBookingID('');
                setServiceID('');

                setTimeout(() => {
                    setIsFormVisible(false);
                    setSuccessMessage('');
                }, 3500);
            }
        } catch (error) {
            setSuccessMessage('Có lỗi xảy ra: ' + error.message);
        }
    };

    const handleDeleteSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleDelete = (assignmentID) => {
        setBookingAssignmentsList(
            bookingAssignmentsList.filter((assignment) => assignment.assignmentID !== assignmentID),
        );
    };

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
        if (isFormVisible) {
            setBookingID('');
            setServiceID('');
        }
    };

    return (
        <div className={cx('wrapper')}>
            {successMessage && <SuccessMessage message={successMessage} />}
            <div className={cx('header')}>
                <h1>Booking Assignments</h1>
                <div className={cx('search-container')}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm assignment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cx('search-input')}
                    />
                    <input
                        type="date"
                        value={assignedDate}
                        onChange={(e) => setAssignedDate(e.target.value)}
                        className={cx('date-input')}
                        placeholder="Ngày hẹn"
                    />
                    <button onClick={handleSearch} className={cx('search-button')}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>
                {!isFormVisible && (
                    <div className={cx('open-form-icon')} onClick={toggleFormVisibility}>
                        <FontAwesomeIcon icon={faPlus} />
                    </div>
                )}
            </div>
            {isFormVisible && (
                <form className={cx('form-content')} onSubmit={handleSubmit}>
                    <div className={cx('form-header')}>
                        <FontAwesomeIcon icon={faTimes} className={cx('close-icon')} onClick={toggleFormVisibility} />
                    </div>
                    <div>
                        <label htmlFor="bookingID">Booking ID:</label>
                        <input
                            type="text"
                            id="bookingID"
                            value={bookingID}
                            onChange={(e) => setBookingID(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="serviceID">Service ID:</label>
                        <input
                            type="text"
                            id="serviceID"
                            value={serviceID}
                            onChange={(e) => setServiceID(e.target.value)}
                            required
                        />
                    </div>
                    <button className={cx('submit')} type="submit">
                        Thêm
                    </button>
                </form>
            )}

            {loadingBookingAssignments ? (
                <div>Đang tải danh sách...</div>
            ) : errorBookingAssignments ? (
                <div>Lỗi: {errorBookingAssignments}</div>
            ) : (
                <ItemBookingAssignment
                    bookingAssignments={bookingAssignmentsList}
                    onDelete={handleDelete}
                    onDeleteSuccess={handleDeleteSuccess}
                />
            )}
        </div>
    );
}

export default BookingAssignment;
