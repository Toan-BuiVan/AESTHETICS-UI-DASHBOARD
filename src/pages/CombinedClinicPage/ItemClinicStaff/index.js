import React from 'react';
import styles from './ItemClinicStaff.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ItemClinicStaff({ clinicStaffs, onEdit, onDelete, onDeleteSuccess }) {
    const handleDelete = async (clinicStaffID) => {
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

            const response = await fetch('https://buitoandev.somee.com/api/Clinic_Staff/Delete_ClinicStaff', {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify({ clinicStaffID: clinicStaffID }),
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
                onDelete(clinicStaffID);
            }
            if (onDeleteSuccess) {
                onDeleteSuccess(data.responseMessage);
            }
        } catch (error) {
            console.error('Lỗi khi xóa:', error.message);
        }
    };

    if (!clinicStaffs || clinicStaffs.length === 0) {
        // window.location.reload();
        return <div className={cx('wrapper')}>Đang tải dữ liệu...</div>;
    }

    return (
        <div className={cx('wrapper')}>
            <table className={cx('clinic-staff-table')}>
                <thead>
                    <tr>
                        <th>Mã phòng khám</th>
                        <th>Tên phòng khám</th>
                        <th>Bác sĩ || Y tá</th>
                        <th>Phone</th>
                        <th>TypePerson</th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {clinicStaffs.map((item) => (
                        <tr key={item.clinicStaffID}>
                            <td>{item.clinicID}</td>
                            <td>{item.clinicName}</td>
                            <td>{item.userName}</td>
                            <td>{item.phone || 'N/A'}</td>
                            <td>{item.typePerson}</td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className={cx('delete-icon')}
                                    onClick={() => handleDelete(item.clinicStaffID)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ItemClinicStaff;
