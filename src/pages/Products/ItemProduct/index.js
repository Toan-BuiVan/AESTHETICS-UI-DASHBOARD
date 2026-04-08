import React from 'react';
import styles from './ItemProduct.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ItemProduct({ services, onEdit, onDelete, onDeleteSuccess }) {
    const handleDelete = async (serviceID) => {
        try {
            // Lấy các giá trị từ localStorage
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

            const response = await fetch('https://buitoandev.somee.com/api/Servicess/Delete_Servicess', {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify({ serviceID }),
            });

            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

            if (!response.ok) {
                throw new Error('Xóa dịch vụ thất bại');
            }

            const data = await response.json();
            if (onDelete) {
                onDelete(serviceID);
            }
            if (onDeleteSuccess) {
                onDeleteSuccess(data.resposeMessage);
            }
        } catch (error) {
            console.error('Lỗi khi xóa dịch vụ:', error.message);
        }
    };

    if (!services || services.length === 0) {
        return <div className={cx('wrapper')}>Dữ liệu trống...</div>;
    }

    return (
        <div className={cx('wrapper')}>
            <table className={cx('service-table')}>
                <thead>
                    <tr>
                        <th>Mã</th>
                        <th>Tên dịch vụ</th>
                        <th>Mô tả</th>
                        <th>Giá</th>
                        <th>Sửa</th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service) => (
                        <tr key={service.serviceID}>
                            <td>{service.serviceID}</td>
                            <td>{service.serviceName}</td>
                            <td>{service.description}</td>
                            <td>
                                {service.priceService.toLocaleString('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                })}
                            </td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faEdit}
                                    className={cx('edit-icon')}
                                    onClick={() => onEdit(service.serviceID)}
                                />
                            </td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className={cx('delete-icon')}
                                    onClick={() => handleDelete(service.serviceID)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ItemProduct;
