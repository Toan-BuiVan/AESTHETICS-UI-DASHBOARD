import React from 'react';
import styles from './ItemClinic.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ItemClinic({ clinics, onEdit, onDelete, onDeleteSuccess, onViewStaff }) {
    const handleDelete = async (clinicID) => {
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

            const response = await fetch('https://buitoandev.somee.com/api/Clinic/Delete_Clinic', {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify({ clinicID: clinicID }),
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
                onDelete(clinicID);
            }
            if (onDeleteSuccess) {
                onDeleteSuccess(data.responseMessage);
            }
        } catch (error) {
            console.error('Lỗi khi xóa:', error.message);
        }
    };

    if (!clinics || clinics.length === 0) {
        return <div className={cx('wrapper')}>Dữ liệu trống...</div>;
    }

    return (
        <div className={cx('wrapper')}>
            <table className={cx('clinic-table')}>
                <thead>
                    <tr>
                        <th>Mã Phòng</th>
                        <th>Tên Phòng</th>
                        <th>Dịch Vụ</th>
                        <th>Trạng Thái</th>
                        <th>Sửa</th>
                        <th>Xóa</th>
                        <th>Nhân Viên</th>
                    </tr>
                </thead>
                <tbody>
                    {clinics.map((item) => (
                        <tr key={item.clinicID}>
                            <td>{item.clinicID}</td>
                            <td>{item.clinicName}</td>
                            <td>{item.productsOfServicesName}</td>
                            <td>{item.clinicStatus}</td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faEdit}
                                    className={cx('edit-icon')}
                                    onClick={() => onEdit(item.clinicID)}
                                />
                            </td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className={cx('delete-icon')}
                                    onClick={() => handleDelete(item.clinicID)}
                                />
                            </td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faInfoCircle}
                                    className={cx('staff-icon')}
                                    onClick={() => onViewStaff(item.clinicID)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ItemClinic;
