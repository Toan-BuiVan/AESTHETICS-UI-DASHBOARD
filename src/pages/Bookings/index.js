import React, { useState, useEffect, useCallback } from 'react';
import styles from './Bookings.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import ItemBooking from './ItemBooking';
import { useDebounce } from '~/hooks/index';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function Bookings() {
    const [serviceName, setServiceName] = useState('');
    const [servicesList, setServicesList] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [userID, setUserID] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [bookingsList, setBookingsList] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [errorBookings, setErrorBookings] = useState(null);
    const navigate = useNavigate(); 

    const debouncedServiceName = useDebounce(serviceName, 500);

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

    const fetchServices = useCallback(async (searchName) => {
        try {
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
                serviceID: null,
                serviceName: null,
                productsOfServicesID: null,
            };

            const defaultResponse = await fetch('https://buitoandev.somee.com/api/Servicess/GetList_SearchServicess', {
                method: 'POST',
                headers,
                body: JSON.stringify(defaultParams),
            });

            if (!defaultResponse.ok) throw new Error('Lỗi khi gọi API với tham số mặc định');

            const defaultData = await defaultResponse.json();
            setServicesList(Array.isArray(defaultData) ? defaultData : []);

            if (searchName) {
                const searchParams = {
                    serviceName: searchName ? searchName : null,
                };
                const response = await fetch('https://buitoandev.somee.com/api/Servicess/GetList_SearchServicess', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(searchParams),
                });

                if (!response.ok) throw new Error('Lỗi khi gọi API với tham số tìm kiếm');

                const data = await response.json();
                setServicesList(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm dịch vụ:', error.message);
            setServicesList([]);
        }
    }, []);

    const fetchBookingsList = useCallback(async (searchParams) => {
        try {
            setLoadingBookings(true);
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
                bookingID: null,
                userID: null,
                startDate: null,
                endDate: null,
            };

            const defaultResponse = await fetch('https://buitoandev.somee.com/api/Bookings/GetList_SearchBooking', {
                method: 'POST',
                headers,
                body: JSON.stringify(defaultParams),
            });

            if (!defaultResponse.ok) throw new Error('Lỗi khi gọi API với tham số mặc định');

            const defaultData = await defaultResponse.json();
            const uniqueBookings = [];
            const seenIds = new Set();
            defaultData.data.forEach((booking) => {
                if (!seenIds.has(booking.bookingID)) {
                    seenIds.add(booking.bookingID);
                    uniqueBookings.push(booking);
                }
            });
            setBookingsList(uniqueBookings);

            if (searchParams && Object.values(searchParams).some((value) => value !== null && value !== 0)) {
                const response = await fetch('https://buitoandev.somee.com/api/Bookings/GetList_SearchBooking', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(searchParams),
                });

                if (!response.ok) throw new Error('Lỗi khi gọi API với tham số tìm kiếm');

                const data = await response.json();
                const uniqueSearchBookings = [];
                const seenSearchIds = new Set();
                data.data.forEach((booking) => {
                    if (!seenSearchIds.has(booking.bookingID)) {
                        seenSearchIds.add(booking.bookingID);
                        uniqueSearchBookings.push(booking);
                    }
                });
                setBookingsList(uniqueSearchBookings);
            }
        } catch (error) {
            setErrorBookings(error.message);
            setBookingsList([]);
        } finally {
            setLoadingBookings(false);
        }
    }, []);

    useEffect(() => {
        const initialize = async () => {
            // await refreshTokenOnLoad();
            fetchBookingsList({
                bookingID: 0,
                userID: 0,
                startDate: null,
                endDate: null,
            });
        };
        initialize();
    }, [fetchBookingsList]);

    useEffect(() => {
        if (debouncedServiceName) {
            fetchServices(debouncedServiceName);
        } else {
            setServicesList([]);
        }
    }, [debouncedServiceName, fetchServices]);

    const handleSearch = () => {
        let searchParams = {
            bookingID: null,
            userID: null,
            startDate: startDate ? new Date(startDate).toISOString() : null,
            endDate: endDate ? new Date(endDate).toISOString() : null,
        };
        if (searchTerm) {
            if (!isNaN(searchTerm)) {
                searchParams.userID = parseInt(searchTerm, 10);
            }
        }
        fetchBookingsList(searchParams);
    };

    const handleServiceSearch = (e) => {
        setServiceName(e.target.value);
    };

    const handleCheckboxChange = (service) => {
        setSelectedServices((prev) => {
            const isSelected = prev.some((s) => s.serviceID === service.serviceID);
            if (isSelected) {
                return prev.filter((s) => s.serviceID !== service.serviceID);
            } else {
                return [...prev, service];
            }
        });
    };

    const handleRemoveService = (serviceID) => {
        setSelectedServices((prev) => prev.filter((s) => s.serviceID !== serviceID));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedServices.length === 0) {
            setSuccessMessage('Vui lòng chọn ít nhất một dịch vụ!');
            return;
        }

        const deviceName = localStorage.getItem('deviceName') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';
        const token = localStorage.getItem('token') || '';

        const headers = {
            'Content-Type': 'application/json',
            DeviceName: deviceName,
            RefreshToken: refreshToken,
            UserID: localStorage.getItem('userID') || '',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const formData = {
            serviceIDs: selectedServices.map((s) => s.serviceID),
            userID: parseInt(userID, 10),
            scheduledDate: scheduledDate,
        };

        try {
            const response = await fetch('https://buitoandev.somee.com/api/Bookings/Insert_Booking', {
                method: 'POST',
                headers,
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                setSuccessMessage(`Thêm booking thất bại: ${errorText}`);
            } else {
                const result = await response.json();
                setSuccessMessage(result.responseMessage || 'Thêm booking thành công!');

                const newAccessToken = response.headers.get('New-AccessToken');
                const newRefreshToken = response.headers.get('New-RefreshToken');
                if (newAccessToken) localStorage.setItem('token', newAccessToken);
                if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

                fetchBookingsList({
                    bookingID: 0,
                    userID: 0,
                    startDate: null,
                    endDate: null,
                });

                setServiceName('');
                setServicesList([]);
                setSelectedServices([]);
                setUserID('');
                setScheduledDate('');

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

    const handleDelete = (bookingID) => {
        setBookingsList(bookingsList.filter((booking) => booking.bookingID !== bookingID));
    };

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
        if (isFormVisible) {
            setServiceName('');
            setServicesList([]);
            setSelectedServices([]);
            setUserID('');
            setScheduledDate('');
        }
    };

    return (
        <div className={cx('wrapper')}>
            {successMessage && <SuccessMessage message={successMessage} />}
            <div className={cx('header')}>
                <h1>Bookings</h1>
                <div className={cx('search-container')}>
                    <input
                        type="text"
                        placeholder="Nhập userID để tìm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cx('search-input')}
                    />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={cx('date-input')}
                        placeholder="Từ ngày"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={cx('date-input')}
                        placeholder="Đến ngày"
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
                        <label htmlFor="serviceName">Tìm kiếm dịch vụ:</label>
                        <input
                            type="text"
                            id="serviceName"
                            value={serviceName}
                            onChange={handleServiceSearch}
                            placeholder="Nhập tên dịch vụ..."
                        />
                    </div>
                    {servicesList.length > 0 && (
                        <div className={cx('services-list')}>
                            {servicesList.map((service) => (
                                <div key={service.serviceID} className={cx('service-item')}>
                                    <input
                                        type="checkbox"
                                        checked={selectedServices.some((s) => s.serviceID === service.serviceID)}
                                        onChange={() => handleCheckboxChange(service)}
                                    />
                                    <span>{service.serviceName}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {selectedServices.length > 0 && (
                        <div className={cx('selected-services')}>
                            <label>Dịch vụ đã chọn:</label>
                            <div className={cx('selected-services-list')}>
                                {selectedServices.map((service) => (
                                    <div key={service.serviceID} className={cx('selected-service-item')}>
                                        <span>{service.serviceName}</span>
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            className={cx('remove-icon')}
                                            onClick={() => handleRemoveService(service.serviceID)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                    <div>
                        <label htmlFor="scheduledDate">Ngày Hẹn:</label>
                        <input
                            type="date"
                            id="scheduledDate"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            required
                        />
                    </div>
                    <button className={cx('submit')} type="submit">
                        Thêm
                    </button>
                </form>
            )}
            {loadingBookings ? (
                <div>Đang tải danh sách...</div>
            ) : errorBookings ? (
                <div>Lỗi: {errorBookings}</div>
            ) : (
                <ItemBooking bookings={bookingsList} onDelete={handleDelete} onDeleteSuccess={handleDeleteSuccess} />
            )}
        </div>
    );
}

export default Bookings;
