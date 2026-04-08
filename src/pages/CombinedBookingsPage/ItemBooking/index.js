import React from 'react';
import styles from './ItemBooking.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ItemBooking({ bookings, onEdit, onDelete, onDeleteSuccess, onViewDetails }) {
    const handleDelete = async (bookingID) => {
        try {
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

            const response = await fetch('https://buitoandev.somee.com/api/Bookings/Delete_Booking', {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify({ bookingID: bookingID }),
            });

            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

            if (!response.ok) {
                throw new Error('Xóa booking thất bại');
            }

            const data = await response.json();
            if (onDelete) {
                onDelete(bookingID);
            }
            if (onDeleteSuccess) {
                onDeleteSuccess(data.resposeMessage);
            }
        } catch (error) {
            console.error('Lỗi khi xóa booking:', error.message);
        }
    };

    if (!bookings || bookings.length === 0) {
        window.location.reload();
        return <div className={cx('wrapper')}>Đang tải dữ liệu...</div>;
    }

    return (
        <div className={cx('wrapper')}>
            <table className={cx('booking-table')}>
                <thead>
                    <tr>
                        <th>Mã Booking</th>
                        <th>Tên Người Dùng</th>
                        <th>Email</th>
                        <th>Số Điện Thoại</th>
                        <th>Ngày Hẹn</th>
                        <th>Xóa</th>
                        <th>Chi Tiết</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((booking) => (
                        <tr key={`${booking.bookingID}-${booking.bookingCreation}`}>
                            <td>{booking.bookingID}</td>
                            <td>{booking.userName}</td>
                            <td>{booking.email ? booking.email : 'N/A'}</td>
                            <td>{booking.phone}</td>
                            <td>{new Date(booking.assignedDate).toLocaleString()}</td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className={cx('delete-icon')}
                                    onClick={() => handleDelete(booking.bookingID)}
                                />
                            </td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faInfoCircle}
                                    className={cx('detail-icon')}
                                    onClick={() => onViewDetails(booking.bookingID)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ItemBooking;
