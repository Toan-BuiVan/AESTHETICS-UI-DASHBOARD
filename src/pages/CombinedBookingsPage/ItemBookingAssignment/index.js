import React from 'react';
import styles from './ItemBookingAssignment.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ItemBookingAssignment({ bookingAssignments, onDelete, onDeleteSuccess }) {
    const handleDelete = async (assignmentID) => {
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

            const response = await fetch('https://buitoandev.somee.com/api/Bookings/Delete_BookingSer_Assi', {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify({ bookingServiceID: assignmentID }),
            });

            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

            if (!response.ok) {
                throw new Error('Xóa thất bại');
            }

            const data = await response.json();
            if (onDelete) {
                onDelete(assignmentID);
            }
            if (onDeleteSuccess) {
                onDeleteSuccess(data.resposeMessage);
            }
        } catch (error) {
            console.error('Lỗi khi xóa:', error.message);
        }
    };

    const handleUpdate = async (assignmentID) => {
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

            const updateData = {
                assignmentID: assignmentID,
            };

            const response = await fetch('https://buitoandev.somee.com/api/Bookings/UpdateBooking_Assignment', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(updateData),
            });

            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

            if (!response.ok) {
                throw new Error('Cập nhật thất bại');
            }

            const data = await response.json();
            onDeleteSuccess(data.resposeMessage);
            console.log('Cập nhật thành công:', data);
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error.message);
        }
    };

    if (!bookingAssignments || bookingAssignments.length === 0) {
        // window.location.reload();
        return <div className={cx('wrapper')}>Đang tải dữ liệu...</div>;
    }

    return (
        <div className={cx('wrapper')}>
            <table className={cx('booking-assignment-table')}>
                <thead>
                    <tr>
                        <th>Mã Booking</th>
                        <th>Tên Người Dùng</th>
                        <th>Tên Phòng Khám</th>
                        <th>Tên Sản Phẩm Dịch Vụ</th>
                        <th>Tên Dịch Vụ</th>
                        <th>Số Thứ Tự</th>
                        <th>Ngày Hẹn</th>
                        <th>Trạng Thái</th>
                        <th>Hoàn Thành</th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {bookingAssignments.map((item) => (
                        <tr key={item.assignmentID}>
                            <td>{item.bookingID}</td>
                            <td>{item.userName}</td>
                            <td>{item.clinicName}</td>
                            <td>{item.productsOfServicesName}</td>
                            <td>{item.serviceName}</td>
                            <td>{item.numberOrder}</td>
                            <td>{new Date(item.assignedDate).toLocaleString()}</td>
                            <td>{item.status}</td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faCheck}
                                    className={cx('check-icon')}
                                    onClick={() => handleUpdate(item.assignmentID)}
                                />
                            </td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className={cx('delete-icon')}
                                    onClick={() => handleDelete(item.assignmentID)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ItemBookingAssignment;
