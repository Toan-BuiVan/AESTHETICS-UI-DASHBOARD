import React from 'react';
import styles from './ItemUser.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ItemUser({ users, onEdit, onDelete, onDeleteSuccess }) {
    const handleDelete = async (userID) => {
        try {
            const deviceName = localStorage.getItem('deviceName') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';
            const token = localStorage.getItem('token') || '';
            const currentUserID = localStorage.getItem('userID') || '';

            const headers = {
                'Content-Type': 'application/json',
                DeviceName: deviceName,
                RefreshToken: refreshToken,
                Authorization: token ? `Bearer ${token}` : '',
                UserID: currentUserID,
            };

            const response = await fetch('https://buitoandev.somee.com/api/Users/Delete_User', {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify({ userID: userID }),
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
                onDelete(userID);
            }
            if (onDeleteSuccess) {
                onDeleteSuccess(data.resposeMessage);
            }
        } catch (error) {
            console.error('Lỗi khi xóa:', error.message);
        }
    };

    if (!users || users.length === 0) {
        // window.location.reload();
        return <div className={cx('wrapper')}>Đang tải dữ liệu...</div>;
    }

    return (
        <div className={cx('wrapper')}>
            <table className={cx('user-table')}>
                <thead>
                    <tr>
                        <th>Mã</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Ngày Sinh</th>
                        <th>Giới Tính</th>
                        <th>Điện Thoại</th>
                        <th>Địa Chỉ</th>
                        <th>Căn Cước</th>
                        <th>Chức Vụ</th>
                        <th>Mã Giới Thiệu</th>
                        <th>Điểm Tích Lũy</th>
                        <th>Điểm Mua Hàng</th>
                        <th>Điểm Bán Hàng</th>
                        <th>Sửa</th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((item) => (
                        <tr key={item.userID}>
                            <td>{item.userID}</td>
                            <td>{item.userName}</td>
                            <td>{item.email ? item.email : 'N/A'}</td>
                            <td>{item.dateBirth ? item.dateBirth : 'N/A'}</td>
                            <td>{item.sex ? item.sex : 'N/A'}</td>
                            <td>{item.phone ? item.phone : 'N/A'}</td>
                            <td>{item.addres ? item.addres : 'N/A'}</td>
                            <td>{item.idCard ? item.idCard : 'N/A'}</td>
                            <td>{item.typePerson}</td>
                            <td>{item.referralCode}</td>
                            <td>{item.accumulatedPoints}</td>
                            <td>{item.ratingPoints}</td>
                            <td>{item.salesPoints}</td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faEdit}
                                    className={cx('edit-icon')}
                                    onClick={() => onEdit(item.userID)}
                                />
                            </td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className={cx('delete-icon')}
                                    onClick={() => handleDelete(item.userID)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ItemUser;
